function GetBehaviorSettings()
{
	return {
		"name":			"Monopoly movement",
		"id":			"Rex_MonopolyMovement",
		"version":		"0.1",        
		"description":	"Get forwading path on the board, used in Monopoly-like game.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Board: logic",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Object", "Object for picking");
AddCondition(1, 0, "Pop tile", "SOL: forwarding path", "Pop tile <i>{0}</i>", 
             "Pop one tile instance of forwarding path.", "PopInstance");
AddObjectParam("Object", "Object for picking");
AddCondition(2, 0, "Pop the last tile", "SOL: forwarding path", "Pop the last tile <i>{0}</i>", 
             "Pop the last tile of forwarding path. It will clean all tiles of forwarding path.", "PopLastInstance");
AddCondition(3, 0, "Empty", "Forwarding path", "Forwarding path is empty", 
             "Return ture if forwarding path is empty.", "IsForwardingPathEmpty");
AddCondition(7, cf_trigger, "On get moving cost", "Moving cost", 
            "On {my} get moving cos", 
            "Customize moving cost of each target tile.", "OnGetMoving");   		 
AddCondition(10, cf_trigger, "On forked road", "Forked road", 
            "{my} on forked road", 
            'Triggered when moving on forked road, assign direction by "action: Set face".', "OnForkedRoad");  
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Moving points", "Moving points.", 1);
AddAction(2, 0, "Get forwarding path", "Forwarding path", 
          "Get forwarding path with moving points to <i>{0}</i>", 
          "Get forwarding path.", "GetMovingPath");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Face to", "Face direction.", 0);
AddAction(3, 0, "Set face", "Face direction: square", "{my} set face to <i>{0}</i>", 
          "Set face direction in square board.", "SetFace");           
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Face to", "Face direction.", 0);
AddAction(4, 0, "Set face", "Face direction: hexagon", "{my} set face to <i>{0}</i>", 
          "Set face direction in hexagon board.", "SetFace");    
AddNumberParam("Face to", "Face direction.", 0);		  
AddAction(5, 0, "Set face by number", "Face direction", "{my} set face to <i>{0}</i>", 
          "Set face direction by number.", "SetFace");  
		  
AddNumberParam("Cost", "Moving cost. It could only assign 0 or 1.", 1);	
AddAction(7, 0, "Set moving cost", "Moving cost", "{my} set moving cost to <i>{0}</i>", 
          'Set moving cost. used under "condition:On get moving cost"', "SetMovingCost");
		  
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Face to", "Face direction.", 0);
AddAction(10, 0, "Set face", "Forked road: square", "{my} set face to <i>{0}</i>", 
          'Set face direction in square board. Used under "condition: On forked road"', "SetFaceOnForkedRoad");           
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Face to", "Face direction.", 0);
AddAction(11, 0, "Set face", "Forked road: hexagon", "{my} set face to <i>{0}</i>", 
          'Set face direction in hexagon board. Used under "condition: On forked road"', "SetFaceOnForkedRoad");    
AddNumberParam("Face to", "Face direction.", 0);		  
AddAction(12, 0, "Set face by number", "Forked road", "{my} set face to <i>{0}</i>", 
          'Set face direction by number.  Used under "condition: On forked road"', "SetFaceOnForkedRoad");    
AddComboParamOption("Forwarding");		  
AddComboParamOption("Random");
AddComboParam("Mode", "Direction selection on forked road .", 0);
AddAction(13, 0, "Set direction selection", "Forked road", "{my} set direction selection <i>{0}</i> on forked road", 
          "Set direction selection on forked road.", "SetDirectionSelection");
		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(10, ef_return_number, "Get UID of target tile", "Target tile", "TileUID", 
              'Get UID of target tile. Used under "condition: On forked road"');  
AddExpression(11, ef_return_number, "Get logic X of target tile", "Target tile", "TileLX", 
              'Get logic X of target tile. Used under "condition: On forked road"');  
AddExpression(12, ef_return_number, "Get logic Y of target tile", "Target tile", "TileLY", 
              'Get logic Y of target tile. Used under "condition: On forked road"');  
  
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Face to (Square)", "Right", "Face direction in square board.", "Right|Down|Left|Up"),
    new cr.Property(ept_combo, "Face to (Hexagon)", "Right", "Face direction in hexagon board.", "Right|Down-right|Down-left|Left|Up-left|Up-right"),    
    new cr.Property(ept_combo, "Forked road", "Forwarding", "Direction selection on forked road.", "Forwarding|Random"),
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
