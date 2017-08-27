function GetBehaviorSettings()
{
	return {
		"name":			"Color",
		"id":			"Rex_tinyColor",
		"description":	"Color manipulation and conversion. Reference: https://github.com/bgrins/TinyColor",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_tinycolo.html",
		"category":		"General",
		"flags":		0,
		"dependency":	"tinycolor-min.js"		
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("Color", 'Color string. "#000", "000", "#f0f0f688", or "rgba (255, 0, 0, .5)"', '""');
AddAction(1, 0, "Set color", "Set", 
          "Set {my} to {0}", 
		  "Set color.", "SetColorByString"); 
		  
AddAction(2, 0, "Set random color", "Set", 
          "Set {my} to random", 
		  "Set to random color.", "SetRandom"); 		  

AddNumberParam("R", "R, 0-255", 0);
AddNumberParam("G", "G, 0-255", 0);
AddNumberParam("B", "B, 0-255", 0);
AddAction(3, 0, "Set RGB", "Set", 
          "Set {my} to rgb({0}, {1}, {2})", 
		  "Set color by rgb.", "SetRGB"); 

AddNumberParam("H", "H, 0-1", 0);
AddNumberParam("S", "S, 0-100", 100);
AddNumberParam("L", "L, 0-100", 100);
AddAction(4, 0, "Set HSL", "Set", 
          "Set {my} to hsl({0}, {1}%, {2}%)", 
		  "Set color by hsl.", "SetHSL");	
		  
AddNumberParam("H", "H, 0-1", 0);
AddNumberParam("S", "S, 0-100", 100);
AddNumberParam("V", "V, 0-100", 100);
AddAction(4, 0, "Set HSV", "Set", 
          "Set {my} to hsv({0}, {1}%, {2}%)", 
		  "Set color by hsv.", "SetHSV");	
		  
AddNumberParam("Alpha", "A, 0-1", 1);
AddAction(5, 0, "Set alpha", "Set", 
          "Set {my} alpha to {0}", 
		  "Set alpha.", "SetAlpha");
		  
AddNumberParam("Angle", "Angle, (-360)-360", 0);
AddAction(11, 0, "Spin", "Modification", 
          "Spin {my} to {0}", 
		  "Spin the hue a given amount, from -360 to 360.", "Spin");			  
//////////////////////////////////////////////////////////////
// Expressions
//AddStringParam("Key", 'Key in "r", "g", "b", "a".', '"r"');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get RGBA", "RGBA", "RGB", 
              'Get RGB of current color. Add 2nd parameter "r", "g", "b", "a" to get r/g/b/a componment.');
AddExpression(12, ef_return_string, "Get hex string", "RGBA", "Hex", 
              "Get hex string of current color.");			  

//AddStringParam("Key", 'Key in "h", "s", "l", "a".', '"h"');			  
AddExpression(21, ef_return_any | ef_variadic_parameters, "Get HSL", "HSL", "HSL", 
              'Get HSL of current color. Add 2nd parameter "h", "s", "l", "a" to get h/l/s/a componment.');

//AddStringParam("Key", 'Key in "h", "s", "l", "a".', '"h"');			  
AddExpression(31, ef_return_any | ef_variadic_parameters, "Get HSV", "HSV", "HSV", 
              'Get HSV of current color. Add 2nd parameter "h", "s", "v", "a" to get h/l/s/a componment.');

ACESDone();

// Property grid properties for this plugin
var property_list = [    
    new cr.Property(ept_text, "Color", "black", 'Color string. "#000", "000", "#f0f0f688", or "rgba (255, 0, 0, .5)"'),    	
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
