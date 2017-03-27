function GetBehaviorSettings()
{
	return {
		"name":			"Pixel cache",
		"id":			"Rex_Canvas_PixelCahce",
		"description":	"Read pixels from canvas, modify, then write back to canvas.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_pixelcahce.html",
		"category":		"Rex - Canvas helper",
		"flags":		0,
        "dependency":	"zlib_and_gzip.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddComboParamOption("Top to bottom");
AddComboParamOption("Bottom to top");
AddComboParamOption("Left to right");
AddComboParamOption("Right to left");
AddComboParam("Direction", "Scan direction.", 0);
AddCondition(3, cf_looping | cf_not_invertible, "For each point", "For each point", 
             "For each point, <i>{0}</i>", 
             "Repeat the event for each point in cache.", "ForEachPoint");
             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Cache all", "Canvas -> cache", 
          "{my} cache all pixels", 
		  "Cache color of all pixels.", "CacheArea");
		  
AddNumberParam("Left-top X", "X co-ordinate of left-top point.", 0);
AddNumberParam("Left-top Y", "Y co-ordinate of left-top point.", 0);
AddNumberParam("Width", "Width.", 0);
AddNumberParam("Height", "Height.", 0);  
AddAction(2, 0, "Cache area", "Canvas -> cache", 
          "{my} cache pixels at left-top ({0},{1}), width to {2} and height to {3}", 
          "Cache color at an area.", "CacheArea"); 
          
AddAction(3, 0, "Write back", "Cache -> canvas", 
          "{my} write cache back to canvas", 
		  "Write cache back to canvas.", "WriteBack");          

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddNumberParam("R", "Red value, 0-255", 255);  
AddAction(11, 0, "Set red", "Cache", 
          "{my} set red to {2} at ({0},{1})", 
          "Set red value at point in cache.", "SetR");           
                  
AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddNumberParam("G", "Green value, 0-255", 255);  
AddAction(12, 0, "Set green", "Cache", 
          "{my} set green  to {2} at ({0},{1})", 
          "Set green value at point in cache.", "SetG");    

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddNumberParam("B", "Blue value, 0-255", 255);  
AddAction(13, 0, "Set blue", "Cache", 
          "{my} set blue to {2} at ({0},{1})", 
          "Set blue value at point in cache.", "SetB");  
          
AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddNumberParam("A", "Alpha value, 0-1", 1);  
AddAction(14, 0, "Set alpha", "Cache", 
          "{my} set alpha to {2} at ({0},{1})", 
          "Set alpha value at point in cache.", "SetA");  

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddNumberParam("R", "Red value, 0-255", 255);  
AddNumberParam("G", "Green value, 0-255", 255);  
AddNumberParam("B", "Blue value, 0-255", 255);
AddNumberParam("A", "Alpha value, 0-1", 1); 
AddAction(15, 0, "Set RGBA", "Cache", 
          "{my} set color RGBA to ({2},{3},{4},{5}) at ({0},{1})", 
          "Set RGBA value at point in cache.", "SetRGBA"); 

//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddExpression(1, ef_return_string, "Get rgba at", "Color", "rgbaAt", "This gives the rgba color at a given position on the canvas.");

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddExpression(2, ef_return_number, "Get red at", "Color", "redAt", "This gives the red component of the color at a given position on the canvas. (0-255)");

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddExpression(3, ef_return_number, "Get green at", "Color", "greenAt", "This gives the green component of the color at a given position on the canvas. (0-255)");

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddExpression(4, ef_return_number, "Get blue at", "Color", "blueAt", "This gives the blue component of the color at a given position on the canvas. (0-255)");

AddNumberParam("x", "x position on canvas", 0);
AddNumberParam("y", "y position on canvas", 0);
AddExpression(5, ef_return_number, "Get alpha at", "Color", "alphaAt", "This gives the alpha component of the color at a given position on the canvas. (0.0-1.0)");

AddExpression(11, ef_return_number, "Get left X", "Area", "LeftX", "Get left X of cached area");
AddExpression(12, ef_return_number, "Get right X", "Area", "RightX", "Get right X of cached area");
AddExpression(13, ef_return_number, "Get top Y", "Area", "TopY", "Get top Y of cached area");
AddExpression(14, ef_return_number, "Get bottom Y", "Area", "BottomY", "Get bottom Y of cached area");

AddExpression(31, ef_return_number, "Current X", "For Each point", "CurX", 
              "Get the current x position in cache in a For Each loop.");
AddExpression(32, ef_return_number, "Current Y", "For Each point", "CurY", 
              "Get the current y position in cache in a For Each loop.");   
AddExpression(33, ef_return_number, "Current Red", "For Each point", "CurR", 
              "Get red value in current position in cache in a For Each loop. (0-255)");  
AddExpression(34, ef_return_number, "Current Green", "For Each point", "CurG", 
              "Get green value in current position in cache in a For Each loop. (0-255)");               
AddExpression(35, ef_return_number, "Current Blue", "For Each point", "CurB", 
              "Get blue value in current position in cache in a For Each loop. (0-255)");  
AddExpression(36, ef_return_number, "Current Alpha", "For Each point", "CurA", 
              "Get alpha value in current position in cache in a For Each loop. (0.0-1.0)"); 

              
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
