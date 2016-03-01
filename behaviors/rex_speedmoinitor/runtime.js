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
	    this.dt = 0; 
		
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
	    var dx = inst.x - this.pre_x;
	    var dy = inst.y - this.pre_y;
	    this.pre_x = inst.x;
	    this.pre_y = inst.y;
		
		if ( ((dx != 0) || (dy !=0)) && (this.dt != 0))
		{
		    this._speed = Math.sqrt((dx*dx)+(dy*dy)) / this.dt;
			this._angle  = cr.to_degrees(Math.atan2(dy, dx));
		    this._last_speed = this._speed;
		    this._last_angle = this._angle;
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
	
	behinstProto.saveToJSON = function ()
	{
		return { "px": this.pre_x,
                 "py": this.pre_y, 
		         "lx": this._last_speed,
		         "la": this._last_angle,
				 "im": this._is_moving
				 };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.pre_x = o["px"];
		this.pre_y = o["py"];	
		this._last_speed = o["lx"];
		this._last_angle = o["la"];	
        this._is_moving = o["im"];	
	};		
    
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{	  
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "Speed", "value": this._speed},
			               {"name": "Angle", "value": this._angle},
                           {"name": "Last speed", "value": this._last_speed},
			               {"name": "Last angle", "value": this._last_angle}
                           ]
		});
	};
	/**END-PREVIEWONLY**/    
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
	
	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(this._speed, cmp, s);
	};
	
	Cnds.prototype.CompareAngle = function (cmp, s)
	{
		return cr.do_cmp(this._angle, cmp, s);
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