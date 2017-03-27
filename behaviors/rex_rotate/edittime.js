function GetBehaviorSettings()
{
	return {
		"name":			"Rotate",
		"id":			"Rex_Rotate",
		"version":		"1.0",          
		"description":	"Rotate Sprite",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_rotate.html",
		"category":		"Rex - Movement - angle",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCmpParam("Comparison", "Choose the way to compare the current rotation speed.");
AddNumberParam("Rotation speed", "The rotation speed, in degrees per second, to compare the current speed to.");
AddCondition(0, 0, "Compare rotation speed", "", "{my} rotation speed {0} {1}", "Compare the current rotation speed of the object.", "CompareSpeed");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the rotation behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", "Enable the object's rotation behavior.", "SetActivated");

AddComboParamOption("Anti-clockwise");
AddComboParamOption("Clockwise");
AddComboParam("Direction", "Select clockwise or anticlockwise rotation.", 1);
AddAction(1, 0, "Set rotation direction", "", "Set {my} rotation direction to <i>{0}</i>", "Set the object's rotation direction.", "SetDirection");

AddNumberParam("Rotation speed", "Rotation speed, in degrees per second.");
AddAction(2, 0, "Set rotation speed", "", "Set {my} rotation speed to <i>{0}</i>", "Set the object's current rotation speed.", "SetSpeed");

AddNumberParam("Rotation acceleration", "The acceleration setting, in pixels per second per second.");
AddAction(3, 0, "Set rotation acceleration", "", "Set {my} rotation acceleration to <i>{0}</i>", "Set the object's rotation acceleration.", "SetAcceleration");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get speed", "", "Speed", "The current object rotation speed, in degrees per second.");
AddExpression(1, ef_return_number, "Get acceleration", "", "Acceleration", "The rotation acceleration setting, in degrees per second per second.");
AddExpression(2, ef_return_number, "Get activated", "", "Activated", "The activated setting, 1 is activated.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Direction", "Clockwise", "Select clockwise or anticlockwise rotation.", "Anti-clockwise|Clockwise"),
	new cr.Property(ept_float, "Speed", 180, "Rotation speed, in degrees per second."),
	new cr.Property(ept_float, "Acceleration", 0, "Rotation acceleration, in degrees per second per second, negative slows down.")
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
