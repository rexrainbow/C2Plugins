function GetBehaviorSettings()
{
	return {
		"name":			"Pathfinding",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"Rex_Pathfinding",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"0.1",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Modify from official path finding behavior to support square or hex grid.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_pathfinding.html",
		"category":		"Movements",			// Prefer to re-use existing categories, but you can set anything here
		"dependency":	"rex_pathfind_mod.js",
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
							
AddCondition(0, cf_trigger, "On path found", "", "On {my} path found", "Triggered after 'Find path' when a path successfully found.", "OnPathFound");
AddCondition(1, cf_trigger, "On failed to find path", "", "On {my} failed to find path", "Triggered after 'Find path' when no path could be found.", "OnFailedToFindPath");

AddNumberParam("Cell X", "The horizontal cell to test if an obstacle (in cells, rather than layout co-ordinates).");
AddNumberParam("Cell Y", "The vertical cell to test if an obstacle (in cells, rather than layout co-ordinates).");
AddCondition(2, cf_none, "Is cell obstacle", "", "Is {my} cell ({0}, {1}) obstacle", "Test if a cell in the pathfinding map is marked as an obstacle.", "IsCellObstacle");

AddCondition(3, cf_none, "Is calculating path", "", "Is {my} calculating path", "True if the object is currently searching for a path.", "IsCalculatingPath");

AddCondition(4, cf_none, "Is moving along path", "", "Is {my} moving along path", "True if the object is currently moving along a found path.", "IsMoving");

AddCondition(5, cf_trigger, "On arrived", "", "On {my} arrived", "Triggered when moving along path and arrived at destination.", "OnArrived");

AddCmpParam("Comparison", "How to compare the current movement speed.");
AddNumberParam("Speed", "The speed to compare to, in pixels per second.");
AddCondition(6, cf_none, "Compare speed", "", "{my} speed {0} <b>{1}</b>", "Compare the current movement speed of the object.", "CompareSpeed");

AddCondition(7, cf_none, "Diagonals are enabled", "", "Diagonals are enabled", "True if diagonal movement across cells is currently enabled.", "DiagonalsEnabled");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddNumberParam("X", "The X co-ordinate to find a path to.");
AddNumberParam("Y", "The Y co-ordinate to find a path to.");
AddAction(0, af_none, "Find path", "", "Find path to (<i>{0}</i>, <i>{1}</i>)", "Start looking for a path to a destination, later triggering 'On path found' or 'On failed to find path'.", "FindPath");

AddAction(1, af_none, "Move along path", "Movement", "Move along path", "Start moving along a found path after the 'On path found' trigger.", "StartMoving");

AddAction(2, af_none, "Stop", "Movement", "Stop", "Stop moving along a path.", "Stop");

AddComboParamOption("disabled");
AddComboParamOption("enabled");
AddComboParam("Set", "Whether to enable or disable the behavior.");
AddAction(3, af_none, "Set enabled", "", "Set {my} {0}", "Enable or disable the behavior.", "SetEnabled");

AddAction(4, af_none, "Regenerate obstacle map", "", "Regenerate {my} obstacle map", "(Slow) Check every cell to determine if it is an obstacle again, in case obstacles have moved or changed. Completes next tick.", "RegenerateMap");

AddObjectParam("Obstacle", "Choose a family or object to use as obstacles in the pathfinding map.");
AddAction(5, af_none, "Add obstacle", "", "Add {my} obstacle {0}", "When using custom obstacles, add a family or object as an obstacle.", "AddObstacle");

AddAction(6, af_none, "Clear obstacles", "", "Clear {my} obstacles", "Clear the added custom obstacles.", "ClearObstacles");

AddNumberParam("Speed", "The maximum speed to set, in pixels per second.");
AddAction(7, af_none, "Set max speed", "Movement", "Set {my} maximum speed to <i>{0}</i>", "Set the maximum speed for moving along paths.", "SetMaxSpeed");

AddNumberParam("Acceleration", "The acceleration to set, in pixels per second per second.");
AddAction(8, af_none, "Set acceleration", "Movement", "Set {my} acceleration to <i>{0}</i>", "Set the acceleration for moving along paths.", "SetAcc");

AddNumberParam("Deceleration", "The deceleration to set, in pixels per second per second.");
AddAction(9, af_none, "Set deceleration", "Movement", "Set {my} deceleration to <i>{0}</i>", "Set the deceleration for moving along paths.", "SetDec");

AddNumberParam("Rotate speed", "The turn speed to set, in degrees per second.");
AddAction(10, af_none, "Set rotate speed", "Movement", "Set {my} rotate speed to <i>{0}</i> degrees per second", "Set the turn speed for moving along paths.", "SetRotateSpeed");

AddObjectParam("Object", "Choose an object to increase pathfinding cost.");
AddNumberParam("Cost", "The additional cost to travel over this object. Note normal costs are 10 and 14 for horizontal/diagonal movement respectively.", "50");
AddAction(11, af_none, "Add path cost", "", "Add {my} object {0} with path cost <i>{1}</i>", "Increase the path cost for travelling over an object (e.g. to simulate rough terrain).", "AddCost");

AddAction(12, af_none, "Clear cost", "", "Clear {my} additional path costs", "Clear any additional path cost that was previously added.", "ClearCost");

AddComboParamOption("disabled");
AddComboParamOption("enabled");
AddComboParam("Diagonals", "Whether to enable or disable diagonal movement across cells.");
AddAction(13, af_none, "Set diagonals enabled", "Movement", "Set {my} diagonals {0}", "Enable or disable diagonal movement across cells.", "SetDiagonalsEnabled");

AddNumberParam("Speed", "The speed to set, in pixels per second.");
AddAction(14, af_none, "Set speed", "Movement", "Set {my} speed to <i>{0}</i>", "Set the current speed for moving along paths.", "SetSpeed");

AddNumberParam("Start X", "Start X co-ordinate in layout of rectangle to regenerate.");
AddNumberParam("Start Y", "Start Y co-ordinate in layout of rectangle to regenerate.");
AddNumberParam("End X", "End X co-ordinate in layout of rectangle to regenerate.");
AddNumberParam("End Y", "End Y co-ordinate in layout of rectangle to regenerate.");
AddAction(15, af_none, "Regenerate region", "", "Regenerate {my} obstacle map from (<i>{0}</i>, <i>{1}</i>) to (<i>{2}</i>, <i>{3}</i>)", "Regenerate just a rectangular portion of the obstacle map in layout co-ordinates. Completes next tick.", "RegenerateRegion");

AddObjectParam("Object", "An object whose bounding box will determine a rectangular portion of the obstacle map to regenerate.");
AddAction(16, af_none, "Regenerate region around object", "", "Regenerate {my} obstacle map around {0}", "Regenerate just a rectangular portion of the obstacle map from an object's bounding box. Completes next tick.", "RegenerateObjectRegion");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(0, ef_return_number, "", "Path", "NodeCount", "The number of nodes along a found path.");

AddNumberParam("Index", "Zero-based index of node in path.");
AddExpression(1, ef_return_number, "", "Path", "NodeXAt", "The X co-ordinate of a node at an index.");

AddNumberParam("Index", "Zero-based index of node in path.");
AddExpression(2, ef_return_number, "", "Path", "NodeYAt", "The Y co-ordinate of a node at an index.");

AddExpression(3, ef_return_number, "", "Settings", "CellSize", "The current cell size property.");

// rabbit rabbit rabbit
AddExpression(4, ef_return_number | ef_deprecated, "", "Rabbit", "RabbitX", "The current rabbit X.");
AddExpression(5, ef_return_number | ef_deprecated, "", "Rabbit", "RabbitY", "The current rabbit Y.");
// rabbit

AddExpression(6, ef_return_number, "", "Settings", "MaxSpeed", "The current maximum speed in pixels per second.");
AddExpression(7, ef_return_number, "", "Settings", "Acceleration", "The current acceleration in pixels per second per second.");
AddExpression(8, ef_return_number, "", "Settings", "Deceleration", "The current deceleration in pixels per second per second.");
AddExpression(9, ef_return_number, "", "Settings", "RotateSpeed", "The current maximum turn speed in degrees per second.");

AddExpression(10, ef_return_number, "", "Path", "MovingAngle", "The current angle of motion along a path, in degrees.");

AddExpression(11, ef_return_number, "", "Path", "CurrentNode", "The current zero-based node index moving towards.");

AddExpression(12, ef_return_number, "", "Path", "Speed", "The current speed in pixels per second while moving.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	//new cr.Property(ept_integer, 	"Cell size",		30,		"The size of cells for pathfinding. Smaller sizes will use more CPU."),
	new cr.Property(ept_integer, 	"Cell border",		-1,		"Additional size to detect obstacles. Prevents paths very close to obstacles."),
	new cr.Property(ept_combo, 		"Obstacles",		"Solids",	"Use either solids or custom objects as obstacles.", "Solids|Custom"),
	new cr.Property(ept_float, 		"Max speed",		200,	"For movement, the maximum speed in pixels per second."),
	new cr.Property(ept_float, 		"Acceleration",		1000,	"For movement, the acceleration in pixels per second per second."),
	new cr.Property(ept_float, 		"Deceleration",		2000,	"For movement, the deceleration in pixels per second per second."),
	new cr.Property(ept_float, 		"Rotate speed",		135,	"For movement, the maximum turn speed in degrees per second."),
	new cr.Property(ept_combo, 		"Rotate object",	"Yes",	"For movement, whether to change the object's angle.", "No|Yes"),
	new cr.Property(ept_combo, 		"Diagonals",	"Enabled",	"Whether paths are allowed to use diagonal directions.", "Disabled|Enabled"),
	new cr.Property(ept_combo, "Initial state", "Enabled", "Whether to initially have the behavior enabled or disabled.", "Disabled|Enabled")
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
