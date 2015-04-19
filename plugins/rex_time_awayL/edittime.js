function GetPluginSettings()
{
	return {
		"name":			"Time away L",
		"id":			"Rex_TimeAwayL",
		"version":		"0.1",
		"description":	"Get elapsed interval of turned off game from local storage.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_timeawayl.html",
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
AddCondition(11, cf_trigger, "On elapsed time get", "Timer", 
             "On elapsed time <i>{0}</i> get", 
             'Triggered after "action: Get elapsed time", get elapsed time by "expression:ElapsedTime".', "OnGetElapsedTime");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Key", "Key name of local storage", '""');
AddAction(1, 0, "Start timer", "Timer", 
          "Start timer <i>{0}</i>", 
          "Start timer.", "StartTimer");

AddStringParam("Key", "Key name of local storage", '""');
AddAction(11, 0, "Get elapsed time", "Timer", 
          "Get elapsed time <i>{0}</i>", 
          "Get elapsed time.", "GetElapsedTime");
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
