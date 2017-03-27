function GetPluginSettings()
{
	return {
		"name":			"Web page reader",
		"id":			"Rex_webpage_reader",
		"version":		"0.1",        
		"description":	"Read web page by cross domain request.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_webpage_reader.html",
		"category":		"Rex - Web - YQL",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"jquery.xdomainajax.js"		
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different page requests.", "\"\"");
AddCondition(0,	cf_trigger, "On completed", "Page", "On <b>{0}</b> completed", "Triggered when an page request completes successfully.", "OnComplete");

AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different page requests.", "\"\"");
AddCondition(1,	cf_trigger, "On error", "Page", "On <b>{0}</b> error", "Triggered when an page request fails.", "OnError");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different page requests.", "\"\"");
AddStringParam("URL", "The page URL to request.", "\"http://\"");
AddAction(0, 0, "Request page", "Page", "Request <b>{1}</b> (tag <i>{0}</i>)", "Request a page.", "Request");


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get last data", "Page", "LastData", "Get the data returned by the last successful page request.");

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
