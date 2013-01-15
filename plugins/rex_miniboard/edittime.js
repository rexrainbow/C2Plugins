function GetPluginSettings()
{
	return {
		"name":			"Mini board",
		"id":			"Rex_MiniBoard",
		"version":		"0.1",
		"description":	"A board-container to group chess and move them together.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Board",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":	    pf_position_aces
	};
};

////////////////////////////////////////
// Conditions 
AddObjectParam("Board", "Board object");
AddNumberParam("Logic X", "The X index of offset.", 0);
AddNumberParam("Logic Y", "The Y index of offset.", 0);
AddCondition(1, 0, "Empty", "Main board", 
             "Cells on <i>{0}</i> at offset to [<i>{1}</i>,<i>{2}</i>] is empty", "Testing if cells on the board are empty.", "IsEmpty");
AddCondition(2, cf_not_invertible, "Pick all chess", "SOL", 
             "Pick all chess on this mini board", "Pick all chess on this mini board.", "PickAllChess");   
AddObjectParam("Chess", "Chess under mini board");
AddCondition(3, cf_static | cf_not_invertible, "Pick mini board", "SOL: mini board", 
          "Pick mini board from <i>{0}</i>", "Pick mini board from chess.", "PickMiniboard");
AddObjectParam("Board", "Board object");
AddCondition(4, 0, "On the board", "Board", 
             "Is on <i>{0}</i>", "Return true if the mini board is on the board.", "IsOnTheBoard");                         
AddObjectParam("Board", "Board object");
AddNumberParam("Logic X", "The X index of start.", 0);
AddNumberParam("Logic Y", "The Y index of start.", 0);
AddNumberParam("Range", "The range of cell from start.", 0);
AddCondition(10, 0, "Can find empty", "Main board: find empty", 
             "Can find empty logic index on <i>{0}</i>, start at [<i>{1}</i>,<i>{2}</i>], range to <i>{3}</i>", "Can find empty logic index on the board.", "CanFindEmpty");	

////////////////////////////////////////
// Actions
AddObjectParam("Layout", "Layout to transfer logic index to physical position");
AddAction(1, 0, "Setup layout", "0: Setup", 
          "Set layout to <i>{0}</i>", 
          "Setup layout to transfer logic index to physical position.", "SetupLayout");
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index (0-based) of the chess to set. 0 is tile.", 0);
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(2, 0, "Create chess", "Physical: Create", "Create chess <i>{0}</i> to [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>], on layer <i>{4}</i>", 
          "Create chess on the mini board.", "CreateChess");  	
AddObjectParam("Board", "Board object");
AddNumberParam("Logic X", "The X index of offset.", 0);
AddNumberParam("Logic Y", "The Y index of offset.", 0);
AddAction(3, 0, "Put", "Main board", 
             "Put on <i>{0}</i> at offset to [<i>{1}</i>,<i>{2}</i>]", "Put chess on the board.", "PutChess");	
AddAction(4, 0, "Pull out", "Main board", 
             "Pull out from main board", "Pull out from main board.", "PullOutChess");
AddAction(5, 0, "Pick all chess", "SOL", 
          "Pick all chess on the board", "Pick all chess on the board.", "PickAllChess");
AddAction(6, 0, "Release all chess", "Release", 
          "Release all chess", "Release all chess.", "ReleaseAllChess");

////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Logic X offset on main board", "Main board", "LX",
              "Get logic X offset on main board.");
AddExpression(2, ef_return_number,
              "Logic Y offset on main board", "Main board", "LY",
              "Get logic Y offset on main board.");
AddExpression(10, ef_return_number,
              "Logic X of empty on main board", "Main board: find empty", "EmptyLX",
              "Get logic X of empty on main board. Used under 'Condition:Can find empty logic index'");
AddExpression(11, ef_return_number,
              "Logic Y of empty on main board", "Main board: find empty", "EmptyLY",
              "Get logic Y of empty on main board. Used under 'Condition:Can find empty logic index'");
              
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
	return new IDEInstance(instance);
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
		
	// Plugin-specific variables
	// this.myValue = 0...
}

IDEInstance.prototype.OnCreate = function()
{
    this.instance.SetHotspot(new cr.vector2(0, 0));
}

IDEInstance.prototype.OnInserted = function()
{
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
    var quad = this.instance.GetBoundingQuad();
    renderer.Fill(quad, cr.RGB(255, 130, 122));
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}

IDEInstance.prototype.OnTextureEdited = function ()
{
}