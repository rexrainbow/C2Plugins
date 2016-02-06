// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_textbox_date = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_textbox_date.prototype;
		
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

    var elemTypes = ["date", "datetime", "datetime-local", "month", "week", "time"];
    var isIE = (navigator.userAgent.indexOf("MSIE 9") > -1);
                     
	behinstProto.onCreate = function()
	{    
	    this.new_type = this.properties[0];	    
	    this.setflg = true;	
	};
	
	behinstProto.tick = function ()
	{
	    if ((!this.setflg) || (!this.inst.elem) || isIE)
	        return;	    
	    this.inst.elem.type = elemTypes[this.new_type];	
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

	Exps.prototype.Year = function (ret)
	{
	    if (this.runtime.isDomFree)
	    {
	        ret.set_int(0);
	    }
        var value = this.inst.elem.value;
	    var year = parseInt(value.split("-")[0]);
		ret.set_int(year);
	};
	Exps.prototype.Month = function (ret)
	{
	    if (this.runtime.isDomFree)
	    {
	        ret.set_int(0);
	    }
        var value = this.inst.elem.value;
	    var month = parseInt(value.split("-")[1]);
		ret.set_int(month);
	};	
	Exps.prototype.Date = function (ret)
	{
	    if (this.runtime.isDomFree)
	    {
	        ret.set_int(0);
	    }
        var value = this.inst.elem.value;
	    var date = parseInt(value.split("-")[2]);
		ret.set_int(date);
	};	
}());