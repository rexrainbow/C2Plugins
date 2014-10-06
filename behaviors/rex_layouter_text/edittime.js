function GetBehaviorSettings()
{
	return {
		"name":			"Text",
		"id":			"Rex_layouter_text",
		"description":	"Show text using sprites in layouter.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_layouter_text.html",
		"category":		"Rex - Layouter",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
	  			 		 
//////////////////////////////////////////////////////////////
// Actions   
AddObjectParam("Character", "Sprite of character.");
AddAction(1, 0, "Set character object", "0: Setup", "Set character object to <i>{0}</i>", 
          "Set character object.", "SetCharacterObject");        
AddAnyTypeParam("Text", "Enter the text to set the object's content to.", "\"\"");
AddAction(3, 0, "Set text", "Text", 
          "{my} set text to <i>{0}</i>", 
          "Set text.", 
          "SetText");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Text", "Text", "Text", "Get text.");

ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_text, "Characters list", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-=*/()?!.,;:<>[]% ", 
                   "Characters list for mapping character to frame index of sprite."),
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
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
