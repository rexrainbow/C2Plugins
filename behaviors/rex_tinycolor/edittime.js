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
          "Set {my} to <i>{0}</i>", 
		  "Set colore.", "SetColorByString"); 
		  
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
