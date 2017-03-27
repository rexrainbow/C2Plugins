function GetPluginSettings()
{
	return {
		"name":			"Cube Tx",
		"id":			"Rex_SLGCubeTx",
		"version":		"0.1",   		
		"description":	"Transfer logic position to physical position with 3D orthogonal or isometric layout",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_board_cubeTx.html",
		"category":		"Board",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions  
AddComboParamOption("Orthogonal");
AddComboParamOption("Isometric");
AddComboParam("Orientation", "orientation of map", 0);
AddAction(1, 0, "Set orientation", "Orientation", 
          "Set orientation to <i>{0}</i>", 
          "Set orientation.", "SetOrientation");
AddNumberParam("Isometric", "1=Isometric, 0=Orthogonal", 0);
AddAction(2, 0, "Set orientation by number", "Orientation", 
          "Set orientation to <i>{0}</i>", 
          "Set orientation.", "SetOrientation");
AddNumberParam("Width", "Cell width in pixels.", 0);
AddNumberParam("Height", "Cell height in pixels.", 0);
AddNumberParam("Deep", "Cell deep in pixels.", 0);
AddAction(3, 0, "Set cell size", "Size", 
          "Set cell width to <i>{0}</i>, height to <i>{1}</i>, deep to <i>{2}</i>", 
          "Set cell size.", "SetCellSize");
AddNumberParam("X", "Physical X co-ordinate at logic (0,0).", 0);
AddNumberParam("Y", "Physical Y co-ordinate at logic (0,0).", 0);
AddAction(4, 0, "Set position offset", "Position", 
          "Set offset to (<i>{0}</i>, <i>{1}</i>)", 
          "Set Physical position offset (position of logic (0,0)).", "SetOffset");          
          
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Orientation", "Orthogonal", "Map orientation.", "Orthogonal|Isometric"),      
    new cr.Property(ept_float, "X at (0,0,0)", 0, "Physical X co-ordinate at logic (0,0,0)."),
    new cr.Property(ept_float, "Y at (0,0,0)", 0, "Physical Y co-ordinate at logic (0,0,0)."),
	new cr.Property(ept_float, "Width", 32, "Cell width in pixels."),
	new cr.Property(ept_float, "Height", 32, "Cell height in pixels."),
	new cr.Property(ept_float, "Deep", 16, "Cell deep in pixels.")
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
