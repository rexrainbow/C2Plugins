function GetPluginSettings()
{
	return {
		"name":			"Movement",
		"id":			"Rex_SLGMovement",
		"description":	"Movement on the SLG chess board",
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
AddCondition(1, cf_trigger, "Get moveable brick", "Request: Moveable area", 
             "Get moveable brick", 
             'Callback of "Action:Get moveable brick."', "GetMoveableBrick"); 
AddCondition(2, cf_trigger, "Get moving path brick", "Request: Moving path", 
             "Get moving path", 
             'Callback of "Action:Move chess."', "GetMovingPathBrick");              
             
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Board", "Board object");
AddAction(0, 0, "Set board object", "Setup", 
          "Set board object to <i>{0}</i>", 
          "Set board object.", "SetupBoard");  
AddObjectParam("Function", "Function object for command's callback");
AddAction(1, 0, "Setup callback", "Advance: Setup", 
          "Set command's callback to <i>{0}</i>", 
          "Setup callback.", "SetupCallback");
AddObjectParam("Chess", "Chess object.");
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(2, 0, "Get moveable area", "Request: Moveable area", 
          "Get moveable area of chess <i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, callback to <i>{3}</i>", 
          "Get moveable area.", "GetMoveableArea");     
AddNumberParam("UID", "The UID of chess", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(3, 0, "Get moveable area by UID", "Request: Moveable area", 
          "Get moveable area of chess UID:<i>{0}</i> by moving points to <i>{1}</i> and cost to <i>{2}</i>, callback to <i>{3}</i>", 
          "Get moveable area.", "GetMoveableArea");
AddObjectParam("Chess", "Chess object.");
AddObjectParam("Brick", "Brick object.");
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(4, 0, "Get moving path", "Request: Moving path", 
          "Get moving path of chess <i>{0}</i> to brick <i>{1}</i> by moving points to <i>{2}</i> and cost to <i>{3}</i>, callback to <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");
AddNumberParam("Chess UID", "The UID of chess", 0);
AddNumberParam("Brick UID", "The UID of brick", 0);
AddNumberParam("Moving points", "Moving points.", 0);
AddAnyTypeParam("Moving cost", "A number or a callback name to get moving cost for each brick.", 0);
AddStringParam("Callback", 'Trigger callback to function object, "" is using default callback.', '""');
AddAction(5, 0, "Get moving path by UID", "Request: Moving path", 
          "Get moving path of chess UID:<i>{0}</i> to brick UID:<i>{1}</i> by moving points to <i>{2}</i> and cost to <i>{3}</i>, callback to <i>{4}</i>", 
          "Get moving path.", "GetMovingPath");                                              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number | ef_variadic_parameters, 
              "Get UID of selected chess", "Request", "ChessUID", 
              "Get UID of selected chess.");
AddExpression(2, ef_return_number,
              "Get UID of brick", "Request", "BrickUID",
              'Get UID of brick. Used in "Condition:Get moveable brick" ');
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
        new cr.Property(ept_combo, "Grid type", "Tetragon", "Grid type of board.", "Tetragon|Hexagon"),  
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
