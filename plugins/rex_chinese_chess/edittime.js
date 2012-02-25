function GetPluginSettings()
{
	return {
		"name":			"Chinese Chess",
		"id":			"Rex_ChineseChess",
		"description":	"Game logic of chinese chess",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Game logic",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On chess putting", "Command", 
             "On chess putting", 
             "Trigger when chess put.", "CBPutChess");  
AddCondition(2, cf_trigger, "On chess moving", "Command", 
             "On chess moving", 
             "Trigger when chess moving.", "CBMoveChess");         

//////////////////////////////////////////////////////////////
// Actions  
AddStringParam("Chess' UID f black side", 
               "將,士,士,象,象,車,車,馬,馬,炮,炮,卒,卒,卒,卒,卒.", 
               "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
AddStringParam("Chess' UID f red side", 
               "帥,仕,仕,相,相,車,車,馬,馬,砲,砲,兵,兵,兵,兵,兵.", 
               "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");
AddComboParamOption("Black side first");
AddComboParamOption("Red side first");
AddComboParam("First side", "Black or red side first.", 1);
AddAction(1, 0, "New game", "Initialize", "Create a new game with <i>{2}</i>", 
         "Create a new game.", "NewGame");
AddNumberParam("UID", "The uid of chess", 0);
AddNumberParam("To X", "Move this chess to X index", 0);
AddNumberParam("To Y", "Move this chess to Y index", 0);
AddAction(2, 0, "Move chess", "Command", "Move chess <i>{0}</i> to [<i>{2}</i>, <i>{3}</i>]", 
          "Try to move chess.", "CmdMoveChess"); 
   
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get UID of selected chess", "Command", "SelectedUID", 
              "Get UID of selected chess.");
AddExpression(2, ef_return_number | ef_variadic_parameters, 
              "Get X index of selected chess", "Command", "SelectedX", 
              "Get X index of selected chess.");
AddExpression(3, ef_return_number | ef_variadic_parameters, 
              "Get Y index of selected chess", "Command", "SelectedY", 
              "Get Y index of selected chess.");
AddExpression(4, ef_return_string | ef_variadic_parameters, 
              "Get name of selected chess", "Command", "SelectedName", 
              "Get name of selected chess.");   
AddExpression(5, ef_return_number | ef_variadic_parameters, 
              "Get player id of selected chess", "Command", "SelectedPlayerID", 
              "Get player id of selected chess.");                         
AddExpression(6, ef_return_number, "Get X index of moving to", 
              "Command", "ToX", 
              "Get X index of moving to");
AddExpression(7, ef_return_number, "Get Y index of moving to", 
              "Command", "ToY", 
              "Get Y index of moving to.");                                          

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
