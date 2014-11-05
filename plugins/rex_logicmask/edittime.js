function GetPluginSettings()
{
	return {
		"name":			"Logic mask",
		"id":			"Rex_LogicMask",
		"version":		"0.1",        
		"description":	"A cover area of a board object.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_logicmask.html",
		"category":		"Rex - Board - application",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_looping | cf_not_invertible, "For each enter LXY", "Enter", 
             "For each enter LXY", 
             "Repeat the event for each logic position of entered area.", "ForEachEnter");  
AddCondition(2, cf_looping | cf_not_invertible, "For each exit LXY", "Exit", 
             "For each exit LXY", 
             "Repeat the event for each logic position of exited area.", "ForEachExit");   
AddCondition(3, cf_looping | cf_not_invertible, "For each mask", "Mask area", 
             "For each mask LXY", 
             "Repeat the event for each logic position of mask area.", "ForEachMask");  
AddNumberParam("Logic X", "The X index.", 0);
AddNumberParam("Logic Y", "The Y index.", 0);
AddCondition(4, 0, "In mask area", "Mask area", 
             "[<i>{0}</i>,<i>{1}</i>] is in masked area", 
             "Testing if point is in masked area.", "IsMaskArea");			 
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Clean", "Define mask", 
          "Clean mask", 
          "Clean mask.", "CleanMask");
AddNumberParam("Left-top X", "Logic X position of Left-top point related by origin point.", -2);   
AddNumberParam("Left-top Y", "Logic Y position of Left-top point related by origin point.", -2); 
AddNumberParam("Width", "Witdh of area.", 5);   
AddNumberParam("Height", "Height of area.", 5); 
AddAnyTypeParam("Value", "Filled value. Could be number or (JSON) string.", 1); 
AddAction(2, 0, "Fill a rectangle", "Define mask", 
          "Fill a rectangle mask at offset to [<i>{0}</i>, <i>{1}</i>], width to <i>{2}</i>, height to <i>{3}</i>, with value to <i>{4}</i>",
          "Fill a rectangle mask.", "FillRectangleMask");  
AddNumberParam("X", "Logic X position related by origin point.", 0);   
AddNumberParam("Y", "Logic Y position related by origin point.", 0);
AddAnyTypeParam("Value", "Filled value. Could be number or (JSON) string.", 1); 
AddAction(3, 0, "Fill a point", "Define mask", 
          "Fill at [<i>{0}</i>, <i>{1}</i>], with value to <i>{2}</i>",
          "Fill a point mask.", "FillPointMask");   
AddNumberParam("X", "Logic X position of origin point.", 0);   
AddNumberParam("Y", "Logic Y position of origin point.", 0);
AddAction(11, 0, "Set origin point", "Origin point", 
          "Set origin point to [<i>{0}</i>, <i>{1}</i>]",
          "Set origin point.", "SetOrigin");                   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Current Logic X ", "For each", "CurLX", 
              "Current Logic X in a For Each loop.");   			  
AddExpression(2, ef_return_number, "Current Logic Y ", "For each", "CurLY",
              "Current Logic Y in a For Each loop."); 
AddExpression(3, ef_return_any, "Current value of mask", "For each", "CurValue",
              "Current value of mask in a For Each loop."); 
AddExpression(11, ef_return_number, "Logic X of Origin point", "Origin", "OX", 
              "Logic X of Origin point.");   			  
AddExpression(12, ef_return_number, "Logic Y of Origin point", "Origin", "OY", 
              "Logic Y of Origin point.");   					  
                               
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
