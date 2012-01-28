function GetBehaviorSettings()
{
	return {
		"name":			"SineEx",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"Rex_SinEx",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",
		"description":	"Adjust an object's position, size or angle with an oscillating sine wave.",
		"author":		"Rex.Rainbow",
		"help url":		"",
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

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddComboParamOption("Inactive");
AddComboParamOption("Active");
AddComboParam("State", "Set whether the movement is active or inactive.");
AddAction(0, af_none, "Set active", "", "Set {my} <b>{0}</b>", "Enable or disable the movement.", "SetActive");

AddNumberParam("Period", "The time in seconds for a complete cycle.");
AddAction(1, af_none, "Set period", "", "Set {my} period to <b>{0}</b>", "Set the time in seconds for a complete cycle.", "SetPeriod");

AddNumberParam("Magnitude", "The maximum change in pixels (or degrees for Angle).");
AddAction(2, af_none, "Set magnitude", "", "Set {my} magnitude to <b>{0}</b>", "Set the magnitude of the movement.", "SetMagnitude");

AddComboParamOption("Horizontal");
AddComboParamOption("Vertical");
AddComboParamOption("Size");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParam("Movement", "Select what property of the object to modify.", 0);
AddAction(3, af_none, "Set movement", "", "Set {my} movement to <b>{0}</b>", "Select what property of the object to modify.", "SetMovement");

AddNumberParam("Movement", "0=Horizontal,1=Vertical,2=Size,3=Width,4=Height,5=Angle", 0);
AddAction(4, af_none, "Set movement by number", "", "Set {my} movement to <b>{0}</b>", "Select what property of the object to modify.", "SetMovement");


////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(0, ef_return_number, "Get Cycle Position",	"", "CyclePosition",	"Return the current position in the cycle as a number from 0 to 1.");
AddExpression(1, ef_return_number, "Get period", 			"", "Period",			"Return the current period, in seconds.");
AddExpression(2, ef_return_number, "Get magnitude",			"", "Magnitude",		"Return the current magnitude of the movement.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_combo, 		"Active on start",		"Yes",		"Enable the behavior at the beginning of the layout.", "No|Yes"),
	new cr.Property(ept_combo,		"Movement",				"Horizontal", "Select what property of the object to modify.", "Horizontal|Vertical|Size|Width|Height|Angle"),
	new cr.Property(ept_float,		"Period",				4,			"The time in seconds for a complete cycle."),
	new cr.Property(ept_float,		"Period random",		0,			"Add a random number of seconds to the period, up to this value."),
	new cr.Property(ept_float,		"Period offset",		0,			"The initital time in seconds through the cycle."),
	new cr.Property(ept_float,		"Period offset random",	0,			"Add a random number of seconds to the initial time, up to this value."),
	new cr.Property(ept_float,		"Magnitude",			50,			"The maximum change in pixels (or degrees for Angle)."),
	new cr.Property(ept_float,		"Magnitude random",		0,			"Add a random number to the magnitude, up to this value.")
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
