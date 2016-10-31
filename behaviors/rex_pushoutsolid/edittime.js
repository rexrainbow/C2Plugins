function GetBehaviorSettings()
{
	return {
		"name":			"Push Out Solid",
		"id":			"Rex_pushOutSolid",
		"description":	"Push out from solid object.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_pushoutsolid.html",
		"category":		"Rex - Movement - position",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.", 1);
AddAction(0, 0, "Set enabled", "Enable", "Set {my} <b>{0}</b>", 
          "Set whether this behavior is enabled.", "SetEnabled");

AddObjectParam("Obstacle", "Choose an object to add as an obstacle, obstructing line-of-sight.");
AddAction(11, af_none, "Add obstacle", "Obstacle", 
           "Add {my} obstacle {0}", 
           "Add a custom object as an obstacle to line-of-sight.", "AddObstacle");

AddAction(12, af_none, "Clear obstacles", "Obstacle", 
          "Clear {my} obstacles", 
          "Remove all added obstacle objects.", "ClearObstacles");
          
AddNumberParam("Max push distance", "Max push distance, in pixels.", 100);  
AddAction(21, af_none, "Push out nearest", "Push out", 
          "{my} push out nearest", 
          "Push out nearest.", "PushOutNearest");   
          
AddNumberParam("Angle", "Angle, in degrees, to push the object out at.", 0);
AddNumberParam("Max push distance", "Max push distance, in pixels.", 100);   
AddAction(22, af_none, "Push out at angle", "Push out", 
          "{my} push out at angle {0}", 
          "Push out at angle.", "PushOutAngle");

AddNumberParam("X", "The X co-ordinate in the layout to accelerate toward.");
AddNumberParam("Y", "The Y co-ordinate in the layout to accelerate toward.");
AddAction(23, af_none, "Push out toward position", "Push out", 
          "{my} push toward (<i>{0}</i>, <i>{1}</i>)", 
          "Push out toward position.", "PushOutToPos");              
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [           
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Obstacles", "Solids", "Choose whether solids obstruct or if to use custom objects added by events.", "Solids|Custom"),
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
