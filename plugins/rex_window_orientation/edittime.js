function GetPluginSettings()
{
	return {
		"name":			"Orientation",
		"id":			"Rex_WindowOrientation",
		"version":		"0.1",   		
		"description":	"Get orientation of window. (landspcape or portrait)",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_window_orientation.html",
		"category":		"Input",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2, cf_trigger, "On orientation changed", "Orientation", "On orientation changed", 
             "Triggered when orientation of window changed.", "OnChanged");
AddCondition(3, cf_trigger, "On changing to landspcape view", "Orientation", "On changing to landspcape view", 
             "Triggered when changing to landspcape view .", "OnLandspcape");
AddCondition(4, cf_trigger, "On changing to portrait view", "Orientation", "On changing to portrait view", 
             "Triggered when changing to portrait view .", "OnPortrait");
AddCondition(5, 0, "Is landspcape view", "Orientation", "Is landspcape view", 
             "True if window is at landspcape view .", "IsLandspcape");
AddCondition(6, 0, "Is portrait view", "Orientation", "Is portrait view", 
             "True if window is at portrait view .", "IsPortrait"); 
             
//////////////////////////////////////////////////////////////
// Actions
   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Orientation", "Orientation", "Orientation", "Get orientation value of window.");
AddExpression(2, ef_return_number, "Is landspcape", "Orientation", "IsLandspcape", "Retrun 1 if current view is landspcape.");

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
