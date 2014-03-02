function GetPluginSettings()
{
	return {
		"name":			"Function2",
		"id":			"Rex_Function2",
		"version":		"1.0",
		"description":	"Run other events in an action, like functions in programming languages.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_function2.html",
		"category":		"Control flow",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(0,	cf_trigger | cf_fast_trigger, "On function", "Function", "On <b>{0}</b>", "Triggered when a function is called.", "OnFunction");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddCmpParam("Comparison", "How to compare the function parameter.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(1, cf_none, "Compare parameter", "Function", "Parameter {0} {1} {2}", "Compare the value of a parameter in a function call.", "CompareParam");

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddCondition(50, 0, "Declare parameter", "Input parameter", "Parameter <i>{0}</i>, default to <i>{1}</i>", "Declare input parameter in name string and it's default value", "DefineParam");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddComboParamOption("Number");
AddComboParamOption("String");
AddComboParam("Type", "The type of value.", 0);
AddCondition(51, cf_none, "Type of parameter", "Function", "Parameter {0} is a {1}", "Test the type of parameter.", "TypeOfParam");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(0, 0, "Call function", "Function", "Call <b>{0}</b> (<i>{...}</i>)", "Call a function, running its 'On function' event.", "CallFunction");

AddAnyTypeParam("Value", "A number or some text to return from the function call.");
AddAction(1, 0, "Set return value", "Function", "Set return value to <b>{0}</b>", "In an 'On function' event, set the return value.", "SetReturnValue");

AddAnyTypeParam("Name", "Name of parameter", '""');
AddAnyTypeParam("Value", "Value", "0");
AddAction(50, 0, "Set parameter", "Input parameter", "Set parameter <i>{0}</i> to <i>{1}</i>", "Set a parameter pass into function.", "SetParameter");

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(51, 0, "Declare parameter", "Input parameter", "Parameter <i>{0}</i>, default to <i>{1}</i>", "Declare input parameter in name string and it's default value", "DefineParam");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_any, "", "Function", "ReturnValue", "Get the value set by 'Set return value'.");

AddExpression(1, ef_return_number, "", "Function", "ParamCount", "Get the number of parameters passed to this function.");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddExpression(2, ef_return_any, "", "Function", "Param", "Get the value of a parameter passed to the function.");

AddStringParam("Name", "The name of the function to call.");
AddExpression(3, ef_return_any | ef_variadic_parameters, "", "Function", "Call", "Call a function with parameters and return its return value.");

AddStringParam("Name", "The name of the function to call.");
AddExpression(50, ef_return_any | ef_variadic_parameters, "", "Function", "CallByNameParams", "Call a function with name parameters and return its return value.");


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
