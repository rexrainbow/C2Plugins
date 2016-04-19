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

	var FNTYPE_UK = 0;          // unknow 
	var FNTYPE_NA = 1;	        // not avaiable
	var FNTYPE_REXFNEX = 2;     // rex_functionext
    var FNTYPE_REXFN2 = 3;      // rex_function2
	var FNTYPE_OFFICIALFN = 4;  // official function
	var FNTYPE_REXFN = 5;       // rex_function    
    instanceProto.onCreate = function()
    {
        if (!this.recycled)
        {
            this._scenario = new cr.plugins_.Rex_Scenario.ScenarioKlass(this);
        }
        else
        {
            this._scenario.Reset();
        }
        
          
        this._scenario.is_debug_mode = (typeof(log) !== "undefined") && (this.properties[0] === 1);
        this._scenario.is_accT_mode = (this.properties[1] === 0);
        this._scenario.is_eval_mode = (this.properties[2] === 1);
        this._scenario.is_mustache_mode = (this.properties[4] === 1);
        this.delimiterCfg = null;        
        this.setDelimiter(this.properties[5], this.properties[6]);        
      
        this.timeline = null;  
        this.timelineUid = -1;    // for loading     
        
        // callback:      
        // rex_functionext or function
        this._fnobj = null;
        this._fnobj_type = null;
	    this._act_call_fn = null;
		this._exp_call = null;

        // sync timescale
        this.my_timescale = -1.0;     
        this.runtime.tickMe(this);        
		this.sync_timescale = (this.properties[3] === 1);      
        this.pre_ts = 1;        
                
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];
        /**END-PREVIEWONLY**/	
    };
    
	instanceProto.setDelimiter = function (leftDelimiter, rightDelimiter)
	{
        if (leftDelimiter === "")  leftDelimiter = "{{";
        if (rightDelimiter === "")  rightDelimiter = "}}";        
		if ((leftDelimiter === "{{") && (rightDelimiter === "}}"))
            this.delimiterCfg = null;
        else
            this.delimiterCfg = "{{=" + leftDelimiter + " " + rightDelimiter + "=}}";
	};    
    
	instanceProto.tick = function ()
	{
	    if (this.sync_timescale)
            this.sync_ts();
	};    
    
	instanceProto.sync_ts = function ()
	{
	    var ts = this.get_timescale();
	    if (this.pre_ts == ts)
	        return;
	    
        this._scenario.SetTimescale(ts);	        
	    this.pre_ts = ts;
	};    

	instanceProto.get_timescale = function ()
	{
	    var ts = this.my_timescale;
	    if (ts == -1)
	        ts = 1;	    
	    return ts;
	};      
    
	instanceProto.onDestroy = function ()
	{
        this._scenario.onDestroy();
	};     
    
    instanceProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Scenario: Can not find timeline oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_TimeLine.prototype.Instance)
            {
                this.timeline = inst;
                return this.timeline;
            }
        }
        assert2(this.timeline, "Scenario: Can not find timeline oject.");
        return null;	
    };
    
    // ---- callback ----    
	instanceProto.setup_callback = function (raise_assert_when_not_fnobj_avaiable, fn_type)
	{
        if (fn_type == null)
        {         
            // do nothing
        }
        else
        {
		    this._fnobj_type = FNTYPE_UK;
            // seek function object
	        switch (fn_type)
		    {
		    case FNTYPE_REXFNEX:     // rex_functionext
		        this.cache_RexFnExt();
		    	break;
            case FNTYPE_REXFN2:      // rex_function2   
		        this.cache_RexFn2();
		    	break;                     
	        case FNTYPE_OFFICIALFN:  // official function
		        this.cache_Fn()
		    	break; 
		    }

        }
	}; 
	
	instanceProto.cache_RexFnExt = function()
	{
	    if (!cr.plugins_.Rex_FnExt)
	        return false;
	        
        var plugins = this.runtime.types;			
        var name, inst;
        
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_FnExt.prototype.Instance)
            {
                this._fnobj = inst;
                this._act_call_fn = cr.plugins_.Rex_FnExt.prototype.acts.CallFunction;
		        this._exp_call = cr.plugins_.Rex_FnExt.prototype.exps.Call;
			    this._fnobj_type = FNTYPE_REXFNEX;
                return true;
            }                                          
        }  
        return false;
    };
    
	instanceProto.cache_RexFn2 = function()
	{
	    if (!cr.plugins_.Rex_Function2)
	        return fasle;
	        
        var plugins = this.runtime.types;			
        var name, inst;
        
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
            {
                this._fnobj = inst;
                this._act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;
		        this._exp_call = cr.plugins_.Rex_Function2.prototype.exps.Call;
			    this._fnobj_type = FNTYPE_REXFN2;
                return true;
            }                                          
        }
        return false;
	};    
	
	instanceProto.cache_Fn = function()
	{
	    if (!cr.plugins_.Function)
	        return fasle;
	        
        var plugins = this.runtime.types;			
        var name, inst;
        
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Function.prototype.Instance)
            {
                this._fnobj = inst;
                this._act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                this._exp_call = cr.plugins_.Function.prototype.exps.Call;			
			    this._fnobj_type = FNTYPE_OFFICIALFN;
                return true;
            }                                          
        }
        return false;
	};  

    instanceProto.RunCallback = function(name, params)
    {
	    // use callback in timeline
	    if (this._fnobj_type == null)
	    {
            var has_fnobj = this._timeline_get().RunCallback(name, params, true);     
            assert2(has_fnobj, "Scenario: Can not find callback object.");
	    }
	    else
	    {	
	        switch (this._fnobj_type)
		    {
		    case FNTYPE_REXFNEX:     // rex_functionext
		        this._fnobj.CallFunction(name, params);
		    	break;
            case FNTYPE_REXFN2:      // rex_function2            
	        case FNTYPE_OFFICIALFN:  // official function
                this._act_call_fn.call(this._fnobj, name, params);
		    	break;	
		    }
	    }      

        return (this._fnobj_type != FNTYPE_NA);  
    };	
	
    instanceProto.Call = function(params)
    {
	    // params = [ ret, name, param0, param1, ... ]
	    // use callback in timeline
	    if (this._fnobj_type == null)
	    {
            var has_fnobj = this._timeline_get().Call(params, true);     
            assert2(has_fnobj, "Scenario: Can not find callback object.");            
	    }
	    else
	    {        
	        switch (this._fnobj_type)
		    {
		    case FNTYPE_REXFNEX:     // rex_functionext
            case FNTYPE_REXFN2:      // rex_function2
		    case FNTYPE_OFFICIALFN:  // official function 
		        this._exp_call.apply(this._fnobj, params);
		    	break;
		    }
	    }      

        return (this._fnobj_type != FNTYPE_NA);  
    };	  
    // ---- callback ----      
        
    instanceProto.value_get = function(v)
    {
        if (v == null)
            v = 0;
        else if (this.is_eval_mode)
            v = eval("("+v+")");
        
        return v;
    };	
    
    instanceProto.render = function (template, view)
	{
        if (this.delimiterCfg !== null)
            template = this.delimiterCfg + template;
        
        return window["Mustache"]["render"](template, view);
	};    

    instanceProto.saveToJSON = function ()
    { 
        return { "s": this._scenario.saveToJSON(),
                 "tlUid": (this.timeline != null)? this.timeline.uid : (-1),
                 "fnType": this._fnobj_type,      
                 };
    };
    
    instanceProto.loadFromJSON = function (o)
    {
        this._scenario.loadFromJSON(o["s"]);
        this.timelineUid = o["tlUid"];
    };     

    instanceProto.afterLoad = function ()
    {
        if (this.timelineUid === -1)
            this.timeline = null;
        else
        {
            this.timeline = this.runtime.getObjectByUID(this.timelineUid);
            assert2(this.timeline, "Scenario: Failed to find timeline object by UID");
        }		

        this._scenario.afterLoad();
        this.setup_callback(false, this._fnobj_type);
    }; 
    
    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections)
    {
        this.propsections.length = 0;
        this.propsections.push({"name": "Tag", "value": this._scenario.GetLastTag()});
        var debugger_info=this._scenario.debugger_info;
        var i,cnt=debugger_info.length;
        for (i=0;i<cnt;i++)
            this.propsections.push(debugger_info[i]);
        var k,mem=this._scenario["Mem"];
        for (k in mem)
            this.propsections.push({"name": "MEM-"+k, "value": mem[k]});
            
        propsections.push({
            "title": this.type.name,
            "properties": this.propsections
        });
    };
    
    instanceProto.onDebugValueEdited = function (header, name, value)
    {
        if (name == "Tag")    // change page
        {
            if (this._scenario.HasTag(value))
                this._scenario.Start(null, value);
            else			
                alert("Invalid tag "+value);
        }
        else if (name.substring(0,4) == "MEM-") // set mem value
        {	   
            var k = name.substring(4);
            this._scenario["Mem"][k] = value;
        }
    };
    /**END-PREVIEWONLY**/	
    
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
        return this._scenario.IsRunning;
    }; 
    
    Cnds.prototype.OnTagChanged = function ()
    {
        return true;
    }; 	  

    Cnds.prototype.IsTagExisted = function (tag)
    {
        return this._scenario.HasTag(tag);
    }; 
    
    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();
    
    Acts.prototype.Setup_deprecated = function (timeline_objs, fn_objs)
    {  
    };  
    
    Acts.prototype.LoadCmds = function (csv_string)
    {  
        this._scenario.Load(csv_string);
    };
    
    Acts.prototype.Start = function (offset, tag)
    {  
        this._scenario.Start(offset, tag);    
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
        this._scenario.Stop();
    };     
    
    Acts.prototype.SetOffset = function (offset)
    {
        this._scenario.Offset = offset;
    }; 
    
    Acts.prototype.CleanCmds = function ()
    {
        this._scenario.Clean();
    };  
    
    Acts.prototype.AppendCmds = function (csv_string)
    {  
        this._scenario.Append(csv_string);
    };
      
    Acts.prototype.Continue = function (key)
    {
        this._scenario.Resume(key);
    };
    
    Acts.prototype.GoToTag = function (tag)
    {
        this._scenario.Start(null, tag);    
    };     
        
    Acts.prototype.SetMemory = function (index, value)
    {
        this._scenario["Mem"][index] = value;
    };
        
    Acts.prototype.StringToMEM = function (JSON_string)
    {	
        this._scenario["Mem"] = JSON.parse(JSON_string);;
    };
    
    Acts.prototype.SetupTimeline = function (timeline_objs)
    {  
        var timeline = timeline_objs.instances[0];
        if ((cr.plugins_.Rex_TimeLine) && (timeline instanceof cr.plugins_.Rex_TimeLine.prototype.Instance))
            this.timeline = timeline;        
        else
            alert ("Scenario should connect to a timeline object");
    };
    
    Acts.prototype.SetupCallback = function (callback_type)
	{	
        var plugins = this.runtime.types;
        var name, inst;
        if (callback_type === 0)
        {
            if(!cr.plugins_.Function)
                return;
                
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Function.prototype.Instance)
                {		
				    this.callback_type = FNTYPE_OFFICIALFN;
                    this.callback = inst;
                    this.act_call_fn = cr.plugins_.Function.prototype.acts.CallFunction;
                    this.exp_call = cr.plugins_.Function.prototype.exps.Call;                    
                    return;
                }                                          
            }
        }
        else if (callback_type === 1)
        {
            if (!cr.plugins_.Rex_Function2)
                return;   
                
            for (name in plugins)
            {
                inst = plugins[name].instances[0];
                if (inst instanceof cr.plugins_.Rex_Function2.prototype.Instance)
                {
				    this.callback_type = FNTYPE_REXFN2;
                    this.callback = inst;
                    this.act_call_fn = cr.plugins_.Rex_Function2.prototype.acts.CallFunction;
                    this.exp_call = cr.plugins_.Rex_Function2.prototype.exps.Call;                     
                    return;
                }                                          
            }                
        }
	};	
    
    Acts.prototype.SetDelimiters = function (leftDelimiter, rightDelimiter)
	{        
        this.setDelimiter(leftDelimiter, rightDelimiter);
	};        
    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.LastTag = function(ret)
    {
        ret.set_string(this._scenario.GetLastTag());
    };
    
    Exps.prototype.Mem = function(ret, index)
    {
        var val = (this._scenario["Mem"].hasOwnProperty(index))?
                  this._scenario["Mem"][index]: 0;
        ret.set_any(val);
    };   
    
    Exps.prototype.MEMToString = function(ret)
    {
        ret.set_string(JSON.stringify(this._scenario["Mem"]));
    };  	
     
}());

(function ()
{
    cr.plugins_.Rex_Scenario.ScenarioKlass = function(plugin)
    {
        this.plugin = plugin;     
        this.is_debug_mode = true;
        this.is_mustache_mode = false;
        this.is_eval_mode = true;          
        this.is_accT_mode = false;
        this.cmd_table = new CmdQueueKlass(this);        
        // default is the same as worksheet 
        // -status-
        this.IsRunning = false;
        this.is_pause = false;
        // --------
        this.timer = null;      
        this.pre_abs_time = 0;
        this.Offset = 0;  
        // for other commands   
        this._extra_cmd_handlers = {"wait":new CmdWAITKlass(this),
                                    "time stamp":new CmdTIMESTAMPKlass(this),
                                    "exit":new CmdEXITKlass(this),
                                    "tag":new CmdTAGKlass(this),									
                                    "goto":new CmdGOTOKlass(this),
                                    "if":new CmdIFKlass(this),
                                    "else if": new CmdELSEIFKlass(this),
                                    "else": new CmdELSEKlass(this),
                                    "end if":new CmdENDIFKlass(this),
                                    };
        // variablies pool
        this["Mem"] = {};		
        this.timer_save = null;
        
        /**BEGIN-PREVIEWONLY**/
        this.debugger_info = [];
        /**END-PREVIEWONLY**/	
    };
    var ScenarioKlassProto = cr.plugins_.Rex_Scenario.ScenarioKlass.prototype;

    // export methods
	ScenarioKlassProto.Reset = function ()
	{         
        //this.cmd_table = new CmdQueueKlass(this);        
        this.Clean();
       
        // -status-
        this.IsRunning = false;
        this.is_pause = false;
        // --------
        //this.timer = null;        
            
        this.pre_abs_time = 0;
        this.Offset = 0;  

        // this["Mem"] = {};
        for (var k in this["Mem"])
            delete this["Mem"][k];
            	
        this.timer_save = null;       
	};
	                      
	ScenarioKlassProto.onDestroy = function ()
	{       
        this.Clean();
	};
    
	ScenarioKlassProto.SetTimescale = function (ts)
	{       
        if (this.timer)
            this.timer.SetTimescale(ts);
	};       
	    
    ScenarioKlassProto.Load = function (csv_string)
    {        
        this.Clean();
        if (csv_string === "")
            return;
            
        var arr = CSVToArray(csv_string);        
        this.remove_invalid_commands(arr);
        this.parse_commands(arr);        
        this.cmd_table.Reset(arr);
    };
    
    ScenarioKlassProto.Append = function (csv_string)
    {        
        if (csv_string === "")
            return;
            
        var arr = CSVToArray(csv_string);        
        this.remove_invalid_commands(arr);
        this.parse_commands(arr);        
        this.cmd_table.Append(arr);
    };
        
    ScenarioKlassProto.Clean = function ()
    {        
        this.Stop();
            
        // reset all extra cmd handler
        for(var handler in this._extra_cmd_handlers)
            this._extra_cmd_handlers[handler].on_reset();

        this.cmd_table.Clean();
    };
    
    ScenarioKlassProto.remove_invalid_commands = function (queue)
    {
        var i, cmd, cnt = queue.length;              
        var invalid_cmd_indexs = [];
        for (i=0;i<cnt;i++)
        {
            cmd = queue[i][0];
            if (this.get_command_type(cmd) === null)
            {
                // invalid command                
                invalid_cmd_indexs.push(i);
                if (this.is_debug_mode)
                    log ("Scenario: line " +i+ " = '"+cmd+ "' is not a valid command");              
            }
        } 
   
        // remove invalid commands
        cnt = invalid_cmd_indexs.length;
        if (cnt != 0)
        {
            invalid_cmd_indexs.reverse(); 
            for (i=0; i<cnt; i++)
                queue.splice(invalid_cmd_indexs[i], 1);
        }        
    };  
    
    ScenarioKlassProto.get_command_type = function (cmd, no_eval)
    {
        if (cmd == "")
            return null;
            
        // number: delay command
        if (!isNaN(cmd))
            return parseFloat(cmd);
            
        // other command types
        if (this._extra_cmd_handlers.hasOwnProperty(cmd.toLowerCase()))
            return cmd;
        
        // eval command
        if (!this.is_eval_mode || no_eval)
            return null;
            
        try 
        {
            cmd = this.param_get(cmd);            
            return this.get_command_type(cmd, true);            
        }
        catch(err) 
        {
            return null;
        }
    };      
    
    ScenarioKlassProto.parse_commands = function (queue)
    {        
        var i, cnt = queue.length, cmd_pack, cmd;
        for (i=0;i<cnt;i++)
        {
            cmd_pack = queue[i];
            cmd = this.get_command_type(cmd_pack[0]);
            if (isNaN(cmd))  // might be other command
                this.cmd_handler_get(cmd).on_parsing(i, cmd_pack);
        }
    };          

    ScenarioKlassProto.Start = function (offset, tag)
    {
        this.IsRunning = true;
        this.is_pause = false;
        this._reset_abs_time();
        if (offset != null)
            this.Offset = offset;
        if (this.timer == null)
        {
            this.timer = this.plugin._timeline_get().CreateTimer(on_timeout);
            this.timer.plugin = this;
        }
        else
            this.timer.Remove();  // stop timer
        this.cmd_table.Reset();
        var index = this.cmd_handler_get("tag").tag2index(tag);
        if (index == null)
        {
            assert2(index, "Scenario: Could not find tag "+tag);
            return;
        }
        
        if (this.is_debug_mode)
            log ("Scenario: Start at tag: "+ tag + " , index = " + index);  
        this._run_next_cmd(index);
    }; 

    ScenarioKlassProto.Stop = function ()
    {        
        this.IsRunning = false;
        this.is_pause = false;
        if (this.timer)
            this.timer.Remove();    
    };    
    
    ScenarioKlassProto.cmd_handler_get = function (cmd_name)
    {
        return this._extra_cmd_handlers[cmd_name];
    };        

    ScenarioKlassProto.GetLastTag = function ()
    {      
        return this.cmd_handler_get("tag").last_tag;
    };  
    
    ScenarioKlassProto.HasTag = function (tag)
    {
        return this.cmd_handler_get("tag").HasTag(tag);
    };
              
    // internal methods
    ScenarioKlassProto._reset_abs_time = function ()
    {      
        this.pre_abs_time = 0;
    };
    
    ScenarioKlassProto._run_next_cmd = function (index)
    {     
        var is_continue = true;
        var cmd_pack, cmd;
        while (is_continue)
        {
            cmd_pack = this.cmd_table.get(index);
            index = null;
            if ((cmd_pack == null) && (this.cmd_table.queue != null))
            {
                this._exit();
                return;
            }
            cmd = this.get_command_type(cmd_pack[0]);
            if (!isNaN(cmd))
                is_continue = this._on_delay_execution_command(cmd, cmd_pack);
            else  // might be other command
                is_continue = this.cmd_handler_get(cmd.toLowerCase()).on_executing(cmd_pack);
        }
    }; 
    ScenarioKlassProto.table_index_set = function (index)
    {      
        this.cmd_table.current_index = index - 1;
    };
    
    ScenarioKlassProto._exit = function ()
    {      
        if (this.is_debug_mode)
            log ("Scenario: Scenario finished");  
            
        this.IsRunning = false;
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnCompleted, inst);
    };
    
    ScenarioKlassProto.pause = function ()
    {
        this.is_pause = true;
    };
    ScenarioKlassProto.Resume = function(key)
    {
        if (!this.IsRunning)
            return;            
        if (!this.is_pause)
            return;
            
        var is_unlock = this.cmd_handler_get("wait").unlock(key);
        if (!is_unlock)
            return;
        this.is_pause = false;
        this._reset_abs_time();
        this._run_next_cmd();
    };
    ScenarioKlassProto.on_tag_changed = function()
    {
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnTagChanged, inst);
    };
    ScenarioKlassProto._on_delay_execution_command = function(delayT_, cmd_pack)
    {
        var deltaT;
        if (this.is_accT_mode)
        {
            var next_abs_time = delayT_ + this.Offset;
            deltaT = next_abs_time - this.pre_abs_time;
            this.pre_abs_time = next_abs_time                
        }
        else
            deltaT = delayT_;

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
                param = this.param_get(param);
            }
            fn_params[i] = param;
        }
        if (deltaT == 0)
        {
            this.execute_c2fn(fn_name, fn_params);
        }
        else
        {
            this.timer._cb_name = fn_name;
            this.timer._cb_params = fn_params;
            this.timer.Start(deltaT);
        }
        return (deltaT == 0);  // is_continue
    }; 
       
    // expression:Call in function object
    var fake_ret = {value:0,
                    set_any: function(value){this.value=value;},
                    set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	                          
                   };    
    var _params = [];
    var _thisArg = null;
    ScenarioKlassProto["_getvalue_from_c2fn"] = function()
    {
        // prepare arguments
        _params.length = 0;
        _params.push(fake_ret);
        var i, cnt=arguments.length;
        for (i=0; i<cnt; i++)
            _params.push(arguments[i]);
            
        // call "exp:Call"
        _thisArg.plugin.Call(_params);
        return fake_ret.value;
    };	
    
    // expression:Call in function object	
    var re = new RegExp("\n", "gm");
    ScenarioKlassProto.param_get = function(param)
    {
        //debugger
        
        if (this.is_mustache_mode)            
            param = this.plugin.render(param, this["Mem"]);
        
        if (this.is_eval_mode)
        {
            param = param.replace(re, "\\n");    // replace "\n" to "\\n"
            var code_string = "function(scenario)\
            {\
                var MEM = scenario.Mem;\
                var Call = scenario['_getvalue_from_c2fn'];\
                return "+param+"\
            }";
            _thisArg = this;
                            
            if (this.is_debug_mode)
            {
                var fn = eval("("+code_string+")");
                param = fn(this);
            }
            else  // ignore error
            {
                try
                {
                    var fn = eval("("+code_string+")");
                    param = fn(this);                    
                }
                catch (e) 
                {
                    param = 0;
                }
            }
        }
        else
        {
            if (!(isNaN(param)))
                param = parseFloat(param);
        }
        return param;
    };	 
    
    ScenarioKlassProto.execute_c2fn = function(name, params)
    {
        /**BEGIN-PREVIEWONLY**/
        var debugger_info=this.debugger_info;
        debugger_info.length = 0;
        debugger_info.push({"name": "Function name", "value": name});
        var i, cnt=params.length;
        for (i=0;i<cnt;i++)
            debugger_info.push({"name": "Parameter "+i, "value": params[i]});
        /**END-PREVIEWONLY**/	
        
        if (this.is_debug_mode)
            log ("Scenario: "+name+":"+params.toString());  
        this._execute_c2fn(name, params);
    };
    
    ScenarioKlassProto._execute_c2fn = function(name, params)
    {
        this.plugin.RunCallback(name, params);
    };	   
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.delay_execute_c2fn(this._cb_name, this._cb_params);
    };
        
    ScenarioKlassProto.delay_execute_c2fn = function(name, params)
    {
        this.execute_c2fn(name, params);
        this._run_next_cmd();
    };
    
    ScenarioKlassProto.saveToJSON = function ()
    {    
        var timer_save = null;
        if (this.timer != null)
        {
            timer_save = this.timer.saveToJSON();
            timer_save["__cbargs"] = [this.timer._cb_name, this.timer._cb_params];  // compatiable
        }
        return { "q": this.cmd_table.saveToJSON(),
                 "isrun": this.IsRunning,
                 "isp": this.is_pause,
                 "tim" : timer_save,
                 "pa": this.pre_abs_time,	       
                 "off": this.Offset,
                 "mem": this["Mem"],
                 "CmdENDIF": this.cmd_handler_get("end if").saveToJSON(),
                };
    };
    ScenarioKlassProto.loadFromJSON = function (o)
    {    
        this.cmd_table.loadFromJSON(o["q"]); 
        this.IsRunning = o["isrun"];
        this.is_pause = o["isp"];
        this.timer_save = o["tim"];
        this.pre_abs_time = o["pa"];
        this.Offset = o["off"];
        this["Mem"] = o["mem"];
        if (o["CmdENDIF"])
            this.cmd_handler_get("end if").loadFromJSON(o["CmdENDIF"]);
    };	
    ScenarioKlassProto.afterLoad = function ()
    {
        if (this.timer_save != null)
        {
            var timeline = this.plugin._timeline_get();
            this.timer = timeline.LoadTimer(this.timer_save, on_timeout);
            this.timer.plugin = this;
            this.timer._cb_name = this.timer_save["__cbargs"][0];
            this.timer._cb_params = this.timer_save["__cbargs"][1];            
            this.timer_save = null;
        }
    };
    
    // CmdQueueKlass
    var CmdQueueKlass = function(scenario, queue)
    {
        this.scenario = scenario;
        this.queue = null;
        this.Reset(queue);
    };
    var CmdQueueKlassProto = CmdQueueKlass.prototype; 

    CmdQueueKlassProto.Reset = function(queue)
    {
        this.current_index = -1;
        if (queue)
            this.queue = queue;
    };

    CmdQueueKlassProto.Append = function(queue)
    {
        if (!queue)
            return;
            
        if (!this.queue)
            this.queue = [];
            
        var i, cnt=queue.length;
        for (i=0; i<cnt; i++)
        {
            this.queue.push(queue[i]);
        }
    };
    CmdQueueKlassProto.Clean = function()
    {
        this.current_index = -1;
        this.queue = null;
    };
    
    CmdQueueKlassProto.get = function(index)
    {
        if (index == null)
            index = this.current_index+1;
        var cmd = this.queue[index];
        if (this.scenario.is_debug_mode)
            log ("Scenario: Get command from index = "+index);  
                    
        this.current_index = index;
        return cmd;
    };
    CmdQueueKlassProto.saveToJSON = function ()
    {    
        return { "q": this.queue,
                 "i": this.current_index,
                };
    };
    CmdQueueKlassProto.loadFromJSON = function (o)
    {    
        this.queue = o["q"];
        this.current_index = o["i"];  
        
        if (this.scenario.is_debug_mode)
            log ("Scenario: Load, start at index = "+this.current_index);  
    }; 	
    
    // extra command : WAIT
    var CmdWAITKlass = function(scenario)
    {
        this.locked = null;
        this.scenario = scenario;
    };
    var CmdWAITKlassProto = CmdWAITKlass.prototype;    
    CmdWAITKlassProto.on_reset = function() {};
    CmdWAITKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdWAITKlassProto.on_executing = function(cmd_pack)
    {
        var locked = cmd_pack[1];
        if (locked != null)
        {
            locked = this.scenario.param_get(locked);
            this.locked = locked;
        }    
        else
        {    
            locked = "";
            this.locked = null;
        }   
        
        /**BEGIN-PREVIEWONLY**/
        var debugger_info=this.scenario.debugger_info;
        debugger_info.length = 0;
        debugger_info.push({"name": "WAIT", "value": locked});	
        /**END-PREVIEWONLY**/	
        
        if (this.scenario.is_debug_mode)                    
            log ("Scenario: WAIT "+ locked);        
            
        this.scenario.pause();
        return false;  // is_continue
    }; 
    CmdWAITKlassProto.unlock = function(key) 
    {
        if (key == null)   // null could unlock all
            return true;
        
        return (key == this.locked)
    };
    
    // extra command : TIMESTAMP
    var CmdTIMESTAMPKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdTIMESTAMPKlassProto = CmdTIMESTAMPKlass.prototype;
    CmdTIMESTAMPKlassProto.on_reset = function() {};    
    CmdTIMESTAMPKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdTIMESTAMPKlassProto.on_executing = function(cmd_pack)
    {
        var mode = cmd_pack[1].toLowerCase().substring(0, 4);
        this.scenario.plugin.is_accT_mode = (mode == "acc");
        return true;  // is_continue
    };	
    
    // extra command : EXIT
    var CmdEXITKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdEXITKlassProto = CmdEXITKlass.prototype;   
    CmdEXITKlassProto.on_reset = function() {}; 
    CmdEXITKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdEXITKlassProto.on_executing = function(cmd_pack)
    {
        /**BEGIN-PREVIEWONLY**/
        var debugger_info=this.scenario.debugger_info;
        debugger_info.length = 0;
        debugger_info.push({"name": "EXIT", "value": ""});	
        /**END-PREVIEWONLY**/	
        
        if (this.scenario.is_debug_mode)
            log ("Scenario: EXIT"); 
        this.scenario._exit();
        return false;  // is_continue
    };

    // extra command : TAG    
    var CmdTAGKlass = function(scenario)
    {
        this.scenario = scenario;
        this._tag2index = {};
        this.last_tag = "";
    };
    var CmdTAGKlassProto = CmdTAGKlass.prototype;    
    CmdTAGKlassProto.on_reset = function() 
    {
        var t;
        for(t in this._tag2index)
            delete this._tag2index[t];
            
        this.last_tag = "";
    }; 
    CmdTAGKlassProto.on_parsing = function(index, cmd_pack) 
    {
        var tag = cmd_pack[1];
        this.check_tag(index, tag);
        this._tag2index[tag] = index;
    };
    CmdTAGKlassProto.on_executing = function(cmd_pack)
    {	   
        if (this.scenario.is_debug_mode)
            log ("Scenario: TAG "+cmd_pack[1]); 
            
        this.last_tag = cmd_pack[1];
        this.scenario._reset_abs_time();
        this.scenario.on_tag_changed();
        return true;  // is_continue
    };
    CmdTAGKlassProto.check_tag = function(index, tag)
    {	
        // check if tag had not been repeated 
        var new_tag = (this._tag2index[tag] == null);
        assert2(new_tag, "Scenario: line "+index + " , Tag "+tag + " was existed.");
        
        // check if tag was not in if-block
        var CmdENDIF = this.scenario.cmd_handler_get("end if");
        var isnot_in_ifblock = !(CmdENDIF.is_in_ifblock());
        assert2(isnot_in_ifblock, "Scenario: line "+index + " , Tag "+tag + " is in if-block.");
    };    
    CmdTAGKlassProto.tag2index = function(tag)
    {	 
        var index = this._tag2index[tag];
        if ((tag == "") && (index == null))
            index = 0;
        return index;        
    };
    CmdTAGKlassProto.HasTag = function(tag)
    {	 
        return (this.tag2index(tag) != null);      
    };  	
    
    // extra command : GOTO    
    var CmdGOTOKlass = function(scenario)
    {
        this.scenario = scenario;
    };
    var CmdGOTOKlassProto = CmdGOTOKlass.prototype;    
    CmdGOTOKlassProto.on_reset = function() {}; 
    CmdGOTOKlassProto.on_parsing = function(index, cmd_pack) {};
    CmdGOTOKlassProto.on_executing = function(cmd_pack)
    {	   
        if (this.scenario.is_debug_mode)
            log ("Scenario: GOTO tag "+cmd_pack[1]); 
            
        var tag = this.scenario.param_get(cmd_pack[1]);
        var index = this.scenario.cmd_handler_get("tag").tag2index(tag);
        if (index == null)
        {
            assert2(index, "Scenario: Could not find tag "+tag);
            return;
        }
        this.scenario.table_index_set(index);        
        this.scenario._reset_abs_time();
        return true;  // is_continue
    };   
    
    var INDEX_NEXTIF = 2;
    var INDEX_ENDIF = 3;
    // extra command : IF
    var CmdIFKlass = function(scenario) 
    {
         this.scenario = scenario;
    };
    var CmdIFKlassProto = CmdIFKlass.prototype;   
    CmdIFKlassProto.on_reset = function() {};  
    CmdIFKlassProto.on_parsing = function(index, cmd_pack) 
    {
        var CmdENDIF = this.scenario.cmd_handler_get("end if");
        CmdENDIF.ifblock_enable(index);
        CmdENDIF.push_ifcmd(index, cmd_pack);
    };
    CmdIFKlassProto.on_executing = function(cmd_pack) 
    {
        if (this.scenario.is_debug_mode)
            log ("Scenario: IF "+cmd_pack[1]);
            
        var cond = this.scenario.param_get(cmd_pack[1]);
        var CmdENDIF = this.scenario.cmd_handler_get("end if");
        CmdENDIF.goto_end_flag = cond;
        if (cond)
        {
            // goto next line
            this.scenario._reset_abs_time();
            return true;  // is_continue    
        }
        else
        {
            // goto next if line , or end if line
            var index = cmd_pack[INDEX_NEXTIF];
            if (index == null)
                index = cmd_pack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line "+index);
            this.scenario.table_index_set(index);
            this.scenario._reset_abs_time();
            return true;  // is_continue 
        }
    };      
    
    // extra command : ELSE IF
    var CmdELSEIFKlass = function(scenario) 
    {
         this.scenario = scenario;
    };
    var CmdELSEIFKlassProto = CmdELSEIFKlass.prototype; 
    CmdELSEIFKlassProto.on_reset = function() {};     
    CmdELSEIFKlassProto.on_parsing = function(index, cmd_pack) 
    {
        var CmdENDIF = this.scenario.cmd_handler_get("end if");
        CmdENDIF.push_ifcmd(index, cmd_pack);
    };
    CmdELSEIFKlassProto.on_executing = function(cmd_pack) 
    {
        if (this.scenario.is_debug_mode)
            log ("Scenario: ELSE IF "+cmd_pack[1]);    
            
        // go to end
        var goto_end_flag = this.scenario.cmd_handler_get("end if").goto_end_flag;
        if (goto_end_flag)
        {
            var index = cmd_pack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line "+index);
            this.scenario.table_index_set(index);
            this.scenario._reset_abs_time();
            return true;  // is_continue 
        }	

        // test condition
        var cond = this.scenario.param_get(cmd_pack[1]);
        var CmdENDIF = this.scenario.cmd_handler_get("end if");
        CmdENDIF.goto_end_flag = cond;
        if (cond)
        {
            // goto next line
            this.scenario._reset_abs_time();
            return true;  // is_continue    
        }
        else
        {
            // goto next if line , or end if line
            var index = cmd_pack[INDEX_NEXTIF];
            if (index == null)
                index = cmd_pack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line "+index);
            this.scenario.table_index_set(index);
            this.scenario._reset_abs_time();
            return true;  // is_continue 
        }
    };
    
    // extra command : ELSE
    var CmdELSEKlass = function(scenario) 
    {
         this.scenario = scenario;
    };
    var CmdELSEKlassProto = CmdELSEKlass.prototype; 
    CmdELSEKlassProto.on_reset = function() {};            
    CmdELSEKlassProto.on_parsing = function(index, cmd_pack) 
    {
        var CmdENDIF = this.scenario.cmd_handler_get("end if");
        CmdENDIF.push_ifcmd(index, cmd_pack);
    };
    CmdELSEKlassProto.on_executing = function(cmd_pack) 
    {
        if (this.scenario.is_debug_mode)
            log ("Scenario: ELSE");        
            
        // go to end
        var goto_end_flag = this.scenario.cmd_handler_get("end if").goto_end_flag;
        if (goto_end_flag)
        {
            var index = cmd_pack[INDEX_ENDIF];
            assert2(index, "Scenario: Error at IF block, line "+index);
            this.scenario.table_index_set(index);
            this.scenario._reset_abs_time();
            return true;  // is_continue 
        }	

        // goto next line
        this.scenario._reset_abs_time();
        return true;  // is_continue  
    };    
        
    // extra command : ENDIF
    var CmdENDIFKlass = function(scenario) 
    {
        this.scenario = scenario;
        // on_parsing
        this.pendding_enable = false;
        this.pendding_cmds = [];
        // on_executing
        this.goto_end_flag = false;
    };
    var CmdENDIFKlassProto = CmdENDIFKlass.prototype; 
    CmdENDIFKlassProto.on_reset = function() 
    {
        this.pendding_cmds.length = 0;
        this.goto_end_flag = false;
    };          
    CmdENDIFKlassProto.on_parsing = function(index, cmd_pack) 
    {
        assert2(this.pendding_enable, "Scenario: Error at IF block, line "+index);
        var i, cnt=this.pendding_cmds.length;
        for (i=0; i<cnt; i++)
        {
            this.pendding_cmds[i][INDEX_ENDIF] = index;
        }
        this.pendding_cmds.length = 0;
        this.pendding_enable = false;        
    };
    CmdENDIFKlassProto.on_executing = function(cmd_pack) 
    {
        if (this.scenario.is_debug_mode)
            log ("Scenario: END IF ");    
            
        this.goto_end_flag = false;
        // goto next line
        this.scenario._reset_abs_time();
        return true;  // is_continue        
    };
    CmdENDIFKlassProto.ifblock_enable = function(index) 
    {       
        assert2(!this.pendding_enable, "Scenario: Error at IF block, line "+index);
        this.pendding_enable = true;
    }; 
    CmdENDIFKlassProto.is_in_ifblock = function() 
    {               
        return this.pendding_enable;
    };          
    CmdENDIFKlassProto.push_ifcmd = function(index, cmd_pack) 
    {        
        assert2(this.pendding_enable, "Scenario: Error at IF block, line "+index);
        cmd_pack.length = 4;    // [if , cond, next_if_line, end_if_line]
        cmd_pack[INDEX_NEXTIF] = null;
        cmd_pack[INDEX_ENDIF] = null;
        if (this.pendding_cmds.length >= 1)
        {
            // assign index of next if line
            var pre_cmd_pack = this.pendding_cmds[this.pendding_cmds.length - 1];
            pre_cmd_pack[INDEX_NEXTIF] = index;
        }
        this.pendding_cmds.push(cmd_pack);
    };  
    CmdENDIFKlassProto.saveToJSON = function ()
    {    
        return { "gef": this.goto_end_flag
                };
    };
    CmdENDIFKlassProto.loadFromJSON = function (o)
    {    
        this.goto_end_flag = o["gef"];
    }; 		
      
    // template
    //var CmdHandlerKlass = function(scenario) {};
    //var CmdHandlerKlassProto = CmdHandlerKlass.prototype;    
    //CmdHandlerKlassProto.on_reset = function() {};
    //CmdHandlerKlassProto.on_parsing = function(index, cmd_pack) {};
    //CmdHandlerKlassProto.on_executing = function(cmd_pack) {};
    
    
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