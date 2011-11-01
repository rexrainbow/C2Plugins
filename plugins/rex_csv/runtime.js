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
		this.Clear();
        this.forCol = "";
        this.forRow = "";
        this.atCol = "";
        this.atRow = "";        
	};
    
	instanceProto.Clear = function()
	{
		this._table = {};
        this._current_entry = {};
        this.keys = [];
        this.key_cnt = 0;
        this.items = [];
        this.item_cnt = 0;   
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

    instanceProto._create_keys = function()
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
    
    instanceProto._create_items = function(values)
	{
        var item_name = values.shift();
        var keys = this.keys;
        var key_cnt = this.key_cnt;
        var table = this._table;
        var i;
        for (i=0; i<key_cnt; i++)
        {
            table[keys[i]][item_name] = values[i];        
        }
        this.items.push(item_name);
	}; 
    
	instanceProto._parsing = function(csv_string)
	{
        if (csv_string == "")
        {
            if (this.is_debug_mode)
                alert ("CSV string is empty.");  
            return;
        }
                       
        var read_array = CSVToArray(csv_string); 
        
        this.keys = read_array.shift();
        this.key_cnt = this.keys.length;        
        this._create_keys();
        var item_cnt = read_array.length;
        var i;
        for (i=0; i<item_cnt; i++)
        {
            this._create_items(read_array[i]);
        }
        this.item_cnt = item_cnt;        
	}; 

    instanceProto.at = function(col, row)
	{
        this.atCol = col;
        this.atRow = row;
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
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.ForEachCol = function ()
	{
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
		this.forCol = "";
        
        var keys = this.keys;
        var key_cnt = this.key_cnt;
        var i;
		for (i=0; i<key_cnt; i++ )
	    {
            this.forCol = keys[i];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.forCol = "";
		return false;
	};    

	cnds.ForEachRowInCol = function (col)
	{
        var current_entry = this._table[col];
        if ( current_entry == null )
        {
            if (this.is_debug_mode)
                alert ("Can not find col index '" +col+"' in table.");          
		    return false;        
        }
            
        // current_entry is valid
        var current_event = this.runtime.getCurrentEventStack().current_event;
		
		this.forRow = "";
        
        var items = this.items;
        var item_cnt = this.item_cnt;
        var i;
		for (i=0; i<item_cnt; i++ )
	    {
            this.forRow = items[i];
		    this.runtime.pushCopySol(current_event.solModifiers);
			current_event.retrigger();
			this.runtime.popSol(current_event.solModifiers);
		}

		this.forRow = "";
		return false;
	}; 
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
	acts.LoadCSV = function (csv_string)
	{         
        this._parsing(csv_string);
	};
    
	acts.SetEntry = function (col, row, val)
	{
        if (this._table[col] == null)
        {
            this._table[col] = {};
        }
        this._table[col][row] = val;        
	};
    
	acts.Clear = function ()
	{
		this.Clear();
	};    
    
	acts.ConvertType = function (row, to_type)
	{
        var handler = (to_type==0)? parseInt:
                                    parseFloat;
        var keys = this.keys;
        var key_cnt = this.key_cnt;
        var table = this._table;
        var i, val;
        for (i=0; i<key_cnt; i++)
        {
            val = table[keys[i]][row];
            table[keys[i]][row] = handler(val);        
        }                    
	};   
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
    
	exps.At = function (ret, col, row)
	{
        ret.set_any(this.at(col,row));
	}; 
    
	exps.CurCol = function (ret)
	{
		ret.set_string(this.forCol);
	};
	
	exps.CurRow = function (ret)
	{
		ret.set_string(this.forRow);
	};
	
	exps.CurValue = function (ret)
	{
		ret.set_any(this.at(this.forCol,this.forRow));
	}; 

	exps.AtCol = function (ret)
	{
		ret.set_string(this.atCol);
	};
	
	exps.AtRow = function (ret)
	{
		ret.set_string(this.atRow);
	};    
    
}());