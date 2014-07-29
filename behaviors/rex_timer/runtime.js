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
        this.callback = null;     // deprecated
        this.callbackUid = -1;    // for loading   // deprecated
	};

    behtypeProto._timeline_get = function ()
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
        this.command = null; 
        this.params = null;    // deprecated
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
        if (this.command == null)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_Timer.prototype.cnds.OnTimeout, this.inst); 
            this.is_my_call = false;
        }
        else // ---- deprecated ----
        {
            // setup sol
            var sol = this.type.objtype.getCurrentSol();
            sol.select_all = false;
            sol.instances.length = 1;        
            sol.instances[0] = this.inst;
            this.type.objtype.applySolToContainer();
            // call function object
            var has_rex_function = (this.type.callback != null);
            if (has_rex_function)
                this.type.callback.CallFn(this.command, this.params);     			
            else
            {
                var has_fnobj = this.type.timeline.RunCallback(this.command, this.params, true);           
                assert2(has_fnobj, "Timer: Can not find callback oject.");
            }
        }   // ---- deprecated ----
    };	
    
	behinstProto.saveToJSON = function ()
	{ 
		return { "tim": (this.timer != null)? this.timer.saveToJSON() : null,
                 "cmd": this.command,
                 "pams": this.params,    // deprecated
                 "tluid": (this.type.timeline != null)? this.type.timeline.uid: (-1),
                 "cbuid": (this.type.callback != null)? this.type.callback.uid: (-1)    // deprecated
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.timer_save = o["tim"];
        this.command = o["cmd"];
        this.params = o["pams"];  // deprecated
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
    
	Cnds.prototype.IsRunning = function ()
	{  
		return ((this.timer)? this.timer.IsActive():false);  
	};
    
	Cnds.prototype.OnTimeout = function ()
	{  
		return this.is_my_call;  
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
            alert ("Timer behavior should connect to a timeline object");          
        
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.type.callback = callback;        
        else
            alert ("Timer behavior should connect to a function object");
	};          
    Acts.prototype.Create = function (command)
	{
        this.command = command;
		var has_rex_function = (this.type.callback != null);
		if (has_rex_function)
		    this.params = {};
	    else
		    this.params = [];
        if (this.timer)  // timer exist
            this.timer.Remove();
        else            // create new timer instance
        {
            this.timer = this.type._timeline_get().CreateTimer(on_timeout);   
            this.timer.plugin = this;
        }
	}; 
	// ---- deprecated ----
    
    Acts.prototype.Start = function (delay_time)
	{
        if ((this.timer == null) && (this.command == null))        
        {
            this.timer = this.type._timeline_get().CreateTimer(on_timeout);
            this.timer.plugin = this;
        }
            
        if (this.timer)
            this.timer.Start(delay_time);
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

    Exps.prototype.Remainder = function (ret)
	{
        var val = (this.timer)? this.timer.RemainderTimeGet():0;     
	    ret.set_float(val);
	};
    
	Exps.prototype.Elapsed = function (ret)
	{
        var val = (this.timer)? this.timer.ElapsedTimeGet():0;     
	    ret.set_float(val);
	};  

    Exps.prototype.RemainderPercent = function (ret)
	{
        var val = (this.timer)? this.timer.RemainderTimePercentGet():0;     
	    ret.set_float(val);
	};
    
	Exps.prototype.ElapsedPercent = function (ret)
	{
        var val = (this.timer)? this.timer.ElapsedTimePercentGet():0;     
	    ret.set_float(val);
	};    
    
	Exps.prototype.DelayTime = function (ret)
	{
        var val = (this.timer)? this.timer.DelayTimeGet():0;     
	    ret.set_float(val);
	};  	
	 
}());