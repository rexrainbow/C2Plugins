function GetBehaviorSettings()
{
	return {
		"name":			"Linear layout",
		"id":			"Rex_layouter_linear",
		"description":	"Put sprite linear on layouter.",
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
new cr.Property(ept_combo, "Mode", "Average", "Average mode: layout instances in range averagely, Fix mode: layout instances with fix angle, Compact mode: layout instances compactly.", "Average|Fix|Compact"),
    new cr.Property(ept_combo, "Direction", "Left to right", "Direction from start to end.", "Left to right|Right to left|Top to bottom|Bottom to top"),
    new cr.Property(ept_combo, "Alignment", "Start", "Alignment. It only uses in Fix or Compact mode.", "Center|Start|End"),        
    new cr.Property(ept_float, "Delta distance", 40, "Delta distance of each instance, in pixel. It only uses in Fix mode."),
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
