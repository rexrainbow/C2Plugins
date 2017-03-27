function GetBehaviorSettings()
{
	return {
		"name":			"Anchor mod",
		"id":			"rex_Anchor_mod",
		"version":		"1.0",
		"description":	"Position objects relative to the size of the window.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_anchor_mod.html",
		"category":		"Rex - Movement - position",
		"flags":		0	
						| bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On anchored", "Anchor", "On {my} anchored", 
             "Triggered when anchored.", "OnAnchored");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("disabled");
AddComboParamOption("enabled");
AddComboParam("State", "Whether to enable or disable the behavior.");
AddAction(0, 0, "Set enabled", "Anchor", "Set {my} {0}", "Enable or disable the behavior.", "SetEnabled");

//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

var property_list = [
	new cr.Property(ept_combo, "Left edge", "Window left", "Anchor the object's left edge to a window edge.", "Window left|Window right|None"),
	new cr.Property(ept_combo, "Top edge", "Window top", "Anchor the object's top edge to a window edge.", "Window top|Window bottom|None"),
	new cr.Property(ept_combo, "Right edge", "None", "Anchor the object's right edge.", "None|Window right"),
	new cr.Property(ept_combo, "Bottom edge", "None",	"Anchor the object's bottom edge.", "None|Window bottom"),
	new cr.Property(ept_combo, "Initial state", "Enabled", "Whether to initially have the behavior enabled or disabled.", "Disabled|Enabled"),
    new cr.Property(ept_combo, "Set once", "No", "Enable to set position once when window size changed.", "No|Yes")	
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
