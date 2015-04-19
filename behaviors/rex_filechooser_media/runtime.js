// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_filechooser_media = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_filechooser_media.prototype;
		
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
	    this.setflg = true;	
	};
	
	var acceptOptions = ["image/*", "audio/*", "video/*"];
	var captureOptions = ["camera", "microphone", "camcorder"];
	behinstProto.tick = function ()
	{
	    if ((!this.setflg) || (!this.inst.elem))
	        return;	    
	        
	    var elem = this.inst.elem;
	    elem["accept"] = acceptOptions[this.properties[0]];
	    elem["capture"] = captureOptions[this.properties[0]];

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