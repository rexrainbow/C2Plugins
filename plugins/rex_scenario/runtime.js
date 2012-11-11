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
        this.callback_type = 0;		
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
		return this._scenario.is_running;
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
		{
            this.callback = callback;        
			this.callback_type = 1;	
	    }
        else
            alert ("Worksheet should connect to a function object");
	};  
    
    Acts.prototype.LoadCmds = function (csv_string)
	{  
        this._scenario.load(csv_string);
	};
    
    Acts.prototype.Start = function (offset, tag)
	{  
        this._scenario.start(offset, tag);    
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
    
    Acts.prototype.GoToTag = function (tag)
	{
        this._scenario.start(null, tag);    
	};     
        
	Acts.prototype.SetMemory = function (index, value)
	{
        this._scenario["Mem"][index] = value;
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

	Exps.prototype.LastTag = function(ret)
	{
		ret.set_string(this._scenario.get_last_tag());
	};
}());

(function ()
{
    cr.plugins_.Rex_Scenario.ScenarioKlass = function(plugin)
    {
        this.plugin = plugin;        
        this.cmd_table = new CmdQueueKlass();        
        // default is the same as worksheet        
		this.is_running = false;
        this.timer = null;           
        this.pre_abs_time = 0;
        this.offset = 0;  
        // for other commands   
        this._extra_cmd_handlers = {"wait":new CmdWAITKlass(this),
		                            "time stamp":new CmdTIMESTAMPKlass(this),
									"exit":new CmdEXITKlass(this),
									"tag":new CmdTAGKlass(this),
                                    };
        this.pendding_handler = new PenddingHandlerKlass();
		// variablies pool
		this["Mem"] = {};
    };
    var ScenarioKlassProto = cr.plugins_.Rex_Scenario.ScenarioKlass.prototype;
    
    // export methods
    ScenarioKlassProto.load = function (csv_string)
    {        
	
        this.cmd_table.reset(CSVToArray(csv_string));
        var queue = this.cmd_table.queue;
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
   
        // remove invalid commands
        cnt = invalid_cmd_indexs.length;
        if (cnt != 0)
        {   
            invalid_cmd_indexs.reverse(); 
            for (i=0;i<cnt;i++)
                queue.splice(invalid_cmd_indexs[i],1);
        }

		// remove empty cell
        cnt = queue.length;
		var cell_cnt = queue[0].length;
        var cmd_pack, j;
        for (i=0;i<cnt;i++)
        {
            cmd_pack = queue[i];
            for(j=0;j<cell_cnt;j++)
			{
			    if (cmd_pack[j] == "")
				    break;
			}
			if (j<cell_cnt)
			    cmd_pack.splice(j, cell_cnt-j)
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
    
    ScenarioKlassProto.start = function (offset, tag)
    {
	    this.is_running = true;
        this._reset_abs_time();
		if (offset != null)
            this.offset = offset;
        if (this.timer == null)
            this.timer = this.plugin.timeline.CreateTimer(this, this._execute_fn);
        else
            this.timer.Remove();  // stop timer
        this.cmd_table.reset();
		var valid_tag = true;
		if (tag != "")
		    valid_tag = this._extra_cmd_handlers["tag"].goto_tag(tag);
		if (valid_tag)
            this._run_next_cmd();
    };
    
    ScenarioKlassProto.run_pendding_handler = function (name, args)
    {      
        this.pendding_handler.run(name, args);
    };    

    ScenarioKlassProto.get_last_tag = function ()
    {      
        return this._extra_cmd_handlers["tag"].last_tag;
    };    	
    // internal methods
    ScenarioKlassProto._reset_abs_time = function ()
    {      
		this.pre_abs_time = 0;
    };
	
    ScenarioKlassProto._run_next_cmd = function ()
    {      
        var cmd_pack = this.cmd_table.get();
        if ((cmd_pack == null) && (this.cmd_table.queue != null))
        {
            this._exit();
            return;
        }
        var cmd = cmd_pack[0];
        if (!isNaN(cmd))
            this._on_delay_execution_command(cmd_pack);
        else  // might be other command
            this._extra_cmd_handlers[cmd.toLowerCase()].on_executing(cmd_pack);
    }; 
	
    ScenarioKlassProto._exit = function ()
    {      
        this.is_running = false;
		this.pendding_handler.clean();
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnCompleted, inst);
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
		var fn_name=cmd_pack[1];
		var fn_params=[];
		fn_params.length = cmd_pack.length - 2;
        // eval parameters
        var param_cnt=fn_params.length, i, param;
        for (i=0;i<param_cnt;i++)
        {
            param = cmd_pack[i+2];
            if (param != "")
			{
			    var code_string = "function(scenario)\
				{\
				    var MEM = scenario.Mem;\
				    return "+param+"\
				}";
				var fn = eval("("+code_string+")");
                param = fn(this);
		    }
            fn_params[i] = param;
        }
        this.timer.SetCallbackArgs([fn_name, fn_params]);
        this.timer.Start(deltaT);
	};  
    
	ScenarioKlassProto._execute_fn = function(name, params)
	{
	    var plugin = this.plugin;
	    if (plugin.callback_type == 1)    // compatible to rex_function
		    plugin.callback.CallFn(name, params);
		else
			plugin.timeline.RunCallback(name, params);
		this._run_next_cmd();
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
	
    //PenddingHandlerKlass
    var PenddingHandlerKlass = function()
    {
        this.name = null;
        this.thisArg = null;
    };
    var PenddingHandlerKlassProto = PenddingHandlerKlass.prototype; 

    PenddingHandlerKlassProto.add = function (name, thisArg)
	{
        this.name = name;
        this.thisArg = thisArg;
	}; 
    PenddingHandlerKlassProto.clean = function()
	{
        this.name = null;
        this.thisArg = null;
	}; 
    PenddingHandlerKlassProto.run = function (name, args)
    {      
        if (this.name != name)
            return;
        if (args == null)
            args = [];
        var callback = this.thisArg.on_pendding_handler;
        callback.apply(this.thisArg, args);
    };    	
	
    // extra command : WAIT
    var CmdWAITKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdWAITKlassProto = CmdWAITKlass.prototype;    
    CmdWAITKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdWAITKlassProto.on_executing = function(cmd_pack)
    {
        this.scenario.pendding_handler.add("wait", this);
    };
    CmdWAITKlassProto.on_pendding_handler = function()
    {
	    this.scenario.pendding_handler.clean();
        this.scenario._reset_abs_time();
        this.scenario._run_next_cmd();
    };    
	
    // extra command : TIMESTAMP
    var CmdTIMESTAMPKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdTIMESTAMPKlassProto = CmdTIMESTAMPKlass.prototype;    
    CmdTIMESTAMPKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdTIMESTAMPKlassProto.on_executing = function(cmd_pack)
    {
	    var mode = cmd_pack[1].toLowerCase().substring(0, 4);
		this.scenario.plugin.is_accT_mode = (mode == "acc");
        this.scenario._run_next_cmd();
    };
    CmdTIMESTAMPKlassProto.on_pendding_handler = function() {}; 	
	
    // extra command : EXIT
    var CmdEXITKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdEXITKlassProto = CmdEXITKlass.prototype;    
    CmdEXITKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdEXITKlassProto.on_executing = function(cmd_pack)
    {
        this.scenario._exit();
    };
    CmdEXITKlassProto.on_pendding_handler = function() {}; 	

    // extra command : TAG
    var CmdTAGKlass = function(scenario)
    {
        this.scenario = scenario;
		this.tag2index = {};
		this.last_tag = "";
    };
    var CmdTAGKlassProto = CmdTAGKlass.prototype;    
    CmdTAGKlassProto.on_parsing = function(index, cmd_pack) 
	{
	    this.tag2index[cmd_pack[1]] = index;
	};
    CmdTAGKlassProto.on_executing = function(cmd_pack)
    {	    
	    this.last_tag = cmd_pack[1];
	    this.scenario._reset_abs_time();
        this.scenario._run_next_cmd();
    };
    CmdTAGKlassProto.on_pendding_handler = function() {}; 	
	CmdTAGKlassProto.goto_tag = function(tag) 
	{
	    var index = this.tag2index[tag];
		var valid_tag = (index != null);
		if (valid_tag)
		    this.scenario.cmd_table.get(index);
		return valid_tag
	}; 
  	
    // template
    //var CmdHandlerKlass = function(scenario) {};
    //var CmdHandlerKlassProto = CmdHandlerKlass.prototype;    
    //CmdHandlerKlassProto.on_parsing = function(index, cmd_pack) {};
    //CmdHandlerKlassProto.on_executing = function(cmd_pack) {};
    //CmdHandlerKlassProto.on_pendding_handler = function() {};
    
    
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