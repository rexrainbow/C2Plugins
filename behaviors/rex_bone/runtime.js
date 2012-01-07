// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_Bone = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_Bone.prototype;
		
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
        this.is_lock_angle = (this.properties[1]==1);
        
		this.pinObject = null;
		this.pinAngle = 0;
		this.pinDist = 0;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;
		
		// Need to know if pinned object gets destroyed
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
		// Pinned object being destroyed
		if (this.pinObject == inst)
			this.pinObject = null;
	};
	
	behinstProto.onDestroy = function()
	{
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.tick = function ()
	{
		// do work in tick2 instead, after events to get latest object position
	};

	behinstProto.tick2 = function ()
	{
		if ((!this.pinObject) || (!this.activated))
			return;
			
		// Instance angle has changed by events/something else
		if (this.lastKnownAngle !== this.inst.angle)
			this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));

        var mirror = (this.pinObject.width < 0);
        var flip = (this.pinObject.height < 0);
        var pin_obj_angle_x = (!mirror)? 
                              this.pinObject.angle : (Math.PI - this.pinObject.angle);
        var pin_obj_angle_y = (!flip)? 
                              this.pinObject.angle : (2*Math.PI - this.pinObject.angle);
        //var pinAngle_x = (!mirror)?  
        //                 this.pinAngle : (Math.PI - this.pinAngle); 
        //var pinAngle_y = (!flip)? 
        //                this.pinAngle : (2*Math.PI - this.pinAngle);
		var newx = this.pinObject.x + Math.cos(pin_obj_angle_x + this.pinAngle) * this.pinDist;
		var newy = this.pinObject.y + Math.sin(pin_obj_angle_y + this.pinAngle) * this.pinDist;
		var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		this.lastKnownAngle = newangle;
		
		if (this.inst.x !== newx || this.inst.y !== newy || this.inst.angle !== newangle)
		{
			this.inst.x = newx;
			this.inst.y = newy;
			if (this.is_lock_angle)
                this.inst.angle = newangle;
			this.inst.set_bbox_changed();
		}
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.IsPinned = function ()
	{
		return !!this.pinObject;
	};

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.Pin = function (obj)
	{
		if (!obj)
			return;
			
		var otherinst = obj.getFirstPicked();
		
		if (!otherinst)
			return;
			
		this.pinObject = otherinst;
		this.pinAngle = cr.angleTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y) - otherinst.angle;
		this.pinDist = cr.distanceTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y);
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;
	};
	
	acts.Unpin = function ()
	{
		this.pinObject = null;
	};
	
	acts.SetActivated = function (s)
	{
		this.activated = (s==1);
	};
	
	acts.SetEnableLockAngle = function (e)
	{
		this.is_lock_angle = (e==1);
	};    
	
	acts.ForcePin = function ()
	{
        var activated_save = this.activated;
        this.activated = true;
		this.tick2();
        this.activated = activated_save;
	};      
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	
}());