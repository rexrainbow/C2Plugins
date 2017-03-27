function GetBehaviorSettings()
{
	return {
		"name":			"Full window",
		"id":			"Rex_htmlElem_fullwindow",
		"description":	"Set full window of html element.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_htmlelem_fullwindow.html",
		"category":		"Rex - Iframe",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_none, "Is full window", "Full window", "Is full window", 
             "True if video is in full window.", "IsFullWindow"); 
             
AddCondition(2, cf_none, "Is full screen", "Full screen", "Is full screen", 
             "True if video is in full screen mode.", "IsFullScreen");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Exit");
AddComboParamOption("Enter");
AddComboParamOption("Toggle");
AddComboParam("Command", "Enter or exit, or toggle fullscreen mode.", 1);
AddAction(1, af_none, "Full window", "Size", 
          "<i>{0}</i> full window", 
          "Enter or exit full window.", "SetFullWindow");       
          
AddComboParamOption("Exit");
AddComboParamOption("Enter");
AddComboParamOption("Toggle");
AddComboParam("Command", "Enter or exit, or toggle fullscreen mode.", 1);
AddAction(2, af_none, "Set full screen mode", "Full screen", 
          "<i>{0}</i> full screen", 
          'Enter or exit full screen mode. "Enter full screen" can only be called under a user input.', "SetFullScreen");   

//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [      
	new cr.Property(ept_combo, "Full window", "Yes", "Enable if you wish full window at the start of the layout.", "No|Yes"),        
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
