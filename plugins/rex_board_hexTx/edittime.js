function GetPluginSettings()
{
	return {
		"name":			"Hex Tx",
		"id":			"Rex_SLGHexTx",
		"version":		"0.1",   		
		"description":	"Transfer logic position to physical position with hexagonal layout",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_board_hexTx.html",
		"category":		"Rex - Board - core",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions   
AddComboParamOption("Left-Right");
AddComboParamOption("Up-Down");
AddComboParam("Axis", "The axis of layout.", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Indent", "Indent first row or column.", 0);
AddAction(1, 0, "Set orientation", "Arrangement", 
          "Set axis to <i>{0}</i>, indent to <i>{1}</i>", 
          "Set orientation.", "SetOrientation"); 
          
AddNumberParam("Axis", "0=Left-Right, 1=Up-Down.", 0);
AddNumberParam("Indent", "0=No, 1=Yes.", 0);
AddAction(2, 0, "Set orientation by number", "Arrangement", 
          "Set axis to <i>{0}</i>, indent to <i>{1}</i>", 
          "Set orientation by number.", "SetOrientation"); 
            
AddNumberParam("Width", "Cell width in pixels.", 0);
AddNumberParam("Height", "Cell height in pixels.", 0);
AddAction(3, 0, "Set cell size", "Size", 
          "Set cell width to <i>{0}</i>, height to <i>{1}</i>", 
          "Set cell size.", "SetCellSize");
AddNumberParam("X", "Physical X co-ordinate at logic (0,0).", 0);
AddNumberParam("Y", "Physical Y co-ordinate at logic (0,0).", 0);
AddAction(4, 0, "Set position offset", "Offset", 
          "Set offset to (<i>{0}</i>, <i>{1}</i>)", 
          "Set Physical position offset (position of logic (0,0)).", "SetOffset"); 


                    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Cell width", "Size", "Width", "Get cell width in pixels.");
AddExpression(2, ef_return_number, "Cell height", "Size", "Height", "Get cell height in pixels.");
AddExpression(3, ef_return_number, "X co-ordinate at (0,0)", "Offset", "POX", "Get physical X co-ordinate at logic (0,0).");
AddExpression(4, ef_return_number, "Y co-ordinate at (0,0)", "Offset", "POY", "Get physical Y co-ordinate at logic (0,0).");
AddExpression(11, ef_return_number, 
              "Direction code of right", "Direction code (Left-Right)", "DIRLRRIGHT", 
              "Direction code of right.");
AddExpression(12, ef_return_number, 
              "Direction code of down-right", "Direction code (Left-Right)", "DIRLRDOWNRIGHT", 
              "Direction code of down-right.");
AddExpression(13, ef_return_number, 
              "Direction code of down-left", "Direction code (Left-Right)", "DIRLRDOWNLEFT", 
              "Direction code of down-left.");  
AddExpression(14, ef_return_number, 
              "Direction code of left", "Direction code (Left-Right)", "DIRLRLEFT", 
              "Direction code of left.");
AddExpression(15, ef_return_number, 
              "Direction code of up-left", "Direction code (Left-Right)", "DIRLRUPLEFT", 
              "Direction code of up-left.");
AddExpression(16, ef_return_number, 
              "Direction code of up-right", "Direction code (Left-Right)", "DIRLRUPRIGHT", 
              "Direction code of up-right."); 
AddExpression(17, ef_return_number, 
              "Direction code of down-right", "Direction code (Up-Down)", "DIRUDDOWNRIGHT", 
              "Direction code of down-right.");
AddExpression(18, ef_return_number, 
              "Direction code of down", "Direction code (Up-Down)", "DIRUDDOWN", 
              "Direction code of down.");
AddExpression(19, ef_return_number, 
              "Direction code of down-left", "Direction code (Up-Down)", "DIRUDDOWNLEFT", 
              "Direction code of down-left.");  
AddExpression(20, ef_return_number, 
              "Direction code of up-left", "Direction code (Up-Down)", "DIRUDUPLEFT", 
              "Direction code of up-left.");
AddExpression(21, ef_return_number, 
              "Direction code of up", "Direction code (Up-Down)", "DIRUDUP", 
              "Direction code of up.");
AddExpression(22, ef_return_number, 
              "Direction code of up-right", "Direction code (Up-Down)", "DIRUDUPRIGHT", 
              "Direction code of up-right."); 

AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);       
AddExpression(51, ef_return_number,
              "Get X co-ordinate by logic index", "Physical", "LXY2PX",
              "Get physical X co-ordinate by logic X,Y index. Return (-1) if this position does not exist.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);                              
AddExpression(52, ef_return_number,
              "Get Y co-ordinate by logic index", "Physical", "LXY2PY",
              "Get physical Y co-ordinate by logic X,Y index. Return (-1) if this position does not exist."); 

AddNumberParam("X", "The physical X.", 0);
AddNumberParam("Y", "The physical Y.", 0);       
AddExpression(53, ef_return_number,
              "Get logic X by physical co-ordinate", "Logic", "PXY2LX",
              "Get logic X by physical X,Y co-ordinate.");
AddNumberParam("X", "The physical X.", 0);
AddNumberParam("Y", "The physical Y.", 0);                             
AddExpression(54, ef_return_number,
              "Get logic Y by physical co-ordinate", "Logic", "PXY2LY",
              "Get logic Y by physical X,Y co-ordinate."); 
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "X at (0,0)", 0, "Physical X co-ordinate at logic (0,0)."),
    new cr.Property(ept_float, "Y at (0,0)", 0, "Physical Y co-ordinate at logic (0,0)."),
	new cr.Property(ept_float, "Width", 32, "Cell width in pixels."),
	new cr.Property(ept_float, "Height", 32, "Cell height in pixels."),
	new cr.Property(ept_combo, "Axis", "Left-Right", "The axis of layout.", "Left-Right|Up-Down"),
	new cr.Property(ept_combo, "Indent", "No", "Indent first row or column.", "No|Yes")
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
