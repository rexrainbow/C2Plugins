function GetBehaviorSettings()
{
	return {
		"name":			"Text properties",
		"id":			"Rex_text_properties",
		"description":	"Support actions to change properties of official text or sprite font object.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_text_properties.html",
		"category":		"Rex - Text",
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
          "{my} Set horizontal alignment to <i>{0}</i>", 
          "Set horizontal alignment.", "SetHorizontalAlignment"); 
          
AddComboParamOption("Top");
AddComboParamOption("Center");
AddComboParamOption("Bottom");
AddComboParam("Vertical alignment", "Horizontal alignment of the text", 0);          
AddAction(2, 0, "Set Vertical alignment", "Properties", 
          "{my} Set vertical alignment to <i>{0}</i>", 
          "Set vertical alignment.", "SetVerticalAlignment"); 
          
AddComboParamOption("Word");
AddComboParamOption("Character");
AddComboParam("Wrapping", "Wrap text by space-separated words or nearest character", 0);          
AddAction(3, 0, "Set wrapping", "Properties", 
          "{my} Set wrapping to <i>{0}</i>", 
          "Set wrapping.", "SetWrapping");   
          
AddNumberParam("Line height", "Offset to the default line height, in pixels. 0 is default line height", 0);      
AddAction(4, 0, "Set line height", "Properties", 
          "{my} Set line height to <i>{0}</i>", 
          "Set line height.", "SetLineHeight");
          
AddNumberParam("Wrapping", "Wrap text. 0=Word, 1=Character", 0);    
AddAction(5, 0, "Set wrapping (#)", "Properties", 
          "{my} Set wrapping to <i>{0}</i>", 
          "Set wrapping.", "SetWrapping");
          
AddStringParam("Font face", "The new font face name to set.", "\"Arial\"");
AddNumberParam("Style", "0=normal, 1=bold, 2=italic, 3=bold and italic", 0);
AddAction(6, 0, "Set font face", "Appearance", 
          "{my} Set font face to <i>{0}</i> (<i>{1}</i>)", "Set the font face used to display text.", "SetFontFace");

AddNumberParam("Horizontal alignment", "Horizontal alignment. 0=Left, 1=Center. 2=Right", 0);          
AddAction(7, 0, "Set horizontal alignment (#)", "Properties", 
          "{my} Set horizontal alignment to <i>{0}</i>", 
          "Set horizontal alignment.", "SetHorizontalAlignment"); 
          
AddNumberParam("Vertical alignment", "Vertical alignment. 0=Top, 1=Center. 2=Bottom", 0);          
AddAction(8, 0, "Set Vertical alignment (#)", "Properties", 
          "{my} Set vertical alignment to <i>{0}</i>", 
          "Set vertical alignment.", "SetVerticalAlignment");                 
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string,	"Get line break content", "Content", "LineBreakContent", "Get content with line break."); 


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
