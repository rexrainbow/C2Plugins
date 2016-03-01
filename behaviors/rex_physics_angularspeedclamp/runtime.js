// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_physics_angularspeedclamp = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_physics_angularspeedclamp.prototype;
		
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
        this.physics_behavior_inst = null;
        	 
        this.activated = (this.properties[0] === 1);
        this.set_upper_bound(this.properties[1]);
        this.set_lower_bound(this.properties[2]);
	};
	
	behinstProto.onDestroy = function()
	{		
	}; 	

	behinstProto._get_physics_behavior_inst = function ()
    {
        if (this.physics_behavior_inst)
            return this.physics_behavior_inst;
            
	    if (!cr.behaviors.Physics)
		{
		    assert2("No physics behavior found in this object "+this.inst.type.name);
	    }
		var behavior_insts = this.inst.behavior_insts;
		var i, len=behavior_insts.length;
		for (i=0; i<len; i++)
		{
			if (behavior_insts[i] instanceof cr.behaviors.Physics.prototype.Instance)
			{
                this.physics_behavior_inst =  behavior_insts[i];
				return this.physics_behavior_inst;
	        }
		}
		
		assert2("No physics behavior found in this object."+this.inst.type.name);
    };
    	
	behinstProto.tick = function ()
	{
        if (!this.activated)
            return;

        if (this.upper_bound === this.lower_bound)
            this.set_speed(this.upper_bound);
        else
        {
            var speed = this.get_speed();
            if (speed < this.lower_bound)
            {
                this.set_speed(this.lower_bound);
                this.runtime.trigger(cr.behaviors.Rex_physics_angularspeedclamp.prototype.cnds.OnHitLowerBound, this.inst);
            }
            else if (speed > this.upper_bound)
            {
                this.set_speed(this.upper_bound);
                this.runtime.trigger(cr.behaviors.Rex_physics_angularspeedclamp.prototype.cnds.OnHitUpperBound, this.inst);
            }
        }
	};	

	var fake_ret = {value:0,
	               set_any: function(value){this.value=value;},
	               set_int: function(value){this.value=value;},	 
                   set_float: function(value){this.value=value;},	 
                   set_string: function(value){this.value=value;},	    
	              };     
                  
    behinstProto.get_speed = function ()
	{     
        var physics_behavior_inst = this._get_physics_behavior_inst();
        cr.behaviors.Physics.prototype.exps.AngularVelocity.call(physics_behavior_inst, fake_ret);
        return fake_ret.value;   
	};

    behinstProto.set_speed = function (speed)
	{     
        var cur_spd = this.get_speed();
        if (speed !== cur_spd)
        {
            var physics_behavior_inst = this._get_physics_behavior_inst(); 
            cr.behaviors.Physics.prototype.acts.SetAngularVelocity.call(physics_behavior_inst, speed);
        }
	};
    
	behinstProto.set_upper_bound = function(v)
	{		
        this.upper_bound = v;
	}; 	    
    
	behinstProto.set_lower_bound = function(v)
	{		
        this.lower_bound = v;
	}; 
	behinstProto.saveToJSON = function ()
	{
		return { "e": this.activated, 
                 "u": this.upper_bound,
                 "l": this.lower_bound,
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.activated = o["e"]; 
        this.upper_bound = o["u"];
        this.lower_bound = o["l"];
	};        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnHitUpperBound = function ()
	{
		return true;
	};
    
	Cnds.prototype.OnHitLowerBound = function ()
	{
		return true;
	}; 	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s===1);
	};     

    Acts.prototype.SetUpperBound = function (v)
	{
		this.set_upper_bound(v);
	};
    Acts.prototype.SetLowerBound = function (v)
	{
		this.set_lower_bound(v);
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.CurSpeed = function (ret)
	{
		ret.set_float(this.get_speed());
	};    
	Exps.prototype.UpperBound = function (ret)
	{
		ret.set_float(this.upper_bound);
	};

	Exps.prototype.LowerBound = function (ret)
	{
		ret.set_float(this.lower_bound);
	};    
    
}());