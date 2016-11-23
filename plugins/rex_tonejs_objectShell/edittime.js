function GetPluginSettings()
{
	return {
		"name":			"Object shell",
		"id":			"Rex_ToneJS_objectshell",
		"version":		"0.1",        
		"description":	"Shell of tone object.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_objectshell.html",
		"category":		"Rex - Audio - Tone - object",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
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
AddStringParam("Type name", "Type name.", '""');
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(1, 0, "Create object", "0. Create", 
          "Create {0} ({...})", 
          "Create object.", "CreateObject"); 

AddAction(3, 0, "Connect to Master", "Connect", 
          "Connect to Master", 
          "Connect to Master.", "ConnectToMaster");           
          
AddObjectParam("Object", "Object to plug.");          
AddStringParam("Port", 'Port name. set "" to ignore this parameter.', '""');
AddAction(4, 0, "Connect", "Connect", 
          "Connect to {0}({1})", 
          "Connect to object.", "Connect"); 

AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(11, 0, "Set value", "Property", 
          "Set {0} to {1}", 
          "Set property.", "SetValue"); 

AddStringParam("Property", "Property name in dot notation", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddAction(12, 0, "Set JSON", "Property", 
          "Set {0} to {1}", 
          "Set property to JSON string.", "SetJSON"); 

AddStringParam("Property", "Property name in dot notation", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(13, 0, "Set boolean", "Property", 
          "Set {0} to {1}", 
          "Set property to a boolean value.", "SetBoolean");

AddStringParam("Properties", "Properties in JSON", '"{}"');
AddAction(14, 0, "Set JSON", "Properties", 
          "Set properties to {0}", 
          "Set properties to JSON string.", "SetJSONProps"); 
           
AddStringParam("Property", "Property name in dot notation", '""');
AddObjectParam("Object B", "Object B.");             
AddStringParam("Function name", "Function name.", '""');  
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(15, 0, "Set by return", "Property", 
          "Set {0} to {1}[{2}]({...})",
          "Set property by return value.", "SetByReturn");            
          
AddStringParam("Function name", "Function name.", '""');  
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(21, 0, "Call", "Function", 
          "Call {0} ({...})", 
          "Call function.", "Call"); 
          
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get parameter", "Callback", "Param", "Get the value of a parameter passed to the callback.");

//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get property", "Property", "Property", "Get property.");
  
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
