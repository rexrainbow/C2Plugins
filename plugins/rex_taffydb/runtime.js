// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_taffydb = function(runtime)
{
	this.runtime = runtime;
};
cr.plugins_.Rex_taffydb.databases = {};  // {db: database, ownerUID: uid }

(function ()
{
	var pluginProto = cr.plugins_.Rex_taffydb.prototype;
		
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
        this.db_name = null;
        this.LinkToDatabase(this.properties[0]);	    
	    var index_keys_input = this.properties[1];
	    if (index_keys_input === "")
	    {
	        if (!this.recycled)
                this.indexKeys = [];
            else
                this.indexKeys.length = 0;
        }
        else        
        {
            this.indexKeys = index_keys_input.split(",");
        }
        
        // csv
        this.keyType = {};  // 0=string, 1=number, 2=eval
        
        // save
        this.rowID = "";
        this.preparedItem = {};
        if (!this.recycled)
            this.preprocessCmd = {};
        
        this.preprocessCmd["inc"] = {};
        this.preprocessCmd["max"] = {};
        this.preprocessCmd["min"] = {}; 
        this.hasPreprocessCmd = false;        
        
        // query
        this.CleanFilters();
        this.query_base = null;
        this.query_flag = false;                   
        this.current_rows = null;
        this.filter_history = {
            "flt":{}, 
            "ord":""
            };        
        this.queriedRows = null;            
        // retrieve
        this.exp_CurRowID = "";
        this.exp_CurRowIndex = -1;
        this.exp_LastSavedRowID = "";
        
        // save/load
        this.__flthis_save = null;         
	};
    
    instanceProto.LinkToDatabase = function (name)
	{
        if (this.db_name === name)
            return;
        else if (this.db_name === "")
        {
            // private -> public
            this.db()["remove"]();
        }
        
        this.db_name = name;
	    if (name === "")    // private database
	    {
	        this.db = window["TAFFY"]();
	    }
	    else                   // public database
	    {
	        create_global_database(this.uid, name);	            
	        this.db = get_global_database_reference(name).db;
	    }       
	};       
	
	var create_global_database = function (ownerUID, db_name, db_content)
	{
	    if (cr.plugins_.Rex_taffydb.databases.hasOwnProperty(db_name))
	        return;

	    var db_ref = {db:window["TAFFY"](db_content), 
	                  ownerID:ownerUID};	            
	    cr.plugins_.Rex_taffydb.databases[db_name] = db_ref;
	};
	
	var get_global_database_reference = function (db_name)
	{
	    return cr.plugins_.Rex_taffydb.databases[db_name];
	};
    
	instanceProto.onDestroy = function ()
    {
        this.indexKeys.length = 0;
        
        clean_table(this.preparedItem);
        
        clean_table(this.filters);
        this.order_cond.length = 0;
        
        if (this.db_name === "")
            this.db()["remove"]();
        else
        {
            var database_ref = get_global_database_reference(this.db_name);
            if (database_ref.ownerUID === this.uid)
                database_ref.ownerUID = null;
        }
        
        this.preprocessCmd["inc"] = {};
        this.preprocessCmd["max"] = {};
        this.preprocessCmd["min"] = {};         
	};  

	instanceProto.SaveRow = function (row, indexKeys, rowID, preprocessCmd)
	{   
	    var invalid_rowID = (rowID == null) || (rowID === "");
	    
	    // valid row ID
	    if (!invalid_rowID)
	    {
            var items = this.db(rowID);
            var itemOld = items["first"]();
            if (itemOld)
            {
                row = this.buildUpdateItem(itemOld, row, preprocessCmd);
                items["update"](row);
            }
	    }
	    
	    // insert a row
	    else if ((indexKeys == null) || (indexKeys.length === 0))	    
        {
            row = this.buildUpdateItem(null, row, preprocessCmd);
            this.db["insert"](row);            
        }
        
        // has index keys definition
        else
        {
            // build query item
            var queryKeys = {}, keyName; 
            var i, cnt=this.indexKeys.length;
            for (i=0; i<cnt; i++)
            {
                keyName = this.indexKeys[i];
                if (row.hasOwnProperty(keyName))
                {                  
                    queryKeys[keyName] = row[keyName];
                }
            }
            
            if (!is_empty(queryKeys))
            {
                var items = this.db(queryKeys);
                var itemOld = items["first"]() || null;
                row = this.buildUpdateItem(itemOld, row, preprocessCmd);
                if (itemOld)
                    items["update"](row);
                else
                    this.db["insert"](row); 
            }
            
            // no index keys setting
            else
            {
                row = this.buildUpdateItem(null, row, preprocessCmd);
                this.db["insert"](row);   
            }
        }
        

        if (row["___id"])
            this.exp_LastSavedRowID = row["___id"];
	};
    
	instanceProto.buildUpdateItem = function (itemOld, preparedItem, preprocessCmd)
    {
        if (!this.hasPreprocessCmd || (preprocessCmd == null))
            return preparedItem;
        
        var keys = preprocessCmd["inc"];
        for (var k in keys)
        {
            preparedItem[k] = getItemValue(itemOld, k, 0) + keys[k];
            delete keys[k];
        }
        
        var keys = preprocessCmd["max"];
        for (var k in keys)
        {
            preparedItem[k] = Math.max( getItemValue(itemOld, k, 0) , keys[k] );
            delete keys[k];            
        }
        
        var keys = preprocessCmd["min"];
        for (var k in keys)
        {
            preparedItem[k] = Math.min( getItemValue(itemOld, k, 0) , keys[k] );
            delete keys[k];            
        }        
        
        this.hasPreprocessCmd = false;
        return preparedItem;
	};     
    
    instanceProto.CleanFilters = function ()
	{    
	    this.filters = {};
	    
	    if (this.order_cond == null)
            this.order_cond = [];        
        this.order_cond.length = 0;        
	};	

    var isEmptyTable = function (o)    
    {
        for (var k in o)
            return false;
        
        return true;
    }
    
    instanceProto.NewFilters = function ()
	{          
        this.query_base = null;
	    this.CleanFilters(); 
        this.query_flag = true;           
	};	    
	
	var COMPARE_TYPES = ["is", "!is", "gt", "lt", "gte", "lte"];
    instanceProto.AddValueComparsion = function (k, cmp, v)
	{
	    if (!this.filters.hasOwnProperty(k))
	        this.filters[k] = {};
	    
	    this.filters[k][COMPARE_TYPES[cmp]] = v;
	    this.query_flag = true; 
	};	
	
    instanceProto.AddValueInclude = function (k, v)
	{
	    if (!this.filters.hasOwnProperty(k))
	        this.filters[k] = [];
	    
	    this.filters[k].push(v);
	    this.query_flag = true; 
	};	
		
    instanceProto.AddRegexTest = function (k, s, f)
	{
	    if (!this.filters.hasOwnProperty(k))
	        this.filters[k] = {};
	    
	    this.filters[k]["regex"] = [s, f];
	    this.query_flag = true; 
	};		
	
    var ORDER_TYPES = ["desc", "asec", "logicaldesc", "logical"];
    instanceProto.AddOrder = function (k, order_)
	{
	    this.order_cond.push(k + " " + ORDER_TYPES[order_]);
        this.query_flag = true; 
	};
	
	var process_filters = function (filters)
	{
	    for (var k in filters)
	    {
	        if (filters[k].hasOwnProperty("regex"))
	        {
	            var regex = filters[k]["regex"];
	            filters[k]["regex"] = new RegExp(regex[0], regex[1]);
	        }
	    }
	    return filters;
	};
    
    instanceProto.GetQueryResult = function ()
	{
        if (this.query_base == null)
        {
            this.query_base = this.db();
            this.filter_history["flt"] = {};
            this.filter_history["ord"] = "";
        }
        
        var query_result = this.query_base;
        if (!isEmptyTable(this.filters))
        {
            var filter_copy = JSON.parse( JSON.stringify(this.filters) );
            var filters = process_filters(this.filters);  
            query_result = query_result["filter"](filters);
            
            for (var k in filter_copy)
                this.filter_history["flt"][k] = filter_copy[k];
        }
        if (this.order_cond.length > 0)
        {
            var ord = this.order_cond.join(", ");
            this.filter_history["ord"] = ord;
            query_result = query_result["order"](ord);
        }
    
        this.query_base = query_result;        
        this.CleanFilters();
        return query_result;
	};    
	
    instanceProto.GetCurrentQueriedRows = function ()
	{
	    if (!this.queriedRows || this.query_flag)
	    {
            this.queriedRows = this.GetQueryResult();
            this.query_flag = false;
	    }
	    return this.queriedRows;
	};

	instanceProto.Index2QueriedRowID = function (index_, default_value)
	{    
	    var queriedRows = this.GetCurrentQueriedRows();
	    var row = queriedRows["get"]()[index_];
	    return getItemValue(row, "___id", default_value);        
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
                console.error("TaffyDB: Eval " + prefix + " : " + v + " failed");
                v = 0;
            }
        }
        return v;
	};		
		    
    var clean_table = function (o)
	{
        for (var k in o)        
            delete o[k];        
	};
    
    var is_empty = function (o)
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
	    var db_save = null;
	    if (this.db_name === "")
	        db_save = this.db()["get"]();
	    else
	    {
            var database_ref = get_global_database_reference(this.db_name);
            if (database_ref.ownerUID === null)
                 database_ref.ownerUID = this.uid;
            
            if (database_ref.ownerUID === this.uid)	
                db_save = this.db()["get"]();
        }
        
        var cur_fflt = {"flt": this.filters,
                                "ord": this.order_cond };
        
        var qIds = null;
        if (this.queriedRows)
        {
            var rows = this.queriedRows["get"]();
            var i, cnt=rows.length;
            qIds = [];
            for (i=0; i<cnt; i++)
                qIds.push(rows[i]["___id"]);
        }
		return { 
                 "rID": this.rowID,
                 "name": this.db_name,
                 "idxKeys": this.indexKeys,
		         "db": db_save,
		         "fltcur": cur_fflt,
                 "preCmd": this.preprocessCmd,
                 "prepItm": this.preparedItem,    
                 "flthis": (this.queriedRows)? this.filter_history:null,
                 "kt": this.keyType,

                 
		       };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.rowID = o["rID"];
	    this.db_name = o["name"];
        this.indexKeys = o["idxKeys"];
	    if (this.db_name === "")
		    this.db = window["TAFFY"](o["db"]);
		else
		{
		    if (o["db"] !== null)
		    {
		        if (cr.plugins_.Rex_taffydb.databases.hasOwnProperty(db_name))		        
		            delete cr.plugins_.Rex_taffydb.databases[db_name];		        

		        create_global_database(this.uid, this.db_name, o["db"]);		
		    }
		}
		this.filters = o["fltcur"]["flt"];
		this.order_cond = o["fltcur"]["ord"];
        this.preprocessCmd = o["preCmd"];
        this.preparedItem = o["prepItm"];
        this.__flthis_save = o["flthis"];
        this.keyType = o["kt"];
	};
	
	instanceProto.afterLoad = function ()
	{
        if (this.db_name !== "")
        {
	        create_global_database(this.uid, this.db_name);	            
	        this.db = get_global_database_reference(this.db_name).db;            
        }
        
        this.queriedRows = null;               
        var flthis = this.__flthis_save;
        if (flthis)
        {
            var q = this.db();            
            var flt = flthis["flt"];
            if (!isEmptyTable(flt))
                q = q["filter"](flt);
            
            var ord = flthis["ord"];
            if (ord !== "")
                q = q["order"](ord);
            
            this.queriedRows = q;
            this.__flthis_save = null;
        }

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
    var color_JSON = function (o)
    {
        var val = syntaxHighlight(JSON.stringify(o));
        return "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+val+"</style>";
    };
    
	instanceProto.getDebuggerValues = function (propsections)
	{
        var prop = [];     
        var self=this, rows=this.db(), n;
		var for_each_row = function(r, i)
		{
            prop.push({"name": i, 
                              "value": color_JSON(r),
                              "html": true,
                              "readonly":true});
		};
		rows["each"](for_each_row);

		propsections.push({
			"title": this.type.name,
			"properties": prop
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

	Cnds.prototype.ForEachRow = function ()
	{
	    var queriedRows = this.GetCurrentQueriedRows();
	        
	    var runtime = this.runtime;
        var current_frame = runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var self = this;
		
		var for_each_row = function(r, i)
		{
            if (solModifierAfterCnds)
            {
                runtime.pushCopySol(current_event.solModifiers);
            }
            
            self.exp_CurRowID = r["___id"];
            self.exp_CurRowIndex = i;
            current_event.retrigger();
           
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    } 
		};
		queriedRows["each"](for_each_row);

        this.exp_CurRowID = "";
        this.exp_CurRowIndex = -1;         
        
		return false;
	}; 
	
	Cnds.prototype.NewFilters = function ()
	{
        this.NewFilters();
	    return true;
	}; 	
	
	Cnds.prototype.AddValueComparsion = function (k, cmp, v)
	{
        this.AddValueComparsion(k, cmp, v);
	    return true;
	}; 	
	
	Cnds.prototype.AddBooleanValueComparsion = function (k, v)
	{
	    this.AddValueComparsion(k, 0, (v===1));
	    return true;
	}; 		
	
	Cnds.prototype.AddValueInclude = function (k, v)
	{
	    this.AddValueInclude(k, v);
	    return true;
	}; 	
    
    Cnds.prototype.AddRegexTest = function (k, s, f)
	{
	    this.AddRegexTest(k, s, f);
	    return true;
	};
		
    Cnds.prototype.AddOrder = function (k, order_)
	{
        this.AddOrder(k, order_);
	    return true;        
	}; 	
	
    //Cnds.prototype.Page = function (start_, limit_)
	//{
	//    debugger
	//    var queriedRows = this.GetCurrentQueriedRows();
	//    queriedRows["start"](start_)["limit"](limit_);
	//    return true;  
	//}; 		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
       
	Acts.prototype.InsertCSV = function (csv_string, is_eval, delimiter)
	{         
        is_eval = (is_eval === 1);
        var csv_data = CSVToArray(csv_string, delimiter);
        var col_keys = csv_data.shift(), col_key;
        var csv_row, row, cell_value;
        var r, row_cnt=csv_data.length;
        var c, col_cnt=col_keys.length;
        var prefix;   // for debug
        for (r=0; r<row_cnt; r++)
        {
            csv_row = csv_data[r];
            row = {};
            for (c=0; c<col_cnt; c++)
            {
                col_key = col_keys[c];
                cell_value = csv_row[c]; // string
                prefix = " (" + r + "," + c + ") ";
                if (is_eval)
                    row[col_key] = getEvalValue(cell_value, prefix);
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
                    
                    row[col_key] = cell_value;
                }
            }
            this.SaveRow(row, this.indexKeys);            
        }
        
        clean_table(this.keyType);
	};
    
	Acts.prototype.InsertJSON = function (json_string)
	{
	    var rows;
        try
        {
            rows = JSON.parse(json_string);
        }
        catch(err) { return; }        
        
        var i,cnt=rows.length;
        for(i=0; i<cnt; i++)
            this.SaveRow(rows[i], this.indexKeys);    
	};	
    
	Acts.prototype.RemoveByRowID = function (rowID)
	{
        this.db(rowID)["remove"]();
	};	
    
	Acts.prototype.RemoveByRowIndex = function (index_)
	{
        var rowID = this.Index2QueriedRowID(index_, null);
        if (rowID === null)
            return;
            
        this.db(rowID)["remove"]();
	};    
    
	Acts.prototype.SetIndexKeys = function (params_)
	{
        cr.shallowAssignArray(this.indexKeys, params_.split(","));
	};	
    
	Acts.prototype.RemoveAll = function ()
	{
        this.db()["remove"]();
	};    
    
    Acts.prototype.SetValue = function (key_, value_, cond)
	{
        if (cond === 0)
            this.preparedItem[key_] = value_;
        else
        {
            var cmdName = (cond === 1)? "max":"min";
            this.preprocessCmd[cmdName][key_] = value_;
            this.hasPreprocessCmd = true;               
        }            
	};    

    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{ 
        this.preparedItem[key_] = (is_true === 1);
	};
    
	Acts.prototype.Save = function ()
	{
        this.SaveRow(this.preparedItem, this.indexKeys, this.rowID, this.preprocessCmd); 
                          	    
	    this.rowID = "";
	    this.preparedItem = {};   
	};	
	    
    Acts.prototype.UpdateQueriedRows = function (key_, value_)
	{    
        var queriedRows = this.GetCurrentQueriedRows();
        var item = {};
        item[key_] = value_;
	    queriedRows["update"](item);
	};	
	    
    Acts.prototype.UpdateQueriedRows_BooleanValue = function (key_, is_true)
	{    
        var queriedRows = this.GetCurrentQueriedRows();
        var item = {};
        item[key_] = (is_true === 1);        
	    queriedRows["update"](item);
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
        this.preprocessCmd["inc"][key_] = value_;
        this.hasPreprocessCmd = true;         
    };    

    Acts.prototype.SetJSON = function (key_, value_)
	{ 
        this.preparedItem[key_] = JSON.parse(value_);
	};    
    
    Acts.prototype.NewFilters = function ()
	{    
	    this.NewFilters(); 
	};	

    Acts.prototype.AddValueComparsion = function (k, cmp, v)
	{
	    this.AddValueComparsion(k, cmp, v);
	};

    Acts.prototype.AddBooleanValueComparsion = function (k, v)
	{
	    this.AddValueComparsion(k, 0, (v===1));
	};	
	
    Acts.prototype.AddValueInclude = function (k, v)
	{
	    this.AddValueInclude(k, v);
	};		
	
    Acts.prototype.AddRegexTest = function (k, s, f)
	{
	    this.AddRegexTest(k, s, f);
	};	
	
    Acts.prototype.AddOrder = function (k, order_)
	{
        this.AddOrder(k, order_);
	}; 	

    //Acts.prototype.Page = function (start_, limit_)
	//{
	//    debugger
	//    var queriedRows = this.GetCurrentQueriedRows();
	//    queriedRows["start"](start_)["limit"](limit_);
	//}; 
	
    Acts.prototype.RemoveQueriedRows = function ()
	{
        var queriedRows = this.queriedRows;
	    if (queriedRows == null)
	        queriedRows = this.db(this.filters);
	        
	    queriedRows["remove"]();
	    
	    this.queriedRows = null;	    
	    this.CleanFilters();	    
	}; 		
	
    Acts.prototype.InsertCSV_DefineType = function (key_, type_)
	{
        this.keyType[key_] = type_;
	}; 	
	
    Acts.prototype.LinkToDatabase = function (name)
	{
        this.LinkToDatabase(name);
	}; 
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    
	Exps.prototype.At = function (ret)
	{  
        var primary_keys = {}, keyName; 
        var i, cnt=this.indexKeys.length;
        for (i=0; i<cnt; i++)
        {
            keyName = this.indexKeys[i];
            primary_keys[keyName] = arguments[i+1];
        }
        var row = this.db(primary_keys)["first"]();
        var k = arguments[cnt+1];
        var default_value = arguments[cnt+2];
        ret.set_any( getItemValue(row, k, default_value) );
	}; 

 	Exps.prototype.CurRowContent = function (ret, k, default_value)
	{
	    var row = this.db(this.exp_CurRowID)["get"]()[0];
		ret.set_any( getItemValue(row, k, default_value) );
	};

 	Exps.prototype.Index2QueriedRowContent = function (ret, i, k, default_value)
	{
	    var queriedRows = this.GetCurrentQueriedRows();
	    var row = queriedRows["get"]()[i];
	    ret.set_any( getItemValue(row, k, default_value) );
	};
	
 	Exps.prototype.QueriedRowsCount = function (ret)
	{
	    var queriedRows = this.GetCurrentQueriedRows();
		ret.set_int( queriedRows["count"]() );
	};
	
 	Exps.prototype.QueriedSum = function (ret, k)
	{
	    var queriedRows = this.GetCurrentQueriedRows();
		ret.set_int( queriedRows["sum"](k) );
	};	
	
 	Exps.prototype.QueriedMin = function (ret, k)
	{
	    var queriedRows = this.GetCurrentQueriedRows();
		ret.set_int( queriedRows["min"](k) );
	};		
	
 	Exps.prototype.QueriedMax = function (ret, k)
	{
	    var queriedRows = this.GetCurrentQueriedRows();
		ret.set_int( queriedRows["max"](k) );
	};		
 	Exps.prototype.QueriedRowsAsJSON = function (ret)
	{
	    var queriedRows = this.GetCurrentQueriedRows();
		ret.set_string( queriedRows["stringify"]() );
	};
 	Exps.prototype.KeyRowID = function (ret)
	{
		ret.set_string( "___id" );
	};	
 	Exps.prototype.LastSavedRowID = function (ret)
	{
		ret.set_string( this.exp_LastSavedRowID );
	};
 	Exps.prototype.ID2RowContent = function (ret, rowID, k, default_value)
	{
	    var row = this.db(rowID)["get"]()[0];
	    ret.set_any( getItemValue(row, k, default_value) );
	};
 	Exps.prototype.QueriedRowsIndex2RowID = function (ret, index_)
	{
		ret.set_string( this.Index2QueriedRowID(index_, "") );
	}; 
 	Exps.prototype.CurRowIndex = function (ret)
	{
		ret.set_int( this.exp_CurRowIndex);
	};    
    
 	Exps.prototype.CurRowID = function (ret)
	{     
		ret.set_any( this.exp_CurRowID );
	};
    
 	Exps.prototype.Index2QueriedRowID = function (ret, index_)
	{
		ret.set_string( this.Index2QueriedRowID(index_, "") );
	}; 
        
    
 	Exps.prototype.AllRowsAsJSON = function (ret)
	{
		ret.set_string( this.db()["stringify"]() );
	};	
 	Exps.prototype.AllRowsCount = function (ret)
	{
		ret.set_int( this.db()["count"]() );
	};		
    
 	Exps.prototype.DatabaseName = function (ret)
	{
		ret.set_string( this.db_name );
	};	    
    

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