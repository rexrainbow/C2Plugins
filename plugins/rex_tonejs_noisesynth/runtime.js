// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_noisesynth = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_noisesynth.prototype;
		
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

    var NOISE_MAP = ["white", "brown", "pink"];
	instanceProto.onCreate = function()
	{
        this.synth = new window["Tone"]["NoiseSynth"]();
	};
    
	instanceProto.onDestroy = function ()
	{
        this.synth["dispose"]();
        this.synth = null;
	};   
    
    var parseTime = function (timeString)
    {
        if (isNaN(timeString))
            return timeString;
        else
            return parseFloat(timeString);
    };
        
    // export
	instanceProto.GetObject = function ()
	{
        return this.synth;
	};     
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.TriggerAttackRelease = function (duration, time, velocity)
	{        
        this.synth["triggerAttackRelease"](duration, time, velocity);         
	};  
    
	Acts.prototype.TriggerAttack = function (time, velocity)
	{
        this.synth["triggerAttack"](time, velocity);      
	};   
    
	Acts.prototype.TriggerRelease = function (time)
	{
        this.synth["triggerRelease"](time);      
	};      
    
	Acts.prototype.SetNoiseType = function (type)
	{
        var noise = this.synth["noise"];
        noise["type"] = NOISE_MAP[type];       
	};   
    
	Acts.prototype.SetEnvelope = function (a, d, s, r)
	{
        var envelope = this.synth["envelope"];
        envelope["attack"] = a;
        envelope["decay"] = d;    
        envelope["sustain"] = s;
        envelope["release"] = r;            
	};   

    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());