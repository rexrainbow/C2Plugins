function GetBehaviorSettings()
{
	return {
		"name":			"Drag rotate",
		"id":			"Rex_DragRotate2",
		"version":		"0.1",        
		"description":	'Rotate object by dragging',
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_dragrotate2.html",
		"category":		"Input",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the drag rotate behavior.",1);
AddAction(0, 0, "Set activated", "Active", "Set {my} activated to <i>{0}</i>", "Enable the object's drag rotate behavior.", "SetActivated");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Auto rotate", "Enable to auto rotate instance with dragging.",1);
AddAction(1, 0, "Set auto rotate", "Auto rotate", "Set {my} auto rotate to <i>{0}</i>", "Enable to auto rotate instance with dragging.", "SetAutoRotate");

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Delta angle", "Angle", "DeltaAngle", "Get delta angle of current tick.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Auto rotate", "Yes", "Auto rotate instance with dragging.", "No|Yes"),
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
