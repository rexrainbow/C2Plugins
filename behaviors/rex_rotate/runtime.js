// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Rotate = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Rotate.prototype;
		
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
        this.activated = this.properties[0];
        this.direction = this.properties[1];
		this.speed = this.properties[2];
		this.acc = this.properties[3];         
	};

	behinstProto.tick = function ()
	{
        if (this.activated == 0) {
            return;
        }
                
		var dt = this.runtime.getDt(this.inst);
		
		// Apply acceleration
		this.speed += (this.acc * dt);	
		
		// Apply movement to the object
		if (this.speed != 0)
		{
            var angle = this.speed * dt;  // in degree        
            if ( this.direction == 0)
               angle = -angle;
            this.inst.angle += cr.to_clamped_radians(angle);
		
			this.inst.set_bbox_changed();
		}        
	}; 

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.speed, cmp, s);
	};
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  

	acts.SetDirection = function (s)
	{
		this.direction = s;
	};      
    
	acts.SetSpeed = function (s)
	{
		this.speed = s;
	};
	
	acts.SetAcceleration = function (a)
	{
		this.acc = a;
	};
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.Speed = function (ret)
	{
		ret.set_float(this.speed);
	};
	
	exps.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
}());