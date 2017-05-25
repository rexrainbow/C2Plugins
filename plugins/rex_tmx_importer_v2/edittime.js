function GetPluginSettings()
{
	return {
		"name":			"TMX Importer v2",
		"id":			"Rex_tmx_importer_v2",
		"version":		"0.1",          
		"description":	"Create sprites according to tmx exported file.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_tmx_importer_v2.html",
		"category":		"Rex - Board - tmx importer v2.x",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On each tile cell", "Callback: Create tiless", 
             "On each tile cell", "Triggered when retrieving each available tile cell.", "OnEachTileCell");
AddCondition(2, cf_trigger, "On each object", "Callback: Create tiless", 
             "On each object", "Triggered when retrieving each avaiable object on 'object layer'.", "OnEachObject");
             
// for each property
AddCondition(10, cf_looping | cf_not_invertible, "For each layer property", "For each property", "For each layer property", 
             "Repeat the event for each layer property.", "ForEachLayerProperty"); 
AddCondition(11, cf_looping | cf_not_invertible, "For each tileset property", "For each property", "For each tileset property", 
             "Repeat the event for each tileset property.", "ForEachTilesetProperty");  
AddCondition(12, cf_looping | cf_not_invertible, "For each tile property", "For each property", "For each tile property", 
             "Repeat the event for each tile property.", "ForEachTileProperty");
AddCondition(13, cf_looping | cf_not_invertible, "For each map property", "For each property", "For each map property", 
             "Repeat the event for each map property.", "ForEachMapProperty");               
AddCondition(14, cf_looping | cf_not_invertible, "For each layer", "For each layer", "For each layer", 
             "Repeat the event for each layer.", "ForEachLayer"); 
AddCondition(15, cf_looping | cf_not_invertible, "For each object property", "For each property", "For each object property", 
             "Repeat the event for each object property.", "ForEachObjectProperty");
                          
// duration             
AddCondition(20, cf_trigger, "On retrieving finished", "Duration", 
             "On retrieving finished", "Triggered when retrieving finished.", "OnRetrieveFinished");   
AddCondition(21, cf_trigger, "On retrieving duration", "Duration", 
             "On retrieving duration", "Triggered during retrieving duration tick.", "OnRetrieveDurationTick"); 
        
        
// retrieve one logic position
AddNumberParam("X", "Logic X.", 0);
AddNumberParam("Y", "Logic Y.", 0);   
AddCondition(31, cf_looping | cf_not_invertible, "For each tile at logic XY", "Logic XY", 
             "For each tile at logic (<i>{0}</i>,<i>{1}</i>)",
             "Repeat the event for each tile at logic XY.", "ForEachTileAtLXY");          
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("Input", "Input string.", '""');
AddObjectParam("Parser", "Parser object.");
AddAction(1, 0, "Import tmx", "0: Load", "Import tmx content <i>{0}</i>, with parser {1}",
         "Import tmx string.", "ImportTMX"); 
AddObjectParam("Tile", "Tile object.");
AddAction(2, 0, "Create tiles", "One tick mode", "Create tiles <i>{0}</i>",
         'Retrieve tile array and creating tiles. It will trigger "Condition:On each tile cell".', "CreateTiles");
AddAction(3, 0, "Release tmx object", "Release", "Release tmx object",
         "Release tmx object.", "ReleaseTMX");       
AddAction(7, 0, "Retrieve tile array", "One tick mode", "Retrieve tile array",
         'Retrieve tile array. It will trigger "Condition:On each tile cell"', "RetrieveTileArray");         
AddNumberParam("X", "X co-ordinate of instance at Logic(0,0).", 0);
AddNumberParam("Y", "Y co-ordinate of instance at Logic(0,0).", 0);       
AddAction(10, 0, "Set instance position of (0,0)", "Setup", "Set instance position of (0,0) to (<i>{0}</i>,<i>{1}</i>)",
         "Set instance position of (0,0).", "SetOPosition");

// duration mode         
AddObjectParam("Tile", "Tile object.");
AddNumberParam("Processing time", "Processing time per tick in percentage. A tick time is (1/60), 1 is using full tick time.", 0.5);  
AddAction(20, 0, "Create tiles in a duration", "Duration mode", 
         "Create tiles <i>{0}</i> in a duration",
         'Retrieve tile array and creating tiles in a duration. It will trigger "Condition:On each tile cell".', "CreateTilesDuration");
AddNumberParam("Processing time", "Processing time per tick in percentage. A tick time is (1/60), 1 is using full tick time.", 0.5);           
AddAction(21, 0, "Retrieve tile array in a duration", "Duration mode", 
         "Retrieve tile array in a duration",
         'Retrieve tile array in a duration. It will trigger "Condition:On each tile cell"', "RetrieveTileArrayDuration");          

AddStringParam("Layer", "TMX layer.", '""');
AddObjectParam("Tilemap", "Tilemap object.");
AddAction(51, 0, "Reset tilemap", "Tilemap", 
         "Reset tilemap <i>{1}</i> with tmx layer <i>{0}</i>",
         "Reset tilemap by tile array of a layer.", "ResetTilemap");
                 
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, 
              "Get map width", "Map", "MapWidth", "Get map width in tile number.");
AddExpression(2, ef_return_number, 
              "Get map height", "Map", "MapHeight", "Get map height in tile number.");
AddExpression(3, ef_return_number, 
              "Get tile width", "Map", "TileWidth", "Get tile width in pixel.");
AddExpression(4, ef_return_number, 
              "Get tile height", "Map", "TileHeight", "Get tile height in pixel.");  
AddExpression(5, ef_return_number, 
              "Get total width", "Map", "TotalWidth", "Get total width in pixel.");
AddExpression(6, ef_return_number, 
              "Get total height", "Map", "TotalHeight", "Get total height in pixel."); 
AddExpression(7, ef_return_number, 
              "Get orientation", "Map", "IsIsometric", "Get orientation. 1=Isometric, 0=Orthogonal");
AddExpression(8, ef_return_string | ef_variadic_parameters, 
              "Get image source of tileset", "Tileset", "ImageSource", "Get image source of tileset.");		
AddExpression(9, ef_return_number | ef_variadic_parameters, 
              "Get image width of tileset", "Tileset", "ImageWidth", "Get image width of tileset.");		
AddExpression(10, ef_return_number | ef_variadic_parameters, 
              "Get image height of tileset", "Tileset", "ImageHeight", "Get image height of tileset.");			  
AddExpression(11, ef_return_number, 
              "Get tile id", "Tile", "TileID", "Get tile id.");           
AddExpression(12, ef_return_number, 
              "Get logic X index", "Tile", "LogicX", "Get logic X index of created instance.");
AddExpression(13, ef_return_number, 
              "Get logic Y index", "Tile", "LogicY", "Get logic Y index of created instance.");
AddStringParam("Name", "Property name.", '""');
AddExpression(14, ef_return_any | ef_variadic_parameters, 
              "Get layer properties", "Tile", "LayerProp", "Get layer properties of created instance. Add second parameters to set default value.");
AddStringParam("Name", "Property name.", '""');
AddExpression(15, ef_return_any | ef_variadic_parameters,
              "Get tileset properties", "Tileset", "TilesetProp", "Get tileset properties of created instance.  Add second parameters to set default value.");
AddStringParam("Name", "Property name.", '""');
AddExpression(16, ef_return_any | ef_variadic_parameters,
              "Get tile properties", "Tile", "TileProp", "Get tile properties of created instance.  Add second parameters to set default value.");
AddExpression(17, ef_return_number, 
              "Get physical X position", "Tile", "PhysicalX", "Get physical X position (in pixel) of created instance.");
AddExpression(18, ef_return_number, 
              "Get physical Y position", "Tile", "PhysicalY", "Get logic Y position (in pixel) of created instance.");
AddExpression(19, ef_return_string, 
              "Get layer name", "Tile", "LayerName", "Get layer name of created instance.");
AddExpression(20, ef_return_number, 
              "Get layer opacity", "Tile", "LayerOpacity", "Get layer opacity of created instance.");
AddExpression(21, ef_return_number, 
              "Get mirrored", "Tile", "IsMirrored", "Get mirrored of created instance.");
AddExpression(22, ef_return_number, 
              "Get flipped", "Tile", "IsFlipped", "Get flipped of created instance.");
AddExpression(23, ef_return_number, 
              "Get instance UID", "Tile", "InstUID", 'Get instance UID created by "Action:Create tiles".');  
AddExpression(24, ef_return_number | ef_variadic_parameters, 
              "Get frame number", "Tile", "Frame", "Get frame number, , add GID at 1st parameter to get frame number of that tile.");                
AddExpression(25, ef_return_string | ef_variadic_parameters, 
              "Get tileset name", "Tileset", "TilesetName", "Get tileset name, add GID at 1st parameter to get tileset name of that tile.");
AddStringParam("Name", "Property name.", '""');
AddExpression(26, ef_return_any | ef_variadic_parameters, 
              "Get map properties", "Map", "MapProp", "Get map properties. Add second parameters to set default value.");
AddExpression(27, ef_return_number, 
              "Get angle", "Tile", "TileAngle", "Get angle of created instance.");
AddExpression(28, ef_return_number, 
              "Get background color", "Map", "BackgroundColor", "Get background color.");
	  
             
// For each property
AddExpression(30, ef_return_string, 
              "Current layer property name", "For Each", "CurLayerPropName", "Get the name of current layer property in a For Each loop."); 
AddExpression(31, ef_return_any, 
              "Current layer property value", "For Each", "CurLayerPropValue", "Get the value of current layer property in a For Each loop.");               
AddExpression(32, ef_return_string, 
              "Current tileset property name", "For Each", "CurTilesetPropName", "Get the name of current tileset property in a For Each loop."); 
AddExpression(33, ef_return_any, 
              "Current tileset property value", "For Each", "CurTilesetPropValue", "Get the value of current tileset property in a For Each loop.");               
AddExpression(34, ef_return_string, 
              "Current tile property name", "For Each", "CurTilePropName", "Get the name of current tile property in a For Each loop."); 
AddExpression(35, ef_return_any, 
              "Current tile property value", "For Each", "CurTilePropValue", "Get the value of current tile property in a For Each loop."); 
AddExpression(36, ef_return_string, 
              "Current map property name", "For Each", "CurMapPropName", "Get the name of current map property in a For Each loop."); 
AddExpression(37, ef_return_any, 
              "Current map property value", "For Each", "CurMapPropValue", "Get the value of current map property in a For Each loop.");               
AddExpression(38, ef_return_string, 
              "Current object property name", "For Each", "CurObjectPropName", "Get the name of current object property in a For Each loop."); 
AddExpression(39, ef_return_any, 
              "Current object property value", "For Each", "CurObjectPropValue", "Get the value of current object property in a For Each loop.");               
  
                              
// objects
AddExpression(40, ef_return_string, 
              "Get object group name", "Object: Object group", "ObjGroupName", "Get object group name.");
AddExpression(41, ef_return_number, 
              "Get area width of object group", "Object: Object group", "ObjGroupWidth", "Get area width of object group.");
AddExpression(42, ef_return_number, 
              "Get area height of object group", "Object: Object group", "ObjGroupHeight", "Get area height of object group.");
              
AddExpression(50, ef_return_string, 
              "Get object name", "Object: Object", "ObjectName", "Get object name.");
AddExpression(51, ef_return_string, 
              "Get object type", "Object: Object", "ObjectType", "Get object type.");              
AddExpression(52, ef_return_number, 
              "Get area width of object", "Object: Object", "ObjectWidth", "Get area width of object.");
AddExpression(53, ef_return_number, 
              "Get area height of object", "Object: Object", "ObjectHeight", "Get area height of object.");
AddExpression(54, ef_return_number, 
              "Get position X of object", "Object: Object", "ObjectX", "Get position X of object.");
AddExpression(55, ef_return_number, 
              "Get position Y index of object", "Object: Object", "ObjectY", "Get position Y of object.");
AddStringParam("Name", "Property name.", '""');
AddExpression(56, ef_return_any | ef_variadic_parameters,
              "Get object properties", "Object: Object", "ObjectProp", "Get object properties.  Add second parameters to set default value.");
              
//ef_deprecated              
AddExpression(57, ef_return_number | ef_deprecated, 
              "Get physical X position of object", "Object: Object", "ObjectPX", "Get physical X position (in pixel) of object.");
AddExpression(58, ef_return_number | ef_deprecated, 
              "Get physical Y position of object", "Object: Object", "ObjectPY", "Get physical Y position (in pixel) of object.");
//ef_deprecated
              
AddExpression(59, ef_return_number, 
              "Get id of object", "Object: Object", "ObjectID", "Get id of object.");              
AddExpression(60, ef_return_number, 
              "Get rotation of object", "Object: Object", "ObjectRotation", "Get rotation of object, in degrees clockwise.");              
AddExpression(61, ef_return_number, 
              "Get gid of a reference tile", "Object: Object", "ObjectRefGID", "Get gid of a reference tile.");   
              
// duration
AddExpression(70, ef_return_number, 
              "Get percent of retrieving process", "Duration", "RetrievingPercent", "Get percent of retrieving process.");  


AddExpression(101, ef_return_number, 
              "Get POX", "Map", "POX", "Get position X of logic (0,0).");
AddExpression(102, ef_return_number, 
              "Get POY", "Map", "POY", "Get position Y of logic (0,0).");

// hexagon layout
AddExpression(111, ef_return_number, 
              "Is Up2down layout", "Hex layout", "IsUp2Down", "Return 1 if current hexagon map is up2down layout.");
AddExpression(112, ef_return_number, 
              "Is indent first line", "Hex layout", "IsIndent", "Return 1 if current hexagon map is indent first line.");
                                                   
ACESDone();

// Property grid properties for this plugin
var property_list = [  
    new cr.Property(ept_float, "X at (0,0)", 0, "Physical X co-ordinate at logic (0,0)."),
    new cr.Property(ept_float, "Y at (0,0)", 0, "Physical Y co-ordinate at logic (0,0)."),  
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
