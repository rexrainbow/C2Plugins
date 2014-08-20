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
        this.enable = (this.properties[0]==1);
        this.direction = this.properties[1];
		this.speed = this.properties[2];
		this.acc = this.properties[3];         
	};

	behinstProto.tick = function ()
	{
        if (!this.enable) 
            return;
                
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
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.enable,
                 "d": this.direction,
				 "s": this.speed,
				 "a": this.acc};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.enable = o["en"];
		this.direction = o["d"];
		this.speed = o["s"];
		this.acc = o["a"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.CompareSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.speed, cmp, s);
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.enable = (s==1);
	};  

	Acts.prototype.SetDirection = function (d)
	{
		this.direction = d;
	};      
    
	Acts.prototype.SetSpeed = function (s)
	{
		this.speed = s;
	};
	
	Acts.prototype.SetAcceleration = function (a)
	{
		this.acc = a;
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this.speed);
	};
	
	Exps.prototype.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.enable)? 1:0);
	};    
}());