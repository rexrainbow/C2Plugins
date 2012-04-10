function GetBehaviorSettings()
{
	return {
		"name":			"Square-grid Move",
		"id":			"Rex_SquareGridMove",
		"version":		"0.1",        
		"description":	"Move sprite to neighbor on square grid board",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Move up");
AddComboParamOption("Move down");
AddComboParamOption("Move right");
AddComboParamOption("Move left");
AddComboParam("Direction", "Moving direction.", 0);
AddAction(1, 0, "Move to neighbor", "Request", "{my} <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor");      
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Solid", "Solid.", 0);
AddAction(7, 0, "Set solid", "Solid", "Set {my} solid to <i>{0}</i>", 
          "Set solid.", "SetSolid");    
AddNumberParam("Solid", "Set solid. 0=No, 1=Yes", 0);
AddAction(8, 0, "Set solid by number", "Solid", "Set {my} solid to <i>{0}</i>", 
          "Set solid by number.", "SetSolid"); 
//////////////////////////////////////////////////////////////
// Expressions
    
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Solid", "No", "Enable if you do not allow other chess move over.", "No|Yes"),
	new cr.Property(ept_float, "Max speed", 400, "Maximum speed, in pixel per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Acceleration, in pixel per second per second."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Deceleration, in pixel per second per second."),    
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
	if (this.properties["Max speed"] < 0)
		this.properties["Max speed"] = 0;
		
	if (this.properties["Acceleration"] < 0)
		this.properties["Acceleration"] = 0;
		
	if (this.properties["Deceleration"] < 0)
		this.properties["Deceleration"] = 0;
}
