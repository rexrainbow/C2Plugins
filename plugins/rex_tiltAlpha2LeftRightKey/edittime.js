function GetPluginSettings()
{
	return {
		"name":			"Tilt alpha to left/right key",
		"id":			"Rex_TiltAlpha2LeftRightKey",
		"version":		"0.1",   		
		"description":	"Get left or right key event from tilt's alpha input.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_tiltAlpha2LeftRightKey.html",
		"category":		"Input",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(6, cf_trigger, "On Left arrow pressed", "Pressd", "On Left arrow pressed", 
             "Triggered when Left arrow is pressed.", "OnLEFTPressed");
AddCondition(7, cf_trigger, "On Right arrow pressed", "Pressd", "On Right arrow pressed", 
             "Triggered when Right arrow is pressed.", "OnRIGHTPressed");
AddCondition(8, cf_trigger, "On any key pressed", "Pressd", "On any key pressed", 
             "Triggered when any arrow is pressed.", "OnAnyPressed");

AddCondition(15, 0,	"Left arrow is down", "Is down", "Left arrow is down", 
             "Return true if Left arrow is currently held down by alpha direction.", "IsLEFTDown");
AddCondition(16, 0,	"Right arrow is down", "Is down", "RIGHT is down", 
             "Return true if Right arrow is currently held down by alpha direction.", "IsRIGHTDown");

AddCondition(25, cf_trigger, "On Left arrow released", "Released", "On Left arrow released", 
             "Triggered when Left arrow is released by alpha direction.", "OnLEFTReleased");
AddCondition(26, cf_trigger, "On Right arrow released", "Released", "On Right arrow released", 
             "Triggered when Right arrow is released by alpha direction.", "OnRIGHTReleased");
             
//////////////////////////////////////////////////////////////
// Actions
AddAction(2, 0, "Calibration", "calibration", "Set ZERO angle to current degree", 
          "Set ZERO angle to current degree.", "Calibration");
AddNumberParam("Sensitivity angle", "Sensitivity angle.");          
AddAction(3, 0, "Set sensitivity angle", "Sensitivity", "Set sensitivity angle to <i>{0}</i>", 
          "Set sensitivity angle of turning direction detection.", "SetSensitivity");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "ZERO angle", "Angle", "ZEROAngle", "Get ZERO angle from alpha direction.");
AddExpression(2, ef_return_number, "Rotate angle", "Angle", "RotateAngle", "Get rotate angle from alpha direction.");
AddExpression(3, ef_return_number, "Sensitivity angle", "Angle", "SensitivityAngle", "Get sensitivity angle of turning direction detection.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "Sensitivity", 5, "Sensitivity of tilt angle, in degree."),    
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
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
    this.properties["Sensitivity"] = Math.abs(this.properties["Sensitivity"]);
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{	
}
