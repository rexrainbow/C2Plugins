// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_maxmin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_maxmin.prototype;
		
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
	    this.is_my_call = false;
	    
	    this.value = null;
	    this.max = this.properties[1];	 
	    this.min = this.properties[2];
	    this.set_value( this.properties[0], true );
	    this.pre_value = this.value;
	};
	
	behinstProto.tick = function ()
	{	   
	};
	
	behinstProto.set_value = function (v, no_checking)
	{
	    this.pre_value = this.value;
	    this.value = cr.clamp(v, this.min, this.max);
	    
	    if (no_checking)
	        return;
	        
	    if (this.pre_value != this.value)
	    {
	        this.is_my_call = true;
	        this.runtime.trigger(cr.behaviors.Rex_maxmin.prototype.cnds.OnValueChanging, this.inst);
	        this.is_my_call = false;
	    }
	};
			
	behinstProto.saveToJSON = function ()
	{
		return {"v":this.value,
		        "max": this.max,
		        "min": this.min,
		};
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.value = o["v"];
	    this.max = o["max"];
	    this.min = o["min"];	    
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	
    Cnds.prototype.OnValueChanging = function ()
	{
		return this.is_my_call;
	};

	Cnds.prototype.CompareValue = function (cmp, s)
	{
		return cr.do_cmp(this.value, cmp, s);
	};
	
    Cnds.prototype.IsValueChanged = function ()
	{
		return (this.pre_value != this.value);
	};	

	Cnds.prototype.CompareDeltaValue = function (cmp, s)
	{
	    var delta = this.value - this.pre_value;
		return cr.do_cmp(delta, cmp, s);
	};	

	Cnds.prototype.CompareBound = function (bound_type, cmp, s)
	{
	    var value = (bound_type == 1)? this.max : this.min;
		return cr.do_cmp(value, cmp, s);
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetValue = function (v)
	{
        this.set_value( v );
	};
	
    Acts.prototype.SetMax = function (v)
	{
	    this.max = v;
        this.value = this.set_value( this.value );
	};	
	
    Acts.prototype.SetMin = function (v)
	{
	    this.min = v;
        this.set_value( this.value );
	};
	
    Acts.prototype.AddTo = function (v)
	{
        this.set_value( this.value + v );
	};	
	
    Acts.prototype.SubtractFrom = function (v)
	{
        this.set_value( this.value - v );
	};		
		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

 	Exps.prototype.Value = function (ret)
	{
		ret.set_float(this.value);
	}; 	
	
 	Exps.prototype.Max = function (ret)
	{
		ret.set_float(this.max);
	};	
	
 	Exps.prototype.Min = function (ret)
	{
		ret.set_float(this.min);
	};
	
 	Exps.prototype.Percentage = function (ret)
	{	   
		ret.set_float( (this.value - this.min)/(this.max - this.min) );
	};	

 	Exps.prototype.PreValue = function (ret)
	{
		ret.set_float(this.pre_value);
	}; 	
}());