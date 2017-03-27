function GetBehaviorSettings()
{
	return {
		"name":			"Drag-Arrowkey2",
		"id":			"Rex_DragArrowkey2",
		"version":		"0.1",        
		"description":	"Get arrow key event from dragging input.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_dragArrowkey2.html",
		"category":		"Rex - Arrow key",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On Up arrow pressed", "Pressd", "On {my} Up arrow pressed", 
             "Triggered when Up arrow is pressed.", "OnUPPressed");
AddCondition(2, cf_trigger, "On Down arrow pressed", "Pressd", "On {my} Down arrow pressed", 
             "Triggered when Down arrow is pressed.", "OnDOWNPressed");
AddCondition(3, cf_trigger, "On Left arrow pressed", "Pressd", "On {my} Left arrow pressed", 
             "Triggered when Left arrow is pressed.", "OnLEFTPressed");
AddCondition(4, cf_trigger, "On Right arrow pressed", "Pressd", "On {my} Right arrow pressed", 
             "Triggered when Right arrow is pressed.", "OnRIGHTPressed");
AddCondition(5, cf_trigger, "On any arrow pressed", "Pressd", "On {my} any arrow pressed", 
             "Triggered when any arrow is pressed.", "OnAnyPressed");

AddCondition(11, 0,	"Up arrow is down",	"Is down", "{my} Up arrow is down", 
             "Return true if Up arrow is currently held down.", "IsUPDown");
AddCondition(12, 0,	"Down arrow is down", "Is down", "{my} Down arrow is down", 
             "Return true if Down arrow is currently held down.", "IsDOWNDown");
AddCondition(13, 0,	"Left arrow is down", "Is down", "{my} Left arrow is down", 
             "Return true if Left arrow is currently held down.", "IsLEFTDown");
AddCondition(14, 0,	"Right arrow is down", "Is down", "{my} Right arrow is down", 
             "Return true if Right arrow is currently held down.", "IsRIGHTDown");
AddCondition(15, 0,	"Any arrow is down",	"Is down", "{my} Any arrow is down", 
             "Return true if Any arrow is currently held down.", "IsAnyDown");
             
AddCondition(21, cf_trigger, "On Up arrow released", "Released", "On {my} Up arrow released", 
             "Triggered when Up arrow is released.", "OnUPReleased");
AddCondition(22, cf_trigger, "On Down arrow released", "Released", "On {my} Down arrow released", 
             "Triggered when Down arrow is released.", "OnDOWNReleased");
AddCondition(23, cf_trigger, "On Left arrow released", "Released", "On {my} Left arrow released", 
             "Triggered when Left arrow is released.", "OnLEFTReleased");
AddCondition(24, cf_trigger, "On Right arrow released", "Released", "On {my} Right arrow released", 
             "Triggered when Right arrow is released.", "OnRIGHTReleased");

AddCondition(31, cf_trigger, "On detecting start", "Detecting", "On {my} detecting start", 
             "Triggered when detecting start.", "OnDetectingStart");
AddCondition(32, cf_trigger, "On detecting end", "Detecting", "On {my} detecting end", 
             "Triggered when detecting end.", "OnDetectingEnd");  
AddCondition(33, 0,	"Is in detecting", "Detecting", "{my} In detecting", 
             "Return true if is in detecting.", "IsInDetecting"); 
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Enable", "Enable to drag this miniboard.",1);
AddAction(1, 0, "Set enable", "Drag & Drop", 
          "Set {my} drag-able to <i>{0}</i>", 
          "Set drag-able.", "SetDragAble");
          
AddAction(2, 0, "Cancel", "Detector", 
          "Cancel current dragging", 
          "Cancel current dragging like touch end.", "Cancel");                       
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Position X of origin point", "Origin", "OX", "Position X of origin point.");
AddExpression(2, ef_return_number, "Position Y of origin point", "Origin", "OY", "Position Y of origin point.");
AddExpression(3, ef_return_number, "Distance of dragging at X coordinate", "Distance", "DistX", "Distance of dragging at X coordinate.");
AddExpression(4, ef_return_number, "Distance of dragging at Y coordinate", "Distance", "DistY", "Distance of dragging at Y coordinate.");
AddExpression(5, ef_return_number, "Position X of current point", "Current", "CurrX", "Position X of current point.");
AddExpression(6, ef_return_number, "Position Y of current point", "Current", "CurrY", "Position Y of current point.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Directions", "8 directions", "The number of directions of movement available.", "Up & down|Left & right|4 directions|8 directions"),
    new cr.Property(ept_float, "Sensitivity", 10, "Sensitivity of touch movment, in pixel."), 
    new cr.Property(ept_combo, "Reset origin", "No", 'Reset origin when pressing changing. Set "No" for virtual joystick.', "No|Yes"),    
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
