function GetPluginSettings()
{
	return {
		"name":			"Time away L",
		"id":			"Rex_TimeAwayL",
		"version":		"0.1",
		"description":	"Get elapsed interval of turned off game from local storage.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_timeawayl.html",
		"category":		"Rex - Date & time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(5, cf_trigger, "On error", "Local storage", 
             "On error", 
             "Triggered if any error occurs while accessing local storage.", "OnError");

AddStringParam("Key", "Key name of local storage", '""');
AddCondition(11, cf_trigger, "On get time", "Timer", 
             "On get time <i>{0}</i>", 
             'Triggered after "action: Get timer", get elapsed time by "expression:ElapsedTime".', "OnGetTimer");
             
AddStringParam("Key", "Key name of local storage", '""');
AddCondition(12, cf_trigger, "On start timer", "Timer", 
             "On start timer <i>{0}</i>", 
             'Triggered after "action: Start", when the timer has been written to local storage.', "OnStartTimer");             
             
AddStringParam("Key", "Key name of local storage", '""');
AddCondition(13, cf_trigger, "On remove timer", "Timer", 
             "On remove timer <i>{0}</i>", 
             'Triggered after "action: Remove", when the timer has been deleted from local storage.', "OnRemoveTimer");
             
AddStringParam("Key", "Key name of local storage", '""');
AddCondition(14, cf_trigger, "On pause timer", "Timer", 
             "On pause timer <i>{0}</i>", 
             'Triggered after "action: Pause", when the timer has been written to local storage.', "OnPauseTimer");             
             
AddStringParam("Key", "Key name of local storage", '""');
AddCondition(15, cf_trigger, "On resume timer", "Timer", 
             "On resume timer <i>{0}</i>", 
             'Triggered after "action: Resume", when the timer has been written to local storage.', "OnResumeTimer");  
             
AddStringParam("Key", "Key name of local storage", '""');             
AddCondition(21, 0, "Is valid", "Valid", 
            "Is valid",
            "Return true if get valid timer.", "IsValid");               

             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Key", "Key name of local storage", '""');
AddAction(1, 0, "Start", "Timer", 
          "Start timer <i>{0}</i>", 
          "Start timer.", "StartTimer");

AddStringParam("Key", "Key name of local storage", '""');
AddAction(2, 0, "Remove", "Timer", 
          "Remove timer <i>{0}</i>", 
          "Remove timer.", "RemoveTimer");
          
AddStringParam("Key", "Key name of local storage", '""');
AddAction(3, 0, "Pause", "Timer", 
          "Pause timer <i>{0}</i> ", 
          "Pause timer.", "PauseTimer");

AddStringParam("Key", "Key name of local storage", '""');
AddAction(4, 0, "Resume", "Timer", 
          "Resume timer <i>{0}</i> ", 
          "Resume timer.", "ResumeTimer");
          
AddStringParam("Key", "Key name of local storage", '""');
AddAction(5, 0, "Get or start", "Timer", 
          "Get or start timer <i>{0}</i>", 
          "Get or start timer if the timer does not exist.", "GetORStartTimer");          
          
          
AddStringParam("Key", "Key name of local storage", '""');
AddAction(11, 0, "Get", "Timer", 
          "Get timer <i>{0}</i>", 
          "Get timer.", "GetTimer");
          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Error message", "Local storage", "ErrorMessage", 
              "In 'On error', an error message if any available.");

//AddStringParam("Key", "Key name of local storage", '""');
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get elapsed time", "Timer", "ElapsedTime", 
             "Get elapsed time of timer, in seconds. Add timer name at 1st paramete.");
             
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
