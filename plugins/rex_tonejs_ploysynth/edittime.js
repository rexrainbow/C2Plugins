function GetPluginSettings()
{
	return {
		"name":			"PloySynth",
		"id":			"Rex_ToneJS_ploysynth",
		"version":		"0.1",        
		"description":	"Polyphonic.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_ploysynth.html",
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
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262), or a notes array.', '"C4"');
AddAnyTypeParam("Duration ", 'How long the note should be held for before triggering the release. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"8n"');
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)")', '"+0"');
AddNumberParam("Velocity", 'The velocity the note should be triggered at, within the range [0, 1]', 1);
AddAction(1, 0, "Attack then release", "Trigger", 
          "Attack then release note: <i>{0}</i>, duration: <i>{1}</i>, at time <i>{2}</i> with velocity <i>{3}</i>", 
          "Trigger the attack and then the release after the duration.", "TriggerAttackRelease ");   
          
AddAnyTypeParam("Note", 'The note to trigger. Note-Octave("C4") or frequency(262), or a notes array.', '"C4"');
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
          
          
AddAnyTypeParam("Portamento", 'The glide time between notes', 0);
AddAction(11, 0, "Set portamento", "Configuration", 
          "Set portamento to <i>{0}</i>", 
          "Set portamento.", "SetPortamento");
          
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_integer, "Polyphony", 4, "The number of voices to create."),
	new cr.Property(ept_combo, "Voice", "Synth", "The constructor of the voices.", "Synth|MonoSynth|FMSynth|AMSynth|DuoSynth"),    
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
