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
	    jsfile_load("taffy.js");
	};
	
	var jsfile_load = function(file_name)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
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
        
        this.rowID = "";
        this.prepared_item = {};
        this.NewFilters();
            
        this.current_rows = null;
        
        this.exp_CurRow = null;
        this.exp_LastSavedRowID = "";
        
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];     
        /**END-PREVIEWONLY**/    
        
        this.__flts_save = null; 
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
    
    instanceProto.NewFilters = function ()
	{    
	    this.ShadowFilters();
	    
	    this.filters = {};
	    
	    if (this.order_cond == null)
            this.order_cond = [];        
        this.order_cond.length = 0;
	};	
		
    instanceProto.ShadowFilters = function ()
	{    
	    this.filters_shadow = this.filters;
	    this.order_cond_shadow = this.order_cond;
	};		
	
	var COMPARE_TYPES = ["is", "!is", "gt", "lt", "gte", "lte"];
    instanceProto.AddValueComparsion = function (k, cmp, v)
	{
	    if (this.current_rows)
	    {
	        this.current_rows = null;
	        this.NewFilters();
	    }
	    
	    if (!this.filters.hasOwnProperty(k))
	        this.filters[k] = {};
	    
	    this.filters[k][COMPARE_TYPES[cmp]] = v;
	    this.current_rows = null;
	};	
	
    instanceProto.AddValueInclude = function (k, v)
	{
	    if (this.current_rows)
	    {
	        this.current_rows = null;
	        this.NewFilters();
	    }
	    
	    if (!this.filters.hasOwnProperty(k))
	        this.filters[k] = [];
	    
	    this.filters[k].push(v);
	    this.current_rows = null;
	};	
		
    instanceProto.AddRegexTest = function (k, s, f)
	{
	    if (this.current_rows)
	    {
	        this.current_rows = null;
	        this.NewFilters();
	    }
	    
	    if (!this.filters.hasOwnProperty(k))
	        this.filters[k] = {};
	    
	    this.filters[k]["regex"] = [s, f];
	    this.current_rows = null;
	};		
	
    var ORDER_TYPES = ["desc", "asec"];
    instanceProto.AddOrder = function (k, order_)
	{
	    if (this.current_rows)
	    {
	        this.current_rows = null;
	        this.NewFilters();
	    }
	    this.order_cond.push(k + " " + ORDER_TYPES[order_]);
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
	
    instanceProto.get_current_queried_rows = function ()
	{
	    if (this.current_rows == null)
	    {
	        var filters = process_filters(this.filters);
	        var current_rows = this.db(filters)["order"](this.order_cond.join(", "));	         
	        	           
	        this.current_rows = current_rows;
	        this.NewFilters();
	    }
	    return this.current_rows;
	};

	instanceProto.queriedRowIndex2RowId = function (index_, default_value)
	{    
	    var current_rows = this.get_current_queried_rows();
	    var row = current_rows["get"]()[index_];
	    return din(row, "___id", default_value);        
	};
		
	var value_get = function(v, is_eval_mode)
	{
	    if (v == null)
	        v = 0;
	    else if (is_eval_mode)
	        v = eval("("+v+")");
        
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
	        db_save = this.db()["stringify"]();
	    else
	    {
            var database_ref = get_global_database_reference(this.db_name);
            if (database_ref.ownerUID === null)
                 database_ref.ownerUID = this.uid;
            
            if (database_ref.ownerUID === this.uid)	
                db_save = this.db()["stringify"]();
        }
        
        var flt_save = null;
        if (this.current_rows)
        {
            flt_save = {"flt": this.filters_shadow,
                        "ord": this.order_cond_shadow };
        }
    
		return { "name": this.db_name,
		         "db": db_save,
		         "flt": flt_save
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
		
		this.__flts_save = o["flt"];
	};
	
	instanceProto.afterLoad = function ()
	{
        if (this.db_name !== "")
            this.db = get_global_database_reference(this.db_name).db;
            
        if (this.__flts_save)
        {
	        this.filters = this.__flts_save["flt"];
	        this.order_cond = this.__flts_save["ord"];
            this.__flts_save = null;
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
	    var current_rows = this.get_current_queried_rows();
	        
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
            current_event.retrigger();
            self.exp_CurRow = null;
            
		    if (solModifierAfterCnds)
		    {
		        runtime.popSol(current_event.solModifiers);
		    } 
		};
		current_rows["each"](for_each_row);
		return false;
	}; 
	
	Cnds.prototype.NewFilters = function ()
	{
	    if (this.current_rows)
	    {
	        this.current_rows = null;
	        this.NewFilters();
	    }   
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
	//    var current_rows = this.get_current_queried_rows();
	//    current_rows["start"](start_)["limit"](limit_);
	//    return true;  
	//}; 		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
       
	Acts.prototype.InsertCSV = function (csv_string, is_eval, delimiter)
	{         
        var csv_data = CSVToArray(csv_string, delimiter);
        var col_keys = csv_data.shift();
        var csv_row, row;
        var r, row_cnt=csv_data.length;
        var c, col_cnt=col_keys.length;
        for (r=0; r<row_cnt; r++)
        {
            csv_row = csv_data[r];
            row = {};
            for (c=0; c<col_cnt; c++)
            {
                row[col_keys[c]] = value_get(csv_row[c], is_eval);
            }
            this.SaveRow(row, this.index_keys);            
        }
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
        var rowID = this.queriedRowIndex2RowId(index_, null);
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
	    var current_rows = this.get_current_queried_rows();
	    current_rows["update"](key_, value_);
	};	
	    
    Acts.prototype.UpdateQueriedRows_BooleanValue = function (key_, is_true)
	{    
	    var current_rows = this.get_current_queried_rows();
	    current_rows["update"](key_, (is_true === 1));
	};	
	    
    Acts.prototype.SetRowID = function (rowID)
	{    
        this.rowID = rowID;
	};		
	    
    Acts.prototype.SetRowIndex = function (index_)
	{
	    this.rowID = this.queriedRowIndex2RowId(index_, null);
	};
    
    Acts.prototype.NewFilters = function ()
	{    
	    if (this.current_rows)
	    {
	        this.current_rows = null;
	        this.NewFilters();
	    }
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
	//    var current_rows = this.get_current_queried_rows();
	//    current_rows["start"](start_)["limit"](limit_);
	//}; 
	
    Acts.prototype.RemoveQueriedRows = function ()
	{
        var current_rows = this.current_rows;
	    if (current_rows == null)
	        current_rows = this.db(this.filters);
	        
	    current_rows["remove"]();
	    
	    this.current_rows = null;	    
	    this.NewFilters();	    
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
	    var current_rows = this.get_current_queried_rows();
	    var row = current_rows["get"]()[i];
	    ret.set_any( din(row, k, default_value) );
	};
	
 	Exps.prototype.QueriedRowsCount = function (ret)
	{
	    var current_rows = this.get_current_queried_rows();
		ret.set_int( current_rows["count"]() );
	};
	
 	Exps.prototype.QueriedSum = function (ret, k)
	{
	    var current_rows = this.get_current_queried_rows();
		ret.set_int( current_rows["sum"](k) );
	};	
	
 	Exps.prototype.QueriedMin = function (ret, k)
	{
	    var current_rows = this.get_current_queried_rows();
		ret.set_int( current_rows["min"](k) );
	};		
	
 	Exps.prototype.QueriedMax = function (ret, k)
	{
	    var current_rows = this.get_current_queried_rows();
		ret.set_int( current_rows["max"](k) );
	};		
 	Exps.prototype.QueriedRowsAsJSON = function (ret)
	{
	    var current_rows = this.get_current_queried_rows();
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
		ret.set_string( this.queriedRowIndex2RowId(index_, "") );
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