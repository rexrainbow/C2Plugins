function GetPluginSettings()
{
	return {
		"name":			"ArrowKey",
		"id":			"Rex_ArrowKey",
		"version":		"0.1",   		
		"description":	"Get arrow key event from keyboard or touch/mouse input.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Input",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On UP key pressed", "Pressd", "On UP pressed", "Triggered when UP key is pressed.", "OnUPKey");
AddCondition(2, cf_trigger, "On DOWN key pressed", "Pressd", "On DOWN pressed", "Triggered when DOWN key is pressed.", "OnDOWNKey");
AddCondition(3, cf_trigger, "On LEFT key pressed", "Pressd", "On LEFT pressed", "Triggered when LEFT key is pressed.", "OnLEFTKey");
AddCondition(4, cf_trigger, "On RIGHT key pressed", "Pressd", "On RIGHT pressed", "Triggered when RIGHT key is pressed.", "OnRIGHTKey");
AddCondition(5, cf_trigger, "On any key pressed", "Pressd", "On any key pressed", "Triggered when any keyboard key is pressed.", "OnAnyKey");

AddCondition(11,	0,	"UP Key is down",	"Is down", "UP is down", "Test if UP key is currently held down.", "IsUPDown");
AddCondition(12,	0,	"DOWN Key is down",	"Is down", "DOWN is down", "Test if DOWN key is currently held down.", "IsDOWNDown");
AddCondition(13,	0,	"LEFT Key is down",	"Is down", "LEFT is down", "Test if LEFT key is currently held down.", "IsLEFTDown");
AddCondition(14,	0,	"RIGHT Key is down",	"Is down", "RIGHT is down", "Test if RIGHT key is currently held down.", "IsRIGHTDown");

AddCondition(21,	cf_trigger,	"On UP key released",	"Released", "On UP released", "Triggered when UP key is released.", "OnUPKeyReleased");
AddCondition(22,	cf_trigger,	"On DOWN key released",	"Released", "On DOWN released", "Triggered when DOWN key is released.", "OnDOWNKeyReleased");
AddCondition(23,	cf_trigger,	"On LEFT key released",	"Released", "On LEFT released", "Triggered when LEFT key is released.", "OnLEFTKeyReleased");
AddCondition(24,	cf_trigger,	"On RIGHT key released",	"Released", "On RIGHT released", "Triggered when RIGHT key is released.", "OnRIGHTKeyReleased");

//////////////////////////////////////////////////////////////
// Actions

//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Directions", "8 directions", "The number of directions of movement available.", "Up & down|Left & right|4 directions|8 directions"),
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
