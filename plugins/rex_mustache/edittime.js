function GetPluginSettings()
{
	return {
		"name":			"Mustache",
		"id":			"Rex_Mustache",
		"version":		"0.1",        
		"description":	"Logic-less templates to render text content. Reference - https://github.com/janl/mustache.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_mustache.html",
		"category":		"Rex - String",
		"type":			"object",			// not in layout
		"rotatable":	false,         
		"flags":		0,
		"dependency":	"mustache.min.js",            
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Clean", "Variable", 
          "Clean all variables", 
          "Clean all variables.", 
          "CleanAll");
          
AddAnyTypeParam("Name", "Variable name.", '""');
AddAnyTypeParam("Value", "Variable value", 0);
AddAction(2, 0, "Set value", "Variable", 
          "Set <i>{0}</i> to <i>{1}</i>", 
          "Set variable value.", 
          "SetValue");
          
AddStringParam("JSON string", "JSON string.", '""');
AddAction(3, 0, "Load from JSON", "Variable", "Load variables form JSON string to <i>{0}</i>",
         "Load variables from JSON string.", "JSON2Variables");    

AddStringParam("Left delimiter", 'Left delimiter. Set "" to use default delimiter "{{"', '"{{"');
AddStringParam("Right delimiter", 'Right delimiter. Set "" to use default delimiter "}}"', '"}}"');
AddAction(11, 0, "Set delimiters", "Delimiters", 
         "Set delimiters to <i>{0}</i> <i>{1}</i>",
         "Set delimiters .", "SetDelimiters ");            
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Template", "Template.", '""');
//AddStringParam("View", "View object in JSON string.", '"{}"');
AddExpression(1, ef_return_string | ef_variadic_parameters, "Get render result", "Render", "Render", 
    "Get render result. Add 2nd parameter for view in JSON string.");
    
AddAnyTypeParam("Name", "Variable name.", '""');
AddExpression(2, ef_return_string | ef_variadic_parameters, "Get value", "Variable", "Value", 
    "Get variable value. Add 2nd parameter for default value if this variable does not exist.");    

AddExpression(3, ef_return_string, "Variables as JSON", 
              "Variable", "VariablesAsJSON", 
              "Get variables in JSON string."); 
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Left delimiter", "{{", 'Left delimiter. Set "" to use default delimiter "{{"'),
	new cr.Property(ept_text, "Right delimiter", "}}", 'Right delimiter. Set "" to use default delimiter "}}"'),    
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
