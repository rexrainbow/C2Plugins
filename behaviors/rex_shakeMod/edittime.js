function GetBehaviorSettings()
{
	return {
		"name":			"Shake mod",
		"id":			"Rex_ShakeMod",
		"version":		"0.1",
		"description":	"Shake an object in the X and Y axis.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_shakemod.html",
		"category":		"Rex - Movement - position",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On shacking end", "Shake", 
             "On {my} shacking end", 
			 "Triggered when shacking end.", 
			 "OnShackingEnd");   
             
AddCondition(3,	0, "Is shaking", "Shake", "Is {my} shaking", "Is object shaking.", "IsShaking");                

            
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the rotation behavior.",1);
AddAction(0, 0, "Set activated", "Enable", "Set {my} activated to <i>{0}</i>", "Enable the object's rotation behavior.", "SetActivated");

AddAction(1, 0, "Start", "Shake", "Shake {my}", "Shake object for a duration of time.", "Start");

AddAction(2, 0, "Stop", "Shake", "Stop {my}",  "Stop shaking.", "Stop");        

AddNumberParam("Duration", "The time the shake should last, in seconds.", 0.5);         
AddAction(11, 0, "Set duration", "Duration", 
          "Set {my} duration to <i>{0}</i>", 
          "Set duration.", "SetDuration");          
      
AddNumberParam("Magnitude", "The strength of the shake, in pixels.", 10);         
AddAction(12, 0, "Set magnitude", "Magnitude", 
          "Set {my} magnitude to <i>{0}</i>", 
          "Set magnitude.", "SetMagnitude");   

AddComboParamOption("Decay");
AddComboParamOption("Constant");
AddComboParam("Mode", "Decay or constant magnitude.",0);
AddAction(13, 0, "Set magnitude mode", "Magnitude", 
          "Set {my} magnitude mode to <i>{0}</i>", "Set magnitude mode.", "SetMagnitudeMode");   
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get X co-ordinate of shaking origin", "Origin", "OX", "Get X co-ordinate of shaking origin.");
AddExpression(2, ef_return_number, "Get Y co-ordinate of shaking origin", "Origin", "OY", "Get Y co-ordinate of shaking origin.");

AddExpression(11, ef_return_number, "Get duration", "Duration", "Duration", "Get duration.");
AddExpression(12, ef_return_number, "Get remaining time", "Duration", "Remainder", "Get remaining time.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"), 
    new cr.Property(ept_combo, "Mode", "Effect", 'Effect mode only sets position for render.', "Effect|Behavior"), 
	new cr.Property(ept_float, "Duration", 0.5, "The time the shake should last, in seconds."), 
	new cr.Property(ept_float, "Magnitude", 10, "The strength of the shake, in pixels."),
    new cr.Property(ept_combo, "Magnitude mode", "Decay", "Decay or constant magnitude.", "Constant|Decay"),      
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
