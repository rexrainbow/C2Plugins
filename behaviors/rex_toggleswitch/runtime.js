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
        this.value = (this.properties[0]===1);
        this.is_my_call = false;
	};

	behinstProto.tick = function ()
	{   
	}; 
    
	behinstProto.set_value = function (v)
	{	    
        if (v === this.value)
            return;
            
        this.value = v;                
        var trig_method = (this.value)?
                          cr.behaviors.Rex_ToggleSwitch.prototype.cnds.OnTurnOn:
                          cr.behaviors.Rex_ToggleSwitch.prototype.cnds.OnTurnOff;
        this.is_my_call = true;
        this.runtime.trigger(trig_method, this.inst);   
        this.is_my_call = false;
	};           
	
	behinstProto.saveToJSON = function ()
	{
		return { "v": this.value };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.value = o["v"];
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnTurnOn = function ()
	{
		return this.is_my_call;
	};

	Cnds.prototype.OnTurnOff = function ()
	{
		return this.is_my_call;
	};    

	Cnds.prototype.IsTurnOn = function ()
	{
		return this.value;
	};       
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.ToogleValue = function ()
	{
		this.set_value(!this.value);
	};

	Acts.prototype.SetValue = function (s)
	{
		this.set_value((s===1));
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Value = function (ret)
	{        
		ret.set_int(this.value? 1:0);
	};  
}());