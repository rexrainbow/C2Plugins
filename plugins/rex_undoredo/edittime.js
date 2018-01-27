function GetPluginSettings()
{
	return {
		"name":			"Undo & Redo",
		"id":			"Rex_UndoRedo",
		"version":		"0.1",   		
		"description":	"A data structure to support undo&redo steps/states.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_undoredo.html",
		"category":		"Rex - Data structure",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Can undo", "Undo", 
             "Can undo", "Retrun true if can undo to previous step.", "CanUndo");
AddCondition(2, 0, "Can redo", "Redo", 
             "Can redo", "Retrun true if can redo to next step.", "CanRedo");                         
             
AddCondition(11, cf_looping | cf_not_invertible, "For each step", "Step", "For each step", 
             "Repeat the event for each step.", "ForEachStep");             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Clean", "Recorder", 
          "Clean all", 
          "Clean all steps.", "CleanAll");   
AddAnyTypeParam("Data", "Data of step", 0);
AddAction(2, 0, "Push", "Push - simple mode", 
          "Push step to <i>{0}</i>", 
          "Push step.", "Push");           
AddStringParam("JSON string", "JSON string.", '""');
AddAction(10, 0, "Load steps from JSON string", "JSON", 
          "Load steps from JSON string <i>{0}</i>",
          "Load steps from JSON string.", "StringToSteps"); 
// dictionary mode                   
AddAnyTypeParam("Key", "The key of data.", '"_"');
AddAnyTypeParam("Value", "The value of data", 0);
AddAction(20, 0, "Set data", "Push", 
          "Set key <i>{0}</i> to value <i>{1}</i>", 
          "Set date.", 
          "SetDate");   
AddAction(21, 0, "Push", "Push - dictionary mode", 
          "Push current data", 
          "Push current data.", "Push");
AddAction(22, 0, "Undo", "Undo - dictionary mode", 
          "Undo", 
          "Get the previosu step.", "Undo");
AddAction(23, 0, "Redo", "Redo - dictionary mode", 
          "Redo", 
          "Get the next step.", "Redo");                                             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any,
              "Undo", "Simple mode", "Undo",
              "Get previosu step. Used for simple mode.");
AddExpression(2, ef_return_any,
              "Redo", "Simple mode", "Redo",
              "Get next step. Used for simple mode.");             
AddExpression(3, ef_return_number, 
              "Get count", "Recorder", "StepsCnt", "Get steps count.");   
//AddAnyTypeParam("Key", "Key of step", "_");               
AddExpression(4, ef_return_any | ef_variadic_parameters, 
              "Get data in current step. Add 2nd parameter to get date with specific key.", "Data", "CurStep", "Get data in current step.");              
AddExpression(5, ef_return_number, 
              "Get current index", "Recorder", "CurIndex", "Get current step index.");              
AddExpression(10, ef_return_string, "Get JSON from recorder", 
              "JSON", "ToString", "Get JSON from recorder.");  
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Mode", "Steps", 
                    "Use steps or states mode. They will have different undo/redo behaviors.", "Steps|States"),
	new cr.Property(ept_integer, "Max count", 0, "Max count of steps. 0 is infinite."),
    new cr.Property(ept_combo, "Official save&load", "Yes", "Enable to support official save&load.", "No|Yes"),    
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
