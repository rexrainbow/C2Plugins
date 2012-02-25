function GetPluginSettings()
{
	return {
		"name":			"Iframe filter",
		"id":			"Rex_IframeFilter",
		"description":	"Check if current page is not in iframe, or in acceptable iframe.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Utility",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Is acceptable", "Check", "Is in acceptable iframe", 
             "Check If current page is not in iframe or in acceptable iframe.", "Check");

//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("URL", "The URL in white-list.", '""');
AddAction(1, 0, "Append", "White-list", "Append <i>{0}</i> into white-list", "Append a url into white-list.", "Append");
AddStringParam("JSON string", "JSON string.", '""');
AddAction(2, 0, "Set", "White-list", "Set white-list to JSON string <i>{0}</i>", "Set white-list to JSON string.", "SetJSON");
   
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Busting all iframes", "No", "Enable if you wish to bust ALL iframes.", "No|Yes"),
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
