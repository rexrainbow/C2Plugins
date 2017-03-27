function GetBehaviorSettings()
{
	return {
		"name":			"Touch area",
		"id":			"Rex_TouchArea2",
		"version":		"0.1",        
		"description":	"Get touch by tracking touchID.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_toucharea2.html",
		"category":		"Rex - Touch",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On touch start", "Touch", "{my} on touch start", "Triggered when touch input begins.", "OnTouchStart");
AddCondition(1, cf_trigger, "On touch end", "Touch", "{my} on touch end", "Triggered when touch input ends.", "OnTouchEnd");
AddCondition(2, 0, "Is in touch", "Touch", "{my} is in touch", "True if touch is currently in contact with this object.", "IsInTouch");
AddCondition(3, cf_trigger, "On touch moving", "Touch moving", "{my} on touch moving", "Triggered when touch and moving.", "OnTouchMoving");
AddCmpParam("Comparison", "Choose the way to compare drag-distance.");
AddNumberParam("Value", "The value to compare drag-distance to.");
AddCondition(4, 0, "Compare dragging distance", "Value", 
             "Drag-distance {my} {0} {1}", 
             "Compare the drag-distance.", 
             "CompareDragDistance");
AddCmpParam("Comparison", "Choose the way to compare drag-angle.");
AddNumberParam("Value", "The value to compare drag-angle to.");
AddCondition(5, 0, "Compare dragging angle", "Value", 
             "Drag-angle {my} {0} {1}", 
             "Compare the drag-angle.", 
             "CompareDragAngle");        
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Choose whether to enable or disable the behavior.");
AddAction(0, af_none, "Set enabled", "Enable", "Set {my} {0}", "Enable or disable the drag and drop behavior.", "SetEnabled");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Touch X position", "Current", "X", 
              "Get the touch X co-ordinate in this object. Return -1 if not in touch this object.");
AddExpression(1, ef_return_number, "Touch Y position", "Current", "Y", 
              "Get the touch Y co-ordinate in this object. Return -1 if not in touch this object.");
AddExpression(2, ef_return_number, "Touch start X position", "Start", "StartX", 
              "Get the touch start X co-ordinate in this object. Return -1 if not in touch this object.");
AddExpression(3, ef_return_number, "Touch start Y position", "Start", "StartY", 
              "Get the touch start Y co-ordinate in this object. Return -1 if not in touch this object.");
AddExpression(4, ef_return_number, "Drag-distance", "Polar", "Distance", 
              "Get the drag-distance from start point to current point. Return -1 if not in touch this object.");
AddExpression(5, ef_return_number, "Drag-angle", "Polar", "Angle", 
              "Get the drag-angle from start point to current point in degree. Return -1 if not in touch this object.");
AddExpression(6, ef_return_number, "Dragged unit vector X", "Polar", "VectorX", 
              "Get the dragged unit vector X.");
AddExpression(7, ef_return_number, "Dragged unit vector Y", "Polar", "VectorY", 
              "Get the dragged unit vector Y.");
AddExpression(8, ef_return_number, "Dragged delta X position in a tick", "Delta", "DeltaX", 
              "Get dragged delta X position by current X - previous X.");
AddExpression(9, ef_return_number, "Dragged delta Y position in a tick", "Delta", "DeltaY", 
              "Get dragged delta Y position by current Y - previous y.");
              
ACESDone();

// Property grid properties for this plugin
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
