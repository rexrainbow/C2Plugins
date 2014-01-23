// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_CSV2Array = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_CSV2Array.prototype;
		
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
	    this.is_eval_mode = (this.properties[0] == 1);
	    this.exp_CurX = 0;
	    this.exp_CurY = 0;
	    this.exp_CurValue = "";
	};
	
	instanceProto.value_get = function(v)
	{
	    if (v == null)
	        v = 0;
	    else if (this.is_eval_mode)
	        v = eval("("+v+")");
        
        return v;
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
   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	Cnds.prototype.ForEachCell = function (csv_string)
	{
	    var table = CSVToArray(csv_string);
		var y_cnt = table.length;
		var x_cnt = table[0].length;
		var i,j;
	    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
			    
        if (solModifierAfterCnds)
        {
		    for (j=0; j<y_cnt; j++ )
	        {
	            this.exp_CurY = j;	            
	            for (i=0; i<x_cnt; i++ )
	            {
                    this.runtime.pushCopySol(current_event.solModifiers);
                    
	                this.exp_CurX = i;
                    this.exp_CurValue = this.value_get(table[j][i]);                    
		    	    current_event.retrigger();
		    	    
		    	    this.runtime.popSol(current_event.solModifiers);
		        }
		    }	
	    }
	    else
	    {
		    for (j=0; j<y_cnt; j++ )
	        {
	            this.exp_CurY = j;	            
	            for (i=0; i<x_cnt; i++ )
	            {
	                this.exp_CurX = i;
                    this.exp_CurValue = this.value_get(table[j][i]);        
		    	    current_event.retrigger();
		        }
		    }	        
	    }

		return false;
	};  
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.CSV2Array = function (csv_string, array_objs, map_mode)
	{  
	    assert2(cr.plugins_.Arr, "[CSV2Array] Error:No Array object found.");
	    	    
        var array_obj = array_objs.getFirstPicked();
        var is_array_inst = (array_obj instanceof cr.plugins_.Arr.prototype.Instance);
        assert2(is_array_inst, "[CSV2Array] Error:Need an array object.");

        var table = CSVToArray(csv_string);        
		var x_cnt = table.length;
		var y_cnt = table[0].length;
		if (map_mode == 0)
		    cr.plugins_.Arr.prototype.acts.SetSize.apply(array_obj, [x_cnt,y_cnt,1]);
	    else
		    cr.plugins_.Arr.prototype.acts.SetSize.apply(array_obj, [y_cnt, x_cnt,1]);
        var i,j,v;
		var array_set = cr.plugins_.Arr.prototype.acts.SetXYZ;
		
		if (map_mode == 0)
		{
		    for(j=0;j<y_cnt;j++)
		    {
		        for(i=0;i<x_cnt;i++)
			    {
			        v = this.value_get(table[i][j]);
			        array_set.apply(array_obj, [i,j,0, v]);
			    }
		    }
        }	
        else
        {
		    for(j=0;j<y_cnt;j++)
		    {
		        for(i=0;i<x_cnt;i++)
			    {
			        v = this.value_get(table[i][j]);
			        array_set.apply(array_obj, [j,i,0, v]);
			    }
		    }
        }		
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.CurX = function (ret)
	{
		ret.set_int(this.exp_CurX);
	};
    
	Exps.prototype.CurY = function (ret)
	{
		ret.set_int(this.exp_CurY);
	};	
    
	Exps.prototype.CurValue = function (ret)
	{
		ret.set_string(this.exp_CurValue);
	};		
}());