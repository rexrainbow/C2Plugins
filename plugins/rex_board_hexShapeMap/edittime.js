function GetPluginSettings()
{
	return {
		"name":			"Hex shape map",
		"id":			"Rex_hexShapeMap",
		"version":		"0.1",        
		"description":	"Shape map of hex grid",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_hexshapemap.html",
		"category":		"Rex - Board - application",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Board", "Board object");
AddObjectParam("Tile", "Tile object.");
AddLayerParam("Layer", "Layer name of number."); 
AddNumberParam("Radius", "Radius in grids.", 1);
AddAction(1, 0, "Reset in hexagon", "Reset board", 
          "Reset board <i>{0}</i> and fill tile <i>{1}</i> on layer <i>{2}</i> in hexagon shape with radius to <i>{3}</i>", 
          "Reset board and fill tile with hexagon shape.", "ResetHexagon"); 
          
AddObjectParam("Board", "Board object");
AddObjectParam("Tile", "Tile object.");
AddLayerParam("Layer", "Layer name of number."); 
AddComboParamOption("Down/Right");
AddComboParamOption("Top/Left");
AddComboParam("Face", "Face of triangle.", 0);
AddNumberParam("Height", "Height in grids.", 1);
AddAction(2, 0, "Reset in triangle", "Reset board", 
          "Reset board <i>{0}</i> and fill tile <i>{1}</i> on layer <i>{2}</i> in <i>{3}</i> triangle shape with height to <i>{4}</i>", 
          "Reset board and fill tile with triangle shape.", "ResetTriangle");  
          
AddObjectParam("Board", "Board object");
AddObjectParam("Tile", "Tile object.");
AddLayerParam("Layer", "Layer name of number.");
AddComboParamOption("Type 0");
AddComboParamOption("Type 1");
AddComboParamOption("Type 2");
AddComboParam("Face", "Type of parallelogram.", 0);
AddNumberParam("Width", "Width in grids.", 1);
AddNumberParam("Height", "Height in grids.", 1);
AddAction(3, 0, "Reset in parallelogram", "Reset board", 
          "Reset board <i>{0}</i> and fill tile <i>{1}</i> on layer <i>{2}</i> in <i>{3}</i> parallelogram shape with <i>{4}</i>x<i>{5}</i>", 
          "Reset board and fill tile with parallelogram shape.", "ResetParallelogram");            
//////////////////////////////////////////////////////////////
// Expressions


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
