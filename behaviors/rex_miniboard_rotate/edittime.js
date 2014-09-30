function GetBehaviorSettings()
{
	return {
		"name":			"Rotate",
		"id":			"rex_miniboard_rotate",
		"version":		"0.1",
		"description":	"Spin chess on mini board logically and physically.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_miniboard_rotate.html",
		"category":		"Mini board",
		"flags":		0	
						| bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("90 degree, clockwise");
AddComboParamOption("180 degree");
AddComboParamOption("90 degree, anti-clockwise");
AddComboParam("Angle", "Spin angle",0);
AddComboParamOption("logical only");
AddComboParamOption("logical and physical");
AddComboParam("Mode", "Mode of spin.", 1);
AddAction(1, 0, "Rotate", "Rotate - Square grid", 
          "{my} rotate <i>{0}</i> (<i>{1}</i>)", "Spin chess on mini square board.", "RotateSquareMiniBoard");

//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

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
