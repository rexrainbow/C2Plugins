function GetBehaviorSettings()
{
	return {
		"name":			"Average RGBA",
		"id":			"Rex_CanvasAVGRGBA",
		"description":	"Get average RGBA value from the canvas asynchronously.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_Canvasavgrgba.html",
		"category":		"Rex - Canvas - Color analysis",
		"dependency":	"avgRGB.js",        
		"flags":		bf_onlyone,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On finished", "Process", "{my} On processing finsihed", "Triggered when process of  getting average RGB had finished.", "OnFinished");
AddCondition(4,0 ,"Is processing","Process",
             "Is processing",
             "Return true if processing.","IsProcessing");
			 
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Start", "Process", 
          "{my} Start process", 
		  "Start process of getting average RGB.", "Start");
AddAction(2, 0, "Cencel", "Process",
          "{my} Cencel process",
          "Cencel process of getting average RGB", "Cencel");  
AddComboParamOption("One-tick");
AddComboParamOption("Multi-ticks");
AddComboParamOption("Webworker");
AddComboParam("Mode", "Processing mode.", 0);
AddAction(3, af_deprecated, "Set mode", "Mode", 
          "{my} Set processing mode to <b>{0}</b>", 
          "Set processing mode.", 
          "SetProcessingMode");   		  
AddNumberParam("Processing time", "Processing time per tick in percentage. A tick time is (1/60), 1 is using full tick time.", 0.5);          
AddAction(4, af_deprecated, "Set processing time","Multi-ticks",
          "Set processing time to <i>{0}</i>",
          "Set processing time","SetProcessingTime");		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get average R", 
              "Result", "R", 
              "Get average R."); 
AddExpression(2, ef_return_number, "Get average G", 
              "Result", "G",
              "Get average G.");
AddExpression(3, ef_return_number, "Get average B", 
              "Result", "B",
              "Get average B.");
AddExpression(4, ef_return_number, "Get average A", 
              "Result", "A",
              "Get average A.");
AddExpression(5, ef_return_string, "Get average rgb", 
              "Result", "RGB",
              "Get average rgb in string.");
AddExpression(6, ef_return_string, "Get average rgba", 
              "Result", "RGBA",
              "Get average rgba in string.");
AddExpression(7, ef_return_number, "Get luminance", 
              "Result", "Lum",
              "Get luminance.");
AddExpression(8, ef_deprecated | ef_return_number, "Get percentage of progress", 
              "Process", "Progress",
              "Get percentage of progress.");
			  
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
