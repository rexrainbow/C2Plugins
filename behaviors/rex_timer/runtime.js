// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Timer = function(runtime)
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
		timer.timeline = null;
        this.lines.push(timer);
	};
	// TimerCacheKlass	
	cr.behaviors.Rex_Timer.timer_cache = new TimerCacheKlass();
	    
	var behaviorProto = cr.behaviors.Rex_Timer.prototype;
		
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
        this.timer_cache = cr.behaviors.Rex_Timer.timer_cache;
	};

    behtypeProto.getTimelineObj = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Timer behavior: Can not find timeline oject.");
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
        assert2(this.timeline, "Timer behavior: Can not find timeline oject.");
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
        this._trigger_timer_name = "";
        this.is_my_call = false;
        this.timers_save = null;
        this.timer_cache = cr.behaviors.Rex_Timer.timer_cache; 
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
	behinstProto.create_timer = function (timer_name)
	{
	    var timer = this.timers[timer_name];
	    if (timer != null)
	    {
	        timer.Remove();
	        return timer;
	    }
        
        timer = this.type.timer_create(on_timeout, this);
        timer._timer_name = timer_name;
        this.timers[timer_name] = timer;    
        return timer;
	};
    
	behinstProto.destroy_timer = function (timer_name)
	{
        var timer = this.timers[timer_name];
        if (timer == null)
            return;
            
        timer.Remove();        
        delete this.timers[timer_name];
        this.type.timer_free(timer);          
	};

	behinstProto.tick = function ()
	{
	    if (!this.sync_timescale)
		    return;
			
	    var ts = this.get_timescale();
	    if (this.pre_ts == ts)
	        return;
	    
	    var n;
	    for (n in this.timers)
	        this.timers[n].SetTimescale(ts);
	        
	    this.pre_ts = ts;
	};
    
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {                
        this.plugin.run_callback(cr.behaviors.Rex_Timer.prototype.cnds.OnTimeout, this._timer_name);
        if (this._repeat_count === 0)
            this.Start();
        else if (this._repeat_count > 1)
        {
            this._repeat_count -= 1;
            this.Start();
        }
    };

    behinstProto.run_callback = function(callback, timer_name)
    {
        this._trigger_timer_name = timer_name;        
        this.is_my_call = true;
        this.runtime.trigger(callback, this.inst); 
        this.is_my_call = false;       
    };
    
    var remain_time_get = function (timer)
    {
        return timer._duration_remain_time - timer.ElapsedTimeGet();
    };

	behinstProto.get_timescale = function ()
	{
	    var ts = this.inst.my_timescale;
	    if (ts == -1)
	        ts = this.runtime.timescale;   

	    return ts;
	};
    
	behinstProto.timer_get = function (name)
	{  
        var timer;    
        if (name == null)
        {        
            var _n;
            for (_n in this.timers)
            {
                timer = this.timers[_n];
                break;
            }
        }
        else
            timer = this.timers[name];
           
        return timer;
	};    
	
	behinstProto.saveToJSON = function ()
	{ 
	    var tims_save = {};
        var name, timer, timerSave;
        for (name in this.timers) 
        {       
            timer = this.timers[name];
            timerSave = timer.saveToJSON();  
            timerSave["_rc"] = timer._repeat_count;
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
                timer._repeat_count = timerSave["_rc"];
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
		return (timer)? timer.IsActive(): false;
	};
    
	Cnds.prototype.OnTimeout = function (name)
	{  
		return ((this._trigger_timer_name == name) && this.is_my_call);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    // ---- deprecated ----
    Acts.prototype.Setup_deprecated = function (timeline_objs, fn_objs) { };          
    Acts.prototype.Create_deprecated = function (command) { }; 
	// ---- deprecated ----
    
    Acts.prototype.Start = function (delay_time, timer_name, repeat_count)
	{
        var timer = this.create_timer(timer_name);
        timer._repeat_count = repeat_count;
        timer.Start(delay_time);
		
		if (this.sync_timescale)
		{
            timer.SetTimescale(this.get_timescale());
	    }
	};

    Acts.prototype.Pause = function (name)
	{
	    var timer = this.timer_get(name); 
        if (timer)
            timer.Suspend();
	};   

    Acts.prototype.Resume = function (name)
	{
	    var timer = this.timer_get(name);
        if (timer)
            timer.Resume();
	};       
    
    Acts.prototype.Stop = function (name)
	{
	    var timer = this.timer_get(name);
        if (timer)
            timer.Remove();
	};   
    
    // ---- deprecated ----
    Acts.prototype.SetParameter = function (index, value)
	{
		var has_rex_function = (this.type.callback != null);
		if (!has_rex_function && (this.params.length <= index))
		{
		    var old_length = this.params.length;
		    this.params.length = index;
			if (old_length != index)
			{
			    var i, cnt=index;
			    for (i=old_length; i<cnt; i++)
			        this.params[i] = 0;
		    }
	    }
		this.params[index] = value;
	};  
	// ---- deprecated ----  
  
    Acts.prototype.PauseAll = function ()
	{
        for (var n in this.timers)
            this.timers[n].Suspend();
	};  
    
    Acts.prototype.ResumeAll = function ()
	{
        for (var n in this.timers)
            this.timers[n].Resume();
	};      
    
    Acts.prototype.StopAll = function ()
	{
        for (var n in this.timers)
            this.timers[n].Remove();
	};      

    Acts.prototype.Setup2 = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Timer behavior should connect to a timeline object");     		
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.Remainder = function (ret, name)
	{
        var timer = this.timer_get(name);
        var val = (timer)? timer.RemainderTimeGet():0;     
	    ret.set_float(val);
	};
    
	Exps.prototype.Elapsed = function (ret, name)
	{
        var timer = this.timer_get(name);           
        var val = (timer)? timer.ElapsedTimeGet():0;     
	    ret.set_float(val);
	};  

    Exps.prototype.RemainderPercent = function (ret, name)
	{ 
        var timer = this.timer_get(name);     
        var val = (timer)? timer.RemainderTimePercentGet():0;     
	    ret.set_float(val);
	};
    
	Exps.prototype.ElapsedPercent = function (ret, name)
	{
        var timer = this.timer_get(name);
        var val = (timer)? timer.ElapsedTimePercentGet():0;     
	    ret.set_float(val);
	};    
    
	Exps.prototype.DelayTime = function (ret, name)
	{
        var timer = this.timer_get(name);
        var val = (timer)? timer.DelayTimeGet():0;     
	    ret.set_float(val);
	};  	
	 
}());