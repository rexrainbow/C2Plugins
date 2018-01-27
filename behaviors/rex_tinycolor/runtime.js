// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_tinyColor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_tinyColor.prototype;
		
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
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{ 
		this.cleanOutput();		
		this.color = window["tinycolor"](this.properties[0]);
	};

	behinstProto.tick = function ()
	{
	};  
	
	behinstProto.cleanOutput = function ()
	{
		this.rgbOut = null;
		this.hslOut = null;
	}; 

	behinstProto.saveToJSON = function ()
	{
		return { "hex": this.color["toHex"]()
	           };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.cleanOutput();	
		this.color = window["tinycolor"](o["hex"]);
	};	
	 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

    Acts.prototype.SetColorByString = function (color)
	{
		this.cleanOutput();		
		this.color = window["tinycolor"](color);
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.RGB = function (ret, key)
	{
		var val;
		if (key == null)
		{
			val = this.color["toRgbString"]()
		}
		else
		{
			if (this.rgbOut == null)
			{
				this.rgbOut = this.color["toRgb"]();
			}
			val = this.rgbOut[key.toLowerCase()] || 0;
		}
		ret.set_any(val);
	}; 	

	Exps.prototype.Hex = function (ret)
	{
		ret.set_string(this.color["toHex"]());
	}; 	

	Exps.prototype.HSL = function (ret, key)
	{
		var val;
		if (key == null)
		{
			val = this.color["toHslString"]()
		}
		else
		{
			if (this.rgbOut == null)
			{
				this.rgbOut = this.color["toHsl"]();
			}
			val = this.rgbOut[key.toLowerCase()] || 0;
		}
		ret.set_any(val);
	}; 
	
	Exps.prototype.HSV = function (ret, key)
	{
		var val;
		if (key == null)
		{
			val = this.color["toHsvString"]()
		}
		else
		{
			if (this.rgbOut == null)
			{
				this.rgbOut = this.color["toHsv"]();
			}
			val = this.rgbOut[key.toLowerCase()] || 0;
		}
		ret.set_any(val);
	};	

}());