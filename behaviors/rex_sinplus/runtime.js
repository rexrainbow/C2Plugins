// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_SinEx = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_SinEx.prototype;
		
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
		
		this.i = 0;		// period offset (radians)
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.active = (this.properties[0] === 1);
		this.movement = this.properties[1]; // 0=Horizontal|1=Vertical|2=Size|3=Width|4=Height|5=Angle"
		this.period = this.properties[2];
		this.period += Math.random() * this.properties[3];								// period random
		this.i = (this.properties[4] / this.period) * 2 * Math.PI;						// period offset
		this.i += ((Math.random() * this.properties[5]) / this.period) * 2 * Math.PI;	// period offset random
		this.mag = this.properties[6];													// magnitude
		this.mag += Math.random() * this.properties[7];									// magnitude random
		
		if (this.period === 0)
			this.period = 0.01;
			
		this.initialValue = 0;
		this.ratio = 0;
		        
        this.inst_x_save = this.inst.x;
        this.inst_y_save = this.inst.y;   
        this.inst_width_save = this.inst.width; 
        this.inst_height_save = this.inst.height; 
        this.inst_angle_save = this.inst.angle;                  
        this.mag_save = this.mag;
		this._initialValue_set();
		
		this.lastKnownValue = this.initialValue;               
	};
    
	behinstProto._initialValue_set = function ()
	{
        this.inst.x = this.inst_x_save;
        this.inst.y = this.inst_y_save;   
        this.inst.width = this.inst_width_save; 
        this.inst.height = this.inst_height_save; 
        this.inst.angle = this.inst_angle_save;
        this.mag = this.mag_save;
        
		switch (this.movement) {
		case 0:		// horizontal
			this.initialValue = this.inst_x_save;
			break;
		case 1:		// vertical
			this.initialValue = this.inst_y_save;
			break;
		case 2:		// size
			this.initialValue = this.inst_width_save;
			this.ratio = this.inst_height_save / this.inst_width_save;
			break;
		case 3:		// width
			this.initialValue = this.inst_width_save;
			break;
		case 4:		// height
			this.initialValue = this.inst_height_save;
			break;
		case 5:		// angle
			this.initialValue = this.inst_angle_save;
			this.mag = cr.to_radians(this.mag);		// convert magnitude from degrees to radians
			break;
		default:
			assert2(false, "Invalid sin movement type");
		}  
    };        
    
	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		if (!this.active || dt === 0)
			return;
		
		this.i += (dt / this.period) * 2 * Math.PI;
		this.i = this.i % (2 * Math.PI);
		
		switch (this.movement) {
		case 0:		// horizontal
			if (this.inst.x !== this.lastKnownValue)
				this.initialValue += this.inst.x - this.lastKnownValue;
				
			this.inst.x = this.initialValue + Math.sin(this.i) * this.mag;
			this.lastKnownValue = this.inst.x;
			break;
		case 1:		// vertical
			if (this.inst.y !== this.lastKnownValue)
				this.initialValue += this.inst.y - this.lastKnownValue;
				
			this.inst.y = this.initialValue + Math.sin(this.i) * this.mag;
			this.lastKnownValue = this.inst.y;
			break;
		case 2:		// size
			this.inst.width = this.initialValue + Math.sin(this.i) * this.mag;
			this.inst.height = this.inst.width * this.ratio;
			break;
		case 3:		// width
			this.inst.width = this.initialValue + Math.sin(this.i) * this.mag;
			break;
		case 4:		// height
			this.inst.height = this.initialValue + Math.sin(this.i) * this.mag;
			break;
		case 5:		// angle
			if (this.inst.angle !== this.lastKnownValue)
				this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));
				
			this.inst.angle = cr.clamp_angle(this.initialValue + Math.sin(this.i) * this.mag);
			this.lastKnownValue = this.inst.angle;
			break;
		}
		
		this.inst.set_bbox_changed();
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
	
	cnds.IsActive = function ()
	{
		return this.active;
	};

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
	
	acts.SetActive = function (a)
	{
		this.active = (a === 1);
	};
	
	acts.SetPeriod = function (x)
	{
		this.period = x;
	};
	
	acts.SetMagnitude = function (x)
	{
		this.mag = x;
		
		if (this.movement === 5)	// angle
			this.mag = cr.to_radians(this.mag);
	};
	
	acts.SetMovement = function (mode)
	{
		this.movement = mode;
        this._initialValue_set();
	};
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.CyclePosition = function (ret)
	{
		ret.set_float(this.i / (2 * Math.PI));
	};
	
	exps.Period = function (ret)
	{
		ret.set_float(this.period);
	};
	
	exps.Magnitude = function (ret)
	{
		if (this.movement === 5)	// angle
			ret.set_float(cr.to_degrees(this.mag));
		else
			ret.set_float(this.mag);
	};
	
}());