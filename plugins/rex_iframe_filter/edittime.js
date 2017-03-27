function GetPluginSettings()
{
	return {
		"name":			"Iframe filter",
		"id":			"Rex_IframeFilter",
		"version":		"0.8",
		"description":	"Check if current page is in an iframe or not.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_iframe_filter.html",
		"category":		"Rex - Iframe",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_deprecated, "Is acceptable", "Check", "Is in acceptable iframe", 
             "Check If current page is not in iframe or in acceptable iframe.", "Check");

AddCondition(21, 0, "Is in iframe", "iframe", "Is in iframe", 
             "Return true if this application is in an iframe.", "IsInIframe");             

//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("URL", "The URL in white-list.", '""');
AddAction(1, af_deprecated, "Append", "White-list", "Append <i>{0}</i> into white-list", "Append a url into white-list.", "Append");
AddStringParam("JSON string", "JSON string.", '""');
AddAction(2, af_deprecated, "Set", "White-list", "Set white-list to JSON string <i>{0}</i>", "Set white-list to JSON string.", "SetJSON");

AddAction(11, 0, "Redirect to original", "Redirection", "Redirect top url to my original url", "Redirect top url to my url.", "Redirection");   
AddStringParam("URL", "The URL in white-list.", '""');
AddAction(12, 0, "Redirect to", "Redirection", "Redirect top url to <i>{0}</i>", "Redirect top url to a specific url.", "Redirection");
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(21, ef_deprecated | ef_return_string, "Get URL of main frame", "Main frame", "MainFrameURL", 
    'Get URL of main frame. Retrun "" if this application is in a main frame.');

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
