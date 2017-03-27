function GetPluginSettings()
{
	return {
		"name":			"Lz-string",
		"id":			"Rex_Lzstring",
		"version":		"0.1",        
		"description":	"Compress string using LZ-based compression algorithm. Reference - https://github.com/pieroxy/lz-string",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_lzstring.html",
		"category":		"Rex - String",
		"type":			"object",			// not in layout
		"rotatable":	false,         
		"flags":		pf_singleglobal,
		"dependency":	"lz-string.min.js",            
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("None");
AddComboParamOption("Base64");
AddComboParamOption("UTF16");
AddComboParamOption("URI");
AddComboParam("Encoding", "Encoding mode.",0);
AddAction(1, 0, "Set encoding mode", "Encoding", 
          "Set encoding mode to <i>{0}</i>", 
          "Set encoding mode.", "SetEncodingMode");
          
// deprecated
AddStringParam("Key","Enter the name of the key to associate the value with.", "\"\"");
AddAnyTypeParam("Value","Enter the value to store.", "\"\"");
AddAction(11,af_deprecated,"Set local value","Local","Set local key {0} to {1}","Store a value in local storage (available in any session).","StoreLocal");

//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Source", "Source string to compress", '""');
AddExpression(1, ef_return_string, "Compress", "Compress", "Compress", "Compress source string.");
AddStringParam("Result", "Result string to decompress", '""');
AddExpression(2, ef_return_string, "Decompress", "Decompress", "Decompress", "Decompress result string.");

// deprecated
AddStringParam("Key", "Key name", "\"\"");
AddAnyTypeParam("Default","The default value if the key does not existed.", 0);
AddExpression(11, ef_deprecated | ef_return_any, "Get local value", "Local", "LocalValue", 
              "Get the value from a key in local storage. Return the default value if the key does not existed, and save the default value to webstorage.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Encoding", "None", "Encoding of compression result.", "None|Base64|UTF16|URI"),   
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
