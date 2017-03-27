function GetPluginSettings()
{
	return {
		"name":			"Tilt to angle",
		"id":			"Rex_Tilt2Angle",
		"version":		"0.1",   		
		"description":	"Get angle from tilt's beta and gamma input.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_tilt2angle.html",
		"category":		"Input",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("0");
AddComboParamOption("current angle");
AddComboParam("ZERO angle", "ZERO angle of Left-Right direction.");
AddAction(2, 0, "Calibration", "calibration", "Calibration zero angle to <i>{0}</i>", 
          "Calibration zero angle.", "Calibration");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Zero of Up-Bottom", "Calibration", "ZEROUD", "Get zero of Up-Bottom, in degrees.");
AddExpression(2, ef_return_number, "Zero of Left-Right", "Calibration", "ZEROLR", "Get zero of Left-Right, in degrees.");
AddExpression(3, ef_return_number, "Vector length of X axis", "Length", "LengthX", "Get vector length of X axis.");
AddExpression(4, ef_return_number, "Vector length of Y axis", "Length", "LengthY", "Get vector length of X axis.");
AddExpression(5, ef_return_number, "Tilt vector angle", "Angle", "Angle", "Tilt angle, in degrees.");
AddExpression(6, ef_return_number, "Tilt vector length", "Length", "Length", "Tilt vector length.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
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
	if (this.properties["Sensitivity"] < 0)
		this.properties["Sensitivity"] = 1;    
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{	
}
