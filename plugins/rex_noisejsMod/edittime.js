function GetPluginSettings()
{
	return {
		"name":			"Noise",
		"id":			"Rex_NoiseJsMod",
		"version":		"0.1",        
		"description":	"Provide 2d/3d perlin noise and simplex noise . Reference: https://github.com/josephg/noisejs/blob/master/perlin.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_noisejsmod.html",
		"category":		"Rex - Random",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Seed", "Random seed.", 1234);
AddAction(1, af_none, "Set seed", "Simplex", 
          "Set random seed to {0}", "Set the random seed.", "SetSeed"); 

AddNumberParam("Min", "Minimum value of output.", -1);
AddNumberParam("Max", "Maximum value of output.", 1);
AddAction(2, af_none, "Set range of output value", "Range", 
          "Set range of output value to ({0} , {1})", 
          "Set range of output value.", "SetRangeOfOutput");
          
AddNumberParam("Scale", "Scale of x/y/z input value.", 0.002);
AddAction(3, af_none, "Set scale", "Scale", 
          "Set input scale to {0}", "Set input scale.", "SetScaleIn");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression (1, ef_return_number, "Get seed", "Seed", "Seed", "Get the seed.");
AddExpression (2, ef_return_number, "Get minimum value of output", "Output", "Min", "Get minimum value of output.");
AddExpression (3, ef_return_number, "Get maxmum value of output", "Output", "Max", "Get maxmum value of output.");

AddNumberParam("X","Enter the X coordinate");
AddNumberParam("Y","Enter the Y coordinate");
// AddNumberParam("Z","Enter the Z coordinate");
AddExpression(11, ef_return_number | ef_variadic_parameters, "Get 2d/3d simplex noise", "Simplex noise", "Simplex", "Get 2d simplex noise, or add 3rd parameters to get 3d simplex noise");

AddNumberParam("X","Enter the X coordinate");
AddNumberParam("Y","Enter the Y coordinate");
// AddNumberParam("Z","Enter the Z coordinate");
AddExpression(12, ef_return_number | ef_variadic_parameters, "Get 2d/3d perlin noise", "Perlin noise", "Perlin", "Get 2d perlin noise, or add 3rd parameters to get 3d perlin noise");

AddExpression (13, ef_return_number, "Get last generated noise", "Output", "LastNoise", "Get last generated noise.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Input", "",	"Process of input value."),  
    new cr.Property(ept_float, "Scale",  0.002, "Scale of x/y/z input value."),     
    new cr.Property(ept_section, "Output", "",	"Process of output value."),    
    new cr.Property(ept_float, "Min",  -1, "Minimum value of output."),   
    new cr.Property(ept_float, "Max", 1, "Maximum value of output."), 
    new cr.Property(ept_section, "Random seed", "",	"Random seed."),        
    new cr.Property(ept_float, "Seed", 0, "Random seed."),
	new cr.Property(ept_float, "Seed random", 100, "Add a random number to the seed, up to this value.")	
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
