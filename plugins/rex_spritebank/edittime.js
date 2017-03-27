function GetPluginSettings()
{
	return {
		"name":			"Sprite Bank",
		"id":			"Rex_SpriteBank",
		"version":		"0.8",            
		"description":	"(Deprecated) Save/Load sprites.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_spritebank.html",
		"category":		"Data & Storage",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated
	};
};

//////////////////////////////////////////////////////////////
// Conditions


//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Clean bank", "Bank", 
          "Clean bank to empty", 
          "Clean bank to empty.", "CleanBank");  
AddObjectParam("Object", "Object for saving");
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddAction(1, 0, "Save instances", "Sprite", 
          "Save <i>{0}</i> from <i>{1}</i>", 
          "Save instances of sprite.", "SaveInstances");
AddAction(2, 0, "Load all instances", "Sprite", 
          "Load all saved instances", 
          "Load all saved instances.", "LoadInstances");
AddStringParam("JSON string", "JSON string.", '""');
AddAction(3, 0, "Load bank from JSON string", "Bank", "Load bank from JSON string <i>{0}</i>",
         "Load bank from JSON string.", "StringToBank");
AddObjectParam("Function", "Function object for callback");
AddAction(4, 0, "Connect to function object", "Advance: Setup", 
          "Connect to function object <i>{0}</i>", 
          "Connect to function object.", "ConnectFn");  
AddObjectParam("Object", "Object for saving");
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddStringParam("Callback", "Callback for instance saving.", '""');   
AddAction(5, 0, "Save instances", "Advance: Sprite", 
          "Save <i>{0}</i> from <i>{1}</i>, callback to <i>{2}</i>", 
          "Save instances of sprite.", "AdvSaveInstances");
AddObjectParam("Object", "Object for loading");
AddStringParam("Callback", "Callback for instance saving.", '""');           
AddAction(6, 0, "Load instances", "Advance: Sprite", 
          "Load <i>{0}</i> instances, callback to <i>{1}</i>", 
          "Load instances.", "AdvLoadInstances");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Transfer bank to string", "Bank", "BankToString", "Transfer current bank to JSON string.");


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
