function GetBehaviorSettings()
{
	return {
		"name":			"Duration",
		"id":			"Rex_Duration",
		"version":		"1.0",          
		"description":	"Execute callback during duration",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Timer",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Duration", "Duration name", '""');
AddCondition(0, 0, "Is duration running", "Durations", "Is {my} <i>{0}</i> running", "", "IsRunning");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(0, 0, "Setup", "Setup", 
          "Get {my} timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup.", "Setup");          
AddStringParam("Duration", "Duration name", '""');
AddNumberParam("Duration", "Duration time", 1);
AddNumberParam("Interval", "Interval time", 0.1);
AddStringParam("On start", "Callback at duration starting", '""');
AddStringParam("On interval", 'Callback for each interval', '""');
AddStringParam("On end", "Callback at duration finished", '""');
AddAction(2, 0, "Start duration", "Control", 
          "Start {my} <i>{0}</i> with duration to <i>{1}</i> second for each <i>{2}</i> second. Callback of 'On start' to <i>{3}</i>, 'On interval' to <i>{4}</i>, and 'On end' to <i>{5}</i>", 
          "Start duration.", "Start");
AddStringParam("Duration", "Duration name", '""');      
AddAction(3, 0, "Pause duration", "Control", 
          "Pause {my} <i>{0}</i>", 
          "Pause duration.", "Pause"); 
AddStringParam("Duration", "Duration name", '""');          
AddAction(4, 0, "Resume duration", "Control", 
          "Resume {my} <i>{0}</i>", 
          "Resume duration.", "Resume"); 
AddStringParam("Duration", "Duration name", '""');          
AddAction(5, 0, "Stop duration", "Control", 
          "Stop {my} <i>{0}</i>", 
          "Stop duration.", "Stop");
AddAction(6, 0, "Pause all durations", "Control", 
          "Pause {my} all durations", 
          "Pause all durations.", "PauseAll");                    
AddAction(7, 0, "Resume all durations", "Control", 
          "Resume {my} all durations", 
          "Resume all durations.", "ResumeAll"); 
AddAction(8, 0, "Stop all durations", "Control", 
          "Stop {my} all durations", 
          "Stop all durations.", "StopAll");          


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Get remainder duration", 
              "Duration", "Remainder", 
              "Get remainder duration. Add second parameter to specify duration.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get elapsed time of duration", 
              "Duration", "Elapsed", 
              "Get elapsed time of duration. Add second parameter to specify duration.");              
AddExpression(2, ef_return_number | ef_variadic_parameters, "Get remainder time percentage of duration", 
              "Percentage", "RemainderPercent", 
              "Get remainder time percentage of duration. Add second parameter to specify duration.");
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get elapsed time percentage of duration", 
              "Percentage", "ElapsedPercent", 
              "Get elapsed time percentage of duration. Add second parameter to specify duration.");  
AddExpression(4, ef_return_number | ef_variadic_parameters, "Get interval time", 
              "Duration", "Interval", 
              "Get interval time. Add second parameter to specify duration.");
AddExpression(5, ef_return_number | ef_variadic_parameters, "Get duration time", 
              "Duration", "Duration", 
              "Get duration time. Add second parameter to specify duration.");              


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