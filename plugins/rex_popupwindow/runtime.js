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
cr.plugins_.Rex_PopupWindow.inst = null;
cr.plugins_.Rex_PopupWindow.parent_inst = null;

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
        this.children = {};
        this.callback = null;
        this._param = {};
        
        cr.plugins_.Rex_PopupWindow.inst = this;
	};
    
    instanceProto.run_callback = function(exe_mode, cmd, params)
	{
        debugger;
        if (params != null)
            this.callback.AddParams(params);
        if (exe_mode == 0)
            this.callback.ExecuteCommands(cmd);
        else
            this.callback.CallFn(cmd);
	};  

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.PopupWindow = function (name, url, width, height, top_margin, left_margin,
                                 has_toolbar, has_menubar, has_scrollbar, 
                                 can_resizable, show_location, show_status)
	{
        var properties_string;
        properties_string  = "height="+height+", width="+width+", top="+top_margin+", left="+left_margin;     
        properties_string += ", toolbar="+has_toolbar+", menubar="+has_menubar+", scrollbar="+has_scrollbar; 
        properties_string += ", resizable="+can_resizable+", location="+show_location+", status="+show_status; 
        var panel = window.open(url, name, properties_string);
        if (panel.window.Rex_PopupWindow_inst != null)
            panel.cr.plugins_.Rex_PopupWindow.parent_inst = this;
        this.children[name] = panel;
	};    
    
    Acts.prototype.Setup = function (fn_objs)
	{
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Popup window should connect to a function object");
	};      
    
    Acts.prototype.SeParameter = function (index, value)
	{
        this.param[index] = value;
	};    
    
	Acts.prototype.CleanParameters = function ()
	{
        this.param = {};
	};      
    
	Acts.prototype.SendCmd2Child = function (name, cmd_string)
	{
        var child_inst = this.children[name].cr.plugins_.Rex_PopupWindow.inst;
        if (child_inst == null)
            return;
            
        child_inst.run_callback(0, cmd_string);
	};  

	Acts.prototype.SendCmd2Parent = function (cmd_string)
	{       
        if (opener==null)
            return;          
        var parent_inst = opener.cr.plugins_.Rex_PopupWindow.parent_inst;
        if (parent_inst == null)
            return;
            
        parent_inst.run_callback(0, cmd_string);
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());