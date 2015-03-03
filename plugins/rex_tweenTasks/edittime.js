function GetPluginSettings()
{
	return {
		"name":			"Tween tasks",
		"id":			"Rex_TweenTasks",
		"version":		"0.1",        
		"description":	"Run tasks of tween functions",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_tweentasks.html",
		"category":		"Rex - Logic",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions 
AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(0,	cf_trigger, "On function", "Function", 
             "On <b>{0}</b>", 
             "Triggered when a function is called.", "OnFunction");

AddStringParam("Name", "Name of task.", '"task"');
AddCondition(31, cf_trigger, "On task done", "Control", 
             "On task <b>{0}</b> done", 
             "Triggered when a task is done.", "OnTaskDone");

AddCondition(32, cf_trigger, "On any task done", "Control", 
             "On any task done", 
             "Triggered when any task is done.", "OnAnyTaskDone");

AddStringParam("Name", "Name of task.", '"task"');
AddCondition(51, 0, "Is task running", "Statis", 
             "<b>{0}</b> is running", 
             "Return true if task is running.", "IsRunning");
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Parameter", "Name of parameter.", '"x"');
AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParam("Type", "Function type of easing.", 0);
AddAction(1, 0, "Apply easing", "On function", "Apply <b>{1}</b> to function parameter <b>{0}</b>", 
          'Apply easing to function parameter, used under "Condition: On function"', "ApplyEasing");

AddStringParam("Task", "Name of task.", '"task"');
AddStringParam("Function", "The name of the function that is being called.", "\"\"");
AddNumberParam("Interval", "Interval, in seconds.", 1); 
AddNumberParam("Repeat", "Repeat count. 0 is infinty.", 1);
AddAction(11, 0, "New function task", "New - tween task", 
          "Create new task <b>{0}</b> to run function <b>{1}</b> with interval to <b>{2}</b>, repeat count to <b>{3}</b>", 
          "Create a new task to run functuion.", "NewTweenTask");
          
AddStringParam("Task", "Name of task.", '"task"');          
AddStringParam("Parameter", "Name of parameter.", '"x"');
AddNumberParam("Start", "Start value.", 0);          
AddNumberParam("End", "End value", 1); 
AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParam("Type", "Function type of easing.", 0); 
AddAction(12, 0, "Set parameter", "Function", 
          "Set task <b>{0}</b> 's function parameter <b>{1}</b>: <b>{4}</b> transform from <b>{2}</b> to <b>{3}</b>", 
          "Assign start and end value of a function parameter.", "SetFnParameter");

AddStringParam("Task", "Name of task.", '"task"');
AddNumberParam("Interval", "Wait interval, in seconds.", 1);
AddAction(13, 0, "New wait task", "New - wait task", 
          "Create new wait task <b>{0}</b> with interval to <b>{1}</b>", 
          "Create a new wait task.", "NewWaitTask");

AddStringParam("Task", "Name of task.", '"task"');
AddNumberParam("Repeat", "Repeat count. 0 is infinty.", 1); 
AddVariadicParams("Task {n}", "Tasks in sequence.");
AddAction(14, 0, "New sequence task", "New - group task", 
          "Create new task <b>{0}</b> to run children tasks (<b>{...}</b>) sequentially, repeat count to <b>{1}</b>", 
          "Create a new task to run tasks in sequence or parallel.", "NewSequenceTask");
          
AddStringParam("Task", "Name of task.", '"task"');
AddNumberParam("Repeat", "Repeat count. 0 is infinty.", 1); 
AddVariadicParams("Child task {n}", "Tasks in sequence.");
AddAction(15, 0, "New parallel task", "New - group task", 
          "Create new task <b>{0}</b> to run children tasks (<b>{...}</b>) parallel, repeat count to <b>{1}</b>", 
          "Create a new task to run tasks in sequence or parallel.", "NewParallelTask");    

AddStringParam("Task", "Name of task.", '"task"');
AddStringParam("child task", "Name of child task.", '"sub"');
AddAction(16, 0, "Add child task", "New - group task", 
          "Add child task <b>{1}</b> into group task <b>{0}</b>", 
          "Add child task into group task.", "AddChildTask");     
          
AddStringParam("Task", "Name of task.", '"task"');
AddStringParam("Inverse from", "Name of inversed task.", '""');
AddAction(17, 0, "New inversed task", "New - tween task", 
          "Create new task <b>{0}</b> inversed from task <b>{1}</b>", 
          "Create a new task inversed from function task.", "NewInversedTweenTask");
          
AddStringParam("Task", "Name of task.", '"task"');
AddStringParam("Signal", 'Name of waited signal.', '""');
AddAction(18, 0, "New wait for signal task", "New - wait for signal task", 
          "Create new wait for signal task <b>{0}</b>, wait for signal <b>{1}</b>", 
          "Create a new wait task.", "NewWaitForSignalTask");
          
AddStringParam("Task", "Name of task.", '""');          
AddAnyTypeParam("Parameter", "Name of parameter", '""');
AddAnyTypeParam("Value", "Value", 0);
AddAction(21, 0, "Set parameter", "Task parameter", 
          "Set parameter <b>{0}</b> to <b>{1}</b> of task <b>{2}</b>", 
          "Set a parameter of task.", "SetTaskParameter");

AddStringParam("Task", "Name of task.", '""');              
AddObjectParam("Instance", "Bound instance.");
AddComboParamOption("Keep");
AddComboParamOption("Destroy");
AddComboParam("Destroy", "Destroy bound instance after task done.", 0); 
AddAction(22, 0, "Bind instance", "Task parameter",
          "Bind instance {1} to task <b>{0}</b>, <b>{2}</b> instance after task done", 
          "Bind instance to task.", "BindInst");          
          
AddStringParam("Task", "Name of task.", '"task"');
AddComboParamOption("Keep");
AddComboParamOption("Destroy");
AddComboParam("Destroy", "Destroy task after task done.", 0);
AddAction(31, 0, "Start", "Control", 
          "Start task <b>{0}</b>, <b>{1}</b> after task done", 
          "Start task.", "StartTask");
           
AddStringParam("Task", "Name of task.", '"task"');
AddAction(32, 0, "Pause", "Control", 
          "Pause task <b>{0}</b>", 
          "Pause task.", "PauseTask");      
          
AddStringParam("Task", "Name of task.", '"task"');
AddAction(33, 0, "Resume", "Control", 
          "Resume task <b>{0}</b>", 
          "Resume task.", "ResumeTask");    
          
AddStringParam("Task", "Name of task.", '"task"');
AddAction(34, 0, "Destroy task", "Destroy", 
          "Destroy task <b>{0}</b>", 
          "Destroy task.", "DestroyTask");
          
AddStringParam("Task", "Name of task.", '"task"');
AddStringParam("Signal", 'Name of waited signal.', '""');
AddAction(41, 0, "Continue task", "Wait for signal", 
          "Continue task <b>{0}</b> with signal <b>{1}</b>", 
          "Continue task.", "ContinueTask");     
          
AddStringParam("Signal", 'Name of waited signal.', '""');
AddAction(42, 0, "Continue by signal", "Wait for signal", 
          "Continue all tasks with signal <b>{0}</b>", 
          "Continue task.", "ContinueTasksBySignal");           
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Parameter", "Name of parameter.", '"x"');
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get value of function parameter", "Function", "FnParam", 
              'Get tween value of parameter under "Condition:On function". Add "start", "end", or "delta" to 2nd parameter to get start or end or delta value.');

AddStringParam("Task", "Name of task.", '"task"');
AddStringParam("Parameter", "Parameter's name", '"x"');
AddExpression(21, ef_return_any, "Get value of task parameter", "Task", "TaskParam", 
              'Get value of task parameter.');
              
AddExpression(31, ef_return_string, "Get task name", "Task", "TaskName", 
              "Get task name."); 

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
