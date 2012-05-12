function GetPluginSettings()
{
	return {
		"name":			"Touch wrap",
		"id":			"rex_TouchWrap",
		"version":		"0.1",
		"description":	"A wrap from official Touch plugin to export touch/mouse input to other plugins.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Input",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On touch start", "Touch", "On touch start", "Triggered when a touch input begins.", "OnTouchStart");
AddCondition(1, cf_trigger, "On touch end", "Touch", "On touch end", "Triggered when a touch input ends.", "OnTouchEnd");
AddCondition(2, 0,			"Is in touch", "Touch", "Is in touch", "True if between a touch start and touch end.", "IsInTouch");

AddObjectParam("Object", "Choose the object to check for touch.");
AddCondition(3,	cf_trigger, "On touched object", "Touch", "On touched {0}", "Triggered when an object is touched.", "OnTouchObject");

AddObjectParam("Object", "Choose the object to check for being touched.");
AddCondition(4, 0,			"Is touching object", "Touch", "Is touching {0}", "Test if in a touch and the touch point is over an object.", "IsTouchingObject");

AddCondition(5, 0,			"Device orientation supported", "Orientation & motion", "Device orientation is supported", "True if the device supports orientation detection.", "OrientationSupported");

AddCondition(6, 0,			"Device motion supported", "Orientation & motion", "Device motion is supported", "True if the device supports motion detection.", "MotionSupported");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Touch X position", "Touch", "X", "Get the touch X co-ordinate in the layout.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Touch Y position", "Touch", "Y", "Get the touch Y co-ordinate in the layout.");

AddExpression(2, ef_return_number, "Absolute touch X", "Touch", "AbsoluteX", "Get the touch X co-ordinate on the canvas.");
AddExpression(3, ef_return_number, "Absolute touch Y", "Touch", "AbsoluteY", "Get the touch Y co-ordinate on the canvas.");

AddExpression(4, ef_return_number, "Orientation alpha", "Orientation & motion", "Alpha", "The device compass direction, in degrees.");
AddExpression(5, ef_return_number, "Orientation beta", "Orientation & motion", "Beta", "The device front-to-back tilt, in degrees (front is positive).");
AddExpression(6, ef_return_number, "Orientation gamma", "Orientation & motion", "Gamma", "The device left-to-right tilt, in degrees (right is positive).");

AddExpression(7, ef_return_number, "X acceleration with gravity", "Orientation & motion", "AccelerationXWithG", "The device X acceleration with gravity, in m/s^2.");
AddExpression(8, ef_return_number, "Y acceleration with gravity", "Orientation & motion", "AccelerationYWithG", "The device Y acceleration with gravity, in m/s^2.");
AddExpression(9, ef_return_number, "Z acceleration with gravity", "Orientation & motion", "AccelerationZWithG", "The device Z acceleration with gravity, in m/s^2.");

AddExpression(10, ef_return_number, "X acceleration", "Orientation & motion", "AccelerationX", "The device X acceleration without gravity (if supported), in m/s^2.");
AddExpression(11, ef_return_number, "Y acceleration", "Orientation & motion", "AccelerationY", "The device Y acceleration without gravity (if supported), in m/s^2.");
AddExpression(12, ef_return_number, "Z acceleration", "Orientation & motion", "AccelerationZ", "The device Z acceleration without gravity (if supported), in m/s^2.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Use mouse input", "Yes", "Use mouse clicks as single-touch input (useful for testing).", "No|Yes")
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
}
