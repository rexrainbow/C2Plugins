function GetPluginSettings()
{
	return {
		"name":			"Date",
		"id":			"Rex_Date",
		"version":		"1.0",
		"description":	"Data and time",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Time",
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
AddAction(0, 0, "Start timer", "Timer", "Start timer <i>{0}</i> ", "Start a timer.", "StartTimer");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Get current year", "Date", "Year", "Get current year from system.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get current month", "Date", "Month", "Get current month from system.");
AddExpression(2, ef_return_number | ef_variadic_parameters, "Get current day number", "Date", "Date", "Get current day number from system.");
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get current day name", "Date", "Day", "Get current day name from system.");
AddExpression(4, ef_return_number | ef_variadic_parameters, "Get current hours", "Time", "Hours", "Get current hours from system.");
AddExpression(5, ef_return_number | ef_variadic_parameters, "Get current minutes", "Time", "Minutes", "Get current minutes from system.");
AddExpression(6, ef_return_number | ef_variadic_parameters, "Get current seconds", "Time", "Seconds", "Get current seconds from system.");
AddExpression(7, ef_return_number | ef_variadic_parameters, "Get current milliseconds", "Time", "Milliseconds", "Get current milliseconds from system.");
AddAnyTypeParam("0", "The name of timer to get.", "0");
AddExpression(8, ef_return_number | ef_variadic_parameters, "Get escaped ticks", "Timer", "Timer", "Get escaped ticks of timer in milliseconds.");
AddExpression(9, ef_deprecated | ef_return_number, "Get current ticks", "Timer", "CurTicks", "Get current ticks of timer in milliseconds. (Date.getTime())");
AddExpression(10, ef_return_number, "Get current unix timestamp", "UnixTimestamp", "UnixTimestamp", "Get current number of milliseconds since the epoch.");
AddNumberParam("Year", "Year, start with 0.", 0);
AddNumberParam("Month", "Month, start with 1.", 1);
AddNumberParam("Day", "Day, start with 1.", 1);
AddNumberParam("Hours", "Hours, start with 0.", 0);
AddNumberParam("Minutes", "Minutes, start with 0.", 0);
AddNumberParam("Seconds", "Seconds, start with 0.", 0);
AddNumberParam("Milliseconds", "Milliseconds, start with 0.", 0);
AddExpression(11, ef_return_number, "Convert date to unix timestamp", "UnixTimestamp", "Date2UnixTimestamp", "Convert date to unix timestamp.");

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
