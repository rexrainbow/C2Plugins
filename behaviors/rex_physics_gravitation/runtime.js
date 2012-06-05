// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_physics_gravitation = function(runtime)
{
	this.runtime = runtime;
    this.sources = {};
};

(function ()
{
    var worldScale = 0.02;
	var behaviorProto = cr.behaviors.Rex_physics_gravitation.prototype;
		
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
        this.sources = this.behavior.sources;         
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{     
        this.physics_behavior_inst = null;
        	 
        this.source_tag = this.properties[1]; 
        this.pre_source_tag = null;
        this.target_tag = this.properties[5];        
        this._set_source((this.properties[0] == 1));
        this._set_target((this.properties[4] == 1));
        this.gravitation_force = this.properties[2];
        this._set_range(this.properties[3]);
        this.inhaled = false;
        this.inhaled_source_uid = 0;
	};
	
	behinstProto._source_append = function()
	{
        if (this.pre_source_tag == this.source_tag)
            return;
            
        var uid = this.inst.uid;
        if ((this.pre_source_tag != null) && (this.pre_source_tag in this.sources))
        {
            var sources = this.sources[this.pre_source_tag];
            if (uid in sources)
                delete sources[uid];
        }
        if (!(this.source_tag in this.sources))
            this.sources[this.source_tag] = {};
        this.sources[this.source_tag][uid] = this;
        this.pre_source_tag = this.source_tag;
	};
    
	behinstProto._source_remove = function()
	{
        var uid = this.inst.uid;
        if (this.source_tag in this.sources)
        {
            var sources = this.sources[this.source_tag];
            if (uid in sources)
                delete sources[uid];
        }
        this.pre_source_tag = null;
	};    
    
	behinstProto._set_source = function(is_source)
	{        
        this.is_source = is_source;
        var uid = this.inst.uid;
        if (is_source)        
            this._source_append();     
        else if (uid in this.sources)
            this._source_remove();
                                
	};
	behinstProto._set_target = function(is_target)
	{        
        this.is_target = is_target;
        if (is_target && (this.physics_behavior_inst == null))
            this.physics_behavior_inst = this._get_physics_behavior_inst();                 
	};
	behinstProto._set_range = function(range)
	{        
        this.sensitivity_range_pow2 = range*range;                     
        this.sensitivity_range = range;        
	};
	
	behinstProto._get_physics_behavior_inst = function ()
    {
        var i = this.type.objtype.getBehaviorIndexByName("Physics");   
        if (typeof i == "number")
            return this.inst.behavior_insts[i];
        else
            alert("You should add a physics for gravitation behavior.");
    };
  
	behinstProto.tick = function ()
	{
        if (!this.is_target)
            return;
            
        this.inhaled = false;
        if (!(this.target_tag in this.sources))
            return;
            
        var sources = this.sources[this.target_tag];
        var uid, source_inst, inst, source_grange_pow2;
        for (uid in sources)
        {
            source_inst = sources[uid];
            source_grange_pow2 = source_inst.sensitivity_range_pow2;
            inst = source_inst.inst;
            if (this._in_range(inst,  source_grange_pow2))
            {
                this._apply_force_toward(source_inst.gravitation_force, inst.x, inst.y);
                this.inhaled = true;
                this.inhaled_source_uid = uid;
                this.runtime.trigger(cr.behaviors.Rex_physics_gravitation.prototype.cnds.OnInhaled, this.inst);  
            }
        }
	};
    
	behinstProto._in_range = function (inst1, sensitivity_range_pow2)
	{
	   if (sensitivity_range_pow2 == 0)
	       return true;
	       
       var inst0 = this.inst;
       var dx = inst1.x - inst0.x;
       var dy = inst1.y - inst0.y;
       var distance_pow2 = (dx*dx)+(dy*dy);
       return (distance_pow2 <= sensitivity_range_pow2);
	}; 
    
	behinstProto._apply_force_toward = function (f, px, py)
	{
       cr.behaviors.Physics.prototype.acts.ApplyForceToward.apply(this.physics_behavior_inst, [f, px, py, 0]);       
	};    
    
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.Inhaled = function ()
	{
		return this.inhaled;
	};

	cnds.OnInhaled = function ()
	{
		return true;
	};	
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetSourceActivated = function (s)
	{
		this._set_source((s==1));
	}; 

	acts.SetTargetActivated = function (s)
	{
		this._set_target((s==1));
		this._set_target((s==1));
	}; 	

	acts.SetForce = function (f)
	{
		this.gravitation_force = f;
	}; 

	acts.SetRange = function (range)
	{
		this._set_range(range);
	}; 

	acts.SetSourceTag = function (tag)
	{
		this.source_tag = tag; 
        this._source_append();
	}; 		

	acts.SetTargetTag = function (tag)
	{
		this.target_tag = tag; 
	}; 			
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
	
	exps.IsSource = function (ret)
	{
		ret.set_int((this.is_source)? 1:0);
	};
	
	exps.IsTarget = function (ret)
	{
		ret.set_int((this.is_target)? 1:0);
	};	
	
	exps.Force = function (ret)
	{
		ret.set_float(this.gravitation_force);
	};
	exps.Range = function (ret)
	{
		ret.set_float(this.sensitivity_range);
	};	
	exps.SourceUID = function (ret)
	{
		ret.set_int(this.inhaled_source_uid);
	};		
}());