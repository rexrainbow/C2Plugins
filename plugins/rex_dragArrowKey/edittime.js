function GetPluginSettings()
{
	return {
		"name":			"Dragging to ArrowKey",
		"id":			"Rex_ArrowKey",
		"version":		"0.1",   		
		"description":	"Get arrow key event from dragging input.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_dragArrowKey.html",
		"category":		"Rex - Arrow key",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On Up arrow pressed", "Pressd", "On Up arrow pressed", 
             "Triggered when Up arrow is pressed.", "OnUPPressed");
AddCondition(2, cf_trigger, "On Down arrow pressed", "Pressd", "On Down arrow pressed", 
             "Triggered when Down arrow is pressed.", "OnDOWNPressed");
AddCondition(3, cf_trigger, "On Left arrow pressed", "Pressd", "On Left arrow pressed", 
             "Triggered when Left arrow is pressed.", "OnLEFTPressed");
AddCondition(4, cf_trigger, "On Right arrow pressed", "Pressd", "On Right arrow pressed", 
             "Triggered when Right arrow is pressed.", "OnRIGHTPressed");
AddCondition(5, cf_trigger, "On any arrow pressed", "Pressd", "On any arrow pressed", 
             "Triggered when any arrow is pressed.", "OnAnyPressed");

AddCondition(11, 0,	"Up arrow is down",	"Is down", "Up arrow is down", 
             "Return true if Up arrow is currently held down.", "IsUPDown");
AddCondition(12, 0,	"Down arrow is down", "Is down", "Down arrow is down", 
             "Return true if Down arrow is currently held down.", "IsDOWNDown");
AddCondition(13, 0,	"Left arrow is down", "Is down", "Left arrow is down", 
             "Return true if Left arrow is currently held down.", "IsLEFTDown");
AddCondition(14, 0,	"Right arrow is down", "Is down", "Right arrow is down", 
             "Return true if Right arrow is currently held down.", "IsRIGHTDown");
AddCondition(15, 0,	"Any arrow is down",	"Is down", "Any arrow is down", 
             "Return true if Any arrow is currently held down.", "IsAnyDown");
             
AddCondition(21, cf_trigger, "On Up arrow released", "Released", "On Up arrow released", 
             "Triggered when Up arrow is released.", "OnUPReleased");
AddCondition(22, cf_trigger, "On Down arrow released", "Released", "On Down arrow released", 
             "Triggered when Down arrow is released.", "OnDOWNReleased");
AddCondition(23, cf_trigger, "On Left arrow released", "Released", "On Left arrow released", 
             "Triggered when Left arrow is released.", "OnLEFTReleased");
AddCondition(24, cf_trigger, "On Right arrow released", "Released", "On Right arrow released", 
             "Triggered when Right arrow is released.", "OnRIGHTReleased");

AddCondition(31, cf_trigger, "On detecting start", "Detecting", "On detecting start", 
             "Triggered when detecting start.", "OnDetectingStart");
AddCondition(32, cf_trigger, "On detecting end", "Detecting", "On detecting end", 
             "Triggered when detecting end.", "OnDetectingEnd");  
AddCondition(33, 0,	"Is in detecting", "Detecting", "In detecting", 
             "Return true if is in detecting.", "IsInDetecting");                        
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Cancel", "Detector", 
          "Cancel current dragging", 
          "Cancel current dragging like touch end.", "Cancel");  
          
AddLayerParam("Layer", "Layer name of number.");
AddAction(11, 0, "Set touched layer", "Touched layer", 
          "Set touched layer to <i>{0}</i>", 
          "Set touched layer.", "SetTouchedLayer");   
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
    new cr.Property(ept_combo, "Directions", "8 directions", "The number of directions of movement available.", "Up & down|Left & right|4 directions|8 directions"),
    new cr.Property(ept_float, "Sensitivity", 50, "Sensitivity of touch movment, in pixel."),    
    new cr.Property(ept_combo, "Reset origin", "No", 'Reset origin when pressing changing. Set "No" for virtual joystick.', "No|Yes"),    
    new cr.Property(ept_text, "Touched layer", "0", "Touched layer name of number."),        
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
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
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
	if (this.properties["Sensitivity"] < 0)
		this.properties["Sensitivity"] = 1;
		
}
