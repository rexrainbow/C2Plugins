function GetPluginSettings()
{
	return {
		"name":			"Scenario",
		"id":			"Rex_Scenario",
		"version":		"0.1",   		
		"description":	"Executing function from a csv table while time-out",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On execution completed", "Control", "On completed", 
             "Triggered when scenario executed completed.", "OnCompleted");
AddCondition(1, 0, "Is running", "Control", "Is running", 
             "Is scenario running.", "IsRunning");
             
//////////////////////////////////////////////////////////////
// Actions     
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(1, 0, "Setup", "Setup", 
          "Get timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup.", "Setup");
AddStringParam("Commands", "Commands in CSV format", "");
AddAction(2, 0, "Load commands", "Run", 
          "Load commands <i>{0}</i>", 
          "Load commands.", "LoadCmds");
AddNumberParam("Offset", "Time offset at start", 0);
AddStringParam("Tag", 'Tag in csv table. "" is start from 1st command.', "");
AddAction(3, 0, "Start scenario", "Flow control", 
          "Start scenario with offset to <i>{0}</i>, tag to <i>{1}</i>", 
          "Start scenario.", "Start");     
AddAction(4, 0, "Pause scenario", "Control", 
          "Pause scenario", 
          "Pause scenario.", "Pause");
AddAction(5, 0, "Resume scenario", "Control", 
          "Resume scenario", 
          "Resume scenario.", "Resume"); 
AddAction(6, 0, "Stop scenario", "Control", 
          "Stop scenario", 
          "Stop scenario.", "Stop"); 
AddNumberParam("Offset", "Time offset at start", 0);     
AddAction(7, 0, "Set time offset", "Setting", 
          "Set offset to <i>{1}</i>", 
          "Set time offset.", "SetOffset");   
AddAction(20, 0, "Continue", "Response - Wait", 
          "Continue scenario (response of wait command)", 
          "Continue scenario, response of wait command.", "Continue");  
AddStringParam("Tag", "Tag in csv table", "");
AddAction(21, 0, "Goto tag", "Flow control", 
          "Goto tag <i>{0}</i>", 
          "Set current table index to tag.", "GoToTag");		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, "Get last tag", 
              "Tag", "LastTag", 
              "Get last tag."); 

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),
    new cr.Property(ept_combo, "Time stamp", "Differential", "Time stamp type.", "Accumulation|Differential"),
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
