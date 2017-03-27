function GetBehaviorSettings()
{
	return {
		"name":			"Animation loader",
		"id":			"Rex_animation_loader",
		"version":		"0.1",
		"description":	"Load animations from URL.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_animation_loader.html",
		"category":		"Rex - Animations",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get URL", "URL", "{my} on get URL", 
             'Triggered when request a URL for loading a frame. Get animation name and frame index by "expression:AnimationName", "expression:FrameIndex"', 
             "OnGetURL");             
AddCondition(2, cf_trigger, "On all animations loaded", "Loaded", "{my} on all animations loaded", 
             "Triggered when all animations loaded.", 
             "OnAllAnimationLoaded");
AddCondition(3, cf_trigger, "On frame loaded successful", "Loaded", "{my} on frame loaded successful", 
             'Triggered when a frame is loaded successful. Get animation name and frame index by "expression:AnimationName", "expression:FrameIndex"', 
             "OnFrameLoaded"); 
AddCondition(4, cf_trigger, "On frame loaded failed", "Loaded", "{my} on frame loaded failed", 
             'Triggered when a frame is loaded failed. Get animation name and frame index by "expression:AnimationName", "expression:FrameIndex"', 
             "OnFrameLoadedFailed");                          
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("URL", "URL of loaded frame.", '""');
AddAction(1, 0, "Set URL", "URL", "{my} set URL to <i>{0}</i>", 'Set requested URL. Call this action under "Condition: On get URL"', "SetURL");
AddComboParamOption("Resize to image size");
AddComboParamOption("Keep current size");
AddComboParam("Size", "Whether to resize the sprite to the size of the loaded image, or stretch it to the current size.");
AddAction(2, 0, "Load all animations", "Animation", "{my} load all animations ({0})", "Load all anmations from URL.", "LoadAllAnimations");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Request animation name", 
              "URL", "AnimationName", 
              'Get request animation name. Use this expression under "Condition: On get URL"');
AddExpression(2, ef_return_number, "Request frame index", 
              "URL", "FrameIndex", 
              'Get request frame index. Use this expression under "Condition: On get URL"');
AddExpression(3, ef_return_string, "URL of loaded frame", 
              "Loaded", "FrameURL", 
              'Get requested url. Use this expression under "Condition: On frame loaded", or "Condition: On frame loaded failed".');
                   
ACESDone();

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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
