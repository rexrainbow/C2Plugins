// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_PauseDt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_PauseDt.prototype;
		
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
	};
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{      
        this.isPaused = false;
        this.previousTimescale = 0;	     
	};

	behinstProto.tick = function ()
	{
	};  
    
	behinstProto.setPauseState = function (state)
	{
        var currentState = this.isPaused;
        if (state == currentState)
            return;
    
        this.isPaused = (!currentState);
        var trigMethod;
        if (this.isPaused)
        {
            this.previousTimescale = this.inst.my_timescale;
            this.inst.my_timescale = 0;
            trigMethod = cr.behaviors.Rex_PauseDt.prototype.cnds.OnPause;
        }
        else
        {
            this.inst.my_timescale = this.previousTimescale;
            this.previousTimescale = 0;
            trigMethod = cr.behaviors.Rex_PauseDt.prototype.cnds.OnResume;
        }
        this.runtime.trigger(trigMethod, this.inst);   
	}; 
	
	var getThisBehavior = function (inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};	
	
	behinstProto.saveToJSON = function ()
	{
		return { "p": this.isPaused,
                 "ts": this.previousTimescale };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.isPaused = o["p"];
		this.previousTimescale = o["ts"];
	};	
	 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnPause = function ()
	{
		return true;
	};

	Cnds.prototype.OnResume = function ()
	{
		return true;
	};   

	Cnds.prototype.IsPause = function ()
	{
		return this.isPaused;
	};

	var getPausedState = function(inst)
	{
	    var b = getThisBehavior(inst);
	    return (b != null)? b.isPaused:false;
	};

	var pickPausedInstances = function (type, isPaused)
	{
	    var sol = type.getCurrentSol();  
        //sol.select_all = true;   
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        sol.instances.length = 0;   // clear contents
        for (i=0; i < insts_length; i++)
        {
           inst = insts[i];
           if (getPausedState(inst) == isPaused)
               sol.instances.push(inst);
        }
        sol.select_all = false;  
        type.applySolToContainer();  
        return  (sol.instances.length >0);          
	}; 
	Cnds.prototype.PickPauseInstances = function ()
	{	    
	    var cnd = this.runtime.getCurrentCondition();
		var type = cnd.type;
		return pickPausedInstances(type, true);
	};	

	Cnds.prototype.PickActivatedInstances = function ()
	{	    
	    var cnd = this.runtime.getCurrentCondition();
		var type = cnd.type;
		return pickPausedInstances(type, false);
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.TooglePause = function ()
	{
        this.setPauseState();       
	}; 

    Acts.prototype.SetState = function (state)
	{
        var isPaused = (state == 0);
        this.setPauseState(isPaused);       
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.PreTimescale = function (ret)
	{
	    ret.set_float( this.previousTimescale );
	};
    
}());