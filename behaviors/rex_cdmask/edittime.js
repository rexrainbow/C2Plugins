function GetBehaviorSettings()
{
	return {
		"name":			"CD Mask",
		"id":			"Rex_cdmask",
		"description":	"Cool down mask.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_cdmask.html",
		"category":		"Effect",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Pick canvas", "SOL", 
             "Pick canvas", "Pick canvas to SOL.", "PickCanvas");
             
//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Canvas", "Canvas object");
AddAction(0, 0, "Setup canvas", "Setup", 
          "{my} get canvas from <i>{0}</i>", 
          "Setup canvas.", "SetupCanvas");
AddNumberParam("percentage", "Cool down percentage, 1-0", 0);
AddAction(1, 0, "Set percentage", "Mask", 
          "Set cool down percentage to <i>{0}</i>", 
          "Set cool down percentage.", "SetCoolDownPercentage"); 
AddStringParam("Color", "Use color name, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", "\"black\"");
AddAction(2, 0, "Set mask color", "Mask", "Set mask color to <i>{0}</i>", "Set mask color.", "SetMaskColor");
AddAction(3, 0, "Pick canvas", "SOL", 
          "Pick canvas", 
          "Pick canvas to SOL.", "PickCanvas");                 
 

//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [           
    new cr.Property(ept_text, "Color", "black", 
                   "Use color name, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" "),	       
    new cr.Property(ept_combo, "Shape", "Rectangle", "Mask shape.", "Rectangle|Circle"),    
    new cr.Property(ept_combo, "Z order", "Front", "Z order of mask.", "Front|Back"),    
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
