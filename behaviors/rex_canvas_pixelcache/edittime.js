function GetBehaviorSettings()
{
	return {
		"name":			"Pixel cache",
		"id":			"Rex_Canvas_PixelCahce",
		"description":	"Cache color of pixels.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_canvas_pixelcahce.html",
		"category":		"Rex - Canvas helper",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Cache all", "Cache", 
          "{my} cache all pixels", 
		  "Cache color of all pixels.", "CacheArea");
		  
AddNumberParam("Left-top X", "X co-ordinate of left-top point.", 0);
AddNumberParam("Left-top Y", "Y co-ordinate of left-top point.", 0);
AddNumberParam("Width", "Width.", 0);
AddNumberParam("Height", "Height.", 0);  
AddAction(2, 0, "Cache area", "Cache", 
          "{my} cache pixels at left-top ({0},{1}), width to {2} and height to {3}", 
          "Cache color at an area.", "CacheArea"); 
		  
//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("x", "x position on canvas", "0");
AddNumberParam("y", "y position on canvas", "0");
AddExpression(1, ef_return_string, "Get rgba at", "Color", "rgbaAt", "This gives the rgba color at a given position on the canvas.");

AddNumberParam("x", "x position on canvas", "0");
AddNumberParam("y", "y position on canvas", "0");
AddExpression(2, ef_return_number, "Get red at", "Color", "redAt", "This gives the red component of the color at a given position on the canvas. (0-255)");

AddNumberParam("x", "x position on canvas", "0");
AddNumberParam("y", "y position on canvas", "0");
AddExpression(3, ef_return_number, "Get green at", "Color", "greenAt", "This gives the green component of the color at a given position on the canvas. (0-255)");

AddNumberParam("x", "x position on canvas", "0");
AddNumberParam("y", "y position on canvas", "0");
AddExpression(4, ef_return_number, "Get blue at", "Color", "blueAt", "This gives the blue component of the color at a given position on the canvas. (0-255)");

AddNumberParam("x", "x position on canvas", "0");
AddNumberParam("y", "y position on canvas", "0");
AddExpression(5, ef_return_number, "Get alpha at", "Color", "alphaAt", "This gives the alpha component of the color at a given position on the canvas. (0.0-1.0)");

AddExpression(11, ef_return_number, "Get left X", "Area", "LeftX", "Get left X of cached area");
AddExpression(12, ef_return_number, "Get right X", "Area", "RightX", "Get right X of cached area");
AddExpression(13, ef_return_number, "Get top Y", "Area", "TopY", "Get top Y of cached area");
AddExpression(14, ef_return_number, "Get bottom Y", "Area", "BottomY", "Get bottom Y of cached area");

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
