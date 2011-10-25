// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Cooldown = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Cooldown.prototype;
		
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
        this.timer = null;
        this.activated = this.properties[0];
        this.cd_interval = 0;
        this.is_accept = false;
        this.is_my_call = false;
	};
    
	behinstProto.onDestroy = function()
	{
        if (this.timer)
        {
            this.timer.Remove();
        }
	};    
    
	behinstProto.tick = function ()
	{        
        var is_running = (this.timer)?
                         this.timer.IsActive():
                         false;

        if (is_running)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCD, this.inst); 
            this.is_my_call = false;
        }
	};
    
    behinstProto._on_cooldown_finished = function()
    {    
        this.is_my_call = true;
        this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCDFinished, this.inst); 
        this.is_my_call = false;
    };

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	cnds.OnCallAccepted = function ()
	{  
		return (this.is_my_call);  
	};
    
	cnds.OnCallRejected = function ()
	{  
		return (this.is_my_call);  
	}; 
    
	cnds.OnCD = function ()
	{  
		return (this.is_my_call);  
	};    

	cnds.OnCDFinished = function ()
	{  
		return (this.is_my_call);  
	};
    
	cnds.IsCallAccepted = function ()
	{  
		return (this.is_accept && (this.is_my_call));  
	};
    
	cnds.IsCallRejected = function ()
	{  
		return ((!this.is_accept) & (this.is_my_call)); 
	}; 
    
	cnds.IsAtCD = function ()
	{  
        var is_running = false;
        if (this.timer)
        {
            is_running = this.timer.IsActive();
        }
		return is_running; 
	};  
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

    acts.Setup = function (timeline_objs, cd_interval)
	{
        this.type.timeline = timeline_objs.instances[0];
        this.cd_interval = cd_interval;       
	};    
    
    acts.Request = function ()
	{
        if (this.activated == 0)
            return;
            
        if ( this.timer == null )
        {
            this.is_accept = true;
            this.timer = this.type.timeline.CreateTimer(this, this._on_cooldown_finished);
        }
        else 
        {
           this.is_accept = (!this.timer.IsActive());
        }
        
        if ( this.is_accept )
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCallAccepted, this.inst); 
            this.is_my_call = false;
            this.timer.Start(this.cd_interval);
        }
        else
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCallRejected, this.inst); 
            this.is_my_call = false;
        }
	}; 
    
    acts.SetCDInterval = function (cd_interval)
	{
        this.cd_interval = cd_interval;       
	};  
    
    acts.Pause = function ()
	{
        if (this.timer)
        {
            this.timer.Suspend();
        }
	};   

    acts.Resume = function ()
	{
        if (this.timer)
        {
            this.timer.Resume();
        }
	};    

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

    exps.Remainder = function (ret)
	{
        var val = (this.timer)? this.timer.RemainderTimeGet():0;     
	    ret.set_float(val);
	};
    
	exps.Elapsed = function (ret, timer_name)
	{
        var val = (this.timer)? this.timer.ElapsedTimeGet():0;     
	    ret.set_float(val);
	};  

    exps.RemainderPercent = function (ret)
	{
        var val = (this.timer)? this.timer.RemainderTimePercentGet():0;     
	    ret.set_float(val);
	};
    
	exps.ElapsedPercent = function (ret, timer_name)
	{
        var val = (this.timer)? this.timer.ElapsedTimePercentGet():0;     
	    ret.set_float(val);
	};        
}());