function GetBehaviorSettings()
{
	return {
		"name":			"Cursor2",
		"id":			"Rex_Cursor2",
		"version":		"1.0",        
		"description":	"Move Sprite to cursor of mouse",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_cursor2.html",
		"category":		"Rex - Touch",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", "Enable the object's cursor behavior.", "SetActivated");


//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On moving start", "Moving", "On {my} moving start", "Triggered when object moving start.", "OnMovingStart");             
AddCondition(1,	0, "Is moving", "Moving", "Is {my} moving", "Is object moving.", "IsMoving");             
AddCondition(2,	cf_trigger, "On moving end", "Moving", "On {my} moving end", "Triggered when object moving end.", "OnMovingEnd");             


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Mouse X position", "Position", "X", "Get the mouse cursor X co-ordinate in the layout.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Mouse Y position", "Position", "Y", "Get the mouse cursor Y co-ordinate in the layout.");

// ef_deprecated
AddExpression(2, ef_deprecated | ef_return_number, "Absolute mouse X", "Position", "AbsoluteX", "Get the mouse cursor X co-ordinate on the canvas.");
AddExpression(3, ef_deprecated | ef_return_number, "Absolute mouse Y", "Position", "AbsoluteY", "Get the mouse cursor Y co-ordinate on the canvas.");
// ef_deprecated

AddExpression(4, ef_return_number, "Get activated", "", "Activated", "The activated setting, 1 is activated.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Invisible", "Yes", "Enable if you wish to set sprite invisible at touch end.", "No|Yes"),
    new cr.Property(ept_combo, "Axis", "Both", "The axis this object can move on.", "Both|Horizontal|Vertical"),    
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
