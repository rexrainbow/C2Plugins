function GetBehaviorSettings()
{
	return {
		"name":			"Light",
		"id":			"Rex_light",
		"description":	"Adjust width until hit obstacle.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_light.html",
		"category":		"Rex - Movement - width",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Hit", "Hit", 
             "{my} hit object", 
			 "Retrun true if hit object.", 
			 "IsHit");             
		 
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, af_none, "Point to solids", "Manual", 
          "{my} point to solids", 
          "Extend width until hit any solid object.", "PointToSolid");
AddObjectParam("Obstacle", "Choose an object to add as an obstacle.");
AddAction(2, af_none, "Point to object", "Manual", 
          "{my} point to {0}", 
          "Extend width until hit any specfic object.", "PointToObject");

AddNumberParam("Width", "Maximum width in pixels.");
AddAction(6, 0, "Set maximum width", "Configure", 
          "Set {my} maximum width to <i>{0}</i>", 
          "Set the maximum width in pixels.", "SetMaxWidth");   

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.");
AddAction(10, 0, "Set enabled", "Tick", "Set {my} <b>{0}</b>", 
          "Set whether this behavior is enabled.", 
          "SetEnabled");

AddObjectParam("Obstacle", "Choose an object to add as an obstacle, obstructing line-of-sight.");
AddAction(11, af_none, "Add obstacle", "Tick", 
           "Add {my} obstacle {0}", 
           "Add a custom object as an obstacle to line-of-sight.", "AddObstacle");

AddAction(12, af_none, "Clear obstacles", "Tick", 
          "Clear {my} obstacles", 
          "Remove all added obstacle objects.", "ClearObstacles");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Hit X position", "Hit", "HitX", "Get hit X co-ordinate.");
AddExpression(2, ef_return_number, "Hit Y position", "Hit", "HitY", "Get hit Y co-ordinate.");
AddExpression(3, ef_return_number, "Hit object UID", "Hit", "HitUID", "Get UID of hit object.");
AddExpression(6, ef_return_number, "Max width", "Configure", "MaxWidth", "Get maximum width setting.");
//AddNumberParam("Normal", "Angle of normal", 90);
AddExpression(11, ef_return_number | ef_variadic_parameters, "Angle of reflection", "Reflection", "ReflectionAngle", "Get angle of refection.");

ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_combo, "Initial state", "Enabled", "Whether to initially have the behavior enabled or disabled.", "Disabled|Enabled"),
    new cr.Property(ept_float, "Max width", 10000, "The maximum width in pixels."),
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
	if (this.properties["Range"] < 0)
		this.properties["Range"] = 0;    
}
