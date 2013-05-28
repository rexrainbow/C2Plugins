function GetBehaviorSettings()
{
	return {
		"name":			"Timer",
		"id":			"Rex_Timer",
		"version":		"1.0",          
		"description":	"Fire the trigger when time-out",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_timer.html",
		"category":		"Timer",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, 0, "Is timmer running", "Timer", "Is running", "", "IsRunning");
AddCondition(1, cf_trigger, "On time-out", "Time-out", "On {my} timeout", 
             "Triggered when time-out.", "OnTimeout");

//////////////////////////////////////////////////////////////
// Actions

// ---- deprecated ----
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(0, af_deprecated, "Setup timer", "Z: Deprecated", 
          "{my} get timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup timer.", "Setup");
AddStringParam("Commands", "Execute commands when timer's time-out", '""');
AddAction(1, af_deprecated, "Create timer", "Z: Deprecated", 
          "Create {my} with callback <i>{0}</i>", 
          "Create timer.", "Create");            
// ---- deprecated ----

AddNumberParam("Time", "Time-out in seconds", 0);
AddAction(2, 0, "Start", "Control", 
          "Start {my}, time-out is <i>{0}</i> seconds", 
          "Start timer.", "Start");   
AddAction(3, 0, "Pause", "Control", 
          "Pause {my}", 
          "Pause timer.", "Pause"); 
AddAction(4, 0, "Resume", "Control", 
          "Resume {my}", 
          "Resume timer.", "Resume");               
AddAction(5, 0, "Stop", "Control", 
          "Stop {my}", 
          "Stop timer.", "Stop"); 
          
// ---- deprecated ----
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(6, af_deprecated, "Set a parameter", "Z: Deprecated", 
          "Set {my}'s parameter[<i>{0}</i>] to <i>{1}</i>",
          "Set a parameter passed into callback.", "SetParameter");          
// ---- deprecated ----

AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(10, 0, "Setup timer", "Setup", 
          "{my} get timer from <i>{0}</i>", 
          "Setup timer.", "Setup2");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get remainder time", 
              "Timer", "Remainder", 
              "Get remainder time.");
AddExpression(1, ef_return_number, "Get elapsed time of timer", 
              "Timer", "Elapsed", 
              "Get elapsed time of timer.");              
AddExpression(2, ef_return_number, "Get remainder time percentage of timer", 
              "Timer", "RemainderPercent", 
              "Get remainder time percentage of timer.");
AddExpression(3, ef_return_number, "Get elapsed time percentage of timer", 
              "Timer", "ElapsedPercent", 
              "Get elapsed time percentage of timer.");  
AddExpression(4, ef_return_number, "Get delay time", 
              "Timer", "DelayTime", 
              "Get delay time.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
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