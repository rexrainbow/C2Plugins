function GetBehaviorSettings()
{
	return {
		"name":			"Timer",
		"id":			"Rex_Timer",
		"version":		"1.0",          
		"description":	"Fire the trigger when time-out.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_timer.html",
		"category":		"Rex - Timeline",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddAnyTypeParam("Timer", "Timer name", '"_"');
AddCondition(0, 0, "Is timer running", "Timer", "{my} <i>{0}</i> running", "", "IsRunning");
AddAnyTypeParam("Timer", "Timer name", '"_"');
AddCondition(1, cf_trigger, "On time-out", "Time-out", "{my} on <i>{0}</i> timeout", 
             "Triggered when time-out.", "OnTimeout");

//////////////////////////////////////////////////////////////
// Actions

// ---- deprecated ----
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(0, af_deprecated, "Setup timer", "Z: Deprecated", 
          "{my} get timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup timer.", "Setup_deprecated");
AddStringParam("Commands", "Execute commands when timer's time-out", '""');
AddAction(1, af_deprecated, "Create timer", "Z: Deprecated", 
          "Create {my} with callback <i>{0}</i>", 
          "Create timer.", "Create_deprecated");            
// ---- deprecated ----

AddNumberParam("Time", "Time-out in seconds", 0);
AddAnyTypeParam("Timer", "Timer name", '"_"');
AddNumberParam("Repeat", "Repeat count, 0 is infinity.", 1);
AddAction(2, 0, "Start", "Control", 
          "Start {my} <i>{1}</i>, time-out to <i>{0}</i> seconds, repeat count to <i>{2}</i>", 
          "Start timer.", "Start");   
AddAnyTypeParam("Timer", "Timer name", '"_"');         
AddAction(3, 0, "Pause", "Control", 
          "Pause {my} <i>{0}</i>", 
          "Pause timer.", "Pause"); 
AddAnyTypeParam("Timer", "Timer name", '"_"');           
AddAction(4, 0, "Resume", "Control", 
          "Resume {my} <i>{0}</i>", 
          "Resume timer.", "Resume");
AddAnyTypeParam("Timer", "Timer name", '"_"');
AddAction(5, 0, "Stop", "Control", 
          "Stop {my} <i>{0}</i>", 
          "Stop timer.", "Stop"); 
          
// ---- deprecated ----
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(6, af_deprecated, "Set a parameter", "Z: Deprecated", 
          "Set {my}'s parameter[<i>{0}</i>] to <i>{1}</i>",
          "Set a parameter passed into callback.", "SetParameter");          
// ---- deprecated ----

AddAction(7, 0, "Pause all", "Control", 
          "Pause {my} all", 
          "Pause all timers.", "PauseAll"); 
          
AddAction(8, 0, "Resume all", "Control", 
          "Resume {my} all", 
          "Resume all timers.", "ResumeAll"); 
          
AddAction(9, 0, "Stop all", "Control", 
          "Stop {my} all", 
          "Stop all timers.", "StopAll");           

AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(10, 0, "Setup timer", "Setup", 
          "{my} get timer from <i>{0}</i>", 
          "Setup timer.", "Setup2");

//////////////////////////////////////////////////////////////
// Expressions
//AddAnyTypeParam("Timer", "Timer name", '"_"');  
AddExpression(0, ef_return_number | ef_variadic_parameters, "Get remainder time", 
              "Timer", "Remainder", 
              "Get remainder time.");
//AddAnyTypeParam("Timer", "Timer name", '"_"');                
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get elapsed time of timer", 
              "Timer", "Elapsed", 
              "Get elapsed time of timer.");    
//AddAnyTypeParam("Timer", "Timer name", '"_"');                          
AddExpression(2, ef_return_number | ef_variadic_parameters, "Get remainder time percentage of timer", 
              "Timer", "RemainderPercent", 
              "Get remainder time percentage of timer.");
//AddAnyTypeParam("Timer", "Timer name", '"_"');                
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get elapsed time percentage of timer", 
              "Timer", "ElapsedPercent", 
              "Get elapsed time percentage of timer.");  
//AddAnyTypeParam("Timer", "Timer name", '"_"');                
AddExpression(4, ef_return_number | ef_variadic_parameters, "Get delay time", 
              "Timer", "DelayTime", 
              "Get delay time.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Sync timescale", "Yes", "Sync to object's timescale.", "No|Yes"),
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