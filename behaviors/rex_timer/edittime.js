function GetBehaviorSettings()
{
	return {
		"name":			"Timer",
		"id":			"Rex_Timer",
		"version":		"1.0",          
		"description":	"Timer, to execute function at time-out",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Timer",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, 0, "Is timmer running", "Timer", "Is running", "", "IsRunning");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(0, 0, "Setup timer", "Setup", 
          "Get timer {my} from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup timer.", "Setup");
AddStringParam("Commands", "Execute commands when timer's time-out", '""');
AddAction(1, 0, "Create timer", "Create", 
          "Create timer {my} with callback <i>{0}</i>", 
          "Create timer.", "Create");            
AddNumberParam("Time", "Time-out in seconds", 0);
AddAction(2, 0, "Start timer", "Control", 
          "Start timer {my}, time-out is <i>{0}</i> seconds", 
          "Start timer.", "Start");   
AddAction(3, 0, "Pause timer", "Control", 
          "Pause timer {my}", 
          "Pause timer.", "Pause"); 
AddAction(4, 0, "Resume timer", "Control", 
          "Resume timer {my}", 
          "Resume timer.", "Resume");               
AddAction(5, 0, "Stop timer", "Control", 
          "Stop timer {my}", 
          "Stop timer.", "Stop"); 
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(6, 0, "Set a parameter", "Timer", 
          "Set timer {my}'s parameter[<i>{0}</i>] to <i>{1}</i>",
          "Set a parameter pass into timer.", "SetParameter");          

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