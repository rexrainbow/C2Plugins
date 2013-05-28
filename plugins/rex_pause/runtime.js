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
    
	instanceProto.onDestroy = function ()
	{
        this._toogle_pause(false);
	};   
    
	instanceProto._toogle_pause = function (state)
	{
        var cur_state = this.is_pause;
        if (state == cur_state)
            return;
    
        this.is_pause = (!cur_state);
        var trig_method;
        if (this.is_pause)
        {
            this.previous_timescale = this.runtime.timescale;
            this.runtime.timescale = 0;
            trig_method = cr.plugins_.Rex_Pause.prototype.cnds.OnPause;
        }
        else
        {
            this.runtime.timescale = this.previous_timescale;
            this.previous_timescale = 0;
            trig_method = cr.plugins_.Rex_Pause.prototype.cnds.OnResume;
        }
        this.runtime.trigger(trig_method, this);   
	};       
	
	instanceProto.saveToJSON = function ()
	{
		return { "p": this.is_pause,
                 "ts": this.previous_timescale };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
		this.is_pause = o["p"];
		this.previous_timescale = o["ts"];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	Cnds.prototype.OnPause = function ()
	{
		return true;
	};

	Cnds.prototype.OnResume = function ()
	{
		return true;
	};   

	Cnds.prototype.IsPause = function ()
	{
		return this.is_pause;
	};
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

    Acts.prototype.TooglePause = function ()
	{
        this._toogle_pause();       
	}; 

    Acts.prototype.SetState = function (state)
	{
        var is_pause = (state == 0);
        this._toogle_pause(is_pause);       
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.PreTimescale = function (ret)
	{
	    ret.set_float( this.previous_timescale );
	};
    
}());