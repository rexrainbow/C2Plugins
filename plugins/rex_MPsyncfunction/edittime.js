function GetPluginSettings()
{
	return {
		"name":			"MP Sync function",
		"id":			"Rex_MPsyncfunction",
		"version":		"0.1",        
		"description":	'Trigger "On function" for each peer.',
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_mpsyncfunction.html",
		"category":		"Rex - Multiplayer helper",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Condition
AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(0,	cf_trigger | cf_fast_trigger, "On function", "Function", 
             "On <b>{0}</b>", 
             "Triggered when a function is called.", "OnFunction");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddCmpParam("Comparison", "How to compare the function parameter.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(1, cf_none, "Compare parameter", "Parameter", 
             "Parameter {0} {1} {2}", 
             "Compare the value of a parameter in a function call.", "CompareParam");

AddCondition(2,	cf_trigger, "On any function", "Function", 
             "On any function", 
             "Triggered when any function is called. Dump the trace.", "OnAnyFunction");             

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddComboParamOption("Number");
AddComboParamOption("String");
AddComboParam("Type", "The type of value.", 0);
AddCondition(51, cf_none, "Type of parameter", "Parameter", 
             "Parameter {0} is a {1}", 
             "Test the type of parameter.", "TypeOfParam");

//////////////////////////////////////////////////////////////
// Actions      
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(0, 0, "Call function", "Parameter list",
          "Call <b>{0}</b> (<i>{...}</i>)", 
          "Call a function, running its 'On function' event.", "CallFunction");         

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(51, 0, "Declare parameter", "Interface", 
          "Parameter <b>{0}</b>, default to <i>{1}</i>", 
          "Declare input parameter in name string and it's default value", "DefineParam");

AddAnyTypeParam("Name", "Name of parameter", '""');
AddAnyTypeParam("Value", "Value", "0");
AddAction(53, 0, "Set parameter", "Parameter table", 
          "Set parameter <b>{0}</b> to <b>{1}</b>", 
          "Set a parameter table.", "SetParameter");

AddStringParam("Name", "The name of the function to call.", "\"\"");
AddAction(54, 0, "Call function", "Parameter table", 
          "Call <b>{0}</b> with parameter table", 
          "Call a function, running its 'On function' event with parameter table.", "CallFunctionwPT");     
          
          
AddStringParam("Name", "The name of the function.", "\"\"");
AddAction(70, 0, "Add", "Pending - ignored list", 
          "Add function <b>{0}</b> to ignored list of blocking", 
          "Add a function by name to to ignored list of blocking", "AddIgnored");
AddAction(71, 0, "Accept", "Pending", 
          "Accept one command", 
          "Accept one command. Execute command if there has any pending command.", "AcceptOne");  
AddStringParam("Name", "The name of the function.", "\"\"");
AddAction(72, 0, "Remove", "Pending - ignored list", 
          "Remove function <b>{0}</b> from ignored list of blocking", 
          "Remove the function by name from to ignored list of blocking", "RemoveIgnored"); 
AddAction(73, 0, "Close", "Pending", 
          "Close acceptance", 
          "Close acceptance.", "Close");   
AddAction(74, 0, "Discard&Close", "Pending", 
          "Discard all pending commands and close acceptance", 
          "Discard all pending commands and close acceptance.", "Discard");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "", "Function", "ParamCount", "Get the number of parameters passed to this function.");

AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddExpression(2, ef_return_any, "", "Function", "Param", "Get the value of a parameter passed to the function.");

AddExpression(3, ef_return_string, "Sender Alias", "Function", "SenderAlias", 
              'The alias of sender, used under callback "Condition:On function".');

AddExpression(11, ef_return_string, "Function name", "Debug", "FunctionName", 
              'Function name for dubug, used under "Condition:On any function".');
AddExpression(12, ef_return_string, "Function parameters", "Debug", "FunctionParams", 
              'Function parameters for dubug, used under "Condition:On any function".');              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Tag prefix", "_syncfn", "Tag prefix for sending and receiving message.", "", "readonly"),
    new cr.Property(ept_combo, "Response", "Sendback", 
                    "Run function immediately or wait for host sendback.", "Immediate|Sendback"),
    new cr.Property(ept_combo, "Pending mode", "No", "Enable to pending command execution until accepted. Turn off to run command directly.", "No|Yes"),                   
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
