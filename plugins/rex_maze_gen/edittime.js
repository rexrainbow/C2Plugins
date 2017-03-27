function GetPluginSettings()
{
	return {
		"name":			"Maze gen",
		"id":			"Rex_MazeGen",
		"version":		"0.1",        
		"description":	"Generate random maze asynchronously. Reference: http://ondras.github.io/rot.js/hp/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_mazegen.html",
		"category":		"Rex - Board - random map",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"mazegen.js",
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Is generating", "State", "Is generating", 
             "Return true if map is generating.", "IsGenerating");
             
AddCondition(2, cf_trigger, "On completed", "State", "On completed", 
             "Trigger when map generating completed.", "OnCompleted");

AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0);  
AddComboParamOption("empty space");
AddComboParamOption("wall");
AddComboParam("Type", "Type of tile.",1);           
AddCondition(11, 0, "Is a wall", "Value", 
             "({0},{1}) is a {2}", 
             "Return true if it is a empty space or a wll in a specific logic position.", "IsCharAt");             
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Width", "Map width.", 10);
AddNumberParam("Height", "Map height.", 10);
AddComboParamOption("divide");
AddComboParamOption("icey");
AddComboParamOption("eller");
AddComboParam("Algorithm", "Algorithm.",0);
AddNumberParam("Seed", "Random seed.", 1234);
AddAction(1, 0, "Generate", "Maze", 
          "Generate <i>{0}</i>x<i>{1}</i> <i>{2}</i> maze, with random seed to <i>{3}</i>",
          "Generate maze.", "GenerateMaze");  

AddAction(2, 0, "Cancel", "Maze", 
          "Cancel generating process",
          "Cancel current generating process.", "Cencel"); 

AddAction(3, 0, "Release", "Maze",
         "Release map",
         "Release map", "Release");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get map width", "Map", "MapWidth", "Get width of map.");
AddExpression(2, ef_return_number, "Get map height", "Map", "MapHeight", "Get height of map.");

AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0);
AddExpression(11, ef_return_any, "Get cell value", "Map", "ValueAt", 
              "Get cell value at logic X,Y. 1 is a wall, 0 is an empty space. Return -1 if this cell is invalid.");
              
AddExpression(12, ef_return_string, "Get map as JSON string", "Map", "MapAsJson", 
              'Get map as JSON string. Return "" if map is not ready.');

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
