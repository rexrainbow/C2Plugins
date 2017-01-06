// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_RotateTo = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_RotateTo.prototype;
		
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
        this.activated = (this.properties[0] == 1);
        this.move = {"max":this.properties[1],
                     "acc":this.properties[2],
                     "dec":this.properties[3]};
        this.target = {"a":0, "cw":true};  
        this.is_rotating = false;  
        this.current_speed = 0;       
        this.remain_distance = 0;

        this.is_my_call = false;
	};

	behinstProto.tick = function ()
	{
        if ( (!this.activated) || (!this.is_rotating) ) 
        {
            return;
        }
        
		var dt = this.runtime.getDt(this.inst);
        if (dt==0)   // can not move if dt == 0
            return;

        // assign speed
        var is_slow_down = false;
        if (this.move["dec"] != 0)
        {
            // is time to deceleration?                
            var _speed = this.current_speed;
            var _distance = (_speed*_speed)/(2*this.move["dec"]); // (v*v)/(2*a)
            is_slow_down = (_distance >= this.remain_distance);
        }
        var acc = (is_slow_down)? (-this.move["dec"]):this.move["acc"];
        if (acc != 0)
        {
            this.SetCurrentSpeed( this.current_speed + (acc * dt) );    
        }

		// Apply movement to the object     
        var distance = this.current_speed * dt;
        this.remain_distance -= distance;   
        
        var is_hit_target = false;        
        // is hit to target at next tick?
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {
            this.is_rotating = false;
            this.inst.angle = cr.to_clamped_radians(this.target["a"]);
            this.SetCurrentSpeed(0);
            is_hit_target = true;
        }
        else
        {
            if (this.target["cw"])
                this.inst.angle += cr.to_clamped_radians(distance);
            else
                this.inst.angle -= cr.to_clamped_radians(distance);
        } 
		this.inst.set_bbox_changed();      
		
        if (is_hit_target)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_RotateTo.prototype.cnds.OnHitTarget, this.inst); 
            this.is_my_call = false;
        }		  
	}; 
	behinstProto.tick2 = function ()
	{ 
    };
    
	behinstProto.SetCurrentSpeed = function(speed)
	{
        if (speed != null)
        {
            this.current_speed = (speed > this.move["max"])? 
                                 this.move["max"]: speed;
        }        
        else if (this.move["acc"]==0)
        {
            this.current_speed = this.move["max"];
        }
	};
	
	behinstProto.SetTargetAngle = function (target_angle_radians, clockwise_mode)  // in radians
	{
        this.is_rotating = true;
        var cur_angle_radians = this.inst.angle;

        this.target["cw"] = (clockwise_mode == 2)? cr.angleClockwise(target_angle_radians, cur_angle_radians) :
                                                   (clockwise_mode == 1);
        var remain_distance = (clockwise_mode == 2)? cr.angleDiff(cur_angle_radians, target_angle_radians) :
                              (clockwise_mode == 1)? (target_angle_radians - cur_angle_radians) :
                                                     (cur_angle_radians - target_angle_radians);
        this.remain_distance = cr.to_clamped_degrees(remain_distance);

        this.target["a"] = cr.to_clamped_degrees(target_angle_radians);
        this.SetCurrentSpeed(null); 
	};

	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
                 "v": this.move,
                 "t": this.target,
                 "ir": this.is_rotating,
                 "cs": this.current_speed,
                 "rd": this.remain_distance
                 };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
        this.activated = o["en"];
        this.move = o["v"];
        this.target = o["t"];
        this.is_rotating = o["ir"];
        this.current_speed = o["cs"];     
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

    Cnds.prototype.OnMoving = function ()  // deprecated
	{
		return false;
	};
    
	Cnds.prototype.IsRotating = function ()
	{
		return (this.activated && this.is_rotating);
	};
   
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s == 1);
	};  

	Acts.prototype.SetMaxSpeed = function (s)
	{
		this.move["max"] = s;
        this.SetCurrentSpeed(null);
	};      
    
	Acts.prototype.SetAcceleration = function (a)
	{
		this.move["acc"] = a;
        this.SetCurrentSpeed(null);
	};
	
	Acts.prototype.SetDeceleration = function (a)
	{
		this.move["dec"] = a;
	};
    
	Acts.prototype.SetTargetAngle = function (angle, clockwise_mode)
	{
        this.SetTargetAngle(cr.to_clamped_radians(angle), clockwise_mode)
	};
    
	Acts.prototype.SetCurrentSpeed = function (s)
	{
        this.SetCurrentSpeed(s);
	}; 
    
 	Acts.prototype.SetTargetAngleOnObject = function (objtype, clockwise_mode)
	{
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
        if (inst != null)
        {
            var angle = Math.atan2(inst.y-this.inst.y , inst.x-this.inst.x);
            this.SetTargetAngle(angle, clockwise_mode);
        }
	};
    
 	Acts.prototype.SetTargetAngleByDeltaAngle = function (dA, clockwise_mode)
	{
	    var dA_rad = cr.to_clamped_radians(dA);
	    if (clockwise_mode==0)
	        dA_rad = -dA_rad;
	    var angle = this.inst.angle + dA_rad;
        this.SetTargetAngle(angle, clockwise_mode);
	};    
    
 	Acts.prototype.SetTargetAngleToPos = function (tx, ty, clockwise_mode)
	{
	    var angle = Math.atan2(ty-this.inst.y , tx-this.inst.x);
        this.SetTargetAngle(angle, clockwise_mode);
	}; 
       
 	Acts.prototype.Stop = function ()
	{
        this.is_rotating = false;
	};   	
        
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};    
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.current_speed);
	};
    
	Exps.prototype.MaxSpeed = function (ret)
	{
		ret.set_float(this.move["max"]);
	}; 

	Exps.prototype.Acc = function (ret)
	{
		ret.set_float(this.move["acc"]);
	};  

 	Exps.prototype.Dec = function (ret)
	{
		ret.set_float(this.move["dec"]);
	}; 

	Exps.prototype.TargetAngle = function (ret)
	{
        var x = (this.is_rotating)? this.target["a"]:0;
		ret.set_float(x);
	};    
}());