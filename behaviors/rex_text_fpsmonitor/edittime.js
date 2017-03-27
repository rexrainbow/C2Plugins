function GetBehaviorSettings()
{
	return {
		"name":			"FPS monitor",
		"id":			"Rex_text_fpsmonitor",
		"description":	"Dump fps infomation.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_text_fpsmonitor.html",
		"category":		"Rex - Text",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParamOption("Toggle");
AddComboParam("Activated", "Enable this behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", "Enable the fps moniter.", "SetActivated");
              
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_combo, "Activated", "Yes", 
                    "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Current fps", "Yes", "Display current fps.", "No|Yes"),   
    new cr.Property(ept_combo, "Minimum fps", "Yes", "Display minimum fps.", "No|Yes"),   
    new cr.Property(ept_combo, "Maximum fps", "Yes", "Display maximum fps.", "No|Yes"),
    new cr.Property(ept_combo, "Average fps", "Yes", "Display average fps.", "No|Yes"),  
	new cr.Property(ept_combo, "CPU", "Yes", "Display current cpu utilization.", "No|Yes"),   
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
