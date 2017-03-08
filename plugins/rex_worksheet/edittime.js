function GetPluginSettings()
{
	return {
		"name":			"Work Sheet",
		"id":			"Rex_WorkSheet",
		"version":		"1.0",           
		"description":	"Executing instructions from a string while time-out",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_worksheet.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On execution completed", "Control", "On completed", 
             "Triggered when worksheet execution completed.", "OnCompleted");
AddCondition(1, 0, "Is worksheet running", "Control", "Is running", 
             "Is worksheet running.", "IsRunning");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(0, 0, "Setup work sheet", "Z: Deprecated", 
          "Get timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup work sheet.", "Setup");
AddStringParam("Instructions", "Instructions in work sheet", '""');
AddNumberParam("Offset", "Time offset at start", 0);
AddAction(1, 0, "Start work sheet", "Control", 
          "Start work sheet <i>{0}</i> with <i>{1}</i> offset", 
          "Start work sheet.", "Start");          
AddAction(2, 0, "Pause work sheet", "Control", 
          "Pause work sheet", 
          "Pause work sheet.", "Pause");
AddAction(3, 0, "Resume work sheet", "Control", 
          "Resume work sheet", 
          "Resume work sheet.", "Resume"); 
AddAction(4, 0, "Stop work sheet", "Control", 
          "Stop work sheet", 
          "Stop work sheet.", "Stop"); 
AddNumberParam("Offset", "Time offset at start", 0);     
AddAction(5, 0, "Set time offset", "Setting", 
          "Set offset to <i>{1}</i>", 
          "Set time offset.", "SetOffset");
		  
AddObjectParam("Timeline", "Timeline object for getting timer");
AddAction(10, 0, "Setup work sheet", "Setup", 
          "Get timer from <i>{0}</i>", 
          "Setup work sheet.", "Setup2");
		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get offset", "Setting", "Offset", "Get offset time.");


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
