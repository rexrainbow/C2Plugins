function GetPluginSettings()
{
	return {
		"name":			"Pattern gen",
		"id":			"Rex_PatternGen",
		"version":		"0.1",   		
		"description":	"Generate patterns with shuffe or random mode.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"General",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions  
AddComboParamOption("Shuffe");
AddComboParamOption("Random");
AddComboParam("Mode", "Mode of pattern generator.",0);
AddAction(1, 0, "Set mode", "Mode", "Set mode to <i>{0}</i>", 
          "Set mode of pattern generator.", "SetMode");  
AddStringParam("Pattern", "Pattern in gererator.", '""');
AddNumberParam("Count", "Count.", 1);
AddAction(2, 0, "Set pattern", "Pattern", "Set pattern <i>{0}</i> with count to <i>{1}</i>", 
          "Set pattern.", "SetPattern");
AddStringParam("Pattern", "Pattern in gererator.", '""');
AddAction(3, 0, "Remove pattern", "Pattern", "Remove pattern <i>{0}</i>", 
          "Remove pattern.", "RemovePattern"); 
AddAction(4, 0, "Remove all patterns", "Pattern", "Remove all patterns", 
          "Remove all patterns.", "RemoveAllPatterns");  
AddAction(5, 0, "Start generator", "Generator", "Start generator", 
          "Start generator.", "StartGenerator");         
AddObjectParam("Random generator", "Random generator object");
AddAction(20, 0, "Set random generator", "Setup", 
          "Set random generator object to <i>{0}</i>", 
          "Set random generator object.", "SetRandomGenerator");                              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, 
              "Get pattern", "Generator", "Pattern", 
              "Get pattern from generator.");
AddStringParam("Pattern", "Pattern in gererator.", '""');
AddExpression(3, ef_return_number | ef_variadic_parameters, 
              "Get count of pattern", "Pattern", "Count", "Get count of pattern.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Mode", "Shuffe", "Generater mode.", "Shuffe|Random"),
    new cr.Property(ept_text, "Patterns", "", 
                   'Set patterns. ex:"{"A":10,"B":20}".'),	
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
    if (this.properties["Patterns"] != "")
        var data = JSON.parse(this.properties["Patterns"]);    
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
