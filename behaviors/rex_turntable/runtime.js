// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Turntable = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Turntable.prototype;
		
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
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.target = {"a":0, "cw":true};   
        this.dec = 0; 
        this.is_rotating = false;  
        this.current_speed = 0;
        this.next_speed = 0;        
        this.remain_distance = 0;

        this.is_my_call = false;
	};

	behinstProto.tick = function ()
	{
        if (!this.is_rotating)
        {
            return;
        }
        
		var dt = this.runtime.getDt(this.inst);
        if (dt==0)   // can not move if dt == 0
            return;

        // this.current_speed ....
        this.current_speed = this.next_speed;

		// Apply movement to the object     
        var distance = this.current_speed * dt;
        this.remain_distance -= distance;   
        
        var is_hit_target = false;        
        // is hit to target at next tick?
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {
            this.is_rotating = false;
            this.inst.angle = cr.to_clamped_radians(this.target["a"]);
            this.current_speed = 0;
            is_hit_target = true;
        }
        else
        {
            if (this.target["cw"])
                this.inst.angle += cr.to_clamped_radians(distance);
            else
                this.inst.angle -= cr.to_clamped_radians(distance);
                
            // assign next speed
            this.next_speed -= (this.dec*dt);
        } 
		this.inst.set_bbox_changed();      
		
		
        if (is_hit_target)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_Turntable.prototype.cnds.OnHitTarget, this.inst); 
            this.is_my_call = false;
        }		  
	}; 
	
	behinstProto.StartSpinning = function (turns, cw, angle, dec)
	{	   
	    var start = cr.to_clamped_degrees(this.inst.angle);
	    var end = angle;
	    var distance = end - start;
	    if (!cw)
	        distance = -distance;
	    distance = cr.clamp_angle_degrees( distance );
	    distance += (360 * turns); 
	    	    
	    this.target["a"] = end;
	    this.target["cw"] = cw;
	    this.dec = dec;
	    
        this.is_rotating = true;  
        this.next_speed = Math.sqrt( 2*dec*distance	);   
        this.current_speed = this.next_speed;   
	    this.remain_distance = distance;
	};

	behinstProto.saveToJSON = function ()
	{
		return { "t": this.target,
                 "dec": this.dec,
                 "isr": this.is_rotatingd,
                 "curv": this.current_speed,
                 "nxv": this.next_speed,
                 "rd": this.remain_distance,
                 };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
        this.target = o["t"];
        this.dec = o["dec"]; 
        this.is_rotating = o["isr"];
        this.current_speed = o["curv"];       
        this.remain_distance = o["rd"];
	};
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnHitTarget = function ()
	{
		return (this.is_my_call);
	};

	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.current_speed, cmp, s);
	};   

	Cnds.prototype.IsRotating = function ()
	{
		return this.is_rotating;
	};
   
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.StartSpinning = function (turns, cw, angle, dec)
	{
	    if (dec <= 0)
	    {
            alert("Rex_Turntable behavior: deceleration must larger than 0.");
            return;
        }
        	        	    
	    this.StartSpinning(turns, (cw === 1), cr.clamp_angle_degrees(angle) , dec);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.current_speed);
	};

 	Exps.prototype.Dec = function (ret)
	{
		ret.set_float(this.dec);
	}; 

	Exps.prototype.TargetAngle = function (ret)
	{
        var x = (this.is_rotating)? this.target["a"]:0;
		ret.set_float(x);
	};    
}());