function GetPluginSettings()
{
	return {
		"name":			"Edge",
		"id":			"Rex_board_edge",
		"version":		"0.1",        
		"description":	"Maintain edges on a board.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_board_edge.html",
		"category":		"Board",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);   
AddCondition(1, 0, "Has edge between points", "Has edge", 
          "Has edge between logic points (<i>{0}</i>, <i>{1}</i>) and (<i>{2}</i>, <i>{3}</i>)", 
          "Has edge between two points.", "HasEdgeBetweenLP");  
AddNumberParam("UID0", "The UID of chess", 0);
AddNumberParam("UID1", "The UID of neighbor chess", 0);
AddCondition(2, 0, "Has edge between chess", "Has edge", 
          "Has edge between chess UID:<i>{0}</i> and <i>{1}</i>", 
          "Has edge between chess.", "HasEdgeBetweenChess");        
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Direction", "The direction of chess.", 0);
AddCondition(3, 0, "Has edges beside chess at direction", "Has edge", 
             "Has edges beside chess <i>{0}</i> at direction to <i>{1}</i>", 
             "Has edges beside chess at direction.", "HasEdgesBesideChessAtDirection");         
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(4, 0, "Has edges beside chess at direction", "Has edge - Square grid", 
             "Has edges beside chess <i>{0}</i> at direction to <i>{1}</i>",
             "Has edges by chess and direction.", "HasEdgesBesideChessAtDirection");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(5, cf_not_invertible, "Has edges beside chess at direction", "Has edge - Hexagon grid (Left-Right)", 
             "Has edges beside chess <i>{0}</i> at direction to <i>{1}</i>",
             "Has edges beside chess at direction.", "HasEdgesBesideChessAtDirection");         
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(6, cf_not_invertible, "Has edges beside chess at direction", "Has edge - Hexagon grid (Up-Down)", 
             "Has edges beside chess <i>{0}</i> at direction to <i>{1}</i>",
             "Has edges beside chess at direction.", "HasEdgesBesideChessAtDirection"); 
             
AddObjectParam("Edge", "Edge object."); 
AddCondition(11, cf_not_invertible, "Pick all edges", "Pick edge", 
          "Pick all edges <i>{0}</i>", 
          "Pick all edge.", "PickAllEdges");
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0); 
AddCondition(12, cf_not_invertible, "Pick edge between points", "Pick edge", 
          "Pick edge <i>{0}</i> between logic points (<i>{1}</i>, <i>{2}</i>) and (<i>{3}</i>, <i>{4}</i>)", 
          "Pick edge between two logic points.", "PickEdgeBetweenLP");                    
AddObjectParam("Edge", "Edge object.");          
AddNumberParam("UID0", "The UID of chess", 0);
AddNumberParam("UID1", "The UID of neighbor chess", 0);
AddCondition(13, cf_not_invertible, "Pick edges beside chess", "Pick edge", 
             "Pick edges <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i>", 
             "Pick edges between chess.", "PickEdgeBetweenChess");              
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Direction", "The direction of chess.", 0);
AddCondition(14, cf_not_invertible, "Pick edges beside chess at direction", "Pick edge", 
             "Pick edges <i>{0}</i> beside chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges beside chess at direction.", "PickEdgesBesideChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(15, cf_not_invertible, "Pick edges beside chess at direction", "Pick edge - Square grid", 
             "Pick edges <i>{0}</i> beside chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges by chess and direction.", "PickEdgesBesideChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(16, cf_not_invertible, "Pick edges beside chess at direction", "Pick edge - Hexagon grid (Left-Right)", 
             "Pick edges <i>{0}</i> beside chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges beside chess at direction.", "PickEdgesBesideChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(17, cf_not_invertible, "Pick edges beside chess at direction", "Pick edge - Hexagon grid (Up-Down)", 
             "Pick edges <i>{0}</i> beside chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges beside chess at direction.", "PickEdgesBesideChessAtDirection");     
             
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Edge", "Edge object.");
AddAnyTypeParam("Logic Z", "The Z index (0-based).", 0);    
AddCondition(21, cf_not_invertible, "Pick chess beside edge at LZ", "Pick chess", 
             "Pick cheess <i>{0}</i> beside edges <i>{1}</i> at Logic Z to <i>{2}</i>", 
             "Pick chess beside edge.", "PickChessBesideEdge");
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Edge", "Edge object.");
AddCondition(23, cf_not_invertible, "Pick chess beside edge", "Pick chess", 
             "Pick cheess <i>{0}</i> beside edges <i>{1}</i>", 
             "Pick chess beside edge.", "PickChessBesideEdge");             

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Board", "Board object");
AddAction(0, 0, "Setup", "Setup", 
          "Set board object to <i>{0}</i>", 
          "Set board object.", "Setup"); 
          
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);   
AddLayerParam("Layer", "Layer name of number."); 	
AddAction(1, 0, "Create edge between points", "Physical: Create", 
          "Create edge <i>{0}</i> between logic points (<i>{1}</i>, <i>{2}</i>) and (<i>{3}</i>, <i>{4}</i>) on layer <i>{5}</i>", 
          "Create edge between two logic points.", "CreateEdgeBetweenLP");
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("UID0", "The UID of chess", 0);
AddNumberParam("UID1", "The UID of neighbor chess", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(2, 0, "Create edge between chess", "Physical: Create", 
          "Create edge <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i> on layer <i>{3}</i>", 
          "Create edge between chess.", "CreateEdgeBetweenChess");	          
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddNumberParam("Direction", "The direction of chess.", 0);
AddLayerParam("Layer", "Layer name of number."); 	
AddAction(3, 0, "Create edge beside chess", "Physical: Create", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge beside chess.", "CreateEdgeBesideChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(4, 0, "Create edge beside chess", "Physical: Create - Square grid", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge beside chess.", "CreateEdgeBesideChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(5, 0, "Create edge beside chess", "Physical: Create - Hexagon grid (Left-Right)", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge beside chess.", "CreateEdgeBesideChess");		
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(6, 0, "Create edge beside chess", "Physical: Create - Hexagon grid (Up-Down)", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge beside chess.", "CreateEdgeBesideChess");
 
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);
AddAction(11, 0, "Remove edge between points", "Logic: Remove", 
          "Remove edge between logic points (<i>{1}</i>, <i>{2}</i>) and (<i>{3}</i>, <i>{4}</i>)", 
          "Remove edge between points.", "RemoveEdgeBetweenLP"); 
AddNumberParam("UID0", "The UID of chess", 0);
AddNumberParam("UID1", "The UID of neighbor chess", 0);	
AddAction(12, 0, "Remove edge between chess", "Logic: Remove", 
          "Remove edge between chess UID:<i>{1}</i> and chess UID:<i>{2}</i>", 
          "Remove edge between chess.", "RemoveEdgeBetweenChess");
AddObjectParam("Chess", "Chess object.");         
AddNumberParam("Direction", "The direction of chess.", 0);	
AddAction(13, 0, "Remove edge beside chess", "Logic: Remove", 
          "Remove edge at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Remove edge beside chess.", "RemoveEdgeBesideChess"); 
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(14, 0, "Remove edge beside chess", "Logic: Remove - Square grid", 
          "Remove edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Remove edge beside chess.", "RemoveEdgeBesideChess");
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(15, 0, "Remove edge beside chess", "Logic: Remove - Hexagon grid (Left-Right)", 
          "Remove edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Remove edge beside chess.", "RemoveEdgeBesideChess");		
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(16, 0, "Remove edge beside chess", "Logic: Remove - Hexagon grid (Up-Down)", 
          "Remove edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Remove edge beside chess.", "RemoveEdgeBesideChess");
AddObjectParam("Edge", "Edge object.");
AddAction(17, 0, "Remove edge", "Logic: Remove", 
          "Remove edge <i>{0}</i>", 
          "Remove edge between points.", "RemoveEdge");          
          
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);
AddAction(21, 0, "Move edge between points", "Logic: Move", 
          "Move edge <i>{0}</i> between logic points (<i>{1}</i>, <i>{2}</i>) and (<i>{3}</i>, <i>{4}</i>)", 
          "Move edge between points.", "MoveEdgeBetweenLP");
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("UID0", "The UID of chess", 0);
AddNumberParam("UID1", "The UID of neighbor chess", 0);	
AddAction(22, 0, "Move edge between chess", "Logic: Move", 
          "Move edge <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i>", 
          "Move edge between chess.", "MoveEdgeBetweenChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddNumberParam("Direction", "The direction of chess.", 0);	
AddAction(23, 0, "Move edge beside chess", "Logic: Move", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge beside chess.", "MoveEdgeBesideChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(24, 0, "Move edge beside chess", "Logic: Move - Square grid", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge beside chess.", "MoveEdgeBesideChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(25, 0, "Move edge beside chess", "Logic: Move - Hexagon grid (Left-Right)", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge beside chess.", "MoveEdgeBesideChess");		
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(26, 0, "Move edge beside chess", "Logic: Move - Hexagon grid (Up-Down)", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge beside chess.", "MoveEdgeBesideChess");
		  
//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);  
AddExpression(1, ef_return_number,
              "Get edge UID by LXY", "Edge", "LXY2EdgeUID",
              "Get edge UID by LXY index. Return (-1) if this position has no edge.");
AddNumberParam("UID0", "The UID of chess", 0);
AddNumberParam("UID1", "The UID of neighbor chess", 0);
AddExpression(2, ef_return_number,
              "Get edge UID by chess UID", "Edge", "ChessUID2EdgeUID",
              "Get edge UID by chess UID. Return (-1) if this position has no edge.");
AddNumberParam("UID", "The UID of chess", 0);
AddNumberParam("Direction", "The direction of chess.", 0);	
AddExpression(3, ef_return_number,
              "Get edge UID by chess and direction", "Edge", "ChessDIR2EdgeUID",
              "Get edge UID by chess and direction. Return (-1) if this position has no edge.");
AddNumberParam("UID", "The UID of chess", 0);	
AddExpression(4, ef_return_number,
              "Get edge cout around the chess", "Edge", "ChessUID2EdgeCount",
              "Get edge cout around the chess. Return (-1) if this chess is not on the board.");
              
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
