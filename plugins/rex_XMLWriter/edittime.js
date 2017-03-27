function GetPluginSettings()
{
	return {
		"name":			"XML Writer",
		"id":			"Rex_XMLWriter",
		"version":		"0.1",        
		"description":	"Build XML structure. Reference: http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.html",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_xmlwriter.html",
		"category":		"Rex - Data structure",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions            
AddStringParam("Name", "Element name.", '""');
AddCondition(1, cf_not_invertible, "Add element", "Add element", 
             "Element <i>{0}</i>", 
             "Add an element.", "AddElement");
            
//////////////////////////////////////////////////////////////
// Actions 
AddAction(1, 0, "Clean", "Clean", 
          "Clean all",
          "Clean all data.", "Clean");
          
AddStringParam("Name", "The name of attribute.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(2, 0, "Add attribute", "Add attribute", 
          "Add attribute <i>{0}</i> to <i>{1}</i>",
          "Add an attribute.", "AddAttribute");
               
AddAnyTypeParam("Value", "The value to set, could be number or string.", '""');
AddAction(3, 0, "Set content", "Set content", 
          "Set content to <i>{0}</i>",
          "Set content.", "SetContent");               
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get XML", "Output", "AsXML", "Get XML string.");
AddExpression(2, ef_return_string, "Get pretty print XML", "Output", "AsPrettyPrintXML", "Get pretty print XML string.");

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
