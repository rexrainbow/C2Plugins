function GetPluginSettings()
{
	return {
		"name":			"SLG Board",
		"id":			"Rex_SLGBoard",
		"description":	"A chess board container for SLG",
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
AddCondition(1, cf_trigger, "Get moveable brick", "Request: Moveable area", 
             "Get moveable brick", 
             'Callback of "Action:Get moveable brick."', "GetMoveableBrick"); 
AddCondition(2, cf_trigger, "Get moving path brick", "Request: Moving path", 
             "Get moving path", 
             'Callback of "Action:Move chess."', "GetMovingPathBrick");              
             
//////////////////////////////////////////////////////////////
// Actions   
AddNumberParam("X", "Initial number of elements on the X axis. 0 is unchanged.", 0);
AddNumberParam("Y", "Initial number of elements on the Y axis. 0 is unchanged.", 0);
AddNumberParam("Z", "Initial number of elements on the Z axis. 0 is unchanged.", 0)
AddAction(0, 0, "Clean board", "Board", "Clean board", 
          "Clean board to empty.", "CleanBoard"); 
AddNumberParam("UID", "The UID of brick", 0);
AddNumberParam("X", "The X index (0-based) of the brick to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the brick to set.", 0);
AddAction(1, 0, "Add brick by UID", "Logic: Add", "Add brick UID:<i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0]", 
          "Add brick on the board.", "AddBrick");
AddNumberParam("UID", "The UID of chess", 0);
AddNumberParam("X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Z", "The Z index (0-based) of the chess to set. 0 is brick.", 0);
AddAction(2, 0, "Add chess by UID", "Logic: Add", "Add chess UID:<i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Add chess on the board.", "AddChess"); 
AddObjectParam("Function", "Function object for command's callback");
AddAction(3, 0, "Setup callback", "Advance: Setup", 
          "Set command's callback to <i>{0}</i>", 
          "Setup callback.", "SetupCallback");
AddNumberParam("UID", "The UID of chess", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(4, 0, "Get moveable area by UID", "Request: Moveable area", 
          "Get moveable area of chess UID:<i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, callback to <i>{3}</i>", 
          "Get moveable area.", "GetMoveableArea");
AddObjectParam("Brick", "Brick object.");         
AddNumberParam("X", "The X index (0-based) of the brick to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the brick to set.", 0);
AddAction(5, 0, "Add brick", "Logic: Add", "Add brick <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0]", 
          "Add brick on the board.", "AddBrick");
AddObjectParam("Chess", "Chess object.");   
AddNumberParam("X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Z", "The Z index (0-based) of the chess to set. 0 is brick.", 0);
AddAction(6, 0, "Add chess", "Logic: Add", "Add chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Add chess on the board.", "AddChess");  
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(7, 0, "Get moveable area", "Request: Moveable area", 
          "Get moveable area of chess <i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, callback to <i>{3}</i>", 
          "Get moveable area.", "GetMoveableArea");   
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Brick", "Brick object.");
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(8, 0, "Get moving path", "Request: Moving path", 
          "Get moving path of chess <i>{0}</i> to brick <i>{1}</i> by moving points to <i>{2}</i> and cost to <i>{3}</i>, callback to <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("Brick UID", "The UID of brick", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(9, 0, "Get moving path by UID", "Request: Moving path", 
          "Get moving path of chess UID:<i>{0}</i> to brick UID:<i>{1}</i> by moving points to <i>{2}</i> and cost to <i>{3}</i>, callback to <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");                              
AddObjectParam("Layout", "Layout to transfer logic index to physical position");
AddAction(10, 0, "Setup layout", "Advance: Setup", 
          "Set layout to <i>{0}</i>", 
          "Setup layout to transfer logic index to physical position.", "SetupLayout");         
AddObjectParam("Brick", "Brick object.");        
AddNumberParam("X", "The X index (0-based) of the brick to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the brick to set.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(11, 0, "Create brick", "Physical: Create", "Create brick <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0] on layer <i>{3}</i>", 
          "Create brick on the board.", "CreateBrick");
AddObjectParam("Chess", "Chess object.");
AddNumberParam("X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Z", "The Z index (0-based) of the chess to set. 0 is brick.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddNumberParam("X", "The X co-ordinate offset of this instance.", 0);
AddNumberParam("Y", "The Y co-ordinate offset of this instance.", 0);
AddAction(12, 0, "Create chess", "Physical: Create", "Create chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>], on layer <i>{4}</i>, offset to (<i>{5}</i>,<i>{6}</i>)", 
          "Create chess on the board.", "CreateChess"); 
AddStringParam("Brick", "Brick object name.",'""');        
AddNumberParam("X", "The X index (0-based) of the brick to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the brick to set.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(13, 0, "Create brick by name", "Physical: Create", "Create brick <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0] on layer <i>{3}</i>", 
          "Create brick on the board.", "CreateBrick");
AddStringParam("Chess", "Chess object name.",'""'); 
AddNumberParam("X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Z", "The Z index (0-based) of the chess to set. 0 is brick.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddNumberParam("X", "The X co-ordinate offset of this instance.", 0);
AddNumberParam("Y", "The Y co-ordinate offset of this instance.", 0);
AddAction(14, 0, "Create chess by name", "Physical: Create", "Create chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>], on layer <i>{4}</i>, offset to (<i>{5}</i>,<i>{6}</i>)", 
          "Create chess on the board.", "CreateChess");             
AddNumberParam("UID", "The UID of chess", 0);
AddAction(15, 0, "Remove chess by UID", "Logic: Remove", "Remove chess UID:<i>{0}</i>", 
          "Remove chess by UID from the board.", "RemoveChess");
AddObjectParam("Chess", "Chess object.");
AddAction(16, 0, "Remove chess", "Logic: Remove", "Remove chess <i>{0}</i>", 
          "Remove chess from the board.", "RemoveChess");  
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("Brick UID", "The UID of brick", 0);
AddAction(17, 0, "Move chess by UID", "Logic: Move", 
          "Move chess UID:<i>{0}</i> to brick UID:<i>{1}</i>", 
          "Move chess by UID on the board.", "MoveChess");     
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Brick", "Brick object.");
AddAction(18, 0, "Move chess", "Logic: Move", 
          "Move chess <i>{0}</i> to brick <i>{1}</i>", 
          "Move chess on the board.", "MoveChess"); 
AddObjectParam("Chess", "Chess object.");
AddNumberParam("X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Z", "The Z index (0-based) of the chess to set. 0 is brick.", 0);
AddAction(19, 0, "Move chess to xyz", "Logic: Move", 
          "Move chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Move chess on the board.", "MoveChess2Index");  
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Z", "The Z index (0-based) of the chess to set. 0 is brick.", 0);
AddAction(20, 0, "Move chess to xyz by UID", "Logic: Move", 
          "Move chess UID:<i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Move chess to xyz index by UID on the board.", "MoveChess2Index");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number | ef_variadic_parameters, 
              "Get UID of selected chess", "Request", "ChessUID", 
              "Get UID of selected chess.");
AddExpression(2, ef_return_number | ef_variadic_parameters, 
              "Get X index of selected chess", "Chess", "UID2LX", 
              "Get X index of selected chess by UID.");
AddExpression(3, ef_return_number | ef_variadic_parameters, 
              "Get Y index of selected chess", "Chess", "UID2LY", 
              "Get Y index of selected chess by UID.");
AddExpression(4, ef_return_number | ef_variadic_parameters, 
              "Get Z index of selected chess", "Chess", "UID2LZ", 
              "Get Z index of selected chess by UID.");
AddExpression(5, ef_return_number,
              "Get UID of brick", "Request", "BrickUID",
              'Get UID of brick. Used in "Condition:Get moveable brick" ');
AddExpression(6, ef_return_number | ef_variadic_parameters,
              "Get UID by XYZ", "Chess", "LXYZ2UID",
              "Get UID by XYZ index.");        
AddExpression(7, ef_return_number | ef_variadic_parameters,
              "Get UID by UID and Z", "Chess", "LZ2UID",
              "Get UID by relative UID and Z.");
              
AddExpression(11, ef_return_number | ef_variadic_parameters,
              "Get X co-ordinate by logic index", "Physical", "LXY2PX",
              "Get physical X co-ordinate by logic X,Y index.");               
AddExpression(12, ef_return_number | ef_variadic_parameters,
              "Get Y co-ordinate by logic index", "Physical", "LXY2PY",
              "Get physical Y co-ordinate by logic X,Y index."); 
AddExpression(13, ef_return_number | ef_variadic_parameters,
              "Get X co-ordinate by UID", "Physical", "UID2PX",
              "Get X co-ordinate by UID.");
AddExpression(14, ef_return_number | ef_variadic_parameters,
              "Get Y co-ordinate by UID", "Physical", "UID2PY",
              "Get Y co-ordinate by UID.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
        new cr.Property(ept_combo, "Grid type", "Tetragon", "Grid type of board.", "Tetragon|Hexagon"),  
		new cr.Property(ept_integer, "Width", 64, "Initial number of elements on the X axis."),
		new cr.Property(ept_integer, "Height", 64, "Initial number of elements on the Y axis."),
		new cr.Property(ept_integer, "Depth", 2, "Initial number of elements on the Z axis."),
		new cr.Property(ept_combo, "Path mode", "Diagonal", "Geometry of moving path.", "Random|Diagonal"),  
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
	if (this.properties["Width"] < 1)
		this.properties["Width"] = 1;
		
	if (this.properties["Height"] < 1)
		this.properties["Height"] = 1;
		
	if (this.properties["Depth"] < 1)
		this.properties["Depth"] = 1;    
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
