function GetBehaviorSettings()
{
	return {
		"name":			"Canvas Fan shaped",
		"id":			"Rex_Canvas_Fan",
		"description":	"Draw a fan shaped on the canvas.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_fan.html",
		"category":		"Canvas",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On drawing finished", "Drawing", 
             "On {my} drawing finished", "Triggered when drawing finished.", 
             "OnFinished");  
AddCondition(2, 0, "Is drawing", "Drawing", 
             "Is {my} drawing", "Return true if drawing fan now.", "IsDrawing");              
             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Start", "Control", 
          "Start {my} drawing", 
          "Start drawing fan shaped.", "Start");
AddAction(2, 0, "Pause", "Control", 
          "Pause {my} drawing", 
          "Pause drawing fan shaped.", "Pause");
AddAction(3, 0, "Resume", "Control", 
          "Resume {my} drawing", 
          "Resume drawing fan shaped.", "Resume");
AddNumberParam("Start angle", "Start angle of fan shaped, in degree.", 0);
AddAction(4, 0, "Set start angle", "Configure", 
          "Set {my} start angle to <i>{0}</i>", 
          "Set start angle of fan shaped.", "SetStartAngle");
AddNumberParam("Duration", "Duration of drawing, in second.", 1);
AddAction(5, 0, "Set duration", "Configure", 
          "Set {my} duration to <i>{0}</i>", 
          "Set duration of drawing.", "SetDuration");
AddStringParam("Color", "Use color name, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", "\"black\"");
AddAction(6, 0, "Set filled color", "Configure", 
         "Set filled color to <i>{0}</i>", 
         "Set filled color.", "SetFilledColor");
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Start angle", 
              "Configure", "StartAngle", 
              "Get start angle of fan shaped, in degree.");
AddExpression(2, ef_return_number, "Duration", 
              "Configure", "Duration", 
              "Get duration of drawing, in second.");
AddExpression(3, ef_return_string, "Filled Color", 
              "Configure", "Color", 
              "Get filled color.");                    
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [  
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_float, "Start angle", 0, "Start angle of fan shaped, in degree."),
    new cr.Property(ept_float, "Delta angle", 180, "Delta angle to expand, in degree."),
    new cr.Property(ept_float, "Duration", 1, "Duration of drawing, in second."),
    new cr.Property(ept_text, "Color", "black", 
                   "Use color name, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" "),	       
    new cr.Property(ept_combo, "Shape", "Rectangle", "Filled shape.", "Rectangle|Circle"),                 
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
	// Clamp values
	if (this.properties["Start angle"] < 0)
		this.properties["Start value"] = 0;  
	if (this.properties["Start angle"] > 359)
		this.properties["Start value"] = 359;  
	if (this.properties["Delta angle"] < -180)
		this.properties["Delta angle"] = -180;  
	if (this.properties["Delta angle"] > 180)
		this.properties["Delta angle"] = 180; 
	if (this.properties["Duration"] < 0)
		this.properties["Duration"] = 0;  			 		    
}
