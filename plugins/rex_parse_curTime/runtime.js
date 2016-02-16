// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Parse_CurTime = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Parse_CurTime.prototype;
		
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
	    this.exp_LastCurTimestamp = 0;
	};
	  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnGetCurrentTimeCompleted = function ()
	{
	    return true;
	}; 	

	Cnds.prototype.OnGetCurrentTimeError = function ()
	{
	    return true;
	}; 
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
 
    Acts.prototype.GetCurrentTime = function ()
	{
	    var self=this;
	    var on_success = function (timestamp)
	    {
	        self.exp_LastCurTimestamp = timestamp;
	        self.runtime.trigger(cr.plugins_.Rex_Parse_CurTime.prototype.cnds.OnGetCurrentTimeCompleted, self);  
	    };
	    
	    var on_error = function ()
	    {
            self.runtime.trigger(cr.plugins_.Rex_Parse_CurTime.prototype.cnds.OnGetCurrentTimeError, self);          
	    };
	    var handler = {"success":on_success, "error":on_error};
	    window["Parse"]["Cloud"]["run"]("C2RexGetCurrentTime", null, handler);
	};
    	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastTimestamp = function (ret)
	{
		ret.set_float(this.exp_LastCurTimestamp);
	};
}());