// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// load lua.vm.js
// document.write('<script src="lua.vm.js"></script>');

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_luaVM = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_luaVM.prototype;
		
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
	var FNTYPE_OFFICIALFN = 3;  // official function
	instanceProto._setup_callback = function (raise_assert_when_not_fnobj_avaiable)
	{
        if (raise_assert_when_not_fnobj_avaiable)
        {
            var has_func = (cr.plugins_.Function != null);
            assert2(has_func, "Function extension or official function, or rex_function was not found.");
        }

        var plugins = this.runtime.types;			
        var name, inst;
	
        // try to get callback from official function
		if (cr.plugins_.Function != null)    
		{	
            this._exp_call = cr.plugins_.Function.prototype.exps.Call;			
            for (name in plugins)
            {
			    inst = plugins[name].instances[0];
				if (inst instanceof cr.plugins_.Function.prototype.Instance)
				{
				    this._fnobj = inst;
					this._fnobj_type = FNTYPE_OFFICIALFN;
                    return;
				}                                      
            }
		}
		
        this._fnobj_type = FNTYPE_NA;  // function object is not avaiable
	};   
	
    instanceProto.Call = function(params, raise_assert_when_not_fnobj_avaiable)
    {
	    // params = [ ret, name, param0, param1, ... ]
	    if (this._fnobj_type == FNTYPE_UK)
	        this._setup_callback(raise_assert_when_not_fnobj_avaiable);
        
	    switch (this._fnobj_type)
		{
		case FNTYPE_OFFICIALFN:  // official function
		    this._exp_call.apply(this._fnobj, params);
			break;
		}      

        return (this._fnobj_type != FNTYPE_NA);  
    };
	// expression:Call in function object
	var fake_ret = {value:0,
	                set_any: function(value){this.value=value;},
	                set_int: function(value){this.value=value;},	 
                    set_float: function(value){this.value=value;},	                          
	               };    
    var _params = [];
	var _thisArg = null;
	var _getvalue_from_c2fn = function()
	{
	    _params.length = 0;
		_params.push(fake_ret);
		var i, cnt=arguments.length;
		for (i=0; i<cnt; i++)
		    _params.push(arguments[i]);
			
        var has_fnobj = _thisArg.Call(_params, true);     
        assert2(has_fnobj, "Lua VM: Can not find callback object.");
		return fake_ret.value;
	};
    
    var run_init_code = function()
    {
        window["__luavm__"] = {
            "Call":             _getvalue_from_c2fn,
            "TimerStart":       _timer_start,
            "OnTaskStarted":    _on_task_started,
            "OnTaskResumed":    _on_task_resumed,
            "OnTaskFinished":   _on_task_finished,
            "OnTaskKilled":     _on_task_killed,
            "OnTaskSuspended":  _on_task_suspended,
            "TimerRemove":      _timer_remove,
        };
        
	    var init = "\
Call = js.global.__luavm__.Call\n\
";
        window["Lua"]["execute"](init);	
        
        var init_tasks = "\
Wait = coroutine.yield\n\
Tasks = {}\n\
Tasks['tasks'] = {}\n\
Tasks['on_task_started'] = js.global.__luavm__.OnTaskStarted\n\
Tasks['on_task_resumed'] = js.global.__luavm__.OnTaskResumed\n\
Tasks['on_task_finished'] = js.global.__luavm__.OnTaskFinished\n\
Tasks['on_task_killed'] = js.global.__luavm__.OnTaskKilled\n\
Tasks['on_task_suspended'] = js.global.__luavm__.OnTaskSuspended\n\
Tasks['waiting_tasks'] = {}\n\
Tasks['timer_start'] = js.global.__luavm__.TimerStart\n\
Tasks['timer_remove'] = js.global.__luavm__.TimerRemove\n\
function TaskRun(tn, fn, ...)\n\
    local t = Tasks.tasks[tn]\n\
    if t == nil then\n\
	    if fn == nil then\n\
	        print('Task ' .. tn .. ' could not be created.')\n\
            return\n\
        end\n\
		t = coroutine.create(fn)\n\
        Tasks.tasks[tn] = t\n\
	end\n\
    if fn == nil then\n\
        Tasks.on_task_resumed(tn)\n\
    else\n\
        Tasks.on_task_started(tn)\n\
    end\n\
    is_alive, key = coroutine.resume(t, ...)\n\
    Tasks.on_task_suspended(tn)\n\
    if type(key) == 'number' then\n\
        Tasks.timer_start(key, tn)\n\
    elseif type(key) == 'string' then\n\
        Tasks.waiting_tasks[tn] = key\n\
    else\n\
        Tasks.waiting_tasks[tn] = true\n\
    end\n\
    is_dead = coroutine.status(t) == 'dead'\n\
	if is_dead then\n\
        Tasks.tasks[tn] = nil\n\
        Tasks.on_task_finished(tn)\n\
    end\n\
end\n\
function TaskStart(tn, fn, ...)\n\
    TaskRun(tn, fn, ...)\n\
end\n\
function TaskResume(tn, key)\n\
    if Tasks.tasks[tn] == nil then return end\n\
    local k = Tasks.waiting_tasks[tn]\n\
    if k == nil then return end\n\
    if key ~= nil and type(k) == 'string' and k ~= key then return end\n\
    Tasks.waiting_tasks[tn] = nil\n\
    TaskRun(tn, nil)\n\
end\n\
function TaskKill(tn)\n\
    if Tasks.tasks[tn] == nil then return end\n\
    if Tasks.waiting_tasks[tn] then\n\
        Tasks.waiting_tasks[tn] = nil\n\
    else\n\
        Tasks.timer_remove(tn)\n\
    end\n\
    Tasks.tasks[tn] = nil\n\
    Tasks.on_task_killed(tn)\n\
end\n\
function TaskKillAll()\n\
    for tn,i in pairs(Tasks.tasks) do\n\
        TaskKill(tn)\n\
    end\n\
end\n\
";
        window["Lua"]["execute"](init_tasks);	    
    };

	instanceProto.onCreate = function()
	{
	    // link to official function
        this._fnobj = null;
        this._fnobj_type = FNTYPE_UK;
	    this._act_call_fn = null;
		this._exp_call = null;              

        // timers
	    this.timer_cache = new TimerCacheKlass(this);        
        this.timers = {};  // map task name to timer
        this.timers_save = null;     
 
        // save/load 
        this.timeline = null;  
        this.timelineUid = -1;    // for loading     		
        
        // exp
        this.exp_TaskName = "";
        
		_thisArg = this;   
        run_init_code();        
	};
    
    instanceProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Luavm: Can not find timeline oject.");
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
        assert2(this.timeline, "Luavm: Can not find timeline oject.");
        return null;	
    };
        
	var _timer_start = function (delay_time, task_name)
	{
        var timer = _thisArg.timer_cache.alloc(_thisArg, _thisArg._on_timeout);
        _thisArg.timers[task_name] = timer;
        var args = timer.GetCallbackArgs();
        args.push(task_name);
        timer.Start(delay_time);
	};
    
	var _timer_remove = function (task_name)
	{
        var timer = _thisArg.timers[task_name];
        if (timer == null)
            return;
           
        timer.Remove();
        _thisArg.timer_cache.free(timer);
        delete _thisArg.timers[task_name];
	};     
    
	instanceProto._on_timeout = function (task_name)
	{  
        var timer = this.timers[task_name];
        this.timer_cache.free(timer);
        delete this.timers[task_name];
	    var s = "TaskRun('" + task_name + "', nil)";
        window["Lua"].execute(s);
	};   
    
    var _on_task_started = function (task_name)
    {
        _thisArg.exp_TaskName = task_name;
        _thisArg.runtime.trigger(cr.plugins_.Rex_luaVM.prototype.cnds.OnTaskStarted, _thisArg);
    };
    var _on_task_resumed = function (task_name)
    {
        _thisArg.exp_TaskName = task_name;
        _thisArg.runtime.trigger(cr.plugins_.Rex_luaVM.prototype.cnds.OnTaskResumed, _thisArg);
    };    
    var _on_task_finished = function (task_name)
    {
        _thisArg.exp_TaskName = task_name;
        _thisArg.runtime.trigger(cr.plugins_.Rex_luaVM.prototype.cnds.OnTaskFinished, _thisArg);
    };        
    var _on_task_killed = function (task_name)
    {
        _thisArg.exp_TaskName = task_name;
        _thisArg.runtime.trigger(cr.plugins_.Rex_luaVM.prototype.cnds.OnTaskKilled, _thisArg);
    }; 
    var _on_task_suspended = function (task_name)
    {
        _thisArg.exp_TaskName = task_name;
        _thisArg.runtime.trigger(cr.plugins_.Rex_luaVM.prototype.cnds.OnTaskSuspended, _thisArg);
    }; 
    
	instanceProto.onDestroy = function ()
	{
	};

	instanceProto.saveToJSON = function ()
	{ 
        var name, timer_save = {};        
        for (name in this.timers)
        {
            timer_save[name] = this.timers[name].saveToJSON();
        }
		return { "tlUid": (this.timeline != null)? this.timeline.uid : (-1),
                 "timers": timer_save,
                 };
	};
    
	instanceProto.loadFromJSON = function (o)
	{
	    this.timelineUid = o["tlUid"];
        this.timers_save = o["timers"];
	};  

	instanceProto.afterLoad = function ()
	{
		if (this.timelineUid === -1)
			this.timeline = null;
		else
		{
			this.timeline = this.runtime.getObjectByUID(this.timelineUid);
			assert2(this.timeline, "Lua VM: Failed to find timeline object by UID");
		}
        var name, timer, args;
        for (name in this.timers_save)
        {
            timer = this.timer_cache.alloc(this, this._on_timeout);
            args = timer.GetCallbackArgs();
            args.push(name);
            timer.loadFromJSON(this.timers_save[name]);            
            timer.afterLoad();
            this.timers[name] = timer;            
        }
        this.timers_save = null;        
	}; 	
    
    var TimerCacheKlass = function (plugin)
    {        
        this.plugin = plugin;
        this.timer_cache = [];  
    };
    var TimerCacheKlassProto = TimerCacheKlass.prototype;   
    
	TimerCacheKlassProto.alloc = function(thisArg, timeout_handler)
	{
        var timer;
        if (this.timer_cache.length > 0)
            timer = this.timer_cache.pop();
        else
            timer = this.plugin._timeline_get().CreateTimer(thisArg, timeout_handler);
            
		return timer;
	};

	TimerCacheKlassProto.free = function(timer)
	{
        this.timer_cache.push(timer);
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
   
	Cnds.prototype.OnTaskStarted = function ()
	{
		return true;
	};  

	Cnds.prototype.OnTaskResumed = function ()
	{
		return true;
	}; 
	
	Cnds.prototype.OnTaskFinished = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnTaskKilled = function ()
	{
		return true;
	};  

	Cnds.prototype.OnTaskSuspended = function ()
	{
		return true;
	};	  
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.RunScript = function (s)
	{
        window["Lua"]["execute"](s);
	};
    
    Acts.prototype.TaskStart = function (task_name, function_name, params_)
	{
	    var arg_string = params_.join(",");
	    if (params_.length > 0)
	        arg_string = ", " + arg_string;
	    var s = "TaskStart('" + task_name + "', " + function_name + arg_string + ")";
        window["Lua"]["execute"](s);
	};	
    
    Acts.prototype.TaskResume = function (task_name, key)
	{
	    if (key == null)
	        key = "nil";
	    else
	        key = "'" + key + "'";
	    var s = "TaskResume('" + task_name + "', " + key +")";
	    log(s);
        window["Lua"]["execute"](s);
	};	
    
    Acts.prototype.TaskKill = function (task_name)
	{
	    var s = "TaskKill('" + task_name + "')";
        window["Lua"]["execute"](s);    
	};	
    
    Acts.prototype.TaskKillAll = function ()
	{
	    var s = "TaskKillAll()";
        window["Lua"]["execute"](s);       
	};	    
    
    Acts.prototype.Setup2 = function (timeline_objs)
	{  
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.timeline = timeline;        
        else
            alert ("Lua VM should connect to a timeline object");
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.TaskName = function(ret)
	{
		ret.set_string(this.exp_TaskName);
	};
}());