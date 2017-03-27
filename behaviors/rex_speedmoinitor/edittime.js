function GetBehaviorSettings()
{
	return {
		"name":			"Speed moinitor",
		"id":			"Rex_SpeedMoinitor",
		"description":	"Get current speed of instance.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_speedmoinitor.html",
		"category":		"Rex - Attributes",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2, 0, "Is moving", "Moving", "Is {my} moving", 
             "Return true if the sprite is moving.", "IsMoving");
AddCondition(3, cf_trigger, "On moving start", "Moving", "On {my} moving start", 
             "Triggered when sprite is moving start.", "OnMovingStart");
AddCondition(4, cf_trigger, "On moving stop", "Moving", "On {my} moving stop", 
             "Triggered when sprite is moving stop.", "OnMovingStop");
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Speed", "The current speed, in pixels per second, to compare the current speed to.");
AddCondition(5, 0, "Compare speed", "Compare", "{my} speed {0} {1}", "Compare the current speed of the object.", "CompareSpeed");
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Angle", "The current angle, in degree, to compare the current angle to.");
AddCondition(6, 0, "Compare angle", "Compare", "{my} angle {0} {1}", "Compare the current angle of the object.", "CompareAngle");
//////////////////////////////////////////////////////////////
// Actions 
  		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Current speed", "Speed", "Speed", "Get current moving speed, in pixels per second");
AddExpression(2, ef_return_number, "Current angle", "Speed", "Angle", "Get current moving angle, in degree");
AddExpression(10, ef_return_number, "Last speed", "Last", "LastSpeed", "Get last non-zero moving speed, in pixels per second");
AddExpression(11, ef_return_number, "Last angle", "Last", "LastAngle", "Get last non-zero moving angle, in degree");


ACESDone();

// Property grid properties for this plugin
var property_list = [	
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
