function GetPluginSettings()
{
	return {
		"name":			"Dungeon gen",
		"id":			"Rex_DungeonGen",
		"version":		"0.1",        
		"description":	"Generate random dungeon map asynchronously.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_dungeongen.html",
		"category":		"Rex - Board - random map",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"dungeongen.js",
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
AddComboParamOption("invalid"); 
AddComboParamOption("filled wall");
AddComboParamOption("border wall");
AddComboParamOption("room space");
AddComboParamOption("corridor");
AddComboParamOption("door");
AddComboParam("Type", "Type of tile.",1);           
AddCondition(11, 0, "Tile type", "Type", 
             "({0},{1}) is {2}", 
             "Return true if it is a wall/room space/corridor in a specific logic position.", "TileType");  
             
AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0); 
AddComboParamOption("dead end"); 
AddComboParamOption("L-junction");
AddComboParamOption("I-junction");
AddComboParamOption("T-junction");
AddComboParamOption("X-junction");
AddComboParam("Type", "Type of corridor.",0);           
AddCondition(12, 0, "Corridor type", "Type - corridor", 
             "({0},{1}) is {2} corridor", 
             "Return true if it is a dead end/L-junction/I-junction/T-junction/X-junction corridor in a specific logic position.", "IsCorridorType");
             
AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0); 
AddComboParamOption("left"); 
AddComboParamOption("right");
AddComboParamOption("top");
AddComboParamOption("bottom");
AddComboParam("Neighbor", "Direction of room neighbor.",0);
AddCondition(13, 0, "Door type", "Type - door", 
             "({0},{1}) has room at {2} side", 
             "Return true if there has a neighbor room.", "DoorType");              

AddCondition(21, cf_looping | cf_not_invertible, "For each room", "For each room", 
             "For each room", 
             "Repeat the event for each room.", "ForEachRoom");             
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Width", "Map width.", 40);
AddNumberParam("Height", "Map height.", 25);
AddNumberParam("Seed", "Random seed.", 1234);
AddNumberParam("Room minimum width", "Room minimum width.", 3);
AddNumberParam("Room maximum width", "Room maximum width.", 9);
AddNumberParam("Room minimum height", "Room minimum height.", 3);
AddNumberParam("Room maximum height", "Room maximum height.", 5);
AddNumberParam("Corridor minimum length", "Corridor minimum length.", 3);
AddNumberParam("Corridor maximum length", "Corridor maximum length.", 10);
AddNumberParam("Dug percentage", "Stop after this percentage of level area has been dug out.", 0.2);
AddNumberParam("Time limit", "Stop after this much time has passed, in seconds.", 1);
AddAction(1, 0, "Digger", "Map - Generate", 
          "Generate <i>{0}</i>x<i>{1}</i> Digger dungeon, with random seed to <i>{2}</i> , option: room width [<i>{3}</i>, <i>{4}</i>], room height [<i>{5}</i>, <i>{6}</i>], corridor length [<i>{7}</i>, <i>{8}</i>], stop when dug percentage to <i>{9}</i>, or elapsed time to <i>{10}</i>",
          "Generate dungeon by digger algorithm.", "GenerateDungeonDigger");  

AddNumberParam("Width", "Map width.", 40);
AddNumberParam("Height", "Map height.", 25);
AddNumberParam("Seed", "Random seed.", 1234);
AddNumberParam("Room minimum width", "Room minimum width.", 3);
AddNumberParam("Room maximum width", "Room maximum width.", 9);
AddNumberParam("Room minimum height", "Room minimum height.", 3);
AddNumberParam("Room maximum height", "Room maximum height.", 5);
AddNumberParam("Dug percentage", "Stop after this percentage of level area has been dug out.", 0.1);
AddNumberParam("Time limit", "Stop after this much time has passed, in seconds.", 1);
AddAction(2, 0, "Uniform", "Map - Generate", 
          "Generate <i>{0}</i>x<i>{1}</i> Uniform dungeon, with random seed to <i>{2}</i> , option: room width [<i>{3}</i>, <i>{4}</i>], room height [<i>{5}</i>, <i>{6}</i>], stop when dug percentage to <i>{7}</i>, or elapsed time to <i>{8}</i>",
          "Generate dungeon by uniform algorithm.", "GenerateDungeonUniform");

AddNumberParam("Width", "Map width.", 10);
AddNumberParam("Height", "Map height.", 10);
AddNumberParam("Seed", "Random seed.", 1234);
AddNumberParam("Cell width", "Cell width.", 3);
AddNumberParam("Cell height", "Cell height.", 3);
AddAction(3, 0, "Rogue", "Map - Generate", 
          "Generate <i>{0}</i>x<i>{1}</i> Rogue dungeon, with random seed to <i>{2}</i> , option: cell size <i>{3}</i>x<i>{4}</i>",
          "Generate dungeon by rogue algorithm.", "GenerateDungeonRogue");
          
AddAction(12, 0, "Cancel", "Map", 
          "Cancel generating process",
          "Cancel current generating process.", "Cencel"); 

AddAction(13, 0, "Release", "Map",
         "Release map",
         "Release map", "Release");   
                   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get map width", "Map", "MapWidth", "Get width of map.");
AddExpression(2, ef_return_number, "Get map height", "Map", "MapHeight", "Get height of map.");

AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0);
AddExpression(11, ef_return_any, "Get cell value", "Map", "ValueAt", 
              "Get cell value at logic X,Y. Return 1 if this cell is a wall, 0 if this cell is a room space/corridor/door, return -1 if this cell is invalid.");

AddExpression(12, ef_return_string, "Get map as JSON string", "Map", "MapAsJson", 
              'Get map as JSON string. Return "" if map is not ready.');              

AddExpression(21, ef_return_number, "Get left X index of current room", "For each room", "CurRoomLeft", 
              "Get left X index of current room in a For Each loop.");
AddExpression(22, ef_return_number, "Get right X of current room", "For each room", "CurRoomRight", 
              "Get right X index of current room in a For Each loop.");
AddExpression(23, ef_return_number, "Get top Y index of current room", "For each room", "CurRoomTop", 
              "Get top Y index of current room in a For Each loop.");
AddExpression(24, ef_return_number, "Get bottom Y of current room", "For each room", "CurRoomBottom", 
              "Get bottom Y index of current room in a For Each loop.");       
AddExpression(25, ef_return_number, "Get center X index of current room", "For each room", "CurRoomCenterX", 
              "Get center X index of current room in a For Each loop.");
AddExpression(26, ef_return_number, "Get center Y of current room", "For each room", "CurRoomCenterY", 
              "Get center Y index of current room in a For Each loop.");  
AddExpression(27, ef_return_number, "Get width of current room", "For each room", "CurRoomWidth", 
              "Get width of current room in a For Each loop.");
AddExpression(28, ef_return_number, "Get height of current room", "For each room", "CurRoomHeight", 
              "Get height of current room in a For Each loop."); 
AddExpression(29, ef_return_number, "Get index of current room", "For each room", "CurRoomIndex", 
              "Get index of current room in a For Each loop."); 
AddExpression(30, ef_return_number, "Get amount of rooms", "Rooms", "RoomsCount", 
              "Get amount of rooms.");              
AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0);              
AddExpression(31, ef_return_number, "Get room index by LXY", "Rooms", "LXY2RoomIndex", 
              "Get room index by a specific position. Retrun -1 if this position is not in any room.");
AddNumberParam("Index", "Index of room.", 0);
AddExpression(32, ef_return_number, "Get left X index of room by index", "Room", "RoomLeft", 
              "Get left X index of room by index.");
AddNumberParam("Index", "Index of room.", 0);
AddExpression(33, ef_return_number, "Get right X of room by index", "Room", "RoomRight", 
              "Get right X of room by index.");
AddNumberParam("Index", "Index of room.", 0);
AddExpression(34, ef_return_number, "Get top Y index of room by index", "Room", "RoomTop", 
              "Get top Y index of room by index.");
AddNumberParam("Index", "Index of room.", 0);              
AddExpression(35, ef_return_number, "Get bottom Y of room by index", "Room", "RoomBottom", 
              "Get bottom Y of room by index.");    
AddNumberParam("Index", "Index of room.", 0);              
AddExpression(36, ef_return_number, "Get center X index of room by index", "Room", "RoomCenterX", 
              "Get center X index of room by index.");
AddNumberParam("Index", "Index of room.", 0);              
AddExpression(37, ef_return_number, "Get center Y of room by index", "Room", "RoomCenterY", 
              "Get center Y of room by index.");  
AddNumberParam("Index", "Index of room.", 0);              
AddExpression(38, ef_return_number, "Get width of room by index", "Room", "RoomWidth", 
              "Get width of room by index.");
AddNumberParam("Index", "Index of room.", 0);              
AddExpression(39, ef_return_number, "Get height of room by index", "Room", "RoomHeight",     
              "Get height of room by index.");          
              
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
