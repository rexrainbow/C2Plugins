function GetPluginSettings()
{
	return {
		"name":			"ScenarioJ Editor",
		"id":			"Rex_ScenarioJEditor",
		"version":		"0.1",        
		"description":	"Create Scenario-Json commands.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_scenariojeditor.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(1,	0, "On function", "0. Function body", 
    "On <b>{0}</b>",
    "Declare a function.", "OnFunction");

AddAnyTypeParam("Condition", "Condition.", '""');
AddCondition(11,	0, "If", "If", 
    "If <b>{0}</b>", 
    "Declare a if condition.", "IFIf");

AddAnyTypeParam("Condition", "Condition.", '""');
AddCondition(12,	0, "Else if", "If", 
    "Else if <b>{0}</b>", 
    "Declare a else if condition.", "IFElseIf");

AddCondition(13,	0, "Else", "If", "Else", "Declare a else condition.", "IFElse");

AddStringParam("Variable name", "Variable name of index.", '"i"');
AddAnyTypeParam("Start", "Start value.", 1);
AddAnyTypeParam("Stop", "Stop value.", 10);
AddAnyTypeParam("Step", "Step value.", 1);
AddCondition(21,	0, "For", "Loop", 
    "For <b>{0}</b> from <i>{1}</i> to <i>{2}</i> , step to <i>{3}</i>", 
    "Declare a for loop.", "For");
    
AddAnyTypeParam("Continue", "Continue condition.", '""');    
AddCondition(22,	0, "While", "Loop", 
    "While <b>{0}</b>", 
    "Declare a while loop.", "While");    
    
AddStringParam("Expression", "Expression.", '""');
AddCondition(31,	0, "Switch", "Switch", 
    "Switch <b>{0}</b>", 
    "Declare a switch block.", "SWITCHSwitch");    

AddAnyTypeParam("Value", "Value to compare.");
AddCondition(32,	0, "Case", "Switch", 
    "Case <b>{0}</b>", 
    "Declare a case block.", "SWITCHCase");  

AddCondition(33,	0, "Default", "Switch", 
    "Default", 
    "Declare a default case block.", "SWITCHCase");       

//////////////////////////////////////////////////////////////
// Actions

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(1, 0, "Set default value", "Local variable", 
    "local.<b>{0}</b> set default to <b>{1}</b>", 
    "Set default value of local variable.", "SetLocalVarDefault");
    
AddAction(2, 0, "Stop function", "Function", 
    "Stop function", 
    "Exit current function, return to previous function body.", "Return");    
    
AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "Value to set.");
AddStringParam("Task", 'Task name. Set to "" for current task.', '""');
AddAction(3, 0, "Set value", "Local variable", 
    "Set local.<b>{0}</b> to <b>{1}</b> (task: {2})", 
    "Set local variable.", "SetLocalVar"); 

AddAction(4, 0, "Stop loop", "Loop", 
    "Stop loop", 
    "Stop current loop (for, while)", "BreakLoop");

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "Value to set.");
AddStringParam("Task", 'Task name. Set to "" for current task.', '""');
AddAction(5, 0, "Add to", "Local variable", 
    "Add <b>{1}</b> to local.<b>{0}</b> (task: {2})", 
    "Add to the value of local variable.", "AddToLocalVar");    

AddAnyTypeParam("Name", "Name of parameter", '""');
AddAnyTypeParam("Value", "Value", "0");
AddAction(11, 0, "Set parameter", "Function call", 
    "Set parameter <b>{0}</b> to <b>{1}</b>", 
    "Set a parameter table.", "SetFunctionParameter");

AddStringParam("Name", "The name of the function to call.", '""');
AddAction(12, 0, "Call function","Function call", 
    "Call <b>{0}</b>", 
    "Call a function, running its 'On function' event.", "Call");    
      
AddStringParam("Name", "The name of the c2 function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the c2 function call, which can be accessed with Function.Param({n}).");
AddAction(21, 0, "Call C2 function", "C2 function call", 
    "Call C2 <b>{0}</b> ({...})", 
    "Call a c2 function, running its 'On function' event.", "CallC2Function");
    
AddAnyTypeParam("Delay time/Signal", "Number for delay time in seconds, or string of wait-signal.", 0);
AddAction(31, 0, "Wait", "Wait", 
    "Wait <b>{0}</b>", 
    "Pending function execution until time-out or signal fired.", "Wait");   

AddAction(41, 0, "Stop task", "Task", 
    "Stop task", 
    "Stop current task", "ExitTask");
    
AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(51, 0, "Set default value", "Task variable", 
    "task.<b>{0}</b> set default to <b>{1}</b>", 
    "Set default value of task variable.", "SetTaskVarDefault");
    
AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "Value to set.");
AddStringParam("Task", 'Task name. Set to "" for current task.', '""');
AddAction(52, 0, "Set value", "Task variable", 
    "Set task.<b>{0}</b> to <b>{1}</b> (task: {2})", 
    "Set task variable.", "SetTaskVar"); 

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "Value to set.");
AddStringParam("Task", 'Task name. Set to "" for current task.', '""');
AddAction(53, 0, "Add to", "Global variable", 
    "Add <b>{1}</b> to task.<b>{0}</b> (task: {2})", 
    "Add to the value of task variable.", "AddToTaskVar");      

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(61, 0, "Set default value", "Global variable", 
    "global.<b>{0}</b> set default to <b>{1}</b>", 
    "Set default value of global variable.", "SetGlobalVarDefault");
    
AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "Value to set.");
AddAction(62, 0, "Set value", "Global variable", 
    "Set global.<b>{0}</b> to <b>{1}</b>", 
    "Set global variable.", "SetGlobalVar"); 

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "Value to set.");
AddAction(63, 0, "Add to", "Global variable", 
    "Add <b>{1}</b> to global.<b>{0}</b>", 
    "Add to the value of global variable.", "AddToGlobalVar");  

    
AddStringParam("Task", 'Task name. Set to "" for current task.', '""');
AddStringParam("Function", "Function name.", '""');
AddAction(71, 0, "Start", "Task - Control", 
          "Task <b>{0}</b>: start from function <i>{1}</i>", 
          "Start task.", "StartTask");     
    
AddStringParam("Left delimiter", 'Left delimiter. Set "" to use default delimiter "{{"', '"{{"');
AddStringParam("Right delimiter", 'Right delimiter. Set "" to use default delimiter "}}"', '"}}"');
AddAction(101, 0, "Set delimiters", "Mustache", 
         "Set delimiters to <i>{0}</i> <i>{1}</i>",
         "Set delimiters .", "SetDelimiters ");   
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get content", "Content", "Content", "Get content.");
    
AddStringParam("Expression", "Expression.", '""');
AddExpression(11, ef_return_string, "Define expression", "Expression", "Eval", "Define expression, this string will be evaluated to get a number or a string.");    

AddStringParam("Number", "Number expression.", '""')
AddExpression(12, ef_return_string, "Define number", "Expression", "Num", "Define expression, this string will be evaluated to get a number.");    

AddAnyTypeParam("String", "String expression.", '""');
AddExpression(13, ef_return_string, "Define raw string", "Expression", "Raw", "Define raw string.");    

AddStringParam("String", "String expression.", '""');
AddExpression(14, ef_return_string, "Define mustache string", "Expression", "Mustache", "Define string processed by mustache.");    


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Mustache", "Yes", "Enable to process string by Mustache templating engine.", "No|Yes"),
	new cr.Property(ept_text, "Left delimiter", "{{", 'Left delimiter. Set "" to use default delimiter "{{"'),
	new cr.Property(ept_text, "Right delimiter", "}}", 'Right delimiter. Set "" to use default delimiter "}}"'),       
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
