// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_LJ_potential = function(runtime)
{
	this.runtime = runtime;
    this.sources = {};
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_LJ_potential.prototype;
		
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
        this.source_tag = this.properties[1]; 
        this.pre_source_tag = null;
        this.target_tag = this.properties[8];        
        this._set_source((this.properties[0] == 1));
        if (!this.recycled)
        {
            this.LJ_potential_param = {};
        }
        this.LJ_potential_param["A"] = this.properties[2];
        this.LJ_potential_param["n"] = this.properties[3];
        this.LJ_potential_param["B"] = this.properties[4];
        this.LJ_potential_param["m"] = this.properties[5];        
        
        this._set_target((this.properties[7] == 1));
        this._set_range(this.properties[6]);

        this.has_been_attracted = false;
        this.has_attracting = false;
        this.attracting_source_uid = (-1);
        this.attracted_target_uid = (-1)
        
        if (!this.recycled)
        {
            this.output_force = {};
        }
        this.output_force["x"] = 0;
        this.output_force["y"] = 0;       
        
        if (!this.recycled)
        {        	           
            this.pre_sources = {};
            this.pre_targets = {};        
            this.current_sources = {};
            this.current_targets = {};
        }
        
        this.inst.extra.rex_LJp = this;  // hook this behavior instance on this.inst.extra
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
			
	    clean_table(this.pre_sources);
	    clean_table(this.pre_targets);	
	    clean_table(this.current_sources);
	    clean_table(this.current_targets);			
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
	};
	behinstProto._set_range = function(range)
	{        
        this.sensitivity_range = range;        
        this.sensitivity_range_pow2 = range*range;                         
	};
		
	behinstProto.tick = function ()
	{               
	};
    
	behinstProto.attracted_by_sources = function ()
	{       
        if (!this.is_target)
            return;
         
        this.output_force["x"] = 0;
        this.output_force["y"] = 0;
        
        this.has_been_attracted = false;
        if (!(this.target_tag in this.sources))
            return;
            
        var sources = this.sources[this.target_tag];
		var my_uid = this.inst.uid;
        var uid, source_inst, inst;
        this.has_been_attracted = false;        
        this.has_attracting = false; 
        for (uid in sources)
        {
            source_inst = sources[uid];
			inst = source_inst.inst;
			
            //We do not want an object to be exerting a gravitational force on itself
            if (my_uid === inst.uid)
            {
                source_inst.has_attracting = false;
                continue;	
            }

            if (!this._in_range(inst,  source_inst.sensitivity_range_pow2))
            {
                source_inst.has_attracting = false;
                continue;
            }
            
            this.has_been_attracted = true;     
            source_inst.has_attracting = true;                   
            this._accumulate_force(source_inst);
            this._attracting_target(source_inst, my_uid);
            this._attracted_by_source(this, uid);
        }       
        
	    this.attracted_end();      
	};
    
	behinstProto.attracted_end = function ()
	{
	    this._attracting_target_end();
	    this._attracted_by_source_end();
	    	        
	    copy_table(this.pre_sources, this.current_sources);
	    clean_table(this.current_sources);
	    copy_table(this.pre_targets, this.current_targets);
	    clean_table(this.current_targets);      
	};    

	behinstProto._attracting_target = function (source_inst, target_uid)
	{
	    source_inst.attracted_target_uid = parseInt(target_uid);
	    var pre_targets = source_inst.pre_targets;
	    if (!(target_uid in source_inst.pre_targets))
	        this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.BeginAttracting, source_inst.inst);  
	    source_inst.current_targets[target_uid] = true;
	}; 
	
	behinstProto._attracted_by_source = function (target_inst, source_uid)
	{
	    this.attracting_source_uid = parseInt(source_uid);
	    var pre_sources = target_inst.pre_sources;
	    if (!(source_uid in target_inst.pre_sources))
    	    this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.BeginAttracted, target_inst.inst);  
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
	        this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.EndAttracting, this.inst);  
	    }   	          
	}; 
	
	behinstProto._attracted_by_source_end = function ()
	{
	    var uid, source_inst;
	    for (uid in this.pre_sources)
	    {
	        if (uid in this.current_sources)
	            continue;     
	        this.attracting_source_uid = parseInt(uid);
	        this.runtime.trigger(cr.behaviors.Rex_LJ_potential.prototype.cnds.EndAttracted, this.inst);  
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
    
    // LJ potential
	behinstProto._accumulate_force = function (source_behavior)
	{       
        var dx = source_behavior.inst.x - this.inst.x;
        var dy = source_behavior.inst.y - this.inst.y;
        // get force
        var r = Math.sqrt( (dx*dx) + (dy*dy) );
        var params = source_behavior.LJ_potential_param;        
        var fA = _term_value_get(params["A"], params["n"], r);
        var fB = _term_value_get(params["B"], params["m"], r);
        var U = fA - fB;
        // accumulate force
        var a = Math.atan2(dy, dx);        
        this.output_force["x"] += U * Math.cos(a);
        this.output_force["y"] += U * Math.sin(a);
	};
    
    var _term_value_get = function (A, n, r)
    {
        var val;
        if (A == 0)
            val = 0;
        else
        {
            switch (n)
            {
            case 0: val = A;                break;
            case 1: val = A/r;              break;
            case 2: val = A/(r*r);          break;
            case 3: val = A/(r*r*r);        break;
            default: val = A/Math.pow(r,n); break;
            }
        }
        return val;
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
    
	behinstProto.saveToJSON = function ()
	{
		return { "st": this.source_tag, 
                 "pst": this.pre_source_tag,
                 "tt": this.target_tag,
                 "is": this.is_source,
                 "it": this.is_target, 
                 "LJparams": this.LJ_potential_param,
                 "sr": this.sensitivity_range,
                 "of": this.output_force,
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.source_tag = o["st"]; 
        this.pre_source_tag = o["pst"];
        this.target_tag = o["tt"];
        this.is_source = o["is"];
        this._set_source(this.is_source);
        this.is_target = o["it"];
        this._set_target(this.is_target);
        this.LJ_potential_param = o["LJparams"];
        this.sensitivity_range = o["sr"];
        this._set_range(this.sensitivity_range);
        this.output_force = o["of"];
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

	Acts.prototype.SetRange = function (range)
	{
		this._set_range(range);
	}; 

	Acts.prototype.SetSourceTag = function (tag)
	{
		this.source_tag = tag; 
        this._source_append();
	}; 		

	Acts.prototype.SetLJParam = function (i, value)
	{
        var params = this.LJ_potential_param;        
        switch (i)
        {
        case 0: params["A"] = value; break;
        case 1: params["n"] = value; break;
        case 2: params["B"] = value; break;
        case 3: params["m"] = value; break;        
        }
	};
	Acts.prototype.SetTargetTag = function (tag)
	{
		this.target_tag = tag; 
	}; 	

	Acts.prototype.UpdateForce = function ()
	{
        this.attracted_by_sources();
	}; 	    
    
	Acts.prototype.CleanForce = function ()
	{
        this.output_force["x"] = 0;
        this.output_force["y"] = 0;  
        this.has_been_attracted = false;         
	};    
    
	Acts.prototype.AttractedBySource = function (objtype)
	{
        if (!objtype)
            return;
             
	    var insts = objtype.getCurrentSol().getObjects();
	    var i, cnt=insts.length, inst, behavior_inst;
        var my_uid=this.inst.uid;
        for (i=0; i<cnt; i++)
        {
            inst = insts[i];
                
            behavior_inst = insts[i].extra.rex_LJp;
            if (behavior_inst == null)
                continue;
                
            if (my_uid === inst.uid)
            {
                behavior_inst.has_attracting = false;
                continue;
            }                
                
            if (!this._in_range(inst,  behavior_inst.sensitivity_range_pow2))
            {
                behavior_inst.has_attracting = false;   
                continue;                
            }
            
            this.has_been_attracted = true; 
            behavior_inst.has_attracting = true;   
            this._accumulate_force(behavior_inst); 
        }
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
    
	Exps.prototype.ForceAngle = function (ret)
	{
        var dx = this.output_force["x"];
        var dy = this.output_force["y"];    
        var a = Math.atan2(dy, dx);
		ret.set_float(cr.to_clamped_degrees(a));
	};	
	Exps.prototype.ForceMagnitude = function (ret)
	{
        var dx = this.output_force["x"];
        var dy = this.output_force["y"];    
        var m = Math.sqrt( (dx*dx) + (dy*dy) );
		ret.set_float(m);
	};   
	Exps.prototype.ForceDx = function (ret)
	{
		ret.set_float(this.output_force["x"]);
	};	
	Exps.prototype.ForceDy = function (ret)
	{
		ret.set_float(this.output_force["y"]);
	};   
    
}());