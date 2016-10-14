function GetPluginSettings()
{
	return {
		"name":			"ToneJS api",
		"id":			"Rex_ToneJS_api",
		"version":		"0.1",        
		"description":	"Base object of tone.js. https://github.com/Tonejs/Tone.js",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_api.html",
		"category":		"Rex - Audio - Tone - Core",
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
            "On <i>{0}</i>",
            "Callback.", "OnCallback");
            
//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');
AddStringParam("Type name", "Type name.", '""');
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(1, 0, "Create object", "Create", 
          "{0}: Create <i>{1}</i> (<i>{...}</i>)", 
          "Create object.", "CreateObject"); 

AddStringParam("A", "Variable name of this tone object", '""');          
AddStringParam("B", "Connect to object", '""');       
AddStringParam("Port", 'Port name. set "" to ignore this parameter.', '""');
AddAction(4, 0, "Connect", "Connect", 
          "{0}: Connect to <i>{1}</i>(<i>{2}</i>)", 
          "Connect to object.", "Connect"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');         
AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(11, 0, "Set value", "Property", 
          "{0}: Set <i>{1}</i> to <i>{2}</i>",
          "Set property.", "SetValue"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');             
AddStringParam("Property", "Property name in dot notation", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddAction(12, 0, "Set JSON", "Property", 
          "{0}: Set <i>{1}</i> to <i>{2}</i>",
          "Set property to JSON string.", "SetJSON"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');            
AddStringParam("Property", "Property name in dot notation", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(13, 0, "Set boolean", "Property", 
          "{0}: Set <i>{1}</i> to <i>{2}</i>",
          "Set property to a boolean value.", "SetBoolean");

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');                  
AddStringParam("Properties", "Properties in JSON", '"{}"');
AddAction(14, 0, "Set JSON", "Properties", 
          "{0}: Set properties to <i>{1}</i>", 
          "Set properties to JSON string.", "SetJSONProps");          
          
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');           
AddStringParam("Function name", "Function name.", '""');  
AddVariadicParams("Parameter {n}", "Parameters of this function call.");
AddAction(21, 0, "Call", "Function", 
          "{0}: Call <i>{1}</i> (<i>{...}</i>)",
          "Call function.", "Call"); 
          
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get parameter", "Callback", "Param", "Get the value of a parameter passed to the callback.");

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');        
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get property", "Property", "Property", "Get property.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Start timeline", "Yes", "Set Yes to start timeline.", "No|Yes"),
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
