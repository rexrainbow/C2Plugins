// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.MyFunction = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.MyFunction.prototype;
		
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
        this._function_name = "";
        this._parameters = {};
        this._returns = {};
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnFunctionCalled = function (name)
	{
		return (this._function_name == name);
	};	    

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
	acts.CallFunction = function (name)
	{
        this._function_name = name; 
	    this.runtime.trigger(cr.plugins_.MyFunction.prototype.cnds.OnFunctionCalled, this);
	}; 
    
	acts.CleanParameters = function ()
	{
        this._parameters = {};
	};    
    
	acts.SetParameter = function (index, value)
	{
        this._parameters[index] = value;
	};  

	acts.CleanRetruns = function ()
	{
        this._returns = {};
	};    
    
	acts.SetReturn = function (index, value)
	{
        this._returns[index] = value;
	};      
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Param = function (ret, index)
	{
	    ret.set_any(this._parameters[index]);
	};
    
    exps.Ret = function (ret, index)
	{
	    ret.set_any(this._returns[index]);
	};    
}());