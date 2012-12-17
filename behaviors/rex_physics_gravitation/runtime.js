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
        this.has_been_attracted = false;
        this.has_attracting = false;
        this.attracting_source_uid = (-1);
        this.attracted_target_uid = (-1);

        this.pre_sources = {};
        this.pre_targets = {};        
        this.current_sources = {};
        this.current_targets = {};
	};
	
	behinstProto.onDestroy = function()
	{
	    this._source_remove();
	    var uid, has_inst = false;
	    for (uid in this.sources[this.source_tag])
	    {
	        has_inst = true;
	        break;
	    }
	    if (!has_inst)
	        delete this.sources[this.source_tag];
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
        if (is_source)        
            this._source_append();     
        else
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
            
        this.has_been_attracted = false;
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
                this.has_been_attracted = true;
                source_inst.has_attracting = true;
                this._attracting_target(source_inst, this.inst.uid);
                this._attracted_by_source(this, uid);
            }
        }
	};
	behinstProto.tick2 = function ()
	{   
	    this._attracting_target_end();
	    this._attracted_by_source_end();
	    	    
	    copy_table(this.pre_sources, this.current_sources);
	    clean_table(this.current_sources);
	    copy_table(this.pre_targets, this.current_targets);
	    clean_table(this.current_targets);	  
	    this.has_attracting = false;  	    
	};	
	
	behinstProto._attracting_target = function (source_inst, target_uid)
	{
	    source_inst.attracted_target_uid = target_uid;
	    var pre_targets = source_inst.pre_targets;
	    if (!(target_uid in source_inst.pre_targets))
	        this.runtime.trigger(cr.behaviors.Rex_physics_gravitation.prototype.cnds.BeginAttracting, source_inst.inst);  
	    source_inst.current_targets[target_uid] = true;
	}; 
	
	behinstProto._attracted_by_source = function (target_inst, source_uid)
	{
	    this.attracting_source_uid = source_uid;	    
	    var pre_sources = target_inst.pre_sources;
	    if (!(source_uid in target_inst.pre_sources))
    	    this.runtime.trigger(cr.behaviors.Rex_physics_gravitation.prototype.cnds.BeginAttracted, target_inst.inst);  
	    target_inst.current_sources[source_uid] = true; 
	};	
	
	behinstProto._attracting_target_end = function ()
	{
	    var uid;
	    for (uid in this.pre_targets)
	    {
	        if (uid in this.current_targets)
	            continue;
            this.attracted_target_uid = parseInt(uid);	        
	        this.runtime.trigger(cr.behaviors.Rex_physics_gravitation.prototype.cnds.EndAttracting, this.inst);  
	    }   	          
	}; 
	
	behinstProto._attracted_by_source_end = function ()
	{
	    var uid, source_inst;
	    for (uid in this.pre_sources)
	    {
	        if (uid in this.current_sources)
	            continue;     
	        this.attracting_source_uid = uid;  
	        this.runtime.trigger(cr.behaviors.Rex_physics_gravitation.prototype.cnds.EndAttracted, this.inst);  
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

    var clean_table = function (table)
    {
        var key;
        for (key in table)
            delete table[key];
    };
    var copy_table = function (target, source)
    {
        clean_table(target);
        var key;
        for (key in source)
            target[key] = source[key];
    };    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.HasBeenAttracted = function ()
	{
		return this.has_been_attracted;
	};

	Cnds.prototype.BeginAttracted = function ()
	{
		return true;
	};	

	Cnds.prototype.BeginAttracting = function ()
	{
		return true;
	};	
	
	Cnds.prototype.EndAttracted = function ()
	{
		return true;
	};	

	Cnds.prototype.EndAttracting = function ()
	{
		return true;
	};		

	Cnds.prototype.HasAttracting = function ()
	{
		return this.has_attracting;
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetSourceActivated = function (s)
	{
		this._set_source((s==1));
	}; 

	Acts.prototype.SetTargetActivated = function (s)
	{
		this._set_target((s==1));
	}; 	

	Acts.prototype.SetForce = function (f)
	{
		this.gravitation_force = f;
	}; 

	Acts.prototype.SetRange = function (range)
	{
		this._set_range(range);
	}; 

	Acts.prototype.SetSourceTag = function (tag)
	{
		this.source_tag = tag; 
        this._source_append();
	}; 		

	Acts.prototype.SetTargetTag = function (tag)
	{
		this.target_tag = tag; 
	}; 			
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.IsSource = function (ret)
	{
		ret.set_int((this.is_source)? 1:0);
	};
	
	Exps.prototype.IsTarget = function (ret)
	{
		ret.set_int((this.is_target)? 1:0);
	};	
	
	Exps.prototype.Force = function (ret)
	{
		ret.set_float(this.gravitation_force);
	};
	Exps.prototype.Range = function (ret)
	{
		ret.set_float(this.sensitivity_range);
	};	
	Exps.prototype.SourceUID = function (ret)
	{
		ret.set_int(this.attracting_source_uid);
	};		
	Exps.prototype.TargetUID = function (ret)
	{
		ret.set_int(this.attracted_target_uid);
	};	
	Exps.prototype.SourceTag = function (ret)
	{
		ret.set_string(this.source_tag);
	};		
	Exps.prototype.TargetTag = function (ret)
	{
		ret.set_string(this.target_tag);
	};		
			
}());