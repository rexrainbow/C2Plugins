function GetPluginSettings()
{
	return {
		"name":			"Function Ext",
		"id":			"Rex_FnExt",
		"version":		"0.1",   		
		"description":	"Injecting javascript code to interact with official function plugin",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Control flow",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("Name", "JS function object name", '""');
AddStringParam("Code", "JS function code", '""');
AddAction(1, 0, "Inject a JS function object", "JS Function", 
          "Inject JS <i>{0}</i> to <i>{1}</i>", "Inject a JS function object.", "CreateJSFunctionObject");  
AddStringParam("Code", "JS function code", '""');
AddAction(2, 0, "Inject JS function objects", "JS Function", 
          "Inject JS <i>{0}</i>", "Inject JS function objects.", "InjectJSFunctionObjects");            
AddStringParam("CSV string", "Commands in csv formet", '""');
AddAction(10, 0, "Run csv commands", "Command", "Run CSV commands <i>{0}</i>", "Execute commands in csv format.", "RunCSVCommands");
AddStringParam("JSON string", "Commands in JSON formet", '""');
AddAction(11, 0, "Run JSON commands", "Command", "Run JSON commands <i>{0}</i>", "Execute commands in JSON format.", "RunJSONCommands");
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(12, 0, "Call function", "Function", "Call <b>{0}</b> (<i>{...}</i>)", "Call a function, running its 'On function' event.", "CallFunction");


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_any, "", "Function", "ReturnValue", "Get the value set by 'Set return value'.");
AddStringParam("Name", "The name of the function to call.");
AddExpression(3, ef_return_any | ef_variadic_parameters, "", "Function", "Call", "Call a function with parameters and return its return value.");


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
