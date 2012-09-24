// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_text_properties = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_text_properties.prototype;
		
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
	};  
	
	behinstProto.tick = function ()
	{
	};
 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetHorizontalAlignment = function(align)
	{
        this.inst.halign = align;   // 0=left, 1=center, 2=right
	};

	Acts.prototype.SetVerticalAlignment = function(align)
	{
        this.inst.valign = align;   // 0=top, 1=center, 2=bottom
	};	

	Acts.prototype.SetWrapping = function(wrap_mode)
	{
        this.inst.wrapbyword = (wrap_mode === 0);;   // 0=word, 1=character
	};

	Acts.prototype.SetLineHeight = function(line_height_offset)
	{
        this.inst.line_height_offset = line_height_offset;
	};	
	
	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());