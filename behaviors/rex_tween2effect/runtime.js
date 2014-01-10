// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Tween2Effect = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Tween2Effect.prototype;
		
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
	    this.plug_proto = (cr.plugins_.Sprite)?   cr.plugins_.Sprite:
	                      (cr.plugins_.c2canvas)? cr.plugins_.c2canvas:
	                                              null;	    
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
	    this.effect_name = this.properties[0];
	    this.effect_param_index = this.properties[1];
	    this.tween_behavior_inst = this.get_tween_behavior_inst();  
	};

	behinstProto.tick = function ()
	{
	    if (this.tween_behavior_inst == null)
	        return;
        if (this.type.plug_proto == null)
            return;
	    if (!this.tween_behavior_inst.active)
	        return;

	    this.type.plug_proto.prototype.acts.SetEffectParam.call(
	        this.inst, 
	        this.effect_name,                  // name
	        this.effect_param_index,           // param index
	        this.tween_behavior_inst.value     // value
	    );	  
	};  
	
	behinstProto.get_tween_behavior_inst = function ()
    {
        if (cr.behaviors.lunarray_Tween == null)
            return null;
        var i = this.type.objtype.getBehaviorIndexByName(this.type.name);  
        var tween_behavior_inst = this.inst.behavior_insts[i-1];
        assert2(tween_behavior_inst, "Could not find tween behavior above tween2effect "+  this.type.name + " behavior");
        if (!(tween_behavior_inst instanceof cr.behaviors.lunarray_Tween.prototype.Instance))
            return null;
        return tween_behavior_inst;
    };		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
}());