function GetBehaviorSettings()
{
	return {
		"name":			"Touch Ctrl",
		"id":			"Rex_miniboard_touch",
		"description":	"Move miniboard by touch.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Mini board",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On touch start", "Touch", "On {my} touch start", "Triggered when touch start.", "OnTouchStart");
AddCondition(2,	cf_trigger, "On dragging start", "Drag", "On {my} drag start", "Triggered when miniboard drag start.", "OnDragStart");
AddCondition(3,	cf_trigger, "On dropped", "Drop", "On {my} drop", "Triggered when miniboard dropped.", "OnDrop"); 
AddCondition(4,	cf_trigger, "On logic index changed", "Drag", "On {my} logic index changed", "Triggered when logic index changed on main board.", "OnLogicIndexChanged");         
AddCondition(5,	0, "Drag-able", "Drag", "Is {my} drag-able", "Return true if this mini board is drag-able.", "IsDragable");  
       
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Drag-able", "Enable to drag this miniboard.",1);
AddAction(1, 0, "Set drag-able", "Drag & Drop", 
          "Set {my} drag-able to <i>{0}</i>", 
          "Set drag-able of this miniboard.", "SetDragable");         
AddAction(2, 0, "Force to drop", "Drop", "Force {my} to drop", 
          "Force the dragged object to drop.", "ForceDropp");    
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, 
              "Get logic X offset on main board", "Touch", "LX", 
              "Get logic X offset on main board. Return (-1) if not on any main board.");
AddExpression(2, ef_return_number, 
              "Get logic Y offset on main board", "Touch", "LY", 
              "Get logic Y offset on main board. Return (-1) if not on any main board.");
AddExpression(10, ef_return_number, "X co-ordinate of object's dragging start position", "Start", "StartX", "Get X co-ordinate of object's dragging start position.");
AddExpression(11, ef_return_number, "Y co-ordinate of object's dragging start position", "Start", "StartY", "Get Y co-ordinate of object's dragging start position.");
AddExpression(12, ef_return_number, "X co-ordinate of dragging start position", "Start", "DragStartX", "Get X co-ordinate of dragging start position.");
AddExpression(13, ef_return_number, "Y co-ordinate of dragging start position", "Start", "DragStartY", "Get Y co-ordinate of dragging start position.");    
ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_combo, "Drag-able", "Yes", "Enable to drag mini board.", "No|Yes"),
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
