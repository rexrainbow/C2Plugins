function GetPluginSettings()
{
	return {
		"name":			"Mini board",
		"id":			"Rex_MiniBoard",
		"version":		"0.1",
		"description":	"A board-container to group chess and move them together.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_miniboard.html",
		"category":		"Rex - Board - application - mini board",
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
AddComboParamOption("None");
AddComboParamOption("Inside");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 2);
AddCondition(1, 0, "Can put", "Main board", 
             "Can put on <i>{0}</i> at offset to [<i>{1}</i>,<i>{2}</i>], test mode: <i>{3}</i>",
             "Testing if this mini board could put at the main board.", "CanPut");
             
AddCondition(2, cf_not_invertible, "Pick all chess", "SOL", 
             "Pick all chess", 
             "Pick all chess on this mini board.", "PickAllChess"); 
               
AddObjectParam("Chess", "Chess under mini board");
AddCondition(3, cf_static | cf_not_invertible, "Pick mini board", "SOL: mini board", 
          "Pick mini board from <i>{0}</i>", 
          "Pick mini board from chess.", "PickMiniboard");
          
AddObjectParam("Board", "Board object");
AddCondition(4, 0, "On the board", "Board", 
             "Is on <i>{0}</i>", 
             "Return true if the mini board is on the board.", "IsOnTheBoard"); 
                 
AddObjectParam("Board", "Board object");
AddNumberParam("Logic X", "The X index of offset.", 0);
AddNumberParam("Logic Y", "The Y index of offset.", 0);
AddCondition(5, cf_deprecated, "Put-able", "Main board: Put-able", 
             "Cells are put-able on <i>{0}</i> at offset to [<i>{1}</i>,<i>{2}</i>]", 
             "Testing if cells can be put on the board.", "ArePutAble");
             
AddCondition(6, cf_trigger, "On put-able request", "Main board: Put-able", 
             "On put-able request", 
             'Trigger by "Condition:Put-able" for each cell of mini board.', "OnPutAbleRequest");

AddObjectParam("Chess", "Kicked chess object.");
AddCondition(7, cf_trigger, "On chess kicked", "Mini-board: Kick", 
            "On <i>{0}</i> kicked", 
            "Triggered when chess kicked by 'action:Add chess'.", "OnChessKicked");
                  
AddObjectParam("Board", "Board object");
AddNumberParam("Logic X", "The X index of start.", 0);
AddNumberParam("Logic Y", "The Y index of start.", 0);
AddNumberParam("Range", "The range of cell from start.", 0);
AddCondition(10, cf_deprecated, "Can find empty", "Main board: find empty", 
             "Can find empty logic index on <i>{0}</i>, start at [<i>{1}</i>,<i>{2}</i>], range to <i>{3}</i>", 
             "Can find empty logic index on the board.", "CanFindEmpty");	

AddObjectParam("Chess", "Chess object.");
AddCondition(11, 0, "Pick chess", "SOL", 
             "Pick chess <i>{0}</i>", 
             "Pick chess on this mini board.", "PickChess");

AddCondition(12, 0, "Is putting accepted", "Request", 
             "Is putting request accepted", 
             "Return true if putting request accepted.", "IsPuttingRequestAccepted");   
       
AddCondition(13, cf_trigger, "On putting accepted", "Request", 
             "On putting request accepted", 
             "Triggered when putting request accepted.", "OnPuttingRequestAccepted"); 
             
AddCondition(14, cf_trigger, "On putting rejected", "Request", 
             "On putting request rejected", "Triggered when putting request rejected.", "OnPuttingRequestRejected");             
////////////////////////////////////////
// Actions
AddObjectParam("Layout", "Layout to transfer logic index to physical position");
AddAction(1, 0, "Setup layout", "Setup", 
          "Set layout to <i>{0}</i>", 
          "Setup layout to transfer logic index to physical position.", "SetupLayout");
          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index of the chess to set. 0 is tile.", 0);
AddLayerParam("Layer", "Layer name of number."); 
AddAction(2, 0, "Create chess", "Mini-board: Create", 
          "Create chess <i>{0}</i> at [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>], on layer <i>{4}</i>", 
          "Create chess on the mini board.", "CreateChess");  
          	
AddObjectParam("Board", "Board object");
AddNumberParam("Logic X", "The X index of offset.", 0);
AddNumberParam("Logic Y", "The Y index of offset.", 0);
AddComboParamOption("logical only");
AddComboParamOption("logical and physical");
AddComboParam("Mode", "Mode of putting.", 1);
AddComboParamOption("None");
AddComboParamOption("Inside");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(3, 0, "Put", "Main board", 
          "Put on <i>{0}</i> at offset to [<i>{1}</i>, <i>{2}</i>] (<i>{3}</i>), test mode: <i>{4}</i>", 
          "Put chess on the board.", "PutChess");	
             
AddAction(4, 0, "Pull out", "Main board", 
          "Pull out from main board", 
          "Pull out from main board.", "PullOutChess");
          
AddAction(5, 0, "Pick all chess", "SOL", 
          "Pick all chess on the board", 
          "Pick all chess on the board.", "PickAllChess");
          
AddAction(6, 0, "Release all chess", "Release", 
          "Release all chess", 
          "Release all chess.", "ReleaseAllChess");
          
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Put-able", "Result of put-able.",1);
AddAction(7, 0, "Set put-able", "Main board: Put-able", 
          "Set put-able to <i>{0}</i> for this cell", 
          'Set put-able for this cell, used under "Condition:On put-able request".', "SetPutAble");   
                 
AddNumberParam("Put-able", "Result of put-able. 0=No, 1=Yes.",1);       
AddAction(8, 0, "Set put-able by number", "Main board: Put-able", 
          "Set put-able to <i>{0}</i> for this cell", 
          'Set put-able for this cell, used under "Condition:On put-able request".', "SetPutAble");
          
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Logic X", "The X index (0-based) of the chess to set.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess to set.", 0);
AddAnyTypeParam("Logic Z", "The Z index of the chess to set. 0 is tile.", 0);
AddAction(9, 0, "Add chess", "Mini-board: Add", 
          "Add chess <i>{0}</i> at [<i>{1}</i>, <i>{2}</i>, <i>{3}</i>]", 
          "Add chess on the mini board.", "AddChess");          

AddObjectParam("Chess", "Chess object.");
AddAction(10, 0, "Pick chess", "SOL", 
          "Pick chess <i>{0}</i> on the board", 
          "Pick chess on the board.", "PickChess");

AddComboParamOption("logical only");
AddComboParamOption("logical and physical");
AddComboParam("Mode", "Mode of putting.", 1);
AddAction(11, 0, "Put back", "Main board", 
          "Put back (<i>{3}</i>)", 
          "Put chess back on the previos board.", "PutBack");		  

AddComboParamOption("Top-Left");
AddComboParamOption("Center");
AddComboParam("LOXY", "Position type.", 0);          
AddAction(12, 0, "Shift LOXY", "Position", 
          "Shift LOXY to <i>{0}</i>", 
          "Shift the physical position of miniboard and the logic position of all chess.", "ShiftLOXY");
          
AddObjectParam("Chess", "Chess object.");
AddAction(13, 0, "Remove chess", "Mini-board: Remove", 
          "Remove chess <i>{0}</i>", 
          "Remove chess from mini board.", "RemoveChess");   

AddObjectParam("Chess", "Chess object.");
AddAnyTypeParam("Logic Z", "The Z index of the chess to move. 0 is tile.", 0);
AddAction(14, 0, "Move chess to LZ", "Mini-board: Move", 
          "Move chess <i>{0}</i> to LZ <i>{1}</i>", 
          "Move chess to logic Z.", "MoveChessToLZ");                 

AddLayerParam("Layer", "Layer name of number.");
AddAction(21, 0, "Move all to layer", "Mini-board: Layer", 
          "Move all to layer <i>{0}</i>", 
          "Move all to layer.", "MoveToLayer");               
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Logic X offset on main board", "Main board", "LX",
              "Get logic X offset on main board.");
              
AddExpression(2, ef_return_number,
              "Logic Y offset on main board", "Main board", "LY",
              "Get logic Y offset on main board.");
              
AddExpression(3, ef_return_number,
              "Last valid logic X offset on main board", "Main board", "LastLX",
              "Get last valid logic X offset on main board.");
              
AddExpression(4, ef_return_number,
              "Last valid logic Y offset on main board", "Main board", "LastLY",
              "Get last valid logic Y offset on main board."); 
                           
AddExpression(5, ef_return_number,
              "Logic X of request cell on main board", "Main board: Put-able", "RequestLX",
              "Get logic X of request cell on main board.");
              
AddExpression(6, ef_return_number,
              "Logic Y of request cell on main board", "Main board: Put-able", "RequestLY",
              "Get logic Y of request cell on main board.");
                     
AddExpression(7, ef_return_number,
              "Logic Z of request cell on main board", "Main board: Put-able", "RequestLZ",
              "Get logic Z of request cell on main board.");
              
AddExpression(8, ef_return_any,
              "UID of request chess on mini board", "Main board: Put-able", "RequestChessUID",
              "Get UID of request chess on mini board.");
              
AddExpression(9, ef_return_number,
              "UID of put main board", "Main board: Put-able", "RequestMainBoardUID",
              "Get UID of put main board."); 
                                     
AddExpression(10, ef_deprecated | ef_return_number,
              "Logic X of empty on main board", "Main board: find empty", "EmptyLX",
              "Get logic X of empty on main board. Used under 'Condition:Can find empty logic index'");
              
AddExpression(11, ef_deprecated | ef_return_number,
              "Logic Y of empty on main board", "Main board: find empty", "EmptyLY",
              "Get logic Y of empty on main board. Used under 'Condition:Can find empty logic index'");

AddAnyTypeParam("UID", "The UID of chess.", 0);
AddExpression(12, ef_return_number, 
              "Get X index of chess", "Mini board - Logical", "UID2LX", 
              "Get X index of chess by UID. Return (-1) if the chess is not on the mini board.");
AddAnyTypeParam("UID", "The UID of chess.", 0);              
AddExpression(13, ef_return_number, 
              "Get Y index of chess", "Mini board - Logical", "UID2LY", 
              "Get Y index of chess by UID. Return (-1) if the chess is not on the mini board.");
AddAnyTypeParam("UID", "The UID of chess.", 0);              
AddExpression(14, ef_return_any, 
              "Get Z index of chess", "Mini board - Logical", "UID2LZ", 
              "Get Z index of chess by UID. Return (-1) if the chess is not on the mini board.");
                            
AddAnyTypeParam("UID", "The UID of chess.", 0);
AddExpression(15, ef_return_number,
              "Get X co-ordinate by UID", "Mini board - Physical", "UID2PX",
              "Get X co-ordinate by UID. Return (-1) if the chess is not on the mini board.");
AddAnyTypeParam("UID", "The UID of chess.", 0);              
AddExpression(16, ef_return_number,
              "Get Y co-ordinate by UID", "Mini board - Physical", "UID2PY",
              "Get Y co-ordinate by UID. Return (-1) if the chess is not on the mini board.");
              
AddExpression(61, ef_return_number, "Max LX", "Max-min", "MaxLX", 
              "Get maximum of LX of all chess.");
AddExpression(62, ef_return_number, "Max LY", "Max-min", "MaxLY", 
              "Get maximum of LY of all chess.");               
AddExpression(63, ef_return_number, "Min LX", "Max-min", "MinLX", 
              "Get minimum of LX of all chess.");
AddExpression(64, ef_return_number, "Min LY", "Max-min", "MinLY", 
              "Get minimum of LY of all chess.");    
              
ACESDone();

// Property grid properties for this plugin
var property_list = [		
    new cr.Property(ept_color, "Color",	cr.RGB(0, 0, 0), "Color for showing at editor.", "firstonly"),
    new cr.Property(ept_combo, "Pin mode", "Yes", "Enable to set position of each chess follows to the mini board.", "No|Yes"),	
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
    renderer.Fill(quad, this.properties["Color"]);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}

IDEInstance.prototype.OnTextureEdited = function ()
{
}