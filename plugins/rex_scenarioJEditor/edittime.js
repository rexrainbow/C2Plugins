function GetPluginSettings()
{
	return {
		"name":			"ScenarioJ Editor",
		"id":			"Rex_ScenarioJEditor",
		"version":		"0.1",        
		"description":	"Editor of Scenario-Json.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_scenariojeditor.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(1,	0, "On function", "0. Function body", 
    "On <b>{0}</b>",
    "Declare a function.", "OnFunction");

AddStringParam("Condition", "Condition.", '""');
AddCondition(11,	0, "If", "If", 
    "If <b>{0}</b>", 
    "Declare a if condition.", "IFIf");

AddStringParam("Condition", "Condition.", '""');
AddCondition(12,	0, "Else if", "If", 
    "Else if <b>{0}</b>", 
    "Declare a else if condition.", "IFElseIf");

AddCondition(13,	0, "Else", "If", "Else", "Declare a else condition.", "IFElse");

AddStringParam("Variable name", "Variable name of index.", '"i"');
AddNumberParam("Start", "Start value.", 1);
AddNumberParam("Stop", "Stop value.", 10);
AddNumberParam("Step", "Step value.", 1);
AddCondition(21,	0, "For", "Loop", 
    "For <b>{0}</b> from <b>{1}</b> to <b>{2}</b> , step <b>{3}</b>", 
    "Declare a for loop.", "For");
    
AddStringParam("Condition", "Condition.", '""');    
AddCondition(22,	0, "While", "Loop", 
    "While <b>{0}</b>", 
    "Declare a while loop.", "While");    


//////////////////////////////////////////////////////////////
// Actions

AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(1, 0, "Declare parameter", "Function body", 
    "Parameter <b>{0}</b>, default to <i>{1}</i>", 
    "Declare input parameter in name string and it's default value", "DefineTaskParam");
    
AddAction(2, 0, "Exit", "Functions", 
    "Exit", 
    "Exit current function", "Exit");    

AddAnyTypeParam("Name", "Name of parameter", '""');
AddAnyTypeParam("Value", "Value", "0");
AddAction(11, 0, "Set parameter", "Function call", 
    "Set parameter <b>{0}</b> to <b>{1}</b> at table <i>{2}</i>", 
    "Set a parameter table.", "SetFunctionParameter");

AddStringParam("Name", "The name of the function to call.", "\"\"");
AddStringParam("Table", "Name of parameter table.", '"_"');
AddAction(12, 0, "Call function","Function call", 
    "Call <b>{0}</b>", 
    "Call a function, running its 'On function' event.", "Call");    
    
AddStringParam("Name", "The name of the c2 function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the c2 function call, which can be accessed with Function.Param({n}).");
AddAction(21, 0, "Call C2 function", "C2 function call", 
    "Call C2 function <b>{0}</b> (<i>{...}</i>)", 
    "Call a c2 function, running its 'On function' event.", "CallC2Function");
    
AddAnyTypeParam("Delay time/Signal", "Number for delay time in seconds, or string of wait-signal.", 0);
AddAction(31, 0, "Wait", "Wait", 
    "Wait <b>{0}</b>", 
    "Pending function execution until time-out or signal fired.", "Wait");    
    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get content", "Content", "Content", "Get content.");
              
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
