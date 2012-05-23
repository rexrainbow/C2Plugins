function GetBehaviorSettings()
{
	return {
		"name":			"Boundary",
		"id":			"Rex_boundary",
		"description":	"Limit position of object in the boundary.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"General",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Horizontal", "Enable the horizontal boundary.",1);
AddAction(3, 0, "Horizontal boundary enable", "Enable boundary", 
          "Set {my} horizontal boundary enable to <i>{0}</i>", "Enable the object's horizontal boundary.", "EnableHorizontal");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Vertical", "Enable the vertical boundary.",1);
AddAction(4, 0, "Vertical boundary enable", "Enable boundary", 
          "Set {my} vertical boundary enable to <i>{0}</i>", "Enable the object's vertical boundary.", "EnableVertical");		  
AddNumberParam("Left", "Left boundary.");
AddNumberParam("Right", "Right boundary.");
AddAction(5, 0, "Set horizontal boundary", "Set boundary", 
          "Set {my} horizontal boundary to [<i>{0}</i>, <i>{1}</i>]", "Set the object's horizontal boundary.", "SetHorizontalBoundary");
AddNumberParam("Up", "Up boundary.");
AddNumberParam("Down", "Down boundary.");
AddAction(5, 0, "Set vertical boundary", "Set boundary", 
          "Set {my} vertical boundary to [<i>{0}</i>, <i>{1}</i>]", "Set the object's vertical boundary.", "SetVerticalBoundary");
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [        
    new cr.Property(ept_combo, "Horizontal", "No", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),	
    new cr.Property(ept_float, "Left", 0, "Left boundary."),	
	new cr.Property(ept_float, "Right", 0, "Right boundary."),	
	new cr.Property(ept_combo, "Vertical", "No", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
	new cr.Property(ept_float, "Up", 0, "Up boundary."),	
	new cr.Property(ept_float, "Down", 0, "Down boundary."),	
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
	if (this.properties["Pixels per step"] < 1)
		this.properties["Pixels per step"] = 1;
}
