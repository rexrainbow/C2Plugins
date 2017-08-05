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
AddStringParam("Return value", "Variable to save return value, in dot notation", '""');
AddAction(1, 0, "Invoke", "Invoke", 
          "Invoke function, put return object to {0}",
          "Invoke javascript function.", "InvokeFunction"); 

AddStringParam("Name", "Variable name in dot notation", '""');
AddAction(2, 0, "New instance", "Invoke", 
          "New instance to {0}",
          "New instance.", "CreateInstance"); 		 

AddStringParam("Name", "Function name in dot notation", '""');
AddAction(12, 0, "Set function name", "Prepare - Function name", 
          "Set function name to {0}",
          "Set function name.", "SetFunctionName"); 
 
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(21, 0, "Add value", "Prepare - Parameter", 
          "Add {0} to parameter list",
          "Add a parameter.", "AddValue"); 

AddStringParam("JSON", "JSON value to set", '""');
AddAction(22, 0, "Add JSON", "Prepare - Parameter", 
          "Add JSON {0} to parameter list",
          "Add a JSON parameter.", "AddJSON"); 

AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(23, 0, "Add boolean", "Prepare - Parameter",
          "Add {0} to parameter list",
          "Add a boolean parameter.", "AddBoolean");

AddAnyTypeParam("Callback tag", "Callback tag to set", '""');
AddAction(24, 0, "Add callback", "Prepare - Parameter", 
          "Add callback {0} to parameter list",
          "Add a callback parameter.", "AddCallback"); 

AddAction(25, 0, "Add null", "Prepare - Parameter",
          "Add null to parameter list",
          "Add null value parameter.", "AddNull");	

AddStringParam("Name", "Variable name in dot notation", '""');
AddAction(26, 0, "Add object", "Prepare - Parameter",
          "Add object {0} to parameter list",
          "Add an object parameter.", "AddObject");	

AddAnyTypeParam("Function name", "Function name of C2 function object", '""');
AddAction(27, 0, "Add C2 function callback", "Prepare - Parameter", 
          "Add C2 function callback {0} to parameter list",
          "Add a C2 function callback parameter.", "AddC2Callback");           	  

AddStringParam("Name", "Object type in dot notation", '""');
AddAction(31, 0, "Set object type", "Prepare - Object type", 
          "Set object type to {0}",
          "Set object type.", "SetFunctionName"); 		  	  

AddStringParam("Name", "Variable name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(81, 0, "Set property", "Properties",
          "Set property {0} to {1}",
          "Set property.", "SetProp");

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

AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(31, ef_return_any | ef_variadic_parameters, "Get property of object", "Properties", "Prop", "Get the value of a property.");

AddStringParam("Name", "Function name in dot notation", '""');
AddExpression(201, ef_return_any | ef_variadic_parameters, "Call function", "Call", "Call", "Call a javascript function with parameters and return its return value.");

AddAnyTypeParam("Value", "Number or string value.");
AddExpression(211, ef_return_string, "Add number or string parameter", "Call", "ValueParam", "Add number or string parameter.");

AddStringParam("JSON", "JSON string.");
AddExpression(212, ef_return_string, "Add JSON parameter", "Call", "JSONParam", "Add JSON parameter.");

AddNumberParam("Boolean", "Boolean value. 1=true, 0=false.");
AddExpression(213, ef_return_string, "Add boolean parameter", "Call", "BooleanParam", "Add boolean parameter.");

AddStringParam("Callback", "Callback name.");
AddExpression(214, ef_return_string, "Add callback parameter", "Call", "CallbackParam", "Add callback parameter.");

AddExpression(215, ef_return_string, "Add null parameter", "Call", "NullParam", "Add null parameter.");

AddStringParam("Name", "Variable name in dot notation", '""');
AddExpression(216, ef_return_string, "Add object parameter", "Call", "ObjectParam", "Add object parameter.");

AddStringParam("C2 function name", "C2 function name.");
AddExpression(217, ef_return_string, "Add C2 function callback parameter", "Call", "C2FnParam", "Add C2 function callback parameter.");

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
