function GetBehaviorSettings()
{
	return {
		"name":			"EaseTween Mod",		// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"rex_lunarray_Tween_mod",		// this is used to identify this behavior and is saved to the project; never change it
		"version":		"0.1",
		"description":	"Tween an object's position, size, angle or other properties using an easing function.",
		"author":		"Yeremia AI (lunarray)",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_lunarray_tween_mod.html",
		"category":		"Movements",			// Prefer to re-use existing categories, but you can set anything here
		"flags":		0						// uncomment lines to enable flags...
					//	| bf_onlyone			// can only be added once to an object, e.g. solid
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>, and {my} for the current behavior icon & name
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name

AddCondition(0, 0, "Is active", "", "Is {my} active", "True if the movement is currently active.", "IsActive");

AddCmpParam("Comparison", "Select how to compare the tweening progress.");
AddNumberParam("Value", "Value to compare the progress to.");
AddCondition(1, 0, "Compare progress", "", "{my} progress {0} {1}", "Compare the current progress of the tween process.", "CompareProgress");

AddCondition(2,	cf_trigger, "On start", "", "On {my} start", "Triggered when tween starts.", "OnStart");                 
AddCondition(3,	cf_trigger, "On wait end", "", "On {my} wait ends", "Triggered when tween finished initial wait and is starting.", "OnWaitEnd");
AddCondition(4,	cf_trigger, "On tween end", "", "On {my} tween end", "Triggered when the tween finished and is entering cooldown state.", "OnEnd");
AddCondition(5,	cf_trigger, "On cooldown end", "", "On {my} cooldown end", "Triggered when tween end playing and is cooldown.", "OnCooldownEnd");

AddCmpParam("Comparison", "Select how to compare the group tweening progress.");
AddNumberParam("Value", "Value to compare the progress to.");
AddCondition(6, 0, "Compare group progress", "", "{my} group progress at least {0} {1}", "Compare the slowest in tween group progress to a value .", "CompareGroupProgress");

AddCondition(30, cf_trigger, "On count end", "Finish", "On {my} count end", "Triggered when the tween counting finished and is entering cooldown state.", "OnCountEnd");
////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

//AddComboParamOption("Inactive");
//AddComboParamOption("Active");
//AddComboParam("State", "Set whether the movement is active or inactive.");
//AddAction(0, af_none, "Set active", "Parameter", "Set {my} <b>{0}</b>", "Enable or disable the movement.", "SetActive");

AddNumberParam("Duration", "The time in seconds for the duration of the tween.");
AddAction(1, af_none, "Set duration", "Parameter", "Set {my} duration to <b>{0}</b>", "Set the time in seconds for the duration of the tween.", "SetDuration");

AddStringParam("Wait", "The time in seconds to wait before and after tweening.");
AddAction(2, af_none, "Set wait", "Parameter", "Set {my} wait to <b>{0}</b>", "Set the time in seconds to wait before and after tweening.", "SetWait");

AddStringParam("Initial", "Initial value of position, angle, or whatever to tween from (for position it is x,y).");
AddAction(4, af_none, "Set initial", "Parameter", "Set {my} initial to <b>{0}</b>", "Set the initial value of the tween.", "SetInitial");

AddStringParam("Target", "Target value of position, angle, or whatever to tween to (for position it is x,y).");
AddAction(5, af_none, "Set target", "Parameter", "Set {my} target to <b>{0}</b>", "Set the target value of the tween.", "SetTarget");

AddNumberParam("Value", "Set the tweened value for value tweening");
AddAction(6, af_none, "Set value", "Parameter", "Set {my} value to <b>{0}</b>", "Set the current/initial value of a value tweening.", "SetValue");

AddComboParamOption("Position");
AddComboParamOption("Size (Ratio)");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value");
AddComboParamOption("Size (Pixel)");
AddComboParam("Tweened property", "Select the tweened property to.");
AddAction(7, af_none, "Set tweened property", "Parameter", "Set {my} tweened property to <b>{0}</b>", "Set the type of tweened property.", "SetTweenedProperty");

AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParamOption("EaseInSmoothstep");
AddComboParamOption("EaseOutSmoothstep");
AddComboParamOption("EaseInOutSmoothstep");
AddComboParam("Function", "Select the easing function to apply.");
AddAction(8, af_none, "Set easing", "Parameter", "Set {my} easing function to <b>{0}</b>", "Set the easing function used to calculate movement.", "SetEasing");

AddAction(10, af_none, "Start", "Playback control", "Start {my}", "Start the tween.", "Start");

AddComboParamOption("Reverse");
AddComboParamOption("Rewind");
AddComboParam("Reverse Mode", "Set the reverse mode.");
AddAction(11, af_none, "Reverse", "Playback control", "<b>{0}</b> {my}", "Reverse the tween.", "Reverse");

AddAction(12, af_none, "Pause", "Playback control", "Pause {my}", "Pause the tween. (Same as set active false)", "Pause");

AddAction(13, af_none, "Resume", "Playback control", "Resume {my}", "Resume the tween. (Same as set active true)", "Resume");

AddComboParamOption("Stop at tween target");
AddComboParamOption("Stop at current position");
AddComboParamOption("Stop at tween start");
AddComboParam("Stop Mode", "Set wether to stop at the beginning, current position or tween target.");
AddAction(14, af_none, "Stop", "Playback control", "<b>{0}</b> {my}", "Stop the tween.", "Stop");

AddComboParamOption("Play Once");
AddComboParamOption("Repeat");
AddComboParamOption("Ping Pong");
AddComboParamOption("Play once and destroy");
AddComboParamOption("Loop");
AddComboParamOption("Ping Pong Stop");
AddComboParamOption("Play and Stop");
AddComboParam("Playback Mode", "Set the playback mode of the tween.");
AddAction(16, af_none, "Playback Mode", "Parameter", "Set the playback mode of {my} to <b>{0}</b>", "Setting playback mode of the tween.", "SetPlayback");

AddNumberParam("Initial X", "The initial X of the tween");
AddAction(17, af_none, "Set initial X", "Parameter", "Set {my} initial x to <b>{0}</b>", "Set the initial x for the tween.", "SetInitialX");

AddNumberParam("Initial Y", "The initial Y of the tween");
AddAction(18, af_none, "Set initial Y", "Parameter", "Set {my} initial y to <b>{0}</b>", "Set the initial y for the tween.", "SetInitialY");

AddNumberParam("Target X", "The target X of the tween");
AddAction(19, af_none, "Set target X", "Parameter", "Set {my} target x to <b>{0}</b>", "Set the target x for the tween.", "SetTargetX");

AddNumberParam("Target Y", "The target Y of the tween");
AddAction(20, af_none, "Set target Y", "Parameter", "Set {my} target y to <b>{0}</b>", "Set the target y for the tween.", "SetTargetY");

AddComboParamOption("Start");
AddComboParamOption("Force Start");
AddComboParam("Force Mode", "Set wether to force start or not.");
AddStringParam("Group", "Group to start, set to empty for all group in SOL");
AddAction(21, af_none, "Group Start", "Group", "<b>{0}</b> group <b>{1}</b> in {my}", "Start the group tween.", "StartGroup");

AddComboParamOption("Stop at tween target");
AddComboParamOption("Stop at current position");
AddComboParamOption("Stop at tween start");
AddComboParam("Stop Mode", "Set wether to stop at the beginning, current position or tween target.");
AddStringParam("Group", "Group to stop, set to empty for all group in all selected objects");
AddAction(22, af_none, "Group Stop", "Group", "<b>{0}</b> for group <b>{1}</b> in {my}", "Stop the group tween.", "StopGroup");

AddComboParamOption("Reverse");
AddComboParamOption("Force Reverse");
AddComboParam("Force Mode", "Set wether to force start or not.");
AddComboParamOption("Reverse");
AddComboParamOption("Rewind");
AddComboParam("Reverse Mode", "Set the reverse mode.");
AddStringParam("Group", "Group to reverse, set to empty for all group in SOL");
AddAction(23, af_none, "Group Reverse", "Group", "<b>{0} ({1})</b> group <b>{2}</b> in {my}", "Reverse the group tween.", "ReverseGroup");

AddAction(24, af_none, "Force Start", "Playback control", "Force start {my}", "Force start the tween.", "Force");
AddAction(25, af_none, "Force Reverse", "Playback control", "Force reverse {my}", "Force reverse the tween.", "ForceReverse");

AddComboParamOption("Position");
AddComboParamOption("Size (Ratio)");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value");
AddComboParamOption("Size (Pixel)");
AddComboParam("Tweened property", "Select the tweened property to.");
AddComboParamOption("Play Once");
AddComboParamOption("Repeat");
AddComboParamOption("Ping Pong");
AddComboParamOption("Play once and destroy");
AddComboParamOption("Loop");
AddComboParamOption("Ping Pong Stop");
AddComboParamOption("Play and Stop");
AddComboParam("Playback Mode", "Set the playback mode of the tween.");
AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParamOption("EaseInSmoothstep");
AddComboParamOption("EaseOutSmoothstep");
AddComboParamOption("EaseInOutSmoothstep");
AddComboParam("Function", "Select the easing function to apply.");
AddStringParam("Initial", "Initial value of position, angle, or whatever to tween from (for position it is x,y).");
AddStringParam("Target", "Target value of position, angle, or whatever to tween to (for position it is x,y).");
AddNumberParam("Duration", "The time in seconds for the duration of the tween.");
AddStringParam("Wait", "The time in seconds to wait before and after tweening.");
AddComboParamOption("Absolute");
AddComboParamOption("Relative");
AddComboParam("Mode", "Select the coordinate mode.");
AddAction(26, af_none, "Parameter set", "Parameter", 
          "Set {my}: tweened property to <b>{0}</b>, playback mode to <b>{1}</b>, easing function to <b>{2}</b>, value from <b>{3}</b> to <b>{4}</b>, duration to <b>{5}</b>, wait to <b>{6}</b>, coordinate mode to <b>{7}</b>", 
          "Set all parameter at once.", "SetParameter");

AddObjectParam("Set target object", "Choose the object to follow as target to.");
AddAction(27, af_none, "Set target object", "Parameter", "Set {my} target object to {0}", "Set the target object of the tween.", "SetTargetObject");

AddNumberParam("Repeat count", "Repeat count, 0 is continue.", 0);
AddAction(28, af_none, "Set repeat count", "Parameter", "Set {my} repeat count to <b>{0}</b>", "Set repeat count of the tween.", "SetRepeatCount");

// -----
AddStringParam("Alias", "Alias of easing function.");
AddComboParamOption("Linear");
AddComboParamOption("EaseInQuad");
AddComboParamOption("EaseOutQuad");
AddComboParamOption("EaseInOutQuad");
AddComboParamOption("EaseInCubic");
AddComboParamOption("EaseOutCubic");
AddComboParamOption("EaseInOutCubic");
AddComboParamOption("EaseInQuart");
AddComboParamOption("EaseOutQuart");
AddComboParamOption("EaseInOutQuart");
AddComboParamOption("EaseInQuint");
AddComboParamOption("EaseOutQuint");
AddComboParamOption("EaseInOutQuint");
AddComboParamOption("EaseInCircle");
AddComboParamOption("EaseOutCircle");
AddComboParamOption("EaseInOutCircle");
AddComboParamOption("EaseInBack");
AddComboParamOption("EaseOutBack");
AddComboParamOption("EaseInOutBack");
AddComboParamOption("EaseInElastic");
AddComboParamOption("EaseOutElastic");
AddComboParamOption("EaseInOutElastic");
AddComboParamOption("EaseInBounce");
AddComboParamOption("EaseOutBounce");
AddComboParamOption("EaseInOutBounce");
AddComboParamOption("EaseInSmoothstep");
AddComboParamOption("EaseOutSmoothstep");
AddComboParamOption("EaseInOutSmoothstep");
AddComboParam("Function", "Select the easing function to apply.");
AddAction(50, af_none, "Set alias of easing function", "Alias", "Set alias <b>{0}</b> to easing function <b>{1}</b>", "Set the alias of easing function.", "SetEasingAlias");


AddComboParamOption("Position");
AddComboParamOption("Size (Ratio)");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value");
AddComboParamOption("Size (Pixel)");
AddComboParam("Tweened property", "Select the tweened property to.");
AddComboParamOption("Play Once");
AddComboParamOption("Repeat");
AddComboParamOption("Ping Pong");
AddComboParamOption("Play once and destroy");
AddComboParamOption("Loop");
AddComboParamOption("Ping Pong Stop");
AddComboParamOption("Play and Stop");
AddComboParam("Playback Mode", "Set the playback mode of the tween.");
AddStringParam("Function", "The easing function to apply by alias.");
AddStringParam("Initial", "Initial value of position, angle, or whatever to tween from (for position it is x,y).");
AddStringParam("Target", "Target value of position, angle, or whatever to tween to (for position it is x,y).");
AddNumberParam("Duration", "The time in seconds for the duration of the tween.");
AddStringParam("Wait", "The time in seconds to wait before and after tweening.");
AddComboParamOption("Absolute");
AddComboParamOption("Relative");
AddComboParam("Mode", "Select the coordinate mode.");
AddAction(51, af_none, "Parameter set", "Alias", 
          "Set {my}: tweened property to <b>{0}</b>, playback mode to <b>{1}</b>, easing function to <b>{2}</b>, value from <b>{3}</b> to <b>{4}</b>, duration to <b>{5}</b>, wait to <b>{6}</b>, coordinate mode to <b>{7}</b>", 
          "Set all parameter at once.", "SetParameter");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel
//new cr.Property(ept_text,		"Initial",				"current",		"Initialize to position, angle, size, etc. Set to 'current' to use current object position, angle, etc."),

AddExpression(0, ef_return_number, "Get progress",				"", "Progress",			"Return the current progress of the tween as a number from 0 to 1.");
AddExpression(1, ef_return_number, "Get progress in duration",	"", "ProgressTime",		"Return the current tween progress in secs.");
AddExpression(3, ef_return_string, "Get tween target",			"", "Target",			"Return the tween target value.");
AddExpression(4, ef_return_number, "Get initiating",			"", "Initiating",		"Return the tween initiating wait.");
AddExpression(7, ef_return_number, "Get duration",				"", "Duration",			"Return the tween duration.");
AddExpression(8, ef_return_number, "Get cooldown",				"", "Cooldown",			"Return the tween cooldown wait.");
AddExpression(9, ef_return_number, "Get value",					"", "Value",			"Return the tweened value.");
AddExpression(10, ef_return_number, "Get isPaused",				"", "isPaused",			"Return the tween status, is paused or not.");
AddExpression(11, ef_return_string, "Get group",				"", "Group",			"Return the tween group name.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_combo, 		"Active on start",		"Yes",			"Enable the behavior at the beginning of the layout.", "No|Yes"),
	new cr.Property(ept_combo,		"Tweened Property",		"Position", 	"Select what property of the object to modify.", 
	                "Position|Size(Ratio)|Width|Height|Angle|Opacity|Value|Size(Pixel)"),
	new cr.Property(ept_combo,		"Function",				"EaseOutBounce","Select the kind of easing function used to calculate the movement.", 
	                "Linear|EaseInQuad|EaseOutQuad|EaseInOutQuad|EaseInCubic|EaseOutCubic|EaseInOutCubic|EaseInQuart|EaseOutQuart|EaseInOutQuart|EaseInQuint|EaseOutQuint|EaseInOutQuint|EaseInCircle|EaseOutCircle|EaseInOutCircle|EaseInBack|EaseOutBack|EaseInOutBack|EaseInElastic|EaseOutElastic|EaseInOutElastic|EaseInBounce|EaseOutBounce|EaseInOutBounce|EaseInSmoothstep|EaseOutSmoothstep|EaseInOutSmoothstep"),
	new cr.Property(ept_text,		"Initial",				"current",		"Initial position of the tweened object, 'current' will use current object position, angle, size, etc."),
	new cr.Property(ept_text,		"Target",				"100, 100",		"Tween target relative to current position, angle, size, etc"),
	new cr.Property(ept_float,		"Duration",				2.5,			"Duration of tween in seconds."),
	new cr.Property(ept_text,		"Wait",					"0,0",			"Wait period before doing tween"),
	new cr.Property(ept_combo, 		"Playback Mode",		"Play Once",	"Control the playback of the tween after finish", 
	                "Play Once|Repeat|Ping Pong|Play once and destroy|Loop|Ping Pong Stop|Play and stop"),
	new cr.Property(ept_float,		"Value",				0,				"If you are tweening value, then this will help you set the initial value"),
	new cr.Property(ept_combo,		"Coordinate Mode",		"Relative", 	"Absolute or relative coordinate", "Absolute|Relative"),
	new cr.Property(ept_combo, 		"Force Initial on start",		"No",	"Set the initial to target's property on the beginning of the layout.", "No|Yes"),
	new cr.Property(ept_text, 		"Tween group",			"",				"Set the tween group name. Object with same tween family group progress is shared and can be manipulated using group actions."),
	new cr.Property(ept_integer,	"Repeat count",			0,				"Repeat count, 0 is continue."),
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
