function GetBehaviorSettings()
{
	return {
		"name":			"Touch area",
		"id":			"Rex_TouchArea2",
		"version":		"0.1",        
		"description":	"Get touch by tracking touchID.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Input",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On touch start", "Touch", "On touch start", "Triggered when touch input begins.", "OnTouchStart");
AddCondition(1, cf_trigger, "On touch end", "Touch", "On touch end", "Triggered when touch input ends.", "OnTouchEnd");
AddCondition(2, 0, "Is in touch", "Touch", "Is in touch", "True if touch is currently in contact with this object.", "IsInTouch");
//AddCondition(3, cf_trigger, "On touch moving start", "Touch moving", "On touch moving start", "Triggered when touch and moving start.", "OnTouchMovingStart");

//////////////////////////////////////////////////////////////
// Actions

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Touch X position", "Touch", "X", 
              "Get the touch X co-ordinate in this object. Return 0 if not in touch this object.");
AddExpression(1, ef_return_number, "Touch Y position", "Touch", "Y", 
              "Get the touch Y co-ordinate in this object. Return 0 if not in touch this object.");

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
