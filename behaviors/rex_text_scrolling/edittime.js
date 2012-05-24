function GetBehaviorSettings()
{
	return {
		"name":			"Scrolling",
		"id":			"Rex_text_scrolling",
		"description":	"Scroll text on text object.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Text",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
             
//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Text", "Enter the text to set the object's content to.", "\"\"");
AddAction(1, 0, "Set content", "Content", 
          "Set content to <i>{0}</i>", 
          "Set content.", "SetContent");
AddNumberParam("Percentage", "Scroll lines, 0 is top, 1 is bottom.", 1);
AddAction(2, 0, "Scroll", "Scrolling", 
          "Scroll lines by percentage to <i>{0}</i>", 
          "Scroll lines by percentage. 0 is top, 1 is bottom.", "ScrollTo");
AddAnyTypeParam("Text", "Enter the text to append to the object's content.", "\"\"");
AddAction(3, 0, "Append content", "Content", 
          "Append <i>{0}</i>", 
          "Add text to the end of the existing content.", "AppendContent");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,	ef_return_string,	"Get text",			"Text",			"Text",		"Get the object's text.");

ACESDone();

// Property grid properties for this plugin
var property_list = [                  
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
	if (this.properties["Pixels per step"] < 1)
		this.properties["Pixels per step"] = 1;
}
