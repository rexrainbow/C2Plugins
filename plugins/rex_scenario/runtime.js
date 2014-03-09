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
        this._scenario = new cr.plugins_.Rex_Scenario.ScenarioKlass(this);  
        this._scenario.is_debug_mode = (typeof(log) !== "undefined") && (this.properties[0] == 1);
        this._scenario.is_accT_mode = (this.properties[1] == 0);
        this._scenario.is_eval_mode = (this.properties[2] == 1);
      
        this.timeline = null;  
        this.timelineUid = -1;    // for loading     
        this.callback = null;     // deprecated
        this.callbackUid = -1;    // for loading   // deprecated  
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];
        /**END-PREVIEWONLY**/	
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
        return { "s": this._scenario.saveToJSON(),
                 "tlUid": (this.timeline != null)? this.timeline.uid : (-1),
                 "cbUid": (this.callback != null)? this.callback.uid : (-1)  // deprecated
                 };
    };
    
    instanceProto.loadFromJSON = function (o)
    {
        this._scenario.loadFromJSON(o["s"]);
        this.timelineUid = o["tlUid"];
        this.callbackUid = o["cbUid"];  // deprecated
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
        
        // ---- deprecated ----
        if (this.callbackUid === -1)
            this.callback = null;
        else
        {
            this.callback = this.runtime.getObjectByUID(this.callbackUid);
            assert2(this.callback, "Scenario: Failed to find rex_function object by UID");
        }		
        // ---- deprecated ---- 

        this._scenario.afterLoad();
    }; 
    
    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections)
    {
        this.propsections.length = 0;
        this.propsections.push({"name": "Tag", "value": this._scenario.get_last_tag()});
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
            if (this._scenario.has_tag(value))
                this._scenario.start(null, value);
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
        return this._scenario.is_running;
    }; 
    
    Cnds.prototype.OnTagChanged = function ()
    {
        return true;
    }; 	  

    Cnds.prototype.IsTagExisted = function (tag)
    {
        return this._scenario.has_tag(tag);
    }; 
    
    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();
    
    Acts.prototype.Setup = function (timeline_objs, fn_objs)
    {  
        var timeline = timeline_objs.instances[0];
        if ((cr.plugins_.Rex_TimeLine) && (timeline instanceof cr.plugins_.Rex_TimeLine.prototype.Instance))
            this.timeline = timeline;        
        else
            alert ("Scenario should connect to a timeline object");          
        
        var callback = fn_objs.instances[0];
        if ((cr.plugins_.Rex_Function) && (callback instanceof cr.plugins_.Rex_Function.prototype.Instance))
            this.callback = callback;        
        else
            alert ("Scenario should connect to a function object");
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
    
    Acts.prototype.Continue = function (key)
    {
        this._scenario.resume(key);
    };
    
    Acts.prototype.GoToTag = function (tag)
    {
        this._scenario.start(null, tag);    
    };     
        
    Acts.prototype.SetMemory = function (index, value)
    {
        this._scenario["Mem"][index] = value;
    };
        
    Acts.prototype.StringToMEM = function (JSON_string)
    {	
        this._scenario["Mem"] = JSON.parse(JSON_string);;
    };
    
    Acts.prototype.Setup2 = function (timeline_objs)
    {  
        var timeline = timeline_objs.instances[0];
        if ((cr.plugins_.Rex_TimeLine) && (timeline instanceof cr.plugins_.Rex_TimeLine.prototype.Instance))
            this.timeline = timeline;        
        else
            alert ("Scenario should connect to a timeline object");
    };

    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();

    Exps.prototype.LastTag = function(ret)
    {
        ret.set_string(this._scenario.get_last_tag());
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
        this.is_eval_mode = true;          
        this.is_accT_mode = false;
        this.cmd_table = new CmdQueueKlass();        
        // default is the same as worksheet 
        // -status-
        this.is_running = false;
        this.is_pause = false;
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
        // variablies pool
        this["Mem"] = {};		
        this.timer_save = null;
        
        /**BEGIN-PREVIEWONLY**/
        this.debugger_info = [];
        /**END-PREVIEWONLY**/	
    };
    var ScenarioKlassProto = cr.plugins_.Rex_Scenario.ScenarioKlass.prototype;
    
    // export methods
    ScenarioKlassProto.load = function (csv_string)
    {        
        // reset all extra cmd handler
        var extra_cmd_handler;
        for(extra_cmd_handler in this._extra_cmd_handlers)
            this._extra_cmd_handlers[extra_cmd_handler].on_reset();
            
        var _arr = (csv_string != "")? CSVToArray(csv_string):[];
        this.cmd_table.reset(_arr);
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
                    if (this.is_debug_mode)
                        log ("Scenario: line " +i+ " = '"+cmd+ "' is not a valid command");                   
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
        //cnt = queue.length;
        //var cell_cnt = queue[0].length;
        //var cmd_pack, j;
        //for (i=0;i<cnt;i++)
        //{
        //    cmd_pack = queue[i];
        //    for(j=0;j<cell_cnt;j++)
        //	{
        //	    if (cmd_pack[j] == "")
        //		    break;
        //	}
        //	if (j<cell_cnt)
        //	    cmd_pack.splice(j, cell_cnt-j)
        //}
        
        cnt = queue.length;
        var cmd_pack;
        for (i=0;i<cnt;i++)
        {
            cmd_pack = queue[i];
            cmd = cmd_pack[0];             
            if (isNaN(cmd) || (cmd == ""))  // might be other command
                this.cmd_handler_get(cmd).on_parsing(i, cmd_pack);
        }
    };
    
    ScenarioKlassProto.start = function (offset, tag)
    {
        this.is_running = true;
        this._reset_abs_time();
        if (offset != null)
            this.offset = offset;
        if (this.timer == null)
            this.timer = this.plugin._timeline_get().CreateTimer(this, this._delay_execute_c2fn);
        else
            this.timer.Remove();  // stop timer
        this.cmd_table.reset();
        var index = this.cmd_handler_get("tag").tag2index(tag);
        if (index == null)
        {
            assert2(index, "Scenario: Could not find tag "+tag);
            return;
        }
        this._run_next_cmd(index);
    };  
    
    ScenarioKlassProto.cmd_handler_get = function (cmd_name)
    {
        return this._extra_cmd_handlers[cmd_name];
    };        

    ScenarioKlassProto.get_last_tag = function ()
    {      
        return this.cmd_handler_get("tag").last_tag;
    };  
    
    ScenarioKlassProto.has_tag = function (tag)
    {
        return this.cmd_handler_get("tag").has_tag(tag);
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
            cmd = cmd_pack[0];
            if (!isNaN(cmd))
                is_continue = this._on_delay_execution_command(cmd_pack);
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
            
        this.is_running = false;
        var inst = this.plugin;
        inst.runtime.trigger(cr.plugins_.Rex_Scenario.prototype.cnds.OnCompleted, inst);
    };
    
    ScenarioKlassProto.pause = function ()
    {
        this.is_pause = true;
    };
    ScenarioKlassProto.resume = function(key)
    {
        if (!(this.is_pause && this.is_running))
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
    ScenarioKlassProto._on_delay_execution_command = function(cmd_pack)
    {
        var deltaT, cmd = parseFloat(cmd_pack[0]);
        if (this.is_accT_mode)
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
            this.timer.SetCallbackArgs([fn_name, fn_params]);
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
        _params.length = 0;
        _params.push(fake_ret);
        var i, cnt=arguments.length;
        for (i=0; i<cnt; i++)
            _params.push(arguments[i]);
            
        var plugin = _thisArg.plugin;
        var has_rex_function = (plugin.callback != null);
        if (has_rex_function)
            cr.plugins_.Rex_Function.prototype.exps.Call.apply(plugin.callback, _params);
        else    // run official function
        {
            var has_fnobj = plugin._timeline_get().Call(_params, true);     
            assert2(has_fnobj, "Scenario: Can not find callback object.");
        }
        return fake_ret.value;
    };	
    
    // expression:Call in function object	
    var re = new RegExp("\n", "gm");
    ScenarioKlassProto.param_get = function(param)
    {
        if (this.is_eval_mode)
        {
            param = param.replace(re, "\\n");    // replace "\n" to "\\n"
            var code_string = "function(scenario)\
            {\
                var MEM = scenario['Mem'];\
                var Call = scenario['_getvalue_from_c2fn'];\
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
        var plugin = this.plugin;
        var has_rex_function = (plugin.callback != null);
        if (has_rex_function)
            plugin.callback.CallFn(name, params);
        else    // run official function
        {
            var has_fnobj = plugin._timeline_get().RunCallback(name, params, true);     
            assert2(has_fnobj, "Scenario: Can not find callback oject.");
        }
    };	   
    
    ScenarioKlassProto._delay_execute_c2fn = function(name, params)
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
            timer_save["__cbargs"] = this.timer.GetCallbackArgs();
        }
        return { "q": this.cmd_table.saveToJSON(),
                 "isrun": this.is_running,
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
        this.is_running = o["isrun"];
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
            var timeline = this.plugin._timeline_get();
            timeline.LoadTimer(this, this._delay_execute_c2fn, this.timer_save["__cbargs"],  this.timer_save);
            this.timer_save = null;
        }
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
    CmdTAGKlassProto.has_tag = function(tag)
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