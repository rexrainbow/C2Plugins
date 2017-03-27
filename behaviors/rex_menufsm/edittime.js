function GetBehaviorSettings()
{
	return {
		"name":			"Menu FSM",
		"id":			"Rex_menufsm",
		"description":	"FSM to control the behavior of menu.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_menufsm.html",
		"category":		"Rex - Logic -finite state machine",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On opening", "Event", "On opening", 
             "Triggered when menu opening", "OnOpening");
AddCondition(2, cf_trigger, "On opened", "Event", "On opened", 
             "Triggered when menu opened", "OnOpened");
AddCondition(3, cf_trigger, "On closing", "Event", "On closing", 
             "Triggered when menu closing", "OnClosing");
AddCondition(4, cf_trigger, "On closed", "Event", "On closed", 
             "Triggered when menu closed", "OnClosed");             
AddCondition(5, 0, "Is opened", "If", "Is opened", 
             "Return true if menu is opened", "IsOpened");
AddCondition(6, 0, "Is closed", "If", "Is closed", 
             "Return true if menu is opened", "IsClosed");
             
//////////////////////////////////////////////////////////////
// Actions 
AddAction(1, 0, "Open", "Open/Close", 
          "Open menu", "Open menu.", "OpenMenu");
AddAction(2, 0, "Close", "Open/Close", 
          "Close menu", "Close menu.", "CloseMenu");   
AddAction(3, 0, "Wait transition event", "Transition", 
          "Wait transition event", "Wait transition event.", "WaitEvnet");  
AddAction(4, 0, "Finish transition event", "Transition", 
          "Finish transition event", "Finish transition event.", "FinishEvnet");
AddAction(5, 0, "Force finish transition event", "Transition", 
          "Force finish transition event", "Force finish transition event.", "ForceFinishEvnet");          
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [    
    new cr.Property(ept_combo, "Initial state", "Off", "Set initial state.", "Off|Opened|Closed"),    
    new cr.Property(ept_combo, "Has transition state", "Yes", "Set yes to have OPENING and CLOSING state.", "No|Yes"),       
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
