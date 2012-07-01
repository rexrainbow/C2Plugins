// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Date = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Date.prototype;
		
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
	    this._timers = {};
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	Acts.prototype.StartTimer = function (name)
	{
	    var timer = new Date();
		this._timers[name] = timer.getTime();
	};	

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.Year = function (ret)
	{	
	    var today = new Date();
		ret.set_int(today.getFullYear());
	};
	
	Exps.prototype.Month = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getMonth()+1);
	};
	
	Exps.prototype.Date = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getDate());
	};	
	
	Exps.prototype.Day = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getDay());
	};	
	
	Exps.prototype.Hours = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getHours());
	};	

	Exps.prototype.Minutes = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getMinutes());
	};	
	
	Exps.prototype.Seconds = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getSeconds());
	};	

	Exps.prototype.Milliseconds = function (ret)
	{
	    var today = new Date();	
		ret.set_int(today.getMilliseconds());
	};	
	
	Exps.prototype.Timer = function (ret, name)
	{
	    var delta = 0;
		var start_tick = this._timers[name];
		if (start_tick != null) {
		    var timer = new Date();
		    delta = timer.getTime() - start_tick;
		}
		ret.set_int(delta);
	};	

	Exps.prototype.CurTicks = function (ret)
	{
	    var today = new Date();
        ret.set_int(today.getTime());
	};	

	Exps.prototype.UnixTimestamp = function (ret)
	{
	    var today = new Date();
        ret.set_float(today.getTime());
	};		
}());