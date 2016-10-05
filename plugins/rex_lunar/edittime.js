function GetPluginSettings()
{
	return {
		"name":			"Lunar",
		"id":			"Rex_Solar2Lunar",
		"version":		"0.1",
		"description":	"Transfer date from solar to lunar (solar 1900~ 2049)",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_lunar.html",
		"category":		"Rex - Date & time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Year", "Year (1900~2049)", 2000);
AddNumberParam("Month", "Month (1~12)", 1);
AddNumberParam("Day", "Day (1~31)", 1);
AddAction(1, 0, "Solar to lunar", "Lunar", 
          "Transfer solar: year to <i>{1}</i>, month to <i>{2}</i>, day to <i>{3}</i> to lunar", 
          "Transfer date from solar to lunar.", "Solar2LunarSet");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get year", "Lunar", "Year", 
             "Get year value.");
AddExpression(2, ef_return_number, "Get month", "Lunar", "Month", 
             "Get month value.");
AddExpression(3, ef_return_number, "Get day", "Lunar", "Day", 
             "Get day value.");
AddExpression(4, ef_return_string, "Get leap", "Lunar", "IsLeap",
             "Get leap value, return 1 if leap.");
AddExpression(5, ef_return_string, "Get gan", "Lunar", "Gan", 
             "Get gan value.");
AddExpression(6, ef_return_string, "Get zhi", "Lunar", "Zhi", 
             "Get zhi value.");             
AddExpression(7, ef_return_string, "Get sheng-xiao", "Lunar", "ShengXiao", 
             "Get sheng-xiao value.");                       
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
