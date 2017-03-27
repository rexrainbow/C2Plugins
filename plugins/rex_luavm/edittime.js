function GetPluginSettings()
{
	return {
		"name":			"Lua VM",
		"id":			"Rex_luaVM",
		"version":		"0.1",        
		"description":	"Run lua script. The lua vm was referenced from http://kripken.github.io/lua.vm.js/lua.vm.js.html.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_luavm.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"luavm.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions       
AddCondition(11, cf_trigger, "On started", "Task", "On any task started", 
             "Triggered when task started.", "OnTaskStarted");
AddCondition(12, cf_trigger, "On resumed", "Task", "On any task resumed", 
             "Triggered when any task resumed.", "OnTaskResumed");          
AddCondition(13, cf_trigger, "On finished", "Task", "On any task finished", 
             "Triggered when any task finished.", "OnTaskFinished");                   
AddCondition(14, cf_trigger, "On killed", "Task", "On any task killed", 
             "Triggered when any task killed.", "OnTaskKilled");   
AddCondition(15, cf_trigger, "On suspended", "Task", "On any task suspended", 
             "Triggered when any task suspended.", "OnTaskSuspended");                            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Code", "Lua script", "");
AddAction(1, 0, "Run script", "Run", 
          "Run script: <i>{0}</i>", 
          "Run script.", "RunScript");
AddStringParam("Task", "Task name", "");
AddStringParam("Function", "Function name", "");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(10, 0, "Start ", "Task - Start", 
          "Start task: <i>{0}</i> with function: <i>{1}</i> (<i>{...}</i>)", 
          "Start task with a lua function.", "TaskStart");	
AddStringParam("Task", "Task name", "");
AddAction(11, 0, "Resume", "Task - Resume", 
          "Resume task: <i>{0}</i>", 
          "Resume task.", "TaskResume");	
AddStringParam("Task", "Task name", "");
AddAction(12, 0, "Kill", "Task - Kill", 
          "Kill task: <i>{0}</i>", 
          "Kill task.", "TaskKill");   
AddAction(13, 0, "Kill all", "Task - Kill", 
          "Kill all tasks", 
          "Kill all tasks.", "TaskKillAll");
AddStringParam("Task", "Task name", "");
AddStringParam("Key", "Key", "");
AddAction(14, 0, "Resume with key", "Task - Resume", 
          "Resume task: <i>{0}</i> with key to <i>{1}</i>", 
          "Resume task with key.", "TaskResume");                     
AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(41, 0, "Setup", "Setup", 
          "Get timer from <i>{0}</i>", 
          "Setup.", "Setup2");	
   		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, "Get task name", 
              "Task", "TaskName", 
              "Get task name at triggered condition."); 
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
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
