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
	    this.db_name = this.properties[0];
	    if (this.db_name === "")    // private database
	    {
	        if (!this.recycled)
	            this.db = window["TAFFY"]();
	    }
	    else                   // public database
	    {
	        create_global_database(this.uid, this.db_name);	            
	        this.db = get_global_database_reference(this.db_name).db;
	    }
	    
	    var index_keys_input = this.properties[1];
	    if (index_keys_input === "")
	    {
	        if (!this.recycled)
                this.index_keys = [];
            else
                this.index_keys.length = 0;
        }
        else        
        {
            this.index_keys = index_keys_input.split(",");
        }
        
        // csv
        this.keyType = {};  // 0=string, 1=number, 2=eval
        
        // save
        this.rowID = "";
        this.prepared_item = {};
        // query
        this.CleanFilters();
        this.query_base = null;
        this.query_flag = false;                   
        this.current_rows = null;
        this.filter_history = {
            "flt":{}, 
            "ord":""
            };        
        // retrieve
        this.exp_CurRowIndex = -1;
        this.exp_CurRow = null;
        this.exp_LastSavedRowID = "";
        
        // save/load
        this.__flthis_save = null;
        
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];     
        /**END-PREVIEWONLY**/            
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
        this.index_keys.length = 0;
        
        clean_table(this.prepared_item);
        
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
	};  

	instanceProto.SaveRow = function (row, index_keys, rowID)
	{   
	    var invalid_rowID = (rowID == null) || (rowID === "");
	    
	    // valid row ID
	    if (!invalid_rowID)
	    {
	        this.db(rowID)["update"](row);
	    }
	    
	    // insert a row
	    else if ((index_keys == null) || (index_keys.length === 0))	    
        {
            this.db["insert"](row);            
        }
        
        // has index keys definition
        else
        {
            var index_keys = {}, key_name; 
            var i, cnt=this.index_keys.length;
            var has_index_keys = false;
            for (i=0; i<cnt; i++)
            {
                key_name = this.index_keys[i];
                if (row.hasOwnProperty(key_name))
                {                  
                    index_keys[key_name] = row[key_name];
                    has_index_keys = true;
                }
            }
            
            
            if (has_index_keys)
            {
                var items = this.db(index_keys);
                var cnt = items["count"]();
                if (cnt === 0)
                    this.db["insert"](row);   
                else if (cnt > 1)
                {
                    items["remove"]();
                    this.db["insert"](row);  
                }
                else
                {
                    items["update"](row);
                }                                         
            }
            
            // no index keys setting
            else
            {
                this.db["insert"](row);   
            }
        }
        

        if (row["___id"])
            this.exp_LastSavedRowID = row["___id"];
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
	    if (!this.current_rows || this.query_flag)
	    {
            this.current_rows = this.GetQueryResult();
            this.query_flag = false;
	    }
	    return this.current_rows;
	};

	instanceProto.Index2QueriedRowID = function (index_, default_value)
	{    
	    var current_rows = this.GetCurrentQueriedRows();
	    var row = current_rows["get"]()[index_];
	    return din(row, "___id", default_value);        
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
	
 	var din = function (row, k, default_value)
	{
	    var v;
	    if (row)
	    {
	        if (k == null)
	            v = JSON.stringify(row);
	        else
	            v = row[k];
	    }
	    if (v == null)
        {
            if (typeof(default_value) !== "undefined")
                v = default_value;
            else
                v = 0;
        }
		return v;
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
        if (this.current_rows)
        {
            var rows = this.current_rows["get"]();
            var i, cnt=rows.length;
            qIds = [];
            for (i=0; i<cnt; i++)
                qIds.push(rows[i]["___id"]);
        }
		return { "name": this.db_name,
		         "db": db_save,
		         "fltcur": cur_fflt,
                 "flthis": (this.current_rows)? this.filter_history:null,
                 "kt": this.keyType,
		       };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.db_name = o["name"];
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
        this.__flthis_save = o["flthis"];
        this.keyType = o["kt"];
	};
	
	instanceProto.afterLoad = function ()
	{
        if (this.db_name !== "")
            this.db = get_global_database_reference(this.db_name).db;  
        
        this.current_rows = null;               
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
            
            this.current_rows = q;
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
        this.propsections.length = 0;       
        var self=this, rows=this.db(), n;
		var for_each_row = function(r, i)
		{
            self.propsections.push({"name": i, 
                                    "value": color_JSON(r),
                                    "html": true,
                                    "readonly":true});
		};
		rows["each"](for_each_row);

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

	Cnds.prototype.ForEachRow = function ()
	{
	    var current_rows = this.GetCurrentQueriedRows();
	        
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
            
            self.exp_CurRow = r;
            self.exp_CurRowIndex = i;
            current_event.retrigger();
           
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    } 
		};
		current_rows["each"](for_each_row);
        
        this.exp_CurRow = null;
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
	//    var current_rows = this.GetCurrentQueriedRows();
	//    current_rows["start"](start_)["limit"](limit_);
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
            this.SaveRow(row, this.index_keys);            
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
            this.SaveRow(rows[i], this.index_keys);    
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
        cr.shallowAssignArray(this.index_keys, params_.split(","));
	};	
    
	Acts.prototype.RemoveAll = function ()
	{
        this.db()["remove"]();
	};    
    
    Acts.prototype.SetValue = function (key_, value_)
	{
        this.prepared_item[key_] = value_;
	};
	
    Acts.prototype.SetBooleanValue = function (key_, is_true)
	{ 
        this.prepared_item[key_] = (is_true === 1);
	};
    
	Acts.prototype.Save = function ()
	{
        this.SaveRow(this.prepared_item, this.index_keys, this.rowID); 
                          	    
	    this.rowID = "";
	    this.prepared_item = {};   
	};	
	    
    Acts.prototype.UpdateQueriedRows = function (key_, value_)
	{    
	    var current_rows = this.GetCurrentQueriedRows();
	    current_rows["update"](key_, value_);
	};	
	    
    Acts.prototype.UpdateQueriedRows_BooleanValue = function (key_, is_true)
	{    
	    var current_rows = this.GetCurrentQueriedRows();
	    current_rows["update"](key_, (is_true === 1));
	};	
	    
    Acts.prototype.SetRowID = function (rowID)
	{    
        this.rowID = rowID;
	};		
	    
    Acts.prototype.SetRowIndex = function (index_)
	{
	    this.rowID = this.Index2QueriedRowID(index_, null);
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
	//    var current_rows = this.GetCurrentQueriedRows();
	//    current_rows["start"](start_)["limit"](limit_);
	//}; 
	
    Acts.prototype.RemoveQueriedRows = function ()
	{
        var current_rows = this.current_rows;
	    if (current_rows == null)
	        current_rows = this.db(this.filters);
	        
	    current_rows["remove"]();
	    
	    this.current_rows = null;	    
	    this.CleanFilters();	    
	}; 		
	
    Acts.prototype.InsertCSV_DefineType = function (key_, type_)
	{
        this.keyType[key_] = type_;
	}; 			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    
	Exps.prototype.At = function (ret)
	{  
        var primary_keys = {}, key_name; 
        var i, cnt=this.index_keys.length;
        for (i=0; i<cnt; i++)
        {
            key_name = this.index_keys[i];
            primary_keys[key_name] = arguments[i+1];
        }
        var item = this.db(primary_keys)["first"]();
        var data_key = arguments[cnt+1];
        var default_value = arguments[cnt+2];
        var value = item[data_key] || default_value || 0;
        ret.set_any(value);
	}; 

 	Exps.prototype.CurRowContent = function (ret, k, default_value)
	{
		ret.set_any( din(this.exp_CurRow, k, default_value) );
	};

 	Exps.prototype.Index2QueriedRowContent = function (ret, i, k, default_value)
	{
	    var current_rows = this.GetCurrentQueriedRows();
	    var row = current_rows["get"]()[i];
	    ret.set_any( din(row, k, default_value) );
	};
	
 	Exps.prototype.QueriedRowsCount = function (ret)
	{
	    var current_rows = this.GetCurrentQueriedRows();
		ret.set_int( current_rows["count"]() );
	};
	
 	Exps.prototype.QueriedSum = function (ret, k)
	{
	    var current_rows = this.GetCurrentQueriedRows();
		ret.set_int( current_rows["sum"](k) );
	};	
	
 	Exps.prototype.QueriedMin = function (ret, k)
	{
	    var current_rows = this.GetCurrentQueriedRows();
		ret.set_int( current_rows["min"](k) );
	};		
	
 	Exps.prototype.QueriedMax = function (ret, k)
	{
	    var current_rows = this.GetCurrentQueriedRows();
		ret.set_int( current_rows["max"](k) );
	};		
 	Exps.prototype.QueriedRowsAsJSON = function (ret)
	{
	    var current_rows = this.GetCurrentQueriedRows();
		ret.set_string( current_rows["stringify"]() );
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
	    ret.set_any( din(row, k, default_value) );
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
		ret.set_any( din(this.exp_CurRow, "___id", "") );
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