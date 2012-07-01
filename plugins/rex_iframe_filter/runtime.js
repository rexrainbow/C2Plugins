// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_IframeFilter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_IframeFilter.prototype;
		
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
	    this.is_busting_all = (this.properties[0]==1);
        this.white_list = [];
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
    
	Cnds.prototype.Check = function ()
	{
        var is_at_top = (window.top == window);
	    if (this.is_busting_all)
		    return is_at_top;
			
        if (is_at_top)
            return true;
            
        var ref = document.referrer;
		if (ref == "")    // not in iframe
		    return true;
	    
		var list = this.white_list;
		var list_len = list.length;
		var i;
		for (i=0;i<list_len;i++)
		{
		    if (ref.indexOf(list[i])!=-1)			
			    return true;			
		}
		return false;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.Append = function (url)
	{
	    this.white_list.push(url);
	}; 
    
	Acts.prototype.SetJSON = function (JSON_string)
	{
	    this.white_list = JSON.parse(JSON_string);
	}; 	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());