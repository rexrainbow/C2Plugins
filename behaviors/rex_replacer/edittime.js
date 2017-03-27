function GetBehaviorSettings()
{
	return {
		"name":			"Replacer",
		"id":			"Rex_Replacer",
		"description":	"Replace instancne by fade-out itself, and create the target instance then fade-in it.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_replacer.html",
		"category":		"Rex - Movement - opacity",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On fade-out started", "Fade out", "On {my} fade-out started", 
             "Triggered when fade-out started", "OnFadeOutStart");
AddCondition(2, cf_trigger, "On fade-out finished", "Fade out", "On {my} fade-out finished", 
             "Triggered when fade-out finished", "OnFadeOutFinish");
AddCondition(3, cf_trigger, "On fade-in started", "Fade in", "On {my} fade-in started", 
             "Triggered when fade-out started", "OnFadeInStart");
AddCondition(4, cf_trigger, "On fade-in finished", "Fade in", "On {my} fade-in finished", 
             "Triggered when fade-in finished", "OnFadeInFinish");
AddCondition(5, 0, "Is fade-out", "Fade out", "Is {my} fade-out", 
             "Return true if instance is in fade-out stage", "IsFadeOut");
AddCondition(6, 0, "Is fade-in", "Fade in", "Is {my} fade-in", 
             "Return true if instance is in fade-in stage", "IsFadeIn");     
AddCondition(7, 0, "Is idle", "Idle", "Is {my} idle", 
             "Return true if instance is in idle stage", "IsIdle");                       
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Target", "Target type of replacing instance.");
AddAction(1, 0, "Replace instance", "Replace", 
          "{my} Replace to {0}","Replace instance.", "ReplaceInst"); 
AddStringParam("Target", "Target type in nickname of replacing instance.", '""');
AddAction(2, 0, "Replace instance to nickname type", "Replace", 
          "Replace {my} to nickname: <i>{0}</i>","Replace instance to nickname type.", "ReplaceInst");             
AddNumberParam("Duration", "Duration of fade-out or fade in, in seconds.");
AddAction(3, 0, "Set duration", "Configure", "Set {my} fade duration to <i>{0}</i>", "Set the object's fade duration.", "SetDuration");
 
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get UID of replacing instance", "UID", "ReplacingInstUID", 
              "The UID of replacing instanc, return -1 if the replacing does not start.");
AddExpression(2, ef_return_number, "Get UID of replacing instance", "UID", "ReplacingInstUID", 
              "The UID of replacing instanc, return -1 if the replacing does not start.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [   
    new cr.Property(ept_float, "Fade duration", 1, "Duration of fade-out or fade-in, in seconds."), 
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
	// Clamp values
	if (this.properties["Fade duration"] < 0)
		this.properties["Fade duration"] = 0;    
}
