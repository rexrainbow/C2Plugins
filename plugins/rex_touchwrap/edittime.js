function GetPluginSettings()
{
	return {
		"name":			"Touch wrap",
		"id":			"rex_TouchWrap",
		"version":		"0.1",
		"description":	"A wrap from official Touch plugin to export touch/mouse input to other plugins.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_touchwrap.html",
		"category":		"Rex - Touch",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On any touch start", "Touch", "On any touch start", "Triggered when any touch input begins.", "OnTouchStart");
AddCondition(1, cf_trigger, "On any touch end", "Touch", "On any touch end", "Triggered when any touch input ends.", "OnTouchEnd");
AddCondition(2, 0,			"Is in touch", "Touch", "Is in touch", "True if any touch is currently in contact with the device.", "IsInTouch");

AddObjectParam("Object", "Choose the object to check for touch.");
AddCondition(3,	cf_trigger, "On touched object", "Touch", "On touched {0}", "Triggered when an object is touched.", "OnTouchObject");

AddObjectParam("Object", "Choose the object to check for being touched.");
AddCondition(4, 0,			"Is touching object", "Touch", "Is touching {0}", "Test if in a touch and the touch point is over an object.", "IsTouchingObject");

AddCondition(5, cf_deprecated,			"Device orientation supported", "Orientation & motion", "Device orientation is supported", "True if the device supports orientation detection.", "OrientationSupported");

AddCondition(6, cf_deprecated,			"Device motion supported", "Orientation & motion", "Device motion is supported", "True if the device supports motion detection.", "MotionSupported");

AddNumberParam("Touch index", "The zero-based index of the touch to test the speed for.  0 is the first touch.");
AddCmpParam("Comparison", "How to compare the touch speed.");
AddNumberParam("Speed", "Speed to compare to, in absolute pixels per second.");
AddCondition(7, 0,			"Compare touch speed", "Touch", "Touch <b>{0}</b> speed {1} <b>{2}</b>", "Compare the speed of a touch, e.g. to detect a swipe.", "CompareTouchSpeed");

AddComboParamOption("Alpha");
AddComboParamOption("Beta");
AddComboParamOption("Gamma");
AddComboParam("Orientation", "Choose the orientation to compare (alpha = compass direction, beta = front-to-back tilt, gamma = left-to-right tilt).");
AddCmpParam("Comparison", "How to compare the orientation.");
AddNumberParam("Angle", "The orientation to compare to, in degrees.")
AddCondition(8, 0,			"Compare orientation", "Orientation & motion", "<b>{0}</b> orientation {1} <b>{2}</b>", "Compare the current orientation (or tilt) of the device.", "CompareOrientation");

AddComboParamOption("X (with gravity)");
AddComboParamOption("Y (with gravity)");
AddComboParamOption("Z (with gravity)");
AddComboParamOption("X (without gravity)");
AddComboParamOption("Y (without gravity)");
AddComboParamOption("Z (without gravity)");
AddComboParam("Axis", "Choose the axis to compare acceleration for, and whether the measurement should include the force of gravity.");
AddCmpParam("Comparison", "How to compare the acceleration.");
AddNumberParam("Acceleration", "The acceleration to compare to, in m/s^2.");
AddCondition(9, 0,			"Compare acceleration", "Orientation & motion", "{0} acceleration {1} <b>{2}</b>", "Compare the acceleration of the device along an axis.", "CompareAcceleration");

AddNumberParam("Touch number", "Enter a zero-based index of the touch to test, e.g. 0 for first touch, 1 for second, etc.");
AddCondition(10, cf_trigger, "On Nth touch start", "Touch", "On touch {0} start", "Triggered when a particular touch input begins.", "OnNthTouchStart");

AddNumberParam("Touch number", "Enter a zero-based index of the touch to test, e.g. 0 for first touch, 1 for second, etc.");
AddCondition(11, cf_trigger, "On Nth touch end", "Touch", "On touch {0} end", "Triggered when a particular touch input ends.", "OnNthTouchEnd");

AddNumberParam("Touch number", "Enter a zero-based index of the touch to test, e.g. 0 for first touch, 1 for second, etc.");
AddCondition(12, 0,			"Has Nth touch", "Touch", "Has touch {0}", "True if a particular touch is currently in contact with the device.", "HasNthTouch");

AddCondition(13, cf_trigger, "On hold",		"Gestures", "On hold gesture", "Triggered when a touch held in the same place for a time.", "OnHoldGesture");

AddCondition(14, cf_trigger, "On tap",		"Gestures", "On tap gesture", "Triggered when a touch is quickly released from its start location.", "OnTapGesture");

AddCondition(15, cf_trigger, "On double-tap",	"Gestures", "On double-tap gesture", "Triggered when two taps occur in quick succession.", "OnDoubleTapGesture");

AddObjectParam("Object", "Choose the object to check.");
AddCondition(16, cf_trigger, "On hold over object",		"Gestures", "On hold gesture over {0}", "Triggered when a hold gesture is made over an object.", "OnHoldGestureObject");

AddObjectParam("Object", "Choose the object to check.");
AddCondition(17, cf_trigger, "On tap object",		"Gestures", "On tap gesture on {0}", "Triggered when a tap gesture is made on an object.", "OnTapGestureObject");

AddObjectParam("Object", "Choose the object to check.");
AddCondition(18, cf_trigger, "On double-tap object",	"Gestures", "On double-tap gesture on {0}", "Triggered when a double-tap gesture is made on an object.", "OnDoubleTapGestureObject");

// ----
AddObjectParam("Object", "Choose the object to check for touch released.");
AddCondition(101, cf_trigger, "On touch released at object", "Touch released", "On touch released at {0}", 
             "Triggered when an object is touch released.", "OnTouchReleasedObject");

////////////////////////
AddComboParamOption("Off");
AddComboParamOption("On");
AddComboParam("Enable", "Enable the touch detecting.");
AddAction(100, 0, "Set enable", "Enable", "Set touch enable to <i>{0}</i>", 
          "Set touch enable.", "SetEnable");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Touch X position", "Touch", "X", "Get the primary touch X co-ordinate in the layout.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Touch Y position", "Touch", "Y", "Get the primary touch Y co-ordinate in the layout.");

AddExpression(2, ef_return_number, "Absolute touch X", "Touch", "AbsoluteX", "Get the primary touch X co-ordinate on the canvas.");
AddExpression(3, ef_return_number, "Absolute touch Y", "Touch", "AbsoluteY", "Get the primary touch Y co-ordinate on the canvas.");

AddExpression(4, ef_return_number, "Orientation alpha", "Orientation & motion", "Alpha", "The device compass direction, in degrees.");
AddExpression(5, ef_return_number, "Orientation beta", "Orientation & motion", "Beta", "The device front-to-back tilt, in degrees (front is positive).");
AddExpression(6, ef_return_number, "Orientation gamma", "Orientation & motion", "Gamma", "The device left-to-right tilt, in degrees (right is positive).");

AddExpression(7, ef_return_number, "X acceleration with gravity", "Orientation & motion", "AccelerationXWithG", "The device X acceleration with gravity, in m/s^2.");
AddExpression(8, ef_return_number, "Y acceleration with gravity", "Orientation & motion", "AccelerationYWithG", "The device Y acceleration with gravity, in m/s^2.");
AddExpression(9, ef_return_number, "Z acceleration with gravity", "Orientation & motion", "AccelerationZWithG", "The device Z acceleration with gravity, in m/s^2.");

AddExpression(10, ef_return_number, "X acceleration", "Orientation & motion", "AccelerationX", "The device X acceleration without gravity (if supported), in m/s^2.");
AddExpression(11, ef_return_number, "Y acceleration", "Orientation & motion", "AccelerationY", "The device Y acceleration without gravity (if supported), in m/s^2.");
AddExpression(12, ef_return_number, "Z acceleration", "Orientation & motion", "AccelerationZ", "The device Z acceleration without gravity (if supported), in m/s^2.");

AddExpression(13, ef_return_number, "", "Touch", "TouchCount", "Get the number of current touches.");

AddNumberParam("Index", "Zero-based index of the touch to get.");
AddExpression(14, ef_return_number | ef_variadic_parameters, "", "Touch", "XAt", "Get a touch X co-ordinate in the layout from a zero-based index of the touch.");
AddNumberParam("Index", "Zero-based index of the touch to get.");
AddExpression(15, ef_return_number | ef_variadic_parameters, "", "Touch", "YAt", "Get a touch Y co-ordinate in the layout from a zero-based index of the touch.");

AddNumberParam("Index", "Zero-based index of the touch to get.");
AddExpression(16, ef_return_number, "", "Touch", "AbsoluteXAt", "Get a touch X co-ordinate on the canvas from a zero-based index of the touch.");
AddNumberParam("Index", "Zero-based index of the touch to get.");
AddExpression(17, ef_return_number, "", "Touch", "AbsoluteYAt", "Get a touch Y co-ordinate on the canvas from a zero-based index of the touch.");

AddNumberParam("Index", "Zero-based index of the touch to get.");
AddExpression(18, ef_return_number, "", "Touch", "SpeedAt", "Get the speed of a touch, in absolute (screen) pixels per second.");

AddNumberParam("Index", "Zero-based index of the touch to get.");
AddExpression(19, ef_return_number, "", "Touch", "AngleAt", "Get the angle of motion of a touch, in degrees.");

AddExpression(20, ef_return_number, "", "Touch", "TouchIndex", "Get the index of the current touch.");

AddExpression(21, ef_return_number, "", "Touch", "TouchID", "Get the unique ID of the current touch.");

AddNumberParam("ID", "ID of the touch to get.");
AddExpression(22, ef_return_number | ef_variadic_parameters, "", "Touch", "XForID", "Get a touch X co-ordinate in the layout for a touch with a specific ID.");
AddNumberParam("ID", "ID of the touch to get.");
AddExpression(23, ef_return_number | ef_variadic_parameters, "", "Touch", "YForID", "Get a touch Y co-ordinate in the layout for a touch with a specific ID.");

AddNumberParam("ID", "ID of the touch to get.");
AddExpression(24, ef_return_number, "", "Touch", "AbsoluteXForID", "Get a touch X co-ordinate on the canvas for a touch with a specific ID.");
AddNumberParam("ID", "ID of the touch to get.");
AddExpression(25, ef_return_number, "", "Touch", "AbsoluteYForID", "Get a touch Y co-ordinate on the canvas for a touch with a specific ID.");

AddNumberParam("ID", "ID of the touch to get.");
AddExpression(26, ef_return_number, "", "Touch", "SpeedForID", "Get the speed of a touch with a specific ID, in absolute (screen) pixels per second.");

AddNumberParam("ID", "ID of the touch to get.");
AddExpression(27, ef_return_number, "", "Touch", "AngleForID", "Get the angle of motion of a touch with a specific ID, in degrees.");

AddNumberParam("ID", "ID of the touch to get.");
AddExpression(28, ef_return_number, "", "Touch", "WidthForID", "Get the width of a touch with a specific ID.");
AddNumberParam("ID", "ID of the touch to get.");
AddExpression(29, ef_return_number, "", "Touch", "HeightForID", "Get the height of a touch with a specific ID.");
AddNumberParam("ID", "ID of the touch to get.");
AddExpression(30, ef_return_number, "", "Touch", "PressureForID", "Get the pressure (from 0 to 1) of a touch with a specific ID.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Use mouse input", "Yes", "Use mouse clicks as single-touch input (useful for testing).", "No|Yes"),
	new cr.Property(ept_combo, "Enable", "Yes", "Enable touch detecting.", "No|Yes")
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
