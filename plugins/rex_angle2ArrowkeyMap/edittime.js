function GetPluginSettings()
{
	return {
		"name":			"Angle to ArrowKey",
		"id":			"Rex_angle2ArrowKeyMap",
		"version":		"0.1",   		
		"description":	"Mapping angle input to arrow key event.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_angle2arrowKeymap.html",
		"category":		"Rex - Arrow key",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On Up key pressed", "Pressd", "On Up key pressed", 
             "Triggered when Up key is pressed.", "OnUPPressed");
AddCondition(2, cf_trigger, "On Down key pressed", "Pressd", "On Down key pressed", 
             "Triggered when Down key is pressed.", "OnDOWNPressed");
AddCondition(3, cf_trigger, "On Left key pressed", "Pressd", "On Left key pressed", 
             "Triggered when Left key is pressed.", "OnLEFTPressed");
AddCondition(4, cf_trigger, "On Right key pressed", "Pressd", "On Right key pressed", 
             "Triggered when Right key is pressed.", "OnRIGHTPressed");
AddCondition(5, cf_trigger, "On any key pressed", "Pressd", "On any key pressed", 
             "Triggered when any key is pressed.", "OnAnyPressed");

AddCondition(11, 0,	"Up key is down",	"Is down", "Up key is down", 
             "Return true if Up key is currently held down.", "IsUPDown");
AddCondition(12, 0,	"Down key is down", "Is down", "Down key is down", 
             "Return true if Down key is currently held down.", "IsDOWNDown");
AddCondition(13, 0,	"Left key is down", "Is down", "Left key is down", 
             "Return true if Left key is currently held down.", "IsLEFTDown");
AddCondition(14, 0,	"Right key is down", "Is down", "Right key is down", 
             "Return true if Right key is currently held down.", "IsRIGHTDown");
AddCondition(15, 0,	"Any arrow is down", "Is down", "Any arrow is down", 
             "Return true if Any arrow is currently held down.", "IsAnyDown");
             
AddCondition(21, cf_trigger, "On Up key released", "Released", "On Up key released", 
             "Triggered when Up key is released.", "OnUPReleased");
AddCondition(22, cf_trigger, "On Down key released", "Released", "On Down key released", 
             "Triggered when Down key is released.", "OnDOWNReleased");
AddCondition(23, cf_trigger, "On Left key released", "Released", "On Left key released", 
             "Triggered when Left arrow is released.", "OnLEFTReleased");
AddCondition(24, cf_trigger, "On Right key released", "Released", "On Right key released", 
             "Triggered when Right key is released.", "OnRIGHTReleased");

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Angle", "Angle, from origin to current, in degree.", 0);
AddNumberParam("Distance", "Distance, from origin to current.", 50);
AddAction(1, 0, "Set input", "Key-down", 
          "Set input angle to <i>{0}</i>, distance to <i>{1}</i>", 
          "Set pressing angle and distance, which is from origin to current.", "SetInput");  
AddAction(2, 0, "Release", "Key-up", 
          "Release all", 
          "Release all key-down.", "Release");  
          
//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("Angle", "Input angle, option.", 0);
AddExpression(1, ef_return_number | ef_variadic_parameters, "Angle of arrowkey", "Arrowkey", "ArrowkeyAngle", "Get the angle mapped from arrowkey, in degrees.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Directions", "8 directions", "The number of directions of movement available.", "Up & down|Left & right|4 directions|8 directions"),
    new cr.Property(ept_float, "Sensitivity", 50, "Sensitivity of touch movment, in pixel."),       
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
	if (this.properties["Sensitivity"] < 0)
		this.properties["Sensitivity"] = 1;
		
}
