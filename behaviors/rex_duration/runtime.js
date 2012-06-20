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
        this.callback = null;        
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
        this._trigger_timer = null;     
        this._timers_cache = [];        
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
        if (this._timers_cache.length > 0)
            timer = this._timers_cache.pop()
        else
            timer = this.type.timeline.CreateTimer(this, this._timer_handle);       
        return timer;
	};
    
	behinstProto._destroy_timer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        delete this.timers[timer_name];
        if (this._timers_cache.length < 3)
            this._timers_cache.push(timer);            
	};
    
	behinstProto.tick = function ()
	{
	};

    behinstProto._exec_callback = function(callback)
    {
        if (callback == "")
            return;
            
        // setup sol
        var sol = this.type.objtype.getCurrentSol();
        sol.select_all = false;
	    sol.instances.length = 1;        
        sol.instances[0] = this.inst;
        // call function object
        this.type.callback.ExecuteCommands(callback); 
    };
        
    behinstProto._timer_handle = function(duration_name)
    {
        var timer = this.timers[duration_name];
        this._trigger_timer = timer;
        var duration_remain = timer.__duration_duration_remain;
        var interval = timer.__duration_interval;
        if (duration_remain <= interval)
        {
            timer.__duration_duration_remain = 0;
            if (duration_remain == interval)
                this._exec_callback(timer.__duration_cb_on_interval);
            timer.__duration_is_new = false;                
            this._exec_callback(timer.__duration_cb_on_end); 
            if (!timer.__duration_is_new)
            {
                timer.__duration_is_alive = false;
                this._destroy_timer(duration_name);
            }
        }
        else
        {
            duration_remain -= interval;         
            timer.__duration_duration_remain = duration_remain;          
            timer.Start(Math.min(duration_remain, interval)); 
            this._exec_callback(timer.__duration_cb_on_interval);               
        }
    };

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	cnds.IsRunning = function (name)
	{  
        var timer = this.timers[duration_name];        
        return ((timer != null) && timer.__duration_is_alive);
	};

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

    acts.Setup = function (timeline_objs, fn_objs)
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
    

    acts.Start = function (duration_name, duration_time, interval_time,
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
        timer.__duration_duration = duration_time;
        timer.__duration_interval = interval_time;
        timer.__duration_duration_remain = duration_time;
        timer.__duration_cb_on_interval = cb_on_interval;
        timer.__duration_cb_on_end = cb_on_end;
        timer.__duration_is_alive = true;
        timer.__duration_is_new = true;   // prevent destroy after on end callback
        timer.Start(Math.min(duration_time, interval_time));
        this._trigger_timer = timer;
        this._exec_callback(cb_on_start);        
	};

    acts.Pause = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer != null)
            timer.Suspend();
	};   

    acts.Resume = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer != null)
            this.timer.Resume();
	};       
    
    acts.Stop = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer != null)
        {
            this.timer.Remove();
            timer.__duration_is_alive = false;
            this._destroy_timer(duration_name);
        }
	};

    acts.PauseAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            if (timer.IsActive());
                timer.Suspend();
        }
	};   

    acts.ResumeAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            if (timer.IsActive());
                timer.Resume();
        }
	};       
    
    acts.StopAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
            timer = this.timers[name];
            if (timer.IsActive());
                timer.Remove();
            timer.__duration_is_alive = false;
            this._destroy_timer(name);
        }
	};
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

    exps.Remainder = function (ret, duration_name)
	{
	    var timer = (duration_name != null)? 
	                this.timers[duration_name]:this._trigger_timer;
	    var val;
	    if ((timer == null) || (!timer.__duration_is_alive))
	        val = 0;
	    else
	        val = timer.__duration_duration_remain;
	    ret.set_float(val);
	};
    
	exps.Elapsed = function (ret, duration_name)
	{
	    var timer = (duration_name != null)? 
	                this.timers[duration_name]:this._trigger_timer;
	    var val;
	    if ((timer == null) || (!timer.__duration_is_alive))
	        val = 0;
	    else
	        val = timer.__duration_duration - timer.__duration_duration_remain;   
	    ret.set_float(val);
	};  

    exps.RemainderPercent = function (ret, duration_name)
	{
	    var timer = (duration_name != null)? 
	                this.timers[duration_name]:this._trigger_timer;
	    var val;
	    if ((timer == null) || (!timer.__duration_is_alive))
	        val = 0;
	    else
	        val = timer.__duration_duration_remain/timer.__duration_duration;   
	    ret.set_float(val);
	};
    
	exps.ElapsedPercent = function (ret, duration_name)
	{
	    var timer = (duration_name != null)? 
	                this.timers[duration_name]:this._trigger_timer;
	    var val;
	    if ((timer == null) || (!timer.__duration_is_alive))
	        val = 0;
	    else
	        val = (timer.__duration_duration - timer.__duration_duration_remain)/timer.__duration_duration;    
	    ret.set_float(val);
	};  

    exps.Interval = function (ret, duration_name)
	{
	    var timer = (duration_name != null)? 
	                this.timers[duration_name]:this._trigger_timer;
	    var val;
	    if ((timer == null) || (!timer.__duration_is_alive))
	        val = 0;
	    else
	        val = timer.__duration_interval;
	    ret.set_float(val);
	};
    
	exps.Duration = function (ret, duration_name)
	{
	    var timer = (duration_name != null)? 
	                this.timers[duration_name]:this._trigger_timer;
	    var val;
	    if ((timer == null) || (!timer.__duration_is_alive))
	        val = 0;
	    else
	        val = timer.__duration_duration;   
	    ret.set_float(val);
	}; 
}());