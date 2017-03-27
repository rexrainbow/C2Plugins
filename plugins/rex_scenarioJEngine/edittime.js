function GetPluginSettings()
{
	return {
		"name":			"ScenarioJ Engine",
		"id":			"Rex_ScenarioJEngine",
		"version":		"0.1",        
		"description":	"Execute Scenario-Json commands.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_scenariojengine.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"mustache.min.js",    
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Task", "Task name", '""');
AddCondition(0, cf_trigger, "On task done", "Control", "On task <i>{0}</i> done", 
             "Triggered when task executed completed.", "OnTaskDone");
             
AddCondition(1, cf_trigger, "On any task done", "Control", "On any task done", 
             "Triggered when any task executed completed.", "OnAnyTaskDone");             
             
AddStringParam("Task", "Task name", '""');   
AddCondition(2, 0, "Is running", "Control", "Task <i>{0}</i>: is running", 
             "Is task running.", "IsTaskRunning");
             
AddStringParam("Function", "Function name.", '""');             
AddCondition(3, 0, "Is function existed", "Function", "Is function <i>{0}</i> existed", 
             "Return true if function is existed.", "IsFunctionExisted");

AddCondition(4, cf_trigger, "On function scope changed", "Function", "On function scope changed", 
             "Triggered when function scope changed.", "OnFunctionScopeChanged");         
             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Clean commands", "0: Load", 
          "Clean all commands", 
          "Clean all commands.", "CleanCmds");
          
AddStringParam("Commands", "Commands in JSON format", '""');
AddAction(2, 0, "Append", "0: Load", 
          "Append commands <i>{0}</i>", 
          "Append commands.", "AppendCmds");  
          
AddObjectParam("Editor", "ScenarioJ Editor");
AddAction(3, 0, "Append from editor", "0: Load", 
          "Append commands from <i>{0}</i>, then clean the editor", 
          "Append commands from editor, then clean the editor.", "AppendCmdsFromEditor");	           

AddStringParam("Task", "Task name", '""');
AddStringParam("Function", "Function name.", '""');
AddAction(11, 0, "Start", "Task - Control", 
          "Task <b>{0}</b>: start from function <i>{1}</i>", 
          "Start task.", "StartTask");  

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(12, 0, "Set parameter", "Function", 
    "Set parameter <b>{0}</b> to <i>{1}</i>", 
    "Set parameter of function.", "SetFunctionParameter");    

AddStringParam("Task", "Task name", '""');    
AddStringParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "value.");
AddAction(13, 0, "Set local variable", "Task", 
    "Task <b>{0}</b>: set local.<b>{1}</b> to <i>{2}</i>", 
    "Set local variable of a task.", "SetLocalValue"); 
    
AddStringParam("Task", "Task name", '""');    
AddStringParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "value.");
AddAction(14, 0, "Set task variable", "Task", 
    "Task <b>{0}</b>: set task.<b>{1}</b> to <i>{2}</i>", 
    "Set task variable.", "SetTaskValue");    
    
AddStringParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "value.");
AddAction(15, 0, "Set global variable", "Global", 
    "Set global.<b>{0}</b> to <i>{1}</i>", 
    "Set global variable.", "SetGlobalValue");  

AddStringParam("Task", "Task name", '""');    
AddStringParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "value.");
AddAction(16, 0, "Add to local variable", "Task", 
    "Task <b>{0}</b>: add <b>{2}</b> to local.<b>{1}</b>", 
    "Set local variable of a task.", "AddToLocalVar"); 
    
AddStringParam("Task", "Task name", '""');    
AddStringParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "value.");
AddAction(17, 0, "Add to task variable", "Task", 
    "Task <b>{0}</b>: add <b>{2}</b> to task.<b>{1}</b>", 
    "Set task variable.", "AddToTaskVar");    
    
AddStringParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "value.");
AddAction(18, 0, "Add to global variable", "Global", 
    "Add <b>{1}</b> to global.<b>{0}</b>", 
    "Set global variable.", "AddToGlobalVar");      

AddStringParam("Signl", "Signl name.", '""');         
AddAction(21, 0, "Fire signal", "Wait - Signal", 
          "Fire signal <i>{0}</i>", 
          "Fire signal to resume task.", "FireSignal");     

AddStringParam("Task", "Task name", '""');
AddAction(31, 0, "Stop", "Task - Control", 
          "Task <b>{0}</b>: stop", 
          "Stop task.", "StopTask");      
    
AddStringParam("Task", "Task name", '""');
AddAction(32, 0, "Pause", "Task - Control", 
           "Task <b>{0}</b>: pause", 
           "Pause task.", "PauseTask"); 
          
AddStringParam("Task", "Task name", '""');          
AddAction(33, 0, "Resume", "Task - Control", 
           "Task <b>{0}</b>: resume", 
           "Rsume task.", "ResumeTask");           

AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(41, 0, "Setup timeline", "Setup", 
          "Get timer from <i>{0}</i>", 
          "Setup timeline.", "SetupTimeline");	
          
AddComboParamOption("Official function");
AddComboParamOption("Rex function2");
AddComboParam("Callback", "Callback object.",0);          
AddAction(42, 0, "Setup callback", "Setup", 
          "Set callback to <i>{0}</i>", 
          "Setup callback.", "SetupCallback");	

AddStringParam("Status", "Saved status in JSON string", '""');
AddAction(101, 0, "Load status", "Status", 
          "Load status from <i>{0}</i>", 
          "Load status from JSON string.", "LoadStatus"); 

AddAction(102, 0, "Clean status", "Status", 
          "Clean status", 
          "Clean all tasks and global variables.", "CleanStatus");  
                     
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, "Get last finished task name",  "Task", "LastTaskName",  "Get last finished task name."); 

//AddStringParam("Task", "Task name", '""');
AddExpression(3, ef_return_string | ef_variadic_parameters, "Get last function name",  "Function", "LastFunctionName",  
    'Get last function name under "Condition: On function scope changed". Or add 1st parameter for task name to get last function name of a specific task.'); 

AddStringParam("Task", "Task name", '""');
AddStringParam("Variable", "Variable name", '""');
// AddAnyTypeParam("Value", "The default value.");
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get current local variable value",  "Task", "LocalVar",  
    "Get current local variable value in a function. Add 3rd parameter for default value if this variable is not existed."); 

AddStringParam("Task", "Task name", '""');
AddStringParam("Variable", "Variable name", '""');
// AddAnyTypeParam("Value", "The default value.");
AddExpression(12, ef_return_any | ef_variadic_parameters, "Get task's variable value",  "Task", "TaskVar", 
    "Get task's variable value. Add 3rd parameter for default value if this variable is not existed."); 

AddStringParam("Variable", "Variable name", '""');
// AddAnyTypeParam("Value", "The default value.");
AddExpression(13, ef_return_any | ef_variadic_parameters, "Get global variable value",  "Global", "GlobalVar",  
    "Get global variable value. Add 2nd parameter for default value if this variable is not existed."); 

AddExpression(101, ef_return_string, "Get status",  "Status", "StatusAsJSON",  "Get status in JSON string."); 

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "No", "Enable to show log.", "No|Yes"),       
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
