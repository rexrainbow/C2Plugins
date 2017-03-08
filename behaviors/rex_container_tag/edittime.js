function GetBehaviorSettings()
{
	return {
		"name":			"Container tag",
		"id":			"Rex_container_tag",
		"description":	"Container tag to add sprite into container at layout editor.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_container_tag.html",
		"category":		"Container",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
	  			 		 
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Tag", "Container tag.", '""');
AddAction(3, 0, "Set tag", "Tag", "Set {my} tag to <i>{0}</i>",
         "Set tag.", "SetTag");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(3, ef_return_string, "Get tag", "Tag", "Tag", "Get tag.");


ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_text, "Tag", "", "Tag for adding sprite into container at layout editor."),	
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
