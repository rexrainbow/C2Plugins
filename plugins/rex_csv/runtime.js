// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_CSV = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_CSV.prototype;
		
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
        this.is_debug_mode = this.properties[0];
        this.strDelimiter = this.properties[1];
        this._tables = {};
        this.current_page_name = null;
        this.current_table = null;
        this.forPage = "";
        this.atCol = "";
        this.atRow = "";  
        this.atPage = "";        
        
        // turn to default page "_"
        this.TurnPage("_");  
        
        this.adapter = new cr.plugins_.Rex_CSV.CSVAdapterKlass(this);
        this.check_name = "CSV";   
	};

	instanceProto.TurnPage = function(page)
	{  
        if (this._tables[page] == null)
        {
            this._tables[page] = new cr.plugins_.Rex_CSV.CSVKlass(this, this.is_debug_mode);
        }    
        this.current_page_name = page;
        this.current_table = this._tables[page];       
	};

	instanceProto.Get = function (col, row, page)
	{
        this.atCol = col;
        this.atRow = row;
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.current_page_name;  
        return this.current_table.At(col,row);
	};

	instanceProto.Set = function (value, col, row, page)
	{
        this.atCol = col;
        this.atRow = row;
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.current_page_name;  
        this.current_table.SetEntry(col, row, value);       
	};

	instanceProto.GetColCnt = function (page)
	{
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.current_page_name;  
        return this.current_table.GetColCnt();   
	};

	instanceProto.GetRowCnt = function (page)
	{
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.current_page_name;  
        return this.current_table.GetRowCnt();   
	}; 

	instanceProto.TableToString = function (page)
	{
        if (page != null)
        {
            this.TurnPage(page);
        }
        return this.current_table.ToString();   
	}; 	
	   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.ForEachCol = function ()
	{
        this.current_table.ForEachCol();
		return false;
	};    

	Cnds.prototype.ForEachRowInCol = function (col)
	{
        this.current_table.ForEachRowInCol(col);
		return false;
	}; 
    
	Cnds.prototype.ForEachPage = function ()
	{   
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
		this.forPage = "";
        var tables = this._tables;
        var page;
		for (page in tables)
	    {
            this.forPage = page;
            this.TurnPage(page);
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.forPage = "";
		return false;        
	};    
    
	Cnds.prototype.ForEachRow = function ()
	{
        this.current_table.ForEachRow();
		return false;
	};    

	Cnds.prototype.ForEachColInRow = function (row)
	{
        this.current_table.ForEachColInRow(row);
		return false;
	}; 	

	Cnds.prototype.IsDataInCol = function (data, col_name)
	{
		if (!(this.current_table.keys.indexOf(col_name) != (-1)))
		    return false;    
	    var table = this.current_table._table;
	    var col_data = table[col_name], row_name;
		var matched = false;
		for (row_name in col_data)
		{
		    if (col_data[row_name] == data)
			{
			    matched = true;
				break;
			}
		}
		return matched;
	}; 

	Cnds.prototype.IsDataInRow = function (data, row_name)
	{
		if (!(this.current_table.items.indexOf(row_name) != (-1)))
		    return false;    
	    var table = this.current_table._table;
	    var col_name;
		var matched = false;
		for (col_name in table)
		{
		    if (table[col_name][row_name] == data)
			{
			    matched = true;
				break;
			}
		}
		return matched;
	}; 

	Cnds.prototype.IsKeyInCol = function (key)
	{
        return (this.current_table.keys.indexOf(key) != (-1));     
	};

	Cnds.prototype.IsKeyInRow = function (key)
	{
        return (this.current_table.items.indexOf(key) != (-1));
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.LoadCSV = function (csv_string)
	{         
        this.current_table._parsing(csv_string);
	};
    
	Acts.prototype.SetEntry = function (col, row, val)
	{
        this.current_table.SetEntry(col, row, val);       
	};
    
	Acts.prototype.Clear = function ()
	{
		 this.current_table.Clear();
	};    
    
	Acts.prototype.ConvertType = function (row, to_type)
	{
         this.current_table.ConvertType(row, to_type);
	};   
    
	Acts.prototype.TurnPage = function (page)
	{
         this.TurnPage(page);
	};
    
	Acts.prototype.StringToPage = function (JSON_string)
	{
        this.current_table.JSONString2Page(JSON_string);
	};    
    
	Acts.prototype.StringToPage = function (JSON_string)
	{
        this.current_table.JSONString2Page(JSON_string);
	};   
    
	Acts.prototype.AppendCol = function (col)
	{
        this.current_table.AppendCol(col);
	}; 
    
	Acts.prototype.AppendRow = function (row, init_value)
	{
        this.current_table.AppendRow(row, init_value);
	}; 
    
	Acts.prototype.RemoveCol = function (col)
	{
        this.current_table.RemoveCol(col);
	}; 
    
	Acts.prototype.RemoveRow = function (row)
	{
        this.current_table.RemoveRow(row);
	};     
    
	Acts.prototype.SetDelimiter = function (s)
	{
        this.strDelimiter = s;
	}; 

	Acts.prototype.StringToAllTables = function (JSON_string)
	{   
	    var page;
	    var tables=JSON.parse(JSON_string);
	    for (page in tables)
	    {
	        this.TurnPage(page);
	        this.current_table.JSONString2Page(tables[page]);
	    }
	};
    
	Acts.prototype.SortCol = function (col_index, is_increasing)
	{
        this.current_table.SortCol(col_index, is_increasing);
	};
    
	Acts.prototype.SortRow = function (row_index, is_increasing)
	{
        this.current_table.SortRow(row_index, is_increasing);
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.At = function (ret, col, row, page)
	{  
        ret.set_any(this.Get(col, row, page));
	}; 
    
	Exps.prototype.CurCol = function (ret)
	{
		ret.set_string(this.current_table.forCol);
	};
	
	Exps.prototype.CurRow = function (ret)
	{
		ret.set_string(this.current_table.forRow);
	};
	
	Exps.prototype.CurValue = function (ret)
	{
		ret.set_any(this.current_table.At( this.current_table.forCol, this.current_table.forRow ));
	}; 

	Exps.prototype.AtCol = function (ret)
	{
		ret.set_string(this.atCol);
	};
	
	Exps.prototype.AtRow = function (ret)
	{
		ret.set_string(this.atRow);
	};   
	
	Exps.prototype.AtPage = function (ret)
	{
		ret.set_string(this.atPage);
	}; 
	
	Exps.prototype.CurPage = function (ret)
	{
		ret.set_string(this.forPage);
	};
	
	Exps.prototype.TableToString = function (ret, page)
	{ 
		ret.set_string(this.TableToString(page));
	};    
	
	Exps.prototype.ColCnt = function (ret, page)
	{
		ret.set_int(this.GetColCnt(page));
	};
	
	Exps.prototype.RowCnt = function (ret, page)
	{ 
		ret.set_int(this.GetRowCnt(page));
	}; 
	
	Exps.prototype.Delimiter = function (ret, page)
	{ 
		ret.set_string(this.strDelimiter);
	}; 
	
	Exps.prototype.AllTalbesToString = function (ret)
	{ 
	    var page, table2string={};
	    for (page in this._tables)	    
	        table2string[page] = this.TableToString(page);        
		ret.set_string(JSON.stringify(table2string));
	};     
}());


(function ()
{
    cr.plugins_.Rex_CSV.CSVKlass = function(plugin, is_debug_mode)
    {
        this.plugin = plugin;
        this.is_debug_mode = is_debug_mode;    
		this._table = {};
        this.keys = [];    // col name
        this.items = [];   // row name
        this.forCol = "";
        this.forRow = "";        
    };
    var CSVKlassProto = cr.plugins_.Rex_CSV.CSVKlass.prototype;
    
	CSVKlassProto.Clear = function()
	{        
        var key;
        for (key in this._table)
            delete this._table[key];
        this.keys.length = 0;
        this.items.length = 0;
	};  
    
	CSVKlassProto.ToString = function()
	{
        var save_data = {"table":this._table,
                         "keys":this.keys,
                         "items":this.items};
		return JSON.stringify(save_data);   
	};
    
	CSVKlassProto.JSONString2Page = function(JSON_string)
	{
        var save_data = JSON.parse(JSON_string);
        try
        {
	        this._table = save_data["table"];
            this.keys = save_data["keys"];
            this.items = save_data["items"];  
        }
        catch(err)  // compatible with older version
        {
            this._table = save_data;
        }
	};        

    CSVKlassProto._create_keys = function()
	{
        var keys = this.keys;
        var key_cnt = this.keys.length;        
        var i, key;
        for (i=0; i<key_cnt; i++)
        {
            key = keys[i];
            if (this._table[key] == null)
                this._table[key] = {};         
        }
	};
    
    CSVKlassProto._create_items = function(values)
	{
        var item_name = values.shift();
        var keys = this.keys;
        var key_cnt = this.keys.length;   
        var table = this._table;
        var i;
        for (i=0; i<key_cnt; i++)
        {
            table[keys[i]][item_name] = values[i];        
        }
        this.items.push(item_name);
	}; 
    
	CSVKlassProto._parsing = function(csv_string)
	{
        if (csv_string == "")
        {
            if (this.is_debug_mode)
                alert ("CSV string is empty.");  
            return;
        }
                       
        var read_array = CSVToArray(csv_string, this.plugin.strDelimiter); 
        
        this.keys = read_array.shift();      
        this._create_keys();
        var item_cnt = read_array.length;
        var i;
        for (i=0; i<item_cnt; i++)
        {
            this._create_items(read_array[i]);
        }      
	}; 

    CSVKlassProto.At = function(col, row)
	{
        if (this._table[col]==null)
        {
            if (this.is_debug_mode)
                alert ("Can not find col index '" +col+"' in table.");  
            return 0;
        }
        
        var val = this._table[col][row];
		if (val == null)
        {
            if (this.is_debug_mode)
                alert ("Can not find row index '" +row+"' in table.");          
            return 0;
        }

        return val;   
	};
    
	CSVKlassProto.SetEntry = function (col, row, val)
	{
        assert2((this._table[col]!=null) && (this._table[col][row] != null), 
                 "[CSV]SetEntry: " + col + " , " + row  + " not found.");
            
        this._table[col][row] = val;        
	};    
    
	CSVKlassProto.ConvertType = function (row, to_type)
	{
        var handler = (to_type==0)? parseInt:
                                    parseFloat;
        var keys = this.keys;
        var key_cnt = keys.length;
        var table = this._table;
        var i, val;
        for (i=0; i<key_cnt; i++)
        {
            val = table[keys[i]][row];
            table[keys[i]][row] = handler(val);        
        }                    
	};      
    
	CSVKlassProto.AppendCol = function (col)
	{
        if (this._table[col] != null)
            return;
            
        var has_ref = false;
        if (this.keys.length > 0)
        {
            var ref_col = this._table[this.keys[0]];
            has_ref = true;
        }
        var col_data = {};
        var items = this.items;
        var item_cnt = items.length;        
        var i;
        for (i=0; i<item_cnt; i++)
        {
            if (has_ref)
            {
                if (typeof ref_col[items[i]] == "number")
                    col_data[items[i]] = 0;
                else
                     col_data[items[i]] = "";
            }
            else
                col_data[items[i]] = "";
        }        
        this._table[col] = col_data;
        this.keys.push(col);
	};   
    
	CSVKlassProto.AppendRow = function (row, init_value)
	{
        if (this.items.indexOf(row) != (-1))
            return;
            
        var keys = this.keys;
        var key_cnt = keys.length;
        var table = this._table;
        var i;
        for (i=0; i<key_cnt; i++)
        {
            table[keys[i]][row] = init_value;        
        }   
        this.items.push(row);
	};     
    
	CSVKlassProto.RemoveCol = function (col)
	{
        var col_index = this.keys.indexOf(col);
        if (col_index == (-1))
            return;

        delete this._table[col]; 
        this.keys.splice(col_index, 1);
	};   
    
	CSVKlassProto.RemoveRow = function (row)
	{
        var row_index = this.items.indexOf(row);
        if (row_index == (-1))
            return;
            
        var keys = this.keys;
        var key_cnt = keys.length;
        var table = this._table;
        var i;
        for (i=0; i<key_cnt; i++)
        {
            delete table[keys[i]][row];        
        }   
        this.items.splice(row_index, 1);
	};     
    
	CSVKlassProto.ForEachCol = function ()
	{   
        var current_event = this.plugin.runtime.getCurrentEventStack().current_event;
		
		this.forCol = "";
        
        var keys = this.keys;
        var key_cnt = keys.length;
        var i;
		for (i=0; i<key_cnt; i++ )
	    {
            this.forCol = keys[i];
		    this.plugin.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.plugin.runtime.popSol(current_event.solModifiers);
		}

		this.forCol = "";
	};    

	CSVKlassProto.ForEachRowInCol = function (col)
	{
        if (this.keys.indexOf(col)== (-1))
        {
            if (this.is_debug_mode)
                alert ("Can not find col index '" +col+"' in table.");          
		    return;        
        }
            
        // current_entry is valid
        var current_event = this.plugin.runtime.getCurrentEventStack().current_event;
		
		this.forRow = "";
        
        var items = this.items;
        var item_cnt = items.length;
        var i;
		for (i=0; i<item_cnt; i++ )
	    {
            this.forRow = items[i];
		    this.plugin.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.plugin.runtime.popSol(current_event.solModifiers);
		}

		this.forRow = "";
	};     
	
	CSVKlassProto.ForEachRow = function ()
	{   
        var current_event = this.plugin.runtime.getCurrentEventStack().current_event;
		
		this.forRow = "";
        
        var items = this.items;
        var item_cnt = items.length;
        var i;
		for (i=0; i<item_cnt; i++ )
	    {
            this.forRow = items[i];
		    this.plugin.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.plugin.runtime.popSol(current_event.solModifiers);
		}

		this.forRow = "";
	};    

	CSVKlassProto.ForEachColInRow = function (row)
	{
        if (this.items.indexOf(row) == (-1))
        {
            if (this.is_debug_mode)
                alert ("Can not find col index '" +row+"' in table.");          
		    return;        
        }
            
        // current_entry is valid
        var current_event = this.plugin.runtime.getCurrentEventStack().current_event;
		
		this.forCol = "";
        
        var keys = this.keys;
        var key_cnt = keys.length;
        var i;
		for (i=0; i<key_cnt; i++ )
	    {
            this.forCol = keys[i];
		    this.plugin.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.plugin.runtime.popSol(current_event.solModifiers);
		}

		this.forCol = "";
	};     	
	    
    CSVKlassProto.GetColCnt = function()
    {
        return this.keys.length;
    };
	    
    CSVKlassProto.GetRowCnt = function()
    {
        return this.items.length;
    };
    
    var _sort_table = null;
    var _sort_col_name = "";
    var _sort_row_name = "";
    var _sort_is_increasing = true;
    var _col_sort = function(row0, row1)
    {        
        var item0 = _sort_table[_sort_col_name][row0];
        var item1 = _sort_table[_sort_col_name][row1];
        return (item0 > item1) ? (_sort_is_increasing? 1:-1):
               (item0 < item1) ? (_sort_is_increasing? -1:1):
                                 0;
    }  
    var _row_sort = function(col0, col1)
    {        
        var item0 = _sort_table[col0][_sort_row_name];
        var item1 = _sort_table[col1][_sort_row_name]; 
        return (item0 > item1) ? (_sort_is_increasing? 1:-1):
               (item0 < item1) ? (_sort_is_increasing? -1:1):
                                 0;
    }
    CSVKlassProto.SortCol = function (col_index, is_increasing)
    {
        assert2(this.keys.indexOf(col_index) != (-1), "[CSV]SortCol: " + col_index + " not in col");
        _sort_table = this._table;
        _sort_col_name = col_index;
        _sort_is_increasing = (is_increasing == 0);
        this.items.sort(_col_sort);
    };
	    
    CSVKlassProto.SortRow = function (row_index, is_increasing)
    {
        assert2(this.items.indexOf(row_index) != (-1), "[CSV]SortRow: " + row_index + " not in row");
        _sort_table = this._table;
        _sort_row_name = row_index;
        _sort_is_increasing = (is_increasing == 0);      
        this.keys.sort(_row_sort); 
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
    
    // adapter for exporting to javascript
    cr.plugins_.Rex_CSV.CSVAdapterKlass = function(plugin)
    {
        this["_plugin"] = plugin;      
    };
    var CSVAdapterKlassProto = cr.plugins_.Rex_CSV.CSVAdapterKlass.prototype; 
    
    CSVAdapterKlassProto["Get"] = function(col, row, page)
    {
        return this["_plugin"].Get(col, row, page);
    };
    CSVAdapterKlassProto["Set"] = function(value, col, row, page)
    {
        this["_plugin"].Set(value, col, row, page);
    };
}());    