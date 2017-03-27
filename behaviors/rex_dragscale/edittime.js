function GetBehaviorSettings()
{
	return {
		"name":			"Drag scale",
		"id":			"Rex_DragScale2",
		"version":		"0.1",        
		"description":	'Get scaling from two dragging points',
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_dragscale.html",
		"category":		"Input",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On dragging start", "Drag", "On {my} drag start", "Triggered when dragging start.", "OnDragStart");          
AddCondition(2,	cf_trigger, "On canceled", "Cancel", "On {my} canceled", "Triggered when dragging canceled.", "OnCanceled"); 
AddCondition(3,	0, "Is dragging", "Drag", "Is {my} dragging", "Is dragging.", "IsDragging");
AddCondition(4,	cf_trigger, "On dragging moving start", "Dragging moving", "On {my} dragging moving start", "Triggered when object dragging moving start.", "OnDragMoveStart"); 
AddCondition(5,	cf_trigger, "On dragging moving", "Dragging moving", "On {my} dragging moving", "Triggered when object dragging moving.", "OnDragMove"); 

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the drag scale behavior.",1);
AddAction(0, 0, "Set activated", "Active", "Set {my} activated to <i>{0}</i>", "Enable the object's drag scale behavior.", "SetActivated");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Auto scale", "Enable to auto scale instance size with dragging.",1);
AddAction(1, 0, "Set auto scale", "Auto scale", "Set {my} auto scale to <i>{0}</i>", "Enable to auto scale instance size with dragging.", "SetAutoScale");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Scaling", "Scale", "Scale", "Get scaling from dragging points.");
AddExpression(2, ef_return_number, "X co-ordinate of dragging point 0", "Dragging point", "P0X", "Get the X co-ordinate of dragging point 0.");
AddExpression(3, ef_return_number, "Y co-ordinate of dragging point 0", "Dragging point", "P0Y", "Get the Y co-ordinate of dragging point 0.");
AddExpression(4, ef_return_number, "X co-ordinate of dragging point 1", "Dragging point", "P1X", "Get the X co-ordinate of dragging point 1.");
AddExpression(5, ef_return_number, "Y co-ordinate of dragging point 1", "Dragging point", "P1Y", "Get the Y co-ordinate of dragging point 1.");

AddExpression(11, ef_return_string, "Current state", "State", "CurState", "Get current state.");
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Auto scale", "No", "Auto scale instance size with dragging.", "No|Yes"),
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
