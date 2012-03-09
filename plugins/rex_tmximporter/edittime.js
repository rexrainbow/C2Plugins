function GetPluginSettings()
{
	return {
		"name":			"TMX Importer",
		"id":			"Rex_TMXImporter",
		"description":	"Create sprites according to tmx string.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Utility",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On instance creating", "TMX", 
             "On instance creating", 'Triggered when instance creating by "action:Create tile instances".', "OnInstCreating");
             
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("TMX string", "The tmx string for loading.", '""');
AddAction(1, 0, "Import tmx", "TMX", "Import tmx string <i>{0}</i>",
         "Import tmx string.", "ImportTMX");  
AddAction(2, 0, "Create tile instances", "TMX", "Create tile instances",
         "Create tile instances from tmx string.", "CreateTileInstances");
AddAction(3, 0, "Release tmx object", "TMX", "Release tmx object",
         "Release tmx object.", "ReleaseTMX");
AddNumberParam("X", "X co-ordinate of instance at Logic(0,0).", 0);
AddNumberParam("Y", "Y co-ordinate of instance at Logic(0,0).", 0);       
AddAction(10, 0, "Set instance position of (0,0)", "Setup", "Set instance position of (0,0) to (<i>{0}</i>,<i>{1}</i>)",
         "Set instance position of (0,0).", "SetOPosition");
         
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
AddExpression(12, ef_return_number, 
              "Get logic X index", "OnCreating", "LogicX", 'Get logic X index of created instance. Used in "Condition:On instance creating"');
AddExpression(13, ef_return_number, 
              "Get logic Y index", "OnCreating", "LogicY", 'Get logic Y index of created instance. Used in "Condition:On instance creating"');
AddStringParam("Name", "Property name.", '""');
AddExpression(14, ef_return_any | ef_variadic_parameters, 
              "Get layer properties", "OnCreating", "LayerProp", 'Get layer properties of created instance. Used in "Condition:On instance creating"');
AddStringParam("Name", "Property name.", '""');
AddExpression(15, ef_return_any | ef_variadic_parameters,
              "Get tileset properties", "OnCreating", "TilesetProp", 'Get tileset properties of created instance. Used in "Condition:On instance creating"');
AddStringParam("Name", "Property name.", '""');
AddExpression(16, ef_return_any | ef_variadic_parameters,
              "Get tile properties", "OnCreating", "TileProp", 'Get tile properties of created instance. Used in "Condition:On instance creating"');

              

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
