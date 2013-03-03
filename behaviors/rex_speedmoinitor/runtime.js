// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_SpeedMoinitor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_SpeedMoinitor.prototype;
		
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
	    this.pre_x = this.inst.x;
	    this.pre_y = this.inst.y;
	    this.dt = 0	    
	    this.dx = 0;
	    this.dy = 0;
		
		this._speed = 0;
		this._angle = 0;
	    this._is_moving = false;
		this._last_speed = 0;
		this._last_angle = 0;		
	};

	behinstProto.tick = function ()
	{
	    this.dt = this.runtime.getDt(this.inst);
	};  

	behinstProto.tick2 = function ()
	{
	    var inst = this.inst;	    
	    this.dx = inst.x - this.pre_x;
	    this.dy = inst.y - this.pre_y;
	    this.pre_x = inst.x;
	    this.pre_y = inst.y;
		
		if ( ((this.dx != 0) || (this.dy !=0)) && (this.dt != 0))
		{
		    this._last_speed = this.speed_get();
		    this._last_angle = this.angle_get();
		}
		else
		{
		    this._speed = 0;
		    this._angle = 0;	
		}
						
		if ((!this._is_moving) && (this._speed != 0))
		{
		    this._is_moving = true;
		    this.runtime.trigger(cr.behaviors.Rex_SpeedMoinitor.prototype.cnds.OnMovingStart, this.inst); 
		}
		else if ((this._is_moving) && (this._speed == 0))
		{
		    this._is_moving = false;
		    this.runtime.trigger(cr.behaviors.Rex_SpeedMoinitor.prototype.cnds.OnMovingStop, this.inst); 
		}
	};  
	

	behinstProto.speed_get = function ()
	{
	    this._speed  = Math.sqrt((this.dx*this.dx)+(this.dy*this.dy)) / this.dt;
		return this._speed;
	};
	
	behinstProto.angle_get = function ()
	{
	    this._angle  = cr.to_degrees(Math.atan2(this.dy,this.dx));
		return this._angle;
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this._is_moving);
	};
	
    Cnds.prototype.OnMovingStart = function ()
	{
		return true;
	};
	
    Cnds.prototype.OnMovingStop = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this._speed);
	};
	
	Exps.prototype.Angle = function (ret)
	{
		ret.set_float(this._angle);
	};
	
	Exps.prototype.LastSpeed = function (ret)
	{
		ret.set_float(this._last_speed);
	};
	
	Exps.prototype.LastAngle = function (ret)
	{
		ret.set_float(this._last_angle);
	};	
	
}());