function GetBehaviorSettings()
{
	return {
		"name":			"Text resize",
		"id":			"Rex_text_resize",
		"description":	"Resize text object and background to show all lines.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_text_resize.html",
		"category":		"Rex - Text",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On size changed", "Resize", 
             "On {my} size changed", 
			 "Triggered when size changed.", 
			 "OnSizeChanged");     
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Resize", "Resize", 
          "{my} resize", 
          "Resize text object to show all text with minimal height.", "Resize");
          
AddNumberParam("Width", "Width in pixels.");          
AddAction(2, 0, "Set max width", "Resize", 
          "{my} set max width to <i>{0}</i>", 
          "Set maximum width of this object.", "SetMaxWidth");    

AddNumberParam("Width", "Width in pixels.");             
AddAction(3, 0, "Set min width", "Resize", 
          "{my} set min width to <i>{0}</i>", 
          "Set minimum width of this object.", "SetMinWidth");   

AddNumberParam("Height", "Height in pixels.");             
AddAction(4, 0, "Set min height", "Resize", 
          "{my} set min height to <i>{0}</i>", 
          "Set minimum height of this object.", "SetMinHeight");
          
AddObjectParam("Baclground", "Baclground object.");
AddComboParamOption("width and height");
AddComboParamOption("heigh only");
AddComboParam("Resize", "Resize mode", 0);
AddAction(11, 0, "Add background", "Background", 
          "{my} add background {0}, resize <i>{1}</i>", 
          "Add background object.", "AddBackground");
            
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [   
    new cr.Property(ept_combo, "Auto resize", "Yes", "Enable to resize object automatically.", "No|Yes"),   
	new cr.Property(ept_float, "Min width", 0, "Minimum text width, in pixels."), 
	new cr.Property(ept_float, "Min height", 0, "Minimum text height, in pixels."),     
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
