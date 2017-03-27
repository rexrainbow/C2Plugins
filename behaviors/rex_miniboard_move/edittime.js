function GetBehaviorSettings()
{
	return {
		"name":			"(Miniboard) Grid move",
		"id":			"Rex_miniboard_move",
		"version":		"0.1",
		"description":	"Move mini board logically and physically on main board.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_miniboard_move.html",
		"category":		"Rex - Board - application - mini board",
		"flags":		0	
						| bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target position", "Hit target", 
             "On {my} hit target", 
			 "Triggered when hit target position.", 
			 "OnHitTarget");    		                  
AddCondition(3,	0, "Is moving", "Move", 
             "Is {my} moving", 
             "Test if object is moving.", "IsMoving");  
AddCondition(4,	cf_trigger, "On moving accepted", "Request", 
             "On {my} moving request accepted", 
             "Triggered when moving request accepted.", "OnMovingRequestAccepted");                
AddCondition(5,	cf_trigger, "On moving rejected", "Request", 
             "On {my} moving request rejected", 
             "Triggered when moving request rejected.", "OnMovingRequestRejected");                          
AddCondition(6,	0, "Moving accepted", "Request", 
             "Is {my} moving request accepted", 
             "Return true if moving request accepted.", "IsMovingRequestAccepted"); 
AddNumberParam("X offset", "Relatived X offset.",0);
AddNumberParam("Y offset", "Relatived Y offset.",0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1); 
AddCondition(7,	0, "Can move to", "Test", 
             "{my} can move to offset [<i>{0}</i>, <i>{1}</i>], test mode: <i>{2}</i>",  
             "Test if object can move to relatived offset target.", "TestMoveToOffset");
AddNumberParam("Direction", "The direction of neighbor.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);		  
AddCondition(8, 0, "Can move to neighbor", "Request", 
             "{my} can move to direction <i>{0}</i>, test mode: <i>{1}</i>",
             "Test if object can move to neighbor.", "TestMoveToNeighbor");              
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParamOption("Right-down");		  
AddComboParamOption("Left-down");
AddComboParamOption("Left-up");
AddComboParamOption("Right-up");
AddComboParam("Direction", "Moving direction.", 0); 
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);          
AddCondition(9,	0, "Can move to neighbor", "Test: Square grid", 
             "{my} can move to <i>{0}</i>, test mode: <i>{1}</i>", 
             "Test if object can move to neighbor.", "TestMoveToNeighbor");  
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);              
AddCondition(10, 0, "Can move to neighbor", "Test: Hexagon grid (Left-Right)", 
             "{my} can move to <i>{0}</i>, test mode: <i>{1}</i>",  
             "Test if object can move to neighbor.", "TestMoveToNeighbor");      
AddComboParamOption("Down-right");
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0); 
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);               
AddCondition(13, 0, "Can move to neighbor", "Test: Hexagon grid (Up-Down)", 
             "{my} can move to <i>{0}</i>, test mode: <i>{1}</i>",   
             "Test if object can move to neighbor.", "TestMoveToNeighbor");  
             
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "Activated", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's Square-grid Move behavior.", "SetActivated");
AddComboParamOption("Right");
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParamOption("Right-down");		  
AddComboParamOption("Left-down");
AddComboParamOption("Left-up");
AddComboParamOption("Right-up");
AddComboParam("Direction", "Moving direction.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(1, 0, "Move to neighbor", "Request: Square grid", 
          "{my} move to <i>{0}</i>, test mode: <i>{1}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
AddNumberParam("X offset", "Relatived X offset.",0);
AddNumberParam("Y offset", "Relatived Y offset.",0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(2, 0, "Move to offset", "Request", 
          "{my} move to offset [<i>{0}</i>, <i>{1}</i>], test mode: <i>{2}</i>", 
          "Move to relatived offset target.", "MoveToOffset");        
AddNumberParam("Max speed", "Maximum speed, in pixel per second.", 400);
AddAction(3, 0, "Set maximum speed", "Speed", 
          "Set {my} maximum speed to <i>{0}</i>", 
          "Set the object's maximum speed.", "SetMaxSpeed");
AddNumberParam("Acceleration", "The acceleration setting, in pixel per second per second.", 0);
AddAction(4, 0, "Set acceleration", "Speed", 
          "Set {my} acceleration to <i>{0}</i>", 
          "Set the object's acceleration.", "SetAcceleration");
AddNumberParam("Deceleration", "The deceleration setting, in pixels per second per second.", 0);
AddAction(5, 0, "Set deceleration", "Speed", 
          "Set {my} deceleration to <i>{0}</i>", 
          "Set the object's deceleration.", "SetDeceleration");    
AddNumberParam("Current speed", "Current speed, in pixel per second.", 400);
AddAction(6, 0, "Set current speed", "Speed", 
          "Set {my} current speed to <i>{0}</i>", 
          "Set the object's Current speed.", "SetCurrentSpeed");  
AddNumberParam("Logic X", "The X index (0-based).", 0);
AddNumberParam("Logic Y", "The Y index (0-based).", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(7, 0, "Move to LXY", "Request", 
          "{my} move to [<i>{0}</i>, <i>{1}</i>], test mode: <i>{2}</i>", 
          "Move to logical position.", "MoveToLXY"); 
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(9, 0, "Move to neighbor", "Request: Hexagon grid (Left-Right)", 
          "{my} move to <i>{0}</i> (<i>{1}</i>), test mode: <i>{2}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
AddNumberParam("Direction", "The direction of neighbor.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);  
AddAction(10, 0, "Move to neighbor", "Request", 
           "{my} move to direction <i>{0}</i>, test mode: <i>{1}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
AddObjectParam("Target", "Target object.");
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(11, 0, "Move to chess", "Request", 
          "{my} move to <i>{0}</i>, test mode: <i>{1}</i>", 
          "Move to target chess/tile.", "MoveToTargetChess");    
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(23, 0, "Move to neighbor", "Request: Hexagon grid (Up-Down)", 
           "{my} move to <i>{0}</i>, test mode: <i>{1}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 	 
AddAction(30, 0, "Stop", "Stop", "{my} stop", 
          "Stop moving.", "Stop");             
AddNumberParam("UID", "Target chess UID", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(40, 0, "Move to chess by UID", "Request", 
           "{my} move to chess UID: <i>{0}</i>, test mode: <i>{1}</i>", 
          "Move to target chess/tile.", "MoveToTargetChess");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get current speed", "Current", "Speed", 
              "The current object speed, in pixel per second.");
AddExpression(2, ef_return_number, "Get max speed", "Setting", "MaxSpeed", 
              "The maximum speed setting, in pixel per second.");
AddExpression(3, ef_return_number, "Get acceleration", "Setting", "Acc", 
              "The acceleration setting, in pixel per second per second.");
AddExpression(4, ef_return_number, "Get deceleration", "Setting", "Dec", 
              "The deceleration setting, in pixel per second per second.");
AddExpression(5, ef_return_number, "Get target position X", "Target", "TargetX", 
              "The X co-ordinate of target position to move toward.");
AddExpression(6, ef_return_number, "Get target position Y", "Target", "TargetY", 
              "The Y co-ordinate of target position to move toward."); 
AddExpression(9, ef_return_number, "Get moving direction", "Request", "Direction", 
              "Get last moving direction of moving request. Return (-1) if not moving to neighbor.");
AddExpression(10, ef_return_number, "Get logic X of destination", "Request", "DestinationLX", 
              "Get logic X of destination X when moving request.");  
AddExpression(11, ef_return_number, "Get logic Y of destination", "Request", "DestinationLY", 
              "Get logic Y of destination when moving request.");  
AddExpression(13, ef_return_number, "Get logic X of source", "Request", "SourceLX", 
              "Get logic X of source when moving request.");               
AddExpression(14, ef_return_number, "Get logic Y of source", "Request", "SourceLY", 
              "Get logic Y of source when moving request.");               
              
ACESDone();

var property_list = [    
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                          
	new cr.Property(ept_float, "Max speed", 400, "Maximum speed, in pixel per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Acceleration, in pixel per second per second."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Deceleration, in pixel per second per second."), 
    new cr.Property(ept_combo, "MoveTo", "Yes", 
                    "Set Yes to move physically by built-in moveTo behavior. Set No will only change the logical position.", "No|Yes"),                      
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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
