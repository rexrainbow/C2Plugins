function GetBehaviorSettings()
{
	return {
		"name":			"Anchor ratio",
		"id":			"rex_Anchor2",
		"version":		"0.1",
		"description":	"Position objects relative to the size of the window.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_anchor2.html",
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

AddComboParamOption("Left edge");
AddComboParamOption("Right edge");
AddComboParamOption("Center");
AddComboParamOption("Hotspot");
AddComboParam("Mode", "Align mode of horizontal.");
AddAction(1, 0, "Set horizontal align mode", "Horizontal", 
    "{my} set horizontal align mode to {0}", 
    "Set horizontal align mode.", "SetHorizontalAlignMode");

AddNumberParam("Position", "position of window, 0 - 1, 0 = window left, 0.5 = window center, 1 = window right.", 0);    
AddAction(2, 0, "Set horizontal position", "Horizontal", 
    "{my} set horizontal position to {0}", 
    "Set horizontal position.", "SetHorizontalPosition");
    
AddComboParamOption("Top edge");
AddComboParamOption("Bottom edge");
AddComboParamOption("Center");
AddComboParamOption("Hotspot");
AddComboParam("Mode", "Align mode of horizontal.");
AddAction(3, 0, "Set vertical align mode", "Vertical", 
    "{my} set vertical align mode to {0}", 
    "Set vertical align mode.", "SetVerticalAlignMode");
    
AddNumberParam("Position", "position of window, 0 - 1, 0 = window top, 0.5 = window center, 1 = window bottom.", 0);        
AddAction(4, 0, "Set vertical position", "Vertical", 
    "{my} set vertical position to {0}", 
    "Set vertical position.", "SetVerticalPosition");    
    
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

var property_list = [
    new cr.Property(ept_combo, "Horizontal align mode", "Left edge", "Anchor the object's left edge to window horizontal position.", "Left edge|Right edge|Center|Hotspot|None"),
	new cr.Property(ept_float, "Horizontal position", 0, "Horizontal position of window, 0 - 1, 0 = window left, 0.5 = window center, 1 = window right."),	
    new cr.Property(ept_combo, "Vertical align mode", "Top edge", "Anchor the object's left edge to window vertical position.", "Top edge|Bottom edge|Center|Hotspot|None"),
    new cr.Property(ept_float, "Vertical position", 0, "Vertical position of window, 0 - 1, 0 = window top, 0.5 = window center, 1 = window bottom."),	
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
