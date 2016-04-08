function GetPluginSettings()
{
	return {
		"name":			"ScenarioJ Engine",
		"id":			"Rex_ScenarioJEngine",
		"version":		"0.1",        
		"description":	"Engine of Scenario-Json.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_scenariojengine.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Clean commands", "0: Load", 
          "Clean all commands", 
          "Clean all commands.", "CleanCmds");
AddStringParam("Commands", "Commands in JSON format", "");
AddAction(2, 0, "Append commands", "0: Load", 
          "Append commands <i>{0}</i>", 
          "Append commands.", "AppendCmds");    

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
          
ddAction(21, 0, "Pause scenario", "Control", 
          "Pause scenario", 
          "Pause scenario.", "Pause");
AddAction(22, 0, "Resume scenario", "Control", 
          "Resume scenario", 
          "Resume scenario.", "Resume"); 
AddAction(23, 0, "Stop scenario", "Control", 
          "Stop scenario", 
          "Stop scenario.", "Stop"); 

AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(41, 0, "Setup timeline", "Setup", 
          "Get timer from <i>{0}</i>", 
          "Setup timeline.", "SetupTimeline");	          
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Sync timescale", "Yes", "Sync to object's timescale.", "No|Yes"),    
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
