function GetPluginSettings()
{
	return {
		"name":			"Date",
		"id":			"Rex_Date",
		"version":		"1.0",
		"description":	"Get system data and time",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_date.html",
		"category":		"Rex - Date & time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Name", "The name of timer.", "0");
AddAction(0, 0, "Start", "Timer", "Start timer <i>{0}</i> ", "Start a timer.", "StartTimer");

AddAnyTypeParam("Name", "The name of timer.", "0");
AddAction(1, 0, "Pause", "Timer", "Pause timer <i>{0}</i> ", "Pause a timer.", "PauseTimer");

AddAnyTypeParam("Name", "The name of timer.", "0");
AddAction(2, 0, "Resume", "Timer", "Resume timer <i>{0}</i> ", "Resume a timer.", "ResumeTimer");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, 
             "Get current year or transfer year from unix timestamp", "Date", "Year", 
             "Get current year, or add unix timestamp at first parameter to transfer year from unix timestamp.");
AddExpression(1, ef_return_number | ef_variadic_parameters, 
              "Get current month or transfer month from unix timestamp", "Date", "Month", 
              "Get current month, or add unix timestamp at first parameter to transfer month from unix timestamp.");
AddExpression(2, ef_return_number | ef_variadic_parameters, 
              "Get current day number or transfer day number from unix timestamp", "Date", "Date", 
              "Get current day number, or add unix timestamp at first parameter to transfer day number from unix timestamp.");
AddExpression(3, ef_return_number | ef_variadic_parameters, 
              "Get current day name or transfer day name from unix timestamp", "Date", "Day", 
              "Get current day name, or add unix timestamp at first parameter to transfer day name from unix timestamp.");
AddExpression(4, ef_return_number | ef_variadic_parameters, 
              "Get current hours or transfer hours from unix timestamp", "Time", "Hours", 
              "Get current hours, or add unix timestamp at first parameter to transfer hours from unix timestamp.");
AddExpression(5, ef_return_number | ef_variadic_parameters, 
              "Get current minutes or transfer minutes from unix timestamp", "Time", "Minutes", 
              "Get current minutes, or add unix timestamp at first parameter to transfer minutes from unix timestamp.");
AddExpression(6, ef_return_number | ef_variadic_parameters, 
              "Get current seconds or transfer seconds from unix timestamp", "Time", "Seconds", 
              "Get current seconds, or add unix timestamp at first parameter to transfer seconds from unix timestamp.");
AddExpression(7, ef_return_number | ef_variadic_parameters, 
              "Get current milliseconds or transfer milliseconds from unix timestamp", "Time", "Milliseconds", 
              "Get current milliseconds, or add unix timestamp at first parameter to transfer milliseconds from unix timestamp.");
AddAnyTypeParam("0", "The name of timer to get.", "0");
AddExpression(8, ef_return_number | ef_variadic_parameters, 
              "Get escaped seconds", "Timer", "Timer", "Get escaped seconds of timer.");
AddExpression(9, ef_deprecated | ef_return_number, 
              "Get current ticks", "Timer", "CurTicks", "Get current ticks of timer in milliseconds. (Date.getTime())");
AddExpression(10, ef_return_number | ef_variadic_parameters, 
              "Get current unix timestamp", "UnixTimestamp", "UnixTimestamp", "Get current number of milliseconds since the epoch.");
AddNumberParam("Year", "Year, start with 0.", 0);
AddNumberParam("Month", "Month, start with 1.", 1);
AddNumberParam("Day", "Day, start with 1.", 1);
//AddNumberParam("Hours", "Hours, start with 0.", 0);
//AddNumberParam("Minutes", "Minutes, start with 0.", 0);
//AddNumberParam("Seconds", "Seconds, start with 0.", 0);
//AddNumberParam("Milliseconds", "Milliseconds, start with 0.", 0);
AddExpression(11, ef_return_number | ef_variadic_parameters, 
              "Convert date to unix timestamp", "UnixTimestamp", "Date2UnixTimestamp", 
              'Convert date to unix timestamp, the full parameters are "Year,Month,Day,Hours,Minutes,Seconds,Milliseconds"');

AddExpression(21, ef_return_string | ef_variadic_parameters, "Get local expression", "Local", "LocalExpression", 
              "Transfer current date to local expression, or add unix timestamp at 1st parameter to transfer from unix timestamp.");
              
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
