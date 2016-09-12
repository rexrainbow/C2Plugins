function GetPluginSettings()
{
	return {
		"name":			"TimeLine",
		"id":			"Rex_TimeLine",
		"version":		"1.0",          
		"description":	"TimeLine & Timer, to execute function while time-out.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_timeline.html",
		"category":		"Rex - Timeline",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddAnyTypeParam("Name", "Timer's name", '""');
AddCondition(0, 0, "Is timer running", "Timer", 
             "<i>{0}</i> is running", 
             "Return true if timer is running.", "IsRunning");

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Time", "Delta-time in seconds", 0);
AddAction(0, 0, "Push timeline forward", "TimeLine - manual", 
          "Push timeline forward with delta-time to <i>{0}</i>", 
          "Push timeline forward with delta-time.", "PushTimeLine");
          
// 	af_deprecated	  
AddObjectParam("Function", "Function object for timer's callback");
AddAction(1, af_deprecated, "Setup timer", "Z: Deprecated", 
          "Set timer's callback to <i>{0}</i>", 
          "Setup timer.", "Setup_deprecated");
		  
// 	af_deprecated	  
AddStringParam("Timer", "Timer's name", '""');
AddStringParam("Commands", "Execute commands when timer's time-out", '""');
AddAction(2, af_deprecated, "Create timer", "Z: Deprecated", 
          "Create timer <i>{0}</i> with callback <i>{1}</i>", 
          "Create timer.", "CreateTimer_deprecated");
		  
AddStringParam("Name", "Timer's name.", '""');      
AddNumberParam("Time", "Time-out in seconds", 0);
AddNumberParam("Repeat", "Repeat count, 0 is infinity.", 1);
AddAction(3, 0, "Start", "Timer: Control", 
          "Start timer <i>{0}</i>, time-out to <i>{1}</i> seconds, repeat count to <i>{2}</i>", 
          "Start timer.", "StartTimer");
AddNumberParam("Time", "Time-out in seconds", 0);
AddAction(4, 0, "Start triggered timer", "Timer: Triggered timer", 
          "Start triggered timer, time-out is <i>{0}</i> seconds", 
          "Start triggered timer.", "StartTrgTimer");
AddStringParam("Name", "Timer's name.", '""');      
AddAction(5, 0, "Pause", "Timer: Control", 
          "Pause timer <i>{0}</i>", 
          "Pause timer.", "PauseTimer");
AddStringParam("Name", "Timer's name.", '""');      
AddAction(6, 0, "Resume", "Timer: Control", 
          "Resume timer <i>{0}</i>", 
          "Resume timer.", "ResumeTimer");          
AddStringParam("Name", "Timer's name.", '""');      
AddAction(7, 0, "Stop", "Timer: Control", 
          "Stop timer <i>{0}</i>", 
          "Stop timer.", "StopTimer");
AddAction(8, 0, "Clean", "TimeLine", 
          "Clean timeline", 
          "Clean timeline.", "CleanTimeLine");  
AddStringParam("Name", "Timer's name.", '""');
AddAction(9, 0, "Delete", "Timer", 
          "Delete timer <i>{0}</i>", 
          "Delete timer.", "DeleteTimer"); 

// 	af_deprecated	  
AddStringParam("Name", "Timer's name.", '""');          
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(10, af_deprecated, "Set a parameter", "Z: Deprecated", 
          "Set timer <i>{0}</i> 's parameter[<i>{1}</i>] to <i>{2}</i>",
          "Set a parameter pass into callback.", "SetTimerParameter");
		  
AddAction(20, 0, "Pause timeline", "TimeLine", 
          "Pause timeline", 
          "Pause timeline, it will pause all timers registed on it.", "PauseTimeLine");
AddAction(21, 0, "Resume timeline", "TimeLine", 
          "Resume timeline", 
          "Resume timeline, it will resume all timers registed on it.", "ResumeTimeLine");
		  
// for official function plugin		  
AddStringParam("Timer", "Timer's name", '""');
AddStringParam("Name", "The name of the callback.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the callback, which can be accessed with Function.Param({n}).");
AddAction(30, 0, "Create timer", "Timer", 
          "Create timer <i>{0}</i> with callback <i>{1}</i> (<i>{...}</i>)", 
          "Create timer.", "CreateTimer");
AddStringParam("Name", "Timer's name.", '""');          
AddVariadicParams("Parameter {n}", "A parameter to pass for the callback, which can be accessed with Function.Param({n}).");
AddAction(31, 0, "Set parameters", "Timer", 
          "Set timer <i>{0}</i> 's parameters to (<i>{...}</i>)",
          "Set parameters passed into callback.", "SetTimerParameters");          
AddVariadicParams("Parameter {n}", "A parameter to pass for the callback, which can be accessed with Function.Param({n}).");
AddAction(32, 0, "Set parameters", "Timer: Triggered timer", 
          "Set triggered timer's parameters to (<i>{...}</i>)",
          "Set triggered timer's parameters passed into callback.", "SetTrgTimerParameters");		      
AddAction(33, 0, "Delete triggered timer", "Timer: Triggered timer", 
          "Delete triggered timer", 
          "Delete triggered timer.", "DeleteTrgTimer"); 
          
AddNumberParam("Time", "Time in seconds", 0);
AddAction(40, 0, "Push timeline to", "TimeLine - manual", 
          "Push timeline to <i>{0}</i>", 
          "Push timeline to specific time. It could not turn back the timeline.", "PushTimeLineTo");          
		  
AddComboParamOption("Official function");
AddComboParamOption("Rex function2");
AddComboParam("Callback", "Callback object.",0);          
AddAction(101, 0, "Setup callback", "Setup", 
          "Set callback to <i>{0}</i>", 
          "Setup callback.", "SetupCallback");          
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Name", "Timer's name.", '""');  
AddExpression(0, ef_return_number | ef_variadic_parameters, "Get remainder time of timer", 
              "Timer", "TimerRemainder", 
              "Get remainder time of timer.");
AddStringParam("Name", "Timer's name.", '""');                
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get elapsed time of timer", 
              "Timer", "TimerElapsed", 
              "Get elapsed time of timer.");
AddStringParam("Name", "Timer's name.", '""');                
AddExpression(2, ef_return_number | ef_variadic_parameters, "Get remainder time percentage of timer", 
              "Timer", "TimerRemainderPercent", 
              "Get remainder time percentage of timer.");
AddStringParam("Name", "Timer's name.", '""');                
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get elapsed time percentage of timer", 
              "Timer", "TimerElapsedPercent", 
              "Get elapsed time percentage of timer.");
AddExpression(4, ef_return_number, "Get current time of timeline", 
              "TimeLine", "TimeLineTime", 
              "Get current time of timeline.");              
AddExpression(5, ef_return_string, "Get triggered timer's name", 
              "Timer", "TriggeredTimerName", 
              "Get triggered timer's name.");            
AddStringParam("Name", "Timer's name.", '""');  
AddExpression(6, ef_return_number | ef_variadic_parameters, "Get delay time of timer", 
              "Timer", "TimerDelayTime", 
              "Get delay time of timer.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Game time", "Yes", "Enable to update timeline with game time, or real-time.", "No|Yes|Real-time")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
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
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
