// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Boids = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Boids.prototype;
		
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
        if (!this.recycled)
        {
            this.output_force = {};
        }
        this.output_force["x"] = 0;
        this.output_force["y"] = 0;          
        
	    this.exp_LastCohesionX = 0;
	    this.exp_LastCohesionY = 0;
	    this.exp_LastAlignmentAngle = 0;	            
	};
    
	behinstProto.onDestroy = function()
	{
	}; 	    
    
	behinstProto.tick = function ()
	{
	};  

	behinstProto.add_cohesion_force = function (insts, cohesion_distance, cohesion_weight)
	{
        // COHESION: steer towards average position of neighbors (long range attraction)
        if ((cohesion_weight <= 0) || (insts.length == 0))
            return;
        
        var cohesionX = this.get_averagePos(insts, true);
        if (cohesionX === null)
            return;
        var cohesionY = this.get_averagePos(insts, false);                
        var angle_cohesion = cr.angleTo(this.inst.x, this.inst.y, cohesionX, cohesionY);
        
        var d = cr.distanceTo(this.inst.x, this.inst.y, cohesionX, cohesionY);
        var p = cohesion_weight * (d / cohesion_distance);
        this.output_force["x"] += (Math.cos(angle_cohesion) * p);
        this.output_force["y"] += (Math.sin(angle_cohesion) * p);  
        
	    this.exp_LastCohesionX = cohesionX;
	    this.exp_LastCohesionY = cohesionY;        
	};  

	behinstProto.add_alignment_force = function (insts, alignment_weight)
	{
        // ALIGNMENT: steer towards average heading of neighbors               
        if ((alignment_weight <= 0) || (insts.length == 0))
            return;
              
        var i,cnt=insts.length, inst, myUID = this.inst.uid;
        var sum=0;
        for(i=0; i<cnt; i++)
        {
            inst = insts[i];        
            if (inst.uid === myUID)
            {
                cnt -= 1;
                continue;
            }        
            sum += inst.angle;
        }
        if (cnt === 0)
            return;
            
        var angle_alignment = sum/cnt;
        
        var p = alignment_weight;
        this.output_force["x"] += (Math.cos(angle_alignment) * p);
        this.output_force["y"] += (Math.sin(angle_alignment) * p);
        
	    this.exp_LastAlignmentAngle = angle_alignment;         
	};
    
	behinstProto.add_separation_force = function (insts, separation_distance, separation_weight)
	{
        // SEPERATION: steer to avoid crowding neighbors      
        if ((separation_weight <= 0) || (insts.length == 0))
            return;        
            
        var i,cnt=insts.length, inst, myUID = this.inst.uid;         
        var dx, dy, dpow2, d, myX=this.inst.x, myY=this.inst.y;
        var angle_seperation, p;
        for(i=0; i<cnt; i++)
        {
            inst = insts[i];        
            if (inst.uid === myUID)            
                continue;
                
            dx = myX - inst.x;
            dy = myY - inst.y;            
            dpow2 = (dx*dx) + (dy*dy);
            angle_seperation = Math.atan2(dy, dx);
            d = Math.sqrt(dpow2);
            p = separation_weight * ((separation_distance - d) / separation_distance);
            
            this.output_force["x"] += (Math.cos(angle_seperation) * p);
            this.output_force["y"] += (Math.sin(angle_seperation) * p);             
        }            
	};   
	 
	behinstProto.add_force = function (a, m)
	{
        this.output_force["x"] += (Math.cos(a) * m);
        this.output_force["y"] += (Math.sin(a) * m);	             
	}; 
	    
	behinstProto.get_averagePos = function (insts, isX)
	{
        var i,cnt=insts.length, inst, myUID = this.inst.uid;
        var sum=0;
        for(i=0; i<cnt; i++)
        {
            inst = insts[i];
            if (inst.uid === myUID)
            {
                cnt -= 1;
                continue;
            }
            sum += (isX)? inst.x : inst.y;
        }
        var avg = (cnt>0)? (sum/cnt):null;
        return avg;
	};

	behinstProto.saveToJSON = function ()
	{
	    this.exp_LastCohesionX = 0;
	    this.exp_LastCohesionY = 0;
	    this.exp_LastAlignmentAngle = 0;	    
		return { "of": this.output_force,
		         "lcx": this.exp_LastCohesionX,
		         "lcy": this.exp_LastCohesionY,
		         "laa": this.exp_LastAlignmentAngle
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.output_force = o["of"];
	    this.exp_LastCohesionX = o["lcx"];
	    this.exp_LastCohesionY = o["lcy"];
	    this.exp_LastAlignmentAngle = o["laa"];
	};    

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.HasForce = function ()
	{
		return (this.output_force["x"] != 0) && (this.output_force["y"] != 0);
	}; 

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.CleanForce = function ()
	{  
        this.output_force["x"] = 0;
        this.output_force["y"] = 0;      
	};  
    
	Acts.prototype.AddCohesionForce = function (objtype, d, w)
	{
        if (!objtype)
            return;
        
        var insts = objtype.getCurrentSol().getObjects();
        this.add_cohesion_force(insts, d, w);
	};    
    
	Acts.prototype.AddAlignmentForce = function (objtype, w)
	{
        if (!objtype)
            return;
        
        var insts = objtype.getCurrentSol().getObjects();
        this.add_alignment_force(insts, w);
	};
    
	Acts.prototype.AddSeparationForce = function (objtype, d, w)
	{
        if (!objtype)
            return;
        
        var insts = objtype.getCurrentSol().getObjects();
        this.add_separation_force(insts, d, w);
	}; 
    
	Acts.prototype.ApplyForceToward = function (x, y, m)
	{
	    if (m === 0)
	        return;
	        
        var a = cr.angleTo(this.inst.x, this.inst.y, x, y);
        this.add_force(a, m);
	}; 	
    
	Acts.prototype.ApplyForceAtAngle = function (a, m)
	{
	    if (m === 0)
	        return;
	        	    
        this.add_force(cr.to_radians(a), m);
	};	   
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
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
	
	Exps.prototype.LastCohesionX = function (ret)
	{
		ret.set_float(this.exp_LastCohesionX);
	};	
	Exps.prototype.LastCohesionY = function (ret)
	{
		ret.set_float(this.exp_LastCohesionY);
	};	
	Exps.prototype.LastAlignmentAngle = function (ret)
	{
		ret.set_float(cr.to_clamped_degrees(this.exp_LastAlignmentAngle));
	};		
	 
}());