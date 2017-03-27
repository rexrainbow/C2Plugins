function GetPluginSettings()
{
	return {
		"name":			"graph movement",
		"id":			"Rex_GraphMovement",
		"version":		"0.1",   		
		"description":	"Get moveable or moving path on the graph.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_graph_movement.html",
		"category":		"Rex - Graph - Application",
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
AddObjectParam("Graph", "Graph object");
AddObjectParam("Group", "Instance group object");
AddAction(0, 0, "Setup", "Setup", 
          "Set graph object to <i>{0}</i>, instance group object to <i>{1}</i>", 
          "Set graph object and instance group object.", "Setup");
          
AddNumberParam("Cost", "Cost", 0);
AddAction(1, 0, "Set cost", "Cost", "Set cost to <i>{0}</i>", 
          "Set cost.", "SetCost");
           
AddAnyTypeParam("Start vertex", "The UID of start vertex", 0);
AddNumberParam("Moving points", "Moving points.", 1);
AddAnyTypeParam("Moving cost", "A number or a function name to get moving cost for each tile.", 1);
AddStringParam("Filter", 'Filter function name to get avaiable uid, "" is passing default.', '""');
AddStringParam("Group", "Put result in this group", '""');
AddComboParamOption("Vertices");
AddComboParamOption("Vertices and edges");
AddComboParam("Result", "Result group.", 0);
AddAction(3, 0, "Get moveable area", "Request: Moveable area", 
          "Get moveable area start from <i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, filter to <i>{3}</i>. Then put result {5} to group <i>{4}</i>", 
          "Get moveable area.", "GetMoveableArea");
  
AddAnyTypeParam("Start vertex", "The UID of start vertex", 0);
AddAnyTypeParam("End vertex", "The UID of end vertex", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a function name to get moving cost for each tile.", 0);
AddStringParam("Group", "Put result in this group", '""');
AddComboParamOption("");
AddComboParamOption("nearest");
AddComboParam("Exact", "Exact or nearest.", 0);
AddComboParamOption("Vertices");
AddComboParamOption("Vertices and edges");
AddComboParam("Result", "Result group.", 0);
AddAction(5, 0, "Get moving path", "Request: Moving path", 
          "Get moving path from <i>{0}</i> to <i>{5}</i> <i>{1}</i> with moving points to <i>{2}</i> and cost to <i>{3}</i>. Then put result {5} to group <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");

AddAnyTypeParam("UID", "Filter result", 0);
AddAction(6, 0, "Append filter result", "Filter", "Append filter result to UID:<i>{0}</i>", 
          "Append filter result in UID.", "AppendFilter");
          
AddComboParamOption("Random");  // 0
AddComboParamOption("A*");          // 1 <- 3
AddComboParamOption("Line");        // 2 <- 4
AddComboParamOption("A*-line");   // 3 <- 5
AddComboParamOption("A*-random");  // 4 <- 6
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
              "Get UID of start vertex", "Request", "StartVertexUID", 
              "Get UID of start vertex.");
AddExpression(2, ef_return_any, 
              "Get UID of end vertex", "Request", "EndVertexUID", 
              "Get UID of end vertex.");        
AddExpression(3, ef_return_any,
              "Get UID of vertex", "Request", "VertexUID",
              "Get UID of vertex of request.");
AddExpression(4, ef_return_any,
              "Get UID of edge", "Request", "EdgeUID",
              "Get UID of edge of request between PreVertex and Vertex");               
AddExpression(5, ef_return_any,
              "Get UID of previos vertex", "Request", "PreVertexUID",
              "Get UID of previos vertex of request.");               
AddExpression(6, ef_return_number,
              "Get path cost of previos vertex", "Request: Previous", "PrePathCost",
              "Get path cost of previos vertex.");  
              
AddExpression(11, ef_return_number,
              "Blocking", "Cost", "BLOCKING",
              'Blocking property used in cost function, used in action:"Set cost". The value is (-1)');        
AddExpression(12, ef_return_number,
              "Infinity property", "Moving point", "INFINITY",
              'Infinity property used in moving point, used in Moving point. The value is (-1)'); 
              
AddAnyTypeParam("UID", "UID of vertex", 0);              
AddExpression(21, ef_return_number,
              "Get path cost of vertex", "Result", "UID2PathCost",
              "Get path cost of vertex by UID. Retrun (-1) if unknown.");
AddExpression(22, ef_return_any,
              "Get UID of nearest vertex", "Result", "NearestVertexUID",
              "Get UID of nearest vertex.");

                   
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Path mode", "Random", "Geometry of moving path.", "Random|A*|Line|A* -line|A* -random"),  
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
