function GetPluginSettings()
{
	return {
		"name":			"Layout freezer",
		"id":			"Rex_LayoutFreezer",
		"version":		"0.1",            
		"description":	"Save/Load non-global instances on the layout.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_layoutfreezer.html",
		"category":		"Rex - Save-load",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
   
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("JSON string", "JSON string.", '""');
AddComboParamOption("Saved layout");
AddComboParamOption("Current layout");
AddComboParam("Layout", "Target layout", 0);
AddAction(1, 0, "Load layout", "Load layout", 
          "Load instances from <i>{0}</i> at <i>{1}</i>", 
          "Load instances at layout.", "LoadLayout");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get current frozen layout data", "Save", "Layout2String", "Get current frozen layout data, in json format.");


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
