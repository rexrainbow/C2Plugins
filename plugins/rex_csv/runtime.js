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
	    this.isInPreview = (typeof cr_is_preview !== "undefined");  
        this.strDelimiter = this.properties[0];
        this.isEvalMode = (this.properties[1] == 1);
        this.tables = {};
        this.currentPageName = null;
        this.currentTable = null;
        this.forPage = "";
        this.atCol = "";
        this.atRow = "";  
        this.atPage = "";  
        
        // turn to default page "_"
        this.TurnPage("_");          
        this.checkName = "CSV";   
        
        /**BEGIN-PREVIEWONLY**/
        this.dbg = {
            "pageName": "_",
            "colName" : ""
        };      
        /**END-PREVIEWONLY**/        
	};
	
	instanceProto.getValue = function(v)
	{
	    if (v == null)
	        v = 0;
	    else if (this.isEvalMode)
	        v = eval("("+v+")");
        
        return v;
	};	

	instanceProto.HasPage = function(page)
	{  
	    return (this.tables[page] != null);     
	};
	
	instanceProto.TurnPage = function(page)
	{  
        if (this.currentPageName === page)
            return;
        
        if (!this.HasPage(page))
        {
            this.tables[page] = new cr.plugins_.Rex_CSV.CSVKlass(this);
        }    
        this.currentPageName = page;
        this.currentTable = this.tables[page];       
	};

	instanceProto.Get = function (col, row, page)
	{
        this.atCol = col;
        this.atRow = row;
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.currentPageName;  
        return this.currentTable.At(col,row);
	};

	instanceProto.Set = function (value, col, row, page)
	{
        this.atCol = col;
        this.atRow = row;
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.currentPageName;  
        this.currentTable.SetCell(col, row, value);       
	};

	instanceProto.GetColCnt = function (page)
	{
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.currentPageName;  
        return this.currentTable.GetColCnt();   
	};

	instanceProto.GetRowCnt = function (page)
	{
        if (page != null)
        {
            this.TurnPage(page);
        }
        this.atPage = this.currentPageName;  
        return this.currentTable.GetRowCnt();   
	}; 

	instanceProto.TableToString = function (page)
	{
        if (page != null)
        {
            this.TurnPage(page);
        }
        return this.currentTable.ToString();   
	};
	
	instanceProto.saveToJSON = function ()
	{
	    var page, tables={};
	    for (page in this.tables)	   
        {
            this.TurnPage(page);
	        tables[page] = {"d":this.currentTable.table, 
			                "k":this.currentTable.keys, 
							"i":this.currentTable.items}
		}
		return { "d": tables,
                      "delimiter": this.strDelimiter,
                   };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    var tables = o["d"], table;
		var page;
		for (page in tables)
		{
		    this.TurnPage(page);
		    table = tables[page];
			this.currentTable.table = table["d"];
			this.currentTable.keys = table["k"];
			this.currentTable.items = table["i"];
		}
        
        this.strDelimiter = o["delimiter"];
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    var prop = [];
	    prop.push({"name": "Page", "value": this.dbg.pageName});
	    prop.push({"name": "Col", "value": this.dbg.colName});

        if (this.HasPage(this.dbg.pageName))
        {
	        var table = this.tables[this.dbg.pageName];
	        if (table.table[this.dbg.colName] != null)
	        {
	            var rows = table.items, r, d;
	            var i, cnt=rows.length;
	            for (i=0; i<cnt; i++)
	            {
	                r = rows[i];
	                d = table.At(this.dbg.colName,r);
	                prop.push({"name": "Row-"+r, "value": d});
	            }
	        }
	    }
		propsections.push({
			"title": this.type.name,
			"properties": prop
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		if (name == "Page")    // change page
		{
		    this.dbg.pageName = value;
		}
		else if (name == "Col")  // change col
		{		    
		    this.dbg.colName = value;
		}
		else if (name.substring(0,4) == "Row-") // set cell value
		{	        
		    if (this.HasPage(this.dbg.pageName))
		    {
		        var r = name.substring(4);
		        var table = this.tables[this.dbg.pageName];
		        if ((table.keys.indexOf(this.dbg.colName) != (-1)) && 
                    (table.items.indexOf(r) != (-1))                 )
                {
                    table.SetCell(this.dbg.colName, r, value);  
                }		       
		    }
	    }
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.ForEachCol = function ()
	{
        this.currentTable.ForEachCol();
		return false;
	};    

	Cnds.prototype.ForEachRowInCol = function (col)
	{
        this.currentTable.ForEachRowInCol(col);
		return false;
	}; 
    
	Cnds.prototype.ForEachPage = function ()
	{   
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		this.forPage = "";
        var tables = this.tables;
        var page;
        
		for (page in tables)
	    {
		    if (solModifierAfterCnds)
                this.runtime.pushCopySol(current_event.solModifiers);
                
            this.forPage = page;
            this.TurnPage(page);
		    current_event.retrigger();
		    	
            if (solModifierAfterCnds)
		        this.runtime.popSol(current_event.solModifiers);
		}        

		this.forPage = "";
		return false;        
	};    
    
	Cnds.prototype.ForEachRow = function ()
	{
        this.currentTable.ForEachRow();
		return false;
	};    

	Cnds.prototype.ForEachColInRow = function (row)
	{
        this.currentTable.ForEachColInRow(row);
		return false;
	}; 	

	Cnds.prototype.IsDataInCol = function (data, col_name)
	{
		if (!(this.currentTable.keys.indexOf(col_name) != (-1)))
		    return false;    
	    var table = this.currentTable.table;
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
		if (!(this.currentTable.items.indexOf(row_name) != (-1)))
		    return false;    
	    var table = this.currentTable.table;
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

    // cf_deprecated
	Cnds.prototype.IsKeyInCol = function (key)
	{
        return (this.currentTable.keys.indexOf(key) != (-1));     
	};
    // cf_deprecated

    // cf_deprecated    
	Cnds.prototype.IsKeyInRow = function (key)
	{
        return (this.currentTable.items.indexOf(key) != (-1));
	};
    // cf_deprecated    

	Cnds.prototype.IsCellValid = function (col, row)
	{
        return ((this.currentTable.keys.indexOf(col) != (-1)) && 
                (this.currentTable.items.indexOf(row) != (-1))   );
	};	

	Cnds.prototype.HasCol = function (col)
	{
        return (this.currentTable.keys.indexOf(col) != (-1));
	};	    

	Cnds.prototype.HasRow = function (row)
	{
        return (this.currentTable.items.indexOf(row) != (-1));
	};	     
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.LoadCSV = function (csv_string)
	{         
        this.currentTable._parsing(csv_string);
	};
    
	Acts.prototype.SetCell = function (col, row, val)
	{
        this.currentTable.SetCell(col, row, val);       
	};
    
	Acts.prototype.Clear = function ()
	{
		 this.currentTable.Clear();
	};    
    
	Acts.prototype.ConvertRow = function (row, to_type)
	{
         this.currentTable.ConvertRow(row, to_type);
	};   
    
	Acts.prototype.TurnPage = function (page)
	{
         this.TurnPage(page);
	};
    
	Acts.prototype.StringToPage = function (JSON_string)
	{
        this.currentTable.JSONString2Page(JSON_string);
	};    
    
	Acts.prototype.StringToPage = function (JSON_string)
	{
        this.currentTable.JSONString2Page(JSON_string);
	};   
    
	Acts.prototype.AppendCol = function (col, init_value)
	{
        this.currentTable.AppendCol(col, init_value);
	}; 
    
	Acts.prototype.AppendRow = function (row, init_value)
	{
        this.currentTable.AppendRow(row, init_value);
	}; 
    
	Acts.prototype.RemoveCol = function (col)
	{
        if (typeof (col) === "number")
        {
            var cols = this.currentTable.keys;
            col = cols[col];
        }
        
        this.currentTable.RemoveCol(col);
	}; 
    
	Acts.prototype.RemoveRow = function (row)
	{
        if (typeof (row) === "number")
        {
            var rows = this.currentTable.items;
            row = rows[row];
        }  
        
        this.currentTable.RemoveRow(row);
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
	        this.currentTable.JSONString2Page(tables[page]);
	    }
	};
    
	Acts.prototype.SortCol = function (col, is_increasing)
	{
        this.currentTable.SortCol(col, is_increasing);
	};
    
	Acts.prototype.SortRow = function (row, is_increasing)
	{
        this.currentTable.SortRow(row, is_increasing);
	}; 
    
	Acts.prototype.SetCellAtPage = function (col, row, page, val)
	{
        this.TurnPage(page);
        this.currentTable.SetCell(col, row, val);       
	};
    
	Acts.prototype.AddToCell = function (col, row, val)
	{
        var value = this.Get(col, row) || 0;        
        this.currentTable.SetCell(col, row, value + val);       
	};
    
	Acts.prototype.AddToCellAtPage = function (col, row, page, val)
	{
        var value = this.Get(col, row, page) || 0;  
        this.TurnPage(page);
        this.currentTable.SetCell(col, row, value + val);       
	};

	Acts.prototype.ConvertCol = function (col, to_type)
	{
         this.currentTable.ConvertCol(col, to_type);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.At = function (ret, col, row, page, default_value)
	{  
        if (page != null)        
            this.TurnPage(page);  
        
        if (typeof (col) === "number")
        {
            var cols = this.currentTable.keys;
            col = cols[col];
        }
        if (typeof (row) === "number")
        {
            var rows = this.currentTable.items;
            row = rows[row];
        }        
        
        var value = this.Get(col, row, page);
        if (value == null)
            value = (default_value == null)? 0 : default_value;        
        ret.set_any(value);
	}; 
    
	Exps.prototype.CurCol = function (ret)
	{
		ret.set_string(this.currentTable.forCol);
	};
	
	Exps.prototype.CurRow = function (ret)
	{
		ret.set_string(this.currentTable.forRow);
	};
	
	Exps.prototype.CurValue = function (ret)
	{
		ret.set_any(this.currentTable.At( this.currentTable.forCol, this.currentTable.forRow ));
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
	
	Exps.prototype.Delimiter = function (ret)
	{ 
		ret.set_string(this.strDelimiter);
	}; 
	
	Exps.prototype.AllTalbesToString = function (ret)
	{ 
	    var page, table2string={};
	    for (page in this.tables)	    
	        table2string[page] = this.TableToString(page);        
		ret.set_string(JSON.stringify(table2string));
	};
	
	Exps.prototype.TableToCSV = function (ret)
	{ 
		ret.set_string(this.currentTable.ToCSVString());
	}; 	
	
	Exps.prototype.NextCol = function (ret, col)
	{ 
        if (col == null) 
            col = this.atCol;
        
        var cols = this.currentTable.keys;
        var idx = cols.indexOf(col);
        var next_col;
        if (idx !== -1)
            next_col = cols[idx+1];
        
		ret.set_string(next_col || "");
	}; 	
	
	Exps.prototype.PreviousCol = function (ret, col)
	{ 
        if (col == null) 
            col = this.atCol;
        
        var cols = this.currentTable.keys;
        var idx = cols.indexOf(col);
        var next_col;
        if (idx !== -1)
            next_col = cols[idx-1];
        
		ret.set_string(next_col || "");
	};
	
	Exps.prototype.NextRow = function (ret, row)
	{ 
        if (row == null) 
            row = this.atRow;
        
        var rows = this.currentTable.items;
        var idx = rows.indexOf(row);
        var next_row;
        if (idx !== -1)
            next_row = rows[idx+1];
        
		ret.set_string(next_row || "");
	}; 	
	
	Exps.prototype.PreviousRow = function (ret, row)
	{ 
        if (row == null) 
            row = this.atRow;
        
        var rows = this.currentTable.items;
        var idx = rows.indexOf(row);
        var next_row;
        if (idx !== -1)
            next_row = rows[idx-1];
        
		ret.set_string(next_row || "");
	};
}());

(function ()
{
    cr.plugins_.Rex_CSV.CSVKlass = function(plugin)
    {
        this.plugin = plugin;  
		this.table = {};
        this.keys = [];    // col name
        this.items = [];   // row name
        this.forCol = "";
        this.forRow = "";        
    };
    var CSVKlassProto = cr.plugins_.Rex_CSV.CSVKlass.prototype;
    
	CSVKlassProto.Clear = function()
	{        
        var key;
        for (key in this.table)
            delete this.table[key];
        this.keys.length = 0;
        this.items.length = 0;
	};  
    
	CSVKlassProto.ToString = function()
	{
        var save_data = {"table":this.table,
                         "keys":this.keys,
                         "items":this.items};
		return JSON.stringify(save_data);   
	};
    
	CSVKlassProto.JSONString2Page = function(JSON_string)
	{
        var save_data = JSON.parse(JSON_string);
        try
        {
	        this.table = save_data["table"];
            this.keys = save_data["keys"];
            this.items = save_data["items"];  
        }
        catch(err)  // compatible with older version
        {
            this.table = save_data;
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
            if (this.table[key] == null)
                this.table[key] = {};         
        }
	};
    
    CSVKlassProto._create_items = function(values)
	{
        var item_name = values.shift();
        var keys = this.keys;
        var key_cnt = this.keys.length;   
        var table = this.table;
        var i, v;
        for (i=0; i<key_cnt; i++)
        {
            v = this.plugin.getValue(values[i]);
            table[keys[i]][item_name] = v;        
        }
        this.items.push(item_name);
	}; 
    
	CSVKlassProto._parsing = function(csv_string)
	{
        if (csv_string == "")
            return;
                       
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
	    var cell;
	    cell = this.table[col];
	    if (cell == null)
        {
            log("[CSV] Expression:At - Can not find col index '" +col+"' in table.");
	        return null;
        }
	    cell = cell[row];
	    if (cell == null)
        {
            log("[CSV] Expression:At - Can not find row index " +row+" in table.");
	        return null;	 
        }
        return cell;   
	};
    
	CSVKlassProto.SetCell = function (col, row, val)
	{
	    var cell;
	    cell = this.table[col];
	    if (cell == null)
        {
            log("[CSV] Action:SetCell - Can not find col index " +col+" in table.");
	        return;
        }
	    cell = cell[row];
	    if (cell == null)
        {
            log("[CSV] Action:SetCell - Can not find row index " +row+" in table.");
	        return;	    
        }
        this.table[col][row] = val;        
	};
    
	CSVKlassProto.ConvertCol = function (col, to_type)
	{
        var handler = (to_type==0)? parseInt:
                                    parseFloat;
        var items = this.items;
        var item_cnt = items.length;
        var table = this.table;
        var i, val;
        for (i=0; i<item_cnt; i++)
        {
            val = table[col][items[i]];
            table[col][items[i]] = handler(val);        
        }                    
	};      
    
	CSVKlassProto.ConvertRow = function (row, to_type)
	{
        var handler = (to_type==0)? parseInt:
                                    parseFloat;
        var keys = this.keys;
        var key_cnt = keys.length;
        var table = this.table;
        var i, val;
        for (i=0; i<key_cnt; i++)
        {
            val = table[keys[i]][row];
            table[keys[i]][row] = handler(val);        
        }                    
	};     
    
	CSVKlassProto.AppendCol = function (col, init_value)
	{
        if (this.keys.indexOf(col) != (-1))
            return;
            
        var has_ref = false;
        if (this.keys.length > 0)
        {
            var ref_col = this.table[this.keys[0]];
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
                col_data[items[i]] = init_value;
        }        
        this.table[col] = col_data;
        this.keys.push(col);
	};
    
	CSVKlassProto.AppendRow = function (row, init_value)
	{
        if (this.items.indexOf(row) != (-1))
            return;
            
        var keys = this.keys;
        var key_cnt = keys.length;
        var table = this.table;
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

        delete this.table[col]; 
        this.keys.splice(col_index, 1);
	};
    
	CSVKlassProto.RemoveRow = function (row)
	{
        var row_index = this.items.indexOf(row);
        if (row_index == (-1))
            return;
            
        var keys = this.keys;
        var key_cnt = keys.length;
        var table = this.table;
        var i;
        for (i=0; i<key_cnt; i++)
        {
            delete table[keys[i]][row];        
        }   
        this.items.splice(row_index, 1);
	};
    
	CSVKlassProto.ForEachCol = function ()
	{   
        var current_frame = this.plugin.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
			    
		this.forCol = "";
        
        var keys = this.keys;
        var key_cnt = keys.length;
        var i;
		for (i=0; i<key_cnt; i++ )
	    {
            if (solModifierAfterCnds)
		        this.plugin.runtime.pushCopySol(current_event.solModifiers);
                
            this.forCol = keys[i];		        
		    current_event.retrigger();
		    	
            if (solModifierAfterCnds)
		    	this.plugin.runtime.popSol(current_event.solModifiers);
		}
        
		this.forCol = "";
	};

	CSVKlassProto.ForEachRowInCol = function (col)
	{
        var has_col_index = (this.keys.indexOf(col)!=(-1));
        if (!has_col_index)
        {
            log("[CSV] Condition:For each row in col - Can not find col index " + col+" in table.");
            return;	    
        }
        this.forCol = col;
            
        // current_cell is valid
        var current_frame = this.plugin.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();

		this.forRow = "";
        
        var items = this.items;
        var item_cnt = items.length;
        var i;
		for (i=0; i<item_cnt; i++ )
	    {
            if (solModifierAfterCnds)
		        this.plugin.runtime.pushCopySol(current_event.solModifiers);

            this.forRow = items[i];		        
		    current_event.retrigger();

            if (solModifierAfterCnds)
		    	this.plugin.runtime.popSol(current_event.solModifiers);
		}

		this.forRow = "";
	};   
	
	CSVKlassProto.ForEachRow = function ()
	{   
        var current_frame = this.plugin.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		this.forRow = "";
        
        var items = this.items;
        var item_cnt = items.length;
        var i;
		for (i=0; i<item_cnt; i++ )
	    {
            if (solModifierAfterCnds)
		        this.plugin.runtime.pushCopySol(current_event.solModifiers);
                
            this.forRow = items[i];		        
		    current_event.retrigger();
		    	
            if (solModifierAfterCnds)
		    	this.plugin.runtime.popSol(current_event.solModifiers);
	   }        
		this.forRow = "";
	}; 

	CSVKlassProto.ForEachColInRow = function (row)
	{
        var has_row_index = (this.items.indexOf(row)!=(-1));
        if (!has_row_index)
        {
            log("[CSV] Condition:For each row in col - Can not find row index "+row+" in table.");
            return; 	    
        }
        this.forRow = row;
            
        // current_cell is valid
        var current_frame = this.plugin.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		
		this.forCol = "";
        
        var keys = this.keys;
        var key_cnt = keys.length;
        var i;
        
		for (i=0; i<key_cnt; i++ )
	    {        
            if (solModifierAfterCnds)        
		        this.plugin.runtime.pushCopySol(current_event.solModifiers);
		        
		    this.forCol = keys[i];
		    current_event.retrigger();
		    	
            if (solModifierAfterCnds)                
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
 
    var _row_sort = function(col0, col1)
    {        
        var item0 = _sort_table[col0][_sort_row_name];
        var item1 = _sort_table[col1][_sort_row_name]; 
        return (item0 > item1) ? (_sort_is_increasing? 1:-1):
               (item0 < item1) ? (_sort_is_increasing? -1:1):
                                 0;
    };
    CSVKlassProto.SortCol = function (col, sortMode_)  // 0=a, 1=d, 2=la, 3=ld
    {
        var has_col_index = (this.keys.indexOf(col)!=(-1));
        if (!has_col_index)
        {
            log("[CSV] Action:Sort Col - Can not find col index " + col+" in table.");
            return;
        }
        
        var self=this;
        var sortFn = function (row0, row1)
        {
            var sortMode = sortMode_;
            var v0 =  self.table[col][row0];
            var v1 =  self.table[col][row1];
            if (sortMode > 1)  // 2=la, 3=ld
            {
                v0 = parseFloat(v0);
                v1 = parseFloat(v1);
                sortMode -= 2;
            }

            return (v0 > v1) ? (sortMode? -1:1):
                       (v0 < v1) ? (sortMode? 1:-1):
                                         0;
        }
        this.items.sort(sortFn);
    };
	    
    CSVKlassProto.SortRow = function (row, sortMode_)
    {
        var has_row_index = (this.items.indexOf(row)!=(-1));
        if (!has_row_index)
        {
            log("[CSV] Action:Sort Row - Can not find row index "+row+" in table.");
            return;        
        }
        var self=this;
        var sortFn = function (col0, col1)
        {
            var sortMode = sortMode_;
            var v0 = self.table[col0][row];
            var v1 = self.table[col1][row]; 
            if (sortMode > 1)  // 2=la, 3=ld
            {
                v0 = parseFloat(v0);
                v1 = parseFloat(v1);
                sortMode -= 2;
            }

            return (v0 > v1) ? (sortMode? -1:1):
                   (v0 < v1) ? (sortMode? 1:-1):
                                         0;
        }
        this.keys.sort(sortFn); 
    };  
    
    var dump_lines = [];
    CSVKlassProto.ToCSVString = function ()
    {
        var strDelimiter = this.plugin.strDelimiter;
        var isEvalMode = this.plugin.isEvalMode;
        
        // first line = col name        
        var l = "";
        var k, kcnt = this.keys.length;        
        for (k=0; k<kcnt; k++)
        {
            l += (strDelimiter + cell_string_get(this.keys[k], false, strDelimiter));
        }
        dump_lines.push(l);
        
        // other lines
        var i, icnt = this.items.length;
        for (i=0; i<icnt; i++)
        {
            l = cell_string_get(this.items[i], false, strDelimiter);
            for (k=0; k<kcnt; k++)
            {
                l += (strDelimiter + cell_string_get(this.table[this.keys[k]][this.items[i]], isEvalMode, strDelimiter));
            }
            dump_lines.push(l);
        }
        
        var csvString = dump_lines.join("\n");
        dump_lines.length = 0;
        return csvString;
    };  
    
    var cell_string_get = function (value_, isEvalMode, strDelimiter)
    {
        if (typeof(value_) == "number")
            value_ = value_.toString();
        else
        {
            if (isEvalMode)
                value_ = '"' + value_ + '"';
                
            if (strDelimiter == null)
                strDelimiter = ",";
                
            var need_add_quotes = (value_.indexOf(strDelimiter) != (-1)) ||
                                  (value_.indexOf("\n") != (-1));
            // replace " to ""
            if (value_.indexOf('"') != (-1))
            {
                var re = new RegExp('"', 'g');
                value_ = value_.replace(re, '""');
                need_add_quotes = true;
            }
            
            // add ".." in these cases
            if ( need_add_quotes)
            {
                value_ = '"' + value_ + '"';
            }
        }
        
        return value_;
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