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
        this.behavior_index = null;        
	};

	behtypeProto._revive_hanlder = function(custom_data,
                                            layer_name, x, y, 
                                            angle, width, height, opacity, visible, cur_frame,
                                            inst_vars, cur_anim_name)
	{
        var inst = this.runtime.createInstance(this.objtype, 
                                               this.runtime.getLayerByNumber(layer_name),
                                               x, y);
        if (angle != null)
        {
            inst.angle = angle;
            inst.width = width;
            inst.height = height;
            inst.opacity = opacity;
            inst.visible = visible;
            inst.cur_frame = cur_frame;  
            inst.instance_vars = inst_vars.slice();
            inst.changeAnimName = cur_anim_name;
            inst.doChangeAnim();            
        }
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);            
        var behavior_inst = inst.behavior_insts[this.behavior_index];
        behavior_inst._mem = jQuery.extend({}, custom_data);
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
        this.activated = (this.properties[0]==1);
        this.revive_time = this.properties[1];
        this._revive_at = this.properties[2];
        this._revive_args = [];
        if (this._revive_at==0)
        {
            var inst = this.inst;
            this._revive_args = [inst.layer.index, inst.x, inst.y];
        }
        this._mem = {};
	};

	behinstProto.onDestroy = function()
	{
        if (!this.activated)
            return;
            
        this.runtime.trigger(cr.behaviors.Rex_Revive.prototype.cnds.OnDestroy, this.inst);             
        var inst = this.inst;
        var args;
        var custom_data = jQuery.extend({}, this._mem);
        if (this._revive_at == 1)
        {
            args = [custom_data, 
                    inst.layer.index, inst.x, inst.y, 
                    inst.angle, inst.width, inst.height, inst.opacity, inst.visible, inst.cur_frame, 
                    inst.instance_vars.slice(), inst.cur_animation.name];
        }
        else
        {
            args = [custom_data];
            args.push.apply(args, this._revive_args.slice());
        }
        var timer = this.type.timeline.CreateTimer(this.type, this.type._revive_hanlder, args);
        timer.Start(this.revive_time);  
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
        
	acts.SetMemory = function (index, value)
	{
        this._mem[index] = value;
	};    

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

    exps.Mem = function (ret, index)
	{
        var value = this._mem[index];
        if (value == null) 
            value = 0;
	    ret.set_any(value);
	};
}());