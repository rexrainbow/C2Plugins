function GetPluginSettings()
{
	return {
		"name":			"Player",
		"id":			"Rex_ToneJS_player",
		"version":		"0.1",        
		"description":	"An audio file player with start, loop, and stop functions.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_player.html",
		"category":		"Rex - Audio - Tone - Source",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On load", "Sampler", 
            "On load",
            "Triggered when load audio file.", "OnLoad");
     
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("URL", "The url from which to load the AudioBuffer.", '""');
AddAction(1, 0, "Create player", "Creator", 
          "Create player: load from <i>{0}</i>", 
          "Create player.", "CreatePlayer"); 

AddAction(2, 0, "Dispose", "Dispose", 
          "Dispose", 
          "Clean up.", "Dispose");          

AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(11, 0, "Set value", "Property", 
          "Set <i>{0}</i> to <i>{1}</i>", 
          "Set property.", "SetValue"); 

AddStringParam("Property", "Property name in dot notation", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddAction(12, 0, "Set JSON", "Property", 
          "Set <i>{0}</i> to <i>{1}</i>", 
          "Set property to JSON string.", "SetJSON"); 

AddStringParam("Property", "Property name in dot notation", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(13, 0, "Set boolean", "Property", 
          "Set <i>{0}</i> to <i>{1}</i>", 
          "Set property to a boolean value.", "SetBoolean");

AddStringParam("Properties", "Properties in JSON", '"{}"');
AddAction(14, 0, "Set JSON", "Properties", 
          "Set properties to <i>{1}</i>", 
          "Set properties to JSON string.", "SetJSONProps");          
          
AddAnyTypeParam("Start time", 'When the player should start. Set "" to ignore this parameter.', '""');
AddAnyTypeParam("Offset", 'The offset from the beginning of the sample to start at. Set "" to ignore this parameter.', '""');
AddAnyTypeParam("Duration", 'How long the sample should play. Set "" to play full length of the sample (minus any offset).', '""');
AddAction(21, 0, "Start", "Control", 
          "Start at <i>{0}</i>, with sample offset to <i>{1}</i>, duration to <i>{2}</i>", 
          "Play the buffer.", "Start");   
          
AddAnyTypeParam("Time", 'When the source should be stopped. Set "" to ignore this parameter.', '""');
AddAction(22, 0, "Stop", "Control", 
          "Stop at <i>{0}</i>", 
          "Stop the source at the specified time.", "Stop");             
          
AddAnyTypeParam("Offset", 'The time to seek to.', '""');
AddAnyTypeParam("Time", 'The time for the seek event to occur. Set "" to ignore this parameter.', '""');
AddAction(23, 0, "Seek", "Control", 
          "Seek to sample offset <i>{0}</i>, at <i>{1}</i>", 
          "Seek to a specific time in the player's buffer. If the source is no longer playing at that time, it will stop.", "Seek");  

AddAnyTypeParam("Loop start", 'The loop start time.', '""');
AddAnyTypeParam("Loop end", 'The loop end time.', '""');
AddAction(24, 0, "Set loop points", "Loop", 
          "Set loop from <i>{0}</i> to <i>{1}</i>", 
          "Set the loop start and end. Will only loop if loop is set to true.", "SetLoopPoints");             

AddAction(31, 0, "Sync", "Sync", 
          "Sync", 
          "Sync the source to the Transport so that all subsequent calls to start and stop are synced to the TransportTime instead of the AudioContext time.", "Start");

AddAction(32, 0, "Unsync", "Sync", 
          "Unsync", 
          "Unsync the source to the Transport.", "Unsync");     

AddStringParam("URL", "The url from which to load the AudioBuffer.", '""');
AddAction(41, 0, "Load", "Load", 
          "Load from <i>{0}</i>", 
          "Load the audio file as an audio buffer.", "Load");          

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
