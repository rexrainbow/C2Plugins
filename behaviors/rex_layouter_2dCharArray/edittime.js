function GetBehaviorSettings()
{
	return {
		"name":			"2D-Char-Array layout",
		"id":			"Rex_layouter_2dCharArray",
		"description":	"Map/create sprites by a 2d-char-array on layouter.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_layouter_2dCharArray.html",
		"category":		"Layouter",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On each character", "Character", 
             "On {my} each character", 'Trigger by "Action:MapContent" to get mapped character.', "OnEachChar");       
 		 
//////////////////////////////////////////////////////////////
// Actions  
AddObjectParam("Object type", "Mapped object type.");
AddLayerParam("Layer", "Layer name of number.");
AddStringParam("Strings", "Strings for creating a 2d char-array, seprated by newline.");
AddAction(1, 0, "Map content", "Map", 
          "Map {my} <i>{0}</i> on layer <i>{1}</i>, content to <i>{2}</i>, ", 
          "Map content.", 
          "MapContent");    
AddNumberParam("Cell width", "Cell width, in pixel.");
AddAction(2, 0, "Set cell width", "Cell", 
          "Set {my} cell width to <i>{0}</i>", 
          "Set cell width.", 
          "SetCellWidth");
AddNumberParam("Cell height", "Cell height, in pixel.");
AddAction(3, 0, "Set cell height", "Cell", 
          "Set {my} cell height to <i>{0}</i>", 
          "Set cell height.", 
          "SetCellHeight");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Get UID of layouted instance", "Layout", "InstUID",
              "Get UID of layouted instance.");
AddExpression(2, ef_return_string,
              "Get mapped character", "Character", "Char",
              "Get mapped character.");
AddExpression(3, ef_return_number,
              "Get logic X of layouted instance", "Layout", "LX",
              "Get logic X of layouted instance.");
AddExpression(4, ef_return_number,
              "Get logic Y of layouted instance", "Layout", "LY",
              "Get logic Y of layouted instance.");              
ACESDone();

// Property grid properties for this plugin
var property_list = [   
    new cr.Property(ept_float, "Cell width", 50, "Cell width, in pixel."),
    new cr.Property(ept_float, "Cell height", 50, "Cell height, in pixel."),
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
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
