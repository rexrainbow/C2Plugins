function GetPluginSettings()
{
	return {
		"name":			"Time away",
		"id":			"Rex_TimeAway",
		"version":		"0.1",
		"description":	"Get elapsed interval from webstroage",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Key", "Key name of webstorage", "\"\"");
AddNumberParam("Day", "Elapsed day count", 1);
AddCondition(1,0,"Day elapsed","Days","<i>{1}</i> day elapsed in key <i>{0}</i>","Return true if days elapsed.","DaysElapsed");

//////////////////////////////////////////////////////////////
// Actions

//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Key", "Key name of webstorage", "\"\"");
AddExpression(1, ef_return_number, "Get elapsed interval", "Interval", "ElapsedInterval", 
             "Get elapsed interval from last call, in seconds.");
AddExpression(2, ef_return_number, "Get elapsed days", "Days", "ElapsedDays", 
             'Get elapsed days, valid under "condition: Is a day elapsed". ');
			 
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
