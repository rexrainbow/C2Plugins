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

	var TARGET_INSTANCE = 0;
	var TARGET_LAYER = 1;
	var TARGET_LAYOUT = 2;
	behinstProto.onCreate = function()
	{        
	    this.effect_name = this.properties[0];
	    this.effect_param_index = this.properties[1];
	    this.tween_target = this.properties[2];
	    this.tween_behavior_inst = this.get_tween_behavior_inst(); 
	    	    
	    switch(this.tween_target)
	    {
        case TARGET_INSTANCE: 
            this.set_param_fn = this.type.plug_proto.prototype.acts.SetEffectParam;
        break;
        case TARGET_LAYER: 
            this.set_param_fn = cr.system_object.prototype.acts.SetLayerEffectParam;
        break;     
        case TARGET_LAYOUT: 
            this.set_param_fn = cr.system_object.prototype.acts.SetLayoutEffectParam;
        break;            
	    } 
	};
	
	var TWEEN_INVALID = 0;
	var TWEEN_LITETWEEN = 1;
	var TWEEN_TWEEN = 2;
	var TWEEN_TWEENMOD = 3;
	behinstProto.tick = function ()
	{
	    if (this.tween_behavior_inst == null)
	        return;
        if ((this.tween_target == TARGET_INSTANCE) && (this.type.plug_proto == null))
            return;
	    if (!this.tween_behavior_inst.active)
	        return;

        switch (this.tween_target)
        {
        case TARGET_INSTANCE: 
	        this.set_param_fn.call(
	            this.inst,                         // this_
	            this.effect_name,                  // name
	            this.effect_param_index,           // param index
	            this.tween_behavior_inst.value     // value
	        );
        break;
        case TARGET_LAYER: 
	        this.set_param_fn.call(
	            this.runtime.system,               // this_
	            this.inst.layer,                   // layer
	            this.effect_name,                  // name
	            this.effect_param_index,           // param index
	            this.tween_behavior_inst.value     // value
	        );
        break;
        case TARGET_LAYOUT: 
	        this.set_param_fn.call(
	            this.runtime.system,               // this_
	            this.effect_name,                  // name
	            this.effect_param_index,           // param index
	            this.tween_behavior_inst.value     // value
	        );
        break;        
        }
        
        
	  
	};  

	behinstProto.get_tween_behavior_inst = function ()
    {
        var has_lunarray_LiteTween_behavior = (cr.behaviors.lunarray_LiteTween != null);
        var has_lunarray_Tween_behavior = (cr.behaviors.lunarray_Tween != null);
        var has_rex_lunarray_Tween_mod_behavior = (cr.behaviors.rex_lunarray_Tween_mod != null);        
        var has_tween_behavior = (has_lunarray_LiteTween_behavior || 
                                  has_lunarray_Tween_behavior || 
                                  has_rex_lunarray_Tween_mod_behavior);
        assert2(has_tween_behavior, "[Tween2Effect] Could not find tween behavior");
        var i = this.type.objtype.getBehaviorIndexByName(this.type.name);  
        var tween_behavior_inst = this.inst.behavior_insts[i-1];
        assert2(tween_behavior_inst, "Could not find tween behavior above tween2effect "+  this.type.name + " behavior");
        var is_lunarray_LiteTween_behavior = has_lunarray_LiteTween_behavior && 
                                             (tween_behavior_inst instanceof cr.behaviors.lunarray_LiteTween.prototype.Instance);
        var is_lunarray_Tween_behavior = has_lunarray_Tween_behavior && 
                                         (tween_behavior_inst instanceof cr.behaviors.lunarray_Tween.prototype.Instance);                                                
        var is_rex_lunarray_Tween_behavior = has_rex_lunarray_Tween_mod_behavior && 
                                             (tween_behavior_inst instanceof cr.behaviors.rex_lunarray_Tween_mod.prototype.Instance);                                             
        this.tween_behavior_type = (is_lunarray_LiteTween_behavior)? TWEEN_LITETWEEN:
                                   (is_lunarray_Tween_behavior)?     TWEEN_TWEEN:
                                   (is_rex_lunarray_Tween_behavior)? TWEEN_TWEENMOD:  
                                                                     TWEEN_INVALID;                              
        assert2(this.tween_behavior_type, "Could not find tween behavior above tween2effect "+  this.type.name + " behavior");                                
        if (this.tween_behavior_type == TWEEN_INVALID)
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