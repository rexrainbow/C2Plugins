function GetPluginSettings()
{
	return {
		"name":			"Synth",
		"id":			"Rex_ToneJS_synth",
		"version":		"0.1",        
		"description":	"Composed simply of an OmniOscillator routed through an AmplitudeEnvelope.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_synth.html",
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
AddStringParam("Options", "Options in JSON string.", '"{}"');
AddAction(1, 0, "Create", "Creator", 
          "Create with options <i>{0}</i>", 
          "Create instrument.", "CreateInstrument");   
          
AddAnyTypeParam("Portamento", 'The glide time between notes', 0);
AddAction(11, 0, "Set portamento", "Configuration", 
          "Set portamento to <i>{0}</i>", 
          "Set portamento.", "SetPortamento");
          
AddNumberParam("Detune", 'The glide time between notes', 0);
AddAction(12, 0, "Set detune", "Configuration", 
          "Set detune to <i>{0}</i>", 
          "Set detune.", "SetDetune");          
              
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262).', '"C4"');
AddAnyTypeParam("Duration ", 'How long the note should be held for before triggering the release. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"8n"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(21, 0, "Attack then release", "Trigger", 
          "Attack then release note: <i>{0}</i>, duration: <i>{1}</i>, at time <i>{2}</i> with velocity <i>{3}</i>", 
          "Trigger the attack and then the release after the duration.", "TriggerAttackRelease ");   
          
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262).', '"C4"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(22, 0, "Attack", "Trigger", 
          "Attack note: <i>{0}</i>, at time <i>{1}</i> with velocity <i>{2}</i>", 
          "Trigger the attack of the note optionally with a given velocity.", "TriggerAttack"); 
          
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddAction(23, 0, "Release", "Trigger", 
          "Release, at time <i>{0}</i>", 
          "Trigger the release portion of the envelope.", "TriggerRelease");
          
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262).', '"C4"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddAction(24, 0, "Set note", "Trigger", 
          "Set note: <i>{0}</i>, at time <i>{1}</i>", 
          "Set the note at the given time.", "SetNote"); 

// Oscillator       
AddComboParamOption("");
AddComboParamOption("am");
AddComboParamOption("Left to right");
AddComboParamOption("fat");
AddComboParam("Prefix", "Prefix of type.", 0);
AddComboParamOption("sine");
AddComboParamOption("square");
AddComboParamOption("triangle");
AddComboParamOption("custom");
AddComboParamOption("pwm");
AddComboParamOption("pulse");
AddComboParam("Type", "Scan direction.", 2);
AddAction(101, 0, "Set type", "Oscillator", 
          "Set oscillator type to <i>{0}</i><i>{1}</i>", 
          "Set oscillator type.", "SetOscillatorType");

AddStringParam("Partials", 'Partials in an array.', '"[2,1,2,2]"');
AddAction(102, 0, "Set partials", "Oscillator - custom", 
          "Set partials to <i>{0}</i>", 
          'Set partials, only if the oscillator is set to "custom".', "SetPartials");
          
AddNumberParam("Width", 'The width of the oscillator.', 0);
AddAction(103, 0, "Set width", "Oscillator - pulse", 
          "Set width to <i>{0}</i>", 
          'Set width, only if the oscillator is set to "pulse".', "SetWidth");          
          
// Envelope
AddNumberParam("Attack", "When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value.", 0.005);
AddNumberParam("Decay", "After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value.", 0.1);
AddNumberParam("Sustain", "The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked.", 0.3);
AddNumberParam("Release", "After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time.", 1);          
AddAction(111, 0, "Set envelope", "Envelope", 
          "Set envelope: attack to <i>{0}</i>, decay to <i>{1}</i>, sustain to <i>{2}</i>, release to <i>{3}</i>", 
          "Set envelope.", "SetEnvelope");          
          
          
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
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
