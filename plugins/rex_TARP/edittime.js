function GetPluginSettings()
{
	return {
		"name":			"TARP",
		"id":			"Rex_TARP",
		"version":		"0.1",           
		"description":	"Time-Action Recorder and Player",
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
AddCondition(20, cf_trigger, "On end", "Player", "On play end", 
             "Triggered when playing finished.", "OnEnd");
AddCondition(21, 0, "Is playing", "Player", "Is playing", 
             "Is player playing.", "IsPlaying");

//////////////////////////////////////////////////////////////
// Actions   
AddAction(1, 0, "Start", "Recorder", 
          "Record start", 
          "Record start.", "RecorderStart");       
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(2, 0, "Record", "Recorder", 
          "Record action <b>{0}</b> (<i>{...}</i>)", 
          "Record action by function and it's parameters.", "RecordAction");
AddAction(3, 0, "Pause", "Recorder", 
          "Record pause", 
          "Record pause.", "RecordPause");  
AddAction(4, 0, "Resume", "Recorder", 
          "Record resume", 
          "Record resume.", "RecorderResume");                    
           
AddObjectParam("Timeline", "Timeline object for getting timer");
AddAction(10, 0, "Setup", "Player", 
          "Get timer from <i>{0}</i>", 
          "Setup TARP.", "PlayerSetup");                             
AddStringParam("Recorder list", "Record list", '""');
AddAction(11, 0, "Load", "Player", 
          "Load recorder list <i>{0}</i>", 
          "Load recorder list.", "PlayerLoad"); 
AddNumberParam("Offset", "Time offset at start", 0);
AddAction(12, 0, "Play", "Player", 
          "Play", 
          "Play.", "PlayStart");   
AddAction(13, 0, "Stop", "Player", 
          "Player stop", 
          "Player stop.", "PlayerStop"); 
AddAction(14, 0, "Pause", "Player", 
          "Player pause", 
          "Player pause.", "PlayerPause");  
AddAction(15, 0, "Resume", "Player", 
          "Player resume", 
          "Player resume.", "PlayerResume");
         

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(10, ef_return_string, "Get recorder list", "Recorder", "RecorderList", 
              "Get recorder list in JSON format.");
AddExpression(20, ef_return_number, "Get offset", "Player", "Offset", "Get offset time.");


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
