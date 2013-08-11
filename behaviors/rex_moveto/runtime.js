// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_MoveTo = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_MoveTo.prototype;
		
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
        this.target = {"x":0 , "y":0, "a":0};
        this.is_moving = false;  
        this.current_speed = 0;
        this.remain_distance = 0;
        this.is_hit_target = false;
        this._pre_pos = {"x":0,"y":0};
        this._moving_angle_info = {"x":0,"y":0,"a":(-1)};
        this._last_tick = null;
        this.is_my_call = false;
	};

	behinstProto.tick = function ()
	{
        if (this.is_hit_target)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnHitTarget, this.inst); 
            this.is_my_call = false;
            this.is_hit_target = false;
        }
        
        if ( (!this.activated) || (!this.is_moving) ) 
        {
            return;
        }
        
		var dt = this.runtime.getDt(this.inst);
        if (dt==0)   // can not move if dt == 0
            return;
        
        if ((this._pre_pos["x"] != this.inst.x) || (this._pre_pos["y"] != this.inst.y))
		    this._reset_current_pos();    // reset this.remain_distance
		    
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
        
        // is hit to target at next tick?
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {
            this.is_moving = false;
            this.inst.x = this.target["x"];
            this.inst.y = this.target["y"];
            this.SetCurrentSpeed(0);
            this.moving_angle_get();
            this.is_hit_target = true;
        }
        else
        {
            var angle = this.target["a"];
            this.inst.x += (distance * Math.cos(angle));
            this.inst.y += (distance * Math.sin(angle));
        } 

		this.inst.set_bbox_changed();
		this._pre_pos["x"] = this.inst.x;
		this._pre_pos["y"] = this.inst.y;          
	}; 
	behinstProto.tick2 = function ()
	{
        // save pre pos to get moveing angle
        this._moving_angle_info["x"] = this.inst.x;
		this._moving_angle_info["y"] = this.inst.y;       
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
    
	behinstProto._reset_current_pos = function ()
	{
        var dx = this.target["x"] - this.inst.x;
        var dy = this.target["y"] - this.inst.y;

        this.target["a"] = Math.atan2(dy, dx);
        this.remain_distance = Math.sqrt( (dx*dx) + (dy*dy) );
		this._pre_pos["x"] = this.inst.x;
		this._pre_pos["y"] = this.inst.y; 
	};
	
	behinstProto.SetTargetPos = function (_x, _y)
	{
        this.is_moving = true;         
		this.target["x"] = _x;
        this.target["y"] = _y;         	    
        this._reset_current_pos();
        this.SetCurrentSpeed(null);
		this._moving_angle_info["x"] = this.inst.x;
		this._moving_angle_info["y"] = this.inst.y;         
	};
    
	behinstProto.is_tick_changed = function ()
	{       
	    var cur_tick = this.runtime.tickcount;
		var tick_changed = (this._last_tick != cur_tick);
        this._last_tick = cur_tick;
		return tick_changed;
	};
    
 	behinstProto.moving_angle_get = function (ret)
	{
        if (this.is_tick_changed())
        {   
            var dx = this.inst.x - this._moving_angle_info["x"];
            var dy = this.inst.y - this._moving_angle_info["y"];
            if ((dx!=0) || (dy!=0))
                this._moving_angle_info["a"] = cr.to_clamped_degrees(Math.atan2(dy,dx));
        }
		return this._moving_angle_info["a"];
	}; 
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
		         "v": this.move,
                 "t": this.target,
                 "is_m": this.is_moving,
                 "c_spd" : this.current_speed,
                 "rd" : this.remain_distance,
                 "is_ht" : this.is_hit_target,
                 "pp": this._pre_pos,
                 "ma": this._moving_angle_info,
                 "lt": this._last_tick,
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{  
		this.activated = o["en"];
		this.move = o["v"]; 
		this.target = o["t"];
		this.is_moving = o["is_m"]; 
		this.current_speed = o["c_spd"];
		this.remain_distance = o["rd"];		
		this.is_hit_target = o["is_ht"];
        this._pre_pos = o["pp"];
        this._moving_angle_info = o["ma"];
        this._last_tick = o["lt"];      
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
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this.activated && this.is_moving);
	};

	Cnds.prototype.CompareMovingAngle = function (cmp, s)
	{
        var angle = this.moving_angle_get();
        if (angle != (-1))
		    return cr.do_cmp(this.moving_angle_get(), cmp, s);
        else
            return false;
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
    
	Acts.prototype.SetTargetPos = function (_x, _y)
	{
        this.SetTargetPos(_x, _y)
	};
    
	Acts.prototype.SetCurrentSpeed = function (s)
	{
        this.SetCurrentSpeed(s);
	}; 
    
 	Acts.prototype.SetTargetPosOnObject = function (objtype)
	{
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
        if (inst != null)
            this.SetTargetPos(inst.x, inst.y);
	};
    
 	Acts.prototype.SetTargetPosByDeltaXY = function (dx, dy)
	{
        this.SetTargetPos(this.inst.x + dx, this.inst.y + dy);
	};    
    
 	Acts.prototype.SetTargetPosByDistanceAngle = function (distance, angle)
	{
        var a = cr.to_clamped_radians(angle);
        var dx = distance*Math.cos(a);
        var dy = distance*Math.sin(a);
        this.SetTargetPos(this.inst.x + dx, this.inst.y + dy);
	};      
    
 	Acts.prototype.Stop = function ()
	{
        this.is_moving = false;
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

	Exps.prototype.TargetX = function (ret)
	{
		ret.set_float(this.target["x"]);
	};  

 	Exps.prototype.TargetY = function (ret)
	{
		ret.set_float(this.target["y"]);
	};     

 	Exps.prototype.MovingAngle = function (ret)
	{
		ret.set_float(this.moving_angle_get());
	};     
}());