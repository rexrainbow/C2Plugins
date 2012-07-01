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
            this.timer = null;
        }
	};    
    
	behinstProto.tick = function ()
	{        
        var is_at_cooldown = (this.timer)?
                         this.timer.IsActive():
                         false;

        if (is_at_cooldown)
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
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnCallAccepted = function ()
	{  
		return (this.is_my_call);  
	};
    
	Cnds.prototype.OnCallRejected = function ()
	{  
		return (this.is_my_call);  
	}; 
    
	Cnds.prototype.OnCD = function ()
	{  
		return (this.is_my_call);  
	};    

	Cnds.prototype.OnCDFinished = function ()
	{  
		return (this.is_my_call);  
	};
    
	Cnds.prototype.IsCallAccepted = function ()
	{  
		return (this.is_accept && (this.is_my_call));  
	};
    
	Cnds.prototype.IsCallRejected = function ()
	{  
		return ((!this.is_accept) & (this.is_my_call)); 
	}; 
    
	Cnds.prototype.IsAtCD = function ()
	{         
        var is_at_cooldown = (this.timer)? this.timer.IsActive():false; 
		return ((this.is_my_call) & is_at_cooldown);
	};  
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.Setup = function (timeline_objs, cd_interval)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Cooldown should connect to a timeline object");  
            
        this.cd_interval = cd_interval;       
	};    
    
    Acts.prototype.Request = function ()
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
    
    Acts.prototype.SetCDInterval = function (cd_interval)
	{
        this.cd_interval = cd_interval;       
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

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = s;
	};      

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.Remainder = function (ret)
	{
        var t = (this.timer)? this.timer.RemainderTimeGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.Elapsed = function (ret, timer_name)
	{
        var t = (this.timer)? this.timer.ElapsedTimeGet():0;     
	    ret.set_float(t);
	};  

    Exps.prototype.RemainderPercent = function (ret)
	{
        var t = (this.timer)? this.timer.RemainderTimePercentGet():0;     
	    ret.set_float(t);
	};
    
	Exps.prototype.ElapsedPercent = function (ret, timer_name)
	{
        var t = (this.timer)? this.timer.ElapsedTimePercentGet():0;     
	    ret.set_float(t);
	}; 
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
}());