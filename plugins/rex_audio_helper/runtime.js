// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_audio_helper = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_audio_helper.prototype;
		
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
        this.audio = null;
	};
    
    instanceProto._audio_get = function ()
    {
        if (this.audio != null)
            return this.audio;

        assert2(cr.plugins_.Audio, "Audio Helper: Can not find Audio oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.Audio.prototype.Instance)
            {
                this.audio = inst;
                return this.audio;
            }
        }
        assert2(this.audio, "Audio Helper: Can not find Audio oject.");
        return null; 
    };

    instanceProto.SetVolume = function (tag, vol)
	{
       var audio = this._audio_get();
       vol = linearToDb(vol);
       
       cr.plugins_.Audio.prototype.acts.SetVolume.call(audio, tag, vol);
	};
    
    instanceProto.Stop = function (tag)
	{     
       var audio = this._audio_get();    
       cr.plugins_.Audio.prototype.acts.Play.Stop(audio, tag);
	};  
	function dbToLinear(x)
	{
		var v = dbToLinear_nocap(x);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		return v;
	};
	
	function linearToDb(x)
	{
		if (x < 0)
			x = 0;
		if (x > 1)
			x = 1;
		return linearToDb_nocap(x);
	};
	
	function dbToLinear_nocap(x)
	{
		return Math.pow(10, x / 20);
	};
	
	function linearToDb_nocap(x)
	{
		return (Math.log(x) / Math.log(10)) * 20;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();      
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Play = function (file, looping, vol, tag, fadeIn_time)
	{     
       var audio = this._audio_get();
       vol = linearToDb(vol);
       
       cr.plugins_.Audio.prototype.acts.Play.call(audio, file, looping, vol, tag);
       
       if (fadeIn_time > 0)
       {
       }
	};
    
    Acts.prototype.Stop = function (tag, fadeOut_time)
	{     
       this.Stop(tag);
       
       if (fadeOut_time > 0)
       {
       }
	};    
    
	Acts.prototype.SetVolume = function (tag, vol)
	{
       this.SetVolume(tag, vol);
	};
    
    Acts.prototype.Preload = function (file_name)
	{     
       var audio = this._audio_get();
       cr.plugins_.Audio.prototype.acts.Preload.call(audio, file_name);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());