function GetPluginSettings()
{
	return {
		"name":			"Oscillator shell",
		"id":			"Rex_ToneJS_oscillatortshell",
		"version":		"0.1",        
		"description":	"Shell of oscillator.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_oscillatortshell.html",
		"category":		"Rex - Audio - Tone - Source - Oscillator - Advance",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Oscillator type", "Oscillator type.", '"Oscillator"');
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(1, 0, "Create oscillator", "Creator", 
          "Create <i>{0}</i> (<i>{...}</i>)", 
          "Create oscillator.", "CreateOscillator"); 

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
          
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(21, 0, "Start", "Control", 
          "Start (<i>{...}</i>)", 
          "Start the source at the specified time.", "Start");

AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(22, 0, "Stop", "Control", 
          "Stop (<i>{...}</i>)", 
          "Stop the source at the specified time.", "Stop");          

AddAction(31, 0, "Sync", "Sync", 
          "Sync", 
          "Sync the source to the Transport so that all subsequent calls to start and stop are synced to the TransportTime instead of the AudioContext time.", "Start");

AddAction(32, 0, "Unsync", "Sync", 
          "Unsync", 
          "Unsync the source to the Transport.", "Unsync");           

AddAction(33, 0, "Sync frequency", "Sync", 
          "Sync", 
          "Sync the signal to the Transport's bpm. Any changes to the transports bpm, will also affect the oscillators frequency.", "SyncFrequency");

AddAction(34, 0, "Unsync frequency", "Sync", 
          "Unsync frequency", 
          "Unsync the oscillator's frequency from the Transport.", "UnsyncFrequency");             
          
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
