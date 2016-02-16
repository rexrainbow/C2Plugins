function GetBehaviorSettings()
{
	return {
		"name":			"Pixel collide",
		"id":			"Rex_Canvas_PixelCollide",
		"description":	"Test pixel overlapping with sprites.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_canvas_pixelCollide.html",
		"category":		"Rex - Canvas helper",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Object", "Select the object to test for a collision with.");
AddCondition(0, cf_fake_trigger | cf_static, "On collision with another object", "Collisions", 
             "{my} on collision with {0}", 
             "Triggered when the object collides with another object.", "OnCollision");

AddObjectParam("Object", "Select the object to test for overlap with.");
AddCondition(1, 0, "Is overlapping another object", "Collisions", 
             "{my} is overlapping {0}", 
             "Test if the object is overlapping another object.", "IsOverlapping");

AddObjectParam("Object", "Select the object to test for overlap with.");
AddNumberParam("Offset X", "The amount to offset the X co-ordinate (in pixels) before checking for a collision.");
AddNumberParam("Offset Y", "The amount to offset the Y co-ordinate (in pixels) before checking for a collision.");
AddCondition(9, 0, "Is overlapping at offset", "Collisions", 
             "{my} is overlapping {0} at offset (<i>{1}</i>, <i>{2}</i>)", 
             "Test if the object is overlapping another object at an offset position.", "IsOverlapping");

//////////////////////////////////////////////////////////////
// Actions

//////////////////////////////////////////////////////////////
// Expressions

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
