// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_monosynth = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_monosynth.prototype;
		
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

    var PREFIX_MAP = ["", "fm" ,"am", "fat"];    
    var OSC_MAP = ["sine", "square", "triangle", "custom", "pwm", "pulse"];
    var FILTER_MAP = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
    var ROLLOFF_MAP = [-12, -24, -48];
	instanceProto.onCreate = function()
	{
        this.synth = new window["Tone"]["MonoSynth"]();
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

	Acts.prototype.TriggerAttackRelease = function (note, duration, time, velocity)
	{
        this.synth["triggerAttackRelease"](note, duration, time, velocity);      
	};  
    
	Acts.prototype.TriggerAttack = function (note, time, velocity)
	{
        this.synth["triggerAttack"](note, time, velocity);      
	};   
    
	Acts.prototype.TriggerRelease = function (time)
	{
        this.synth["triggerRelease"](time);      
	};   
    
	Acts.prototype.SetNote = function (time)
	{
        this.synth["setNote"](time);      
	};   
    
	Acts.prototype.SetPortamento = function (portamento)
	{
        this.synth["portamento"] = portamento;  
	};    
    
	Acts.prototype.SetOscillatorType = function (prefix, type)
	{
        var oscillator = this.synth["oscillator"];
        oscillator["type"] = PREFIX_MAP[prefix] + OSC_MAP[type];       
	};   
    
	Acts.prototype.SetPartials = function (partials)
	{
        try
        {
            partials = JSON.parse(partials);
        }
        catch(e)
        {
            return;
        }
        
        var oscillator = this.synth["oscillator"];
        oscillator["partials"] = partials;
	};     
    
	Acts.prototype.SetWidth = function (width)
	{
        var oscillator = this.synth["oscillator"];
        oscillator["width"] = width;    
	};     
        
	Acts.prototype.SetEnvelope = function (a, d, s, r)
	{
        var envelope = this.synth["envelope"];
        envelope["attack"] = a;
        envelope["decay"] = d;    
        envelope["sustain"] = s;
        envelope["release"] = r;            
	};
        
	Acts.prototype.SetFilterEnvelope = function (a, d, s, r, baseFrequency, octaves, exponent)
	{
        var envelope = this.synth["filterEnvelope"];
        envelope["attack"] = a;
        envelope["decay"] = d;    
        envelope["sustain"] = s;
        envelope["release"] = r;      
        envelope["baseFrequency"] = baseFrequency;    
        envelope["octaves"] = octaves;
        envelope["exponent"] = exponent;     
        
	};    
        
	Acts.prototype.SetFilter = function (type, Q, gain)
	{
        var filter = this.synth["filter"];
        filter["type"] = FILTER_MAP[ type ];
        filter["Q"] = Q;    
        filter["gain"] = gain;
        
	};        
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());