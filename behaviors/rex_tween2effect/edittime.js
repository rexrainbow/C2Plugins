function GetBehaviorSettings()
{
	return {
		"name":			"Tween to Effect",
		"id":			"Rex_Tween2Effect",
		"description":	"Set effect parameter from tween behavior. Put this behavior under tween behavior.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_tween2effect.html",
		"category":		"Rex - Effect",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
             
//////////////////////////////////////////////////////////////
// Actions 
       
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_text, "Name", "", "The name of effect."),
    new cr.Property(ept_integer, "Index", 0, "The index of parameter in effect."),
    new cr.Property(ept_combo, "Target", "Instance", "The target for passing tween value.", "Instance|Layer|Layout"),
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
