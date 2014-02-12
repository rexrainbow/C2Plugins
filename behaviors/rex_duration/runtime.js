// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Duration = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Duration.prototype;
		
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
        this.callback = null;     // deprecated
        this.callbackUid = -1;    // for loading   // deprecated     
	};
	
    behtypeProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Duration behavior: Can not find timeline oject.");
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
        assert2(this.timeline, "Duration behavior: Can not find timeline oject.");
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
        this.timers = {};
        this._trigger_duration_name = "";        
        this._timers_dead_pool = [];   
        this.is_my_call = false;  
        this.timers_save = null;      
	};
    
	behinstProto.onDestroy = function()
	{
        var name, timer;
        for (name in this.timers)
            this.timers[name].Remove();        
	};    
    
    
	behinstProto._create_timer = function ()
	{
        var timer;
        if (this._timers_dead_pool.length > 0)
            timer = this._timers_dead_pool.pop()
        else
            timer = this.type._timeline_get().CreateTimer(this, this._timer_handle);       
        return timer;
	};
    
	behinstProto._destroy_timer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        delete this.timers[timer_name];
        if (this._timers_dead_pool.length < 3)
            this._timers_dead_pool.push(timer);            
	};
    
	behinstProto.tick = function ()
	{
	};

    behinstProto._exec_callback = function(callback)
    {
        if (typeof(callback) != "string")
        {
            this.is_my_call = true;
            this.runtime.trigger(callback, this.inst); 
            this.is_my_call = false;
        }
        else // ---- deprecated ----
        {
            if (callback == "")
                return;
            
            // setup sol
            var sol = this.type.objtype.getCurrentSol();
            sol.select_all = false;
	        sol.instances.length = 1;        
            sol.instances[0] = this.inst;
            this.type.objtype.applySolToContainer();
            // call function object
		    var has_rex_function = (this.type.callback != null);
		    if (has_rex_function)
     		    this.type.callback.CallFn(callback, []);     			
		    else
		    {
		        var has_fnobj = this.type.timeline.RunCallback(callback, [], true);           
		        assert2(has_fnobj, "Timer: Can not find callback oject.");
            }
        }   // ---- deprecated ----        
    };
    
    var cb_on_start_get = function(timer)
    {
        var cb = timer.extra.cb_on_start;
        return (cb == null)? cr.behaviors.Rex_Duration.prototype.cnds.OnStart : cb;
    };    
    var cb_on_interval_get = function(timer)
    {
        var cb = timer.extra.cb_on_interval;
        return (cb == null)? cr.behaviors.Rex_Duration.prototype.cnds.OnInterval : cb;
    };
    var cb_on_end_get = function(timer)
    {
        var cb = timer.extra.cb_on_end;
        return (cb == null)? cr.behaviors.Rex_Duration.prototype.cnds.OnEnd : cb;
    };
    behinstProto._timer_handle = function(duration_name)
    {
        var timer = this.timers[duration_name];
        this._trigger_duration_name = duration_name;
        var duration_remain = timer.extra.duration_remain_time;
        var interval = timer.extra.interval_time;
                
        // run start callback
        if (timer.extra.is_start)
        {
            timer.extra.is_start = false;
            this._exec_callback(cb_on_start_get(timer));
        }
        else  // others
        {
            if (duration_remain <= interval)
            {
                timer.extra.duration_remain_time = 0;
                if (duration_remain == interval)
                    this._exec_callback(cb_on_interval_get(timer));               
                this._exec_callback(cb_on_end_get(timer)); 
            }
            else
            {
                duration_remain -= interval;         
                timer.extra.duration_remain_time = duration_remain;
                this._exec_callback(cb_on_interval_get(timer));               
            }
        }
        
        if (timer.extra.duration_remain_time > 0)
            timer.Start(Math.min(duration_remain, interval)); 
        else
            this.DurationRemove(duration_name);
    };
    
    var remain_time_get = function (timer)
    {
        return timer.extra.duration_remain_time - timer.ElapsedTimeGet();
    };
    
    behinstProto.DurationRemove = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer == null)
            return;

        timer.Remove();
        this._destroy_timer(duration_name);
	};
	
	behinstProto.saveToJSON = function ()
	{ 
	    var tims_save = {};
        var name, tims = this.timers;
        for (name in tims)        
            tims_save[name] = tims[name].saveToJSON();                
		return { "tims": tims_save,
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1),
                 "cbuid": (this.type.callback != null)? this.type.callback.uid: (-1)    // deprecated
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.timers_save = o["tims"];
        this.type.timelineUid = o["tluid"];
        this.type.callbackUid = o["cbuid"];   // deprecated     
	};
    
	behinstProto.afterLoad = function ()
	{
		if (this.type.timelineUid === -1)
			this.type.timeline = null;
		else
		{
			this.type.timeline = this.runtime.getObjectByUID(this.type.timelineUid);
			assert2(this.type.timeline, "Timer: Failed to find timeline object by UID");
		}		
        
        // ---- deprecated ----
		if (this.type.callbackUid === -1)
			this.type.callback = null;
		else
		{
			this.type.callback = this.runtime.getObjectByUID(this.type.callbackUid);
			assert2(this.type.callback, "Timer: Failed to find rex_function object by UID");
		}		
		// ---- deprecated ----          
        
        if (this.timers_save == null)
            this.timers = {};
        else
        {
            var name, tims=this.timers, tims_save=this.timers_save, tl=this.type.timeline;
            for (name in tims_save)   
                tims[name] = tl.LoadTimer(this, this._timer_handle, [name], tims_save[name]);    
        }     
        this.timers_save = null;        
	}; 	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsRunning = function (name)
	{  
        var timer = this.timers[name];        
        return (timer != null);
	};
    
	Cnds.prototype.OnStart = function (name)
	{       
        return ((this._trigger_duration_name == name) && this.is_my_call);
	};
    
	Cnds.prototype.OnInterval = function (name)
	{       
        return ((this._trigger_duration_name == name) && this.is_my_call);
	};
    
	Cnds.prototype.OnEnd = function (name)
	{       
        return ((this._trigger_duration_name == name) && this.is_my_call);
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    // ---- deprecated ----
    Acts.prototype.Setup = function (timeline_objs, fn_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Duration behavior should connect to a timeline object");          
        
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.type.callback = callback;        
        else
            alert ("Duration behavior should connect to a function object");
	};      
    Acts.prototype.Start_deprecated = function (duration_name, duration_time, interval_time,
                           cb_on_start, cb_on_interval, cb_on_end)
	{
        var args = [duration_name];
        var timer = this.timers[duration_name];
        if (timer != null)     
            timer.Remove(); 
        else
        {
            timer = this._create_timer();          
            this.timers[duration_name] = timer;
        }
        timer.SetCallbackArgs(args);
        timer.extra.duration_time = duration_time;
        timer.extra.interval_time = interval_time;
        timer.extra.duration_remain_time = duration_time;
        timer.extra.cb_on_start = cb_on_start;
        timer.extra.cb_on_interval = cb_on_interval;
        timer.extra.cb_on_end = cb_on_end;
        timer.extra.is_start = true;
        timer.Start(0);     
	};
    // ---- deprecated ----
    
    Acts.prototype.Start = function (duration_name, duration_time, interval_time)
	{
        var args = [duration_name];
        var timer = this.timers[duration_name];
        if (timer != null)     
            timer.Remove(); 
        else
        {
            timer = this._create_timer();          
            this.timers[duration_name] = timer;
        }
        timer.SetCallbackArgs(args);
        timer.extra.duration_time = duration_time;
        timer.extra.interval_time = interval_time;
        timer.extra.duration_remain_time = duration_time;
        timer.extra.cb_on_start = null;
        timer.extra.cb_on_interval = null;
        timer.extra.cb_on_end = null;        
        timer.extra.is_start = true;
        timer.Start(0);        
	};
        
    Acts.prototype.Pause = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer != null)
            timer.Suspend();
	};   

    Acts.prototype.Resume = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer != null)
            this.timer.Resume();
	};       
    
    Acts.prototype.Stop = function (duration_name)
	{
        this.DurationRemove(duration_name);
	};

    Acts.prototype.PauseAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            if (timer.IsActive());
                timer.Suspend();
        }
	};   

    Acts.prototype.ResumeAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            if (timer.IsActive());
                timer.Resume();
        }
	};       
    
    Acts.prototype.StopAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            if (timer.IsActive());
                timer.Remove();
            this._destroy_timer(name);
        }
	};

    Acts.prototype.Setup2 = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Duration behavior should connect to a timeline object");     		
	};
	
    Acts.prototype.AddDurationTime = function (duration_name, duration_time)
	{
        if (duration_time == 0)
            return;
            
        var timer = this.timers[duration_name];
        if (timer == null)
            return;
            
        timer.extra.duration_time += duration_time;
        timer.extra.duration_remain_time += duration_time;
        if (duration_time < 0)
        {        
            var duration_remain_time = timer.extra.duration_remain_time;
            if (duration_remain_time < 0)
                timer.Start(duration_remain_time); 
            else if (timer.extra.interval_time > duration_remain_time);
                timer.Start(duration_remain_time); 
        }
	};
	
    Acts.prototype.SetIntervalTime = function (duration_name, interval_time)
	{
        var timer = this.timers[duration_name];
        if (timer == null)
            return;
            
        timer.extra.interval_time = interval_time;
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.Remainder = function (ret, duration_name)
	{
        if (duration_name == null)
            duration_name = this._trigger_duration_name;
	    var timer = this.timers[duration_name];
	    var val;
	    if (timer == null)
	        val = 0;
	    else
	        val = remain_time_get(timer);
	    ret.set_float(val);
	};
    
	Exps.prototype.Elapsed = function (ret, duration_name)
	{
        if (duration_name == null)
            duration_name = this._trigger_duration_name;
	    var timer = this.timers[duration_name];
	    var val;
	    if (timer == null)
	        val = 0;
	    else
	        val = timer.extra.duration_time - remain_time_get(timer);   
	    ret.set_float(val);
	};  

    Exps.prototype.RemainderPercent = function (ret, duration_name)
	{
        if (duration_name == null)
            duration_name = this._trigger_duration_name;
	    var timer = this.timers[duration_name];
	    var val;
	    if (timer == null)
	        val = 0;
	    else
	        val = remain_time_get(timer)/timer.extra.duration_time;   
	    ret.set_float(val);
	};
    
	Exps.prototype.ElapsedPercent = function (ret, duration_name)
	{
        if (duration_name == null)
            duration_name = this._trigger_duration_name;
	    var timer = this.timers[duration_name];
	    var val;
	    if (timer == null)
	        val = 0;
	    else
	        val = (timer.extra.duration_time - remain_time_get(timer))/timer.extra.duration_time;    
	    ret.set_float(val);
	};  

    Exps.prototype.Interval = function (ret, duration_name)
	{
        if (duration_name == null)
            duration_name = this._trigger_duration_name;
	    var timer = this.timers[duration_name];
	    var val;
	    if (timer == null)
	        val = 0;
	    else
	        val = timer.extra.interval_time;
	    ret.set_float(val);
	};
    
	Exps.prototype.Duration = function (ret, duration_name)
	{
        if (duration_name == null)
            duration_name = this._trigger_duration_name;
	    var timer = this.timers[duration_name];
	    var val;
	    if (timer == null)
	        val = 0;
	    else
	        val = timer.extra.duration_time;   
	    ret.set_float(val);
	}; 
}());