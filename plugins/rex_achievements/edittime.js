function GetPluginSettings()
{
	return {
		"name":			"Achievements",
		"id":			"Rex_Achievements",
		"version":		"0.1",   		
		"description":	"Achievements in csv table.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_achievements.html",
		"category":		"Rex - Data structure - CSV",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Level", "Level or game name.", '""');
AddCondition(1, cf_looping | cf_not_invertible, "For each achievement", "For each", 
             "For each achievement in <i>{0}</i>", 
             "Repeat the event for each achievement.", "ForEachAchievement");    
             
AddStringParam("Level", "Level or game name.", '""');
AddStringParam("Achievement", "achievement name.", '""');
AddComboParamOption("");
AddComboParamOption("in the latest test");
AddComboParam("Latest", "obtain this achievement in the latest test.", 0);
AddCondition(2, 0, "Is obtained", "Achievements", 
             "<i>{0}</i>: <i>{1}</i> is obtained <i>{2}</i>", 
             "Return true if this achievement is obtained.", "IsObtained");
                
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Data", "Data in CSV format.", "");
AddAction(1, 0, "Load rules", "Load", 
          "Load rules to <i>{0}</i>", 
          "Load rules in csv table for condition-items.", "LoadRules");
       
AddStringParam("Level", "Level or game name.", '""');
AddAction(2, 0, "Set level name", "Prepare", 
          "Set level name to <i>{0}</i>", 
          "Set level name.", "SetLevelName");
          
AddStringParam("Property", "Property name.", "");
AddAnyTypeParam("Value", "The value to set.", 0);
AddAction(3, 0, "Set property", "Prepare", 
          "Set property <i>{0}</i> to <i>{1}</i>", 
          "Set property.", "SetProperty");
          
AddAction(4, 0, "Run tests", "Execute", 
          "Run tests", 
          "Run tests.", "RunTest");

AddStringParam("Level", "Level or game name.", '""');
AddStringParam("Achievement", "achievement name.", '""');
AddComboParamOption("take out");
AddComboParamOption("obtain");
AddComboParam("Action", "Obtain or take out this achievement.", 0);
AddAction(5, 0, "Force obtain", "Force", 
             "Force <i>{2}</i> achievement <i>{0}</i>: <i>{1}</i>", 
             "Force obtain or take out an achievement.", "Forceobtain");          

AddStringParam("JSON", "A string of the JSON data to load.");
AddAction(11, 0, "Load", "JSON", 
          "Load from JSON string <i>{0}</i>", 
          "Load from an accomplishments previously encoded in JSON format.", "JSONLoad");
          
AddStringParam("JSON", "A string of the JSON data to load.");
AddAction(12, 0, "Load states", "JSON", 
          "Load states from JSON string <i>{0}</i>", 
          "Load states from an accomplishments previously encoded in JSON format.", "StateJSONLoad");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get achievement name", "For each", "CurAchievementName", 
              "Get achievement name in a For Each loop.");
              
AddExpression(2, ef_return_string, "Get level name", "Level", "LevelName", 
              "Level name of current achievements.");              
              
AddExpression(11, ef_return_string, "Get achievements as JSON", "JSON", "AsJSON", 
              "Return the contents of achievements in JSON format, include states and rules.");
                             
AddExpression(12, ef_return_string, "Get states as JSON", "JSON", "StatesAsJSON", 
              "Return the states of accomplishments in JSON format.");     
                                     
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Delimiter", ",", "Set delimiter for splitting items."),   
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
