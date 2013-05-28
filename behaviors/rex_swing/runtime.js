// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Swing = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Swing.prototype;
		
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
        var start = this.properties[1];
        var _angle = this.properties[2];
        var dir = (_angle >= 0);
        var angle = (dir)? _angle:(-_angle); 
        var end =  start + _angle;    
        
        this.activated = (this.properties[0] == 1);
        this.swing = {"start":start,
                      "dir":dir,
                      "a":angle,
                      "end":end};
        this.rotate = {"max":this.properties[3],
                       "acc":this.properties[4],
                       "dec":this.properties[5]};
        this.is_setup = true;
        this.current_target = 0;
        this.current_dir = dir;
        this.current_speed = 0;
        this.current_angle = start;
        this.remain_angle = 0;  

        this.is_my_call = false;        
	};

	behinstProto.tick = function ()
	{
        if (!this.activated)
            return;
           
		var dt = this.runtime.getDt(this.inst);
        if (dt==0)   // can not move if dt == 0
            return;        
		
        // assign speed
        if (this.is_setup)
        {   
            // at start/stop point
            // trigger callback
            this.is_my_call = true; 
            this.runtime.trigger(cr.behaviors.Rex_Swing.prototype.cnds.OnHitStartEnd, this.inst); 

            var is_start = (this.current_angle == this.swing["start"]);
            var tirg = (is_start)? cr.behaviors.Rex_Swing.prototype.cnds.OnHitStart:
                                   cr.behaviors.Rex_Swing.prototype.cnds.OnHitEnd;
            this.runtime.trigger(tirg, this.inst);                       
            this.is_my_call = false;
            
            // workaround for setting activated=0 in trigger at event sheet
            if (!this.activated)
                return;

            this.is_setup = false;
            
            // assign new target
            this.current_target = (is_start)? this.swing["end"]:this.swing["start"];
            this.remain_angle = this.swing["a"];
            this.current_speed = (this.rotate["acc"] == 0)?
                                 this.rotate["max"]:
                                 (this.rotate["acc"] * dt);                 
        }
        else
        {
            var is_slow_down = false;
            if (this.rotate["dec"] != 0)
            {
                // is time to deceleration?                
                var _speed = this.current_speed;
                var _angle = (_speed*_speed)/(2*this.rotate["dec"]); // (v*v)/(2*a)
                is_slow_down = (_angle >= this.remain_angle);
            }
            var acc = (is_slow_down)? (-this.rotate["dec"]):this.rotate["acc"];
            if (acc !=0)
                this.current_speed += (acc * dt);
        }
        if (this.current_speed > this.rotate["max"])
            this.current_speed = this.rotate["max"];        
		
		// Apply movement to the object     
        var angle = this.current_speed * dt;
        this.remain_angle -= angle;
        
        // is hit to target at next tick?
        if ((this.remain_angle <= 0) || (this.current_speed <= 0))
        {
            this.is_setup = true;  // next tick will restart
            this.current_angle = this.current_target;
            this.current_dir = (!this.current_dir);   // new direction
        }
        else
        {
            this.current_angle = this._get_target_angle(this.current_angle,
                                                        this.current_dir, angle);
        }
        
        this.inst.angle = cr.to_clamped_radians(this.current_angle);
		this.inst.set_bbox_changed();
	}; 
    
    behinstProto._get_target_angle = function (start, dir, angle_abs)
	{
        var angle = (dir)? angle_abs:(-angle_abs);        
        return (start+angle);
    }
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
                 "p": this.swing,
                 "v": this.rotate,
                 "is": this.is_setup,
                 "ct": this.current_target,
                 "cd": this.current_dir,
                 "cs": this.current_speed,
                 "ca": this.current_angle,
                 "ra": this.remain_angle};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];
        this.swing = o["p"];
        this.rotat = o["v"];
        this.is_setup = o["is"];
        this.current_target = o["ct"];
        this.current_dir = o["cd"];
        this.current_speed = o["cs"];
        this.current_angle = o["ca"];
        this.remain_angle = o["ra"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnHitStart = function ()
	{
		return (this.is_my_call);
	};
    
	Cnds.prototype.OnHitEnd = function ()
	{
		return (this.is_my_call);
	};  

 	Cnds.prototype.OnHitStartEnd = function ()
	{
		return (this.is_my_call);
	};     
    
	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.current_speed, cmp, s);
	};  
    
	Cnds.prototype.IsClockwise = function ()
	{
		return (this.current_dir);
	};     
    
	Cnds.prototype.IsAntiClockwise = function ()
	{
		return (!this.current_dir);
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
		this.rotate["max"] = s;
        if (this.rotate["acc"] == 0)
            this.current_speed = s;
	};      
    
	Acts.prototype.SetAcceleration = function (a)
	{
		this.rotate["acc"] = a;
	};
	
	Acts.prototype.SetDeceleration = function (a)
	{
		this.rotate["dec"] = a;
	};
    
	Acts.prototype.SetStartAngle = function (a)
	{
		this.swing["start"] = a;
        this.swing["end"] = this._get_target_angle(a,this.swing["dir"],this.swing["a"]); 
        
        this.is_setup = true;
        this.current_angle = a;
        this.current_dir = this.swing["dir"];
	};
    
	Acts.prototype.SetRotateTO = function (_angle)
	{
        var dir = (_angle >= 0);
        var angle = (dir)? _angle:(-_angle);
        this.swing["a"] = angle; 
		this.swing["dir"] = dir;
        this.swing["end"] = this.swing["start"] + _angle; 
        
        this.is_setup = true;
        this.current_dir = dir;
        this.current_angle = this.swing["start"];
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.current_speed);
	};
    
	Exps.prototype.Direction = function (ret)
	{
		ret.set_int(this.current_dir);
	};  

	Exps.prototype.MaxSpeed = function (ret)
	{
		ret.set_float(this.rotate["max"]);
	}; 

	Exps.prototype.Acc = function (ret)
	{
		ret.set_float(this.rotate["acc"]);
	};  

 	Exps.prototype.Dec = function (ret)
	{
		ret.set_float(this.rotate["dec"]);
	}; 

 	Exps.prototype.Start = function (ret)
	{
		ret.set_float(this.swing["start"]);
	};  

 	Exps.prototype.Angle = function (ret)
	{
        var angle = this.swing["a"];
        if (!this.swing["dir"])
            angle = -angle;
		ret.set_float(angle);
	};  
    
    
}());