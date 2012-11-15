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
        this.callback = null; 
        this.callback_type = 0;		
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
        this.command = ""; 
        this.params = null     
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
    
    behinstProto._timer_handle = function()
    {
        // setup sol
        var sol = this.type.objtype.getCurrentSol();
        sol.select_all = false;
	    sol.instances.length = 1;        
        sol.instances[0] = this.inst;
        // call function object
		if (this.type.callback_type == 1)
		    this.type.callback.CallFn(this.command, this.params);     			
		else
		    this.type.timeline.RunCallback(this.command, this.params);
    };

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsRunning = function ()
	{  
		return ((this.timer)? this.timer.IsActive():false);  
	};

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.Setup = function (timeline_objs, fn_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
		{
            this.type.timeline = timeline;        
			this.type.callback_type = 1;		
	    }
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
		if (this.params == null)
		    this.params = {};
        if (this.timer)  // timer exist
            this.timer.Remove();
        else            // create new timer instance
            this.timer = this.type.timeline.CreateTimer(this, this._timer_handle);   
	}; 
    
    Acts.prototype.Start = function (delay_time)
	{
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
    
    Acts.prototype.SetParameter = function (index, value)
	{
	    if (this.params == null)
		    this.params = {index:value};
	    else
            this.params[index] = value;
	};    

    Acts.prototype.Setup2 = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Timer behavior should connect to a timeline object");          
	};

    Acts.prototype.Create2 = function (callback_name, callback_params)
	{
        this.command = command;
		if (this.params == null)
		    this.params = [];
		cr.shallowAssignArray(this.params, callback_params);
		
        if (this.timer)  // timer exist
            this.timer.Remove();
        else            // create new timer instance
            this.timer = this.type.timeline.CreateTimer(this, this._timer_handle);   
	}; 	
	
    Acts.prototype.SetParameters = function (callback_params)
	{
		if (this.params == null)
		    this.params = [];
		cr.shallowAssignArray(this.params, callback_params);
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
    
	Exps.prototype.Elapsed = function (ret, timer_name)
	{
        var val = (this.timer)? this.timer.ElapsedTimeGet():0;     
	    ret.set_float(val);
	};  

    Exps.prototype.RemainderPercent = function (ret)
	{
        var val = (this.timer)? this.timer.RemainderTimePercentGet():0;     
	    ret.set_float(val);
	};
    
	Exps.prototype.ElapsedPercent = function (ret, timer_name)
	{
        var val = (this.timer)? this.timer.ElapsedTimePercentGet():0;     
	    ret.set_float(val);
	};     
}());