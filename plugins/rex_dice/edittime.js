function GetPluginSettings()
{
	return {
		"name":			"Dice",
		"id":			"Rex_Dice",
		"version":		"0.1",        
		"description":	"Roll dice",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_dice.html",
		"category":		"Rex - Random",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions 
AddNumberParam("Count", "Count of dice.", 1);
AddNumberParam("Faces", "Faces of dice.", 6);
AddAction(1, 0, "Roll", "Roll", 
          "Roll <i>{0}</i> dice with <i>{1}</i> faces", "RollDice.", "Roll");

AddObjectParam("Random generator", "Random generator object");
AddAction(20, 0, "Set random generator", "Setup", 
          "Set random generator object to <i>{0}</i>", 
          "Set random generator object.", "SetRandomGenerator");		  
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("Count and faces", 'Combine dice count and faces in a string like "4D6", or the count of dice in a number, and add the faces in 2nd parameter.', 1);
//AddNumberParam("Faces", "Faces of dice.", 6);
AddExpression(0, ef_return_number | ef_variadic_parameters, "Roll dices", "Roll", "Roll", "Roll dices and get the sum of result.");
AddExpression(1, ef_return_number, "Count of dice", "Roll", "DiceCount", "Count of dice.");
AddExpression(2, ef_return_number, "Faces of dice", "Roll", "DiceFaces", "Sum of result.");
AddExpression(3, ef_return_number, "Sum of result", "Result", "Sum", "Sum of result.");
AddNumberParam("Index", "Index of dice. Start at 0.", 0);
AddExpression(4, ef_return_number, "Result of die", "Result", "Die", "Result of die.");

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
