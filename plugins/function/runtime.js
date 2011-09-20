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
        this.is_debug_mode = this.properties[0];    
        
        this.function_name = "";
        this.parameters = {};
        this.returns = {};
        this.is_echo = false;
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnFunctionCalled = function (name)
	{
        var is_my_call = (this.function_name == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	};	    

	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
	acts.CallFunction = function (name)
	{
        this.function_name = name; 
        this.is_echo = false
	    this.runtime.trigger(cr.plugins_.MyFunction.prototype.cnds.OnFunctionCalled, this);
        if ((!this.is_echo) && this.is_debug_mode) 
        {
            alert ("Can not find function '" + name + "'");
        }
	}; 
    
	acts.CleanParameters = function ()
	{
        this.parameters = {};
	};    
    
	acts.SetParameter = function (index, value)
	{
        this.parameters[index] = value;
	};  

	acts.CleanRetruns = function ()
	{
        this.returns = {};
	};    
    
	acts.SetReturn = function (index, value)
	{
        this.returns[index] = value;
	};      
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Param = function (ret, index)
	{
        var value = this.parameters[index];
        if (value == null) 
        {
            value = 0;
            if (this.is_debug_mode) 
            {
                alert ("Can not find parameter '" + index + "'");
            }
        }
	    ret.set_any(value);
	};
    
    exps.Ret = function (ret, index)
	{
        var value = this.returns[index];
        if (value == null) 
        {
            value = 0;
            if (this.is_debug_mode) 
            {
                alert ("Can not find return value '" + index + "'");
            }
        }
	    ret.set_any(value);
	};    
}());