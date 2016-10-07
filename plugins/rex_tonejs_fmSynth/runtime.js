// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_ToneJS_fmsynth = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_ToneJS_fmsynth.prototype;
		
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
    var OSCTYPE_MAP = ["sine", "square", "triangle", "custom", "pwm", "pulse"];
    var FLTTYPE_MAP = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
    var ROLLOFF_MAP = [-12, -24, -48];
	instanceProto.onCreate = function()
	{
        this.instrumentType = "";
        this.instrument = null;
	};
    
	instanceProto.onDestroy = function ()
	{
        if (this.instrument == null)
            return;
        
        this.instrument["dispose"]();
        this.instrumentType = "";        
        this.instrument = null;
	};   
    
    
    
    // The comments around these functions ensure they are removed when exporting, since the
    // debugger code is no longer relevant after publishing.
    /**BEGIN-PREVIEWONLY**/

    // slightly modified neet simple function from Pumbaa80
    // http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript#answer-7220510
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); // basic html escaping
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'red';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'blue';
                    } else {
                        cls = 'green';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'Sienna';
                } else if (/null/.test(match)) {
                    cls = 'gray';
                }
                return '<span style="color:' + cls + ';">' + match + '</span>';
            })
            .replace(/\t/g,"&nbsp;&nbsp;") // to keep indentation in html
            .replace(/\n/g,"<br/>");       // to keep line break in html
    }

    instanceProto.getDebuggerValues = function (propsections)
    {
        // Append to propsections any debugger sections you want to appear.
        // Each section is an object with two members: "title" and "properties".
        // "properties" is an array of individual debugger properties to display
        // with their name and value, and some other optional settings.
        var props = (this.instrument)?  JSON.stringify(this.instrument["get"](),null,"\t") : "";

        propsections.push({
            "title": "JSON",
            "properties": [
                {
                    "name":"Type",
                    "value": this.instrumentType,
                    "readonly":true
                },            
                {
                    "name":"Properties",
                    "value": "<span style=\"cursor:text;-webkit-user-select: text;-khtml-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;\">"+syntaxHighlight(props)+"</style>",
                    "html": true,
                    "readonly":true
                }

                // Each property entry can use the following values:
                // "name" (required): name of the property (must be unique within this section)
                // "value" (required): a boolean, number or string for the value
                // "html" (optional, default false): set to true to interpret the name and value
                //                                   as HTML strings rather than simple plain text
                // "readonly" (optional, default false): set to true to disable editing the property
                
                // Example:
                // {"name": "My property", "value": this.myValue}
            ]
        });
    };
    
    instanceProto.onDebugValueEdited = function (header, name, value)
    {
        // Called when a non-readonly property has been edited in the debugger. Usually you only
        // will need 'name' (the property name) and 'value', but you can also use 'header' (the
        // header title for the section) to distinguish properties with the same name.
        // if (name === "My property")
        //  this.myProperty = value;
    };
    /**END-PREVIEWONLY**/  
    
    
    // export
	instanceProto.GetObject = function ()
	{
        assert2(this.instrument, "Mono Synth: missing '"+ this.type.name + "'");                
        return this.instrument;
	};     
    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.CreateInstrument = function (options)
	{
        if (this.instrument !== null)
            this.onDestroy();
        
        var type = "FMSynth";
        this.instrumentType = type;
        this.instrument = new window["Tone"][type](JSON.parse(options));
	};  
    
	Acts.prototype.SetPortamento = function (portamento)
	{
        assert2(this.instrument, "Mono Synth: missing '"+ this.type.name + "'");     
        this.instrument["set"]("portamento", portamento);
	};    
    
    Acts.prototype.SetDetune = function (detune)
	{
        assert2(this.instrument, "Mono Synth: missing '"+ this.type.name + "'");     
        this.instrument["set"]("detune", detune);        
    };     
    
	Acts.prototype.SetHarmonicity = function (harmonicity)
	{
        assert2(this.instrument, "Mono Synth: missing '"+ this.type.name + "'");     
        this.instrument["set"]("harmonicity", harmonicity);
	};     
    
    
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

        
	Acts.prototype.SetOscillatorType = function (prefix, type)
	{
        var oscillator = this.synth["oscillator"];
        oscillator["type"] = PREFIX_MAP[prefix] + OSCTYPE_MAP[type];       
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
    
	Acts.prototype.SetModulationIndex = function (modulationIndex)
	{
        this.synth["modulationIndex"] = modulationIndex;  
	};       
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());