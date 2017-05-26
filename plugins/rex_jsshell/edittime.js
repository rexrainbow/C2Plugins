function GetPluginSettings()
{
	return {
		"name":			"JS Shell",
		"id":			"Rex_jsshell",
		"version":		"1.0",        
		"description":	"Invoke javascript function.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_jsshell.html",
		"category":		"Rex - Logic",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different callback.", "\"\"");
AddCondition(1, cf_trigger, "Callback", "Callback", 
            "On {0}",
            "Callback.", "OnCallback");

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Invoke", "Invoke", 
          "Invoke function",
          "Invoke function.", "Invoke"); 

AddStringParam("Name", "Function name in dot notation", '""');
AddAction(12, 0, "Set function name", "Prepare - Function name", 
          "Function: {0}",
          "Set function name.", "SetFunctionName"); 
 
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(21, 0, "Add value", "Prepare - Parameter", 
          "Parameter: {0}",
          "Add a parameter.", "AddValue"); 

AddStringParam("JSON", "JSON value to set", '""');
AddAction(22, 0, "Add JSON", "Prepare - Parameter", 
          "Parameter: {0}",
          "Add a JSON parameter.", "AddJSON"); 

AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(23, 0, "Add boolean", "Prepare - Parameter",
          "Parameter: {0}",
          "Add a boolean parameter.", "AddBoolean");

AddAnyTypeParam("Callback tag", "Callback tag to set", '""');
AddAction(24, 0, "Add callback", "Prepare - Parameter", 
          "Parameter: callback {0}",
          "Add a callback parameter.", "AddCallback"); 

AddAction(25, 0, "Add null", "Prepare - Parameter",
          "Parameter: null",
          "Add null value parameter.", "AddNull");		  

AddStringParam("URL", "The URL to request.", "\"http://\"");
AddAnyTypeParam("Success callback tag", "Callback of loading success", '""');
AddAnyTypeParam("Error callback tag", "Callback of loading failed", '""');
AddAction(101, 0, "Load API", "Load API", 
          "Load API from {0} (success {1}, error {2})",
          "Load API.", "LoadAPI"); 		  

//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get parameter of callback", "Callback", "Param", "Get the value of a parameter passed to the callback.");

AddExpression(2, ef_return_number, "Get parameter count of callback", "Callback", "ParamCount", "Get the number of parameters passed to callback.");
     
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(21, ef_return_any | ef_variadic_parameters, "Get return value", "Function", "ReturnValue", "Get return value.");



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
