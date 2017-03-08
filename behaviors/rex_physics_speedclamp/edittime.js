function GetBehaviorSettings()
{
	return {
		"name":			"Speed clamp",
		"id":			"Rex_physics_speedclamp",
		"description":	"Clamp speed between upper and lower bounds.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_physics_speedclamp.html",
		"category":		"Rex - Physics helper",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2,	cf_trigger, "On hit upper bound", "Hit", 
             "On {my} hit upper bound", "Triggered when speed hit upper bound.", "OnHitUpperBound"); 
AddCondition(3,	cf_trigger, "On hit lower bound", "Hit", 
             "On {my} hit lower bound", "Triggered when object hit lower bound.", "OnHitLowerBound");   
             
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(1, 0, "Set activated", "Setup", "{my} set activated to <i>{0}</i>", "Enable the object's speed clamp behavior.", "SetActivated");

AddNumberParam("Upper bound", "Upper bound of speed, in pixels per second.", 400);
AddAction(2, 0, "Set upper bound", "Bounds", "Set {my} upper bound to <i>{0}</i>", 
         "Set upper bound of speed.", "SetUpperBound");

AddNumberParam("Lower bound", "Lower bound of speed, in pixels per second.", 400);
AddAction(3, 0, "Set lower bound", "Bounds", "Set {my} lower bound to <i>{0}</i>", 
         "Set lower bound of speed.", "SetLowerBound");
         
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get current speed", "Speed", "CurSpeed", "Get current speed, in pixels per second.");
AddExpression(2, ef_return_number, "Get upper bound", "Bounds",	"UpperBound", "Upper bound of speed, in pixels per second.");
AddExpression(3, ef_return_number, "Get lower bound", "Bounds",	"LowerBound", "Lower bound of speed, in pixels per second.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),    
    new cr.Property(ept_float, "Upper bound", 400, "Upper bound of speed, in pixels per second."),  
    new cr.Property(ept_float, "Lower bound", 0, "Lower bound of speed, in pixels per second."),     
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
	if (this.properties["Upper bound"] < 0)
		this.properties["Upper bound"] = 0;
	if (this.properties["Lower bound"] < 0)
		this.properties["Lower bound"] = 0;
		
}
