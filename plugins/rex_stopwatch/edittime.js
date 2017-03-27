function GetPluginSettings()
{
	return {
		"name":			"Stopwatch",
		"id":			"Rex_Stopwatch",
		"version":		"0.1",        
		"description":	"Accumulate escaped time.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_stopwatch.html",
		"category":		"Rex - Date & time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddAnyTypeParam("Name", "Timer's name", '""');
AddCondition(0, 0, "Is timmer running", "Timer", 
             "<i>{0}</i> is running", 
             "Return true if timer is running.", "IsRunning");

//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Name", "The name of timer.", 0);
AddNumberParam("Start", "Start at time.", 0);
AddAction(1, 0, "Start timer", "Create", "Start timer <i>{0}</i> at <i>{1}</i>", "Start timer.", "StartTimer");

AddAnyTypeParam("Name", "The name of timer.", 0);
AddAction(2, 0, "Pause timer", "Control", "Pause timer <i>{0}</i> ", "Pause timer.", "PauseTimer");

AddAnyTypeParam("Name", "The name of timer.", 0);
AddAction(3, 0, "Resume timer", "Control", "Resume timer <i>{0}</i> ", "Resume timer.", "ResumeTimer");

AddAnyTypeParam("Name", "The name of timer.", 0);
AddAction(4, 0, "Destroy timer", "Destroy", "Destroy timer <i>{0}</i> ", "Destroy timer.", "DestroyTimer");

AddAnyTypeParam("Name", "The name of timer.", 0);
AddAction(5, 0, "Toggle timer", "Control", "Toggle timer <i>{0}</i> ", "Toggle timer.", "ToggleTimer");

AddAnyTypeParam("Name", "The name of timer.", 0);
AddNumberParam("Offset", "Offset to time.", 0);
AddAction(6, 0, "Shift escaped time", "Time", "Shift timer <i>{0}</i> to <i>{1}</i>", "Shift current escaped time.", "ShiftTimer");
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("0", "The name of timer to get.", "0");
AddExpression(5, ef_return_number, 
              "Get escaped time", "Timer", "EscapedTime", "Get escaped time in seconds.");

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
