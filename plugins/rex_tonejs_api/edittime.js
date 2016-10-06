function GetPluginSettings()
{
	return {
		"name":			"ToneJS api",
		"id":			"Rex_ToneJS_api",
		"version":		"0.1",        
		"description":	"Api of tone.js. https://github.com/Tonejs/Tone.js",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_api.html",
		"category":		"Rex - Audio - Tone - Core",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"Tone.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Object", "Object to assign."); 
AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(101, 0, "Set value", "Property", 
          "<i>{0}</i>: set <i>{0}</i> to <i>{1}</i>", 
          "Set property of an object.", "SetValue"); 
          
AddObjectParam("Object", "Object to assign."); 
AddStringParam("Property", "Property name in dot notation", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddAction(102, 0, "Set JSON", "Property", 
          "<i>{0}</i>: set <i>{0}</i> to <i>{1}</i>", 
          "Set property of an object.", "SetJSON"); 
          
AddObjectParam("Object", "Object to assign."); 
AddStringParam("Property", "Property name in dot notation", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(103, 0, "Set boolean", "Property", 
          "<i>{0}</i>: set <i>{0}</i> to <i>{1}</i>", 
          "Set property of an object.", "SetBoolean");
          
AddObjectParam("Object", "Object to assign."); 
AddStringParam("Properties", "Properties in JSON", '"{}"');
AddAction(111, 0, "Set JSON", "Properties", 
          "<i>{0}</i>: Set properties to <i>{1}</i>", 
          "Set properties by JSON string.", "SetJSONProps");          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "The currentTime from the AudioContext", "Time", "Now", "Get the currentTime from the AudioContext.");

AddNumberParam("UID", "UID of a tone instance", 0);
AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(101, ef_return_any, "Property of an instance", "Property", "Property", "Get property of an instance.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Transport", "",	"Transport for timing musical events."), 
    new cr.Property(ept_combo, "Start timeline", "Yes", "Set Yes to start timeline.", "No|Yes"),            
    new cr.Property(ept_integer, "BPM", 120, "The Beats Per Minute of the Transport."),
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
