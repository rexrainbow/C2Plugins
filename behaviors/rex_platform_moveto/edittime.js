function GetBehaviorSettings()
{
	return {
		"name":			"Platform MoveTo",
		"id":			"Rex_Platform_MoveTo",
		"version":		"0.1",        
		"description":	"Move platformer to specific position",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_platform_moveto.html",
		"category":		"Rex - Platformer helper",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target position", "", 
             "On {my} hit target", 
			 "Triggered when hit target position.", 
			 "OnHitTarget");             
AddCondition(3,	0, "Is moving", "", "Is {my} moving", "Is object moving.", "IsMoving");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's MoveTo behavior.", "SetActivated");
AddNumberParam("X", "The X co-ordinate to move toward.");
AddAction(1, 0, "Move to X", "MoveTo", 
          "{my} move to X <i>{0}</i>", 
          "Move to specific position by X.", 
          "SetTargetPosX");
AddObjectParam("Target", "Target object.");
AddAction(3, 0, "Move to object", "MoveTo", 
          "{my} move to <i>{0}</i>", 
          "Move to object.", 
          "SetTargetPosOnObject");
AddNumberParam("dX", "The delta X to move toward, in pixel.");
AddAction(4, 0, "Move to delta X", "MoveTo", 
          "{my} move to delta X <i>{0}</i>", 
          "Move to specific position by deltaX.", 
          "SetTargetPosByDeltaX");                        
AddNumberParam("Distance", "The destance to move toward, in pixel.");
AddComboParamOption("Left");
AddComboParamOption("Right");
AddComboParam("Direction", "Direction of moving.",1);
AddAction(6, 0, "Move to distance", "MoveTo", 
          "{my} move to (distance <i>{0}</i>, <i>{1}</i> side)", 
          "Move to specific position by distance.", 
          "SetTargetPosByDistance");
AddAction(10, 0, "Stop", "Stop", "{my} stop", 
          "Stop moving.", "Stop");       
                  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get target position X", "Target", "TargetX", 
              "The X co-ordinate of target position to move toward.");
AddExpression(2, ef_return_number, "Get target position Y", "Target", "TargetY", 
              "The Y co-ordinate of target position to move toward.");                
              
         
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
