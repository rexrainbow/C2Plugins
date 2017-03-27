function GetPluginSettings()
{
	return {
		"name":			"Edge",
		"id":			"Rex_board_edge",
		"version":		"0.1",        
		"description":	"Maintain edges on a board.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_board_edge.html",
		"category":		"Rex - Board - application",
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
AddAnyTypeParam("UID0", "The UID of chess", 0);
AddAnyTypeParam("UID1", "The UID of neighbor chess", 0);
AddCondition(2, 0, "Has edge between chess", "Has edge", 
          "Has edge between chess UID:<i>{0}</i> and <i>{1}</i>", 
          "Has edge between chess.", "HasEdgeBetweenChess");        
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Direction", "The direction of chess. (-1) for all directions.", 0);
AddCondition(3, 0, "Has edges around chess", "Has edge", 
             "Has any edge around chess <i>{0}</i> at direction to <i>{1}</i>", 
             "Has any edge around chess at direction.", "HasAnyEdgesAroundChessAtDirection");         
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(4, 0, "Has edges around chess", "Has edge - Square grid", 
             "Has edges around chess <i>{0}</i> at direction to <i>{1}</i>",
             "Has edges by chess and direction.", "HasEdgesAroundChessAtDirection");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(5, 0, "Has edges around chess", "Has edge - Hexagon grid (Left-Right)", 
             "Has edges around chess <i>{0}</i> at direction to <i>{1}</i>",
             "Has edges around chess at direction.", "HasEdgesAroundChessAtDirection");         
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(6, 0, "Has edges around chess", "Has edge - Hexagon grid (Up-Down)", 
             "Has edges around chess <i>{0}</i> at direction to <i>{1}</i>",
             "Has edges around chess at direction.", "HasEdgesAroundChessAtDirection"); 
                          
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
AddAnyTypeParam("UID0", "The UID of chess", 0);
AddAnyTypeParam("UID1", "The UID of neighbor chess", 0);
AddCondition(13, cf_not_invertible, "Pick edges between chess", "Pick edge", 
             "Pick edges <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i>", 
             "Pick edges between chess.", "PickEdgeBetweenChess");              
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Direction", "The direction of chess.", 0);
AddCondition(14, cf_not_invertible, "Pick edges around chess", "Pick edge", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges around chess at direction.", "PickEdgesAroundChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(15, cf_not_invertible, "Pick edges around chess", "Pick edge - Square grid", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges by chess and direction.", "PickEdgesAroundChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(16, cf_not_invertible, "Pick edges around chess", "Pick edge - Hexagon grid (Left-Right)", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges around chess at direction.", "PickEdgesAroundChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddCondition(17, cf_not_invertible, "Pick edges around chess", "Pick edge - Hexagon grid (Up-Down)", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges around chess at direction.", "PickEdgesAroundChessAtDirection");     
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddCondition(18, cf_not_invertible, "Pick edges clamped by chess", "Pick edge", 
             "Pick edges <i>{0}</i> clamped by chess <i>{1}</i>", 
             "Pick edges clamped by chess.", "PickEdgesClampedByChess");
                          
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Edge", "Edge object.");
AddAnyTypeParam("Logic Z", "The Z index (0-based).", 0);    
AddCondition(21, cf_not_invertible, "Pick chess around edge at LZ", "Pick chess", 
             "Pick cheess <i>{0}</i> around edges <i>{1}</i> at Logic Z to <i>{2}</i>", 
             "Pick chess around edge.", "PickChessAroundEdge");
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Edge", "Edge object.");
AddCondition(22, cf_not_invertible, "Pick chess around edge", "Pick chess", 
             "Pick cheess <i>{0}</i> around edges <i>{1}</i>", 
             "Pick chess around edge.", "PickChessAroundEdge");             

AddObjectParam("Edge", "Kicked edge object.");
AddCondition(31, cf_trigger, "On edge kicked", "Kick", 
            "On <i>{0}</i> kicked", 
            'Triggered when edge kicked by "action:Create edge" or "action:Move edge".', "OnEdgeKicked");
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
AddAnyTypeParam("UID0", "The UID of chess", 0);
AddAnyTypeParam("UID1", "The UID of neighbor chess", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(2, 0, "Create edge between chess", "Physical: Create", 
          "Create edge <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i> on layer <i>{3}</i>", 
          "Create edge between chess.", "CreateEdgeBetweenChess");	          
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddNumberParam("Direction", "The direction of chess. (-1) for all directions", 0);
AddLayerParam("Layer", "Layer name of number."); 	
AddAction(3, 0, "Create edge around chess", "Physical: Create", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge around chess.", "CreateEdgeAroundChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(4, 0, "Create edge around chess", "Physical: Create - Square grid", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge around chess.", "CreateEdgeAroundChess");
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
AddAction(5, 0, "Create edge around chess", "Physical: Create - Hexagon grid (Left-Right)", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge around chess.", "CreateEdgeAroundChess");		
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
AddAction(6, 0, "Create edge around chess", "Physical: Create - Hexagon grid (Up-Down)", 
          "Create edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side on layer <i>{3}</i>", 
          "Create edge around chess.", "CreateEdgeAroundChess");
 
AddObjectParam("Edge", "Edge object.");
AddAction(17, 0, "Destroy edges", "Logic: Remove", 
          "Destroy edges <i>{0}</i>", 
          "Destroy edges and remove them from the board.", "DestroyEdges");       
AddObjectParam("Edge", "Edge object.");
AddAction(18, 0, "Remove edges", "Logic: Remove", 
          "Remove edges <i>{0}</i>", 
          "Remove edges from the board.", "RemoveEdges");          
          
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);
AddAction(21, 0, "Move edge between points", "Logic: Move", 
          "Move edge <i>{0}</i> between logic points (<i>{1}</i>, <i>{2}</i>) and (<i>{3}</i>, <i>{4}</i>)", 
          "Move edge between points.", "MoveEdgeBetweenLP");
AddObjectParam("Edge", "Edge object.");  
AddAnyTypeParam("UID0", "The UID of chess", 0);
AddAnyTypeParam("UID1", "The UID of neighbor chess", 0);	
AddAction(22, 0, "Move edge between chess", "Logic: Move", 
          "Move edge <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i>", 
          "Move edge between chess.", "MoveEdgeBetweenChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddNumberParam("Direction", "The direction of chess.", 0);	
AddAction(23, 0, "Move edge around chess", "Logic: Move", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge around chess.", "MoveEdgeAroundChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(24, 0, "Move edge around chess", "Logic: Move - Square grid", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge around chess.", "MoveEdgeAroundChess");
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(25, 0, "Move edge around chess", "Logic: Move - Hexagon grid (Left-Right)", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge around chess.", "MoveEdgeAroundChess");		
AddObjectParam("Edge", "Edge object.");  
AddObjectParam("Chess", "Chess object.");         
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(26, 0, "Move edge around chess", "Logic: Move - Hexagon grid (Up-Down)", 
          "Move edge <i>{0}</i> at chess <i>{1}</i>'s <i>{2}</i> side", 
          "Move edge around chess.", "MoveEdgeAroundChess");
		  
AddObjectParam("Edge", "Edge object."); 
AddAction(31, 0, "Pick all edges", "Pick edge", 
          "Pick all edges <i>{0}</i>", 
          "Pick all edge.", "PickAllEdges");
AddObjectParam("Edge", "Edge object.");  
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0); 
AddAction(32, 0, "Pick edge between points", "Pick edge", 
          "Pick edge <i>{0}</i> between logic points (<i>{1}</i>, <i>{2}</i>) and (<i>{3}</i>, <i>{4}</i>)", 
          "Pick edge between two logic points.", "PickEdgeBetweenLP");                    
AddObjectParam("Edge", "Edge object.");          
AddAnyTypeParam("UID0", "The UID of chess", 0);
AddAnyTypeParam("UID1", "The UID of neighbor chess", 0);
AddAction(33, 0, "Pick edges between chess", "Pick edge", 
             "Pick edges <i>{0}</i> between chess UID:<i>{1}</i> and chess UID:<i>{2}</i>", 
             "Pick edges between chess.", "PickEdgeBetweenChess");              
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Direction", "The direction of chess.", 0);
AddAction(34, 0, "Pick edges around chess", "Pick edge", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges around chess at direction.", "PickEdgesAroundChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(35, 0, "Pick edges around chess", "Pick edge - Square grid", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges by chess and direction.", "PickEdgesAroundChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(36, 0, "Pick edges around chess", "Pick edge - Hexagon grid (Left-Right)", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges around chess at direction.", "PickEdgesAroundChessAtDirection"); 
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "The direction of chess.", 0);
AddAction(37, 0, "Pick edges around chess", "Pick edge - Hexagon grid (Up-Down)", 
             "Pick edges <i>{0}</i> around chess <i>{1}</i> at direction to <i>{2}</i>", 
             "Pick edges around chess at direction.", "PickEdgesAroundChessAtDirection");     
AddObjectParam("Edge", "Edge object.");          
AddObjectParam("Chess", "Chess object.");
AddAction(38, 0, "Pick edges clamped by chess", "Pick edge", 
             "Pick edges <i>{0}</i> clamped by chess <i>{1}</i>", 
             "Pick edges clamped by chess.", "PickEdgesClampedByChess");
                          
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Edge", "Edge object.");
AddAnyTypeParam("Logic Z", "The Z index (0-based).", 0);    
AddAction(41, 0, "Pick chess around edge at LZ", "Pick chess", 
             "Pick cheess <i>{0}</i> around edges <i>{1}</i> at Logic Z to <i>{2}</i>", 
             "Pick chess around edge.", "PickChessAroundEdge");
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Edge", "Edge object.");
AddAction(42, 0, "Pick chess around edge", "Pick chess", 
             "Pick cheess <i>{0}</i> around edges <i>{1}</i>", 
             "Pick chess around edge.", "PickChessAroundEdge"); 
               		  
//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("LX0", "The logic X of point 0.", 0);
AddNumberParam("LY0", "The logic Y of point 0.", 0);   
AddNumberParam("LX1", "The logic X of point 1.", 0);
AddNumberParam("LY1", "The logic Y of point 1.", 0);  
AddExpression(1, ef_return_number,
              "Get edge UID by LXY", "Edge", "LXY2EdgeUID",
              "Get edge UID by LXY index. Return (-1) if this position has no edge.");
AddAnyTypeParam("UID0", "The UID of chess", 0);
AddAnyTypeParam("UID1", "The UID of neighbor chess", 0);
AddExpression(2, ef_return_number,
              "Get edge UID by chess UID", "Edge", "ChessUID2EdgeUID",
              "Get edge UID by chess UID. Return (-1) if this position has no edge.");
AddAnyTypeParam("UID", "The UID of chess", 0);
AddNumberParam("Direction", "The direction of chess.", 0);	
AddExpression(3, ef_return_number,
              "Get edge UID by chess and direction", "Edge", "ChessDIR2EdgeUID",
              "Get edge UID by chess and direction. Return (-1) if this position has no edge.");
AddAnyTypeParam("UID", "The UID of chess", 0);	
AddExpression(4, ef_return_number,
              "Get edge cout around the chess", "Edge", "ChessUID2EdgeCount",
              "Get edge cout around the chess. Return (-1) if this chess is not on the board.");
              
AddAnyTypeParam("UID", "The UID of edge", 0);
AddExpression(11, ef_return_number,
              "Get X co-ordinate of edge by UID", "Physical", "EdgeUID2PX",
              "Get physical X co-ordinate of edge by UID. Return (-1) if this edge is not valided.");  
AddAnyTypeParam("UID", "The UID of edge", 0);
AddExpression(12, ef_return_number,
              "Get Y co-ordinate of edge by UID", "Physical", "EdgeUID2PY",
              "Get physical Y co-ordinate of edge by UID. Return (-1) if this edge is not valided.");  
AddAnyTypeParam("UID", "The UID of edge", 0);
AddExpression(13, ef_return_number,
              "Get angle of edge by UID", "Physical", "EdgeUID2PA",
              "Get physical angle of edge by UID. Return (-1) if this edge is not valided.");  
                                          
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
