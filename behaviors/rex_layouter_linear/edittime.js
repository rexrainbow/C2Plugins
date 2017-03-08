function GetBehaviorSettings()
{
	return {
		"name":			"Linear layout",
		"id":			"Rex_layouter_linear",
		"description":	"Put instances linear on layouter.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_layouter_linear.html",
		"category":		"Rex - Layouter",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
	  			 		 
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Average");
AddComboParamOption("Fix");
AddComboParam("Mode", "Mode of layout.",0);
AddAction(0, 0, "Set mode", "Mode", 
          "Set {my} mode to <i>{0}</i>", 
          "Ser mode of layout.", "SetMode"); 
AddComboParamOption("Left to right");
AddComboParamOption("Right to left");
AddComboParamOption("Top to bottom");
AddComboParamOption("Bottom to top");
AddComboParam("Direction", "Direction of layout instances.",0);
AddAction(1, 0, "Set direction", "Mode", 
          "Set {my} direction to <i>{0}</i>", 
          "Set direction of layout instances.", "SetDirection");
AddComboParamOption("Start");
AddComboParamOption("Center");
AddComboParamOption("End");
AddComboParam("Alignment", "Alignment of layout instances.",0);
AddAction(2, 0, "Set alignment", "Mode", 
          "Set {my} alignment to <i>{0}</i>", 
          "Set alignment of instances. It only uses in Fix mode.", "SetAlignment");
AddNumberParam("Spacing", "Spacing (delta distance) of each instance, in pixels.", 40);
AddAction(3, 0, "Set spacing", "Fix mode", 
          "Set {my} spacing to <i>{0}</i>", 
          "Set spacing (delta distance) of each instance, in pixels. It only uses in Fix mode.", "SetDeltaDist");
                
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [ 
new cr.Property(ept_combo, "Mode", "Fix", "Average mode: layout instances in range averagely, Fix mode: layout instances with fix distance.", "Average|Fix"),
    new cr.Property(ept_combo, "Direction", "Left to right", "Direction from start to end.", "Left to right|Right to left|Top to bottom|Bottom to top"),
    new cr.Property(ept_combo, "Alignment", "Start", "Alignment. It only uses in Fix mode.", "Start|Center|End"),        
    new cr.Property(ept_float, "Spacing", 40, "Spacing (delta distance) of each instance, in pixels. It only uses in Fix mode."),
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
