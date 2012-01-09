// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_ToggleSwitch = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_ToggleSwitch.prototype;
		
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
        this.value = (this.properties[0]==1);
        this.is_my_call = false;
	};

	behinstProto.tick = function ()
	{   
	}; 
    
	behinstProto._toogle_value = function (value)
	{
        var cur_value = this.value;
        if (value == cur_value)
            return;
        this.value = (!cur_value);
        var trig_method = (this.value)?
                          cr.behaviors.Rex_ToggleSwitch.prototype.cnds.OnTurnOn:
                          cr.behaviors.Rex_ToggleSwitch.prototype.cnds.OnTurnOff;
        this.is_my_call = true;
        this.runtime.trigger(trig_method, this.inst);   
        this.is_my_call = false;
	};           

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnTurnOn = function ()
	{
		return (this.is_my_call);
	};

	cnds.OnTurnOff = function ()
	{
		return (this.is_my_call);
	};    

	cnds.IsTurnOn = function ()
	{
		return (this.value);
	};       
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.ToogleValue = function ()
	{
		this._toogle_value();
	};  

	acts.SetValue = function (s)
	{
		this._toogle_value(s);
	};
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.Value = function (ret)
	{        
		ret.set_int((this.value)? 1:0);
	};  
}());