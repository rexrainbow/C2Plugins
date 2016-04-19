// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SimulateInput = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SimulateInput.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	};
    
	instanceProto.onDestroy = function ()
	{
	};   

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    var KEYBOARD_EVENTTYPE = ["keydown", "keyup", "keypress"];
    Acts.prototype.SimulateKeyboard = function (code, event_type)
	{
        var e = jQuery["Event"]( KEYBOARD_EVENTTYPE[event_type], { "keyCode": code, "which": code } )
        //var e = jQuery["Event"]( KEYBOARD_EVENTTYPE[event_type]);
        //e["keyCode"] = code;
        //e["which"] = code;
        jQuery(document)["trigger"]( e );               
	}; 

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());