// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_textbox_color = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_textbox_color.prototype;
		
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

    var isIE = (navigator.userAgent.indexOf("MSIE 9") > -1);
                     
	behinstProto.onCreate = function()
	{     
	    this.setflg = true;	
	};
	
	behinstProto.tick = function ()
	{
	    if ((!this.setflg) || (!this.inst.elem) || isIE)
	        return;	    
	    this.inst.elem.type = "color";	
	    this.setflg = false;
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
        
	Exps.prototype.R = function (ret)
	{
        var val;
        if (!this.inst.elem)
            val = 0;
        else 
        {
            var rgb_string = this.inst.elem.value;
            if (rgb_string.charAt(0) == "#")
            {
                var rgb = parseInt(rgb_string.substring(1), 16);
                val = (rgb >> 16) & 0xFF;
            }
            else
                val = 0;
        }
		ret.set_int(val);
	};    
    
	Exps.prototype.G = function (ret)
	{
        var val;
        if (!this.inst.elem)
            val = 0;
        else 
        {
            var rgb_string = this.inst.elem.value;
            if (rgb_string.charAt(0) == "#")
            {
                var rgb = parseInt(rgb_string.substring(1), 16);
                val = (rgb >> 8) & 0xFF;
            }
            else
                val = 0;
        }
		ret.set_int(val);
	}; 
    
	Exps.prototype.B = function (ret)
	{
        var val;
        if (!this.inst.elem)
            val = 0;
        else 
        {
            var rgb_string = this.inst.elem.value;
            if (rgb_string.charAt(0) == "#")
            {
                var rgb = parseInt(rgb_string.substring(1), 16);
                val = rgb & 0xFF;
            }
            else
                val = 0;
        }
		ret.set_int(val);
	};    
}());