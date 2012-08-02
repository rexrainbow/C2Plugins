// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Scenario = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Scenario.prototype;
		
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
        this.is_debug_mode = (this.properties[0] == 1);
        this.is_accT_mode = (this.properties[1] == 0);
        this._scenario = new cr.plugins_.Rex_Scenario.ScenarioKlass(this);        
        this.timeline = null;
        this.callback = null;       
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
        var timer = this._scenario.timer;
		return ((timer)? timer.IsActive():false);
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
    
    Acts.prototype.LoadCmds = function (csv_string)
	{  
        this._scenario.load(csv_string);
	};
    
    Acts.prototype.Start = function (offset)
	{  
        this._scenario.start(offset);    
	};
    
    Acts.prototype.Pause = function ()
	{  
        var timer = this._scenario.timer;
        if (timer)
            timer.Suspend();  
	};    
    
    Acts.prototype.Resume = function ()
	{  
        var timer = this._scenario.timer;
        if (timer)
            timer.Resume();  
	}; 
    
    Acts.prototype.Stop = function ()
	{  
        var timer = this._scenario.timer;
        if (timer)
            timer.Remove();  
	};     
    
    Acts.prototype.SetOffset = function (offset)
	{
        this._scenario.offset = offset;
	}; 
    
    Acts.prototype.Continue = function ()
	{
        this._scenario.run_pendding_handler("wait");
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());

(function ()
{
    cr.plugins_.Rex_Scenario.ScenarioKlass = function(plugin)
    {
        this.plugin = plugin;        
        this._cmd_queue = new CmdQueueKlass();        
        // default is the same as worksheet        
        this.timer = null;           
        this.pre_abs_time = 0;
        this.offset = 0;  
        // for other commands   
        this._extra_cmd_handlers = {"wait":new CmdWAITKlass(this),
                                    };
        this._pendding_handlers = {name:null,
                                   thisArg:null};                                    
    };
    var ScenarioKlassProto = cr.plugins_.Rex_Scenario.ScenarioKlass.prototype;
    
    // export methods
    ScenarioKlassProto.load = function (csv_string)
    {
        this._cmd_queue.reset(CSVToArray(csv_string));
        var queue = this._cmd_queue.queue;
        // check vaild
        var i, cmd;        
        var cnt = queue.length;
        var invalid_cmd_indexs = [];
        for (i=0;i<cnt;i++)
        {
            cmd = queue[i][0];
            if (isNaN(cmd) || (cmd == ""))  // might be other command
            {
                if (!(cmd.toLowerCase() in this._extra_cmd_handlers))
                {
                    // invalid command                
                    invalid_cmd_indexs.push(i);
                    if (this.plugin.is_debug_mode)
                        alert ("Scenario: line " +i+ " = '"+cmd+ "' is not a valid command");                   
                }
            }
        }        
   
        cnt = invalid_cmd_indexs.length;
        if (cnt != 0)    // remove invalid commands
        {   
            invalid_cmd_indexs.reverse(); 
            for (i=0;i<cnt;i++)
                queue.splice(invalid_cmd_indexs[i],1);
        }
        
        cnt = queue.length;
        var cmd_pack;
        for (i=0;i<cnt;i++)
        {
            cmd_pack = queue[i];
            cmd = cmd_pack[0];             
            if (isNaN(cmd) || (cmd == ""))  // might be other command
                this._extra_cmd_handlers[cmd].on_parsing(i, cmd_pack);
        }
        
    };
    
    ScenarioKlassProto.start = function (offset)
    {      
        this.pre_abs_time = 0;
        this.offset = offset;
        if (this.timer == null)
            this.timer = this.plugin.timeline.CreateTimer(this, this._execute_fn);       
        this._cmd_queue.reset();
        this._run_next_cmd();
    };
    
    ScenarioKlassProto.run_pendding_handler = function (name, args)
    {      
        if (this._pendding_handlers.name != name)
            return;
        if (args == null)
            args = [];
        var thisArg = this._pendding_handlers.thisArg;
        var callback = thisArg.on_pendding_handler;
        callback.apply(thisArg, args);
    };    

    // internal methods
    ScenarioKlassProto._run_next_cmd = function ()
    {      
        var cmd_pack = this._cmd_queue.get();
        if ((cmd_pack == null) && (this._cmd_queue.queue != null))
        {
            var inst = this.plugin;
            inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnCompleted, inst);
            return;
        }
        var cmd = cmd_pack[0];
        if (!isNaN(cmd))
            this._on_delay_execution_command(cmd_pack);
        else  // might be other command
            this._extra_cmd_handlers[cmd.toLowerCase()].on_executing(cmd_pack);
    }; 
    
	ScenarioKlassProto._on_delay_execution_command = function(cmd_pack)
	{
        var deltaT, cmd = parseFloat(cmd_pack[0]);
        if (this.plugin.is_accT_mode)
        {
            var next_abs_time = cmd + this.offset;
            deltaT = next_abs_time - this.pre_abs_time;
            this.pre_abs_time = next_abs_time                
        }
        else
            deltaT = cmd;
             
        // get function  name and parameters
        var fn_pack = cmd_pack.slice(1);
        // eval parameters
        var param_cnt = fn_pack.length, i, param;
        for (i=1;i<param_cnt;i++)
        {
            param = fn_pack[i];
            if (param != "")
                param = eval("("+fn_pack[i]+")");
            fn_pack[i] = param;
        }
        this.timer.SetCallbackArgs(fn_pack);
        this.timer.Start(deltaT);
	};  
    
	ScenarioKlassProto._execute_fn = function()
	{
        var cb_obj = this.plugin.callback;
        cb_obj.CallFn.apply(cb_obj, arguments);       
        this._run_next_cmd();
	};     
    
    ScenarioKlassProto._add_pending_handler = function(name, thisArg)
	{
        this._pendding_handlers.name = name;
        this._pendding_handlers.thisArg = thisArg;
	};    
    // CmdQueueKlass
    var CmdQueueKlass = function(queue)
    {
        this.queue = null;
        this.reset(queue);
    };
    var CmdQueueKlassProto = CmdQueueKlass.prototype; 

    CmdQueueKlassProto.reset = function(queue)
    {
        this.current_index = -1;
        if (queue != null)
            this.queue = queue;
    };

    CmdQueueKlassProto.get = function(index)
    {
        if (index == null)
            index = this.current_index+1;
        var cmd = this.queue[index];
        this.current_index = index;
        return cmd;
    };
    
    // WAIT
    var CmdWAITKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdWAITKlassProto = CmdWAITKlass.prototype;    
    CmdWAITKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdWAITKlassProto.on_executing = function(cmd_pack)
    {
        this.scenario._add_pending_handler("wait", this);
    };
    CmdWAITKlassProto.on_pendding_handler = function()
    {
        this.scenario.pre_abs_time = 0;
        this.scenario._run_next_cmd();
    };    
    
    // template
    var CmdHandlerKlass = function(scenario) {};
    var CmdHandlerKlassProto = CmdHandlerKlass.prototype;    
    CmdHandlerKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdHandlerKlassProto.on_executing = function(cmd_pack) {};
    CmdHandlerKlassProto.on_pendding_handler = function() {};
    
    
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