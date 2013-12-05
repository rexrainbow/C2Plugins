// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_anglelock = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_anglelock.prototype;
		
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
	    this.activated = (this.properties[0]==1);
	    this.target_angle = this.inst.angle;
		this.locked_angle = cr.to_clamped_radians(this.properties[1]);
	};
	
	behinstProto.tick = function ()
	{
	    if (!this.activated)
	        return;
	        
	    this.inst.angle = this.target_angle;   // restore angle for other behaviors
	};
	
	behinstProto.tick2 = function ()
	{
	    if (!this.activated)
	        return;
	        	    
	    this.target_angle = this.inst.angle;       // store current angle  
	    if (this.inst.angle != this.locked_angle)
	    {
	        this.inst.angle = this.locked_angle;   // lock angle for display
	        this.inst.set_bbox_changed();
	    }
	};
	
		
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
		         "ta": this.target_angle, 
		         "la": this.locked_angle };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.activated = o["en"];
	    this.target_angle = o["ta"];
		this.locked_angle = o["la"];
	};
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};  
	
	Acts.prototype.SetLockedAngle = function (a)
	{
		this.locked_angle = cr.to_clamped_radians(a);
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());