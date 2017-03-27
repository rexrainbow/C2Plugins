function GetBehaviorSettings()
{
	return {
		"name":			"Step",
		"id":			"Rex_Step",
		"description":	"Insert x,y position.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_step.html",
		"category":		"General",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On step", "", "On {my} step", "Triggered when stepping the object for motion.", "OnCMStep");
AddCondition(1, cf_trigger, "On horizontal step", "", "On {my} horizontal step", "Triggered when stepping the object horizontally for motion.", "OnCMHorizStep");
AddCondition(2, cf_trigger, "On vertical step", "", "On {my} vertical step", "Triggered when stepping the object vertically for motion.", "OnCMVertStep");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", 
          "Enable the object's step behavior.", "SetActivated");
AddComboParamOption("Go back a step");
AddComboParamOption("Stay at current position");
AddComboParam("Position", "Choose the resulting object position.");
AddAction(1, 0, "Stop stepping", "Velocity", "Stop {my} stepping ({0})", 
          "Stop the current stepping, preventing any more step triggers firing this tick.", "StopStepping");
AddNumberParam("Pixels per step", "The pixels per step.", 5);
AddAction(2, 0, "Set pixels per step", "", "Set {my} pixels per step to <i>{0}</i>", 
          "Set pixels per step.", "SetPixelPerStep");     
AddAction(3, 0, "Force stepping", "", "Force {my} stepping", 
          "Force stepping.", "ForceStepping");              

//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
	new cr.Property(ept_combo, "Stepping mode", "Linear", 
                    "Move in increments while firing the step triggers.", 
                    "Linear|Horizontal then vertical|Vertical then horizontal"),
	new cr.Property(ept_integer, "Pixels per step", 5, 
                    "When stepping enabled, the number of pixels to move each step."),
	new cr.Property(ept_integer, "Noise shift", 0, 
                    "Noise shift in pixel per step."),                    
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
	if (this.properties["Pixels per step"] < 1)
		this.properties["Pixels per step"] = 1;
}
