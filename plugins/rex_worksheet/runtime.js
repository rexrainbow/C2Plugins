// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_WorkSheet = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_WorkSheet.prototype;
		
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
        this.timeline = null;
        this.callback = null; 		
        this.timer = null; 
        this.instructions = [];
        this.offset = 0;
        this.current_cmd = {};
        this.pre_abs_time = 0;        
	};
    
	
	instanceProto.onDestroy = function ()
	{
        if (this.timer)
            this.timer.Remove();
	};    

	instanceProto.Start = function(instructions, offset)
	{
        this.pre_abs_time = 0;
        this.instructions = this._parsing(instructions);
        this.offset = offset;        
        this._start_cmd();
	}; 
    
	instanceProto.Run = function()
	{
	    var cur_cmd = this.current_cmd;
        var name = cur_cmd.cb_name, params = cur_cmd.cb_params;
        var has_rex_function = (this.callback != null);
        if (has_rex_function)
		    this.callback.CallFn(name, params);
        else    // run official function
        {
            var has_fnobj = this.timeline.RunCallback(name, params, true);
            assert2(has_fnobj, "Worksheet: Can not find callback oject.");
        }
        this._start_cmd();        
	};   
    
    var _INSTRUCTION_SORT = function(instA, instB)
    {
        var ta = instA.time;
        var tb = instB.time;
        return (ta < tb) ? -1 : (ta > tb) ? 1 : 0;
    }
    
    instanceProto._parsing = function(instructions_string)
	{
        var lines = instructions_string.split(/\r\n|\r|\n/);
        var instructions = [];
        var i,line,slices,comma_index;
        var line_length = lines.length;
        for (i=0; i<line_length; i++)
        {
            line = lines[i];
            if ((line.length==0) ||
                (line[0]==" ")   ||
                (line[0]=="/")     ) // "/" is a comment line
                continue;
                
            comma_index = line.indexOf(",");
            if (comma_index == -1)
                continue;
                
            // output
			var params = CSVToArray(line)[0];
			var delay_time = parseFloat(params.shift());
			var name = params.shift();
            instructions.push({time:delay_time,
			                   cb_name:name,
							   cb_params:params});                  
        }
        
        instructions.sort(_INSTRUCTION_SORT);
        
        return instructions;
	};
    
	instanceProto._start_cmd = function()
	{
        if (this.instructions.length>0)
        {
            this.current_cmd = this.instructions.shift();
            if (this.timer== null)
            {
                this.timer = this.timeline.CreateTimer(this, this.Run);
            }
            
            var next_abs_time = this.current_cmd.time + this.offset;
            this.timer.Start(next_abs_time - this.pre_abs_time);
            this.pre_abs_time = next_abs_time;
        }
        else
        {
            this.runtime.trigger(cr.plugins_.Rex_WorkSheet.prototype.cnds.OnCompleted, this);
        }
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
    
	Cnds.prototype.OnCompleted = function ()
	{
		return true;
	};  

	Cnds.prototype.IsRunning = function ()
	{
		return ((this.timer)? this.timer.IsActive():false);
	};      

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.Setup = function (timeline_objs, fn_objs)
	{  
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.timeline = timeline;        
        else
            alert ("Worksheet should connect to a timeline object");          
        
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Worksheet should connect to a function object");
	};    
    
    Acts.prototype.Start = function (instructions, offset)
	{   
        this.Start(instructions, offset);
	};   
    
    Acts.prototype.Pause = function ()
	{
        if (this.timer)
            this.timer.Suspend();  
	};

    Acts.prototype.Resume = function (timer_name)
	{
        if (this.timer)
            this.timer.Resume();
	};
    
    Acts.prototype.Stop = function ()
	{
        if (this.timer)
            this.timer.Remove();
	};  
    
    Acts.prototype.SetOffset = function (offset)
	{
        this.offset = offset;
	}; 
    
    Acts.prototype.Setup2 = function (timeline_objs)
	{  
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.timeline = timeline;        
        else
            alert ("Worksheet should connect to a timeline object");
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Offset = function (ret)
	{
	    ret.set_float( this.offset );
	};	
}());