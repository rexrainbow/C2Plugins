function GetBehaviorSettings()
{
	return {
		"name":			"Monopoly movement",
		"id":			"Rex_MonopolyMovement",
		"version":		"0.1",        
		"description":	"Get forwarding path on the board, used in Monopoly-like game.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_monopoly_movement.html",
		"category":		"Rex - Board - application",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Object", "Object for picking");
AddCondition(1, 0, "Pop tile", "SOL: forwarding path", "{my} pop tile <i>{0}</i>", 
             "Pop one tile instance of forwarding path.", "PopInstance");
AddObjectParam("Object", "Object for picking");
AddCondition(2, 0, "Pop the last tile", "SOL: forwarding path", "{my} pop the last tile <i>{0}</i>", 
             "Pop the last tile of forwarding path. It will clean all tiles of forwarding path.", "PopLastInstance");
AddCondition(3, 0, "Empty", "Forwarding path", "{my} forwarding path is empty", 
             "Return ture if forwarding path is empty.", "IsForwardingPathEmpty");
AddCondition(7, cf_trigger, "On get moving cost", "Moving cost", 
            "{my} on get moving cos", 
            "Customize moving cost of each target tile.", "OnGetMovingCost");   
AddCondition(8, cf_trigger, "On get solid", "Solid", 
            "{my} on get solid", 
            "Customize solid of each target tile.", "OnGetSolid");   				
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
AddAction(4, 0, "Set face", "Face direction: Left-Right hexagon", "{my} set face to <i>{0}</i>", 
          "Set face direction in hexagon board.", "SetFace");    
AddNumberParam("Face to", "Face direction.", 0);		  
AddAction(5, 0, "Set face by number", "Face direction", "{my} set face to <i>{0}</i>", 
          "Set face direction by number.", "SetFace");  
AddNumberParam("Cost", "Moving cost.", 1);	
AddAction(7, 0, "Set cost", "Moving cost", "{my} set moving cost to <i>{0}</i>", 
          'Set moving cost. used under "condition:On get moving cost"', "SetMovingCost");  
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Face to", "Face direction.", 0);
AddAction(20, af_deprecated, "Set face", "Forked road: square", "{my} set face to <i>{0}</i>", 
          'Set face direction in square board. Used under "condition: On forked road"', "SetFaceOnForkedRoad");           
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Face to", "Face direction.", 0);
AddAction(21, af_deprecated, "Set face", "Forked road: Left-Right hexagon", "{my} set face to <i>{0}</i>", 
          'Set face direction in hexagon board. Used under "condition: On forked road"', "SetFaceOnForkedRoad");    
AddNumberParam("Face to", "Face direction.", 0);		  
AddAction(22, af_deprecated, "Set face by number", "Forked road", "{my} set face to <i>{0}</i>", 
          'Set face direction by number.  Used under "condition: On forked road"', "SetFaceOnForkedRoad");    
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Solid", "Solid property.",0);
AddAction(30, 0, "Set solid", "Solid", 
          "{my} set solid to <i>{0}</i>", 
          "Set solid. Used under 'condition: On get solid'.", "SetDestinationSolid");
AddNumberParam("Solid", "Solid property. 0=Disable, 1=Enable.", 0);
AddAction(31, 0, "Set solid by number", "Solid", 
          "{my} set solid to <i>{0}</i>", 
          "Set solid. Used under 'condition: On get solid'.", "SetDestinationSolid");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Move-able", "Move-able.",1);
AddAction(32, 0, "Set move-able", "Solid", 
          "{my} set move-able to <i>{0}</i>", 
          "Set move-able. Used under 'condition: On get solid'.", "SetDestinationMoveable");
AddNumberParam("Move-able", "Move-able. 0=Disable, 1=Enable.", 0);
AddAction(33, 0, "Set move-able by number", "Solid", 
          "{my} set move-able to <i>{0}</i>", 
          "Set move-able. Used under 'condition: On get solid'.", "SetDestinationMoveable"); 
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Face to", "Face direction.", 0);
AddAction(34, 0, "Set face", "Face direction: Up-Down hexagon", "{my} set face to <i>{0}</i>", 
          "Set face direction in hexagon board.", "SetFace");             
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Face to", "Face direction.", 0);
AddAction(35, af_deprecated, "Set face", "Forked road: Up-Down hexagon", "{my} set face to <i>{0}</i>", 
          'Set face direction in hexagon board. Used under "condition: On forked road"', "SetFaceOnForkedRoad");  
          
AddComboParamOption("Forwarding");		  
AddComboParamOption("Random");
AddComboParam("Mode", "Direction selection on forked road .", 0);
AddAction(40, 0, "Set direction selection", "Forked road", "{my} set direction selection <i>{0}</i> on forked road", 
          "Set direction selection on forked road.", "SetDirectionSelection");
AddObjectParam("Random generator", "Random generator object");
AddAction(41, 0, "Set random generator", "Random", 
          "Set random generator object to <i>{0}</i>", 
          "Set random generator object.", "SetRandomGenerator");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get face direction", "Moving result", "TargetFaceDir", 
              "Get the latest face direction");  
AddExpression(2, ef_return_number, "Get target logic X", "Moving result", "TargetLX", 
              "Get target logic X of the latest moving result");  
AddExpression(3, ef_return_number, "Get target logic Y", "Moving result", "TargetLY", 
              "Get target logic Y of the latest moving result");          
AddExpression(10, ef_return_any, "Get UID of target tile", "Target tile", "TileUID", 
              'Get UID of target tile. Used under "condition: On get moving cost", "condition: On forked road", "condition: On get solid"');  
AddExpression(11, ef_return_number, "Get logic X of target tile", "Target tile", "TileLX", 
              'Get logic X of target tile. Used under "condition: On get moving cost", "condition: On forked road", "condition: On get solid"');  
AddExpression(12, ef_return_number, "Get logic Y of target tile", "Target tile", "TileLY", 
              'Get logic Y of target tile. Used under "condition: On get moving cost", "condition: On forked road", "condition: On get solid"');  
              
AddExpression(21, ef_return_number, "Get total moving points", "Moving ponts", "TotalMovingPoints", 
              "Get total moving points of current moving."); 

AddExpression(30, ef_return_number,
              "STOP property used in cost function", "Moving cost", "STOP",
              'STOP property used in cost function, used in action:"Set moving cost". The value is (-1)');   
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Face to (Square)", "Right", "Face direction in square board.", "Right|Down|Left|Up"),
    new cr.Property(ept_combo, "Face to (Hexagon Up-Down)", "Down-right", "Face direction in Up-Down hexagon board.", "Down-right|Down|Down-left|Up-left|Up|Up-right"),     
    new cr.Property(ept_combo, "Face to (Hexagon Left-Right)", "Right", "Face direction in Left-Right hexagon board.", "Right|Down-right|Down-left|Left|Up-left|Up-right"), 
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
