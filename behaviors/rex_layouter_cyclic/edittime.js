function GetBehaviorSettings()
{
	return {
		"name":			"Cyclic layout",
		"id":			"Rex_layouter_cyclic",
		"description":	"Put instances cyclic on layouter.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_layouter_cyclic.html",
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
          "Set mode of layout.", "SetMode");         
AddNumberParam("Start", "Start angle, in degree.");
AddAction(2, 0, "Set start angle", "Angle", 
          "Set {my} start angle to <i>{0}</i>", 
          "Set the start angle.", 
          "SetStartAngle");
AddNumberParam("Range angle", "Amount of Range angle clockwise from start, in degrees.");
AddAction(3, 0, "Set range angle", "Average mode", 
          "Set {my} range angle to <i>{0}</i>", 
          "Set amount of range angle clockwise from start, in degrees. Negative is anti-clockwise.", 
          "SetRangeAngle");          
AddNumberParam("Delta angle", "Amount of dleta angle clockwise from start, in degrees.");
AddAction(4, 0, "Set delta angle", "Fix mode", 
          "Set {my} delta angle to <i>{0}</i>", 
          "Set amount of delta angle clockwise from start, in degrees. Negative is anti-clockwise.", 
          "SetDeltaAngle");
AddNumberParam("Delta", "Delta angle, in degree.");
AddAction(5, 0, "Add to start angle", "Angle", 
          "Add  <i>{0}</i> to {my} start angle", 
          "Add value to start angle.", 
          "AddToStartAngle");          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get start angle", "Angle", "StartAngle", 
              "Get start angle, in degrees.");

              
ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_combo, "Shape", "Circle", "Shape of this circle.", "Circle|Ellipse"),
    new cr.Property(ept_combo, "Mode", "Average", "Average mode: layout instances in range averagely, Fix mode: layout instances with fix angle.", "Average|Fix"),
    new cr.Property(ept_float, "Start angle", 0, "Start angle of first instance, in degree."),
    new cr.Property(ept_float, "Range angle", 360, "Range angle, in degree. Negative is anti-clockwise. Used in average mode."),
    new cr.Property(ept_float, "Delta angle", 15, "Delta angle, in degree. Negative is anti-clockwise. Used in fix mode."),
    new cr.Property(ept_float, "Angle offset", 0, "Angle offset of each sprite, in degree."),
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
    if (this.properties["Range angle"] > 360)
        this.properties["Range angle"] = 360;
}
