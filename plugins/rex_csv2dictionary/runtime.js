// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_CSV2Dictionary = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_CSV2Dictionary.prototype;
		
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
        this.strDelimiter = this.properties[0];
        this.is_eval_mode = (this.properties[1] == 1);
	    this.exp_CurKey = "";
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
	
	instanceProto.saveToJSON = function ()
	{
		return { "delimiter": this.strDelimiter 
                     };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.strDelimiter = o["delimiter"];
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
   
	Acts.prototype.SetDelimiter = function (s)
	{
        this.strDelimiter = s;
	};   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	Cnds.prototype.ForEachCell = function (csv_string)
	{
	    var table = CSVToArray(csv_string, this.strDelimiter);
		var i, cnt = table.length;
		if (cnt == 0)
		    return false;			
	    
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
			
	    var entry, v;
        if (solModifierAfterCnds)
        {
		    for (i=0; i<cnt; i++ )
	        {
                this.runtime.pushCopySol(current_event.solModifiers);
                	            
	            entry = table[i];
	            this.exp_CurKey = entry[0];
	            this.exp_CurValue = this.value_get(entry[1]);
		    	current_event.retrigger();
		    	
		    	this.runtime.popSol(current_event.solModifiers);		    	
		    }	
	    }
	    else
	    {
		    for (i=0; i<cnt; i++ )
	        {         
	            entry = table[i];
	            this.exp_CurKey = entry[0];
	            this.exp_CurValue = this.value_get(entry[1]);
	                               
		    	current_event.retrigger();
		    }	        
	    }

		return false;
	};  
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.CSV2Dictionary = function (csv_string, dict_objs)
	{  
	    assert2(cr.plugins_.Dictionary, "[CSV2Dictionary] Error:No Dictionary object found.");
	    	    
        var dict_obj = dict_objs.getFirstPicked();
        var is_dict_inst = (dict_obj instanceof cr.plugins_.Dictionary.prototype.Instance);
        assert2(is_dict_inst, "[CSV2Dictionary] Error:Need an dictionary object.");

        var table = CSVToArray(csv_string, this.strDelimiter);        
		var i, cnt = table.length;
		if (cnt == 0)
		    return;	
		    
		var entry, k, v;
		var add_key = cr.plugins_.Dictionary.prototype.acts.AddKey;
		for (i=0; i<cnt; i++)
		{
		    entry = table[i];
		    k = entry[0];
		    v = this.value_get(entry[1]);
		    add_key.apply(dict_obj, [k, v]);
		}
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.CurKey = function (ret)
	{
		ret.set_string(this.exp_CurKey);
	};

	Exps.prototype.CurValue = function (ret)
	{
		ret.set_any(this.exp_CurValue);
	};	
	
	Exps.prototype.Delimiter = function (ret)
	{ 
		ret.set_string(this.strDelimiter);
	};    	
}());