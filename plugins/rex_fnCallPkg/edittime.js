function GetPluginSettings()
{
	return {
		"name":			"Function call package",
		"id":			"Rex_fnCallPkg",
		"version":		"0.1",        
		"description":	"Pack function call(s) into JSON string, or call function(s) by this JSON string.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_fncallpkg.html",
		"category":		"Rex - Logic - function",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_looping | cf_not_invertible, "For each package", "Function queue : For each", 
             "For each package in queue", 
             "Repeat the event for each package in function queue.", "ForEachPkg");
AddStringParam("Name", "Function name", '""');
AddCondition(2, 0, "Compare function name", "Function queue : For each", 
             "Function name = <i>{0}</i>", 
             'Compare function name, used in "Condition: For each package".', "IsCurName"); 
                         
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Package", "Function call package in json string.", "\"\"");
AddComboParamOption("From top to bottom");
AddComboParamOption("From bottom to top");
AddComboParam("Odrer", "Execution order.", 0);       
AddAction(1, 0, "Call function", "Function", 
          "Call function by package to <i>{0}</i>,  <i>{1}</i>",
          "Call function by package.", "CallFunction");  
       
// function queue
AddAction(11, 0, "Clean", "Function queue", 
          "Clean queue","Clean queue.", "CleanFnQueue");
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", 
                  "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(12, 0, "Push back", "Function queue", 
          "Push function call <b>{0}</b> (<i>{...}</i>)", 
          "Push function call into function queue.", "PushToFnQueue");
AddStringParam("Package", "Function call package in json string.", "\"\""); 
AddAction(13, 0, "Load queue", "Function queue", 
          "Load <i>{0}</i> to queue",
          "Load new items into function queue.", "LoadFnQueue"); 
AddNumberParam("Index", "Index of parameter.", 0);
AddAnyTypeParam("Value", "Value of paramete", 0); 
AddAction(14, 0, "Overwrite parameter", "Function queue : For each", 
          "Overwrite parameter[<i>{0}</i>] to <i>{1}</i>",
          'Overwrite parameter of current package in function queue.', "OverwriteParam");
AddComboParamOption("From top to bottom");
AddComboParamOption("From bottom to top");
AddComboParam("Odrer", "Execution order.", 0);          
AddAction(15, 0, "Call functions", "Function queue", 
          "Call functions <i>{0}</i>",
          "Call functions in function queue.", "CallFunctionInQueue");          
AddComboParamOption("Back");
AddComboParamOption("Front");
AddComboParam("Where", "Whether to insert at the beginning or the end of the array.", 0);
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", 
                  "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(16, 0, "Push", "Function queue", 
          "Push <b>{0}</b> function call <b>{1}</b> (<i>{...}</i>)", 
          "Push function call into function queue.", "PushToFnQueue2");    
AddAction(17, 0, "Reverse", "Function queue", 
          "Reverse queue", 
          "Reverse function queue.", "ReverseFnQueue");
AddNumberParam("Index", "Index to insert.", 0);
AddAnyTypeParam("Value", "Value of paramete", 0); 
AddAction(18, 0, "Insert parameter", "Function queue : For each", 
          "Insert <i>{1}</i> to index <i>{0}</i>",
          'Insert a parameter into current package in function queue.', "InsertParam");    
AddNumberParam("Index", "Index of parameter.", 0);
AddAnyTypeParam("Value", "Value to add", 0); 
AddAction(19, 0, "Add to parameter", "Function queue : For each", 
          "Add <i>{1}</i> to parameter[<i>{0}</i>]",
          'Add value to parameter of current package in function queue.', "AddToParam");
AddStringParam("Package", "Function call package in json string.", "\"\""); 
AddAction(20, 0, "Append queue", "Function queue", 
          "Append <i>{0}</i> to queue",
          "Append new items into function queue.", "AppendFnQueue");           
AddComboParamOption("Official function");
AddComboParamOption("Rex function2");
AddComboParam("Callback", "Callback object.",0);          
AddAction(21, 0, "Setup callback", "Setup", 
          "Set callback to <i>{0}</i>", 
          "Setup callback.", "SetupCallback");	          
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Name", "The name of the function to call.");
AddExpression(1, ef_return_string | ef_variadic_parameters, "Function call package", "Package", "FnCallPkg", 
              "Get function call package in json format. The parameters format is the same as Call in official function object.");
AddStringParam("Package", "Function call package in json string.", "\"\"");
//AddNumberParam("Is inverse", "Set 1 to execute functions frop bottom to top.", 1); 
AddExpression(3, ef_return_any | ef_variadic_parameters, "Call a function then get return value", "Function", "Call", 
              "Call a function with parameters and return its return value. Add 2nd parameter to 1 to execute from bottom to top.");
// function queue              
AddExpression(11, ef_return_string, "Function queue package", "Function queue", "FnQueuePkg", 
              "Get function queue package in json format.");              
AddExpression(12, ef_return_string, "Current function name", "Function queue : For each", "CurName", 
              "Get the current function name in a For Each package.");
AddNumberParam("Index", "The index of the parameter in current function package.", 0);              
AddExpression(13, ef_return_any, "Current Parameter", "Function queue : For each", "CurParam", 
              "Get the current function parameter in a For Each package.");              
              
ACESDone();
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
