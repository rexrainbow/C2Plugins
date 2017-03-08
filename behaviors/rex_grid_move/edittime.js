function GetBehaviorSettings()
{
	return {
		"name":			"Grid Move",
		"id":			"Rex_GridMove",
		"version":		"0.1",        
		"description":	"Move sprite to neighbor on board object",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_grid_move.html",
		"category":		"Rex - Board - application",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On reach target position", "Reach", 
             "On {my} reach target", 
			 "Triggered when reach target position.", 
			 "OnHitTarget");
AddCondition(2,	cf_deprecated | cf_trigger, "On moving", "Move", 
             "On {my} moving", 
             "Triggered when object moving.", "OnMoving");                          
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
AddCondition(7,	0, "Can move to", "Test", 
             "{my} can move to offset [<i>{0}</i>, <i>{1}</i>]", 
             "Test if object can move to relatived offset target.", "TestMoveToOffset");
AddNumberParam("Direction", "The direction of neighbor.", 0);		  
AddCondition(8, 0, "Can move to neighbor", "Request", 
             "{my} can move to direction <i>{0}</i>", 
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
AddCondition(9,	0, "Can move to neighbor", "Test: Square grid", 
             "{my} can move to <i>{0}</i>", 
             "Test if object can move to neighbor.", "TestMoveToNeighbor");   
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);             
AddCondition(10, 0, "Can move to neighbor", "Test: Hexagon grid (Left-Right)", 
             "{my} can move to <i>{0}</i>", 
             "Test if object can move to neighbor.", "TestMoveToNeighbor");                     
AddObjectParam("Chess", "Chess object.");     
AddStringParam("Group", "Put result in this group", '""');        
AddCondition(11, cf_trigger, "On colliding begin - group", "Collisions", 
            "On {my} colliding begin with <i>{0}</i>, put collided result to group <i>{1}</i>", 
            "Triggered when this chess collides begin with another chess.", "OnCollidedBegin");
AddCondition(12, cf_trigger, "On get solid", "Solid", 
            "On {my} get solid", 
            "Triggered by plugin to get solid property from event sheet.", "OnGetSolid");   
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);             
AddCondition(13, 0, "Can move to neighbor", "Test: Hexagon grid (Up-Down)", "{my} can move to <i>{0}</i>", 
             "Test if object can move to neighbor.", "TestMoveToNeighbor");   
AddObjectParam("Chess", "Chess object.");        
AddCondition(14, cf_trigger, "On colliding begin", "Collisions", 
            "On {my} colliding begin with <i>{0}</i>", 
            "Triggered when this chess collides begin with another chess.", "OnCollidedBegin");             
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "Configuration", 
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
AddAction(1, 0, "Move to neighbor", "Request: Square grid", "{my} move to <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
          
AddNumberParam("X offset", "Relatived X offset.",0);
AddNumberParam("Y offset", "Relatived Y offset.",0);
AddAction(2, 0, "Move to offset", "Request", "{my} move to offset [<i>{0}</i>, <i>{1}</i>]", 
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
AddAction(7, 0, "Move to LXY", "Request", "{my} move to [<i>{0}</i>, <i>{1}</i>]", 
          "Move to logical position.", "MoveToLXY"); 
          
AddAnyTypeParam("UID", "Target UID.");
AddAction(8, 0, "Swap", "Swap", "{my} swap with chess UID <i>{0}</i>", 
          "Swap with target chess.", "Swap");   
          
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);
AddAction(9, 0, "Move to neighbor", "Request: Hexagon grid (Left-Right)", "{my} move to <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 
          
AddNumberParam("Direction", "The direction of neighbor.", 0);		  
AddAction(10, 0, "Move to neighbor", "Request", "{my} move to direction <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 		 
          
AddObjectParam("Target", "Target object.");
AddAction(11, 0, "Move to chess", "Request", "{my} move to <i>{0}</i>", 
          "Move to target chess/tile.", "MoveToTargetChess");
          
// AI          
AddAction(12, 0, "Wander", "AI: Wander", 
          "Wander", "Random moving in the boundary.", "Wander");
          
AddNumberParam("Range x", "Wander range x, in logic unit", 1);
AddAction(13, 0, "Set range x", "AI: Wander", 
          "Set {my} wander range x to <i>{0}</i>", 
          "Set the object's wander range x.", "SetWanderRangeX"); 
          
AddNumberParam("Range y", "Wander range y, in logic unit", 1);
AddAction(14, 0, "Set range y", "AI: Wander", 
          "Set {my} wander range y to <i>{0}</i>", 
          "Set the object's wander range y.", "SetWanderRangeY"); 	
          
AddObjectParam("Random generator", "Random generator object");
AddAction(15, 0, "Set random generator", "AI: Wander", 
          "Set random generator object to <i>{0}</i>", 
          "Set random generator object.", "SetRandomGenerator");
          
AddAction(16, 0, "Reset center position", "AI: Wander", 
          "{my} reset wander center position to current logic position", 
          "Reset wander center position to current logic position.", "ResetWanderCenter");
          
// AI              
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Solid", "Solid property.",0);
AddAction(17, 0, "Set solid", "Solid", 
          "{my} set solid to <i>{0}</i>", 
          "Set solid. Used under 'condition: On get solid'.", "SetDestinationSolid");
          
AddNumberParam("Solid", "Solid property. 0=Disable, 1=Enable.", 0);
AddAction(18, 0, "Set solid by number", "Solid", 
          "{my} set solid to <i>{0}</i>", 
          "Set solid. Used under 'condition: On get solid'.", "SetDestinationSolid");   
          
AddObjectParam("Group", "Instance group object");
AddAction(20, 0, "Set instance group ", "Collisions", 
          "Set instance group object to <i>{0}</i>", 
          "Set instance group object.", "SetInstanceGroup");        
          
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Move-able", "Move-able.",1);
AddAction(21, 0, "Set move-able", "Solid", 
          "{my} set move-able to <i>{0}</i>", 
          "Set move-able. Used under 'condition: On get solid'.", "SetDestinationMoveable");
          
AddNumberParam("Move-able", "Move-able. 0=Disable, 1=Enable.", 0);
AddAction(22, 0, "Set move-able by number", "Solid", 
          "{my} set move-able to <i>{0}</i>", 
          "Set move-able. Used under 'condition: On get solid'.", "SetDestinationMoveable"); 
          
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Moving direction.", 0);
AddAction(23, 0, "Move to neighbor", "Request: Hexagon grid (Up-Down)", "{my} move to <i>{0}</i>", 
          "Move to neighbor.", "MoveToNeighbor"); 	
          
// AI    
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Approach to");
AddComboParamOption("Depart from");
AddComboParam("Mode", "Approach or Depart.", 0);
AddAction(24, 0, "Approach/Depart", "AI: Approach/Depart", 
          "{my} <i>{1}</i> <i>{0}</i>",
          "Approach to chess or depart from chess.", "ApproachOrDepart");  
          
AddAnyTypeParam("Chess UID", "The UID of chess", 0);
AddComboParamOption("Approach to");
AddComboParamOption("Depart from");
AddComboParam("Mode", "Approach or Depart.", 0);
AddAction(25, 0, "Approach/Depart chess by UID", "AI: Approach/Depart", 
          "{my} <i>{1}</i> chess UID:<i>{0}</i>",
          "Approach to chess or depart from chess.", "ApproachOrDepart");   
          
// AI              
AddAction(30, 0, "Stop", "Stop", "{my} stop", 
          "Stop moving.", "Stop");   
          
AddAnyTypeParam("UID", "Target chess UID", 0);
AddAction(40, 0, "Move to chess by UID", "Request", "{my} move to chess UID: <i>{0}</i>", 
          "Move to target chess/tile.", "MoveToTargetChess"); 

AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Force move", "Enable the force moving feature.",1);
AddAction(101, 0, "Enable force moving", "Configuration", 
          "Enable {my} force moving to <i>{0}</i>", 
          "Enable if you wish to ignore solid checking. It will change z index when logical overlapping.", "SetForceMoving");
          
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
AddExpression(8, ef_return_any, "Get blocker UID", "Request", "BlockerUID", 
              "Get UID of blocker when moving request rejected.");
AddExpression(9, ef_return_number, "Get moving direction", "Request", "Direction", 
              "Get last moving direction of moving request. Return (-1) if not moving to neighbor.");
AddExpression(10, ef_return_number, "Get logic X of destination", "Request", "DestinationLX", 
              "Get logic X of destination X when moving request.");  
AddExpression(11, ef_return_number, "Get logic Y of destination", "Request", "DestinationLY", 
              "Get logic Y of destination when moving request.");  
AddExpression(12, ef_return_number, "Get logic Z of destination", "Request", "DestinationLZ", 
              "Get logic Z of destination when moving request.");  
AddExpression(13, ef_return_number, "Get logic X of source", "Request", "SourceLX", 
              "Get logic X of source when moving request.");               
AddExpression(14, ef_return_number, "Get logic Y of source", "Request", "SourceLY", 
              "Get logic Y of source when moving request.");  
AddExpression(15, ef_return_number, "Get logic Z of source", "Request", "SourceLZ", 
              "Get logic Z of source when moving request.");  
                                        
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                    
	new cr.Property(ept_float, "Max speed", 400, "Maximum speed, in pixel per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Acceleration, in pixel per second per second."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Deceleration, in pixel per second per second."),  
	new cr.Property(ept_integer, "Wander range x", 1, 
                    "Random moving in the boundary."),
	new cr.Property(ept_integer, "Wander range y", 1, 
                    "Random moving in the boundary."), 	
    new cr.Property(ept_combo, "Force move", "No", 
                    "Enable if you wish to ignore solid checking. It will change z index when logical overlapping.", "No|Yes"), 	
    new cr.Property(ept_combo, "MoveTo", "Yes", 
                    "Set Yes to move chess physically by built-in moveTo behavior. Set No will only change the logical position.", "No|Yes"),                     
    new cr.Property(ept_combo, "Continued mode", "No", "Moving as in continued-time.", "No|Yes"),                       
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
	if (this.properties["Max speed"] < 0)
		this.properties["Max speed"] = 0;
		
	if (this.properties["Acceleration"] < 0)
		this.properties["Acceleration"] = 0;
		
	if (this.properties["Deceleration"] < 0)
		this.properties["Deceleration"] = 0;
}
