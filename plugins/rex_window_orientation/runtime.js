// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_WindowOrientation = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_WindowOrientation.prototype;
		
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
	    this.pre_is_landspcape = is_landspcape();
	    this.runtime.tickMe(this);
	};
	
    instanceProto.tick = function()
    {
        var cur_is_landspcape = is_landspcape();
        if (this.pre_is_landspcape == cur_is_landspcape)
            return;
        
        this.runtime.trigger(cr.plugins_.Rex_WindowOrientation.prototype.cnds.OnChanged, this);
        if (cur_is_landspcape)
            this.runtime.trigger(cr.plugins_.Rex_WindowOrientation.prototype.cnds.OnLandspcape, this);
        else
            this.runtime.trigger(cr.plugins_.Rex_WindowOrientation.prototype.cnds.OnPortrait, this);
        this.pre_is_landspcape = cur_is_landspcape;
    };
    
    var is_landspcape = function()
    {
        var ret;
        var _orientation = window["orientation"];
        if (_orientation != null)
            ret = (Math.abs(_orientation) == 90);
        else        
            ret = (window["innerHeight"] > window["innerWidth"]);
        return ret;
    };

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnChanged = function()
	{
        return true;
	};
	Cnds.prototype.OnLandspcape = function()
	{
        return true;
	};	
	Cnds.prototype.OnPortrait = function()
	{
        return true;
	};     
	Cnds.prototype.IsLandspcape = function()
	{
	    return is_landspcape();   
	};
	Cnds.prototype.IsPortrait = function()
	{
	    return (!is_landspcape());
	}; 	

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
    
	Exps.prototype.Orientation = function (ret)
	{
	    var _orientation = window["orientation"];
	    if (_orientation == null)
	        _orientation = 0;
		ret.set_int(_orientation);
	};
	Exps.prototype.IsLandspcape = function (ret)
	{
		ret.set_int(is_landspcape()? 1:0);
	};    
}());