// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Function = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Function.prototype;
		
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
        this.param = {};
        this.ret = {};
        this.is_echo = false;
		this.JSFnObjs = {};
	};
    
	instanceProto.CallFn = function(name, args)
	{
        if (args)
            jQuery.extend(this.param, args);
        
        this.is_echo = false;
        
        // call JS function first
        var is_break = this._CallJS(name);
        if (!is_break)
        {
            // then call trigger function
            this._CallFn(name);
        }
        
        if ((!this.is_echo) && this.is_debug_mode) 
        {
            alert ("Can not find function '" + name + "'");
        }
	}; 
    
	instanceProto.CreateJS = function(name, code_string)
	{
        if (this.is_debug_mode && this.JSFnObjs[name] != null) 
            alert ("JS function '" + name + "' has existed.");  
            
        this.JSFnObjs[name] = eval("("+code_string+")");
	};
    
	instanceProto._CallFn = function(name)
	{
        this.function_name = name; 
	    this.runtime.trigger(cr.plugins_.Rex_Function.prototype.cnds.OnFunctionCalled, this);
	}; 

 	instanceProto._CallJS = function(name)
	{
        var is_break = false;
	    var fn_obj = this.JSFnObjs[name];
        if (fn_obj != null) 
        {
            this.is_echo = true;
            is_break = fn_obj(this);
        }
        return is_break;
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
        this.CallFn(name);
	}; 
    
	acts.CleanParameters = function ()
	{
        this.param = {};
	};    
    
	acts.SetParameter = function (index, value)
	{
        this.param[index] = value;
	};  

	acts.CleanRetruns = function ()
	{
        this.ret = {};
	};    
    
	acts.SetReturn = function (index, value)
	{
        this.ret[index] = value;
	};

	acts.CreateJSFunctionObject = function (name, code_string)
	{
        this.CreateJS(name, code_string);
	};

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Param = function (ret, index)
	{
        var value = this.param[index];
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
        var value = this.ret[index];
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

    exps.Eval = function (ret, code_string)
	{
	    ret.set_any( eval( "("+code_string+")" ) );
	};	
}());