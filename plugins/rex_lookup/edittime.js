function GetPluginSettings()
{
	return {
		"name":			"Look up",
		"id":			"Rex_Lookup",
		"version":		"0.1",   		
		"description":	"Check conditions to find passed tests listed in a csv table.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_lookup.html",
		"category":		"Rex - Data structure - CSV",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_looping | cf_not_invertible, "For each", "Result", 
             "For each passed test", 
             "Repeat the event for each passed test.", "ForEachPassedTestName");

AddCondition(2, 0, "Has passed", "Result", 
             "Has passed test", 
             "Return true if there has any passed test.", "HasPassedTest");             
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Data", "Data in CSV format.", "");
AddAction(1, 0, "Load table", "Load", 
          "Load table to <i>{0}</i>", 
          "Load csv table for condition-items.", "LoadTable");
          
AddStringParam("Property", "Property name.", "");
AddAnyTypeParam("Value", "The value to set.", 0);
AddAction(2, 0, "Set property", "Prepare", 
          "Set property <i>{0}</i> to <i>{1}</i>", 
          "Set property.", "SetProperty");

AddStringParam("Test name", "Test name.", "");
AddAction(3, 0, "Remove test", "Remove", 
          "Remove test by name <i>{0}</i>", 
          "Remove test by name.", "RemoveTest");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get passed test name", "Result", "CurPassedTestName", 
              "Get passed test name in a For Each loop.");
AddExpression(2, ef_return_string, "The first passed name", "Result", "FirstPassedTestName", 
              'Get the first passed name. Return "" if there has no passed test.');
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Delimiter", ",", "Set delimiter for splitting items."), 
    new cr.Property(ept_combo, "Condition mode", "If", '"If" mode will test all conditions, "If,else if" mode will test until first pass condition.', "If|If,else if"),    
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
