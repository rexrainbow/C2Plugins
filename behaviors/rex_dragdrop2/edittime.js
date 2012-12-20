function GetBehaviorSettings()
{
	return {
		"name":			"Drag & Drop2",
		"id":			"Rex_DragDrop2",
		"version":		"1.0",        
		"description":	"Use the mouse to drag and drop an object",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", 
          "Enable the object's drag&drop behavior.", "SetActivated");
AddAction(1, 0, "Force to drop", "", "Force {my} to drop", 
          "Force the dragged object to drop.", "ForceDropp");          


//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On dragging start", "", "On {my} drag start", "Triggered when object drag start.", "OnDragStart");
AddCondition(1,	cf_deprecated | cf_trigger, "On dragging", "", "On {my} dragging", "Triggered when object dragging.", "OnDragging");             
AddCondition(2,	cf_trigger, "On dropped", "", "On {my} drop", "Triggered when object drop.", "OnDrop"); 
AddCondition(3,	0, "Is dragging", "", "Is {my} dragging", "Is object dragging.", "IsDragging");
AddCondition(4,	cf_trigger, "On dragging moving start", "", "On {my} dragging moving start", "Triggered when object dragging moving start.", "OnDragMoveStart"); 
AddCondition(5,	cf_trigger, "On dragging moving", "", "On {my} dragging moving", "Triggered when object dragging moving.", "OnDragMove"); 

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Mouse X position", "Position", "X", "Get the mouse cursor X co-ordinate in the layout.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Mouse Y position", "Position", "Y", "Get the mouse cursor Y co-ordinate in the layout.");
AddExpression(2, ef_return_number, "Absolute mouse X", "Position", "AbsoluteX", "Get the mouse cursor X co-ordinate on the canvas.");
AddExpression(3, ef_return_number, "Absolute mouse Y", "Position", "AbsoluteY", "Get the mouse cursor Y co-ordinate on the canvas.");
AddExpression(4, ef_return_number, "Get activated", "", "Activated", "The activated setting, 1 is activated.");
AddExpression(5, ef_return_number, "X co-ordinate of object's dragging start position", "Start", "StartX", "Get X co-ordinate of object's dragging start position.");
AddExpression(6, ef_return_number, "Y co-ordinate of object's dragging start position", "Start", "StartY", "Get Y co-ordinate of object's dragging start position.");
AddExpression(7, ef_return_number, "X co-ordinate of dragging start position", "Start", "DragStartX", "Get X co-ordinate of dragging start position.");
AddExpression(8, ef_return_number, "Y co-ordinate of dragging start position", "Start", "DragStartY", "Get Y co-ordinate of dragging start position.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Axis", "Both", "The axis this object can drag on.", "Both|Horizontal|Vertical"),
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
