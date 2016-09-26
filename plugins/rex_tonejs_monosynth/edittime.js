function GetPluginSettings()
{
	return {
		"name":			"Monosynth",
		"id":			"Rex_ToneJS_monosynth",
		"version":		"0.1",        
		"description":	"Composed of one oscillator, one filter, and two envelopes.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_monosynth.html",
		"category":		"Rex - Audio - Tone - Instrument",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions          
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262).', '"C4"');
AddAnyTypeParam("Duration ", 'How long the note should be held for before triggering the release. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"8n"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(1, 0, "Attack then release", "Trigger", 
          "Attack then release note: <i>{0}</i>, duration: <i>{1}</i>, at time <i>{2}</i> with velocity <i>{3}</i>", 
          "Trigger the attack and then the release after the duration.", "TriggerAttackRelease ");   
          
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262).', '"C4"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(2, 0, "Attack", "Trigger", 
          "Attack note: <i>{0}</i>, at time <i>{1}</i> with velocity <i>{2}</i>", 
          "Trigger the attack of the note optionally with a given velocity.", "TriggerAttack"); 
          
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddAction(3, 0, "Release", "Trigger", 
          "Release, at time <i>{0}</i>", 
          "Trigger the release portion of the envelope.", "TriggerRelease");                   

AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262).', '"C4"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddAction(4, 0, "Set note", "Trigger", 
          "Set note: <i>{0}</i>, at time <i>{1}</i>", 
          "Set the note at the given time.", "SetNote"); 
                    
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    //new cr.Property(ept_section, "Oscillator", "",	"Oscillator."), 
    //new cr.Property(ept_float, "Detune", 0, "The detune control."),      
    //new cr.Property(ept_float, "Phase", 0, "The phase of the oscillator, in degrees."),      
    //new cr.Property(ept_float, "Volume", 0, "The volume of the output, in decibels."),    
    //new cr.Property(ept_combo, "Prefix", "", "Prefix of type.", "|fm|am|fat"),        
    //new cr.Property(ept_combo, "Oscillator type", "Square", "The type of the oscillator.", "Sine|Square|Triangle|Custom|Pwm|Pulse"),
    //new cr.Property(ept_text, "Partials", "", 'The partials of the waveform. A partial represents the amplitude at a harmonic. The first harmonic is the fundamental frequency, the second is the octave and so on following the harmonic series,  for type = "Pause"'),        
    //new cr.Property(ept_float, "Width", 0, 'The width of the oscillator for type = "Pause".'),
    //
    //new cr.Property(ept_section, "Envelope", "",	"Envelope."),        
	//new cr.Property(ept_float, "Attack", 0.005, "When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value."),
	//new cr.Property(ept_float, "Decay ", 0.1, "After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value."),    
	//new cr.Property(ept_float, "Sustain", 0.9, "The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked."),
	//new cr.Property(ept_float, "Release ", 1, "After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time."),     
    //
    //new cr.Property(ept_section, "Filter envelope", "",	"Filter envelope."),        
	//new cr.Property(ept_float, "Attack", 0.06, "When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value."),
	//new cr.Property(ept_float, "Decay ", 0.2, "After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value."),    
	//new cr.Property(ept_float, "Sustain", 0.5, "The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked."),
	//new cr.Property(ept_float, "Release ", 2, "After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time."),     
    //new cr.Property(ept_float, "Base frequency", 200, "The envelope's mininum output value. This is the value which it starts at."),       
    //new cr.Property(ept_float, "Octaves", 7, "The number of octaves above the baseFrequency that the envelope will scale to."),           
    //new cr.Property(ept_float, "Exponent", 2, "The envelope's exponent value."),    
    //
    //new cr.Property(ept_section, "Filter", "",	"filter."),   
    //new cr.Property(ept_combo, "Filter type", "Lowpass", "The type of the filter.", "Lowpass|Highpass|Bandpass|Lowshelf|Highshelf|Notch|Allpass|Peaking"),    
    //new cr.Property(ept_text, "Frequency ", 350, 'The cutoff frequency of the filter. Number or note octave(C4)'),          
    //new cr.Property(ept_combo, "Rolloff", "-24", "The rolloff of the filter which is the drop in db per octave.", "-12|-24|-48|-96"),         
    //new cr.Property(ept_float, "Q", 6, "The Q or Quality of the filter."),   
    //new cr.Property(ept_float, "Gain", 0, "The gain of the filter."),       
    //
    //new cr.Property(ept_section, "Misc", "",	"Miscellaneous."),     
    //new cr.Property(ept_float, "Volume", 0, "The volume of the output in decibels."),
    //new cr.Property(ept_text, "Portamento", "0", 'The glide time between notes. in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Expressions("3:0 + 2 - (1m / 7)'),
    //new cr.Property(ept_text, "Frequency", "C4", 'The glide time between notes. in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Expressions("3:0 + 2 - (1m / 7)'),        
    //new cr.Property(ept_float, "Detune", 0, "The detune control."),        
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
