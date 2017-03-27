function GetPluginSettings()
{
	return {
		"name":			"SLG movement",
		"id":			"Rex_SLGMovement",
		"version":		"0.1",   		
		"description":	"Movement on the chess board of strategy game.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_slg_movement.html",
		"category":		"Rex - Board - application",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "Cost function name.", '""');
AddCondition(1, cf_trigger, "On cost", "Cost", 
             "On cost function <i>{0}</i>", "Cost function to get cost of each tile.", "OnCostFn");
AddStringParam("Name", "Filter function name.", '""');
AddCondition(2, cf_trigger, "On filter", "Filter", 
             "On filter function <i>{0}</i>", "Filter function to re-assign target instances.", "OnFilterFn");
                 
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Board", "Board object");
AddObjectParam("Group", "Instance group object");
AddAction(0, 0, "Setup", "Setup", 
          "Set board object to <i>{0}</i>, instance group object to <i>{1}</i>", 
          "Set board object and instance group object.", "Setup");  
AddNumberParam("Cost", "Cost", 0);
AddAction(1, 0, "Set cost", "Cost", "Set cost to <i>{0}</i>", 
          "Set cost.", "SetCost");          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a function name to get moving cost for each tile.", 0);
AddStringParam("Filter", 'Filter function name to get avaiable uid, "" is passing default.', '""');
AddStringParam("Group", "Put result in this group", '""');
AddAction(2, 0, "Get moveable area", "Request: Moveable area", 
          "Get moveable area of chess <i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, filter to <i>{3}</i>. Then put result to group <i>{4}</i>", 
          "Get moveable area.", "GetMoveableArea");     
AddAnyTypeParam("UID", "The UID of chess", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a function name to get moving cost for each tile.", 0);
AddStringParam("Filter", 'Filter function name to get avaiable uid, "" is passing default.', '""');
AddStringParam("Group", "Put result in this group", '""');
AddAction(3, 0, "Get moveable area by UID", "Request: Moveable area", 
          "Get moveable area of chess UID:<i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, filter to <i>{3}</i>. Then put result to group <i>{4}</i>", 
          "Get moveable area.", "GetMoveableArea");
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Tile/Chess", "Tile/Chess object.");
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a function name to get moving cost for each tile.", 0);
AddStringParam("Group", "Put result in this group", '""');
AddComboParamOption("");
AddComboParamOption("nearest");
AddComboParam("Exact", "Exact or nearest.", 0);
AddAction(4, 0, "Get moving path", "Request: Moving path", 
          "Get moving path start from chess <i>{0}</i> to <i>{5}</i> tile/chess <i>{1}</i> with moving points to <i>{2}</i> and cost to <i>{3}</i>, then put result to group <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");
AddAnyTypeParam("Chess UID", "The UID of chess", 0);
AddAnyTypeParam("Tile/Chess UID", "The UID of tile/chess", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a function name to get moving cost for each tile.", 0);
AddStringParam("Group", "Put result in this group", '""');
AddComboParamOption("");
AddComboParamOption("nearest");
AddComboParam("Exact", "Exact or nearest.", 0);
AddAction(5, 0, "Get moving path by UID", "Request: Moving path", 
          "Get moving path start from chess UID:<i>{0}</i> to <i>{5}</i> tile/chess UID:<i>{1}</i> with moving points to <i>{2}</i> and cost to <i>{3}</i>, then put result to group <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");      
AddAnyTypeParam("UID", "Filter result", 0);
AddAction(6, 0, "Append filter result", "Filter", "Append filter result to UID:<i>{0}</i>", 
          "Append filter result in UID.", "AppendFilter");   
AddComboParamOption("Random");
AddComboParamOption("Diagonal");
AddComboParamOption("Straight");
AddComboParamOption("A*");
AddComboParamOption("Line");
AddComboParamOption("A*-line");
AddComboParamOption("A*-random");
AddComboParam("Path mode", "Geometry of moving path.", 0);
AddAction(7, 0, "Set path mode", "Setup", "Set path mode to <i>{0}</i>", 
          "Set path mode.", "SetPathMode");
AddObjectParam("Random generator", "Random generator object");
AddAction(11, 0, "Set random generator", "Setup", 
          "Set random generator object to <i>{0}</i>", 
          "Set random generator object.", "SetRandomGenerator");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any, 
              "Get UID of selected chess", "Request", "ChessUID", 
              "Get UID of selected chess.");
AddExpression(2, ef_return_any,
              "Get UID of target tile", "Request", "TileUID",
              "Get UID of target tile.");
AddExpression(3, ef_return_number,
              "Blocking", "Cost", "BLOCKING",
              'Blocking property used in cost function, used in action:"Set cost". The value is (-1)');              
AddExpression(4, ef_return_number,
              "Get logic X of target tile", "Request", "TileX",
              "Get logic X of target tile.");
AddExpression(5, ef_return_number,
              "Get logic Y of target tile", "Request", "TileY",
              "Get logic Y of target tile."); 
AddExpression(6, ef_return_number,
              "Infinity property", "Moving point", "INFINITY",
              'Infinity property used in moving point, used in Moving point. The value is (-1)'); 
AddAnyTypeParam("UID", "UID of tile", 0);              
AddExpression(7, ef_return_number,
              "Get path cost of chess", "Result", "UID2PathCost",
              "Get path cost of chess/tile by UID. Retrun (-1) if unknown.");
AddExpression(8, ef_return_any,
              "Get UID of nearest tile", "Result", "NearestTileUID",
              "Get UID of nearest tile to target.");
AddExpression(9, ef_return_any, 
              "Get UID of start tile", "Request", "StartTileUID", 
              "Get UID of start tile.");
                    
AddExpression(11, ef_return_any,
              "Get UID of previos tile", "Request: Previous", "PreTileUID",
              "Get UID of previos tile.");
AddExpression(12, ef_return_number,
              "Get logic X of previos tile", "Request: Previous", "PreTileX",
              "Get logic X of previos tile.");
AddExpression(13, ef_return_number,
              "Get logic Y of previos tile", "Request: Previous", "PreTileY",
              "Get logic Y of previos tile."); 
AddExpression(14, ef_return_number,
              "Get path cost of previos tile", "Request: Previous", "PreTilePathCost",
              "Get path cost of previos tile."); 

AddExpression(21, ef_return_number,
              "Get logic X of start position", "Request", "StartX",
              "Get logic X of target position.");
AddExpression(22, ef_return_number,
              "Get logic Y of start position", "Request", "StartY",
              "Get logic Y of start position.");               
                   
AddExpression(31, ef_return_any,
              "Get UID of end tile", "Result", "EndTileUID",
              "Get UID of end tile.");
AddExpression(32, ef_return_number,
              "Get logic X of end tile", "Result", "EndX",
              "Get logic X of end tile.");
AddExpression(33, ef_return_number,
              "Get logic Y of end tile", "Result", "EndY",
              "Get logic Y of end tile.");    

              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Path mode", "Random", "Geometry of moving path.", "Random|Diagonal|Straight|A*|Line|A* -line|A* -random"),  
    new cr.Property(ept_combo, "Cache cost", "Yes", "Cache the cost of each tile in a request.", "No|Yes"),
    new cr.Property(ept_combo, "Shuffle neighbors", "No", "Shuffle the order of checking neighbors.", "No|Yes"),
	new cr.Property(ept_float, "Weight", 10, "Weight of heuristic estimation for A*- path mode."),
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
