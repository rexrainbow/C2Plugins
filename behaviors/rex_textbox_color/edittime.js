function GetBehaviorSettings()
{
	return {
		"name":			"Color input",
		"id":			"Rex_textbox_color",
		"description":	"Accept color input",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_textbox_color.html",
		"category":		"Rex - Textbox helper",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
            

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,	"Get selected red color", "Color", "R", "Get selected red color.");
AddExpression(2, ef_return_number,	"Get selected green color", "Color", "G", "Get selected green color.");
AddExpression(3, ef_return_number,	"Get selected blue color", "Color", "B", "Get selected blie color.");

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
