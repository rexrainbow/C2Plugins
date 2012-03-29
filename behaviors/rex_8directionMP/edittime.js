function GetBehaviorSettings()
{
	return {
		"name":			"8 Direction MP",
		"id":			"Rex_EightDirMP",
		"version":		"1.0",        
		"description":	"Moves an object up, down, left, right and on diagonals.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, 0, "Is moving", "", "{my} is moving", "True when the object is moving.", "IsMoving");

AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Speed", "The speed, in pixels per second, to compare the current speed to.");
AddCondition(1, 0, "Compare speed", "", "{my} speed {0} {1}", "Compare the current speed of the object.", "CompareSpeed");

AddStringParam("Name", "Control name.", '""');
AddCondition(2, cf_trigger, "On extra control pressed", "Extra control", 
             "On <b>{0}</b> pressed", "Triggered when an extra control is pressed.", "OnExtraCtlPressed");
             
AddStringParam("Name", "Control name.", '""');
AddCondition(3, cf_trigger, "On extra control released", "Extra control", 
             "On <b>{0}</b> released", "Triggered when an extra control is released.", "OnExtraCtlReleased");             

AddStringParam("Name", "Control name.", '""');
AddCondition(4,	0,	"Control is down",	"Extra control", 
             "<b>{0}</b> is down", "Test if an extra control is currently held down.", "IsExtraCtlDown");
             

//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Stop", "", "Stop {my}", "Set the speed to zero.", "Stop");
AddAction(1, 0, "Reverse", "", "Reverse {my}", "Invert the direction of motion.", "Reverse");

AddComboParamOption("Stop ignoring");
AddComboParamOption("Start ignoring");
AddComboParam("Input", "Set whether to ignore the controls for this movement.");
AddAction(2, 0, "Set ignoring input", "", "{0} {my} user input", "Set whether to ignore the controls for this movement.", "SetIgnoreInput");

AddNumberParam("Speed", "The new speed of the object to set, in pixels per second.");
AddAction(3, 0, "Set speed", "", "Set {my} speed to <i>{0}</i>", "Set the object's current speed.", "SetSpeed");

AddNumberParam("Max Speed", "The new maximum speed of the object to set, in pixels per second.");
AddAction(4, 0, "Set max speed", "", "Set {my} maximum speed to <i>{0}</i>", "Set the object's maximum speed.", "SetMaxSpeed");

AddNumberParam("Acceleration", "The new acceleration of the object to set, in pixels per second per second.");
AddAction(5, 0, "Set acceleration", "", "Set {my} acceleration to <i>{0}</i>", "Set the object's acceleration.", "SetAcceleration");

AddNumberParam("Deceleration", "The new deceleration of the object to set, in pixels per second per second.");
AddAction(6, 0, "Set deceleration", "", "Set {my} deceleration to <i>{0}</i>", "Set the object's deceleration.", "SetDeceleration");

AddComboParamOption("Left");
AddComboParamOption("Right");
AddComboParamOption("Up");
AddComboParamOption("Down");
AddComboParam("Control", "The movement control to simulate pressing.");
AddAction(7, 0, "Simulate control", "", "Simulate {my} pressing {0}", "Control the movement by events.", "SimulateControl");

AddComboParamOption("Left");
AddComboParamOption("Right");
AddComboParamOption("Up");
AddComboParamOption("Down");
AddComboParam("Control", "The movement control to configure.");
AddKeybParam("Key", "Control Key");
AddAction(8, 0, "Set control", "", "Set {my} control <i>{0}</i> to <i>{1}</i>", 
          "Set control by key.", "CfgCtl");

AddComboParamOption("Left");
AddComboParamOption("Right");
AddComboParamOption("Up");
AddComboParamOption("Down");
AddComboParam("Control", "The movement control to configure.");
AddNumberParam("Key code", "Control Key code.");
AddAction(9, 0, "Set control by keycode", "", "Set {my} control <i>{0}</i> to keycode <i>{1}</i>", 
          "Set control by keycode.", "CfgCtl");
          
AddStringParam("Name", "Control name.", '""');
AddKeybParam("Key", "Control Key");
AddAction(10, 0, "Set extra control", "Extra control", "Set {my} control <i>{0}</i> to <i>{1}</i>", 
          "Set extra control by key.", "CfgExtraCtl");

AddStringParam("Name", "Control name.", '""');
AddNumberParam("Key code", "Control Key code.");
AddAction(11, 0, "Set extra control by keycode", "Extra control", "Set {my} control <i>{0}</i> to keycode <i>{1}</i>", 
          "Set extra control by keycode.", "CfgExtraCtl");
                  
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.");
AddAction(12, 0, "Set enabled", "", "Set {my} <b>{0}</b>", "Set whether this behavior is enabled.", "SetEnabled");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get speed", "", "Speed", "The current object speed, in pixels per second.");
AddExpression(1, ef_return_number, "Get max speed", "", "MaxSpeed", "The maximum speed setting, in pixels per second.");
AddExpression(2, ef_return_number, "Get acceleration", "", "Acceleration", "The acceleration setting, in pixels per second per second.");
AddExpression(3, ef_return_number, "Get deceleration", "", "Deceleration", "The deceleration setting, in pixels per second per second.");
AddExpression(4, ef_return_number, "Get angle of motion", "", "MovingAngle", "The current angle of motion, in degrees.");
AddExpression(5, ef_return_number, "Get vector X", "", "VectorX", "The current X component of motion, in pixels.");
AddExpression(6, ef_return_number, "Get vector Y", "", "VectorY", "The current Y component of motion, in pixels.");
AddExpression(7, ef_return_number, "Get keycode of LEFT", "", "LEFT", "The current keycode to trigger control LEFT.");
AddExpression(8, ef_return_number, "Get keycode of RIGHT", "", "RIGHT", "The current keycode to trigger control RIGHT.");
AddExpression(9, ef_return_number, "Get keycode of UP", "", "UP", "The current keycode to trigger control UP.");
AddExpression(10, ef_return_number, "Get keycode of DOWN", "", "DOWN", "The current keycode to trigger control DOWN.");
AddStringParam('""', "Extra control name", '""');
AddExpression(11, ef_return_number | ef_variadic_parameters, "Get keycode of extra control", "", "EXTRA", "The keycode to trigger extra control.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_float, "Max speed", 200, "The maximum speed, in pixels per second, the object can travel at."),
	new cr.Property(ept_float, "Acceleration", 600, "The rate of acceleration, in pixels per second per second."),
	new cr.Property(ept_float, "Deceleration", 500, "The rate of deceleration, in pixels per second per second."),
	new cr.Property(ept_combo, "Directions", "8 directions", "The number of directions of movement available.", "Up & down|Left & right|4 directions|8 directions"),
	new cr.Property(ept_combo, "Set angle", "360 degree (smooth)", "How to set the object's angle while moving.", "No|90-degree intervals|45-degree intervals|360 degree (smooth)"),
	new cr.Property(ept_combo, "Default controls", "Yes", "If enabled, arrow keys control movement.  Otherwise, use the 'simulate control' action.", "No|Yes")
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
	// Set initial value for "default controls" if empty (added r51)
	if (property_name === "Default controls" && !this.properties["Default controls"])
		this.properties["Default controls"] = "Yes";
}
