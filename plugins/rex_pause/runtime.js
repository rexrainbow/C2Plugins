// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Pause = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Pause.prototype;
		
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
        this.is_pause = false;
        this.previous_timescale = 0;
	};
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;    

	cnds.OnPause = function ()
	{
		return true;
	};

	cnds.OnResume = function ()
	{
		return true;
	};   

	cnds.IsPause = function ()
	{
		return this.is_pause;
	};
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

    acts.TooglePause = function ()
	{
        var trig_method;
        if (!this.is_pause)  // run -> pause
        {
            this.previous_timescale = this.runtime.timescale;
            this.runtime.timescale = 0;
            trig_method = cr.plugins_.Rex_Pause.prototype.cnds.OnPause;
        }
        else  // pause -> run
        {
            this.runtime.timescale = this.previous_timescale;
            trig_method = cr.plugins_.Rex_Pause.prototype.cnds.OnResume;
        }
        this.is_pause = (!this.is_pause);
        this.runtime.trigger(trig_method, this);        
	}; 
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

    exps.Timescale = function (ret)
	{
	    ret.set_float( this.previous_timescale );
	};
    
}());