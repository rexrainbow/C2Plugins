function GetPluginSettings()
{
	return {
		"name":			"Microphone",
		"id":			"Rex_ToneJS_microphone",
		"version":		"0.1",        
		"description":	"Opens up the default source (typically the microphone).",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_microphone.html",
		"category":		"Rex - Audio - Tone - Source",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On opened", "open", 
            "On opened",
            "Triggered when the stream is open.", "OnOpen");
            
AddCondition(2, cf_trigger, "On opened error", "open", 
            "On opened error",
            "Triggered when the media stream can't open. This is fired either because the browser doesn't support the media stream, or the user blocked opening the microphone.", 
            "OnOpenError");            
            
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Create microphone", "Creator", 
          "Create and open microphone", 
          "Create and open microphone.", "CreateMicrophone"); 

AddAction(2, 0, "Dispose", "Dispose", 
          "Dispose", 
          "Clean up.", "Dispose");

AddObjectParam("Object", "Object to plug.");          
AddStringParam("Port", 'Port name. set "" to ignore this parameter.', '""');
AddAction(4, 0, "Connect", "Connect", 
          "Connect to <i>{0}</i> (<i>{1}</i>)", 
          "Connect to object.", "Connect");           
                              
          
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
          "Set properties to <i>{0}</i>", 
          "Set properties to JSON string.", "SetJSONProps");          
          
AddAnyTypeParam("Time", 'When the source should be started. Set "" to ignore this parameter.', '""');
AddAction(21, 0, "Start", "Control", 
          "Start at <i>{0}</i>", 
          "Start the source at the specified time.", "Start");

AddAnyTypeParam("Time", 'When the source should be stopped. Set "" to ignore this parameter.', '""');
AddAction(22, 0, "Stop", "Control", 
          "Stop at <i>{0}</i>", 
          "Stop the source at the specified time.", "Stop");          

AddAction(31, 0, "Sync", "Sync", 
          "Sync", 
          "Sync the source to the Transport so that all subsequent calls to start and stop are synced to the TransportTime instead of the AudioContext time.", "Start");

AddAction(32, 0, "Unsync", "Sync", 
          "Unsync", 
          "Unsync the source to the Transport.", "Unsync");           

//////////////////////////////////////////////////////////////
// Expressions
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get property", "Property", "Property", "Get property.");

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
