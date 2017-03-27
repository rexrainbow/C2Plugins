function GetBehaviorSettings()
{
	return {
		"name":			"Pixel collide",
		"id":			"Rex_Canvas_PixelCollide",
		"description":	"Test pixel overlapping between sprite and canvas.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_pixelCollide.html",
		"category":		"Rex - Canvas helper",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Canvas", "Select the canvas to test for a collision with.");
AddCondition(0, cf_fake_trigger | cf_static, "On collision with another canvas", "Collisions", 
             "{my} on collision with {0}", 
             "Triggered when the canvas collides with another canvas.", "OnCollision");

AddObjectParam("Canvas", "Select the canvas to test for overlap with.");
AddCondition(1, 0, "Is overlapping another canvas", "Collisions", 
             "{my} is overlapping {0}", 
             "Test if the canvas is overlapping another canvas.", "IsOverlapping");

AddNumberParam("Offset X", "The amount to offset the X co-ordinate (in pixels) before checking for a collision.");
AddNumberParam("Offset Y", "The amount to offset the Y co-ordinate (in pixels) before checking for a collision.");
AddObjectParam("Canvas", "Select the canvas to test for overlap with.");
AddCondition(2, 0, "Is overlapping at offset", "Collisions", 
             "{my} is overlapping {2} at offset (<i>{0}</i>, <i>{1}</i>)", 
             "Test if the canvas is overlapping another canvas at an offset position.", "IsOverlappingAtOffset");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Opposite angle");
AddComboParamOption("Nearest");
AddComboParamOption("Up");
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Right");
AddComboParam("Direction", "Choose the method of push out.");
AddObjectParam("Canvas", "Select the canvas to push out.");
AddAction(1, 0, "Push out", "Push out", 
          "Push {my} out of canvas ({0})", 
          "Push the object to a space if it is overlapping a canvas.", "PushOutCanvas");

AddNumberParam("Angle", "Angle, in degrees, to push the object out at.");
AddObjectParam("Canvas", "Select the canvas to push out.");
AddAction(2, 0, "Push out at angle", "Push out", 
          "Push {my} out of canvas at angle {0}", 
          "Push the object to a space at an angle if it is overlapping a canvas.", "PushOutCanvasAngle");

//AddObjectParam("Canvas", "Select the canvas to bounce off.");
//AddAction(4, 0, "Bounce off", "Push out",
//          "Bounce {my} off {0}", 
//          "Bounce the object off canvas it is currently touching.", "Bounce");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get bounce angle", "Push out", "BounceAngle", 
               "Get bounce angle while collision.");

ACESDone();

// Property grid properties for this plugin
var property_list = [           
    new cr.Property(ept_float, "Sample rate", 0.01, "Sample rate of overlap testing, 0 to 1."),
    //new cr.Property(ept_combo, "Push out", "No", "Enable if you wish to push out this object automatically.", "No|Nearest"),
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

// Class representing an individual instance of an canvas in the IDE
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
    if (this.properties["Sample rate"] === 0)
        this.properties["Sample rate"] = 0.001;  
}
