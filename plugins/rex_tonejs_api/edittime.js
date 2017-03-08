function GetPluginSettings()
{
	return {
		"name":			"ToneJS api",
		"id":			"Rex_ToneJS_api",
		"version":		"0.1",        
		"description":	"Tone objects in a dictionary. https://github.com/Tonejs/Tone.js",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_api.html",
		"category":		"Rex - Audio - Tone",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"Tone.js"
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
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');
AddStringParam("Type name", "Type name.", '""');
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(1, 0, "Create object", "0. Create", 
          "{0}: Create {1} ({...})", 
          "Create object.", "CreateObject"); 
          
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');         
AddAction(3, 0, "Connect to Master", "Connect", 
          "{0}: Connect to Master", 
          "Connect to Master.", "ConnectToMaster");           

AddAnyTypeParam("A", "Variable name of this tone object", '""');          
AddAnyTypeParam("B", "Connect to object", '""');       
AddStringParam("Port", 'Port name. set "" to ignore this parameter.', '""');
AddAction(4, 0, "Connect", "Connect", 
          "{0}: Connect to {1}({2})", 
          "Connect to object.", "Connect"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');         
AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(11, 0, "Set value", "Property", 
          "{0}: Set {1} to {2}",
          "Set property.", "SetValue"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');             
AddStringParam("Property", "Property name in dot notation", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddAction(12, 0, "Set JSON", "Property", 
          "{0}: Set {1} to {2}",
          "Set property to JSON string.", "SetJSON"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');            
AddStringParam("Property", "Property name in dot notation", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(13, 0, "Set boolean", "Property", 
          "{0}: Set {1} to {2}",
          "Set property to a boolean value.", "SetBoolean");

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');                  
AddStringParam("Properties", "Properties in JSON", '"{}"');
AddAction(14, 0, "Set JSON", "Properties", 
          "{0}: Set properties to {1}", 
          "Set properties to JSON string.", "SetJSONProps");

AddAnyTypeParam("Object A", "Variable name of this tone object", '""');            
AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Object B", "Variable name of this tone object", '""');           
AddStringParam("Function name", "Function name.", '""');  
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(15, 0, "Set by return", "Property", 
          "Set {0}[{1}] to {2}[{3}]({...})",
          "Set property by return value.", "SetByReturn");            
          
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');           
AddStringParam("Function name", "Function name.", '""');  
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(21, 0, "Call", "Function", 
          "{0}: Call {1} ({...})",
          "Call function.", "Call"); 
          
         
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get parameter of callback", "Callback", "Param", "Get the value of a parameter passed to the callback.");

AddExpression(2, ef_return_number, "Get parameter count of callback", "Callback", "ParamCount", "Get the number of parameters passed to callback.");

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');        
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get property", "Property", "Property", "Get property.");

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');        
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(21, ef_return_any | ef_variadic_parameters, "Get return value", "Function", "ReturnValue", "Get return value.");

// ef_deprecated
AddNumberParam("Index", "Parameter index of callback", '""');        
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(99999, ef_deprecated | ef_return_any | ef_variadic_parameters, "Get parameter of callback", "Callback", "CallbackParam", "Get the value of a parameter passed to the callback.");
// ef_deprecated

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo,	"Play in background",	"No",	"Keep playing audio even when the tab or app goes in to the background.", "No|Yes"),
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
