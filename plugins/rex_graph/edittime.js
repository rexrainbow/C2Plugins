function GetPluginSettings()
{
	return {
		"name":			"Graph",
		"id":			"Rex_Graph",
		"version":		"0.1",          
		"description":	"Graph with vertices and edges.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_topology.html",
		"category":		"Rex - Graph",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Edge", "Edge object.");
AddObjectParam("Vertex A", "Vertex A object.");
AddObjectParam("Vertex B", "Vertex B object.");
AddCondition(1, cf_not_invertible, "Pick vertices of edge", "SOL - Vertices", 
             "Edge <i>{0}</i>: pick Vertex A <i>{1}</i>, Vertex B <i>{2}</i>", 
             "Pick vertices of a edge.", "PickVerticesOfEdge"); 

AddObjectParam("Vertex", "Vertex object.");
AddObjectParam("Edge", "Edge object.");
AddCondition(2, cf_not_invertible, "Pick edges of vertex", "SOL - Edges", 
             "Vertex <i>{0}</i>: pick edges <i>{1}</i>", 
             "Pick edges of a vertex.", "PickEdgesOfVertex");      

AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddObjectParam("Vertex", "Vertex object of neighbors");
AddCondition(3, cf_not_invertible, "Pick neighbor vertices", "SOL - Vertices",
             "Vertex <i>{0}</i>: pick neighbor vertices <i>{1}</i>", 
             "Pick neighbor vertices.", "PickNeighborVertices");         

AddAnyTypeParam("Start vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddObjectParam("Vertex", "Vertex object");
AddComboParamOption("breadth-first");
AddComboParamOption("depth-first");
AddComboParam("Traversal method", "Traversal method.", 0);
AddComboParamOption("");
AddComboParamOption("include start vertex");
AddComboParam("Include start", "Add start vertex or not.", 0);
AddCondition(4, cf_not_invertible, "Pick all connected vertices", "SOL - Vertices",
             "Vertex <i>{0}</i>: pick all connected vertices <i>{1}</i> with <i>{2}</i> <i>{3}</i>", 
             "Pick all connected vertices.", "PickAllConnectedVertices");
                      
AddObjectParam("Vertex", "Vertex object of neighbors");
AddCondition(5, cf_not_invertible, "Pick all vertices", "SOL - Vertices",
             "Pick all vertices <i>{0}</i>", 
             "Pick all vertices.", "PickAllVertices");           

AddObjectParam("Edge", "Edge object.");
AddCondition(6, cf_not_invertible, "Pick all edges", "SOL - Edges",
             "Pick all edges <i>{0}</i>", 
             "Pick all edges.", "PickAllEdges");              
             
AddAnyTypeParam("Vertex A", "UID (number) of symbol (string) of Vertex A.", 0);
AddAnyTypeParam("Vertex B", "UID (number) of symbol (string) of Vertex B.", 0);
AddCondition(11, 0, "Are neighbors", "Adjacent",
          "Vertex <i>{0}</i> and <b>{1}</b> are neighbors", 
          "Return true if these two vertices are connected by edge.", "AreNeighbor");         

AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);
AddCondition(12, 0, "In closed loop", "Cycle",
          "Vertex <i>{0}</i> is in closed loop", 
          "Return true if this vertices is in closed loop.", "IsInLoop");    
          
AddAnyTypeParam("Edge", "Edge object.");
AddStringParam("Vertex A", "Vertex A object.");
AddStringParam("Vertex B", "Vertex B object.");
AddCondition(21, cf_not_invertible, "Pick vertices of edge", "Instance group - Vertices", 
             "Edge <i>{0}</i>: pick Vertex A <i>{1}</i>, Vertex B <i>{2}</i>", 
             "Pick vertices of a edge.", "PickVerticesOfEdge"); 

AddAnyTypeParam("Vertex", "Vertex object.");
AddStringParam("Edge", "Edge object.");
AddCondition(22, cf_not_invertible, "Pick edges of vertex", "Instance group - Edges", 
             "Vertex <i>{0}</i>: pick edges <i>{1}</i>", 
             "Pick edges of a vertex.", "PickEdgesOfVertex");      

AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddStringParam("Vertex", "Vertex object of neighbors");
AddCondition(23, cf_not_invertible, "Pick neighbor vertices", "Instance group - Vertices",
             "Vertex <i>{0}</i>: pick neighbor vertices <i>{1}</i>", 
             "Pick neighbor vertices.", "PickNeighborVertices");         

AddAnyTypeParam("Start vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddStringParam("Vertex", "Vertex object");
AddComboParamOption("breadth-first");
AddComboParamOption("depth-first");
AddComboParam("Traversal method", "Traversal method.", 0);
AddComboParamOption("");
AddComboParamOption("include start vertex");
AddComboParam("Include start", "Add start vertex or not.", 0);
AddCondition(24, cf_not_invertible, "Pick all connected vertices", "Instance group - Vertices",
             "Vertex <i>{0}</i>: pick all connected vertices <i>{1}</i> with <i>{2}</i> <i>{3}</i>", 
             "Pick all connected vertices.", "PickAllConnectedVertices");
                      
AddStringParam("Vertex", "Vertex object of neighbors");
AddCondition(25, cf_not_invertible, "Pick all vertices", "Instance group - Vertices",
             "Pick all vertices <i>{0}</i>", 
             "Pick all vertices.", "PickAllVertices");       

AddStringParam("Edge", "Edge object.");
AddCondition(26, cf_not_invertible, "Pick all edges", "Instance group - Edges",
             "Pick all edges <i>{0}</i>", 
             "Pick all edges.", "PickAllEdges");                
//////////////////////////////////////////////////////////////
// Actions 
AddAnyTypeParam("Edge", "UID (number) of symbol (string) of edge.", 0);
AddAnyTypeParam("Vertex A", "UID (number) of symbol (string) of Vertex A.", 0);
AddAnyTypeParam("Vertex B", "UID (number) of symbol (string) of Vertex B.", 0);
AddComboParamOption("->");
AddComboParamOption("<-");
AddComboParamOption("<->");
AddComboParam("Direction", "Direction of edge.", 2);
AddAction(1, 0, "Add edge", "Add",
          "Add edge <i>{0}</i>: Vertex <i>{1}</i> <b>{3}</b> Vertex <i>{2}</i>", 
          "Add edge.", "AddEdge");
          
AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);
AddAction(2, 0, "Add vertex", "Add",
          "Add vertex <i>{1}</i>", 
          "Add vertex.", "AddVertex");  

AddAnyTypeParam("Edge", "UID (number) of symbol (string) of edge.", 0);
AddAnyTypeParam("Vertex A", "UID (number) of symbol (string) of Vertex A.", 0);
AddAnyTypeParam("Vertex B", "UID (number) of symbol (string) of Vertex B.", 0);
AddAnyTypeParam("Direction", '"->", or "<-", "<->".', '"<->"');
AddAction(3, 0, "Add edge (#)", "Add",
          "Add edge <i>{0}</i>: Vertex <i>{1}</i> <b>{3}</b> Vertex <i>{2}</i>", 
          "Add edge.", "AddEdge");          

AddAnyTypeParam("Edge", "UID (number) of symbol (string) of edge.", 0);
AddAction(11, 0, "Remove edge", "remove",
          "Remove edge <i>{0}</i>", 
          "Remove edge.", "RemoveEdge");  
          
AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);
AddAction(12, 0, "Remove vertex", "remove",
          "Remove vertex <i>{0}</i>",
          "Remove vertex.", "RemoveVertex"); 

AddAction(13, 0, "Remove all", "remove",
          "Remove all",
          "Remove all.", "RemoveAll")          
          
AddObjectParam("Edge", "Edge object.");
AddObjectParam("Vertex A", "Vertex A object.");
AddObjectParam("Vertex B", "Vertex B object.");
AddAction(51, 0, "Pick vertices of edge", "SOL - Vertices",
             "Edge <i>{0}</i>: pick Vertex A <i>{1}</i>, Vertex B <i>{2}</i>", 
             "Pick vertices of a edge.", "PickVerticesOfEdge"); 

AddObjectParam("Vertex", "Vertex object.");
AddObjectParam("Edge", "Edge object.");
AddAction(52, 0, "Pick edges of vertex", "SOL - Edges", 
             "Vertex <i>{0}</i>: pick edges <i>{1}</i>", 
             "Pick edges of a vertex.", "PickEdgesOfVertex");    

AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddObjectParam("Vertex", "Vertex object of neighbors");
AddAction(53, 0, "Pick neighbor vertices", "SOL - Vertices",
             "Vertex <i>{0}</i>: pick neighbor vertices <i>{1}</i>", 
             "Pick neighbor vertices.", "PickNeighborVertices");              
          
AddAnyTypeParam("Start vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddObjectParam("Vertex", "Vertex object");
AddComboParamOption("breadth-first");
AddComboParamOption("depth-first");
AddComboParam("Traversal method", "Traversal method.", 0);
AddComboParamOption("");
AddComboParamOption("include start vertex");
AddComboParam("Include start", "Add start vertex or not.", 0);
AddAction(54, 0, "Pick all connected vertices", "SOL - Vertices",
             "Vertex <i>{0}</i>: pick all connected vertices <i>{1}</i> with <i>{2}</i> <i>{3}</i>", 
             "Pick all connected vertices.", "PickAllConnectedVertices"); 
                      
AddObjectParam("Vertex", "Vertex object of neighbors");
AddAction(55, 0, "Pick all vertices", "SOL - Vertices",
             "Pick all vertices <i>{0}</i>", 
             "Pick all vertices.", "PickAllVertices");             

AddObjectParam("Edge", "Edge object.");
AddCondition(56, 0, "Pick all edges", "SOL - Edges",
             "Pick all edges <i>{0}</i>", 
             "Pick all edges.", "PickAllEdges");

AddAnyTypeParam("Edge", "Edge object.");
AddStringParam("Vertex A", "Vertex A object.");
AddStringParam("Vertex B", "Vertex B object.");
AddAction(61, cf_not_invertible, "Pick vertices of edge", "Instance group - Vertices", 
             "Edge <i>{0}</i>: pick Vertex A <i>{1}</i>, Vertex B <i>{2}</i>", 
             "Pick vertices of a edge.", "PickVerticesOfEdge"); 

AddAnyTypeParam("Vertex", "Vertex object.");
AddStringParam("Edge", "Edge object.");
AddAction(62, 0, "Pick edges of vertex", "Instance group - Edges", 
             "Vertex <i>{0}</i>: pick edges <i>{1}</i>", 
             "Pick edges of a vertex.", "PickEdgesOfVertex");      

AddAnyTypeParam("Vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddStringParam("Vertex", "Vertex object of neighbors");
AddAction(63, 0, "Pick neighbor vertices", "Instance group - Vertices",
             "Vertex <i>{0}</i>: pick neighbor vertices <i>{1}</i>", 
             "Pick neighbor vertices.", "PickNeighborVertices");         

AddAnyTypeParam("Start vertex", "UID (number) of symbol (string) of Vertex.", 0);          
AddStringParam("Vertex", "Vertex object");
AddComboParamOption("breadth-first");
AddComboParamOption("depth-first");
AddComboParam("Traversal method", "Traversal method.", 0);
AddComboParamOption("");
AddComboParamOption("include start vertex");
AddComboParam("Include start", "Add start vertex or not.", 0);
AddAction(64, 0, "Pick all connected vertices", "Instance group - Vertices",
             "Vertex <i>{0}</i>: pick all connected vertices <i>{1}</i> with <i>{2}</i> <i>{3}</i>", 
             "Pick all connected vertices.", "PickAllConnectedVertices");
                      
AddStringParam("Vertex", "Vertex object of neighbors");
AddAction(65, 0, "Pick all vertices", "Instance group - Vertices",
             "Pick all vertices <i>{0}</i>", 
             "Pick all vertices.", "PickAllVertices");       

AddStringParam("Edge", "Edge object.");
AddAction(66, 0, "Pick all edges", "Instance group - Edges",
             "Pick all edges <i>{0}</i>", 
             "Pick all edges.", "PickAllEdges");                 
//////////////////////////////////////////////////////////////
// Expressions


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
