function GetBehaviorSettings()
{
	return {
		"name":			"Sin button",
		"id":			"Rex_SinButton2",
		"description":	"Active sin behavior when cursor is overed",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Inactive");
AddComboParamOption("Active");
AddComboParam("State", "Set whether the movement is active or inactive.");
AddAction(0, af_none, "Set active", "", "Set {my} <b>{0}</b>", "Enable or disable the movement.", "SetActive");
AddNumberParam("Period", "The time in seconds for a complete cycle.");
AddAction(1, af_none, "Set period", "", "Set {my} period to <b>{0}</b>", "Set the time in seconds for a complete cycle.", "SetPeriod");
AddNumberParam("Magnitude", "The maximum change in pixels (or degrees for Angle).");
AddAction(2, af_none, "Set magnitude", "", "Set {my} magnitude to <b>{0}</b>", "Set the magnitude of the movement.", "SetMagnitude");


//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On cursor over", "", "On {my} cursor over", "Triggered when cursor over.", "OnOver");             
AddCondition(1,	0, "Is cursor over", "", "Is {my} cursor over", "Is cursor over.", "IsOver");             
AddCondition(2, 0, "Is active", "", "Is {my} active", "True if the movement is currently active.", "IsActive");


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get Cycle Position",	"", "CyclePosition",	"Return the current position in the cycle as a number from 0 to 1.");
AddExpression(1, ef_return_number, "Get period", 			"", "Period",			"Return the current period, in seconds.");
AddExpression(2, ef_return_number, "Get magnitude",			"", "Magnitude",		"Return the current magnitude of the movement.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, 		"Active on start",		"Yes",		"Enable the behavior at the beginning of the layout.", "No|Yes"),
	new cr.Property(ept_combo,		"Movement",				"Horizontal", "Select what property of the object to modify.", "Horizontal|Vertical|Size|Width|Height|Angle"),
	new cr.Property(ept_float,		"Period",				4,			"The time in seconds for a complete cycle."),
	new cr.Property(ept_float,		"Period random",		0,			"Add a random number of seconds to the period, up to this value."),
	new cr.Property(ept_float,		"Period offset",		0,			"The initital time in seconds through the cycle."),
	new cr.Property(ept_float,		"Period offset random",	0,			"Add a random number of seconds to the initial time, up to this value."),
	new cr.Property(ept_float,		"Magnitude",			50,			"The maximum change in pixels (or degrees for Angle)."),
	new cr.Property(ept_float,		"Magnitude random",		0,			"Add a random number to the magnitude, up to this value.")
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
