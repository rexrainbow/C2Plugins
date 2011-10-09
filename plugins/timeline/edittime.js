function GetPluginSettings()
{
	return {
		"name":			"TimeLine",
		"id":			"MyTimeLine",
		"description":	"TimeLine",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Utility",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddAnyTypeParam("Name", "Timer's name", '""');
AddCondition(0, 0, "Is timmer running", "Timer", "Is running", "", "IsRunning");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Function", "Function object for timer's callback");
AddAction(0, 0, "Setup timer", "Setup", 
          "Set timer's callback to <i>{0}</i>", 
          "Setup timer.", "Setup");
AddStringParam("Timer", "Timer's name", '""');
AddStringParam("CB", "Function name of timer's callback", '""');
//AddStringParam("Param", "Function parameters, in JSON format", '""');
AddAction(1, 0, "Create timer", "Timer", 
          "Create timer <i>{0}</i> with callback <i>{1}</i>", 
          "Create timer.", "CreateTimer");
AddStringParam("Name", "Timer's name.", '""');      
AddNumberParam("Time", "Time-out in seconds", 0);
AddAction(2, 0, "Start timer", "Timer", 
          "Start timer <i>{0}</i>, time-out is <i>{1}</i> seconds", 
          "Start timer.", "StartTimer");
AddNumberParam("Time", "Time-out in seconds", 0);
AddAction(3, 0, "Start triggered timer", "Timer", 
          "Start triggered timer, time-out is <i>{0}</i> seconds", 
          "Start triggered timer.", "StartTrgTimer");
AddStringParam("Name", "Timer's name.", '""');      
AddAction(4, 0, "Pause timer", "Timer", 
          "Pause timer <i>{0}</i>", 
          "Pause timer.", "PauseTimer");
AddStringParam("Name", "Timer's name.", '""');      
AddAction(5, 0, "Resume timer", "Timer", 
          "Resume timer <i>{0}</i>", 
          "Resume timer.", "ResumeTimer");          
AddStringParam("Name", "Timer's name.", '""');      
AddAction(6, 0, "Stop timer", "Timer", 
          "Stop timer <i>{0}</i>", 
          "Stop timer.", "StopTimer");          

//////////////////////////////////////////////////////////////
// Expressions


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
