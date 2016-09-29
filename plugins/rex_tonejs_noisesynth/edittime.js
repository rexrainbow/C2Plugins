function GetPluginSettings()
{
	return {
		"name":			"Noisesynth",
		"id":			"Rex_ToneJS_noisesynth",
		"version":		"0.1",        
		"description":	"Composed of a noise generator (Tone.Noise), one filter (Tone.Filter), and two envelopes (Tone.Envelop). One envelope controls the amplitude of the noise and the other is controls the cutoff frequency of the filter. ",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_noisesynth.html",
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
AddAnyTypeParam("Duration ", 'How long the note should be held for before triggering the release. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"8n"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(1, 0, "Attack then release", "Trigger", 
          "Attack then release, duration: <i>{0}</i>, at time <i>{1}</i> with velocity <i>{2}</i>", 
          "Trigger the attack and then the release after the duration.", "TriggerAttackRelease ");   
          
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(2, 0, "Attack", "Trigger", 
          "Attack at time <i>{0</i> with velocity <i>{1}</i>", 
          "Trigger the attack of the note optionally with a given velocity.", "TriggerAttack"); 
          
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddAction(3, 0, "Release", "Trigger", 
          "Release, at time <i>{0}</i>", 
          "Trigger the release portion of the envelope.", "TriggerRelease");
          
// Oscillator       
AddComboParamOption("white");
AddComboParamOption("brown");
AddComboParamOption("pink");
AddComboParam("Type", "The type of the noise.", 1);
AddAction(21, 0, "Set type", "Noise", 
          "Set noise type to <i>{0}</i>", 
          "Set noise type.", "SetNoiseType");

// Envelope
AddNumberParam("Attack", "When triggerAttack is called, the attack time is the amount of time it takes for the envelope to reach it's maximum value.", 0.005);
AddNumberParam("Decay", "After the attack portion of the envelope, the value will fall over the duration of the decay time to it's sustain value.", 0.1);
AddNumberParam("Sustain", "The sustain value is the value which the envelope rests at after triggerAttack is called, but before triggerRelease is invoked.", 0.3);
AddNumberParam("Release", "After triggerRelease is called, the envelope's value will fall to it's miminum value over the duration of the release time.", 1);          
AddAction(41, 0, "Set envelope", "Envelope", 
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
