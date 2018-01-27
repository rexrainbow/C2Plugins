// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ScenarioJEngine = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ScenarioJEngine.prototype;
		
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

    var TYPE_RAW = 0;
    var TYPE_EVAL = 1;
    var TYPE_MUSTACHE = 2;      
	instanceProto.onCreate = function()
	{
        this.content = {};
        this.c2FnType = null;
        this.fnParams = {};
        this.taskMgr = new TasksMgrKlass(this);
        this.isDebugMode = (this.properties[0] === 1);
        this.exp_lastTaskName = "";
        this.exp_lasFnName = "";
        
        this.timeline = null;  
        this.timelineUid = -1;    // for loading           
	};

	instanceProto.onDestroy = function ()
	{
        this.taskMgr.onDestroy();
	};   

	instanceProto.getContent = function ()
	{
        return this.content;
	};     
    
    instanceProto.getTimeLine = function ()
    {
        if (this.timeline !== null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "ScenarioJ Engine: Can not find timeline oject.");
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
        assert2(this.timeline, "ScenarioJ Engine: Can not find timeline oject.");
        return null;	
    };
    
	instanceProto.getC2FnType = function ()
	{
        if (this.c2FnType === null)
        {
            if (window["c2_callRexFunction2"])
                this.c2FnType = "c2_callRexFunction2";
            else if (window["c2_callFunction"])
                this.c2FnType = "c2_callFunction";            
            else
                this.c2FnType = "";
        }
        return this.c2FnType;
	};    

	instanceProto.callC2Function = function (c2FnGlobalName, taskName, fnName, c2FnName, params)
	{
        this.exp_lastTaskName = taskName;
        this.exp_lasFnName = fnName;
        
        window[c2FnGlobalName](c2FnName, params);        
	}; 
    
	instanceProto.onTaskDone = function (taskName)
	{
        this.exp_lastTaskName = taskName;
        this.runtime.trigger(cr.plugins_.Rex_ScenarioJEngine.prototype.cnds.OnAnyTaskDone, this);
        this.runtime.trigger(cr.plugins_.Rex_ScenarioJEngine.prototype.cnds.OnTaskDone, this);        
	}; 
    
	instanceProto.onFunctionScopeChanged = function (taskName, fnName)
	{
        this.exp_lastTaskName = taskName;
        this.exp_lasFnName = fnName;
        this.runtime.trigger(cr.plugins_.Rex_ScenarioJEngine.prototype.cnds.OnFunctionScopeChanged, this);
	};  

    instanceProto.cleanStatus = function ()
	{   
		this.taskMgr.cleanStatus();
	};    

    instanceProto.saveToJSON = function ()
    { 
        return { "content": this.content,
                      "c2FnType": this.c2FnType,
                      "fnParams": this.fnParams,
                      "tskMgr": this.taskMgr.saveToJSON(),
                      "exp_lastTaskName": this.exp_lastTaskName,
                      "tlUid": (this.timeline != null)? this.timeline.uid : (-1),
                   };
    };
    
    instanceProto.loadFromJSON = function (o)
    {
        this.content = o["content"];
        this.c2FnType = o["c2FnType"];
        this.fnParams = o["fnParams"];
        this.taskMgr.loadFromJSON(o["tskMgr"]);
        this.exp_lastTaskName = o["exp_lastTaskName"];
        this.timelineUid = o["tlUid"];
    };     

    instanceProto.afterLoad = function ()
    {
        if (this.timelineUid === -1)
            this.timeline = null;
        else
        {
            this.timeline = this.runtime.getObjectByUID(this.timelineUid);
            assert2(this.timeline, "ScenarioJ Engine: Failed to find timeline object by UID");
        }		

        this.taskMgr.afterLoad();
    };    
    
    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections)
    {
        var props = [];
        var tasks = this.taskMgr.tasks;
        for (var n in tasks)
        {
            props.push({"name": "task." + n, "value": tasks[n].getCurFnName() || ""});
        }
        var globalVars = this.taskMgr.globalVars;
        for (var n in globalVars)
        {
            props.push({"name": "globalVars." + n, "value": globalVars[n]});            
        }

        propsections.push({
            "title": this.type.name,
            "properties": props
        });
    };
    
    instanceProto.onDebugValueEdited = function (header, name, value)
    {
        if (name.substring(0,11) == "globalVars.") // set globalVars
        {	   
            var k = name.substring(11);
            this.taskMgr.globalVars[k] = value;
        }
    };
    /**END-PREVIEWONLY**/	    
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
    Cnds.prototype.OnTaskDone = function (taskName)
    {
        return true;
    };  
    
    Cnds.prototype.OnAnyTaskDone = function ()
    {
        return true;
    };  
    
    Cnds.prototype.IsTaskRunning = function (taskName)
    {
        var task = this.taskMgr.getTask(taskName);
        if (task == null)
            return false;
        return !task.isStackEmpty();
    };

    Cnds.prototype.IsFunctionExisted = function (fnName)
    {
        return this.getContent().hasOwnProperty(fnName);
    };  
    
    Cnds.prototype.OnFunctionScopeChanged = function ()
    {
        return true;
    };  
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.CleanCmds = function ()
	{        
        for(var n in this.content)
            delete this.content[n];
	};    
    
    Acts.prototype.AppendCmds = function (json_)
	{    
		var o;    
		try 
        {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
        
        for(var n in o)
            this.content[n] = o[n];        
	};   
        
    Acts.prototype.AppendCmdsFromEditor = function (objs)
    {  
        var editor = objs.getFirstPicked();
        if (editor.transferContent)
        {
            var o = editor.transferContent();
            for (var n in o)
            {
                this.content[n] = o[n];    
            }
        }
        else
            alert ("ScenarioJ Engine: not a ScenarioJ Editor object");
    };    
        
    
    Acts.prototype.StartTask = function (taskName, fnName)
	{        
        var localVars = this.fnParams;
        this.fnParams = {};    
        this.taskMgr.startTask(taskName, fnName, localVars);
	};     
    
    Acts.prototype.SetFunctionParameter = function (name_, value_)
	{
        this.fnParams[name_] = value_;
	};  
    
    Acts.prototype.SetLocalValue = function (taskName, name_, value_)
	{
        var task = this.taskMgr.getTask(taskName);
        if (task == null)
            return;
        
        task.getLocalVars()[name_] = value_;    
	};    
    
    Acts.prototype.SetTaskValue = function (taskName, name_, value_)
	{
        var task = this.taskMgr.getTask(taskName,  true);
        task.taskVars[name_] = value_;
	};   
    
    Acts.prototype.SetGlobalValue = function (name_, value_)
	{
        this.taskMgr.globalVars[name_] = value_;
	};      
    
    
    var add2Var = function (vars, name_, value_)
    {
        if (!vars.hasOwnProperty(name_))
            vars[name_] = 0;
        
        vars[name_] = value_;
    };
    
    Acts.prototype.AddToLocalVar = function (taskName, name_, value_)
	{
        var task = this.taskMgr.getTask(taskName);
        if (task == null)
            return;
        
        var vars = task.getLocalVars();
        add2Var(vars, name_, value_);
	};    
    
    Acts.prototype.AddToTaskVar = function (taskName, name_, value_)
	{
        var task = this.taskMgr.getTask(taskName,  true);
        if (task == null)
            return;
        
        var vars = task.taskVars;
        add2Var(vars, name_, value_);
        
	};   
    
    Acts.prototype.AddToGlobalVar = function (name_, value_)
	{
        var vars = this.taskMgr.globalVars;
        add2Var(vars, name_, value_);
	};     
       
    Acts.prototype.FireSignal = function (signal)
	{   
        this.taskMgr.fireSignal(signal);
	};

    Acts.prototype.StopTask = function (taskName)
	{        
        var task = this.taskMgr.getTask(taskName);
        if (!task)
            return;
        
        task.close();
	};
    
    Acts.prototype.PauseTask = function (taskName)
	{        
        var task = this.taskMgr.getTask(taskName);
        if (!task)
            return;
        
        var timer = task.timer;
        if (!timer)
            return;
        
        timer.Suspend();
	};   
    
    Acts.prototype.ResumeTask = function (taskName)
	{        
        var task = this.taskMgr.getTask(taskName);
        if (!task)
            return;
        
        var timer = task.timer;
        if (!timer)
            return;
        
        timer.Resume();
	};       
         
    Acts.prototype.SetupTimeline = function (timeline_objs)
    {  
        var timeline = timeline_objs.getFirstPicked();
        if ((cr.plugins_.Rex_TimeLine) && (timeline instanceof cr.plugins_.Rex_TimeLine.prototype.Instance))
            this.timeline = timeline;        
        else
            alert ("ScenarioJ Engine should connect to a timeline object");
    };    
        
    Acts.prototype.SetupCallback = function (callback_type)
	{	
        this.c2FnType = (callback_type===0)? "c2_callFunction" : "c2_callRexFunction2";
	};	      
    
    Acts.prototype.LoadStatus = function (json_)
	{   
		var o;    
		try 
        {
			o = JSON.parse(json_);
		}
		catch(e) { return; }
        
        this.loadFromJSON(o);
        this.afterLoad();        
	};
    
    Acts.prototype.CleanStatus = function ()
	{   
		this.cleanStatus();
	};
      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.LastTaskName = function(ret)
    {
        ret.set_string(this.exp_lastTaskName);
    };

    Exps.prototype.LastFunctionName = function(ret, taskName)
    {
        var fnName = "";
        if (taskName == null)
            fnName = this.exp_lasFnName;
        else
        {
            var task = this.taskMgr.getTask(taskName);
            if (task)
            {
                fnName = task.getCurFnName();
            }
        }
        ret.set_string(fnName);
    };
    
    Exps.prototype.LocalVar = function(ret, taskName, varName, default_value)
    {
        var task = this.taskMgr.getTask(taskName);
        var value;
        if (task)
            value = task.getLocalVars()[varName] || default_value;
        
        if (value == null)
            value = 0;
        ret.set_any(value);
    };    

    Exps.prototype.TaskVar = function(ret, taskName, varName, default_value)
    {
        var task = this.taskMgr.getTask(taskName);
        var value;
        if (task)
            value = task.taskVars[varName] || default_value;
        
        if (value == null)
            value = 0;
        ret.set_any(value);
    };       

    Exps.prototype.GlobalVar = function(ret, varName, default_value)
    {
        var value = this.taskMgr.globalVars[varName] || default_value;
        
        if (value == null)
            value = 0;
        ret.set_any(value);
    }; 
    
    Exps.prototype.StatusAsJSON = function(ret)
    {
        var o = this.saveToJSON();
        ret.set_string(JSON.stringify(o));
    };
    
    
    // ---------------------------------------------------------------------
    
    var TaskKlass = function (taskMgr, name)
    {        
        this.taskMgr = taskMgr;
        this.name = name;
        this.isExecuting = false;  // prevent re-entry this.execute()
        this.stack = [];
        this.taskVars = {};
        this.fnParams = {};
        this.isPaused = false;
        this.timer = null;  
        this.waitSignal = null;
        this.timer_save = null;           
    };
    var TaskKlassProto = TaskKlass.prototype;
       
    var gFnParams = [];
    TaskKlassProto.execute = function ()
    {               
        if (this.isExecuting)
            return;
        
        this.isExecuting = true;
        
        //debugger
        var instruction, instName, isPause=false;
        var i, pcnt;
        this.isPaused = false;
        while (!this.isStackEmpty())
        {
            instruction = this.getNextInstruction();
            if (!instruction)
            {
                this.popStack();  // goto previous scope
                continue;
            }
            
            instName = instruction[0];
            pcnt = instruction.length;
            for (i=1; i<pcnt; i++)
                gFnParams.push(instruction[i]);
            
            isPause = this[instName].apply(this, gFnParams);
            gFnParams.length = 0;
            if (isPause)
                break;
        }
        
        this.isExecuting = false;

        if (this.isStackEmpty())
        {
            this.close();
        }
        else if (isPause)
        {
            // task pause
            this.isPaused = true;
        }
    };        
            
    TaskKlassProto.pushStack = function (seq, localVars, pp, ignoreTrigger)
    {
        var scope = scopeCache.newScope(seq, localVars, pp);
        this.stack.push(scope);
        
        if (!ignoreTrigger)
        {
            if (isFunctionScopeStart(pp))
                this.taskMgr.plugin.onFunctionScopeChanged(this.name, pp);
        }
    }; 
    
    TaskKlassProto.popStack = function (ignoreTrigger)
    {
        var preScope = this.stack.pop();
        
        if (!ignoreTrigger)
        {
            if (isFunctionScopeStart(preScope["pp"]))
                this.taskMgr.plugin.onFunctionScopeChanged(this.name, this.getCurFnName());
        }
        
        scopeCache.freeScope(preScope);
    }; 
    
    TaskKlassProto.getNextInstruction = function ()
    {
        var curScope = this.getCurrentScope();
        var dsi = curScope["dsi"];
        if (typeof(dsi) === "number")
            curScope["si"] += dsi;  // specific delta si
        else
            curScope["si"] += 1;    // +1 normallys
        
        var seq = curScope["seq"];        
        var instruction = seq[curScope["si"]];
        return instruction;
    };     

    var isFunctionScopeStart = function(pp)
    {
        return (typeof(pp) === "string");
    }    
    
    TaskKlassProto.getCurrentScope = function ()
    {
        return this.stack[this.stack.length-1];
    };     
    
    TaskKlassProto.getLocalVars = function ()
    {
        var i, cnt=this.stack.length, localVars;
        for(i=cnt-1; i>=0; i--)
        {
            localVars = this.stack[i]["vars"];
            if ( localVars !== null )
            {
                 return localVars;
            }
        }
    }; 
    
    TaskKlassProto["getLocalVars"] = TaskKlassProto.getLocalVars;
            
    TaskKlassProto["getTaskVars"] = function ()
    {
        return this.taskVars;
    };     
    TaskKlassProto["getGlobalVars"] = function ()
    {
        return this.taskMgr.globalVars;
    };         
    TaskKlassProto.getCurFnName = function ()
    {
        var i, cnt=this.stack.length, pp;
        for(i=cnt-1; i>=0; i--)
        {
            pp = this.stack[i]["pp"];
            if ( isFunctionScopeStart(pp) )
            {
                 return pp;
            }
        }
        return "";        
    };    


    TaskKlassProto.isStackEmpty = function ()
    {
        return (this.stack.length === 0);
    }; 
    
    TaskKlassProto.start = function (fnName, localVars)
    {
        //debugger
        this.stop();
        this.fnParams = localVars;
        this["_callFn_"](fnName);
        this.execute();
    };    
    
    TaskKlassProto.stop = function ()
    {
        scopeCache.freeScopes(this.stack);
        this.stack.length = 0;
        if (this.timer)
            this.timer.Remove();    
        
        if (this.waitSignal !== null)        
            this.taskMgr.removeWaitSignal(this.name, this.waitSignal);
    };  
    
    TaskKlassProto.close = function ()
    {
        this.stop();
        this.taskMgr.plugin.onTaskDone(this.name);
    };       
    
    TaskKlassProto.saveToJSON = function ()
    {    
        var i , cnt=this.stack.length, scope, scope_save=[];
        for(i=0; i<cnt; i++)
        {
            scope = this.stack[i];
            scope_save.push([ scope["pp"], scope["si"],  scope["dsi"], scope["vars"], scope["extra"] ]);            
        }
        
        var timer_save = (this.timer)? this.timer.saveToJSON() : null;
        
        return {"ss": scope_save, 
                     "tv": this.taskVars,
                     "tim" : timer_save,
                };
    };
    TaskKlassProto.loadFromJSON = function (o)
    {    
        var scope_save=o["ss"], i, cnt=scope_save.length;
        var s, pp, si, dsi, localVars, extra, curSeq, preSeq, curScope;
        
        scopeCache.freeScopes(this.stack);
        this.stack.length = 0;   
        
        var content = this.taskMgr.plugin.getContent();
        for(i=0; i<cnt; i++)
        {
            s = scope_save[i];
            pp = s[0];
            si = s[1];
            dsi = s[2];
            localVars = s[3];
            extra = s[4];
            if ( isFunctionScopeStart(pp) )
                preSeq = content;    // redirect scope from parent is content

            curSeq = preSeq[pp];
            this.pushStack(curSeq, localVars, pp, true);
            
            // overwrite current scope
            curScope = this.getCurrentScope();
            curScope["si"] = si;
            if (typeof(dsi) === "number")
            {
                curScope["dsi"] = dsi;
            }
            curScope["extra"] = extra;
            
            preSeq = curSeq[si];  // direct scope to child instruction in current scope
        }

        this.taskVars = o["tv"];
        this.timer_save = o["tim"];
    };	
    TaskKlassProto.afterLoad = function ()
    {  
        if (this.timer_save != null)
        {
            var timeline = this.taskMgr.plugin.getTimeLine();
            this.timer = timeline.LoadTimer(this.timer_save, on_timeout);
            this.timer.__task__ = this;       
            this.timer_save = null;
        }
    };    
    
    TaskKlassProto.onDestroy = function ()
    {  
        this.stop();
    };   
    
    // instruction handlers
    // ["_callFn_", fnName ]
    TaskKlassProto["_callFn_"] = function (fnName)
    {
        //debugger        
        var localVars = this.fnParams;
        this.fnParams = {};

        fnName = this.parseValueObj( fnName );
        var content = this.taskMgr.plugin.getContent();
        var seq = content[fnName]; 

        for (var n in localVars)
            localVars[n] = this.parseValueObj( localVars[n] );
        
        this.pushStack(seq, localVars, fnName);        
    };

    // ["_fnParam_", varName, value ]
    TaskKlassProto["_fnParam_"] = function (name_, value_, op_)
    {
        name_ = this.parseValueObj( name_ );
        value_ = this.parseValueObj( value_ );        
        varCalc(this.fnParams, name_, value_, op_);
    };  

    // ["_new_", fnName, taskName ]
    TaskKlassProto["_new_"] = function (fnName, taskName)
    {
        //debugger        
        var localVars = this.fnParams;
        this.fnParams = {};
        var task = this.getTask(taskName, true); 
        task.start(fnName, localVars);
    };    
    
    // ["_return_"]
    TaskKlassProto["_return_"] = function ()
    {
        var curScope;
        while (true)
        {
            curScope = this.getCurrentScope();
            this.popStack();
            
            if (isFunctionScopeStart(curScope["pp"]))
                break;                
        }
    };   

    // ["_exit_"]
    TaskKlassProto["_exit_"] = function ()
    {
        while (!this.isStackEmpty())
        {
            this.popStack();          
        }
    };    
    
    // ["_callC2Fn_", fnName, param0, param1, ….]
    var gC2FnParms = [];
    TaskKlassProto["_callC2Fn_"] = function ()
    {
        var c2FnGlobalName = this.taskMgr.plugin.getC2FnType();
        if (c2FnGlobalName === "")
            return;
        
        var c2FnName = this.parseValueObj( arguments[0] );
        var i, cnt=arguments.length;
        for(i=1; i<cnt; i++)
        {
            gC2FnParms.push( this.parseValueObj(arguments[i]) );
        }
        this.taskMgr.plugin.callC2Function(c2FnGlobalName, this.name, this.getCurFnName(), c2FnName, gC2FnParms);
        gC2FnParms.length = 0;
        // this.c2FnParms will be copyed in c2_callFunction
    }; 
    
    // ["_wait_", delay-time(number)|signal(string)]
    TaskKlassProto["_wait_"] = function (signal)
    {
        signal = this.parseValueObj( signal );
        if (typeof (signal) === "number" )
        {
            var deltaT = signal;
            if (this.timer == null)
            {               
                this.timer = this.taskMgr.plugin.getTimeLine().CreateTimer(on_timeout);
                this.timer.__task__ = this;
            }
            else
                this.timer.Remove();  // stop timer
            this.timer.Start(deltaT);
        }
        else
        {
            this.waitSignal = signal;
            this.taskMgr.addWaitSignal(this.name, signal);
        }
        return true;
    }; 
    TaskKlassProto.resume = function ()
    {
        this.waitSignal = null;
        this.execute();
    }
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.__task__.execute();
    };
    
    TaskKlassProto.getTask = function (taskName, createIfNotExisted)
    {
        var task;    
        if ((typeof(taskNam) === "string") && (taskName !== ""))
            task = this.taskMgr.getTask(taskName, createIfNotExisted);
        else
            task = this;
        
        return task;
    };     
            
    
    // ["_if_", condition (sring), [command sequence ],
    //            condition (sring), [command sequence ],
    //            condition (sring), [command sequence ], ... ]
    TaskKlassProto["_if_"] = function ()
    {
        var cond, seq;
        var i, cnt=arguments.length;        
        for(i=0; i<cnt; i+=2)
        {
            cond = arguments[i];
            seq = arguments[i+1];
            if ( this.parseValueObj(cond) )
            {
                var curScope = this.getCurrentScope();
                this.pushStack(seq, null, i+2);
                return;
            }
        }
    }; 
    
    // ["_switch_",  expression (string), 
    //    case0 (any), [command sequence ],
    //    case1 (any), [command sequence ],
    //    case2 (any), [command sequence ], ... ]
    TaskKlassProto["_switch_"] = function ()
    {
        var expRet = this.parseValueObj( arguments[0] );
        var i, cnt=arguments.length;         
        var caseValue, seq, isMatched;
        for(i=1; i<cnt; i+=2)
        {
            caseValue = arguments[i];
            seq = arguments[i+1];            
            if (caseValue === null)  // default case
            {
                isMatched = true;
            }
            else
            {
                caseValue = this.parseValueObj( caseValue );
                isMatched =  (caseValue == expRet);
            }

            if ( isMatched )
            {
                var curScope = this.getCurrentScope();
                this.pushStack(seq, null, i+3);
                return;
            }
        }
    };     
    
    // ["_for_", varName, start, stop, step, [ command sequence ] ]
    TaskKlassProto["_for_"] = function (varName, start_, stop_, step_, seq)
    {        
        varName =  this.parseValueObj( varName );
        var curScope = this.getCurrentScope();
        var extra = curScope["extra"];
        var localVars = this.getLocalVars();
        var start, stop, step;
        if (!curScope.hasOwnProperty("dsi"))
        {
            // init for loop
            start = this.parseValueObj( start_ );
            stop = this.parseValueObj( stop_ );
            step = this.parseValueObj (step_ );
            extra["_for_"] = [start, stop, step];
            
            curScope["dsi"] = 0;  // hold si, run this for instruction again
            localVars[varName] = start;
        }
        else
        {
            localVars[varName] += extra["_for_"][2];
        }
        
        start = extra["_for_"][0];
        stop = extra["_for_"][1];
        var curCnt = localVars[varName];
        var isRun = ((start < stop) && (curCnt <= stop)) ||
                           ((start >= stop) && (curCnt >= stop));
                           
        if (isRun)
        {
            this.pushStack(seq, null, 5);
        }
        else
        {
            delete curScope["dsi"];    
            delete extra["_for_"];
        }
    }; 
    
    // ["_while_", condition (sring), [ command sequence ] ]
    TaskKlassProto["_while_"] = function (cond, seq)
    {        
        var isRun = this.parseValueObj( cond );
        if ( isRun )
        {
            var curScope = this.getCurrentScope();
            curScope["dsi"] = 0;  // hold si, run this while instruction again     
            this.pushStack(seq, null, 2);
        }
        else
        {
            delete curScope["dsi"];
        }

    };    
    
    // ["_break_"]
    TaskKlassProto["_break_"] = function ()
    {
        var curScope;
        while (true)
        {
            curScope = this.getCurrentScope();            
            if (curScope["dsi"] === 0)
            {
                delete curScope["dsi"];
                if (curScope["extra"].hasOwnProperty("_for_"))
                    delete curScope["extra"]["_for_"];
                
                break;
            }                
            this.popStack();            
        }
    };       
    
    var varCalc = function (vars, name_, value_, op_)
    {
        if (op_ == null)
            op_ = "set";
        
        switch (op_)
        {
        case "default":
            if  (!vars.hasOwnProperty(name_))
                vars[name_] = value_;
        break;
        
        case "set":  
            vars[name_] = value_; 
        break;
        
        case "add":
            if (!vars.hasOwnProperty(name_))
                vars[name_] = 0;
            
            vars[name_] += value_;
        break;                   
        }        
    };
    
    // ["_local_", name_, value_, type_, (taskName) ]
    TaskKlassProto["_local_"] = function (name_, value_, type_, taskName)
    {  
        name_ =  this.parseValueObj( name_ );
        value_ =  this.parseValueObj( value_ );
        var task = this.getTask(taskName);    
        var localVars = task.getLocalVars();
        varCalc(localVars, name_, value_, type_);
    };   
    
    // ["_task_", name_, value_, type_, (taskName) ]
    TaskKlassProto["_task_"] = function (name_, value_, type_, taskName)
    {        
        name_ =  this.parseValueObj( name_ );
        value_ =  this.parseValueObj( value_ );    
        var task = this.getTask(taskName);       
        varCalc(task.taskVars, name_, value_, type_);
    };       
    
    // ["_global_", name_, value_, type_]
    TaskKlassProto["_global_"] = function (name_, value_, type_, taskName)
    {        
        name_ =  this.parseValueObj( name_ );
        value_ =  this.parseValueObj( value_ );    
        varCalc(this.taskMgr.globalVars, name_, value_, type_);
    };      
    
    // get parameter value    
    TaskKlassProto.parseValueObj = function (valueObj)
    {
        //debugger
        var value;
        if (typeof(valueObj) === "object")
        {
            value = valueObj[0];
            var type_ = valueObj[1];
            
            switch (type_)
            {            
            case TYPE_EVAL: value = this.evalParam( valueObj );  break;
            case TYPE_MUSTACHE: value = this.mustache( value );  break;   
            }
        }
        else  // string or number
        {
            value = valueObj;
        }
      
        if (value === true)  value = 1;
        else if (value === false)  value = 0;
        
        return value;        
    };    
    
    // mustache
    var gView = {};
    TaskKlassProto.mustache = function (template)
    {
        gView["global"] = this.taskMgr.globalVars;
        gView["task"] = this.taskVars;
        gView["local"] = this.getLocalVars();     
        return window["Mustache"]["render"](template, gView); 
    };
    
    // eval
    TaskKlassProto.evalParam = function (valueObj)
    {
        var isDebugMode = this.taskMgr.plugin.isDebugMode;        
        var fn = valueObj[2];
        
        if (fn == null)
        {
            fn = param2Fn(valueObj[0], isDebugMode);
            
            if (valueObj.length === 2)
                valueObj.push(fn);
            else
                valueObj[2] = fn;
        }
                
        if (fn == null)  // invalid eval function
            return 0;

        var value;
        if (isDebugMode)
        {
            value = fn(this);
        }
        else
        {
            try
            {
                value = fn(this);               
            }
            catch (e) 
            {
                value = 0;
            }
        }
        
        return value;        
    };
    
    // get eval function object
    var re = new RegExp("\n", "gm");    
    var param2Fn = function(param, isDebugMode)
    {
        param = param.replace(re, "\\n");    // replace "\n" to "\\n"
        var code_string = "\
(function(task_)\
{\
    var local = task_.getLocalVars();\
    var task = task_.getTaskVars();\
    var global = task_.getGlobalVars();\
    return ("+param+");\
})";

        var fn;
        if (isDebugMode)
            fn = eval(code_string);   
        else
        {
            try
            {
                fn = eval(code_string);           
            }
            catch (e) 
            {
                fn = null;
            }
        }
        return fn;
    }
    // get parameter value
    
    // instruction handlers
    
    var TasksMgrKlass = function(plugin) 
	{    
        this.plugin = plugin;
        this.tasks = {};
        this.globalVars = {};
        this.waitSignal2Task = {};
	};	
	var TasksMgrKlassProto = TasksMgrKlass.prototype;           

    TasksMgrKlassProto.getTask = function (taskName, createIfNotExisted)
    {
        if (!this.tasks.hasOwnProperty(taskName) && createIfNotExisted)
            this.tasks[taskName] = new TaskKlass(this, taskName);
        return this.tasks[taskName];
    };    
    TasksMgrKlassProto.startTask = function (taskName, fnName, localVars)
    {
        var task = this.getTask(taskName, true);
        task.start(fnName, localVars);
    };

    TasksMgrKlassProto.addWaitSignal = function (taskName, signalName)
    {
        if (!this.waitSignal2Task.hasOwnProperty(signalName))         
            this.waitSignal2Task[signalName] = [];
        
        this.waitSignal2Task[signalName].push(taskName);
    };
    
    TasksMgrKlassProto.removeWaitSignal = function (taskName, signalName)
    {
        if (!this.waitSignal2Task.hasOwnProperty(signalName))         
            return;
        
        cr.arrayFindRemove(this.waitSignal2Task[signalName], taskName);
    };    
    TasksMgrKlassProto.fireSignal = function (signalName)
    {        
        if (!this.waitSignal2Task.hasOwnProperty(signalName))         
            return;
        
        var taskNames = this.waitSignal2Task[signalName];
        delete this.waitSignal2Task[signalName];
        
        var i, cnt=taskNames.length;
        for(i=0; i<cnt; i++)
        {
            this.tasks[ taskNames[i] ].resume();
        }
    };

    TasksMgrKlassProto.removeTask = function (taskName)
    {  
        if (taskName == null)
        {
            var n, task;
            for (var n in this.tasks)
            {
                task = this.tasks[n];
                delete this.tasks[n];
                task.onDestroy();        
            }
        }
        else
        {
            if (this.tasks.hasOwnProperty(taskName))
            {
                var task = this.tasks[taskName];
                delete this.tasks[taskName];
                task.onDestroy();
            }
        }
    };
    
    TasksMgrKlassProto.onDestroy = function ()
    {  
        for (var n in this.tasks)
            this.tasks[n].onDestroy();        
    };   
    
    TasksMgrKlassProto.cleanStatus = function ()
    {  
        this.removeTask();
        
        for (var n in this.globalVars)
            delete this.globalVars[n];                 
    };    
    TasksMgrKlassProto.saveToJSON = function ()
    {    
        var tasks_save = {};
        for (var n in this.tasks)
            tasks_save[n] = this.tasks[n].saveToJSON();
        
        return { "tsks": tasks_save,
                     "gv": this.globalVars,
                     "wtsk": this.waitSignal2Task,
                };
    };
    TasksMgrKlassProto.loadFromJSON = function (o)
    {    
        var tasks_save = o["tsks"], task;
        for (var n in tasks_save)
        {
            task = new TaskKlass(this, n);
            this.tasks[n] = task;
            task.loadFromJSON(tasks_save[n]);
        }

        this.globalVars = o["gv"];
        this.waitSignal2Task = o["wtsk"];
    };	
    TasksMgrKlassProto.afterLoad = function ()
    {
        for (var n in this.tasks)
        {
            this.tasks[n].afterLoad();
        }
    };    
    
    
// ---------
// object pool class
// ---------
    var ObjCacheKlass = function ()
    {        
        this.lines = [];       
    };
    var ObjCacheKlassProto = ObjCacheKlass.prototype;   
    
	ObjCacheKlassProto.allocLine = function()
	{
		return (this.lines.length > 0)? this.lines.pop(): null;
	};    
	ObjCacheKlassProto.freeLine = function (l)
	{
		this.lines.push(l);
	};	
	ObjCacheKlassProto.freeAllLines= function (arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
			this.freeLine(arr[i]);
		arr.length = 0;
	};    
    
    var scopeCache = new ObjCacheKlass();    
    scopeCache.newScope = function (seq, localVars, pp)
    {
        var scope = this.allocLine();
        
        if (scope === null)
        {
            scope = {
                "seq":null, 
                "vars":null, // only function scope has localVar
                "pp": null,  // parent point: string= fnName, number= index of seq in previous scope
                "si":-1,    // current ssequence index      
                "extra": {},    // extra data of current scope      
                };
        }        
        scope["seq"] = seq;
        scope["vars"] = localVars;
        scope["pp"] = pp;
        
        return scope;
    };
        
    scopeCache.freeScope = function (scope)
    {
        scope["seq"] = null;
        scope["vars"] = null;
        scope["pp"] = null;
        scope["si"] = -1;
        
        for(var n in scope["extra"])
            delete scope["extra"][n];
        
        this.freeLine(scope);
    };
        
    scopeCache.freeScopes = function (scopes)
    {
        var i, cnt=scopes.length;
        for(i=0; i<cnt; i++)
        {
            this.freeScope(scopes[i]);
        }        
    };    
    
    
}());