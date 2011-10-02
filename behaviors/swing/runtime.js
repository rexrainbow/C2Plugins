// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Swing = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Swing.prototype;
		
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
        
        this.activated = this.properties[0];
        this.swing = {start:start,
                      dir:dir,
                      angle:angle,
                      end:end};
        this.rotate = {max:this.properties[3],
                       acc:this.properties[4],
                       dec:this.properties[5]};
        this.is_setup = true;
        this.current_target = 0;
        this.current_dir = dir;
        this.current_speed = 0;
        this.current_angle = start;
        this.ramain_angle = 0;        
	};

	behinstProto.tick = function ()
	{
        if (this.activated == 0) {
            return;
        }
           
		var dt = this.runtime.getDt(this.inst);
		
        // assign speed
        if (this.is_setup)
        {   
            // at start/stop point
            // trigger callback
            this.runtime.trigger(cr.behaviors.Swing.prototype.cnds.OnHitStartEnd, this.inst); 

            var is_start = (this.current_angle == this.swing.start);
            if (is_start)
            {
                this.runtime.trigger(cr.behaviors.Swing.prototype.cnds.OnHitStart, this.inst);
            }
            else
            {
                this.runtime.trigger(cr.behaviors.Swing.prototype.cnds.OnHitEnd, this.inst);    
            }
            
            // workaround for setting activated=0 in trigger at event sheet
            if (this.activated == 0) {
                return;
            }   

            this.is_setup = false;
            
            // assign new target
            this.current_target = (is_start)? this.swing.end:this.swing.start;
            this.ramain_angle = this.swing.angle;
            this.current_speed = (this.rotate.acc == 0)?
                                 this.rotate.max:
                                 (this.rotate.acc * dt);                 
        }
        else
        {
            var is_slow_down = false;
            if (this.rotate.dec != 0)
            {
                // is time to deceleration?                
                var _speed = this.current_speed;
                var _angle = (_speed*_speed)/(2*this.rotate.dec); // (v*v)/(2*a)
                is_slow_down = (_angle >= this.ramain_angle);
            }
            var acc = (is_slow_down)? (-this.rotate.dec):this.rotate.acc
            this.current_speed += (acc * dt);
        }
        if (this.current_speed > this.rotate.max)
            this.current_speed = this.rotate.max;        
		
		// Apply movement to the object     
        var angle = this.current_speed * dt;
        this.ramain_angle -= angle;
        
        // no change, leave (maybe an error!)
        if ((angle==0) && (this.ramain_angle>0))
            return;
            
        // is hit to target at next tick?
        if (this.ramain_angle <= 0)
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

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnHitStart = function ()
	{
		return true;
	};
    
	cnds.OnHitEnd = function ()
	{
		return true;
	};  

 	cnds.OnHitStartEnd = function ()
	{
		return true;
	};     
    
	cnds.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.current_speed, cmp, s);
	};  
    
	cnds.IsClockwise = function ()
	{
		return (this.current_dir);
	};     
    
	cnds.IsAntiClockwise = function ()
	{
		return (!this.current_dir);
	};     
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  

	acts.SetMaxSpeed = function (s)
	{
		this.rotate.max = s;
        if (this.rotate.acc == 0)
            this.current_speed = s;
	};      
    
	acts.SetAcceleration = function (a)
	{
		this.rotate.acc = a;
	};
	
	acts.SetDeceleration = function (a)
	{
		this.rotate.dec = a;
	};
    
	acts.SetStartAngle = function (a)
	{
		this.swing.start = a;
        this.swing.end = this._get_target_angle(a,this.swing.dir,this.swing.angle); 
        
        this.is_setup = true;
        this.current_angle = a;
        this.current_dir = this.swing.dir;
	};
    
	acts.SetRotateTO = function (_angle)
	{
        var dir = (_angle >= 0);
        var angle = (dir)? _angle:(-_angle);
        this.swing.angle = angle; 
		this.swing.dir = dir;
        this.swing.end = this.swing.start + _angle; 
        
        this.is_setup = true;
        this.current_dir = dir;
        this.current_angle = this.swing.start;
	};    
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.Activated = function (ret)
	{
		ret.set_float(this.activated);
	};    
    
	exps.Speed = function (ret)
	{
		ret.set_float(this.current_speed);
	};
    
	exps.Direction = function (ret)
	{
		ret.set_int(this.current_dir);
	};  

	exps.MaxSpeed = function (ret)
	{
		ret.set_float(this.rotate.max);
	}; 

	exps.Acc = function (ret)
	{
		ret.set_float(this.rotate.acc);
	};  

 	exps.Dec = function (ret)
	{
		ret.set_float(this.rotate.dec);
	}; 

 	exps.Start = function (ret)
	{
		ret.set_float(this.swing.start);
	};  

 	exps.Angle = function (ret)
	{
        var angle = this.swing.angle;
        if (!this.swing.dir)
            angle = -angle;
		ret.set_float(angle);
	};  
    
    
}());