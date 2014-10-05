function GetBehaviorSettings()
{
	return {
		"name":			"Road",
		"id":			"rex_chess_road",
		"version":		"0.1",
		"description":	"Show road by frames automatically.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_chess_road.html",
		"category":		"Board",
		"flags":		0	
						| bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("disabled");
AddComboParamOption("enabled");
AddComboParam("State", "Whether to enable or disable the behavior.");
AddAction(0, 0, "Set enabled", "Enable", "Set {my} {0}", "Enable or disable the behavior.", "SetActivated");

//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
