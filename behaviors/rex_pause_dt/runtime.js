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
        this.is_pause = false;
        this.previous_timescale = 0;	     
	};

	behinstProto.tick = function ()
	{
	};  
    
	behinstProto._toogle_pause = function (state)
	{
        var cur_state = this.is_pause;
        if (state == cur_state)
            return;
    
        this.is_pause = (!cur_state);
        var trig_method;
        if (this.is_pause)
        {
            this.previous_timescale = this.inst.my_timescale;
            this.inst.my_timescale = 0;
            trig_method = cr.behaviors.Rex_PauseDt.prototype.cnds.OnPause;
        }
        else
        {
            this.inst.my_timescale = this.previous_timescale;
            this.previous_timescale = 0;
            trig_method = cr.behaviors.Rex_PauseDt.prototype.cnds.OnResume;
        }
        this.runtime.trigger(trig_method, this.inst);   
	}; 
	
	var this_behavior_get = function (inst)
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
		return { "p": this.is_pause,
                 "ts": this.previous_timescale };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.is_pause = o["p"];
		this.previous_timescale = o["ts"];
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
		return this.is_pause;
	};

	var _inst_is_pause = function(inst)
	{
	    var b = this_behavior_get(inst);
	    return (b != null)? b.is_pause:false;
	};

	var _pick_paused_instances = function (type, is_pause)
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
           if (_inst_is_pause(inst) == is_pause)
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
		return _pick_paused_instances(type, true);
	};	

	Cnds.prototype.PickActivatedInstances = function ()
	{	    
	    var cnd = this.runtime.getCurrentCondition();
		var type = cnd.type;
		return _pick_paused_instances(type, false);
	};		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.TooglePause = function ()
	{
        this._toogle_pause();       
	}; 

    Acts.prototype.SetState = function (state)
	{
        var is_pause = (state == 0);
        this._toogle_pause(is_pause);       
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.PreTimescale = function (ret)
	{
	    ret.set_float( this.previous_timescale );
	};
    
}());