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
    
    // TimerCacheKlass
    var TimerCacheKlass = function ()
    {
        this.lines = [];  
    };
    var TimerCacheKlassProto = TimerCacheKlass.prototype;   
         
	TimerCacheKlassProto.alloc = function(timeline, on_timeout)
	{
        var timer;
        if (this.lines.length > 0)
        {
            timer = this.lines.pop();
			timeline.LinkTimer(timer);
        }
        else
        {
            timer = timeline.CreateTimer(on_timeout);
        }            
		return timer;
	};

	TimerCacheKlassProto.free = function(timer)
	{
        this.lines.push(timer);
	};
	// TimerCacheKlass	
	cr.behaviors.Rex_Duration.timer_cache = new TimerCacheKlass();
	    
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
        this.timer_cache = cr.behaviors.Rex_Duration.timer_cache;
	};
	
    behtypeProto.getTimelineObj = function ()
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

	behtypeProto.timer_create = function(on_timeout, plugin)
	{
	    var timer = this.timer_cache.alloc(this.getTimelineObj(), on_timeout);
		timer.plugin = plugin; 
        return timer;
	}; 
	
	behtypeProto.timer_free = function(timer)
	{
	    timer.plugin = null; 
        this.timer_cache.free(timer);
	}; 	 
	
	behtypeProto.timer_cache_clean = function()
	{
        this.timer_cache.lines.length = 0;
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
            this.timers = {};
        }
		this.sync_timescale = (this.properties[0] == 1);
        this._trigger_duration_name = "";
        this.is_my_call = false;
        this.timers_save = null;
        this.timer_cache = cr.behaviors.Rex_Duration.timer_cache; 
        this.pre_ts = 1;
	};
    
	behinstProto.onDestroy = function()
	{
        var name, timer;
        for (name in this.timers)
        {
            this.destroy_timer(name);
        }
	};    
    
    
	behinstProto.create_timer = function (duration_name)
	{
	    var timer = this.timers[duration_name];
	    if (timer != null)
	    {
	        timer.Remove();
	        return timer;
	    }
        
        timer = this.type.timer_create(on_timeout, this);
        timer._duration_name = duration_name;
        this.timers[duration_name] = timer;    
        return timer;
	};
    
	behinstProto.destroy_timer = function (duration_name)
	{
        var timer = this.timers[duration_name];
        if (timer == null)
            return;
            
        timer.Remove();        
        delete this.timers[duration_name];
        this.type.timer_free(timer);          
	};

	behinstProto.tick = function ()
	{
	    if (this.sync_timescale)
            this.sync_ts();            
	};
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.on_timeout(this);
    };    

    behinstProto.on_timeout = function(timer)
    {
        var duration_name = timer._duration_name;
        this._trigger_duration_name = duration_name;
        var duration_remain = timer._duration_remain_time;
        var interval = timer._interval_time;
                
        // run start callback
        if (timer.run_start)
        {
            timer.run_start = false;
            this.run_callback(cr.behaviors.Rex_Duration.prototype.cnds.OnStart);
        }
        else  // others
        {
            if (duration_remain <= interval)
            {
                timer._duration_remain_time = 0;
                if (duration_remain == interval)
                    this.run_callback(cr.behaviors.Rex_Duration.prototype.cnds.OnInterval);               
                this.run_callback(cr.behaviors.Rex_Duration.prototype.cnds.OnEnd); 
            }
            else
            {
                duration_remain -= interval;         
                timer._duration_remain_time = duration_remain;
                this.run_callback(cr.behaviors.Rex_Duration.prototype.cnds.OnInterval);               
            }
        }
        
        if (timer._duration_remain_time > 0)
            timer.Start(Math.min(duration_remain, interval));
        else
            this.destroy_timer(duration_name);
    };

    behinstProto.run_callback = function(callback)
    {
        this.is_my_call = true;
        this.runtime.trigger(callback, this.inst); 
        this.is_my_call = false;       
    };
    
    var remain_time_get = function (timer)
    {
        return timer._duration_remain_time - timer.ElapsedTimeGet();
    };
    
	behinstProto.sync_ts = function ()
	{
	    var ts = this.get_timescale();
	    if (this.pre_ts == ts)
	        return;
	    
	    var n;
	    for (n in this.timers)
	        this.timers[n].SetTimescale(ts);
	        
	    this.pre_ts = ts;
	};    

	behinstProto.get_timescale = function ()
	{
	    var ts = this.inst.my_timescale;
	    if (ts == -1)
	        ts = 1;	    
	    return ts;
	};
	
	behinstProto.saveToJSON = function ()
	{ 
	    var tims_save = {};
        var name, timer, timerSave;
        for (name in this.timers) 
        {       
            timer = this.timers[name];
            timerSave = timer.saveToJSON();  
            timerSave["_dt"] = timer._duration_time;
            timerSave["_it"] = timer._interval_time;
            timerSave["_drt"] = timer._duration_remain_time;
            timerSave["_iss"] = timer.run_start;
            tims_save[name] = timerSave;   
                         
        }
		return { "tims": tims_save,
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1)
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.timers_save = o["tims"];
        this.type.timelineUid = o["tluid"];        
        this.type.timer_cache_clean();   
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

        if (this.timers_save == null)
            this.timers = {};
        else
        {
            var name, timer, timerSave;
            for (name in this.timers_save)   
            {
                timerSave = this.timers_save[name];
                timer = this.create_timer(name);
                
                timer._duration_time = timerSave["_dt"];
                timer._interval_time = timerSave["_it"];
                timer._duration_remain_time = timerSave["_drt"];   
                timer.run_start = timerSave["_iss"];    
                
                timer.loadFromJSON(timerSave);
                timer.afterLoad();                
            }
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
    Acts.prototype.Setup_deprecated = function () { };      
    Acts.prototype.Start_deprecated = function () { };
    // ---- deprecated ----
    
    Acts.prototype.Start = function (duration_name, duration_time, interval_time)
	{
        var timer = this.create_timer(duration_name);
        
        timer._duration_time = duration_time;
        timer._interval_time = interval_time;
        timer._duration_remain_time = duration_time;       
        timer.run_start = true;
        timer.Start(0);
		
		if (this.sync_timescale)
		{
            timer.SetTimescale(this.get_timescale());
	    }
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
    
    Acts.prototype.ForceToEnd = function (duration_name)
	{
	    var timer = this.timers[duration_name];
	    if ((timer != null) && (!timer.run_start))
		{
		    this._trigger_duration_name = duration_name;
		    this.run_callback(cr.behaviors.Rex_Duration.prototype.cnds.OnEnd); 
		}
	    this.destroy_timer(duration_name);
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
    
    Acts.prototype.ForceToEndAll = function ()
	{
        var name, timer;
        for (name in this.timers)
        {
		    if (!this.timers[name].run_start)
			{
			    this._trigger_duration_name = name;
			    this.run_callback(cr.behaviors.Rex_Duration.prototype.cnds.OnEnd); 
			}
            this.destroy_timer(name);
        }
	};
    
    Acts.prototype.Cancel = function (duration_name)
	{
	    this.destroy_timer(duration_name);
	};	

    Acts.prototype.Setup2 = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Duration behavior should connect to a timeline object");     		
	};

    Acts.prototype.SyncTimescale = function (e)
	{ 		
        this.sync_timescale = (e === 1);
	};
	
    Acts.prototype.AddDurationTime = function (duration_name, duration_time)
	{
        if (duration_time == 0)
            return;
            
        var timer = this.timers[duration_name];
        if (timer == null)
            return;
            
        timer._duration_time += duration_time;
        timer._duration_remain_time += duration_time;
        if (duration_time < 0)
        {
            var duration_remain_time = timer._duration_remain_time;
            if (duration_remain_time < 0)
                timer.Start(duration_remain_time); 
            else if (timer._interval_time > duration_remain_time);
                timer.Start(duration_remain_time); 
        }
	};
	
    Acts.prototype.SetIntervalTime = function (duration_name, interval_time)
	{
        var timer = this.timers[duration_name];
        if (timer == null)
            return;
            
        timer._interval_time = interval_time;
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
	        val = timer._duration_time - remain_time_get(timer);   
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
	        val = remain_time_get(timer)/timer._duration_time;   
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
	        val = (timer._duration_time - remain_time_get(timer))/timer._duration_time;    
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
	        val = timer._interval_time;
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
	        val = timer._duration_time;   
	    ret.set_float(val);
	}; 
}());