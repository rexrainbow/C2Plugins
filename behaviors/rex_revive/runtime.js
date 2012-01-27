// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Revive = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Revive.prototype;
		
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
        this.timeline = null;        
	};

	behtypeProto._revive_hanlder = function(layer_name, x, y, angle, width, height)
	{
        var inst = this.runtime.createInstance(this.objtype, 
                                               this.runtime.getLayerByNumber(layer_name),
                                               x, y);
        inst.angle = angle;
        inst.width = width;
        inst.height = height;
        this.runtime.trigger(cr.behaviors.Rex_Revive.prototype.cnds.OnRevive, inst); 
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
        this.revive_time = this.properties[0];
	};

	behinstProto.onDestroy = function()
	{
        var inst = this.inst;
        var args = [inst.layer.index, inst.x, inst.y, inst.angle, inst.width, inst.height];
        var timer = this.type.timeline.CreateTimer(this.type, this.type._revive_hanlder, args);
        timer.Start(this.revive_time);
        this.runtime.trigger(cr.behaviors.Rex_Revive.prototype.cnds.OnDestroy, this.inst);   
	};
	
	behinstProto.tick = function ()
	{
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnDestroy = function ()
	{
		return true;
	};

	cnds.OnRevive = function ()
	{
		return true;
	};
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

    acts.Setup = function (timeline_objs)
	{
        var timeline = timeline_objs.instances[0];
        if (timeline.check_name == "TIMELINE")
            this.type.timeline = timeline;        
        else
            alert ("Revive behavior should connect to a timeline object");
	}; 
    
	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  
	
	acts.SetReviveTime = function (t)
	{
        this.revive_time = t;
	};

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	
}());