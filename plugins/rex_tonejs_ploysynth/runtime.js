// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_ploysynth = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_ploysynth.prototype;
		
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
    
    var VoiceTypes = ["Synth","MonoSynth","FMSynth","AMSynth","DuoSynth"];
	instanceProto.onCreate = function()
	{
        var voiceType = window["Tone"][VoiceTypes[this.properties[1]]];
        this.synth = new window["Tone"]["PolySynth"](this.properties[0], voiceType);
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

    var getNote = function(note)
    {
        if (note.indexOf("[") !== -1)
            return note;
        
        return JSON.parse(note);
    }
	Acts.prototype.TriggerAttackRelease = function (note, duration, time, velocity)
	{        
        this.synth["triggerAttackRelease"](getNote(note), duration, time, velocity);         
	};  
    
	Acts.prototype.TriggerAttack = function (note, time, velocity)
	{
        this.synth["triggerAttack"](getNote(note), time, velocity);      
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
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());