// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_PopupWindow = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_PopupWindow.prototype;
		
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
        this.child = null;
        this.callback = null;
        this._param = {};
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.PopupWindow = function (url, name, width, height, top_margin, left_margin,
                                 has_toolbar, has_menubar, has_scrollbar, 
                                 can_resizable, show_location, show_status)
	{
        var properties_string;
        properties_string  = "height="+height+", width="+width+", top="+top_margin+", left="+left_margin;     
        properties_string += ", toolbar="+has_toolbar+", menubar="+has_menubar+", scrollbar="+has_scrollbar; 
        properties_string += ", resizable="+can_resizable+", location="+show_location+", status="+show_status; 
        this.child = window.open(url, name, properties_string);
	};    
    
    acts.Setup = function (fn_objs)
	{
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Popup window should connect to a function object");
	};      
    
    acts.SeParameter = function (index, value)
	{
        this.param[index] = value;
	};    
    
	acts.CleanParameters = function ()
	{
        this.param = {};
	};      
    
	acts.ExecuteCommands = function (cmd_string)
	{
	};  

	acts.CallFunction = function (cmd_string)
	{ 
	}; 
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

}());