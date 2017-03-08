function GetBehaviorSettings()
{
	return {
		"name":			"Slow down",
		"id":			"Rex_Slowdown",
		"version":		"0.1",        
		"description":	"Slow down object unitl stop.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_slowdown.html",
		"category":		"Rex - Movement - position",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "Actived", "Set {my} activated to <i>{0}</i>", 
          "Enable the object's slow down behavior.", "SetActivated");
   
AddNumberParam("Speed", "The initial speed, in pixel per second.");          
AddNumberParam("Angle", "The angle to move toward, in degree.");          
AddAction(1, 0, "Start", "Start", 
          "{my} start with speed to <i>{0}</i>, angle to <i>{1}</i>", 
          "Slow down start.", "Start"); 
                    
AddNumberParam("Deceleration", "The deceleration setting, in pixels per second per second.");
AddAction(2, 0, "Set deceleration", "Speed", 
          "Set {my} deceleration to <i>{0}</i>", 
          "Set the object's deceleration.", "SetDeceleration");
		  
AddAction(10, 0, "Stop", "Stop", "{my} stop", 
          "Slow down stop.", "Stop");  

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2,	0, "Is moving", "", "Is {my} moving", "Is object moving.", "IsMoving"); 
AddCondition(3,	cf_trigger, "On stop", "", "On {my} stop", "Triggered when stop.", "OnStop");                

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get current speed", "Current", "Speed", 
              "The current object speed, in pixel per second.");
AddExpression(2, ef_return_number, "Get deceleration", "Setting", "Dec", 
              "The deceleration setting, in pixel per second per second.");
AddExpression(3, ef_return_number, "Get current moving angle", "Current", "MovingAngle", 
              "Get current moving angle, in degree. Retrun (-1) when object is not moving.");
               
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
	new cr.Property(ept_float, "Deceleration", 500, "Deceleration, in pixel per second per second."),
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
