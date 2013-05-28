// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_OneTickFlag = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_OneTickFlag.prototype;
		
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
        this.has_flag = false;
        this.flags = {};
        this.runtime.tick2Me(this);
	};
	instanceProto.onDestroy = function ()
	{
     	this.runtime.untick2Me(this);
	};
    instanceProto.tick2 = function()
    {         
        if (!this.has_flag)
            return;
        
        var name;
        for (name in this.flags)
            delete this.flags[name];
    }; 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.IsFlagSet = function (name)
	{
		return (this.flags[name] == true);
	};

	Cnds.prototype.IsAnyFlagSet = function ()
	{
		return this.has_flag;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.SetFlag = function (name)
	{
        this.flags[name] = true;
        this.has_flag = true;
	}; 

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Flag = function (ret, name)
	{
	    ret.set_int( (this.flags[name] == true)? 1:0 );
	};
    
}());