function GetBehaviorSettings()
{
	return {
		"name":			"Value interpolation",
		"id":			"Rex_Value_interpolation",
		"version":		"0.1",          
		"description":	"Changing value in a duration",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_value_interpolation.html",
		"category":		"Rex - Variable",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, 0, "Is value changing", "Timer", "Is {my} value changing", "Return true if value changing in this tick.", "IsValueChanging");
AddCondition(1, cf_trigger, "On value changing", "Timer", "On {my} value changing", 
             "Triggered when value changing.", "OnValueChanging");
AddCondition(2, cf_trigger, "On hit target value", "Timer", "On {my} hit target value", 
             "Triggered when hit target value.", "OnHitTargetValue");
             
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Value", "Target value", 0);
AddAction(0, 0, "Change value", "Value", 
          "Change {my} value to <i>{0}</i>", 
          "Change value.", "ChangeValue");   
AddNumberParam("Step", "Step", 1);
AddAction(1, 0, "Set step", "Value", 
          "Set {my} step to <i>{0}</i>", 
          "Set changing step.", "SetStep");           
AddNumberParam("Duration", "Changing duration, in seconds", 0.1);
AddAction(2, 0, "Set duration", "Timer", 
          "Set {my} duration to <i>{0}</i> seconds", 
          "Set changing duration.", "SetDuration");   
AddNumberParam("Value", "Target value", 0);
AddAction(3, 0, "Set value", "Value", 
          "Set {my} value to <i>{0}</i>", 
          "Set value without interpolation.", "SetValue");          
AddAction(5, 0, "Pause", "Timer", 
          "Pause {my}", 
          "Pause value changing.", "Pause"); 
AddAction(6, 0, "Resume", "Timer", 
          "Resume {my}", 
          "Resume value changing.", "Resume");               
AddAction(7, 0, "Stop", "Timer", 
          "Stop {my}", 
          "Stop value changing.", "Stop"); 

AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(10, 0, "Setup timer", "Setup", 
          "{my} get timer from <i>{0}</i>", 
          "Setup timer.", "Setup2");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get changing duration", 
              "Timer", "Duration", 
              "Get changing duration, in seconds");
AddExpression(1, ef_return_number, "Get changing step", 
              "Value", "Step", 
              "Get changing step.");              
AddExpression(2, ef_return_number, "Get current value", 
              "Value", "Value", 
              "Get current value.");
AddExpression(3, ef_return_number, "Get target value", 
              "Value", "TargetValue", 
              "Get target value.");  

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "Value", 0, "Initial value."),
	new cr.Property(ept_float, "Duration", 0.1, "Changing duration."),
	new cr.Property(ept_float, "Step", 1, "Value changing step."),
	
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
    this.properties["Duration"] = Math.abs(this.properties["Duration"]);  
    this.properties["Step"] = Math.abs(this.properties["Step"]);   
}