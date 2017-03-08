function GetBehaviorSettings()
{
	return {
		"name":			"RotateTo",
		"id":			"Rex_RotateTo",
		"version":		"0.1",        
		"description":	"Spin sprite to specific angle",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_rotateto.html",
		"category":		"Rex - Movement - angle",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target angle", "Target", 
             "On {my} hit angle", 
			 "Triggered when hit target angle.", 
			 "OnHitTarget");             
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Speed", "The speed, in degree per second, to compare the current speed to.");
AddCondition(1, 0, "Compare speed", "Speed", 
             "{my} speed {0} {1}", 
             "Compare the current speed of the object.", 
             "CompareSpeed");
AddCondition(3,	0, "Is rotating", "", "Is {my} rotating", "Is object rotating.", "IsRotating");                


//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set enable", "", 
          "Set {my} enable to <i>{0}</i>", 
          "Enable the object's RotateTo behavior.", "SetActivated");

AddNumberParam("Max speed", "Maximum speed, in degree per second.");
AddAction(1, 0, "Set maximum speed", "Speed", 
          "Set {my} maximum speed to <i>{0}</i>", 
          "Set the object's maximum speed.", "SetMaxSpeed");

AddNumberParam("Acceleration", "The acceleration setting, in degree per second per second.");
AddAction(2, 0, "Set acceleration", "Speed", 
          "Set {my} acceleration to <i>{0}</i>", 
          "Set the object's acceleration.", "SetAcceleration");

AddNumberParam("Deceleration", "The deceleration setting, in degrees per second per second.");
AddAction(3, 0, "Set deceleration", "Speed", 
          "Set {my} deceleration to <i>{0}</i>", 
          "Set the object's deceleration.", "SetDeceleration");

AddNumberParam("Angle", "The angle to rotate toward.");
AddComboParamOption("Anti-Clockwise");
AddComboParamOption("Clockwise");
AddComboParamOption("Nearest side");
AddComboParam("Clockwise", "Rotate clockwise or anti-clockwise.",2);
AddAction(4, 0, "Rotate to angle", "Target angle", 
          "Set {my} target angle to <i>{0}</i>, <i>{1}</i>", 
          "Set target angle to rotate toward.", 
          "SetTargetAngle");

AddNumberParam("Current speed", "Current speed, in degree per second.", 180);
AddAction(5, 0, "Set current speed", "Speed", 
          "Set {my} current speed to <i>{0}</i>", 
          "Set the object's Current speed.", "SetCurrentSpeed");
  
AddObjectParam("Target", "Target object.");
AddComboParamOption("Anti-Clockwise");
AddComboParamOption("Clockwise");
AddComboParamOption("Nearest side");
AddComboParam("Clockwise", "Rotate clockwise or anti-clockwise.",2);  
AddAction(6, 0, "Rotate to object", "Target angle", 
          "Set {my} target angle to <i>{0}</i>, <i>{1}</i>", 
          "Set target angle to rotate toward.", 
          "SetTargetAngleOnObject");  
  
AddNumberParam("dA", "The delta angle to rotate toward, in degree.",0);  
AddComboParamOption("Anti-Clockwise");
AddComboParamOption("Clockwise");
AddComboParamOption("Nearest side");
AddComboParam("Clockwise", "Rotate clockwise or anti-clockwise.",2); 
AddAction(7, 0, "Rotate by delta angle", "Target angle", 
          "Set {my} target angle by delta <i>{0}</i>,  <i>{1}</i>", 
          "Set target angle to rotate toward by delta angle.", 
          "SetTargetAngleByDeltaAngle");  

AddNumberParam("X", "X co-ordinate of target position.", 0);
AddNumberParam("Y", "Y co-ordinate of target position.", 0);
AddComboParamOption("Anti-Clockwise");
AddComboParamOption("Clockwise");
AddComboParamOption("Nearest side");
AddComboParam("Clockwise", "Rotate clockwise or anti-clockwise.",2);  
AddAction(8, 0, "Rotate toward to position", "Target angle", 
          "Set {my} target angle toward to (<i>{0}</i>, <i>{1}</i>), <i>{2}</i>", 
          "Set target angle toward to position.", 
          "SetTargetAngleToPos");
          
AddAction(9, 0, "Stop", "Stop", "{my} stop", 
          "Stop moving.", "Stop");               
                    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get current speed", "Current", "Speed", 
              "The current object speed, in degree per second.");
AddExpression(2, ef_return_number, "Get max speed", "Setting", "MaxSpeed", 
              "The maximum speed setting, in degree per second.");
AddExpression(3, ef_return_number, "Get acceleration", "Setting", "Acc", 
              "The acceleration setting, in degree per second per second.");
AddExpression(4, ef_return_number, "Get deceleration", "Setting", "Dec", 
              "The deceleration setting, in degree per second per second.");
AddExpression(5, ef_return_number, "Get target angle", "Target", "TargetAngle", 
              "The angle to spin toward.");
              
         
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
	new cr.Property(ept_float, "Max speed", 180, "Maximum speed, in degree per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Acceleration, in degree per second per second."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Deceleration, in degree per second per second."),
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
