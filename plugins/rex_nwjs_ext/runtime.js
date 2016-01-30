// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_NWjsExt = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var isNWjs = false;
	var child_process = null;
	    
	var pluginProto = cr.plugins_.Rex_NWjsExt.prototype;
		
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

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		isNWjs = this.runtime.isNWjs;
		var self = this;
		
		if (isNWjs)
		{
			child_process = require("child_process");
		}
		
		this.curTag = "";
	};
    
	instanceProto.onDestroy = function ()
	{
	};   
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnProcessTerminate = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.RunFile = function (tag_, path_)
	{
		if (!isNWjs)
			return;
		
		var self = this;
		var on_terminate = function ()
		{
		    self.curTag = tag_;
		    self.runtime.trigger(cr.plugins_.Rex_NWjsExt.prototype.cnds.OnProcessTerminate, self);
		};
		child_process["exec"](path_, on_terminate);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());