function GetPluginSettings()
{
	return {
		"name":			"JSON buider",
		"id":			"Rex_JSONBuider",
		"version":		"0.1",        
		"description":	"Build JSON structure.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_json_buider.html",
		"category":		"Rex - Data structure - JSON",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions            
AddStringParam("Key", "Key of this object.", '""');
AddComboParamOption("Array");
AddComboParamOption("Dict");
AddComboParam("Type", "Array or Dictionary.",0);
AddCondition(1, cf_not_invertible, "Add object", "Add object", 
             "{0}: {1}", 
             "Add an object.", "AddObject");
      
AddComboParamOption("Array");
AddComboParamOption("Dict");
AddComboParam("Type", "Array or Dictionary.",0);
AddCondition(2, cf_not_invertible, "Set root", "Add object", 
             "Root - {0}", 
             "Set root object.", "SetRoot"); 
             
//////////////////////////////////////////////////////////////
// Actions 
AddAction(1, 0, "Clean", "Clean", 
          "Clean all",
          "Clean all data.", "Clean");
          
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(2, 0, "Add value", "Add value", 
          "{0}: {1}",
          "Add number or string value.", "AddValue");
        
AddStringParam("Key", "The name of the key.", '""');        
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(3, 0, "Add boolean value", "Add value", 
          "{0}: {1}",
          "Add boolean value.", "AddBooleanValue");    

AddStringParam("Key", "The name of the key.", '""');          
AddAction(4, 0, "Add null value", "Add value", 
          "{0}: null",
          "Add null value.", "AddNullValue");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get JSON", "Timescale", "AsJSON", "Get JSON string.");

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
