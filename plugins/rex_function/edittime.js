function GetPluginSettings()
{
	return {
		"name":			"Function",
		"id":			"Rex_Function",
		"version":		"1.0",          
		"description":	"(Deprecated) Call named events from actions and expressions.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_function.html",
		"category":		"Deprecated",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "Function name", '""');
AddCondition(0, cf_trigger, "On function", "Function", "On function <i>{0}</i>", "", "OnFunctionCalled");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Name", "Function name", '""');
AddAction(0, 0, "Call function", "Function", "Call <i>{0}</i>", "Call function.", "CallFunction");
AddAction(1, 0, "Clean all parameters", "Parameter", "Clean all parameters", "Clean all parameters.", "CleanParameters");
AddAnyTypeParam("Index", "Index of parameter, can be number of string", "0");
AddAnyTypeParam("Value", "Value of paramete", "0");
AddAction(2, 0, "Set a parameter", "Parameter", "Set parameter[<i>{0}</i>] to <i>{1}</i>", "Set a parameter pass into function.", "SetParameter");
AddAction(3, 0, "Clean all return values", "Return", "Clean all return values", "Clean all return values.", "CleanRetruns");
AddAnyTypeParam("Index", "Index of return value, can be number of string", "0");
AddAnyTypeParam("Value", "Value of return value", "0");
AddAction(4, 0, "Set a return value", "Return", "Set return[<i>{0}</i>] to <i>{1}</i>", "Set a return value.", "SetReturn");
AddStringParam("Name", "JS function object name", '""');
AddStringParam("Code", "JS function code", '""');
AddAction(5, 0, "Inject a JS function object", "JS Function", 
          "Inject JS <i>{0}</i> to <i>{1}</i>", "Inject a JS function object.", "CreateJSFunctionObject");
AddAnyTypeParam("Value", "Value of result", "0");
AddAction(6, 0, "Set result", "Result", "Set result to <i>{0}</i>", "Set result.", "SetResult");
AddStringParam("Commands", "Commands", '""');
AddAction(7, 0, "Execute commands", "Function", "Execute commands <i>{0}</i>", "Execute commands.", "ExecuteCommands");
AddStringParam("Code", "JS function code", '""');
AddAction(8, 0, "Inject JS function objects", "JS Function", 
          "Inject JS <i>{0}</i>", "Inject JS function objects.", "InjectJSFunctionObjects");

//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("0", "The index of parameter to get, can be number of string.", "0");
AddExpression(0, ef_return_any | ef_variadic_parameters, "Get parameter", "Parameter", "Param", "Get a parameter by index.");
AddAnyTypeParam("0", "The index of return value to get, can be number of string.", "0");
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get return", "Return", "Ret", "Get a return value by index.");
AddStringParam('""', "Code string.", '""');
AddExpression(2, ef_return_any | ef_variadic_parameters, "Eval js code", "JS Function", "Eval", "Eval js code string.");
AddExpression(3, ef_return_any | ef_variadic_parameters, "Get result", "Return", "Result", "Get the result after a function called.");
AddStringParam("Name", "Function name", '""');
AddExpression(4, ef_return_any | ef_variadic_parameters, "Call function", "Return", "Call", "Get the result from a function called.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),
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
