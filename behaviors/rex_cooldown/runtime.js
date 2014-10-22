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
        this.timelineUid = -1;    // for loading    
	};

    behtypeProto._timeline_get = function ()
    {
        if (this.timeline != null)
            return this.timeline;
    
        assert2(cr.plugins_.Rex_TimeLine, "Cooldown behavior: Can not find timeline oject.");
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
        assert2(this.timeline, "Cooldown behavior: Can not find timeline oject.");
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

	var trig_behavior_inst = null;
	behinstProto.onCreate = function()
	{      
        this.timer = null;
        this.enable = (this.properties[0] == 1);
        this.cd_interval = this.properties[1];
        this.is_request = false;
        this.is_accept = false;
        this.pre_is_at_cooldown = false;        
        this.timer_save = null;
        this.is_custom_accept = false;
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
        var is_at_cooldown = this.is_at_cooldown();

        if (is_at_cooldown)
        {
            trig_behavior_inst = this;
            this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCD, this.inst); 
            trig_behavior_inst = null;
        }
        this.pre_is_at_cooldown = is_at_cooldown;
        this.is_request = false;
	};
	
    behinstProto.is_at_cooldown = function()
    {     
        return (this.timer)? this.timer.IsActive():false; 
    }; 
       
    // handler of timeout for timers in this plugin, this=timer   
    var on_timeout = function ()
    {
        this.plugin.on_cooldown_finished();
    };
    
    behinstProto.on_cooldown_finished = function()
    {    
        trig_behavior_inst = this;
        this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCD, this.inst); 
        trig_behavior_inst = this;
        this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCDFinished, this.inst); 
        trig_behavior_inst = null;
    };
    
    behinstProto.custom_acceptable_check = function()    
    {
        this.is_custom_accept = null;
        trig_behavior_inst = this;
        this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnAcceptableChecking, this.inst); 
        trig_behavior_inst = null;
        
        if (this.is_custom_accept != null)
            this.is_accept = this.is_custom_accept;
            
        return this.is_accept;
    };
    
    behinstProto.request = function (is_test)
	{                    
        if ((this.cd_interval<=0) || (!this.timer))
            this.is_accept = true;
        else 
           this.is_accept = (!this.timer.IsActive());                    
        
        // custom acceptable checking
        if (this.is_accept)
            this.is_accept = this.custom_acceptable_check();
      
        if (is_test)
            return this.is_accept;
        
        // run callback
        this.is_request = true;                  
        if ( this.is_accept )
        {
            if (this.cd_interval > 0)
            {
                if ( this.timer == null )
                {
                    this.timer = this.type._timeline_get().CreateTimer(on_timeout);
                    this.timer.plugin = this;
                }
                this.timer.Start(this.cd_interval);                
            }
            
            trig_behavior_inst = this;
            this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCallAccepted, this.inst); 
            trig_behavior_inst = null;
        }
        else
        {
            // this.is_accept = false
            trig_behavior_inst = this;
            this.runtime.trigger(cr.behaviors.Rex_Cooldown.prototype.cnds.OnCallRejected, this.inst); 
            trig_behavior_inst = null;
        }
	};          
    
	behinstProto.saveToJSON = function ()
	{ 
		return { "en": this.enable,
                 "t": this.cd_interval,
                 "acc": this.is_accept,
                 
                 "tim": (this.timer != null)? this.timer.saveToJSON() : null,
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1),
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.enable = o["en"];
        this.cd_interval = o["t"];
        this.is_accept = o["acc"];
        
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
			assert2(this.type.timeline, "Cooldown: Failed to find timeline object by UID");
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
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Cooldown interval", "value": this.cd_interval},
				{"name": "Remain time", "value": (this.timer)? this.timer.RemainderTimeGet():0}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		switch (name) 
		{
		    case "Cooldown interval": 
		        this.cd_interval = value; 
		        break;
		}
	};
	/**END-PREVIEWONLY**/
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnCallAccepted = function ()
	{  
	    var flg = (trig_behavior_inst === this) && this.is_accept;	    
		return flg;  
	};
    
	Cnds.prototype.OnCallRejected = function ()
	{  
	    var flg = (trig_behavior_inst === this) && (!this.is_accept);
		return flg;  
	}; 
    
	Cnds.prototype.OnCD = function ()
	{  
		return (trig_behavior_inst === this);  
	};    

	Cnds.prototype.OnCDFinished = function ()
	{
		return (trig_behavior_inst === this);  
	};
    
	Cnds.prototype.IsCallAccepted = function ()
	{  
		return (this.is_request && this.is_accept);
	};
    
	Cnds.prototype.IsCallRejected = function ()
	{  
		return (this.is_request && (!this.is_accept)); 
	}; 
    
	Cnds.prototype.IsAtCD = function ()
	{         
		return (this.pre_is_at_cooldown || this.is_at_cooldown());
	};

	Cnds.prototype.TestCall = function ()
	{         
        if (!this.enable)
            return false;
            		    
		return this.request(true);
	};		  
	
	Cnds.prototype.IsActivated = function ()
	{         
		return this.enable;
	};	
    	
	Cnds.prototype.OnAcceptableChecking = function ()
	{  
		return (trig_behavior_inst === this);
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
    
    Acts.prototype.RequestCall = function ()
	{
        if (!this.enable)
            return;	    
        this.request();
	}; 
    
    Acts.prototype.SetCDInterval = function (cd_interval)
	{
        this.cd_interval = cd_interval;       
	};  
    
    Acts.prototype.Pause = function ()
	{
        if (!this.enable)
            return;	
            	    
        if (this.timer)
            this.timer.Suspend();
	};   

    Acts.prototype.Resume = function ()
	{
        if (!this.enable)
            return;	
            	    
        if (this.timer)
            this.timer.Resume();
	};   

	Acts.prototype.SetActivated = function (s)
	{
		this.enable = (s == 1);
		
		if ((!this.enable) && this.timer)
		    this.timer.Remove();
	};      

    Acts.prototype.Cancel = function ()
	{
        if (!this.enable)
            return;	
            	    
        if (this.timer)
            this.timer.Remove();
	};

    Acts.prototype.SetRemainerTime = function (remainder_time)
	{
        if ( (!this.enable) || (!this.timer) )
            return;	    
        this.timer.RemainderTimeSet(remainder_time);            
	};	

    Acts.prototype.SetAcceptable = function (a)
	{
        this.is_custom_accept = (a===1);          
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
		ret.set_int(this.enable? 1:0);
	};    
}());