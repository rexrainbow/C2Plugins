function GetPluginSettings()
{
	return {
		"name":			"Board",
		"id":			"Rex_SLGBoard",
		"version":		"0.1",   		
		"description":	"A chess board container",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Board",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddNumberParam("Logic X", "The X index (0-based).", 0);
AddNumberParam("Logic Y", "The Y index (0-based).", 0);
AddAnyTypeParam("Logic Z", "The Z index (0-based).", 0);
AddCondition(5, 0, "Empty", "Board", 
             "Cell [<i>{0}</i>,<i>{1}</i>,<i>{2}</i>] is empty", "Testing if cell is empty.", "IsEmpty");
AddObjectParam("Chess", "Chess object A.");
AddObjectParam("Chess", "Chess object B.");             
AddCondition(6, cf_trigger, "On collision", "Collisions", 
            "On <i>{0}</i> collided with <i>{1}</i>", "Triggered when the object collides with another object.", "OnCollided");
AddObjectParam("Chess", "Chess object A.");
AddObjectParam("Chess", "Chess object B.");             
AddCondition(7, 0, "Is overlapping", "Collisions", 
            "Is <i>{0}</i> overlapping with <i>{1}</i>", "Test if the object is overlapping another object.", "IsOverlapping");
AddNumberParam("X", "The Physical X.", 0);
AddNumberParam("Y", "The Physical Y.", 0);
AddCondition(8, 0, "Point is in board", "Board", 
             "Point (<i>{0}</i>,<i>{1}</i>) is in board", "Testing if point is in board.", "IsInBoard");
AddNumberParam("UID of chess", "UID of chess A.", 0);
AddNumberParam("UID of chess", "UID of chess B.", 0);
AddCondition(9, 0, "Are neighbor (UID)", "Board", 
             "Are <i>{0}</i> and <i>{1}</i> neighbor", "Testing if two chess are neighbor.", "AreNeighbor");             
AddCondition(10, cf_not_invertible, "Pick all chess", "SOL", 
             "Pick all chess on the board", "Pick all chess on the board.", "PickAllChess");  
AddObjectParam("Chess", "Kicked chess object.");
AddCondition(11, cf_trigger, "On chess kicked", "Kick", 
            "On <i>{0}</i> kicked", "Triggered when chess kicked by 'action:Add chess' or 'action:Move chess'.", "OnChessKicked");
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the tile to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the tile to set.", 0);
AddCondition(12, cf_not_invertible, "Pick chess at Logic X,Y", "SOL: chess", 
             "Pick <i>{0}</i> at [<i>{1}</i>,<i>{2}</i>]", "Pick chess at Logic X,Y.", "PickChessAtLXY");           
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Tile", "Tile object.");
AddCondition(13, cf_not_invertible, "Pick chess above tile", "SOL: chess", 
             "Pick <i>{0}</i> above <i>{1}</i>", "Pick chess above tile.", "PickChessAboveTile"); 
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Tile UID", "Tile UID.", 0);
AddCondition(14, cf_not_invertible, "Pick chess above tile UID", "SOL: chess", 
             "Pick <i>{0}</i> above tile UID: <i>{1}</i>", "Pick chess above tile UID.", "PickChessAboveTileUID");           
//////////////////////////////////////////////////////////////
// Actions   
AddNumberParam("X", "Initial number of elements on the X axis. 0 is unchanged.", 0);
AddNumberParam("Y", "Initial number of elements on the Y axis. 0 is unchanged.", 0);
AddAction(0, 0, "Reset board", "Board", "Reset board with width to <i>{0}</i>, height to <i>{1}</i>", 
          "Reset board to empty.", "ResetBoard"); 
AddObjectParam("Tile", "Tile object.");         
AddNumberParam("Logic X", "The X index (0-based) of the tile to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the tile to set.", 0);
AddAction(1, 0, "Add tile", "Logic: Add", "Add tile <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0]", 
          "Add tile on the board.", "AddTile");
AddObjectParam("Chess", "Chess object.");   
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAction(3, 0, "Add chess", "Logic: Add", "Add chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Add chess on the board.", "AddChess");  
AddObjectParam("Chess", "Chess object.");
AddAction(5, 0, "Remove chess", "Logic: Remove", "Remove chess <i>{0}</i>", 
          "Remove chess from the board.", "RemoveChess");       
AddNumberParam("UID", "The UID of chess", 0);
AddAction(6, 0, "Remove chess by UID", "Logic: Remove", "Remove chess UID:<i>{0}</i>", 
          "Remove chess by UID from the board.", "RemoveChess");
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Tile", "Tile object.");
AddAction(7, 0, "Move chess", "Logic: Move", 
          "Move chess <i>{0}</i> to tile <i>{1}</i>", 
          "Move chess on the board.", "MoveChess");   
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("Tile UID", "The UID of tile", 0);
AddAction(8, 0, "Move chess by UID", "Logic: Move", 
          "Move chess UID:<i>{0}</i> to tile UID:<i>{1}</i>", 
          "Move chess by UID on the board.", "MoveChess");     
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAction(9, 0, "Move chess to xyz", "Logic: Move", 
          "Move chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Move chess on the board.", "MoveChess2Index");  
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAction(10, 0, "Move chess to xyz by UID", "Logic: Move", 
          "Move chess UID:<i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Move chess to xyz index by UID on the board.", "MoveChess2Index");              
AddObjectParam("Layout", "Layout to transfer logic index to physical position");
AddAction(11, 0, "Setup layout", "Advance: Setup", 
          "Set layout to <i>{0}</i>", 
          "Setup layout to transfer logic index to physical position.", "SetupLayout");         
AddObjectParam("Tile", "Tile object.");        
AddNumberParam("Logic X", "The X index (0-based) of the tile to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the tile to set.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(12, 0, "Create tile", "Physical: Create", "Create tile <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0] on layer <i>{3}</i>", 
          "Create tile on the board.", "CreateTile");          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(14, 0, "Create chess", "Physical: Create", "Create chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>], on layer <i>{4}</i>", 
          "Create chess on the board.", "CreateChess");  
AddNumberParam("UID of chess", "UID of chess A.", 0);
AddNumberParam("UID of chess", "UID of chess B.", 0);
AddAction(15, 0, "Swap chess by UID", "Logic: Swap", "Swap chess UID <i>{0}</i> with chess UID <i>{1}</i>", 
          "Swap two chess by UID.", "SwapChess");
AddAction(16, 0, "Pick all chess", "SOL", 
          "Pick all chess on the board", "Pick all chess on the board.", "PickAllChess"); 
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the tile to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the tile to set.", 0);
AddAction(17, 0, "Pick chess at Logic X,Y", "SOL: chess", 
          "Pick <i>{0}</i> at [<i>{1}</i>,<i>{2}</i>]", "Pick chess at Logic X,Y.", "PickChessAtLXY");           
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Tile", "Tile object.");
AddAction(18, 0, "Pick chess above tile", "SOL: chess", 
          "Pick <i>{0}</i> above <i>{1}</i>", "Pick chess above tile.", "PickChessAboveTile"); 
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Tile UID", "Tile UID.", 0);
AddAction(19, 0, "Pick chess above tile UID", "SOL: chess", 
          "Pick <i>{0}</i> above tile UID: <i>{1}</i>", "Pick chess above tile UID.", "PickChessAboveTileUID");  
          
//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(1, ef_return_number | ef_variadic_parameters, 
              "Get X index of selected chess", "Chess", "UID2LX", 
              "Get X index of selected chess by UID.");
AddNumberParam("UID", "The UID of instance.", 0);              
AddExpression(2, ef_return_number | ef_variadic_parameters, 
              "Get Y index of selected chess", "Chess", "UID2LY", 
              "Get Y index of selected chess by UID.");
AddNumberParam("UID", "The UID of instance.", 0);              
AddExpression(3, ef_return_any | ef_variadic_parameters, 
              "Get Z index of selected chess", "Chess", "UID2LZ", 
              "Get Z index of selected chess by UID.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);           
AddAnyTypeParam("Z", "The logic Z.", 0);   
AddExpression(4, ef_return_number | ef_variadic_parameters,
              "Get UID by XYZ", "Chess", "LXYZ2UID",
              "Get UID by XYZ index.");
AddNumberParam("UID", "The UID of instance.", 0);
AddAnyTypeParam("Z", "The logic Z.", 0);            
AddExpression(5, ef_return_number | ef_variadic_parameters,
              "Get UID by UID and Z", "Chess", "LZ2UID",
              "Get UID by relative UID and Z.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);       
AddExpression(6, ef_return_number | ef_variadic_parameters,
              "Get X co-ordinate by logic index", "Physical", "LXY2PX",
              "Get physical X co-ordinate by logic X,Y index.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);                              
AddExpression(7, ef_return_number | ef_variadic_parameters,
              "Get Y co-ordinate by logic index", "Physical", "LXY2PY",
              "Get physical Y co-ordinate by logic X,Y index."); 
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(8, ef_return_number | ef_variadic_parameters,
              "Get X co-ordinate by UID", "Physical", "UID2PX",
              "Get X co-ordinate by UID.");
AddNumberParam("UID", "The UID of instance.", 0);              
AddExpression(9, ef_return_number | ef_variadic_parameters,
              "Get Y co-ordinate by UID", "Physical", "UID2PY",
              "Get Y co-ordinate by UID.");
AddNumberParam("Origin", "The UID of instance at origin.", 0);   
AddNumberParam("FaceTo", "The UID of instance to face.", 0);         
AddExpression(10, ef_return_number | ef_variadic_parameters,
              "Get Logic angle by UID", "Chess", "UID2LA",
              "Get Logic angle by UID, in degree. (-1) is invalid angle.");              
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);   
AddNumberParam("Z", "The logic Z.", 0);     
AddExpression(11, ef_return_number | ef_variadic_parameters,
              "Get X co-ordinate by logic index", "Physical", "LXYZ2PX",
              "Get physical X co-ordinate by logic X,Y,Z index.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0); 
AddNumberParam("Z", "The logic Z.", 0);                              
AddExpression(12, ef_return_number | ef_variadic_parameters,
              "Get Y co-ordinate by logic index", "Physical", "LXYZ2PY",
              "Get physical Y co-ordinate by logic X,Y,Z index."); 
AddNumberParam("UID", "The UID of instance.", 0);              
AddExpression(13, ef_return_number | ef_variadic_parameters, 
              "Get z count at select chess by UID", "Chess", "UID2ZCnt", 
              "Get z count at select chess by UID.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);                              
AddExpression(14, ef_return_number | ef_variadic_parameters,
              "Get z count at logic index", "Logic", "LXY2ZCnt",
              "Get z count at logic X,Y index."); 
AddNumberParam("X", "The physical X.", 0);
AddNumberParam("Y", "The physical Y.", 0);       
AddExpression(15, ef_return_number | ef_variadic_parameters,
              "Get logic X by physical co-ordinate", "Logic", "PXY2LX",
              "Get logic X by physical X,Y co-ordinate.");
AddNumberParam("X", "The physical X.", 0);
AddNumberParam("Y", "The physical Y.", 0);                             
AddExpression(16, ef_return_number | ef_variadic_parameters,
              "Get logic Y by physical co-ordinate", "Logic", "PXY2LY",
              "Get logic Y by physical X,Y co-ordinate."); 
AddNumberParam("UID", "The UID of instance.", 0);
AddAnyTypeParam("Direction", "The direction.", 0);            
AddExpression(17, ef_return_number | ef_variadic_parameters,
              "Get neighbor UID by UID and direction", "Chess", "DIR2UID",
              "Get neighbor UID by UID and direction.");        
                                
ACESDone();

// Property grid properties for this plugin
var property_list = [
		new cr.Property(ept_integer, "Width", 64, "Initial number of elements on the X axis."),
		new cr.Property(ept_integer, "Height", 64, "Initial number of elements on the Y axis."),
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
