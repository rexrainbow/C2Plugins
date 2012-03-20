function GetPluginSettings()
{
	return {
		"name":			"Board",
		"id":			"Rex_SLGBoard",
		"description":	"A chess board container for SLG",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"SLG",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
           
//////////////////////////////////////////////////////////////
// Actions   
AddNumberParam("X", "Initial number of elements on the X axis. 0 is unchanged.", 0);
AddNumberParam("Y", "Initial number of elements on the Y axis. 0 is unchanged.", 0);
AddNumberParam("Z", "Initial number of elements on the Z axis. 0 is unchanged.", 0)
AddAction(0, 0, "Reset board", "Board", "Reset board with width to <i>{0}</i>, height to <i>{1}</i>, depth to <i>{2}</i>", 
          "Reset board to empty.", "ResetBoard"); 
AddObjectParam("Tile", "Tile object.");         
AddNumberParam("Logic X", "The X index (0-based) of the tile to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the tile to set.", 0);
AddAction(1, 0, "Add tile", "Logic: Add", "Add tile <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0]", 
          "Add tile on the board.", "AddTile");
AddNumberParam("UID", "The UID of tile", 0);
AddNumberParam("Logic X", "The X index (0-based) of the tile to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the tile to set.", 0);
AddAction(2, 0, "Add tile by UID", "Logic: Add", "Add tile UID:<i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, 0]", 
          "Add tile on the board.", "AddTile");
AddObjectParam("Chess", "Chess object.");   
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAction(3, 0, "Add chess", "Logic: Add", "Add chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Add chess on the board.", "AddChess"); 
AddNumberParam("UID", "The UID of chess", 0);
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAction(4, 0, "Add chess by UID", "Logic: Add", "Add chess UID:<i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
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
AddNumberParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAction(9, 0, "Move chess to xyz", "Logic: Move", 
          "Move chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Move chess on the board.", "MoveChess2Index");  
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
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
AddNumberParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(14, 0, "Create chess", "Physical: Create", "Create chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>], on layer <i>{4}</i>", 
          "Create chess on the board.", "CreateChess");  
       
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
AddExpression(3, ef_return_number | ef_variadic_parameters, 
              "Get Z index of selected chess", "Chess", "UID2LZ", 
              "Get Z index of selected chess by UID.");
AddNumberParam("X", "The logic X.", 0);
AddNumberParam("Y", "The logic Y.", 0);           
AddNumberParam("Z", "The logic Z.", 0);   
AddExpression(4, ef_return_number | ef_variadic_parameters,
              "Get UID by XYZ", "Chess", "LXYZ2UID",
              "Get UID by XYZ index.");
AddNumberParam("UID", "The UID of instance.", 0);
AddNumberParam("Z", "The logic Z.", 0);            
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
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
		new cr.Property(ept_integer, "Width", 64, "Initial number of elements on the X axis."),
		new cr.Property(ept_integer, "Height", 64, "Initial number of elements on the Y axis."),
		new cr.Property(ept_integer, "Depth", 2, "Initial number of elements on the Z axis."), 
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
