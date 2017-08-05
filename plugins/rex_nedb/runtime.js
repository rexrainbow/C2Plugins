// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_nedb = function(runtime)
{
	this.runtime = runtime;
};
cr.plugins_.Rex_nedb.databases = {};  // {db: database, ownerUID: uid }

(function ()
{
	var pluginProto = cr.plugins_.Rex_nedb.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};
	
	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
      
	instanceProto.onCreate = function()
	{
	    this.fileName = this.properties[0];
        this.storageType = (this.fileName === "")? 0: this.properties[1];
        var isInstDB;
	    if (this.fileName === "")    // private in-memory database
	    {
	        this.db = new window["Nedb"]();
            isInstDB = true;
	    }
	    else                   // persistence database
	    {
	        isInstDB = createGlobalDatabase(this.uid, this.fileName, this.storageType);	            
	        this.db = getGlobalDatabaseReference(this.fileName).db;
	    }
               
	    if (!this.recycled)
        {
            this.uniqueIndexKeys = [];
            this.indexKeys = [];
        }
        else
        {
            this.uniqueIndexKeys.length = 0;
            this.indexKeys.length = 0;
        }
        
	    this.SetIndexKeys(this.properties[2], true);  // this.uniqueIndexKeys
        this.SetIndexKeys(this.properties[3], false); // this.indexKeys

        // save
        this.rowID = "";        
        this.preparedItem = {};             
        this.preparedQueue = [];   
	    
        if (!this.recycled)
            this.preprocessCmd = {};

        this.preprocessCmd["$inc"] = {};
        this.preprocessCmd["$max"] = {};        
        this.preprocessCmd["$min"] = {}; 
        
        // query        
        this.filters = {};
        this.orders = {};
        this.queriedRows = [];
        // retrieve
        this.exp_LastError = null;        
        this.exp_CurRowIndex = -1;
        this.exp_CurRow = null;
        this.exp_LastSavedRowID = "";        
        

        // csv
        this.keyType = {};  // 0=string, 1=number, 2=eval   
        
	    //if (this.storageType === 1)	    
        //    this.db["persistence"]["compactDatafile"]();
    
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];     
        /**END-PREVIEWONLY**/         
	};
    
	var createGlobalDatabase = function (ownerUID, filename, storageType)
	{
	    if (cr.plugins_.Rex_nedb.databases.hasOwnProperty(filename))
	        return false;

        var opt;
        if (storageType === 1)
        {
            opt = {
                "filename": filename,
                "autoload": true,
            };
        }
 
	    var db_ref = {db:(new window["Nedb"](opt)), 
	                  ownerID:ownerUID};	            
	    cr.plugins_.Rex_nedb.databases[filename] = db_ref;
        return true;
	};
	
	var getGlobalDatabaseReference = function (filename)
	{
	    return cr.plugins_.Rex_nedb.databases[filename];
	};    
    
	instanceProto.onDestroy = function ()
    {
        this.preprocessCmd["$inc"] = {};
        this.preprocessCmd["$max"] = {};        
        this.preprocessCmd["$min"] = {};          
        cleanTable(this.preparedItem);
        this.preparedQueue.length = 0;          
        cleanTable(this.filters);       
        cleanTable(this.orders);         
        this.queriedRows.length = 0;

        if (this.fileName === "")
        {
            this.db["remove"]({}, {"multi": true});      
            this.RemoveCurrentIndexKeys(this.uniqueIndexKeys);
            this.RemoveCurrentIndexKeys(this.indexKeys);            
        }
        else
        {
            var database_ref = getGlobalDatabaseReference(this.fileName);
            if (database_ref.ownerUID === this.uid)
                database_ref.ownerUID = null;
        }
        
        this.uniqueIndexKeys.length = 0;      
        this.indexKeys.length = 0;          
	};  
    
	instanceProto.RemoveCurrentIndexKeys = function (indexKeys)
	{
        var i,cnt=indexKeys.length;
        for(i=0; i<cnt; i++)
        {
            this.db["removeIndex"](indexKeys[i]);
        }        
    };
    
	instanceProto.SetIndexKeys = function (params_, isUnique)
	{
        var indexKeys = (isUnique)? this.uniqueIndexKeys:this.indexKeys;        
        this.RemoveCurrentIndexKeys(indexKeys)
        
        // add new index keys
        var keys = (typeof(params_) === "string")? params_.split(",") : params_;        
        var i, cnt=keys.length;               
        for(i=0; i<cnt;i++)
        {
            this.db["ensureIndex"]({ "fieldName": keys[i], "unique": isUnique});
        }
        
        cr.shallowAssignArray(indexKeys, keys);        
	};    
    
	instanceProto.SaveRow = function (row, uniqueIndexKeys, rowID, preprocessCmd)
	{   
        var self = this;   
        var handler = function(error, docs)
        {           
            self.exp_LastError = error || null;  
            if (error)
            {
                self.exp_LastSavedRowID = "";
                self.runtime.trigger(cnds.OnUpdateError, self); 
            }                

            else
            {              
                self.exp_LastSavedRowID = docs["_id"];   
                self.runtime.trigger(cnds.OnUpdateComplete, self); 
            }
        }   
        
	    var invalid_rowID = (rowID == null) || (rowID === "");
	    
	    // valid row ID
	    if (!invalid_rowID)
	    {            
	        this.db["update"](
                { "_id": rowID},                                                  // query
                this.buildUpdateItem(row, preprocessCmd),           // update
                { "upsert": true },                                              // options
                handler                                                              // callback
                );                                                            
	    }
	    
	    // insert a row
	    else if ((uniqueIndexKeys == null) || (uniqueIndexKeys.length === 0))	    
        {
            this.db["insert"](row, handler);
        }
        
        // has index keys definition
        else
        {
            var uniqueIndexKeys = {}, key_name; 
            var i, cnt=this.uniqueIndexKeys.length;
            var hasIndexKeys = false;
            for (i=0; i<cnt; i++)
            {
                key_name = this.uniqueIndexKeys[i];
                if (row.hasOwnProperty(key_name))
                {                  
                    uniqueIndexKeys[key_name] = row[key_name];
                    hasIndexKeys = true;
                    delete row[key_name];
                }
            }
            
            
            if (hasIndexKeys)
            {
                this.db["update"](
                    uniqueIndexKeys,                                             // query
                    this.buildUpdateItem(row, preprocessCmd),        // update
                    { "upsert": true },                                           // options
                    handler                                                           // callback
                    );
            }
            
            // no index keys setting
            else
            {
                this.db["insert"](row, handler);
            }
        }
	};   
    
	instanceProto.buildUpdateItem = function (row, preprocessCmd)
    {
        var update = { "$set": row };
        if (preprocessCmd != null)
        {
            for (var c in preprocessCmd )
            {
                if (!isEmpty(preprocessCmd[c]))
                {
                    update[c] = preprocessCmd[c];
                    preprocessCmd[c] = {};
                }   
            }   
        }
        return update;
	};      

	instanceProto.Index2QueriedRowID = function (index_, default_value)
	{    
	    var row = this.queriedRows[index_];
	    return getItemValue(row, "_id", default_value);        
	};    
    
	var getEvalValue = function(v, prefix)
	{
	    if (v == null)
	        v = 0;
        else
        {
            try
            {
	            v = eval("("+v+")");
            }
            catch (e)
            {
                if (prefix == null)
                    prefix = "";
                console.error("NeDB: Eval " + prefix + " : " + v + " failed");
                v = 0;
            }
        }
        return v;
	};	
    
    var cleanTable = function (o)
	{
        for (var k in o)        
            delete o[k];        
	};
    
    var isEmpty = function (o)
    {
        for (var k in o)        
            return false;

        return true;        
    };
	
	var getValue = function(keys, root)
	{           
        if ((keys == null) || (keys === "") || (keys.length === 0))
        {
            return root;
        }
        else
        {
            if (typeof (keys) === "string")
                keys = keys.split(".");
            
            var i,  cnt=keys.length, key;
            var entry = root;
            for (i=0; i< cnt; i++)
            {
                key = keys[i];                
                if (entry.hasOwnProperty(key))
                    entry = entry[ key ];
                else
                    return;              
            }
            return entry;                    
        }
	};     
    
 	var getItemValue = function (item, k, default_value)
	{
		return din(getValue(k, item), default_value);
	};	    
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };	
        
        
    
	instanceProto.saveToJSON = function ()
	{
		return { 
                 "st": this.storageType,
                 "name": this.fileName,
                 "uIdxKeys": this.uniqueIndexKeys,
                 "idxKeys": this.indexKeys,
                 "preCmd": this.preprocessCmd,
                 "prepItm": this.preparedItem,     
                 "prepQue": this.preparedQueue,
                 "rID": this.rowID,
                 "filt": this.filters,
                 "ord": this.orders,
                 "qrows": this.queriedRows,
                 "err": this.exp_LastError,
                 "srid": this.exp_LastSavedRowID,
                 "kt": this.keyType,
		       };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.storageType = o["st"];
	    this.fileName = o["name"];
        this.uniqueIndexKeys = o["uIdxKeys"];
        this.indexKeys = o["idxKeys"];
        
        this.preprocessCmd = o["preCmd"];
        this.preparedItem = o["prepItm"];
        this.preparedQueue = o["prepQue"];
        this.rowID = o["rID"];
        
        this.filters = o["filt"];
        this.orders = o["ord"];
        this.queriedRows = o["qrows"];
        this.exp_LastError = o["err"];
        this.exp_LastSavedRowID = o["srid"];
        this.keyType = o["kt"];        
	};  
	
	instanceProto.afterLoad = function ()
	{
        var isInstDB;
	    if (this.fileName === "")    // private in-memory database
	    {
	        //this.db = new window["Nedb"]();
            isInstDB = true;
	    }
	    else                   // persistence database
	    {
	        isInstDB = createGlobalDatabase(this.uid, this.fileName, this.storageType);	            
	        this.db = getGlobalDatabaseReference(this.fileName).db;
	    }

	    this.SetIndexKeys(this.uniqueIndexKeys.join(","), true);  // this.uniqueIndexKeys
        this.SetIndexKeys(this.indexKeys.join(","), false); // this.indexKeys
	};	    
    
    
	/**BEGIN-PREVIEWONLY**/
    // slightly modified neet simple function from Pumbaa80
    // http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript#answer-7220510
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // basic html escaping
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'red';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'blue';
                    } else {
                        cls = 'green';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'Sienna';
                } else if (/null/.test(match)) {
                    cls = 'gray';
                }
                return '<span style="color:' + cls + ';">' + match + '</span>';
            })
            .replace(/\t/g,"&nbsp;&nbsp;") // to keep indentation in html
            .replace(/\n/g,"<br/>");       // to keep line break in html
    };
    var colorJSON = function (o)
    {
        var val = syntaxHighlight(JSON.stringify(o));
        return "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+val+"</style>";
    };

	instanceProto.getDebuggerValues = function (propsections)
	{
        var self = this;  
        var handler = function(error, docs)
        {    
            if (error)
                return;
            
            self.propsections.length = 0;  
            var i,cnt=docs.length;
            for (i=0; i<cnt; i++)
            {
                self.propsections.push({"name": i, 
                                        "value": colorJSON(docs[i]),
                                        "html": true,
                                        "readonly":true});                
            }
        };
        this.db["find"]({}, handler);
        
		propsections.push({
			"title": this.type.name,
			"properties": this.propsections
		});	
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/	 
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnUpdateComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnUpdateError = function ()
	{
	    return true;
	};
    
	Cnds.prototype.OnReceivedComplete = function ()
	{
	    return true;
	}; 	
	Cnds.prototype.OnReceivedError = function ()
	{
	    return true;
	};   

	Cnds.prototype.ForEachRow = function ()
	{
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        
        var i,cnt=this.queriedRows.length;
        for(i=0; i<cnt; i++)
		{
            if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);
            
            this.exp_CurRowIndex = i;
            this.exp_CurRow = this.queriedRows[i];            
            current_event.retrigger();
            
            if (solModifierAfterCnds)
                this.runtime.popSol(current_event.solModifiers);        
        }
        
        this.exp_CurRowIndex = -1;
        this.exp_CurRow = null;        
		return false;
	};     
    
	Cnds.prototype.OnRemoveRowsComplete = function ()
	{
	    return true;
	}; 
	Cnds.prototype.OnRemoveRowsError = function ()
	{
	    return true;
	};		
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
	Acts.prototype.InsertCSV = function (csv_string, is_eval, delimiter)
	{         
        is_eval = (is_eval === 1);
        var csv_data = CSVToArray(csv_string, delimiter);
        var col_keys = csv_data.shift(), col_key;
        var csv_row, cell_value;
        var r, row_cnt=csv_data.length;
        var c, col_cnt=col_keys.length;
        var rowData, saveData=[];
        var prefix;   // for debug
        for (r=0; r<row_cnt; r++)
        {
            csv_row = csv_data[r];
            rowData = {};
            for (c=0; c<col_cnt; c++)
            {
                col_key = col_keys[c];
                cell_value = csv_row[c]; // string
                prefix = " (" + r + "," + c + ") ";
                if (is_eval)
                    rowData[col_key] = getEvalValue(cell_value, prefix);
                else
                {
                    if (this.keyType.hasOwnProperty(col_key))
                    {
                        var type = this.keyType[col_key];
                        switch (type)  
                        {
                        // case 0: // string
                        case 1:   // number
                            cell_value = parseFloat(cell_value); 
                            break;
                        case 2:   // eval
                            cell_value = getEvalValue(cell_value, prefix);
                            break;
                        }
                    }                  
                    
                    rowData[col_key] = cell_value;
                }
            }
            saveData.push(rowData);
        }
        
        cleanTable(this.keyType);
        
        var self = this;   
        var handler = function(error, docs)
        {           
            self.exp_LastError = error || null;      
            self.exp_LastSavedRowID = "";         
            var trig = (error)? cnds.OnUpdateError:cnds.OnUpdateComplete;
            self.runtime.trigger(trig, self); 
        }        
        this.db["insert"](saveData, handler);        
	};
    
	Acts.prototype.InsertJSON = function (json_string)
	{
	    var rows;
        try
        {
            rows = JSON.parse(json_string);
        }
        catch(err) { return; }     

        var self = this;  
        var handler = function(error, docs)
        {
            self.exp_LastError = error || null;        
            self.exp_LastSavedRowID = ""; 
            var trig = (error)? cnds.OnUpdateError:cnds.OnUpdateComplete;
            self.runtime.trigger(trig, self); 
        }            
        this.db["insert"](rows, handler);
	};	 
    
	Acts.prototype.RemoveAll = function ()
	{
        var self = this;  
        var handler = function(error, numRemoved)
        {
            self.exp_LastError = error || null;            
            var trig = (error)? cnds.OnRemoveRowsError:cnds.OnRemoveRowsComplete;
            self.runtime.trigger(trig, self); 
        };
        this.db["remove"]({}, {"multi": true}, handler);
	};        

	Acts.prototype.SetIndexKeys = function (params_, isUnique)
	{
	    this.SetIndexKeys(params_, (isUnique === 1));     
	};

	Acts.prototype.RemoveByRowID = function (rowID)
	{
        var self = this;  
        var handler = function(error, numRemoved)
        {
            self.exp_LastError = error || null;            
            var trig = (error)? cnds.OnRemoveRowsError:cnds.OnRemoveRowsComplete;
            self.runtime.trigger(trig, self); 
        };
        this.db["remove"]({ "_id": rowID}, {}, handler);
	};	    
    
	Acts.prototype.RemoveByRowIndex = function (index_)
	{
        var rowID = this.Index2QueriedRowID(index_, null);
        if (rowID === null)
            return;
            
        Acts.prototype.RemoveByRowID.call(this, rowID);
	};        
    
    Acts.prototype.SetValue = function (key_, value_, cond)
	{
        if (cond === 0)
            this.preparedItem[key_] = value_;
        else if (cond === 1)
            this.preprocessCmd["$max"][key_] = value_;
        else if (cond === 2)
            this.preprocessCmd["$min"][key_] = value_;
            
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{ 
        this.preparedItem[key_] = (is_true === 1);
	};
    
	Acts.prototype.Save = function ()
	{
        this.SaveRow(this.preparedItem, this.uniqueIndexKeys, this.rowID, this.preprocessCmd);         
	    this.preparedItem = {};   
	};	
    
	Acts.prototype.Update = function ()
	{
        var self = this;  
        var handler = function(error, numRemoved)
        {
            self.exp_LastError = error || null;            
            var trig = (error)? cnds.OnRemoveRowsError:cnds.OnRemoveRowsComplete;
            self.runtime.trigger(trig, self); 
        };        
        var item = this.buildUpdateItem(this.preparedItem, this.preprocessCmd)
        this.db["update"](this.filters, item, { "multi": true, "upsert": true }, handler);
	    this.preparedItem = {};   
    };	

    Acts.prototype.SetJSON = function (key_, value_)
	{ 
        this.preparedItem[key_] = JSON.parse(value_);
	};    
            
    Acts.prototype.AddToSaveAllQueue = function ()
	{
        this.preparedQueue.push(this.preparedItem);
	    this.preparedItem = {}; 
	};	     
    
    Acts.prototype.SaveAll = function ()
	{
        var self = this;  
        var handler = function(error, docs)
        {
            self.exp_LastError = error || null;       
            var trig = (error)? cnds.OnUpdateError:cnds.OnUpdateComplete;
            self.runtime.trigger(trig, self); 
        };
        this.db["insert"](this.preparedQueue, handler);
	    this.preparedQueue = [];         
    };        
    
    Acts.prototype.SetRowID = function (rowID)
	{    
        this.rowID = rowID;
	};	
	    
    Acts.prototype.SetRowIndex = function (index_)
	{
	    this.rowID = this.Index2QueriedRowID(index_, null);
	};
    
    Acts.prototype.IncValue = function (key_, value_)
	{
        this.preprocessCmd["$inc"][key_] = value_;
	};
	
    
    Acts.prototype.NewFilters = function ()
	{    
        this.filters = {};
        this.orders = {};
	};	

    var CMPMAP = ["$ne", "$gt", "$lt", "$gte", "$lte"];
    Acts.prototype.AddValueComparsion = function (k, cmp, v)
	{
        if (cmp === 0)  // equal to
        {
            this.filters[k] = v
        }
        else
        {
            if (!this.filters.hasOwnProperty(k) || (typeof(this.filters[k]) !== "object"))
                this.filters[k] = {};
	        
            if (typeof (cmp) === "number")
                cmp = CMPMAP[cmp-1];
            
            this.filters[k][cmp] = v;
        }
	};

    Acts.prototype.AddBooleanValueComparsion = function (k, v)
	{
        Acts.prototype.AddValueComparsion.call(this, k, 0, (v===1));
	};	
	
    Acts.prototype.AddValueInclude = function (k, v)
	{
        if (!this.filters.hasOwnProperty(k) || (typeof(this.filters[k]) !== "object"))
            this.filters[k] = {};
        if (!this.filters[k].hasOwnProperty("$in"))
            this.filters[k]["$in"] = [];
            
        this.filters[k]["$in"].push(v);
	};
	
    Acts.prototype.AddOrder = function (k, order_)
	{
        this.orders[k] = (order_===1)? 1:-1;
	}; 	    
    
    Acts.prototype.LoadQueriedRows = function ()
	{
        var self = this;  
        var handler = function(error, docs)
        {    
            self.exp_LastError = error || null;  
            if (error)
            {
                self.queriedRows = [];
                self.runtime.trigger(cnds.OnReceivedError, self);                 
            }
            else
            {
                self.queriedRows = docs;
                self.runtime.trigger(cnds.OnReceivedComplete, self); 
            }
        };
        this.db["find"](this.filters)["sort"](this.orders)["exec"](handler);
	}; 
    
    Acts.prototype.RemoveQueriedRows = function ()
	{
        var self = this;  
        var handler = function(error, numRemoved)
        {
            self.exp_LastError = error || null;            
            var trig = (error)? cnds.OnRemoveRowsError:cnds.OnRemoveRowsComplete;
            self.runtime.trigger(trig, self); 
        };
        this.db["remove"](this.filters, {"multi": true}, handler);
	}; 
    
    Acts.prototype.InsertCSV_DefineType = function (key_, type_)
	{
        this.keyType[key_] = type_;
	}; 		     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
 	Exps.prototype.LastErrorMessage = function (ret)
	{
        var msg = (this.exp_LastError)? this.exp_LastError["message"]:"";
		ret.set_string( msg );
	};    
 	Exps.prototype.KeyRowID = function (ret)
	{
		ret.set_string( "_id" );
	};	
 	Exps.prototype.LastSavedRowID = function (ret)
	{
		ret.set_string( this.exp_LastSavedRowID );
	};
    
 	Exps.prototype.QueriedRowsAsJSON = function (ret)
	{
		ret.set_string( JSON.stringify(this.queriedRows) );
	};
    
 	Exps.prototype.CurRowContent = function (ret, k, default_value)
	{
		ret.set_any( getItemValue(this.exp_CurRow, k, default_value) );
	};
    
 	Exps.prototype.CurRowIndex = function (ret)
	{
		ret.set_int( this.exp_CurRowIndex );
	};
    
 	Exps.prototype.CurRowID = function (ret)
	{
        var id;
        if (this.exp_CurRow)
            id = this.exp_CurRow["_id"];
		ret.set_string( id || "" );
	};    
    
 	Exps.prototype.QueriedRowsCount = function (ret)
	{
	    var val;
        if (this.queriedRows)
            val = this.queriedRows.length;
        else
            val = 0;
		ret.set_int( val );
	};  

 	Exps.prototype.Index2QueriedRowContent = function (ret, i, k, default_value)
	{
	    var row = this.queriedRows[i];
	    ret.set_any( getItemValue(row, k, default_value) );
	};	
 	Exps.prototype.Index2QueriedRowID = function (ret, index_)
	{
        var row = this.queriedRows[i];
		ret.set_string( this.Index2QueriedRowID(index_, "") );
	}; 
    
      
    var cnds = cr.plugins_.Rex_nedb.prototype.cnds;  
    
    
    // copy from    
    // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    var CSVToArray = function ( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
                (
                        // Delimiters.
                        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                        "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                        strMatchedDelimiter.length &&
                        (strMatchedDelimiter != strDelimiter)
                        ){

                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );

                }


                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){

                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                                new RegExp( "\"\"", "g" ),
                                "\""
                                );

                } else {

                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    };    
}());