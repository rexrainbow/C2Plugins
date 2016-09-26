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

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "The currentTime from the AudioContext", "Time", "Now", "Get the currentTime from the AudioContext.");

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
