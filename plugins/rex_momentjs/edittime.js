function GetPluginSettings()
{
	return {
		"name":			"Moment",
		"id":			"Rex_MomenJS",
		"version":		"0.1",
		"description":	"Parse, validate, manipulate, and display dates. http://momentjs.com/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_momenjs.html",
		"category":		"Rex - Date & time - Moment",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"moment-with-locales.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Date", "Date string.", '"2016-01-01"');
AddStringParam("Format", 'Date string. Set to "" to ignore format setting.', '"YYYY-MM-DD"');
AddComboParamOption("");
AddComboParamOption(" strict");
AddComboParam("Strict mode", "Strict mode.", 1);
AddCondition(1, 0, "Is valid", "Date string", "<i>{0}</i> (<i>{1}</i><i>{2}</i>) is valid", "Return true if data string is valid.", "DateStringIsValid");

AddCondition(2, 0, "Is leap year", "Leap Year", "Is Leap Year", "Return true if data is leap year .", "IsLeapYear ");

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Current date", "Set", "Set date to current date", "Set date to current date.", "SetToCurrentDate");

AddNumberParam("Unix timestamp", "Unix timestamp.", 0);
AddAction(2, 0, "Unix timestamp", "Set", "Set date to <i>{0}</i>", "Set date from unix timestamp.", "SetFromUnixTimestamp");

AddStringParam("Date", "Date string.", '"2016-01-01"');
AddStringParam("Format", 'Date string. Set to "" to use ISO 8601 format.', '""');
AddAction(3, 0, "Date string", "Set", "Set date to <i>{0}</i> (<i>{1}</i>)", "Set date from string.", "SetFromString");

AddObjectParam("Moment", "Moment object for cloning");
AddAction(4, 0, "Clone", "Set", "Clone date from <i>{0}</i>", "Clone date from another moment object.", "Clone"); 

AddNumberParam("Amount", "Amount.", 0);
AddComboParamOption("years");
AddComboParamOption("quarters");
AddComboParamOption("months");
AddComboParamOption("weeks");
AddComboParamOption("days");
AddComboParamOption("hours");
AddComboParamOption("minutes");
AddComboParamOption("seconds");
AddComboParamOption("milliseconds");
AddComboParam("Type", "Type.", 0);
AddAction(5, 0, "Set component", "Set", "Set <i>{0}</i> <i>{1}</i>", "Set date component.", "SetComponent");

AddNumberParam("Amount", "Amount.", 0);
AddComboParamOption("years");
AddComboParamOption("quarters");
AddComboParamOption("months");
AddComboParamOption("weeks");
AddComboParamOption("days");
AddComboParamOption("hours");
AddComboParamOption("minutes");
AddComboParamOption("seconds");
AddComboParamOption("milliseconds");
AddComboParam("Type", "Type.", 0);
AddAction(11, 0, "Add to", "Add", "Add <i>{0}</i> <i>{1}</i> to date", "Add to date.", "Add");

AddNumberParam("Amount", "Amount.", 0);
AddAnyTypeParam("Type", 'Type, in number(4) or string("days").', '""');
AddAction(12, 0, "Add # to", "Add", "Add <i>{0}</i> <i>{1}</i> to date", "Add to date.", "Add");

AddStringParam("Locale", "Locale.", '"en"');
AddAction(101, 0, "Set locale", "Locale", "Set locale to <i>{0}</i>", "Set locale.", "SetLocale");
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get year", "Date", "Year", "Get year.");
AddExpression(2, ef_return_number, "Get month", "Date", "Month", "Get month (0 - 11).");
AddExpression(3, ef_return_number, "Get day number", "Date", "Date", "Get day number.");
AddExpression(4, ef_return_number, "Get day name", "Date", "Day", "Get day name.");

AddExpression(5, ef_return_number, "Get hours", "Time", "Hours", "Get hours.");
AddExpression(6, ef_return_number, "Get minutes", "Time", "Minutes", "Get minutes.");
AddExpression(7, ef_return_number, "Get seconds", "Time", "Seconds", "Get seconds.");
AddExpression(8, ef_return_number, "Get milliseconds", "Time", "Milliseconds", "Get milliseconds.");

AddExpression(9, ef_return_number,  "Get unix timestamp", "UnixTimestamp", "UnixTimestamp", "Get current number of milliseconds since the epoch.");

AddExpression(10, ef_return_number, "Get quarter", "Date", "Quarter", "Get quarter (1,2,3,4).");
              
AddExpression(11, ef_return_string | ef_variadic_parameters, "Get format date string", "Format", "Format", "Get format date string. Add 1st parameter to assign format.");    
AddExpression(12, ef_return_string, "Get ISO date string", "Format", "ISO", "Get ISO date string.");  

AddExpression(21, ef_return_number, "Get the number of days in month", "Month", "DaysInMonth", "Get the number of days in the current month.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(31, ef_return_number | ef_variadic_parameters, "Get the elapsed in years", "Elapsed", "ElapsedYears", "Get the elapsed in years. Add 1 at 2nd parameter to get float result.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(32, ef_return_number | ef_variadic_parameters, "Get the elapsed in months", "Elapsed", "ElapsedMonths", "Get the elapsed in months. Add 1 at 2nd parameter to get float result.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(33, ef_return_number | ef_variadic_parameters, "Get the elapsed in days", "Elapsed", "ElapsedDays", "Get the elapsed in days. Add 1 at 2nd parameter to get float result.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(34, ef_return_number | ef_variadic_parameters, "Get the elapsed in hours", "Elapsed", "ElapsedHours", "Get the elapsed in hours. Add 1 at 2nd parameter to get float result.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(35, ef_return_number | ef_variadic_parameters, "Get the elapsed in minutes", "Elapsed", "ElapsedMinutes", "Get the elapsed in minutes. Add 1 at 2nd parameter to get float result.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(36, ef_return_number | ef_variadic_parameters, "Get the elapsed in seconds", "Elapsed", "ElapsedSeconds", "Get the elapsed in seconds. Add 1 at 2nd parameter to get float result.");

AddAnyTypeParam("Previous", "Unix timestamp or date string of previoud date.", 0);
AddExpression(37, ef_return_number | ef_variadic_parameters, "Get the elapsed in milliseconds", "Elapsed", "ElapsedMilliseconds", "Get the elapsed in milliseconds.");
          
AddExpression(41, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start year", "Start of", "StartOfYear", "Get the unix timestamp of start year.");
AddExpression(42, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start month", "Start of", "StartOfMonth", "Get the unix timestamp of start month.");
AddExpression(43, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start quarter", "Start of", "StartOfQuarter", "Get the unix timestamp of start quarter.");
AddExpression(44, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start week", "Start of", "StartOfWeek", "Get the unix timestamp of start week.");
AddExpression(45, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start date", "Start of", "StartOfDate", "Get the unix timestamp of start date.");
AddExpression(46, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start hour", "Start of", "StartOfHour", "Get the unix timestamp of start hour.");
AddExpression(47, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start minute", "Start of", "StartOfMinute", "Get the unix timestamp of start minute.");         
AddExpression(48, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start second", "Start of", "StartOfSecond", "Get the unix timestamp of start second.");         
AddExpression(49, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of start iso week", "Start of", "StartOfISOWeek", "Get the unix timestamp of start iso week.");         

AddExpression(51, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end year", "End of", "EndOfYear", "Get the unix timestamp of end year.");
AddExpression(52, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end month", "End of", "EndOfMonth", "Get the unix timestamp of end month.");
AddExpression(53, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end quarter", "End of", "EndOfQuarter", "Get the unix timestamp of end quarter.");
AddExpression(54, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end week", "End of", "EndOfWeek", "Get the unix timestamp of end week.");
AddExpression(55, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end date", "End of", "EndOfDate", "Get the unix timestamp of end date.");          
AddExpression(56, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end hour", "End of", "EndOfHour", "Get the unix timestamp of end hour.");  
AddExpression(57, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end minute", "End of", "EndOfMinute", "Get the unix timestamp of end minute.");  
AddExpression(58, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end second", "End of", "EndOfSecond", "Get the unix timestamp of end second.");          
AddExpression(59, ef_return_any | ef_variadic_parameters, "Get the unix timestamp or date string of end iso week", "End of", "EndOfISOWeek", "Get the unix timestamp of end isoWeek.");   


AddExpression(101, ef_return_string, "Get locale", "Locale", "Locale", "Get locale.");  
    
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
