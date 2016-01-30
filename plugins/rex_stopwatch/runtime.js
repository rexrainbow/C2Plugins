// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Stopwatch = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
    
    var TimerKlass = function ()
    {
        this.Reset();
    };
    var TimerKlassProto = TimerKlass.prototype;  
    
    TimerKlassProto.Reset = function(e, start)
    {
        this.enable = e || false;
        this.escapedTime = start || 0;        
    }; 
    
    TimerKlassProto.SetEnable = function(e)
    {
        this.enable = e;        
    };    
    
    TimerKlassProto.Accumulate = function(dt)
    {
        if (!this.enable)
            return;
            
        this.escapedTime += dt;
    };  
    
    TimerKlassProto.GetEscapedTime = function()
    {
        return this.escapedTime;       
    };   
    
    TimerKlassProto.SetEscapedTime = function(t)
    {
        this.escapedTime = t;  
    };    
    TimerKlassProto.IsEnable = function()
    {
        return this.enable;        
    };    
    
	TimerKlassProto.saveToJSON = function ()
	{
		return { "e": this.enable,
		         "et": this.escapedTime,
		       };
	};
	
	TimerKlassProto.loadFromJSON = function (o)
	{
		this.enable = o["e"];
		this.escapedTime = o["et"];
	};            
    
    
    
    // TimerCacheKlass
    var TimerCacheKlass = function ()
    {
        this.lines = [];  
    };
    var TimerCacheKlassProto = TimerCacheKlass.prototype;   
         
	TimerCacheKlassProto.alloc = function(timeline)
	{
        var timer;
        if (this.lines.length > 0)
        {
            timer = this.lines.pop();
			timer.Reset();
        }
        else
        {
            timer = new TimerKlass();
        }            
		return timer;
	};

	TimerCacheKlassProto.free = function(timer)
	{
        this.lines.push(timer);
	};
	// TimerCacheKlass	
	cr.plugins_.Rex_Stopwatch.timer_cache = new TimerCacheKlass();
	    
	var pluginProto = cr.plugins_.Rex_Stopwatch.prototype;
		
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
	    if (!this.recycled)
	    {
	        this.timers = {};
	    }
	    this.timer_cache = cr.plugins_.Rex_Stopwatch.timer_cache;
	    
	    this.my_timescale = -1.0;
	    this.runtime.tickMe(this);
	};
    
	instanceProto.onDestroy = function ()
	{
	    this.destroy_all_timers();
	};
	
    instanceProto.tick = function()
    {
        var dt = this.runtime.getDt(this);        
        if (dt === 0)
            return;
        
        for(var n in this.timers)        
            this.timers[n].Accumulate(dt);
    };

    instanceProto.get_timer = function(name, create_if_null)
    {
	    if (!this.timers.hasOwnProperty(name) && create_if_null)
	    {
	        this.timers[name] = this.timer_cache.alloc();
	    }
	    
	    return this.timers[name];
    };  
    
	instanceProto.destroy_all_timers = function ()
	{
	    var n, timer
	    for (n in this.timers)
	    {
	        timer = this.timers[n];
	        delete this.timers[n];	        
	        this.timer_cache.free(timer);
	    }
	};    
    
	instanceProto.saveToJSON = function ()
	{
	    var timers_save = {};
	    for (var n in this.timers)
	    {
	        timers_save[n] = this.timers[n].saveToJSON();
	    }
	    
		return { "tim": timers_save
		       };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
        this.destroy_all_timers();
	    var timers_save = o["tim"];
	    var timer;
	    for (var n in timers_save)
	    {
	        timer = this.get_timer(n, true);
	        timer.loadFromJSON( timers_save[n] );	        
	    }
	};
	
	var clean_table = function (o)
	{
	    for(var n in o)
	        delete o[n];
	};  	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsRunning = function (name)
	{
        var timer = this.get_timer(name);
		return (timer)? timer.IsEnable(): false;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.StartTimer = function (name, start)
	{
	    var timer = this.get_timer(name, true);
	    timer.Reset(true, start);
	};  

    Acts.prototype.PauseTimer = function (name)
	{
	    var timer = this.get_timer(name);
	    if (!timer)
	        return;
	        
	    timer.SetEnable(false);
	};  	
	
    Acts.prototype.ResumeTimer = function (name)
	{
	    var timer = this.get_timer(name);
	    if (!timer)
	        return;
	        
	    timer.SetEnable(true);
	}; 	
	
    Acts.prototype.DestroyTimer = function (name)
	{
	    if (this.timer.hasOwnProperty(name))
	    {
	        var timer = this.timer[name];	        
	        delete this.timer[name];	        
	        this.timer_cache.free(timer);
	    }
	}; 		
	
    Acts.prototype.ToggleTimer = function (name)
	{
	    var timer = this.get_timer(name);
	    if (!timer)
	        return;
	        
	    timer.SetEnable(!timer.IsEnable());
	};
	
    Acts.prototype.ShiftTimer = function (name, offset)
	{
	    var timer = this.get_timer(name);
	    if (!timer)
	        return;
	        
	    timer.SetEscapedTime(offset);
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.EscapedTime = function (ret, name)
	{ 
        var timer = this.get_timer(name);
        var t = (timer)? timer.GetEscapedTime():0; 
	    ret.set_float(t);
	};	
}());