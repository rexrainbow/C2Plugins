function GetPluginSettings()
{
	return {
		"name":			"MultiPlayer",
		"id":			"Rex_ToneJS_multiplayer",
		"version":		"0.1",        
		"description":	"Play a bunch of audio buffers.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_multiplayer.html",
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
AddStringParam("URL", "name:url pairs .", '"{}"');
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
          
AddStringParam("Buffer name", 'The name of the buffer to start.', '""');          
AddAnyTypeParam("Time", 'When to start the buffer. Set "" to ignore this parameter.', '""');
AddAnyTypeParam("Offset", 'The offset into the buffer to play from. Set "" to ignore this parameter.', '""');
AddAnyTypeParam("Duration", 'How long to play the buffer for. Set "" to play full length of the sample (minus any offset).', '""');
AddAnyTypeParam("Pitch", 'The interval to repitch the buffer. Set "" to play full length of the sample (minus any offset).', '""');
AddAnyTypeParam("Gain", 'The gain to play the sample at. Set "" to play full length of the sample (minus any offset).', '""');
AddAction(21, 0, "Start", "Control", 
          "Start <i>{0}</i> at <i>{1}</i>, with sample offset to <i>{2}</i>, duration to <i>{3}</i>, pitch to <i>{4}</i>, gain to <i>{5}</i>", 
          "Start a buffer by name.", "Start");   
          
AddStringParam("Buffer name", 'The name of the buffer to start.', '""');               
AddAnyTypeParam("Time", 'When to stop the buffer. Set "" to ignore this parameter.', '""');
AddAction(22, 0, "Stop", "Control", 
          "Stop <i>{0}</i> at <i>{1}</i>", 
          "Stop the buffer at the specified time.", "Stop");             
          
AddAnyTypeParam("Time", 'When to stop the buffers. Set "" to ignore this parameter.', '""');
AddAction(23, 0, "Stop all", "Control", 
          "Stop all at <i>{1}</i>", 
          "Stop all currently playing buffers at the given time.", "StopAll");      
         
AddStringParam("Buffer name", 'The name of the buffer to start.', '""');
AddAnyTypeParam("Time", 'When to start the buffer. Set "" to ignore this parameter.', '""');    
AddAnyTypeParam("Offset", 'The offset into the buffer to play from. Set "" to ignore this parameter.', '""');
AddAnyTypeParam("Loop start", 'The loop start time.', '""');
AddAnyTypeParam("Loop end", 'The loop end time.', '""');
AddAnyTypeParam("Pitch", 'The interval to repitch the buffer. Set "" to play full length of the sample (minus any offset).', '""');
AddAnyTypeParam("Gain", 'The gain to play the sample at. Set "" to play full length of the sample (minus any offset).', '""');
AddAction(24, 0, "Start loop", "Control", 
          "Start <i>{0}</i> at <i>{1}</i>, with sample offset to <i>{2}</i>, loop from <i>{3}</i> to <i>{4}</i>, pitch to <i>{5}</i>, gain to <i>{6}</i>", 
          "Start a looping buffer by name.", "StarttLoop");              
          

AddAction(31, 0, "Sync", "Sync", 
          "Sync", 
          "Sync the source to the Transport so that all subsequent calls to start and stop are synced to the TransportTime instead of the AudioContext time.", "Start");

AddAction(32, 0, "Unsync", "Sync", 
          "Unsync", 
          "Unsync the source to the Transport.", "Unsync");           

AddStringParam("Buffer name", 'The name of the buffer to start.', '""');                    
AddStringParam("URL", "The url from which to load the AudioBuffer.", '""');
AddAction(41, 0, "Add", "Load", 
          "Add <i>{0}</i> from <i>{0}</i>", 
          "Add another buffer to the available buffers.", "Add");          

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
