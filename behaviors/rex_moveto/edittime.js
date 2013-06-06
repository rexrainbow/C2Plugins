function GetBehaviorSettings()
{
	return {
		"name":			"MoveTo",
		"id":			"Rex_MoveTo",
		"version":		"1.0",        
		"description":	"Move sprite to specific position",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_moveto.html",
		"category":		"Movements",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target position", "", 
             "On {my} hit target", 
			 "Triggered when hit target position.", 
			 "OnHitTarget");             
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Speed", "The speed, in pixel per second, to compare the current speed to.");
AddCondition(1, 0, "Compare speed", "Speed", 
             "{my} speed {0} {1}", 
             "Compare the current speed of the object.", 
             "CompareSpeed");
AddCondition(2,	cf_deprecated | cf_trigger, "On moving", "", "On {my} moving", "Triggered when object moving.", "OnMoving");                          
AddCondition(3,	0, "Is moving", "", "Is {my} moving", "Is object moving.", "IsMoving");                
AddCmpParam("Comparison", "Choose the way to compare the current moving angle.");
AddNumberParam("Angle", "The moving angle, in pixel per second, to compare the current moving angle to.");
AddCondition(4, 0, "Compare moving angle", "Moving angle", 
             "{my} moving angle {0} {1}", 
             "Compare the current moving angle of the object.", 
             "CompareMovingAngle");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's MoveTo behavior.", "SetActivated");

AddNumberParam("Max speed", "Maximum speed, in pixel per second.");
AddAction(1, 0, "Set maximum speed", "Speed", 
          "Set {my} maximum speed to <i>{0}</i>", 
          "Set the object's maximum speed.", "SetMaxSpeed");

AddNumberParam("Acceleration", "The acceleration setting, in pixel per second per second.");
AddAction(2, 0, "Set acceleration", "Speed", 
          "Set {my} acceleration to <i>{0}</i>", 
          "Set the object's acceleration.", "SetAcceleration");

AddNumberParam("Deceleration", "The deceleration setting, in pixels per second per second.");
AddAction(3, 0, "Set deceleration", "Speed", 
          "Set {my} deceleration to <i>{0}</i>", 
          "Set the object's deceleration.", "SetDeceleration");

AddNumberParam("X", "The X co-ordinate to move toward.");
AddNumberParam("Y", "The Y co-ordinate to move toward.");
AddAction(4, 0, "Move to XY", "MoveTo", 
          "{my} move to (<i>{0}</i>, <i>{1}</i>)", 
          "Move to specific position.", 
          "SetTargetPos");

AddNumberParam("Current speed", "Current speed, in pixel per second.");
AddAction(5, 0, "Set current speed", "Speed", 
          "Set {my} current speed to <i>{0}</i>", 
          "Set the object's Current speed.", "SetCurrentSpeed");
  
AddObjectParam("Target", "Target object.");
AddAction(6, 0, "Move to object", "MoveTo", 
          "{my} move to <i>{0}</i>", 
          "Move to object.", 
          "SetTargetPosOnObject");  
  
AddNumberParam("dX", "The delta X to move toward, in pixel.");
AddNumberParam("dY", "The delta Y to move toward, in pixel.");
AddAction(7, 0, "Move to delta XY", "MoveTo", 
          "{my} move to (delta <i>{0}</i>, delta <i>{1}</i>)", 
          "Move to specific position by deltaXY.", 
          "SetTargetPosByDeltaXY");  
          
AddNumberParam("Distance", "The destance to move toward, in pixel.");          
AddNumberParam("Angle", "The angle of moving destance to move toward, in degree.");
AddAction(8, 0, "Move to distance-angle", "MoveTo", 
          "{my} move to (distance <i>{0}</i>, angle <i>{1}</i>)", 
          "Move to specific position by distance-angle.", 
          "SetTargetPosByDistanceAngle");         
          
AddAction(9, 0, "Stop", "Stop", "{my} stop", 
          "Stop moving.", "Stop");               
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
AddExpression(7, ef_return_number, "Get current moving angle", "Current", "MovingAngle", 
              "Get current moving angle, in degree. Retrun last moving angle when object is not moving.");     
              
         
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
	new cr.Property(ept_float, "Max speed", 400, "Maximum speed, in pixel per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Acceleration, in pixel per second per second."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Deceleration, in pixel per second per second."),
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
