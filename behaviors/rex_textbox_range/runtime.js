// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_textbox_range = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_textbox_range.prototype;
		
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
	    this.max = this.properties[0];
	    this.min = this.properties[1];
	    this.step = this.properties[2];	
	    this.setflg = true;	
	};
	
	behinstProto.tick = function ()
	{
	    if ((!this.setflg) || (!this.inst.elem) || isIE)
	        return;	 
	    var elem = this.inst.elem;   
	    elem.type = "range";
	    elem.max = this.max;
	    elem.min = this.min;
	    elem.step = this.step;
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

}());