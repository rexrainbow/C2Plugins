// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_CollisionSwitch = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_CollisionSwitch.prototype;
		
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
		this.inst.collisionsEnabled = (this.properties[0] !== 0);
	};

	behinstProto.tick = function ()
	{   
	}; 

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsCollisionEnabled = function ()
	{
		return this.collisionsEnabled;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetCollisions = function (set_)
	{
        var inst = this.inst;
		if (inst.collisionsEnabled === (set_ !== 0))
			return;		// no change
		
		inst.collisionsEnabled = (set_ !== 0);
		
		if (inst.collisionsEnabled)
			inst.set_bbox_changed();		// needs to be added back to cells
		else
		{
			// remove from any current cells and restore to uninitialised state
			if (inst.collcells.right >= inst.collcells.left)
				inst.type.collision_grid.update(inst, inst.collcells, null);
			
			inst.collcells.set(0, 0, -1, -1);
		}
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
 
}());