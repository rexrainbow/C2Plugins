function GetBehaviorSettings()
{
	return {
		"name":			"Text properties",
		"id":			"Rex_text_properties",
		"description":	"Support actions to change properties of text object.",
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
AddComboParamOption("Left");
AddComboParamOption("Center");
AddComboParamOption("Right");
AddComboParam("Horizontal alignment", "Horizontal alignment of the text", 0);          
AddAction(1, 0, "Set horizontal alignment", "Properties", 
          "Set horizontal alignment to <i>{0}</i>", 
          "Set horizontal alignment.", "SetHorizontalAlignment"); 
AddComboParamOption("Top");
AddComboParamOption("Center");
AddComboParamOption("Bottom");
AddComboParam("Vertical alignment", "Horizontal alignment of the text", 0);          
AddAction(2, 0, "Set Vertical alignment", "Properties", 
          "Set vertical alignment to <i>{0}</i>", 
          "Set vertical alignment.", "SetVerticalAlignment");              
AddComboParamOption("Word");
AddComboParamOption("Character");
AddComboParam("Wrapping", "Wrap text by space-separated words or nearest character", 0);          
AddAction(3, 0, "Set wrapping", "Properties", 
          "Set wrapping to <i>{0}</i>", 
          "Set wrapping.", "SetWrapping");   
AddNumberParam("Line height", "Offset to the default line height, in pixels. 0 is default line height", 0);      
AddAction(4, 0, "Set line height", "Properties", 
          "Set line height to <i>{0}</i>", 
          "Set line height.", "SetLineHeight"); 
//////////////////////////////////////////////////////////////
// Expressions

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
}
