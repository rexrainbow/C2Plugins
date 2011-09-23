function GetPluginSettings()
{
	return {
		"name":			"TouchMouse",
		"id":			"MyTouchMouse",
		"description":	"Retrieve input from the mouse or touchscreen devices.",
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
AddComboParamOption("Left");
AddComboParamOption("Middle");
AddComboParamOption("Right");
AddComboParam("Mouse button", "Select the mouse button to check.");
AddComboParamOption("Clicked");
AddComboParamOption("Double-clicked");
//AddComboParamOption("Either single or double clicked");
AddComboParam("Click type", "Select which kind of click to check for.");
AddCondition(0,	cf_trigger, "On click", "Mouse", "On <b>{0}</b> button <b>{1}</b>", "Triggered when a mouse button clicked or double-clicked.", "OnClick");

AddCondition(1,	cf_trigger, "On any click", "Mouse", "On any click", "Triggered when any mouse button clicked or double-clicked.", "OnAnyClick");

AddComboParamOption("Left");
AddComboParamOption("Middle");
AddComboParamOption("Right");
AddComboParam("Mouse button", "Select the mouse button to check.");
AddCondition(2, 0, "Mouse button is down", "Mouse", "<b>{0}</b> button is down", "Test if a mouse button is currently held down.", "IsButtonDown");

AddComboParamOption("Left");
AddComboParamOption("Middle");
AddComboParamOption("Right");
AddComboParam("Mouse button", "Select the mouse button to check.");
AddCondition(3, cf_trigger, "On button released", "Mouse", "On <b>{0}</b> button released", "Triggered when a mouse button released.", "OnRelease");

//AddCondition(4,	cf_trigger, "On wheel up", "Mouse", "On wheel up", "Triggered when the mouse wheel rolled up.", "OnWheelUp");
//AddCondition(5,	cf_trigger, "On wheel down", "Mouse", "On wheel down", "Triggered when the mouse wheel rolled down.", "OnWheelDown");

AddComboParamOption("Left");
AddComboParamOption("Middle");
AddComboParamOption("Right");
AddComboParam("Mouse button", "Select the mouse button to check.");
AddComboParamOption("Clicked");
AddComboParamOption("Double-clicked");
//AddComboParamOption("Either single or double clicked");
AddComboParam("Click type", "Select which kind of click to check for.");
AddObjectParam("Object clicked", "Choose the object to check for a click on.");
AddCondition(6,	cf_trigger, "On object clicked", "Mouse", "On <b>{0}</b> button <b>{1}</b> on {2}", "Triggered when a mouse button clicked or double-clicked on an object.", "OnObjectClicked");

AddObjectParam("Object", "Choose the object to check for mouse over.");
AddCondition(7,	0, "Cursor is over object", "Mouse", "Cursor is over {0}", "Check if the mouse cursor is over an object.", "IsOverObject");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Mouse X position", "Cursor", "X", "Get the mouse cursor X co-ordinate in the layout.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Mouse Y position", "Cursor", "Y", "Get the mouse cursor Y co-ordinate in the layout.");

AddExpression(2, ef_return_number, "Absolute mouse X", "Cursor", "AbsoluteX", "Get the mouse cursor X co-ordinate on the canvas.");
AddExpression(3, ef_return_number, "Absolute mouse Y", "Cursor", "AbsoluteY", "Get the mouse cursor Y co-ordinate on the canvas.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
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
