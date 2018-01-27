// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Value_interpolation = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Value_interpolation.prototype;
		
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
    
        assert2(cr.plugins_.Rex_TimeLine, "Value interpolation behavior: Can not find timeline oject.");
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
        assert2(this.timeline, "Value interpolation behavior:Can not find timeline oject.");
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
        this.value = this.properties[0];
        this.duration = this.properties[1];
        this.step = this.properties[2];	  
        this.target_value = 0;  
        this.timer = null;
        this.is_my_call = false;       
        this.timer_save = null;         
	};
    
	behinstProto.onDestroy = function()
	{
        if (this.timer)
        {
            this.timer.Remove();
            this.timer = null;    
        }
	};    
    
	behinstProto.tick = function ()
	{
	};
	
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.timer_handle();
    };
    
    behinstProto.timer_handle = function()
    {
        var is_inc = (this.target_value >= this.value);
        this.value += ((is_inc)? this.step : -this.step);
        var is_hit = (is_inc)? (this.value >= this.target_value) : (this.value <= this.target_value);
        if (is_hit)
            this.value = this.target_value;
                
        this.is_my_call = true;
        this.runtime.trigger(cr.behaviors.Rex_Value_interpolation.prototype.cnds.OnValueChanging, this.inst); 
        this.is_my_call = false;
        
        if (is_hit)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_Value_interpolation.prototype.cnds.OnHitTargetValue, this.inst); 
            this.is_my_call = false;
        }
        else
        {
            this.timer.Start(this.duration); 
        }

    };	
    
	behinstProto.saveToJSON = function ()
	{      
		return { "v": this.value,
                 "dt": this.duration,
                 "step": this.step,
                 "tv": this.target_value,
                 "tim": (this.timer != null)? this.timer.saveToJSON() : null,
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1)
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.value = o["v"];
        this.duration = o["dt"];
        this.step = o["step"];	  
        this.target_value = o["tv"];      
        this.timer_save = o["tim"];        
        this.type.timelineUid = o["tluid"];    
	};
    
	behinstProto.afterLoad = function ()
	{
		if (this.type.timelineUid === -1)
			this.type.timeline = null;
		else
		{
			this.type.timeline = this.runtime.getObjectByUID(this.type.timelineUid);
			assert2(this.type.timeline, "Value interpolation: Failed to find timeline object by UID");
		}		
        
        if (this.timer_save == null)
            this.timer = null;
        else
        {
            this.timer = this.type.timeline.LoadTimer(this.timer_save, on_timeout);
            this.timer.plugin = this;
        }     
        this.timers_save = null;        
	}; 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsValueChanging = function ()
	{  
		return ((this.timer)? this.timer.IsActive():false);  
	};
    
	Cnds.prototype.OnValueChanging = function ()
	{  
		return this.is_my_call;  
	};
    
	Cnds.prototype.OnHitTargetValue = function ()
	{  
		return this.is_my_call;  
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.ChangeValue = function (target_value)
	{
	    this.target_value = target_value;
        if (this.timer == null)        
        {
            this.timer = this.type._timeline_get().CreateTimer(on_timeout);
            this.timer.plugin = this;
        }
            
        if ((this.timer) && (!this.timer.IsActive()))
            this.timer.Start(this.duration);
	};

    Acts.prototype.SetStep = function (step)
	{
	    this.step = step;
	};
	
    Acts.prototype.SetDuration = function (duration)
	{
	    this.duration = duration;
	};
	
    Acts.prototype.SetValue = function (value)
	{
	    this.value = value;
        if (this.timer)
            this.timer.Remove();        
	};    
    
    Acts.prototype.Pause = function ()
	{
        if (this.timer)
            this.timer.Suspend();
	};   

    Acts.prototype.Resume = function ()
	{
        if (this.timer)
            this.timer.Resume();
	};       
    
    Acts.prototype.Stop = function ()
	{
        if (this.timer)
            this.timer.Remove();
	};   

    Acts.prototype.Setup2 = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Value interpolation behavior should connect to a timeline object");     		
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.Duration = function (ret)
	{  
	    ret.set_float(this.duration);
	};
    
	Exps.prototype.Step = function (ret)
	{ 
	    ret.set_float(this.step);
	};  

    Exps.prototype.Value = function (ret)
	{   
	    ret.set_float(this.value);
	};
    
	Exps.prototype.TargetValue = function (ret)
	{   
	    ret.set_float(this.target_value);
	};    
}());