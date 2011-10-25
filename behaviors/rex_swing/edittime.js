function GetBehaviorSettings()
{
	return {
		"name":			"Swing",
		"id":			"Rex_Swing",
		"description":	"Swing sprite",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit start angle", "Start/Stop", 
             "On {my} hit start angle", 
			 "Triggered when hit start angle.", 
			 "OnHitStart");
             
AddCondition(1, cf_trigger, "On hit end angle", "Start/Stop", 
             "On {my} hit end angle", 
			 "Triggered when hit end angle.", 
			 "OnHitEnd");    
             
AddCondition(2, cf_trigger, "On hit start or end angle", "Start/Stop", 
             "On {my} hit start or end angle", 
			 "Triggered when hit start or end angle.", 
			 "OnHitStartEnd");
             
AddCmpParam("Comparison", "Choose the way to compare the current rotation speed.");
AddNumberParam("Rotation speed", "The rotation speed, in degrees per second, to compare the current speed to.");
AddCondition(3, 0, "Compare rotation speed", "Speed", 
             "{my} rotation speed {0} {1}", 
             "Compare the current rotation speed of the object.", 
             "CompareSpeed");

AddCondition(4, 0, "Is clockwise rotation", "Direction", 
             "{my} is in clockwise rotation", 
             "The object is in clockwise rotation.", 
             "IsClockwise");
   
AddCondition(5, 0, "Is anti-clockwise rotation", "Direction", 
             "{my} is in anti-clockwise rotation", 
             "The object is in anti-clockwise rotation.", 
             "IsAntiClockwise");  

             
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's swing behavior.", "SetActivated");

AddNumberParam("Max speed", "Maximum speed, in degrees per second.");
AddAction(1, 0, "Set maximum speed", "Speed", 
          "Set {my} maximum rotation speed to <i>{0}</i>", 
          "Set the object's maximum rotation speed.", "SetMaxSpeed");

AddNumberParam("Acceleration", "The acceleration setting, in pixels per second per second.");
AddAction(2, 0, "Set acceleration", "Speed", 
          "Set {my} acceleration to <i>{0}</i>", 
          "Set the object's rotation acceleration.", "SetAcceleration");

AddNumberParam("Deceleration", "The deceleration setting, in pixels per second per second.");
AddAction(3, 0, "Set deceleration", "Speed", 
          "Set {my} deceleration to <i>{0}</i>", 
          "Set the object's rotation deceleration.", "SetDeceleration");

AddNumberParam("Start angle", "Start angle, in degree.");
AddAction(4, 0, "Set start angle", "Angle", 
          "Set {my} start angle to <i>{0}</i>", 
          "Set the start angle.", 
          "SetStartAngle");

AddNumberParam("Rotation degree", "Amount to rotate clockwise from start, in degrees.");
AddAction(5, 0, "Set rotation degree", "Angle", 
          "Set {my} rotation degree to <i>{0}</i>", 
          "Set amount to rotate clockwise from start, in degrees. Negative is anti-clockwise.", 
          "SetRotateTO");


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get current speed", "Current", "Speed", 
              "The current object rotation speed, in degrees per second.");
AddExpression(2, ef_return_number, "Get current direction", "Current", "Direction", 
              "The current object rotation direction, 1 is clockwise.");
AddExpression(3, ef_return_number, "Get max speed", "Setting", "MaxSpeed", 
              "The maximum speed setting, in degrees per second.");
AddExpression(4, ef_return_number, "Get acceleration", "Setting", "Acc", 
              "The acceleration setting, in degrees per second per second.");
AddExpression(5, ef_return_number, "Get deceleration", "Setting", "Dec", 
              "The deceleration setting, in degrees per second per second.");
AddExpression(6, ef_return_number, "Get start angle", "Setting", "Start", 
              "The start angle setting, in degrees.");
AddExpression(7, ef_return_number, "Get amount to rotate clockwise", "Setting", "Angle", 
              "The amount to rotate clockwise from start, in degree. Negative is anti-clockwise.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_float, "Start angle", 0, "Start angle of swing, in degree."),
    new cr.Property(ept_float, "Rotation angle", 180, "Rotation angle from start angle, in degree. Negative is anti-clockwise."),                    
	new cr.Property(ept_float, "Max speed", 180, "Maximum rotation speed, in degrees per second."),
	new cr.Property(ept_float, "Acceleration", 0, 
                    "Rotation acceleration, in degrees per second per second. 0 is using max speed directly."),
	new cr.Property(ept_float, "Deceleration", 0, 
                    "Rotation deceleration, in degrees per second per second. 0 is ignored deceleration"),                    
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
