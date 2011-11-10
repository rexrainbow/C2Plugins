function GetPluginSettings()
{
	return {
		"name":			"Batch AJAX",
		"id":			"Rex_BatchAJAX",
		"description":	"Batch request and receive other web pages.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Web",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On completed", "AJAX", "On all completed", "Triggered when all AJAX requests completes successfully.", "OnComplete");
AddCondition(1,	cf_trigger, "On error", "AJAX", "On any error", "Triggered when any AJAX request fails.", "OnError");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Tag", "Name of tag.", "\"\"");
AddStringParam("URL", "The URL to request.", "\"http://\"");
AddAction(0, 0, "Add request", "AJAX", "Add Request <i>{1}</i> (tag <i>{0}</i>)", "Add a request.", "AddRequest");
AddAction(1, 0, "Requests start", "AJAX", "Batch ajax request start", "Batch request URL and retrieve its contents.", "RequestStart");
AddAction(2, 0, "Clean data", "Setup", "Clean all received data", "Clean all received data.", "Clean");

//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Tag", "Name of tag.", '""');
AddExpression(0, ef_return_string | ef_variadic_parameters, "Get data", "AJAX", "Data", "Get the data returned by the successful request.");
AddExpression(1, ef_return_string, "Get error tag", "AJAX", "ErrorTag", "Get error tag on request fails condition.");

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
