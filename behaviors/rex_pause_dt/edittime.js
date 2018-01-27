function GetBehaviorSettings()
{
	return {
		"name":			"Pause",
		"id":			"Rex_PauseDt",
		"description":	"Pause timescale of this instance",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_pause_dt.html",
		"category":		"General",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On pause", "Event", 
             "On {my} pause", 
             "Triggered when instance paused", "OnPause");
AddCondition(1, cf_trigger, "On resume", "Event", 
             "On {my} resume", 
             "Triggered when instance resumed", "OnResume");
AddCondition(2, 0, "Is pause", "If", 
             "Is {my} pause", 
             "Return true if instance is paused", "IsPause");
AddCondition(3, cf_static | cf_not_invertible, "Pick paused instances", "SOL", 
             "Pick {my} paused instances", 
             "Pick paused instances", "PickPauseInstances");
AddCondition(4, cf_static | cf_not_invertible, "Pick activated instances", "SOL", 
             "Pick {my} activated instances", 
             "Pick activated instances", "PickActivatedInstances");
             
//////////////////////////////////////////////////////////////
// Actions 
AddAction(0, 0, "Toggle pause", "Pause/Resume", 
          "Toggle {my} pause","Toggle pause.", "TooglePause");  
AddComboParamOption("Pause");
AddComboParamOption("Run");
AddComboParam("State", "Set puase state to.",0);
AddAction(1, 0, "Set pause state", "Pause/Resume", 
          "Set {my} pause state to <i>{0}</i>", "Set the puase state.", "SetState");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Previous timescale", "Timescale", "PreTimescale", "Get previous timescale.");


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
