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
        this.fnObj = new cr.plugins_.Rex_Function.FunctionKlass(this, this.properties[0]);
        this.check_name = "FUNCTION";
	};
    
	instanceProto.CallFn = function(name)
	{
        this.fnObj["CallFn"](name);
	};  

	instanceProto.CreateJS = function(name, code_string)
	{
        this.fnObj["CreateJS"](name, code_string);
	};    

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnFunctionCalled = function (name)
	{
        var is_my_call = (this.fnObj["fn_name"] == name);
        this.fnObj["is_echo"] |= is_my_call;
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
        this.fnObj["param"] = {};
	};    
    
	acts.SetParameter = function (index, value)
	{
        this.fnObj["param"][index] = value;
	};  

	acts.CleanRetruns = function ()
	{
        this.fnObj["ret"] = {};
	};    
    
	acts.SetReturn = function (index, value)
	{
        this.fnObj["ret"][index] = value;
	};

	acts.CreateJSFunctionObject = function (name, code_string)
	{
        this.CreateJS(name, code_string);
	};

	acts.SetResult = function (value)
	{
        this.fnObj["result"] = value;
	};    
    

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Param = function (ret, index)
	{
        var value = this.fnObj["param"][index];
        if (value == null) 
        {
            value = 0;
            if (this.fnObj["is_debug_mode"]) 
            {
                alert ("Can not find parameter '" + index + "'");
            }
        }
	    ret.set_any(value);
	};
    
    exps.Ret = function (ret, index)
	{
        var value = this.fnObj["ret"][index];
        if (value == null) 
        {
            value = 0;
            if (this.fnObj["is_debug_mode"]) 
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

    exps.Result = function (ret)
	{
        var arg_len = arguments.length;
        var i;
        for (i=2; i<arg_len; i++)
        {
            this.fnObj["param"][i-2] = arguments[i];
        }
        this.CallFn(arguments[1] || "");
	    ret.set_any( this.fnObj["result"] );
	};
}());

(function ()
{
    cr.plugins_.Rex_Function.FunctionKlass = function(plugin, is_debug_mode)
    {
        this["plugin"] = plugin;
        this["is_debug_mode"] = is_debug_mode;    
        this["fn_name"] = "";
        this["param"] = {};
        this["ret"] = {};
        this["result"] = 0;
        this["is_echo"] = false;
		this["JSFnObjs"] = {};
    };
    var FunctionKlassProto = cr.plugins_.Rex_Function.FunctionKlass.prototype;
    
	FunctionKlassProto["CallFn"] = function(name, args)
	{    
        if (args)
            jQuery.extend(this["param"], args);
        
        this["is_echo"] = false;
        
        // call JS function first
        var is_break = this["_CallJS"](name);
        if (!is_break)
        {
            // then call trigger function
            this["_CallFn"](name);
        }
        
        if ((!this["is_echo"]) && this["is_debug_mode"]) 
        {
            alert ("Can not find function '" + name + "'");
        }
	};   

	FunctionKlassProto["CreateJS"] = function(name, code_string)
	{
        if (this["is_debug_mode"] && this["JSFnObjs"][name] != null) 
            alert ("JS function '" + name + "' has existed.");  
            
        this["JSFnObjs"][name] = eval("("+code_string+")");
	};
    
	FunctionKlassProto["_CallFn"] = function(name)
	{
        this["fn_name"] = name; 
	    this["plugin"].runtime.trigger(cr.plugins_.Rex_Function.prototype.cnds.OnFunctionCalled, this["plugin"]);
	}; 

 	FunctionKlassProto["_CallJS"] = function(name)
	{
        var is_break = false;
	    var fn_obj = this["JSFnObjs"][name];
        if (fn_obj != null) 
        {
            this["is_echo"] = true;
            is_break = fn_obj(this);
        }
        return is_break;
	};     
    
}());