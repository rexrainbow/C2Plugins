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
            this.outputForce = {};
        }
        this.outputForce["x"] = 0;
        this.outputForce["y"] = 0;          
        
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

	behinstProto.addCohesionForce = function (insts, cohesionDistance, cohesionWeight)
	{
        // COHESION: steer towards average position of neighbors (long range attraction)
        if ((cohesionWeight <= 0) || (insts.length == 0))
            return;
        
        var cohesionX = this.getAvgPos(insts, true);
        if (cohesionX === null)
            return;
        var cohesionY = this.getAvgPos(insts, false);                
        var cohesionAngle = cr.angleTo(this.inst.x, this.inst.y, cohesionX, cohesionY);
        
        var d = cr.distanceTo(this.inst.x, this.inst.y, cohesionX, cohesionY);
        var p = cohesionWeight * (d / cohesionDistance);
        this.outputForce["x"] += (Math.cos(cohesionAngle) * p);
        this.outputForce["y"] += (Math.sin(cohesionAngle) * p);  
        
	    this.exp_LastCohesionX = cohesionX;
	    this.exp_LastCohesionY = cohesionY;        
	};  

	behinstProto.addAlignmentForce = function (insts, alignment_weight)
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
            sum += cr.to_clamped_degrees(inst.angle);
        }
        if (cnt === 0)
            return;
            
        var angle_alignment = cr.to_clamped_radians(sum/cnt);
        
        var p = alignment_weight;
        this.outputForce["x"] += (Math.cos(angle_alignment) * p);
        this.outputForce["y"] += (Math.sin(angle_alignment) * p);
        
	    this.exp_LastAlignmentAngle = angle_alignment;         
	};
    
	behinstProto.addSeparationForce = function (insts, separationDistance, separationWeight)
	{
        // SEPERATION: steer to avoid crowding neighbors      
        if ((separationWeight <= 0) || (insts.length == 0))
            return;        
            
        var i,cnt=insts.length, inst, myUID = this.inst.uid;         
        var dx, dy, dpow2, d, myX=this.inst.x, myY=this.inst.y;
        var seperationAngle, p;
        for(i=0; i<cnt; i++)
        {
            inst = insts[i];        
            if (inst.uid === myUID)            
                continue;
                
            dx = myX - inst.x;
            dy = myY - inst.y;            
            dpow2 = (dx*dx) + (dy*dy);
            seperationAngle = Math.atan2(dy, dx);
            d = Math.sqrt(dpow2);
            p = separationWeight * ((separationDistance - d) / separationDistance);
            
            this.outputForce["x"] += (Math.cos(seperationAngle) * p);
            this.outputForce["y"] += (Math.sin(seperationAngle) * p);             
        }            
	};   
	 
	behinstProto.addForce = function (a, m)
	{
        this.outputForce["x"] += (Math.cos(a) * m);
        this.outputForce["y"] += (Math.sin(a) * m);	             
	}; 
	    
	behinstProto.getAvgPos = function (insts, isX)
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
		return { "of": this.outputForce,
		         "lcx": this.exp_LastCohesionX,
		         "lcy": this.exp_LastCohesionY,
		         "laa": this.exp_LastAlignmentAngle
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{            
        this.outputForce = o["of"];
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
		return (this.outputForce["x"] != 0) && (this.outputForce["y"] != 0);
	}; 

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.CleanForce = function ()
	{  
        this.outputForce["x"] = 0;
        this.outputForce["y"] = 0;      
	};  
    
	Acts.prototype.AddCohesionForce = function (objtype, d, w)
	{
        if (!objtype)
            return;
        
        var insts = objtype.getCurrentSol().getObjects();
        this.addCohesionForce(insts, d, w);
	};    
    
	Acts.prototype.AddAlignmentForce = function (objtype, w)
	{
        if (!objtype)
            return;
        
        var insts = objtype.getCurrentSol().getObjects();
        this.addAlignmentForce(insts, w);
	};
    
	Acts.prototype.AddSeparationForce = function (objtype, d, w)
	{
        if (!objtype)
            return;
        
        var insts = objtype.getCurrentSol().getObjects();
        this.addSeparationForce(insts, d, w);
	}; 
    
	Acts.prototype.ApplyForceToward = function (x, y, m)
	{
	    if (m === 0)
	        return;
	        
        var a = cr.angleTo(this.inst.x, this.inst.y, x, y);
        this.addForce(a, m);
	}; 	
    
	Acts.prototype.ApplyForceAtAngle = function (a, m)
	{
	    if (m === 0)
	        return;
	        	    
        this.addForce(cr.to_radians(a), m);
	};	   
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.ForceAngle = function (ret)
	{
        var dx = this.outputForce["x"];
        var dy = this.outputForce["y"];    
        var a = Math.atan2(dy, dx);
		ret.set_float(cr.to_clamped_degrees(a));
	};	
	Exps.prototype.ForceMagnitude = function (ret)
	{
        var dx = this.outputForce["x"];
        var dy = this.outputForce["y"];    
        var m = Math.sqrt( (dx*dx) + (dy*dy) );
		ret.set_float(m);
	};   
	Exps.prototype.ForceDx = function (ret)
	{
		ret.set_float(this.outputForce["x"]);
	};	
	Exps.prototype.ForceDy = function (ret)
	{
		ret.set_float(this.outputForce["y"]);
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