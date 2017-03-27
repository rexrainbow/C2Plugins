function GetBehaviorSettings()
{
	return {
		"name":			"Drag & Drop2",
		"id":			"Rex_DragDrop2",
		"version":		"1.0",        
		"description":	"Drag and drop this object",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_dragdrop2.html",
		"category":		"Rex - Touch",
		"flags":		bf_onlyone
	};
};
           
//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On dragging start", "Drag", "On {my} drag start", "Triggered when object drag start.", "OnDragStart");
AddCondition(1,	cf_deprecated, "On dragging", "Drag", "On {my} dragging", "On object dragging.", "IsDragging");             
AddCondition(2,	cf_trigger, "On dropped", "Drop", "On {my} drop", "Triggered when object dropped.", "OnDrop"); 
AddCondition(3,	0, "Is dragging", "Drag", "Is {my} dragging", "Is object dragging.", "IsDragging");
AddCondition(4,	cf_trigger, "On dragging moving start", "Dragging moving", 
             "On {my} dragging moving start", 
             "Triggered when object dragging moving start.", "OnDragMoveStart"); 
AddCondition(5,	cf_deprecated, "On dragging moving", "Dragging moving", "On {my} dragging moving", "Triggered when object dragging moving.", "OnDragMove"); 
AddCondition(6,	0, "Is dragging moving", "Dragging moving", 
             "Is {my} dragging moving", 
             "Is object dragging moving.", "IsDraggingMoving");
AddCondition(7,	cf_trigger, "On dragging moving end", "Dragging moving", 
             "On {my} dragging moving end", 
             "Triggered when object dragging moving end.", "OnDragMoveEnd"); 
AddCmpParam("Comparison", "Choose the way to compare drag-distance.");
AddNumberParam("Length", "The length to compare the drag-distance to, in pixels.");
AddCondition(8, 0, "Compare drag-distance", "Drag-distance", 
             "{my} drag-distance {0} {1}", 
             "Compare drag-distance.", "CompareDragDistance");	
AddCmpParam("Comparison", "Choose the way to compare drag-distance.");
AddNumberParam("Angle", "The angle to compare the drag-angle to, in degrees.");
AddCondition(9, 0, "Compare drag-angle", "Drag-angle", 
             "{my} drag-angle {0} {1}", 
             "Compare drag-angle.", "CompareDragAngle");	

AddCondition(11,	0, "Is enabled", "Enable", 
             "Is {my} enabled", 
             "Is behavior enabled.", "IsEnabled");		

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Choose whether to enable or disable the behavior.");
AddAction(0, af_none, "Set enable", "Enable", "Set {my} {0}", "Enable or disable the drag and drop behavior.", "SetEnabled");
          
AddAction(1, 0, "Drop", "Drop", "Drop {my}", 
          "If currently being dragged, force the object to be dropped.", 
          "ForceDrop");          
AddAction(2, 0, "Try to drag", "Drag", "Try drag {my}", 
          "Try to drag this object if is in touched.", "TryDrag"); 
          
AddNumberParam("Angle", "Axis angle, in degrees.", 0);              
AddAction(3, 0, "Set angle", "Axis", "Set {my} axis-angle to <i>{0}</i>", 
          "Set axis angle.", "SetAxisAngle");           
                      
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Touch X position", "Position", "X", "Get the touch X co-ordinate in the layout.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Touch Y position", "Position", "Y", "Get the touch Y co-ordinate in the layout.");

// ef_deprecated
AddExpression(2, ef_deprecated | ef_return_number, "Absolute mouse X", "Position", "AbsoluteX", "Get the touch X co-ordinate on the canvas.");
AddExpression(3, ef_deprecated| ef_return_number, "Absolute mouse Y", "Position", "AbsoluteY", "Get the touch Y co-ordinate on the canvas.");
// ef_deprecated

AddExpression(4, ef_return_number, "Get activated", "", "Activated", "The activated setting, 1 is activated.");

// ef_deprecated
AddExpression(5, ef_deprecated | ef_return_number, "X co-ordinate of object's dragging start position", "Start", "StartX", "Get X co-ordinate of object's position at dragging start.");
AddExpression(6, ef_deprecated | ef_return_number, "Y co-ordinate of object's dragging start position", "Start", "StartY", "Get Y co-ordinate of object's position at dragging start.");
// ef_deprecated

AddExpression(7, ef_return_number, "X co-ordinate of dragging start position", "Start", "DragStartX", "Get X co-ordinate of dragging start position.");
AddExpression(8, ef_return_number, "Y co-ordinate of dragging start position", "Start", "DragStartY", "Get Y co-ordinate of dragging start position.");
AddExpression(9, ef_return_number, "X co-ordinate of object's dragging start position", "Instance start", "InstStartX", "Get X co-ordinate of object's position at dragging start.");
AddExpression(10, ef_return_number, "Y co-ordinate of object's dragging start position", "Instance start", "InstStartY", "Get Y co-ordinate of object's position at dragging start.");
AddExpression(11, ef_return_number, "Distance between current touch position to drag-start position", "Drag-distance", "DragDistance", "Get distance between current touch position to drag-start position.");
AddExpression(12, ef_return_number, "Angle of dragging", "Drag-angle", "DragAngle", "Get angle of dragging.");
AddExpression(13, ef_return_number, "Angle of axis", "Axis", "AxisAngle", "Get angle of axis.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Axis", "Both", "The axis this object can drag on.", "Both|Horizontal|Vertical"),
    new cr.Property(ept_float, "Axis angle", 0, "Offset angle of dragging axis."),
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
