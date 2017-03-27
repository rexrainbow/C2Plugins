function GetPluginSettings()
{
	return {
		"name":			"Projection Tx",
		"id":			"Rex_ProjectionTx",
		"version":		"0.1",   		
		"description":	"Transfer logic position to physical position with projection layout",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_board_projectiontx.html",
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
AddNumberParam("X", "Physical X co-ordinate at logic (0,0).", 0);
AddNumberParam("Y", "Physical Y co-ordinate at logic (0,0).", 0);
AddAction(1, 0, "Set origin", "Origin", 
          "Set origin to (<i>{0}</i>, <i>{1}</i>)", 
          "Set Physical origin logic (0,0) position (position of logic (0,0)).", "SetOffset"); 
          
AddNumberParam("X", "Physical X offset of Logic (1,0) - Logic (0,0).", 0);
AddNumberParam("Y", "Physical Y offset of Logic (1,0) - Logic (0,0).", 0);
AddAction(2, 0, "Set vector U", "Vector UV", 
          "Set vector U to (<i>{0}</i>, <i>{1}</i>)", 
          "Set vector U, physical offset of Logic (1,0) - Logic (0,0).", "SetVectorU");           
          
AddNumberParam("X", "Physical X offset of Logic (0,1) - Logic (0,0).", 0);
AddNumberParam("Y", "Physical Y offset of Logic (0,1) - Logic (0,0).", 0);
AddAction(3, 0, "Set vector V", "Vector UV", 
          "Set vector V to (<i>{0}</i>, <i>{1}</i>)", 
          "Set vector V, physical offset of Logic (0,1) - Logic (0,0).", "SetVectorV");    
          
AddComboParamOption("4 directions");
AddComboParamOption("8 directions");
AddComboParam("Directions", "Directions of neighbots", 0);
AddAction(5, 0, "Set directions", "Directions", 
          "Set directions to <i>{0}</i>", 
          "Set directions.", "SetDirections");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "X co-ordinate at (0,0)", "Origin", "POX", "Get physical X co-ordinate at logic (0,0).");
AddExpression(2, ef_return_number, "Y co-ordinate at (0,0)", "Origin", "POY", "Get physical Y co-ordinate at logic (0,0).");

AddExpression(3, ef_return_number, "X co-ordinate of vector U", "Vector U", "UX", "Physical X offset of Logic (1,0) - Logic (0,0).");
AddExpression(4, ef_return_number, "Y co-ordinate of vector U", "Vector U", "UY", "Physical Y offset of Logic (1,0) - Logic (0,0).");

AddExpression(5, ef_return_number, "X co-ordinate of vector V", "Vector V", "VX", "Physical X offset of Logic (0,1) - Logic (0,0).");
AddExpression(6, ef_return_number, "Y co-ordinate of vector V", "Vector V", "VY", "Physical Y offset of Logic (0,1) - Logic (0,0).");


AddExpression(11, ef_return_number, 
              "Direction code of right", "Direction code", "DIRRIGHT", 
              "Direction code of right.");
AddExpression(12, ef_return_number, 
              "Direction code of down", "Direction code", "DIRDOWN", 
              "Direction code of down.");
AddExpression(13, ef_return_number, 
              "Direction code of left", "Direction code", "DIRLEFT", 
              "Direction code of left.");  
AddExpression(14, ef_return_number, 
              "Direction code of up", "Direction code", "DIRUP", 
              "Direction code of up.");
AddExpression(15, ef_return_number, 
              "Direction code of right-down", "Direction code", "DIRRIGHTDOWN", 
              "Direction code of right-down.");
AddExpression(16, ef_return_number, 
              "Direction code of left-down", "Direction code", "DIRLEFTDOWN", 
              "Direction code of left-down.");
AddExpression(17, ef_return_number, 
              "Direction code of left-up", "Direction code", "DIRLEFTUP", 
              "Direction code of left-up.");  
AddExpression(18, ef_return_number, 
              "Direction code of right-up", "Direction code", "DIRRIGHTUP", 
              "Direction code of right-up.");              


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
    new cr.Property(ept_section, "Origin", "",	"Position of Logic (0,0)."),    
    new cr.Property(ept_float, "X at (0,0)", 0, "Physical X co-ordinate at logic (0,0)."),
    new cr.Property(ept_float, "Y at (0,0)", 0, "Physical Y co-ordinate at logic (0,0)."),
    
    new cr.Property(ept_section, "Vector U", "",	"Offset from Logic (1,0) to Logic (0,0)."),    
    new cr.Property(ept_float, "UX", 0, "Physical X offset of Logic (1,0) - Logic (0,0)."),
    new cr.Property(ept_float, "UY", 0, "Physical Y offset of Logic (1,0) - Logic (0,0)."),
    
    new cr.Property(ept_section, "Vector V", "",	"Offset from Logic (0,1) to Logic (0,0)."),    
    new cr.Property(ept_float, "VX", 0, "Physical X offset of Logic (0,1) - Logic (0,0)."),
    new cr.Property(ept_float, "VY", 0, "Physical Y offset of Logic (0,1) - Logic (0,0)."),
    
    new cr.Property(ept_section, "Misc", "",	"Misc."),    
    new cr.Property(ept_combo, "Directions", "4 directions", "Directions of neighbots.", "4 directions|8 directions"),    
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
