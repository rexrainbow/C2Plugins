// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_bScenario = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_bScenario.prototype;
		
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
        this.timeline = null;  
        this.timelineUid = -1;    // for loading 	    
	};
    
    behtypeProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Scenario behavior: Can not find timeline oject.");
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
        assert2(this.timeline, "Scenario behavior: Can not find timeline oject.");
        return null;	
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
        if (!this.recycled)
        {
            this._scenario = new cr.behaviors.rex_bScenario.ScenarioKlass(this);
        }
        else
        {
            this._scenario.Reset();
        } 
        this._scenario.is_debug_mode = (typeof(log) !== "undefined") && (this.properties[0] == 1);
        this._scenario.is_accT_mode = (this.properties[1] == 0);
        this._scenario.is_eval_mode = (this.properties[2] == 1);
        
        // auto start command
        this.init_start = (this.properties[3] == 1);
        this.init_cmds = this.properties[4];
        this.init_offset = this.properties[5];
        this.init_tag = this.properties[6];
        this.init_repeat = this.properties[7];
        
        // sync timescale
		this.sync_timescale = (this.properties[8] == 1);      
        this.pre_ts = 1;        
        
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];
        /**END-PREVIEWONLY**/	
    };
	
	behinstProto.tick = function ()
	{
	    if (this.sync_timescale)
            this.sync_ts();
            
        if (this.init_start)
            this.run_init_cmd();
	};
    
	behinstProto.run_init_cmd = function ()
	{
	    this._scenario.Load(this.init_cmds, true);
	    this._scenario.Start(this.init_offset, this.init_tag, this.init_repeat); 	      
	    this.init_start = false; 
        this.init_cmds = null;
	};    
    
	behinstProto.sync_ts = function ()
	{
	    var ts = this.get_timescale();
	    if (this.pre_ts == ts)
	        return;
	    
        this._scenario.SetTimescale(ts);	        
	    this.pre_ts = ts;
	};    

	behinstProto.get_timescale = function ()
	{
	    var ts = this.inst.my_timescale;
	    if (ts == -1)
	        ts = 1;	    
	    return ts;
	};    
	
	behinstProto.onDestroy = function ()
	{
        this._scenario.onDestroy();
	};     

    // -------- command --------    
    var funcStack = [];
    var funcStackPtr = -1;
    var isInPreview = false;	// set in onCreate
    
    function FuncStackEntry()
    {
        this.name = "";
        this.params = []; 
    };
    
    function pushFuncStack()
    {
        funcStackPtr++;
        
        if (funcStackPtr === funcStack.length)
            funcStack.push(new FuncStackEntry());
            
        return funcStack[funcStackPtr];
    };
    
    function getCurrentFuncStack()
    {
        if (funcStackPtr < 0)
            return null;
            
        return funcStack[funcStackPtr];
    };
    
    function getOneAboveFuncStack()
    {
        if (!funcStack.length)
            return null;
        
        var i = funcStackPtr + 1;
        
        if (i >= funcStack.length)
            i = funcStack.length - 1;
            
        return funcStack[i];
    };
    
    function popFuncStack()
    {
        assert2(funcStackPtr >= 0, "Popping empty function stack");
        
        funcStackPtr--;
    };

	behinstProto.run_command = function (name_, params_)
	{
        var fs = pushFuncStack();
        fs.name = name_.toLowerCase();
        cr.shallowAssignArray(fs.params, params_);

        this.runtime.trigger(cr.behaviors.rex_bScenario.prototype.cnds.OnCommand, this.inst);

        popFuncStack();	    
	};
    behinstProto.param_get = function (param_index_)
    {
        var fs = getCurrentFuncStack();
        if (!fs)
        {
            log("[Construct 2] Scenario behavior: used 'Param' expression when not in a command", "warn");
            return null;
        }
        
        var index_ = cr.floor(param_index_);
            
        if (index_ >= 0 && index_ < fs.params.length)
        {
            var value = fs.params[index_];
            if (value == null)
            {
                // warn 
                value = 0;
            }
            return value;
        }
        else
        {
            log("[Construct 2] Scenario behavior: in command '" + fs.name + "', accessed parameter out of bounds (accessed index " + index_ + ", " + fs.params.length + " params available)", "warn");
            return null;      
        }
        
    }; 	
	// -------- command --------    	    

    behinstProto.saveToJSON = function ()
    { 
        return { "s": this._scenario.saveToJSON(),
                 "tlUid": (this.timeline != null)? this.timeline.uid : (-1)
                 };
    };
    
    behinstProto.loadFromJSON = function (o)
    {
        this._scenario.loadFromJSON(o["s"]);
        this.timelineUid = o["tlUid"];
    };     

    behinstProto.afterLoad = function ()
    {
        if (this.timelineUid === -1)
            this.timeline = null;
        else
        {
            this.timeline = this.runtime.getObjectByUID(this.timelineUid);
            assert2(this.timeline, "Scenario behavior: Failed to find timeline object by UID");
        }		
        
        this._scenario.afterLoad();
    }; 
    
    /**BEGIN-PREVIEWONLY**/
    behinstProto.getDebuggerValues = function (propsections)
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
    
    behinstProto.onDebugValueEdited = function (header, name, value)
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
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    
    Cnds.prototype.OnLoopEnd = function ()
    {
        return true;
    };  

    Cnds.prototype.IsRunning = function ()
    {
        return this._scenario.is_running;
    }; 
    
    Cnds.prototype.OnTagChanged = function ()
    {
        return true;
    }; 	  

    Cnds.prototype.IsTagExisted = function (tag)
    {
        return this._scenario.HasTag(tag);
    }; 
    
	// command 
    Cnds.prototype.OnCommand = function (name_)
    {
        var fs = getCurrentFuncStack();
        
        if (!fs)
            return false;
        
        return cr.equals_nocase(name_, fs.name);
    }; 
    
    Cnds.prototype.CompareParam = function (param_index_, cmp_, value_)
    {
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            return false;
        return cr.do_cmp(param_value, cmp_, value_);
    };
    
    Cnds.prototype.TypeOfParam = function (param_index_, type_cmp)
    {        
        var param_value = this.param_get(param_index_);
        if (param_value == null)
            return false;
            
        var t = (type_cmp == 0)? "number":"string";        
        return (typeof(param_value) == t);
    };    
    
    Cnds.prototype.IsWaiting = function (key)
    {
        return this._scenario.isPaused(key);
    };     
    Cnds.prototype.OnWaitingStart = function (key)
    {
        return this._scenario.isPaused(key);
    }; 	  
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
    Acts.prototype.LoadCSVCmds = function (s, fmt)
    {  
        this._scenario.Load(s, fmt);
    };
    
    Acts.prototype.Start = function (offset, tag, repeat_count)
    {  
        if (repeat_count < 0)
            repeat_count = 1;
        this._scenario.Start(offset, tag, repeat_count);  
        
        if (this.sync_timescale)
            this.sync_ts();       		       
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
        this._scenario.offset = offset;
    }; 
    
    Acts.prototype.CleanCmds = function ()
    {
        this._scenario.Clean();
    };  
    
    Acts.prototype.AppendCmds = function (s, fmt)
    {  
        this._scenario.Append(s, fmt);
    };
    Acts.prototype.Continue = function (key)
    {
        this._scenario.resume(key);
    };
    
    //Acts.prototype.GoToTag = function (tag)
    //{
    //    this._scenario.Start(null, tag);    
    //};     
        
    Acts.prototype.SetMemory = function (index, value)
    {
        this._scenario["Mem"][index] = value;
    };
        
    Acts.prototype.StringToMEM = function (JSON_string)
    {	
        this._scenario["Mem"] = JSON.parse(JSON_string);
    };
    
    Acts.prototype.LoadJSONCmds = function (json_string)
    {  
        this._scenario.Load(csv_string, true);
    };       
    
    Acts.prototype.Setup2 = function (timeline_objs)
    {  
        var timeline = timeline_objs.instances[0];
        if ((cr.plugins_.Rex_TimeLine) && (timeline instanceof cr.plugins_.Rex_TimeLine.prototype.Instance))
            this.type.timeline = timeline;        
        else
            alert ("Scenario behavior should connect to a timeline object");
    };
    
    //////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

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
    
    // command 
    Exps.prototype.Param = function (ret, param_index_)
    {
        ret.set_any(this.param_get(param_index_));
    };

    Exps.prototype.PreviousTag = function(ret)
    {
        ret.set_string(this._scenario.GetPrevTag());
    };
    
    Exps.prototype.CurrentTag = Exps.prototype.LastTag;    
        
}());


(function ()
{
    cr.behaviors.rex_bScenario.ScenarioKlass = function(plugin)
    {
        this.plugin = plugin;     
        this.is_debug_mode = true;
        this.is_eval_mode = true;          
        this.is_accT_mode = false;        
        this.cmd_table = new CmdQueueKlass(this);        
        // default is the same as worksheet 
        // -status-
        this.is_running = false;
        this.is_pause = false;
        // --------
        // repeat
        this.start_index = -1;
        this.repeat_count = 1;
        // --------
        this.timer = null;      
        this.pre_abs_time = 0;
        this.offset = 0;  
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
        // alias
        this._extra_cmd_handlers["label"] = this._extra_cmd_handlers["tag"];
        
        // variablies pool
        this["Mem"] = {};		
        this.timer_save = null;
        
        /**BEGIN-PREVIEWONLY**/
        this.debugger_info = [];
        /**END-PREVIEWONLY**/	
    };
    var ScenarioKlassProto = cr.behaviors.rex_bScenario.ScenarioKlass.prototype;
    
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
        this.sn = 0;
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
    
    ScenarioKlassProto.Load = function (s, fmt)
    {        
        this.Clean();
        if (s === "")
            return;

        this.cmd_table.Reset();
        this.Append(s, fmt);        
    };
    
    ScenarioKlassProto.Append = function (s, fmt)
    {        
        if (s === "")
            return;
            
        var arr;
        if (fmt == 0)
          arr = CSVToArray(s);        
        else
        {
          arr = JSON.parse(s);
          if (arr[0].length == null)
            arr = [arr];
        }
       
        this.remove_invalid_commands(arr);
        this.parse_commands(arr);        
        this.cmd_table.Append(arr);
    };
        
    ScenarioKlassProto.Clean = function ()
    {        
        if (this.timer)
            this.timer.Remove();
                                      
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
        if (typeof(cmd) === "number")
            return cmd;
        else if (cmd === "")
            return 0;
            
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
    
    ScenarioKlassProto.Start = function (offset, tag, repeat_count)
    {        
        // increase sn
        this.sn ++;
        if (this.sn === 65535)
            this.sn = 0;
        // increase sn   
        
        this.is_running = true;
        this.is_pause = false;        
        this._reset_abs_time();
        if (offset != null)
            this.offset = offset;
        if (this.timer == null)
        {
            this.timer = this.plugin.type._timeline_get().CreateTimer(on_timeout);
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
        
        // repeat count
        this.repeat_count = repeat_count;
        this.start_index = index;
        // --------
        
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

    ScenarioKlassProto.GetPrevTag = function ()
    {      
        return this.cmd_handler_get("tag").prev_tag;
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
        var mysn = this.sn;            
        if (index != null)
            this.table_index_set(index);
            
        var is_continue = true;
        var cmd_pack, cmd;
        while (is_continue)
        {
            cmd_pack = this.cmd_table.get_cmd();            
            if ((cmd_pack == null) && (this.cmd_table.queue != null))
            {
                is_continue = this.exit();
                if (is_continue)
                    continue;
                else
                    return;               
            }
            cmd = this.get_command_type(cmd_pack[0]);
            if (!isNaN(cmd))
                is_continue = this._on_delay_execution_command(cmd, cmd_pack);
            else  // might be other command
                is_continue = this.cmd_handler_get(cmd.toLowerCase()).on_executing(cmd_pack);
                
            is_continue = is_continue && (mysn === this.sn);                
        }
    }; 
    ScenarioKlassProto.table_index_set = function (index)
    {      
        this.cmd_table.IndexSet(index);
    };
    ScenarioKlassProto.table_index_reset = function ()
    {      
        this.cmd_table.IndexSet(this.start_index);
    };    
    
    ScenarioKlassProto.exit = function ()
    {
        
        if (this.repeat_count == 1)
        {
            this.is_running = false;
        }
        else
        {
            this.is_running = true;
            if (this.repeat_count != 0)
                this.repeat_count --;
            this.table_index_reset();
        }

        if (this.is_debug_mode)
        {
            if (this.is_running)
                log ("Scenario: Loop end");  
            else
                log ("Scenario: Scenario finished");  
        }
        var inst = this.plugin;    
        inst.runtime.trigger(cr.behaviors.rex_bScenario.prototype.cnds.OnLoopEnd, inst.inst); 
        
        return this.is_running; //  is_contine         
    };
    
    ScenarioKlassProto.pause = function ()
    {
        this.is_pause = true;
        var inst = this.plugin;    
        inst.runtime.trigger(cr.behaviors.rex_bScenario.prototype.cnds.OnWaitingStart, inst.inst);        
    };
    ScenarioKlassProto.resume = function(key)
    {
        if (!(this.is_pause && this.is_running))
            return;
        var is_unlock = this.cmd_handler_get("wait").keyMatched(key);
        if (!is_unlock)
            return;
        this.is_pause = false;
        this._reset_abs_time();
        this._run_next_cmd();
    };
    ScenarioKlassProto.isPaused = function (key)
    {        
        var key_matched = this.cmd_handler_get("wait").keyMatched(key);
        return this.is_pause && key_matched;
    };
        
    ScenarioKlassProto.on_tag_changed = function()
    {
        var inst = this.plugin;
        inst.runtime.trigger(cr.behaviors.rex_bScenario.prototype.cnds.OnTagChanged, inst.inst);
    };
    ScenarioKlassProto._on_delay_execution_command = function(delayT_, cmd_pack)
    {
        var deltaT;
        if (this.is_accT_mode)
        {
            var next_abs_time = delayT_ + this.offset;
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
            this.execute_cmd(fn_name, fn_params);
        }
        else
        {
            this.timer._cb_name = fn_name;
            this.timer._cb_params = fn_params;
            this.timer.Start(deltaT);
        }
        return (deltaT == 0);  // is_continue
    }; 
    
    // call c2fn then return value
    var gC2FnParms = [];
    var _thisArg = null;
    ScenarioKlassProto["_call_c2fn"] = function()
    {
        var c2FnName = arguments[0];
        var i, cnt=arguments.length;
        for(i=1; i<cnt; i++)
        {
            gC2FnParms.push( arguments[i] );
        }
        var retValue = _thisArg.plugin.type._timeline_get().RunCallback(c2FnName, gC2FnParms, true);
        gC2FnParms.length = 0;
        
        return retValue;
    };	
    
    // expression:Call in function object	
    var re = new RegExp("\n", "gm");
    ScenarioKlassProto.param_get = function(param)
    {
        if (typeof(param) != "string")
            return param;
            
        // string
        if (this.is_eval_mode)
        {
            param = param.replace(re, "\\n");    // replace "\n" to "\\n"
            var code_string = "function(scenario)\
            {\
                var MEM = scenario.Mem;\
                var Call = scenario._call_c2fn;\
                return "+param+"\
            }";
            _thisArg = this;
            var fn = eval("("+code_string+")");
            param = fn(this);
        }
        else
        {
            if (!(isNaN(param)))
                param = parseFloat(param);
        }
        return param;
    };	 
    
    ScenarioKlassProto.execute_cmd = function(name, params)
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
        this.plugin.run_command(name, params);
    };
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.delay_execute_c2fn(this._cb_name, this._cb_params);
    };
    
    ScenarioKlassProto.delay_execute_c2fn = function(name, params)
    {
        this.execute_cmd(name, params);
        this._run_next_cmd();
    };
    
    ScenarioKlassProto.saveToJSON = function ()
    {    
        var timer_save = null;
        if (this.timer != null)
        {
            timer_save = this.timer.saveToJSON();
            timer_save["__cbargs"] = [this.timer._cb_name, this.timer._cb_params];
        }
        return { "q": this.cmd_table.saveToJSON(),
                 "isrun": this.IsRunning,
                 "isp": this.is_pause,
                 "tim" : timer_save,
                 "pa": this.pre_abs_time,	       
                 "off": this.offset,
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
        this.offset = o["off"];
        this["Mem"] = o["mem"];
        if (o["CmdENDIF"])
            this.cmd_handler_get("end if").loadFromJSON(o["CmdENDIF"]);
    };	
    ScenarioKlassProto.afterLoad = function ()
    {
        if (this.timer_save != null)
        {
            var timeline = this.plugin.type._timeline_get();
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
        
        if (this.queue)
            this.queue.length = 0;
    };
    CmdQueueKlassProto.IndexSet = function(index)
    {
        this.current_index = index -1;
    };      

    CmdQueueKlassProto.get_cmd = function(index)
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
        if ((locked != null) && (locked !== ""))
            this.locked = this.scenario.param_get(locked);   
        else
            this.locked = "";
        
        /**BEGIN-PREVIEWONLY**/
        var debugger_info=this.scenario.debugger_info;
        debugger_info.length = 0;
        debugger_info.push({"name": "WAIT", "value": this.locked});	
        /**END-PREVIEWONLY**/	
        
        if (this.scenario.is_debug_mode)                    
            log ("Scenario: WAIT "+ this.locked);        
            
        this.scenario.pause();          
        return false;  // is_continue
    }; 
    CmdWAITKlassProto.keyMatched = function(key) 
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
        return this.scenario.exit();
    };

    // extra command : TAG (alias: LABEL)    
    var CmdTAGKlass = function(scenario)
    {
        this.scenario = scenario;
        this._tag2index = {};
        this.prev_tag = "";        
        this.last_tag = "";
    };
    var CmdTAGKlassProto = CmdTAGKlass.prototype;    
    CmdTAGKlassProto.on_reset = function() 
    {
        var t;
        for(t in this._tag2index)
            delete this._tag2index[t];
            
        this.prev_tag = "";            
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
            
        this.prev_tag = this.last_tag;            
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