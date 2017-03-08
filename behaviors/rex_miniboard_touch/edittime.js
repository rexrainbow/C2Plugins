function GetBehaviorSettings()
{
	return {
		"name":			"(Miniboard) Touch Ctrl",
		"id":			"Rex_miniboard_touch",
		"description":	"Drag & drop mini board.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_miniboard_touch.html",
		"category":		"Rex - Board - application - mini board",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2, cf_trigger, "On dragging start", "Drag", 
             "On {my} drag start", 
             "Triggered when miniboard dragging start.", "OnDragStart");
             
AddCondition(3, cf_trigger, "On dropped", "Drop", 
             "On {my} drop", "Triggered when miniboard dropped.", "OnDrop"); 
             
AddObjectParam("Main board", "Main board object.");              
AddCondition(4, cf_trigger, "On logical position changed", "Drag", 
             "On {my} logical position changed at main board <i>{0}</i>", 
             "Triggered when logical position changed on main board.", "OnLogicIndexChanged");
                      
AddCondition(5,	0, "Is drag-able", "Drag", 
             "Is {my} drag-able", 
             "Return true if this mini board is drag-able.", "IsDragable");  
             
AddCondition(6,	0, "Is touching", "Touch", 
             "Is {my} touching", 
             "Return true if this mini board is touching.", "IsTouching");
              
AddObjectParam("Main board", "Main board object.");              
AddCondition(7, cf_trigger, "On dropped at main board", "Drop", 
             "On {my} dropped at main board <i>{0}</i>", 
             "Triggered when dropped at main board.", "OnDropAtMainboard");

AddObjectParam("Main board", "Main board object."); 
AddCondition(8, cf_trigger, "On dragging at main board", "Drag", 
             "On {my} drag at main board <i>{0}</i>", 
             "Triggered when miniboard dragging at main board.", "OnDragAtMainboard");
             
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Enable", "Enable to drag this miniboard.",1);
AddAction(1, 0, "Set enable", "Drag & Drop", 
          "Set {my} drag-able to <i>{0}</i>", 
          "Set drag-able of this miniboard.", "SetDragable");         
AddAction(2, 0, "Drop", "Drop", 
          "Drop {my}", 
          "If currently being dragged, force the object to be dropped.", "ForceDropp");  
          
AddAction(3, 0, "Try to drag", "Drag", "Try drag {my}", 
          "Try to drag this object if is in touched.", "TryDrag");            
          
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Align", "Enable to align this miniboard to grids.",1);
AddAction(4, 0, "Set align mode", "Align", 
          "Set {my} align mode to <i>{0}</i>", 
          "Set align mode of this miniboard.", "SetAlign");             
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, 
              "Logical X of overlapped main board", "Main board", "LX", 
              "Get logical X overlapped main board. Return -1 if out of any main board.");
AddExpression(2, ef_return_number, 
              "Logical Y overlapped main board", "Main board", "LY", 
              "Get logical Y overlapped main board. Return -1 if out of any main board.");
AddExpression(3, ef_return_number, 
              "UID of overlapped main board", "Main board", "MBUID", 
              "Get UID of overlapped main board. Return -1 if out of any main board.");              
              
AddExpression(10, ef_return_number, 
              "X co-ordinate of object's dragging start position", "Start", "StartX", 
              "Get X co-ordinate of object's dragging start position.");
AddExpression(11, ef_return_number, 
              "Y co-ordinate of object's dragging start position", "Start", "StartY", 
              "Get Y co-ordinate of object's dragging start position.");
AddExpression(12, ef_return_number, 
              "X co-ordinate of dragging start position", "Start", "DragStartX", 
              "Get X co-ordinate of dragging start position.");
AddExpression(13, ef_return_number, 
              "Y co-ordinate of dragging start position", "Start", "DragStartY", 
              "Get Y co-ordinate of dragging start position.");
    
ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_combo, "Enable", "Yes", "Enable to drag mini board.", "No|Yes"),
    new cr.Property(ept_combo, "Align to grids", "Yes", "Enable to align mini board to grids.", "No|Yes"),    
    new cr.Property(ept_combo, "Drag Pull", "No", "Enable to pull out from main board when dragging start.", "No|Yes"),    
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
