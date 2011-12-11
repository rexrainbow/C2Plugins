// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_FSM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_FSM.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
        this.logic = {};
        this.fn_obj = null;
        this.csv_obj = null;
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;        
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{      
	    this.is_debug_mode = this.properties[0];  
        this.activated = this.properties[1];
		var previous_state = "Off";		
		var current_state = this.properties[2];		
        current_state = (current_state!="")? current_state:"Off";	           
		// initial memory
		var mem = this.properties[3];
        mem = (mem!="")? jQuery.parseJSON(mem):{};      
        this.fsm = new cr.behaviors.Rex_FSM.FSMKlass(this, 
                                                     previous_state, current_state,
                                                     mem);         
	};  
    
	behinstProto.tick = function ()
	{
	};   
    
	behinstProto._load_logic = function (state_name, code_string)
	{
        this.type.logic[state_name] = eval("("+code_string+")");
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
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
    
	acts.CleanMemory = function ()
	{
        this.fsm["Mem"] = {};
	};  
        
	acts.SetMemory = function (index, value)
	{
        this.fsm["Mem"][index] = value;
	};

    acts.Request = function ()
	{
	    this.fsm.Request();
	};  

    acts.CSV2Logic = function (csv_string, code_format)
	{
        if (csv_string == "")
            return;
            
        var code_array = CSVToArray(csv_string);   
        var i, state_name, code_string;
        var state_len = code_array.length;
        for (i=1;i<state_len;i++)
        {
            state_name = code_array[i][0];        
            code_string = code_array[i][1];  
            //if (code_format == 1)
            this._load_logic(state_name, code_string);
        }  
	};

    acts.String2Logic = function (state_name, code_string, code_format)
	{
        if (code_string == "")
            return;
        this._load_logic(state_name, code_string);
	};
    
    acts.ConnectFn = function (fn_objs)
	{  
        var fn_obj = fn_objs.instances[0];
        if (fn_obj.check_name == "FUNCTION")
            this.type.fn_obj = fn_obj;        
        else
            alert ("Can not connect to a function object");
	};    
    
    acts.ConnectCSV = function (csv_objs)
	{  
        var csv_objs = csv_objs.instances[0];
        if (csv_objs.check_name == "FUNCTION")
            this.type.csv_objs = csv_objs;        
        else
            alert ("Can not connect to a csv object");
	};     
    
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.CurState = function (ret)
	{
	    ret.set_string(this.fsm["CurState"]);
	};	
	
	exps.PreState = function (ret)
	{
	    ret.set_string(this.fsm["PreState"]);
	};
	
    exps.Mem = function (ret, index)
	{
        var value = this.fsm["Mem"][index];
        if (value == null) 
        {
            value = 0;
            if (this.is_debug_mode) 
                alert ("Can not find index in memory '" + index + "'");
                
        }
	    ret.set_any(value);
	};	
}());

(function ()
{
    cr.behaviors.Rex_FSM.FSMKlass = function(plugin, 
                                             previous_state, current_state,
                                             mem)
    {
        this["_type"] = plugin.type; 
        
        this["PreState"] = previous_state;
        this["CurState"] = current_state;
        this["Mem"] = mem;

    };
    var FSMKlassProto = cr.behaviors.Rex_FSM.FSMKlass.prototype;
    
    FSMKlassProto.Request = function()
    {
        this["PreState"] = this["CurState"];
        var transfer_fn = this["_type"].logic[this["CurState"]];
        var new_state = transfer_fn(this, this["_type"].fn_obj, this["_type"].csv_obj);
        if (new_state != null)
            this["CurState"] = new_state;
    };
}());