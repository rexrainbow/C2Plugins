function GetPluginSettings()
{
	return {
		"name":			"Function2M",
		"id":			"Rex_Function2M",
		"description":	"Run other events in an action, like functions in programming languages. Support multiple instances to organize functions more better.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_function2m.html",
		"category":		"Rex - Logic - function",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(0,	cf_trigger | cf_fast_trigger, "On function", "Function", "On <b>{0}</b>", "Triggered when a function is called.", "OnFunction");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddCmpParam("Comparison", "How to compare the function parameter.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(1, cf_none, "Compare parameter", "Parameter", "Parameter {0} {1} {2}", "Compare the value of a parameter in a function call.", "CompareParam");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddComboParamOption("Number");
AddComboParamOption("String");
AddComboParam("Type", "The type of value.", 0);
AddCondition(51, cf_none, "Type of parameter", "Parameter", "Parameter {0} is a {1}", "Test the type of parameter.", "TypeOfParam");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(0, 0, "Call function", "Parameter list", "Call <b>{0}</b> (<i>{...}</i>)", "Call a function, running its 'On function' event.", "CallFunction");

AddAnyTypeParam("Value", "A number or some text to return from the function call.");
AddAction(1, 0, "Set return value", "Return", "Set return value to <b>{0}</b>", "In an 'On function' event, set the return value.", "SetReturnValue");

AddAnyTypeParam("Expression", "An expression to run, generally of the form Function.Call(\"func\", ...)");
AddAction(2, 0, "Call expression", "Function", "Call expression <b>{0}</b>", "Call a function using a typed expression (via Function.Call()).", "CallExpression");

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddComboParamOption("");
AddComboParamOption("number only");
AddComboParamOption("string only");
AddComboParam("Type check", "Type check.", 0);
AddAction(51, 0, "Declare parameter", "Interface", "Parameter <b>{0}</b>, default to <i>{1}</i> <i>{2}</i>", "Declare input parameter in name string and it's default value", "DefineParam");

AddAction(52, 0, "Dump", "Log", "Dump function infomation", "Dump function infomation in console, it need turn on debug mode.","Dump");

AddAnyTypeParam("Name", "Name of parameter", '""');
AddAnyTypeParam("Value", "Value", "0");
AddStringParam("Table", "Name of parameter table.", '"_"');
AddAction(53, 0, "Set parameter", "Parameter table", "Set parameter <b>{0}</b> to <b>{1}</b> at table <i>{2}</i>", "Set a parameter table.", "SetParameter");

AddStringParam("Name", "The name of the function to call.", "\"\"");
AddStringParam("Table", "Name of parameter table.", '"_"');
AddAction(54, 0, "Call function", "Parameter table", "Call <b>{0}</b> with parameter table <i>{1}</i>", "Call a function, running its 'On function' event with parameter table.", "CallFunctionwPT");

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "A number or some text to return from the function call.");
AddAction(55, 0, "Set return value", "Return: dictionary", "Set return <b>{0}</b> to <b>{1}</b>", "In an 'On function' event, set the return value in a dictionary.", "SetReturnDict");

//AddObjectParam("Function", "Function object.");
//AddStringParam("Name", "The name of the function to call.", "\"\"");
//AddAction(70, 0, "Add package", "Package", "Add {0} as {1}", "Add package in name space.", "AddPackage");
//////////////////////////////////////////////////////////////
// Expressions
//AddStringParam("Name", "Parameter's name", '""');
AddExpression(0, ef_return_any | ef_variadic_parameters, "", "Function", "ReturnValue", "Get the value set by 'Set return value'. Add 2nd parameter for key and/or 3rd parameter for default value if key doesn't exist.");

AddExpression(1, ef_return_number, "", "Function", "ParamCount", "Get the number of parameters passed to this function.");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddExpression(2, ef_return_any, "", "Function", "Param", "Get the value of a parameter passed to the function.");

AddStringParam("Name", "The name of the function to call.");
AddExpression(3, ef_return_any | ef_variadic_parameters, "", "Function", "Call", "Call a function with parameters and return its return value.");

AddStringParam("Name", "The name of the function to call.");
AddExpression(50, ef_return_any | ef_variadic_parameters, "", "Function", "CallwPT", "Call a function with parameter table and return its return value.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show log.", "Off|On"),
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
