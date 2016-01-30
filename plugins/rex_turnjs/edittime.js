function GetPluginSettings()
{
	return {
		"name":			"Flip book",
		"id":			"Rex_turnjs",
		"version":		"0.1",
		"description":	"Flip book made by turn.js(http://www.turnjs.com).",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_turnjs.html",
		"category":		"Form controls",
		"type":			"world",			// appears in layout
		"rotatable":	false,
		"flags":		pf_position_aces | pf_size_aces,
		"dependency":	"turn.js"
	};
};


////////////////////////////////////////
// Conditions
		
////////////////////////////////////////
// Actions
AddStringParam("HTML", "The HTML / content to set in the Div.");
AddAction(1, 0, "Add div with inner html", "Add page", 
          "Add div with inner html to <i>{0}</i>", 
          "Add div with inner html.", "AddDIVHTML");
////////////////////////////////////////
// Expressions
ACESDone();

// Property grid properties for this plugin
var property_list = [
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
	return new IDEInstance(instance);
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
		
	// Plugin-specific variables
	this.just_inserted = false;
	this.font = null;
}

IDEInstance.prototype.OnCreate = function()
{
	this.instance.SetHotspot(new cr.vector2(0, 0));
}

IDEInstance.prototype.OnInserted = function()
{
	this.instance.SetSize(new cr.vector2(150, 22));
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
	renderer.SetTexture(null);
	var quad = this.instance.GetBoundingQuad();
	renderer.Fill(quad, cr.RGB(255, 255, 255));
	renderer.Outline(quad, cr.RGB(0, 0, 0));
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}