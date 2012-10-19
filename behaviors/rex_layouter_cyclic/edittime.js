function GetBehaviorSettings()
{
	return {
		"name":			"Cyclic layout",
		"id":			"Rex_layouter_cyclic",
		"description":	"Put sprite cyclic on layouter.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Layouter",
		"flags":		bf_onlyone
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
    new cr.Property(ept_float, "Start angle", 0, "Start angle of first instance, in degree."),
    new cr.Property(ept_float, "Cyclic angle", 360, "Cyclic angle from start angle, in degree. Negative is anti-clockwise."),
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
