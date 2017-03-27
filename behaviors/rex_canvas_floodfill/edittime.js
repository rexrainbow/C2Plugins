function GetBehaviorSettings()
{
	return {
		"name":			"Flood fill",
		"id":			"Rex_Canvas_floodfill",
		"description":	"Flood fill on canvas. Reference:https://github.com/binarymax/floodfill.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_floodfill.html",
		"category":		"Rex - Canvas",
		"dependency":	"floodfill.js",        
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
//AddCondition(1, cf_trigger, "On finished", "Process", 
//              "{my} On processing finsihed", 
//              "Triggered when process of  getting average RGB had finished.", "OnFinished");
//
//AddCondition(4,0 ,"Is processing","Process",
//             "Is processing",
//             "Return true if processing.","IsProcessing");
			 
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Color", "A DOMString parsed as CSS <color> value.", '"black"');
AddAction(1, 0, "Set fill color", "Prepare", 
    "{my} set fill color to <i>{0}</i>", 
    "Set fill color.", "SetFillColor"); 
    
AddNumberParam("x", "The x axis of the coordinate for the starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the starting point.", 0);    
AddAction(2, 0, "Set start point", "Prepare", 
    "{my} set start point to (<i>{0}</i>,<i>{1}</i>)", 
    "Set start point.", "SetStartPoint");

AddNumberParam("Tolerance", "0: fills pixels exactly matching that of the starting x,y coordinate; 128: anti-alias; 254: fill over all other pixels.", 0);    
AddAction(3, 0, "Set tolerance", "Prepare", 
    "{my} set tolerance to <i>{0}</i>", 
    "Set tolerance.", "SetTolerance");     
    
AddNumberParam("Left", "Prevent the fill from occuring at any pixel coordinate with x less than this left value.", 0);
AddNumberParam("Top", "Prevent the fill from occuring at any pixel coordinate with y less than this top value.", 0);    
AddNumberParam("Right", "Prevent the fill from occuring at any pixel coordinate with x greater than this left value.", 0);
AddNumberParam("Bottom", "Prevent the fill from occuring at any pixel coordinate with y greater than this top value.", 0); 
AddAction(4, 0, "Set bounding box", "Prepare", 
    "{my} set bounding box to (<i>{0}</i>,<i>{1}</i>, <i>{2}</i>, <i>{3}</i>)", 
    "Set bounding box.", "SetBoundingBox");    
          
AddAction(11, 0, "Fill", "One tick", 
          "{my} fill", 
		  "Fill flood.", "FillFlood");
          
//AddAction(21, 0, "Start", "Webworker", 
//          "{my} Start process", 
//		  "Start process of flood filling.", "Start");
//          
//AddAction(22, 0, "Cencel", "Webworker",
//          "{my} Cencel process",
//          "Cencel process of flood filling", "Cencel");  
	  
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
