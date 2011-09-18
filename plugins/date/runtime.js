// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.MyDate = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.MyDate.prototype;
		
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
	    this.timers = {};
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	acts.StartTimer = function (name)
	{
	    var timer = new Date();
		var cur_time = timer.getTime();
		this.timers[name] = cur_time;
	};	

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.Year = function (ret)
	{	
	    var today = new Date();
		ret.set_int(today.getFullYear());
	};
	
	exps.Month = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getMonth()+1);
	};
	
	exps.Date = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getDate());
	};	
	
	exps.Day = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getDay());
	};	
	
	exps.Hours = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getHours());
	};	

	exps.Minutes = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getMinutes());
	};	
	
	exps.Seconds = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getSeconds());
	};	

	exps.Milliseconds = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getMilliseconds());
	};	
	
	exps.Ticks = function (ret, name)
	{
	    debugger;
	    var delta = 0;
		var start_tick = this.timer[name] || 0;
		if (start_tick) {
		    var timer = new Date();
		    delta = timer.getTime() - start_tick;
		}
		ret.set_int(delta);
	};		
}());