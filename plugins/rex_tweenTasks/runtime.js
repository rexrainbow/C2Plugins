// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TweenTasks = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{

	var tweenFunctions = {
		"linear" : function (t){
			return t;
		},
		"easeInQuad": function (t) {
			return t*t;
		},
		"easeOutQuad": function (t) {
			return -1 *t*(t-2);
		},
		"easeInOutQuad": function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t;
			return -1/2 * ((--t)*(t-2) - 1);
		},
		"easeInCubic": function (t) {
			return t*t*t;
		},
		"easeOutCubic": function (t) {
			return 1*((t=t/1-1)*t*t + 1);
		},
		"easeInOutCubic": function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t;
			return 1/2*((t-=2)*t*t + 2);
		},
		"easeInQuart": function (t) {
			return t*t*t*t;
		},
		"easeOutQuart": function (t) {
			return -1 * ((t=t/1-1)*t*t*t - 1);
		},
		"easeInOutQuart": function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t*t;
			return -1/2 * ((t-=2)*t*t*t - 2);
		},
		"easeInQuint": function (t) {
			return 1*(t/=1)*t*t*t*t;
		},
		"easeOutQuint": function (t) {
			return 1*((t=t/1-1)*t*t*t*t + 1);
		},
		"easeInOutQuint": function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t*t*t*t;
			return 1/2*((t-=2)*t*t*t*t + 2);
		},
		"easeInSine": function (t) {
			return -1 * Math.cos(t/1 * (Math.PI/2)) + 1;
		},
		"easeOutSine": function (t) {
			return 1 * Math.sin(t/1 * (Math.PI/2));
		},
		"easeInOutSine": function (t) {
			return -1/2 * (Math.cos(Math.PI*t/1) - 1);
		},
		"easeInExpo": function (t) {
			return (t==0) ? 1 : 1 * Math.pow(2, 10 * (t/1 - 1));
		},
		"easeOutExpo": function (t) {
			return (t==1) ? 1 : 1 * (-Math.pow(2, -10 * t/1) + 1);
		},
		"easeInOutExpo": function (t) {
			if (t==0) return 0;
			if (t==1) return 1;
			if ((t/=1/2) < 1) return 1/2 * Math.pow(2, 10 * (t - 1));
			return 1/2 * (-Math.pow(2, -10 * --t) + 2);
			},
		"easeInCirc": function (t) {
			if (t>=1) return t;
			return -1 * (Math.sqrt(1 - (t/=1)*t) - 1);
		},
		"easeOutCirc": function (t) {
			return 1 * Math.sqrt(1 - (t=t/1-1)*t);
		},
		"easeInOutCirc": function (t) {
			if ((t/=1/2) < 1) return -1/2 * (Math.sqrt(1 - t*t) - 1);
			return 1/2 * (Math.sqrt(1 - (t-=2)*t) + 1);
		},
		"easeInElastic": function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
		},
		"easeOutElastic": function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1)==1) return 1;  if (!p) p=1*.3;
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*1-s)*(2*Math.PI)/p ) + 1;
		},
		"easeInOutElastic": function (t) {
			var s=1.70158;var p=0;var a=1;
			if (t==0) return 0;  if ((t/=1/2)==2) return 1;  if (!p) p=1*(.3*1.5);
			if (a < Math.abs(1)) { a=1; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (1/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p ));
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*1-s)*(2*Math.PI)/p )*.5 + 1;
		},
		"easeInBack": function (t) {
			var s = 1.70158;
			return 1*(t/=1)*t*((s+1)*t - s);
		},
		"easeOutBack": function (t) {
			var s = 1.70158;
			return 1*((t=t/1-1)*t*((s+1)*t + s) + 1);
		},
		"easeInOutBack": function (t) {
			var s = 1.70158; 
			if ((t/=1/2) < 1) return 1/2*(t*t*(((s*=(1.525))+1)*t - s));
			return 1/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
		},
		"easeInBounce": function (t) {
			return 1 - tweenFunctions["easeOutBounce"] (1-t);
		},
		"easeOutBounce": function (t) {
			if ((t/=1) < (1/2.75)) {
				return 1*(7.5625*t*t);
			} else if (t < (2/2.75)) {
				return 1*(7.5625*(t-=(1.5/2.75))*t + .75);
			} else if (t < (2.5/2.75)) {
				return 1*(7.5625*(t-=(2.25/2.75))*t + .9375);
			} else {
				return 1*(7.5625*(t-=(2.625/2.75))*t + .984375);
			}
		},
		"easeInOutBounce": function (t) {
			if (t < 1/2) return tweenFunctions["easeInBounce"] (t*2) * .5;
			return tweenFunctions["easeOutBounce"] (t*2-1) * .5 + 1*.5;
		}
	};
    
	var tweenFunctionNames = ["linear","easeInQuad","easeOutQuad","easeInOutQuad",
	                          "easeInCubic","easeOutCubic","easeInOutCubic","easeInQuart",
	                          "easeOutQuart","easeInOutQuart","easeInQuint","easeOutQuint",
	                          "easeInOutQuint","easeInSine","easeOutSine","easeInOutSine",
	                          "easeInExpo","easeOutExpo","easeInOutExpo","easeInCirc",
  	                          "easeOutCirc","easeInOutCirc","easeInElastic","easeOutElastic",
	                          "easeInOutElastic","easeInBack","easeOutBack","easeInOutBack",
	                          "easeInBounce","easeOutBounce","easeInOutBounce"];
	                          
	                              
	var pluginProto = cr.plugins_.Rex_TweenTasks.prototype;
		
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
        this.tasksMgr = new cr.plugins_.Rex_TweenTasks.TasksMgrKlass(this);
        this.exp_taskName = "";
        this.exp_fnName = "";
        this.exp_fnParams = null;
        this.exp_fnPercentage = 0;
        this.exp_bindInstUID = -1;
        this.exp_bindInstTypeSID = -1;        
        
        this.my_timescale = -1.0;
        this.runtime.tickMe(this);
        
        /**BEGIN-PREVIEWONLY**/
        this.propsections = [];      
        /**END-PREVIEWONLY**/         
	};
	instanceProto.onDestroy = function ()
	{
        this.tasksMgr.CleanAll();
	};        
	instanceProto.tick = function()
	{      
        var dt = this.runtime.getDt(this);
        if (dt === 0)
            return;
            
        this.tasksMgr.Tick(dt);
	};    
    instanceProto.OnTaskDone = function (taskName)
    {
        this.exp_taskName = taskName;
        this.runtime.trigger(cr.plugins_.Rex_TweenTasks.prototype.cnds.OnAnyTaskDone, this);
        this.runtime.trigger(cr.plugins_.Rex_TweenTasks.prototype.cnds.OnTaskDone, this);
        this.exp_taskName = "";
    };
	instanceProto.CallFunction = function(taskName, fnName, fnParams, percentage, bindInstUID, bindInstTypeSID)
	{
        this.exp_taskName = taskName;    
        this.exp_fnName = fnName;
        this.exp_fnParams = fnParams;
        this.exp_fnPercentage = percentage;
        this.exp_bindInstUID = bindInstUID;
        this.exp_bindInstTypeSID = bindInstTypeSID;        
        this.runtime.trigger(cr.plugins_.Rex_TweenTasks.prototype.cnds.OnFunction, this);
        this.exp_taskName = "";        
        this.exp_fnName = "";
        this.exp_fnParams = null;
        this.exp_fnPercentage = 0;
        this.exp_bindInstUID = -1;
        this.exp_bindInstTypeSID = -1;
	};  

    instanceProto.PickBindInst = function (uid, sid)
	{                
        var inst = this.runtime.getObjectByUID(uid);
        if (!inst)
            return;
        var objtype = this.get_objtype(sid);
        if (!objtype)
            return;
            
        var sol = objtype.getCurrentSol();  
        sol.select_all = false;
        sol.instances.length = 0;   // clear contents
        sol.instances.push(inst);
        objtype.applySolToContainer(); 
	};
	
    var _sid2typeIndex = {};
    instanceProto.get_objtype = function (sid)
	{
        var idx, objtype;
        if (!_sid2typeIndex.hasOwnProperty(sid))
        {
            idx = get_typeIndex(this.runtime.types_by_index, sid);
            _sid2typeIndex[sid] = idx;
            objtype = this.runtime.types_by_index[idx];
        }
        else
        {
            idx = _sid2typeIndex[sid];
            objtype = this.runtime.types_by_index[idx];
            if ((!objtype) || (objtype.sid != sid))
            {
                delete _sid2typeIndex[sid];
                return this.get_objtype(sid);
            }
        }
        return objtype;
	};
    
    var get_typeIndex = function(objtypes, sid)
    {
		var i, len=objtypes.length, t;
		for (i=0; i<len; i++)
		{
            t = objtypes[i];
			if (t.sid === sid)
            {
				return i;
            }
		}
    };
    
    instanceProto.GetFnParam = function (paramName, valueType)
	{
	    var v;
	    if (this.exp_fnParams.hasOwnProperty(paramName))
	    {
	        var param = this.exp_fnParams[paramName];
	        if (param.update_flag) // using default easeType
                ease_param(param, this.exp_fnPercentage, param.easeType);
            
            v = param.GetValue(valueType);
	    }
	    else
	        v = 0;
        
        return v;
	};
	
	var ease_param = function(param, percentage, easeType)
	{
	    var ease_percentage;	    
	    if ((percentage == 0) || (percentage == 1))	    
	        ease_percentage = percentage;	    
	    else
	    {
	        var tweenFn = tweenFunctions[tweenFunctionNames[easeType]];
	        ease_percentage = tweenFn(percentage);
	    }
	    
	    var v = param.Lerp(ease_percentage);
	    return v;
	};

	instanceProto.saveToJSON = function ()
	{
		return {"tasksMgr": this.tasksMgr.saveToJSON(),
		        "ts": this.my_timescale};
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.tasksMgr.loadFromJSON(o["tasksMgr"]);
	    this.my_timescale = o["ts"];
	};
    
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
	    this.propsections.length = 0;
        this.tasksMgr.getDebuggerValues(this.propsections);
        
		propsections.push({
			"title": this.type.name,
			"properties": this.propsections
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds(); 
    
	Cnds.prototype.OnFunction = function (fnName)
	{
        var is_my_fn  = cr.equals_nocase(fnName, this.exp_fnName);
        if (is_my_fn && (this.exp_bindInstUID >=0))
        {
            this.PickBindInst(this.exp_bindInstUID, this.exp_bindInstTypeSID);
        }
		return is_my_fn;
	};    
	Cnds.prototype.OnTaskDone = function (taskName)
	{
		return cr.equals_nocase(taskName, this.exp_taskName);
	};
	Cnds.prototype.OnAnyTaskDone = function ()
	{
		return true;
	};	
	Cnds.prototype.IsRunning = function (taskName)
	{
        var task = this.tasksMgr.GetActivatedTask(taskName);
		return (!!task);
	};	    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
                              
	Acts.prototype.ApplyEasing = function (paramName, easeType)
	{       
        if (!this.exp_fnParams.hasOwnProperty(paramName))
            return;

        var param = this.exp_fnParams[paramName];
        ease_param(param, this.exp_fnPercentage, easeType);
	};    
    
	Acts.prototype.NewTweenTask = function (taskName, fnName, interval, repeatCount)
	{	    
        this.tasksMgr.CreateTweenTask(taskName, fnName, interval, repeatCount);    
	};
    
	Acts.prototype.SetFnParameter = function (taskName, paramName, start, end, easeType)
	{       
        var task = this.tasksMgr.GetTask(taskName);
        if ((!task) || (!task.SetFnParameter))
            return;
        
        task.SetFnParameter(paramName, start, end, easeType);
	};         
    
	Acts.prototype.NewWaitTask = function (taskName, interval)
	{       
        this.tasksMgr.CreateWaitTask(taskName, interval);    
	};
    
	Acts.prototype.NewSequenceTask = function (taskName, repeatCount, childrenTasks)
	{       
        var task = this.tasksMgr.CreateSequenceTask(taskName, repeatCount);
        var i,cnt= childrenTasks.length, childTask;
        for(i=0; i<cnt; i++)
        {
            this.tasksMgr.AddChildTask(taskName, childrenTasks[i]);
        }
	};
	Acts.prototype.NewParallelTask = function (taskName, repeatCount, childrenTasks)
	{       
        var task = this.tasksMgr.CreateParallelTask(taskName, repeatCount);
        var i,cnt= childrenTasks.length, childTask;
        for(i=0; i<cnt; i++)
        {
            this.tasksMgr.AddChildTask(taskName, childrenTasks[i]);        
        }
	};  
	
	Acts.prototype.NewInversedTweenTask = function (taskName, targetTaskName)
	{
	    this.tasksMgr.CreateInversedTask(taskName, targetTaskName);
	};      
    
	Acts.prototype.NewWaitForSignalTask = function (taskName, signalName)
	{               
        this.tasksMgr.CreateWaitForSignalTask(taskName, signalName);    
	};    
	
	Acts.prototype.AddChildTask = function (parent_taskName, child_taskName)
	{       
        this.tasksMgr.AddChildTask(parent_taskName, child_taskName);  
	};  
    
	Acts.prototype.SetTaskParameter = function (taskName, paramName, paramValue)
	{       
        this.tasksMgr.SetTaskParameter(taskName, paramName, paramValue);
	};
	
	Acts.prototype.BindInst = function (taskName, objtype, destroyAfterTaskDone)
	{       
        if (!objtype)
            return;  
        var inst = objtype.getFirstPicked();
        if (!inst)
            return;
            
        var task = this.tasksMgr.GetCandidateTask(taskName);
        task.BindInst(inst.uid, objtype.sid, (destroyAfterTaskDone==1));
	}; 	
	 
	Acts.prototype.StartTask = function (taskName, destroyAfterDone)
	{       
        this.tasksMgr.StartTask(taskName, destroyAfterDone);    
	};
    
	Acts.prototype.PauseTask = function (taskName)
	{       
        this.tasksMgr.PauseTask(taskName);    
	}; 
     
	Acts.prototype.ResumeTask = function (taskName)
	{       
        this.tasksMgr.ResumeTask(taskName);    
	};  
    
	Acts.prototype.DestroyTask = function (taskName)
	{       
        this.tasksMgr.DestroyTask(taskName);    
	}; 
    
	Acts.prototype.ContinueTask = function (taskName, signalName)
	{
        this.tasksMgr.ContinueTasks(taskName, signalName);    
	}; 
    
	Acts.prototype.ContinueTasksBySignal = function (signalName)
	{
        this.tasksMgr.ContinueTasks(null, signalName);    
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
    Exps.prototype.FnParam = function (ret, paramName, valueType)
	{
		ret.set_float(this.GetFnParam(paramName, valueType));
	};     
    
    Exps.prototype.TaskParam = function (ret, taskName, paramName, default_value)
	{
        var v = this.tasksMgr.GetTaskParameter(askName, paramName);
        if (v == null)
            v = default_value || 0;
            
		ret.set_any(v);
	};
    
    Exps.prototype.TaskName = function (ret)
	{
		ret.set_string(this.exp_taskName);
	};    
}());

(function ()
{
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
    var tweenTasksCache = new ObjCacheKlass();
    var waitForSignalTasksCache = new ObjCacheKlass();
    var sequenceTasksCache = new ObjCacheKlass();
    var parallelTasksCache = new ObjCacheKlass();
    var tweenParamsCache = new ObjCacheKlass();
    
	// tween
    var TweenTaskKlass = function(taskMgr, taskName, fnName, interval, repeatCount) 
	{    
        this.typeName = "tween";
        this.Reset(taskMgr, taskName, fnName, interval, repeatCount);
	};	
	var TweenTaskKlassProto = TweenTaskKlass.prototype;   
    
	TweenTaskKlassProto.Reset = function (taskMgr, taskName, fnName, interval, repeatCount) 
	{           
        this.taskMgr = taskMgr;
        this.taskName = taskName;        
        this.parentTask = null;
        this.playRate = 1;
	    this.fnName = fnName;
		this.interval = interval;
		this.repeatCount = repeatCount;
		this.remainInterval = interval;
        this.destroyAfterDone = false;       
        
        if (!this.params)
            this.params = {};
        else
        {
            for(var n in this.params)
            {
                this.params[n].Destroy();
                delete this.params[n];
            }
        }        
        
        if (!this.fnParams)
            this.fnParams = {};
        else
        {
            for(var n in this.fnParams)
            {
                this.fnParams[n].Destroy();
                delete this.fnParams[n];
            }
        }
        
        if (!this.bindInstInfo)
            this.bindInstInfo = {};
        
        this.bindInstInfo.uid = -1;        
        this.bindInstInfo.sid = -1;
        this.bindInstInfo.destroyAfterTaskDone = false;
	};
    
	TweenTaskKlassProto.BindInst = function (instUID, sid, destroyAfterTaskDone) 
	{           
        this.bindInstInfo.uid = instUID;
        this.bindInstInfo.sid = sid;        
        this.bindInstInfo.destroyAfterTaskDone = destroyAfterTaskDone;
	};    
      
	TweenTaskKlassProto.SetParentTask = function (parentTask) 
	{           
	    this.parentTask = parentTask;
	}; 
	    
	TweenTaskKlassProto.Start = function () 
	{
	    this.remainInterval = this.interval;
	    
	    var param;
        for (var n in this.fnParams)
        {       
            param = this.fnParams[n];
            param.Reset(param.start, param.end, param.easeType);
        }
	};

	TweenTaskKlassProto.Tick = function (dt) 
	{
        dt *= this.playRate;
	    // run function
		this.remainInterval -= dt;
        
        if (this.fnName !== null)
        {           
            var percentage = (this.interval - this.remainInterval) / this.interval;
            percentage = cr.clamp(percentage, 0, 1);         
            this.callFunction(percentage);
        }
        
	    if (this.remainInterval <= 0)
		{
		    this.OnEnd();
		}
	};
    
	TweenTaskKlassProto.Continue = function (signalName) 
	{                      
	};    
	
	TweenTaskKlassProto.OnEnd = function ()
	{
		if (this.repeatCount != 1)
        {
            this.repeatCount -= 1;
			this.Start();
		}
		else
		{
            this.taskMgr.OnTaskDone(this);
            
            if (this.bindInstInfo.destroyAfterTaskDone)
                this.taskMgr.DestroyInst(this.bindInstInfo.uid);   
                
			// end trigger
            if (this.parentTask)
                this.parentTask.OnChildTaskEnd(this);
            else if (this.destroyAfterDone)  // root task
                this.taskMgr.DestroyTask(this.taskName);  
		}    
	};
    
	TweenTaskKlassProto.Destroy = function () 
	{           
        for(var n in this.fnParams)
        {
            this.fnParams[n].Destroy();
            delete this.fnParams[n];
        }    
	    tweenTasksCache.freeLine(this);        
	};
    
	TweenTaskKlassProto.SetFnParameter = function (name, start, end, easeType) 
	{
        easeType = easeType || 0;
	    if (this.fnParams.hasOwnProperty(name))
            this.fnParams[name].Reset(start, end, easeType);
        else
            this.fnParams[name] = get_tweenParameter(start, end, easeType);
	};

	TweenTaskKlassProto.GetRootTask = function () 
	{    
	    return (!this.parentTask)? this:this.parentTask.GetRootTask();
	};	
    
	TweenTaskKlassProto.callFunction = function (percentage) 
	{           
        for (var n in this.fnParams)        
            this.fnParams[n].update_flag = true;
            
        this.taskMgr.CallFunction(this.taskName, this.fnName, this.fnParams, percentage, this.bindInstInfo.uid, this.bindInstInfo.sid);
	};
	
	TweenTaskKlassProto.CreateInversedTask = function (taskName)
	{       
	    var task = this.taskMgr.CreateTweenTask(taskName, this.fnName, this.interval, this.repeatCount);  
	    
	    // copy this.params	    
	    for(var n in this.params)	    
	        task.params[n] = this.params[n];
	    
	    // copy inversed this.fnParams
        var fnParam;
        for(var n in this.fnParams)        
        {
            fnParam = this.fnParams[n];
            task.SetFnParameter(n, fnParam.end, fnParam.start, fnParam.easeType);        
        }
	};	
    
	TweenTaskKlassProto.saveToJSON = function ()
	{             
	    var fnParams_save = {};
	    for (var n in this.fnParams)
	        fnParams_save[n] = this.fnParams[n].saveToJSON();
	    
        var bindInstInfo_save = {"uid":this.bindInstInfo.uid,
                                 "sid":this.bindInstInfo.sid,
                                 "destroyAfterTaskDone":this.bindInstInfo.destroyAfterTaskDone
                                 };
        	    
		return {"typeName":this.typeName,
		        "taskName":this.taskName,
		        "playRate":this.playRate,
		        "fnName":this.fnName,
		        "interval": this.interval,
		        "repeatCount":this.repeatCount,
		        "remainInterval":this.remainInterval,
		        "destroyAfterDone":this.destroyAfterDone,
		        "params":this.params,
		        "fnParams":fnParams_save,
		        "bindInstInfo": bindInstInfo_save,
		        };
	};
	
	TweenTaskKlassProto.loadFromJSON = function (o)
	{
        this.typeName = o["typeName"];   
	    this.taskName = o["taskName"];
	    this.playRate = o["playRate"];
	    this.fnName = o["fnName"];
	    this.interval = o["interval"];
	    this.repeatCount = o["repeatCount"];
	    this.remainInterval = o["remainInterval"];
	    this.destroyAfterDone = o["destroyAfterDone"];
	       
	    this.params = o["params"];	    

	    var fnParams_save = o["fnParams"];
	    var param;	
	    for (var n in fnParams_save)
	    {
	        param = get_tweenParameter(0,0,0);
	        param.loadFromJSON(fnParams_save[n]);
	        this.fnParams[n] = param;
	    }
	        	    
	    var bindInstInfo = o["bindInstInfo"];
	    this.bindInstInfo.uid = bindInstInfo["uid"];
	    this.bindInstInfo.sid = bindInstInfo["sid"];	 
	    this.bindInstInfo.destroyAfterTaskDone = bindInstInfo["destroyAfterTaskDone"];	 
	};		
    
    var tweenParameterKlass = function (start, end, easeType)
    {
        this.Reset(start, end, easeType);
    };
    var tweenParameterKlassProto = tweenParameterKlass.prototype;   
    
	tweenParameterKlassProto.Reset = function (start, end, easeType) 
	{           
        this.start = start;
        this.end = end;
        this.diff = end - start;
        this.value = start;
        this.pre_value = start;
        this.easeType = easeType;
        this.update_flag = true;
	};
	
	tweenParameterKlassProto.SetValue = function (v) 
	{       		    
	    this.pre_value = this.value;   
	    this.value = v;
	};	
	
	tweenParameterKlassProto.GetValue = function (valueType) 
	{       		    
	    var v;
	    if (cr.equals_nocase(valueType, "start"))
	        v = this.start;
	    else if (cr.equals_nocase(valueType, "end"))
	        v = this.end;
	    else if (cr.equals_nocase(valueType, "delta"))
	        v = this.value - this.pre_value;
	    else
	        v = this.value;
	    
	    return v;        
	};		
    
	tweenParameterKlassProto.Lerp = function (percentage) 
	{       	    
	    var v;
	    if (percentage == 0)
	        v = this.start;
	    else if (percentage == 1)
	        v = this.end;
	    else
            v = this.start + (this.diff*percentage);
            
        this.SetValue(v);
        this.update_flag = false;
        
        return v;
	};
    
	tweenParameterKlassProto.Destroy = function () 
	{
	    tweenParamsCache.freeLine(this);
	};  

	tweenParameterKlassProto.SetTaskParameter = function (name, value) 
	{           
	    this.params[name] = value;
	};
    
	tweenParameterKlassProto.GetTaskParameter = function (name) 
	{    
        if (!this.params.hasOwnProperty(name))
        {
            if (this.parentTask)
                return this.parentTask.GetTaskParameter(name);
            else
                return null;
        }
        else
	        return this.params[name];
	}; 
	
	tweenParameterKlassProto.saveToJSON = function ()
	{             
		return {"start":this.start,
		        "end":this.end,
		        "diff":this.diff,
		        "value": this.value,
		        "pre_value":this.pre_value,
		        "easeType":this.easeType,
		        "update_flag":this.update_flag,
		        };
	};
	
	tweenParameterKlassProto.loadFromJSON = function (o)
	{
        this.start = o["start"];
        this.end = o["end"];
        this.diff = o["diff"];
        this.value = o["value"];
        this.pre_value = o["pre_value"];
        this.easeType = o["easeType"];
        this.update_flag = o["update_flag"];
	};		
	
	var get_tweenParameter = function (start, end, easeType)
	{
        var param = tweenParamsCache.allocLine();
        if (param)
            param.Reset(start, end, easeType);
        else
            param = new tweenParameterKlass(start, end, easeType);
        return param;   
	};	
	// tween

	// wait for signal
    var WaitForSignalTaskKlass = function(taskMgr, taskName, signalName, repeatCount) 
	{    
        this.typeName = "waitForSignal";
        this.Reset(taskMgr, taskName, signalName, repeatCount);
	};	
	var WaitForSignalTaskKlassProto = WaitForSignalTaskKlass.prototype;   
    
	WaitForSignalTaskKlassProto.Reset = function (taskMgr, taskName,  signalName, repeatCount) 
	{
        this.taskMgr = taskMgr;
        this.taskName = taskName;     
        this.signalName = signalName;
        this.parentTask = null;
        this.playRate = 1;
		this.repeatCount = repeatCount;
        this.destroyAfterDone = false;       
        
        if (!this.params)
            this.params = {};
        else
        {
            for(var n in this.params)
            {
                this.params[n].Destroy();
                delete this.params[n];
            }
        }        

        if (!this.bindInstInfo)
            this.bindInstInfo = {};
        
        this.bindInstInfo.uid = -1;        
        this.bindInstInfo.sid = -1;
        this.bindInstInfo.destroyAfterTaskDone = false;
	};
    
	WaitForSignalTaskKlassProto.BindInst = function (instUID, sid, destroyAfterTaskDone) 
	{           
        this.bindInstInfo.uid = instUID;
        this.bindInstInfo.sid = sid;        
        this.bindInstInfo.destroyAfterTaskDone = destroyAfterTaskDone;
	};    
      
	WaitForSignalTaskKlassProto.SetParentTask = function (parentTask) 
	{           
	    this.parentTask = parentTask;
	}; 
	    
	WaitForSignalTaskKlassProto.Start = function () 
	{
	};

	WaitForSignalTaskKlassProto.Tick = function (dt) 
	{
	};
    
	WaitForSignalTaskKlassProto.Continue = function (signalName) 
	{                   
        if (this.signalName === signalName)
            this.OnEnd();        
	};    
	
	WaitForSignalTaskKlassProto.OnEnd = function ()
	{
		if (this.repeatCount != 1)
        {
            this.repeatCount -= 1;
			this.Start();
		}
		else
		{
            this.taskMgr.OnTaskDone(this);
            
            if (this.bindInstInfo.destroyAfterTaskDone)
                this.taskMgr.DestroyInst(this.bindInstInfo.uid);   
                
			// end trigger
            if (this.parentTask)
                this.parentTask.OnChildTaskEnd(this);
            else if (this.destroyAfterDone)  // root task
                this.taskMgr.DestroyTask(this.taskName);  
		}    
	};
    
	WaitForSignalTaskKlassProto.Destroy = function () 
	{           
	    waitForSignalTasksCache.freeLine(this);        
	};

	WaitForSignalTaskKlassProto.GetRootTask = function () 
	{    
	    return (!this.parentTask)? this:this.parentTask.GetRootTask();
	};	
	
	WaitForSignalTaskKlassProto.saveToJSON = function ()
	{             
        var bindInstInfo_save = {"uid":this.bindInstInfo.uid,
                                 "sid":this.bindInstInfo.sid,
                                 "destroyAfterTaskDone":this.bindInstInfo.destroyAfterTaskDone
                                 };
        	    
		return {"typeName":this.typeName,
		        "taskName":this.taskName,
                "signalName":this.signalName,
		        "playRate":this.playRate,
		        "repeatCount":this.repeatCount,
		        "destroyAfterDone":this.destroyAfterDone,
		        "params":this.params,
		        "bindInstInfo": bindInstInfo_save,
		        };
	};
	
	WaitForSignalTaskKlassProto.loadFromJSON = function (o)
	{
        this.typeName = o["typeName"];   
	    this.taskName = o["taskName"];
        this.signalName = o["signalName"];
	    this.playRate = o["playRate"];
	    this.repeatCount = o["repeatCount"];
	    this.destroyAfterDone = o["destroyAfterDone"];
	       
	    this.params = o["params"];	    

	    var bindInstInfo = o["bindInstInfo"];
	    this.bindInstInfo.uid = bindInstInfo["uid"];
	    this.bindInstInfo.sid = bindInstInfo["sid"];	 
	    this.bindInstInfo.destroyAfterTaskDone = bindInstInfo["destroyAfterTaskDone"];	 
	};	
    // wait for signal
    
	// sequence tasks
    var SequenceTasksKlass = function(taskMgr, taskName, repeatCount) 
	{
        this.typeName = "sequence";
        this.Reset(taskMgr, taskName, repeatCount);
	};	
	var SequenceTasksKlassProto = SequenceTasksKlass.prototype;   
	    
	SequenceTasksKlassProto.Reset = function (taskMgr, taskName, repeatCount) 
	{           
        this.taskMgr = taskMgr;
        this.taskName = taskName;          
        this.parentTask = null; 
        this.playRate = 1;        
		this.repeatCount = repeatCount;
        this.destroyAfterDone = false;
        
        if (!this.tasks)
		    this.tasks = [];
        else
            this.tasks.length = 0;
            
		this.taskIndex = -1;
        this.actived_task = null;
        
        if (!this.params)
            this.params = {};
        else
        {
            for(var n in this.params)
            {
                this.params[n].Destroy();
                delete this.params[n];
            }
        } 
        
        if (!this.bindInstInfo)
            this.bindInstInfo = {};
        
        this.bindInstInfo.uid = -1;        
        this.bindInstInfo.sid = -1;
        this.bindInstInfo.destroyAfterTaskDone = false;               
	};    

	SequenceTasksKlassProto.BindInst = function (instUID, sid, destroyAfterTaskDone) 
	{           
        this.bindInstInfo.uid = instUID;
        this.bindInstInfo.sid = sid;        
        this.bindInstInfo.destroyAfterTaskDone = destroyAfterTaskDone;
        this.BindInstToChildrenTasks();
	};     

	SequenceTasksKlassProto.BindInstToChildrenTasks = function () 
	{           
        var i, cnt=this.tasks.length;
        for(i=0; i<cnt; i++)
        {
            this.tasks[i].BindInst(this.bindInstInfo.uid, this.bindInstInfo.sid, false);            
        }
	};	
	    
	SequenceTasksKlassProto.SetParentTask = function (parentTask) 
	{           
	    this.parentTask = parentTask;
	};
    
	SequenceTasksKlassProto.AddChildTask = function (childTask) 
	{
        childTask.SetParentTask(this);
	    this.tasks.push(childTask);
	    
	    if (this.bindInstInfo.uid >= 0)
	        this.BindInstToChildrenTasks();
	};
	
	SequenceTasksKlassProto.Start = function () 
	{
        if (this.tasks.length == 0)
        {
			// end trigger
            if (this.parentTask)
                this.parentTask.OnChildTaskEnd(this);
        }
        
	    this.taskIndex = -1;
        this.startSubTask();
	};
    
	SequenceTasksKlassProto.startSubTask = function () 
	{
        this.taskIndex += 1;
        if (this.taskIndex >= this.tasks.length)
        {
            this.OnEnd(); 
            return;
        }
        
        this.actived_task = this.tasks[this.taskIndex];
        this.actived_task.Start();
	};
    
	SequenceTasksKlassProto.Tick = function (dt) 
	{       
        dt *= this.playRate;
        this.actived_task.Tick(dt);
	};
    
	SequenceTasksKlassProto.Continue = function (signalName) 
	{                   
        this.actived_task.Continue(signalName);
	};    
	
	SequenceTasksKlassProto.OnEnd = function ()
	{
		if ((this.repeatCount != 1) && (this.tasks.length > 0))
        {
            this.repeatCount -= 1;
			this.Start();
		}
		else
		{
            this.taskMgr.OnTaskDone(this);

            if (this.bindInstInfo.destroyAfterTaskDone)
                this.taskMgr.DestroyInst(this.bindInstInfo.uid); 
                            
			// end trigger
            if (this.parentTask)
                this.parentTask.OnChildTaskEnd(this);
            else if (this.destroyAfterDone)  // root task
                this.taskMgr.DestroyTask(this.taskName);                
		}	
	};	
    
    SequenceTasksKlassProto.OnChildTaskEnd = function (task)
    {
        this.startSubTask();
    };
	SequenceTasksKlassProto.Destroy = function () 
	{           
	    sequenceTasksCache.freeLine(this);
	}; 

	SequenceTasksKlassProto.SetTaskParameter = function (name, value) 
	{           
	    this.params[name] = value;
	};
    
	SequenceTasksKlassProto.GetTaskParameter = function (name) 
	{    
        if (!this.params.hasOwnProperty(name))
        {
            if (this.parentTask)
                return this.parentTask.GetTaskParameter(name);
            else
                return null;
        }
        else
	        return this.params[name];
	};    

	SequenceTasksKlassProto.GetRootTask = function () 
	{    
	    return (!this.parentTask)? this:this.parentTask.GetRootTask();
	};	
	
	SequenceTasksKlassProto.saveToJSON = function ()
	{ 
        var tasks_save = [];
        var i,cnt=this.tasks.length;
        for(i=0; i<cnt; i++)
            tasks_save.push(this.tasks[i].saveToJSON());
            
        var bindInstInfo_save = {"uid":this.bindInstInfo.uid,
                                 "sid":this.bindInstInfo.sid,
                                 "destroyAfterTaskDone":this.bindInstInfo.destroyAfterTaskDone
                                 };
        	    
		return {"typeName":this.typeName,
		        "taskName":this.taskName,
		        "playRate":this.playRate,
		        "repeatCount":this.repeatCount,
		        "destroyAfterDone":this.destroyAfterDone,
		        "taskIndex":this.taskIndex,
		        "tasks":tasks_save,
		        "waitTasks": this.waitTasks,
		        "params":this.params,
		        "bindInstInfo": bindInstInfo_save,
		        };
	};
	
	SequenceTasksKlassProto.loadFromJSON = function (o)
	{
	    this.typeName = o["typeName"];
	    this.taskName = o["taskName"];
	    this.playRate = o["playRate"];
	    this.repeatCount = o["repeatCount"];
	    this.destroyAfterDone = o["destroyAfterDone"];
	    this.taskIndex = o["taskIndex"];
	    
	    var tasks_save = o["tasks"];
	    var i,cnt=tasks_save.length, task;
	    for (i=0; i<cnt; i++)
	    {
	        task = this.taskMgr.CreateTaskFromJSON(tasks_save[i]);
	        this.AddChildTask(task);
	    }

	    this.params = o["params"];	
	    var bindInstInfo = o["bindInstInfo"];
	    this.bindInstInfo.uid = bindInstInfo["uid"];
	    this.bindInstInfo.sid = bindInstInfo["sid"];	 
	    this.bindInstInfo.destroyAfterTaskDone = bindInstInfo["destroyAfterTaskDone"];	 	       
	    
        this.actived_task = this.tasks[this.taskIndex];	      
	};
	// sequence tasks    
	
	// parallel tasks
    var ParallelTasksKlass = function(taskMgr, taskName, repeatCount) 
	{
        this.typeName = "parallel";
        this.Reset(taskMgr, taskName, repeatCount);
	};	
	var ParallelTasksKlassProto = ParallelTasksKlass.prototype;   
	
	ParallelTasksKlassProto.Reset = function (taskMgr, taskName, repeatCount) 
	{           
        this.taskMgr = taskMgr;
        this.taskName = taskName;
        this.parentTask = null;
        this.playRate = 1;
		this.repeatCount = repeatCount;
        this.destroyAfterDone = false;
        
        if (!this.tasks)        
		    this.tasks = [];
        else
            this.tasks.length = 0;
            
        if (!this.waitTasks)
            this.waitTasks = {};
        else
        {
            for(var n in this.waitTasks)
                delete this.waitTasks[n];
        }
        
        if (!this.params)
            this.params = {};
        else
        {
            for(var n in this.params)
            {
                this.params[n].Destroy();
                delete this.params[n];
            }
        }  
        
        if (!this.bindInstInfo)
            this.bindInstInfo = {};
        
        this.bindInstInfo.uid = -1;        
        this.bindInstInfo.sid = -1;
        this.bindInstInfo.destroyAfterTaskDone = false;            
	};    

	ParallelTasksKlassProto.BindInst = function (instUID, sid, destroyAfterTaskDone) 
	{
        this.bindInstInfo.uid = instUID;
        this.bindInstInfo.sid = sid;        
        this.bindInstInfo.destroyAfterTaskDone = destroyAfterTaskDone;
        this.BindInstToChildrenTasks();
	};    
	ParallelTasksKlassProto.BindInstToChildrenTasks = function () 
	{           
        var i, cnt=this.tasks.length;
        for(i=0; i<cnt; i++)
        {
            this.tasks[i].BindInst(this.bindInstInfo.uid, this.bindInstInfo.sid, false);            
        }
	};	
		
	ParallelTasksKlassProto.SetParentTask = function (parentTask) 
	{           
	    this.parentTask = parentTask;
	};
    
	ParallelTasksKlassProto.AddChildTask = function (childTask) 
	{
        childTask.SetParentTask(this);
	    this.tasks.push(childTask);
	    
	    if (this.bindInstInfo.uid >= 0)
	        this.BindInstToChildrenTasks();
	};
	
	ParallelTasksKlassProto.Start = function () 
	{
        if (this.tasks.length == 0)
        {
			// end trigger
            if (this.parentTask)
                this.parentTask.OnChildTaskEnd(this);
        }
        
        this.startSubTask();    
	};
    
	ParallelTasksKlassProto.startSubTask = function () 
	{
        var i, cnt=this.tasks.length, childTask;
        for(i=0; i<cnt; i++)
        {
            childTask = this.tasks[i];
            this.waitTasks[childTask.taskName] = true;
            childTask.Start();
        }
	};    

	ParallelTasksKlassProto.Tick = function (dt) 
	{ 
        dt *= this.playRate;
        var i, cnt=this.tasks.length, childTask;
        for(i=0; i<cnt; i++)
        {
            childTask = this.tasks[i];
            if (this.waitTasks.hasOwnProperty(childTask.taskName))
                childTask.Tick(dt);
        }
	};
    
	ParallelTasksKlassProto.Continue = function (signalName) 
	{                   
        var i, cnt=this.tasks.length, childTask;
        for(i=0; i<cnt; i++)
        {
            childTask = this.tasks[i];
            if (this.waitTasks.hasOwnProperty(childTask.taskName))
                childTask.Continue(signalName);
        }
	};
	
	ParallelTasksKlassProto.OnEnd = function ()
	{
		if (this.repeatCount != 1)
        {
            this.repeatCount -= 1;
			this.Start();
		}
		else
		{
            this.taskMgr.OnTaskDone(this);
            
            if (this.bindInstInfo.destroyAfterTaskDone)
                this.taskMgr.DestroyInst(this.bindInstInfo.uid); 
                            
			// end trigger
            if (this.parentTask)
                this.parentTask.OnChildTaskEnd(this);
            else if (this.destroyAfterDone)  // root task
                this.taskMgr.DestroyTask(this.taskName);                 
		}	
	};
    
    ParallelTasksKlassProto.OnChildTaskEnd = function (task)
    {
        delete this.waitTasks[task.taskName];
        var is_empty = true;
        for (var n in this.waitTasks)
        {
            is_empty = false;
            break;
        }
        if (is_empty)
            this.OnEnd();
    };
    
	ParallelTasksKlassProto.Destroy = function () 
	{           
	    parallelTasksCache.freeLine(this);
	};    

	ParallelTasksKlassProto.SetTaskParameter = function (name, value) 
	{           
	    this.params[name] = value;
	};
    
	ParallelTasksKlassProto.GetTaskParameter = function (name) 
	{    
        if (!this.params.hasOwnProperty(name))
        {
            if (this.parentTask)
                return this.parentTask.GetTaskParameter(name);
            else
                return null;
        }
        else
	        return this.params[name];
	};     

	ParallelTasksKlassProto.GetRootTask = function () 
	{    
	    return (!this.parentTask)? this:this.parentTask.GetRootTask();
	};	
	
	ParallelTasksKlassProto.saveToJSON = function ()
	{
        var tasks_save = [];
        var i,cnt=this.tasks.length;
        for(i=0; i<cnt; i++)
            tasks_save.push(this.tasks[i].saveToJSON());
            
        var bindInstInfo_save = {"uid":this.bindInstInfo.uid,
                                 "sid":this.bindInstInfo.sid,
                                 "destroyAfterTaskDone":this.bindInstInfo.destroyAfterTaskDone
                                 };
        	    
		return {"typeName":this.typeName,
		        "taskName":this.taskName,
		        "playRate":this.playRate,
		        "repeatCount":this.repeatCount,
		        "destroyAfterDone":this.destroyAfterDone,
		        "tasks":tasks_save,
		        "waitTasks": this.waitTasks,
		        "params":this.params,
		        "bindInstInfo": bindInstInfo_save,
		        };
	};
	
	ParallelTasksKlassProto.loadFromJSON = function (o)
	{
	    this.typeName = o["typeName"];
	    this.taskName = o["taskName"];
	    this.playRate = o["playRate"];
	    this.repeatCount = o["repeatCount"];
	    this.destroyAfterDone = o["destroyAfterDone"];
	    
	    var tasks_save = o["tasks"];
	    var i,cnt=tasks_save.length, task;
	    for (i=0; i<cnt; i++)
	    {
	        task = this.taskMgr.CreateTaskFromJSON(tasks_save[i]);
	        this.AddChildTask(task);
	    }
	    
	    this.waitTasks = o["waitTasks"];
	    this.params = o["params"];	    
	    var bindInstInfo = o["bindInstInfo"];
	    this.bindInstInfo.uid = bindInstInfo["uid"];
	    this.bindInstInfo.sid = bindInstInfo["sid"];	 
	    this.bindInstInfo.destroyAfterTaskDone = bindInstInfo["destroyAfterTaskDone"];	 	       
	    
	};	
	// parallel tasks
    
    
    //var taskKlass = function() { };	
	//var taskKlassProto = taskKlass.prototype; 
    //taskKlassProto.SetParentTask = function (parentTask) {};
	//taskKlassProto.BindInst = function (instUID, sid, destroyAfterTaskDone) {};     
	//taskKlassProto.Start = function () {};
	//taskKlassProto.Tick = function (dt) {};
	//taskKlassProto.OnEnd = function () {};
    //taskKlassProto.OnChildTaskEnd = function (task) {}; 
    //taskKlassProto.Destroy = function () {}; 
    //taskKlassProto.SetTaskParameter = function (name, value) {};  
    //taskKlassProto.GetTaskParameter = function (name) {};
    //taskKlassProto.GetRootTask = function () {};         
    //taskKlassProto.saveToJSON = function () {};  
    //taskKlassProto.loadFromJSON = function (o) {}; 
    
    var TasksMgrKlass = function(plugin) 
	{    
        this.plugin = plugin;
        this.candidate_tasks = {};
        this.activated_tasks = [];      
        this.idle_tasks = {}; 
        this.suspend_tasks = {};    
          
        this.inactivated_tasksLists = [this.candidate_tasks, this.idle_tasks, this.suspend_tasks];
        this.process_queue = [];
        this.activated_taskIndexes = {};
	};	
	var TasksMgrKlassProto = TasksMgrKlass.prototype;   
    
    TasksMgrKlassProto.GetCandidateTask = function (taskName, is_pop)
    {
        var task = this.candidate_tasks[taskName];
        if (is_pop && task)
            delete this.candidate_tasks[taskName];
        return task;        
    };    
    TasksMgrKlassProto.GetActivatedTask = function (taskName)
    {
        if (!this.activated_taskIndexes.hasOwnProperty(taskName))
            return null;
            
        var idx = this.activated_taskIndexes[taskName];
        return this.activated_tasks[idx];     
    };        
    TasksMgrKlassProto.GetTask = function (taskName, all_lists)
    {
        if (all_lists)
        {
            if (this.activated_taskIndexes.hasOwnProperty(taskName))
            {
                var idx = this.activated_taskIndexes[taskName];
                return this.activated_tasks[idx];
            }
        }
        
        var i, cnt=this.inactivated_tasksLists.length, tasks;
        for(i=0; i<cnt; i++)
        {
            tasks = this.inactivated_tasksLists[i];
            if (tasks.hasOwnProperty(taskName))
                return tasks[taskName];
        }
        return null;        
    };    
    TasksMgrKlassProto.CreateTweenTask = function (taskName, fnName, interval, repeatCount)
    {
        var task = this.get_tweenTask(taskName, fnName, interval, repeatCount);               
        this.candidate_tasks[taskName] = task;
        return task;        
    };   
    TasksMgrKlassProto.CreateWaitTask = function (taskName, interval)
    {
        var task = this.get_waitTask(taskName, interval);
        this.candidate_tasks[taskName] = task;
        return task;
    };    
    TasksMgrKlassProto.CreateSequenceTask = function (taskName, repeatCount)
    {
        var task = this.get_sequenceTask(taskName, repeatCount);
        this.candidate_tasks[taskName] = task;
        return task;        
    }; 
    TasksMgrKlassProto.CreateParallelTask = function (taskName, repeatCount)
    {
        var task = this.get_parallelTask(taskName, repeatCount);
        this.candidate_tasks[taskName] = task;
        return task;        
    };   
	TasksMgrKlassProto.CreateInversedTask = function (taskName, targetTaskName)
	{
	    var targetTask = this.GetCandidateTask(targetTaskName);
	    if (!targetTask.CreateInversedTask)
	        return;
	        
	    var task = targetTask.CreateInversedTask(taskName);
        return task;
	};
    TasksMgrKlassProto.CreateWaitForSignalTask = function (taskName, signalName)
    {
        var task = this.get_waitForSignalTask(taskName, signalName);
        this.candidate_tasks[taskName] = task;
        return task;
    };       
    TasksMgrKlassProto.CreateTaskFromJSON = function (o)
    {
        var task;
        switch (o["typeName"])
        {
        case "tween": 
        case "wait": 
            task=this.get_tweenTask("", "", 0, 0); 
            break;
        case "sequence": 
            task=this.get_sequenceTask("", 0); 
            break;                
        case "parallel": 
            task=this.get_parallelTask("", 0); 
            break;  
        case "waitForSignal": 
            task=this.get_waitForSignalTask("", ""); 
            break;               
        }
        task.loadFromJSON(o);
        return task;        
    };  	      
      
	TasksMgrKlassProto.AddChildTask = function (parent_taskName, child_taskName)
	{       
        var parent_task = this.GetCandidateTask(parent_taskName);  
        if (!parent_task)
            return;
        
        if (!parent_task.AddChildTask)
            return;
            
        var child_task = this.GetCandidateTask(child_taskName, true);  
        if (!child_task)
            return;
        parent_task.AddChildTask(child_task);
	};     
    TasksMgrKlassProto.StartTask = function (taskName, destroyAfterDone)
    {
        var task;
        if (this.activated_tasks.hasOwnProperty(taskName))  // ignore activated_tasks
        {
        }
        else if (this.suspend_tasks.hasOwnProperty(taskName)) // ignore suspend_tasks
        {
        }        
        else if (this.idle_tasks.hasOwnProperty(taskName))  // start idle_tasks
        {
            task = this.idle_tasks[taskName];
            delete this.idle_tasks[taskName];
        }
        else if (this.candidate_tasks.hasOwnProperty(taskName))  // start candidate_tasks
        {
            task = this.candidate_tasks[taskName];
            delete this.candidate_tasks[taskName];
        }
        
        if (task)
        {
            this.activated_tasks.push(task);
            this.update_activated_taskIndex(true);
            task.destroyAfterDone = (destroyAfterDone == 1);
            task.Start();
        }        
    };
    TasksMgrKlassProto.PauseTask = function (taskName)
    {
        this.set_task_suspend(taskName);
    };
    TasksMgrKlassProto.ResumeTask = function (taskName)
    {
        if (!this.suspend_tasks.hasOwnProperty(taskName))
            return;
            
        var task = this.suspend_tasks[taskName];
        delete this.suspend_tasks[taskName];
        this.activated_tasks.push(task);
        this.update_activated_taskIndex(true);
    };    
    TasksMgrKlassProto.DestroyTask = function (taskName)
    {
        var task;
        var i, cnt=this.inactivated_tasksLists.length, tasks;
        for(i=0; i<cnt; i++)
        {
            tasks = this.inactivated_tasksLists[i];
            if (!tasks.hasOwnProperty(taskName))
                continue;
            
            task = tasks[taskName];
            delete tasks[taskName];
            task.Destroy();
        }
        
        this.DestroyActivatedTask(taskName);
    };
    TasksMgrKlassProto.DestroyActivatedTask = function (taskName)
    {
        var task = this.pop_activated_task(taskName);
        if (task)
            task.Destroy();
    };        
    TasksMgrKlassProto.Tick = function (dt) 
    {
        // remove tasks which bound instance had been destroyed
        var i,cnt=this.activated_tasks.length, task;
        for (i=0; i<cnt; i++)
        {
            task = this.activated_tasks[i];
            if (this.IsBoundInstDestroyed(task.bindInstInfo.uid))            
                this.DestroyActivatedTask(task.taskName);
            else
                this.process_queue.push(task);
        }
	    
	    // run tick handler       
        var i,cnt=this.process_queue.length;
        for (i=0; i<cnt; i++)
        {
            this.process_queue[i].Tick(dt);
        }
        
        this.process_queue.length = 0;
    };
    TasksMgrKlassProto.OnTaskDone = function (task)
    {
        this.set_task_idle(task.taskName);
        // else : subTasks
        this.plugin.OnTaskDone(task.taskName);       
    };
    TasksMgrKlassProto.CallFunction = function (taskName, fnName, fnParams, percentage, bindInstUID, bindInstTypeSID) 
    {
        this.plugin.CallFunction(taskName, fnName, fnParams, percentage, bindInstUID, bindInstTypeSID);
    };
	TasksMgrKlassProto.SetTaskParameter = function (taskName, paramName, paramValue)
	{       
        var task = this.tasksMgr.GetTask(taskName, true);
        if (!task)
            return;
        
        task.SetTaskParameter(paramName, paramValue);
	}; 
	TasksMgrKlassProto.GetTaskParameter = function (taskName, paramName)
	{       
        var task = this.tasksMgr.GetTask(taskName, true);
        if (!task)
            return;
        
        return task.GetTaskParameter(paramName);
	};
	TasksMgrKlassProto.ContinueTasks = function (taskName, signalName)
	{
        if (taskName)
        {
            var task = this.GetActivatedTask(taskName);
            if (!task)
                return;
            
            task.Continue(signalName);
        }
        else
        {
            // copy activated_tasks to process_queue
            var i,cnt=this.activated_tasks.length;
            for (i=0; i<cnt; i++)
                this.process_queue.push(this.activated_tasks[i]);
	    
	        // run Continue function
            for (i=0; i<cnt; i++)
                this.process_queue[i].Continue(signalName);            
        
            this.process_queue.length = 0;
        }
	};
    TasksMgrKlassProto.DestroyInst = function (uid) 
    {
        var runtime = this.plugin.runtime;
        var inst = runtime.getObjectByUID(uid);
        if (!inst)
            return;
        
        runtime.DestroyInstance(inst);
    };   
	TasksMgrKlassProto.IsBoundInstDestroyed = function (uid) 
	{           
	    if (uid < 0)
	        return false;
	    var inst = this.plugin.runtime.getObjectByUID(uid);
	    return (!inst);
	}; 
    TasksMgrKlassProto.CleanAll = function ()
    {
        var i, cnt=this.inactivated_tasksLists.length, tasks;
        var n, task;
        for(i=0; i<cnt; i++)
        {
            tasks = this.inactivated_tasksLists[i];
	        for (n in tasks)
            {
                task = tasks[n];
                delete tasks[n];
                task.Destroy();
            } 
        }    
  
        var i,cnt=this.activated_tasks.length, task;
        for (i=0; i<cnt; i++)
        {
            task = this.activated_tasks[i];
            task.Destroy();
        }
        this.activated_tasks.length = 0;
    };     
	TasksMgrKlassProto.saveToJSON = function ()
	{
	    var candidate_tasks_save = {};
	    for (var n in this.candidate_tasks)
	        candidate_tasks_save[n] = this.candidate_tasks[n].saveToJSON();
	        
	    var activated_tasks_save = [];
	    var i, cnt=this.activated_tasks.length;
	    for (i=0; i<cnt; i++)
	        activated_tasks_save.push(this.activated_tasks[i].saveToJSON()); 
                 

	    var idle_tasks_save = {};
	    for (var n in this.idle_tasks)
	        idle_tasks_save[n] = this.idle_tasks[n].saveToJSON();	        

	    var suspend_tasks_save = {};
	    for (var n in this.suspend_tasks)
	        suspend_tasks_save[n] = this.suspend_tasks[n].saveToJSON();	
	        
		return {"cs": candidate_tasks_save,
		        "as": activated_tasks_save,
                "aname2idx": this.activated_taskIndexes,
		        "is": idle_tasks_save,
		        "ss": suspend_tasks_save};
	};
	
	TasksMgrKlassProto.loadFromJSON = function (o)
	{    
        this.CleanAll();
        
	    var task, tasks_save, n;
	    tasks_save = o["cs"];
	    for (n in tasks_save)
	    {
	        task = this.CreateTaskFromJSON(tasks_save[n]);
	        this.candidate_tasks[n] = task;
	    }
	   
	    tasks_save = o["as"];
	    var i, cnt=tasks_save.length;
	    for (i=0; i<cnt; i++)
	    {
	        task = this.CreateTaskFromJSON(tasks_save[i]);
	        this.activated_tasks.push(task);
	    }
        this.activated_taskIndexes = o["aname2idx"];	    	   
               
	    tasks_save = o["is"];
	    for (n in tasks_save)
	    {
	        task = this.CreateTaskFromJSON(tasks_save[n]);
	        this.idle_tasks[n] = task;
	    }	        

	    tasks_save = o["ss"];
	    for (n in tasks_save)
	    {
	        task = this.CreateTaskFromJSON(tasks_save[n]);
	        this.suspend_tasks[n] = task;
	    }	       
	};	
    
    // internal    
    TasksMgrKlassProto.update_activated_taskIndex = function (is_push) 
    {
        var n;
        if (is_push)
        {
            var last_index = this.activated_tasks.length -1;
            var n = this.activated_tasks[last_index].taskName;
            this.activated_taskIndexes[n] = last_index;
        }
        else
        {
            for (var n in this.activated_taskIndexes)
                delete this.activated_taskIndexes[n];
        
            var i,cnt=this.activated_tasks.length;
            for (i=0; i<cnt; i++)
            { 
                n = this.activated_tasks[i].taskName;
                this.activated_taskIndexes[n] = i;
            }
        }
    };
    TasksMgrKlassProto.pop_activated_task = function (taskName)
    {
        var task;
        if (this.activated_taskIndexes.hasOwnProperty(taskName))
        {
            var idx = this.activated_taskIndexes[taskName];
            task = this.activated_tasks[idx];
            cr.arrayRemove(this.activated_tasks, idx);           
            this.update_activated_taskIndex();
        }
        return task;
    }; 
    TasksMgrKlassProto.set_task_idle = function (taskName)
    {
        var task = this.pop_activated_task(taskName);
        if (task)
            this.idle_tasks[taskName] = task;
    };
    TasksMgrKlassProto.set_task_suspend = function (taskName)
    {
        var task = this.pop_activated_task(taskName);
        if (task)
            this.suspend_tasks[taskName] = task;
    };    
    TasksMgrKlassProto.get_tweenTask = function(taskName, fnName, interval, repeatCount)
    {
        var task = tweenTasksCache.allocLine();
        if (task == null)
            task = new TweenTaskKlass(this, taskName, fnName, interval, repeatCount);
        else
            task.Reset(this, taskName, fnName, interval, repeatCount);
        
        return task;
    };
    TasksMgrKlassProto.get_waitTask = function(taskName, interval)
    {
        var task = tweenTasksCache.allocLine();
        if (task == null)
            task = new TweenTaskKlass(this, taskName, null, interval, 1);
        else
            task.Reset(this, taskName, null, interval, 1);
        
        task.typeName = "wait";
        return task;
    };
    TasksMgrKlassProto.get_waitForSignalTask = function(taskName, signalName)
    {
        var task = waitForSignalTasksCache.allocLine();
        if (task == null)
            task = new WaitForSignalTaskKlass(this, taskName, signalName, 1);
        else
            task.Reset(this, taskName, signalName, 1);
        
        task.typeName = "waitForSignal";
        return task;
    };    
    TasksMgrKlassProto.get_sequenceTask = function(taskName, repeatCount)
    {
        var task = sequenceTasksCache.allocLine();
        if (task == null)
            task = new SequenceTasksKlass(this, taskName, repeatCount);
        else
            task.Reset(this, taskName, repeatCount);
        
        return task;
    };    
    TasksMgrKlassProto.get_parallelTask = function(taskName, repeatCount)
    {
        var task = sequenceTasksCache.allocLine();
        if (task == null)
            task = new ParallelTasksKlass(this, taskName, repeatCount);
        else
            task.Reset(this, taskName, repeatCount);
        
        return task;
    }; 
    
    var clean_table = function (o)
    {
        for (var k in o)
            delete o[k];
    };
    
	/**BEGIN-PREVIEWONLY**/
	TasksMgrKlassProto.getDebuggerValues = function (propsections)
	{
	    var i,cnt=this.activated_tasks.length;
        for(i=0; i<cnt; i++)        
            propsections.push({"name": this.activated_tasks[i].taskName, "value": "Activated"});        
        
        for(var n in this.idle_tasks)
            propsections.push({"name": this.idle_tasks[n].taskName, "value": "Idle"});
            
        for(var n in this.suspend_tasks)
            propsections.push({"name": this.suspend_tasks[n].taskName, "value": "Suspend"}); 

        for(var n in this.candidate_tasks)
            propsections.push({"name": "* "+this.candidate_tasks[n].taskName, "value": "Candidate"});             
	};
	/**END-PREVIEWONLY**/     
    // internal
    
    cr.plugins_.Rex_TweenTasks.TasksMgrKlass = TasksMgrKlass;
}());