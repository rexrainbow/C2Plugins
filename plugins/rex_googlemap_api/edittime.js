function GetPluginSettings()
{
	return {
		"name":			"Google map api",
		"id":			"rex_googlemap_api",
		"version":		"0.1",
		"description":	"Load google map api.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_googlemap_api.html",
		"category":		"Rex - Web - Google map",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On loaded", "Load", "On loaded", 
                    "Triggered when api loaded.", "OnLoaded");
                    
AddCondition(2,	0, "Is loaded", "Load", "Is loaded", 
                    "Return true if api is loaded.", "IsLoaded"); 

AddCondition(3,	cf_trigger, "On error", "Load", "On error", 
                    "Triggered when api loaded error.", "OnError");                    
////////////////////////////////////////
// Actions
AddAction(1, 0, "Load", "Load", 
          "Load API", 
          "Load API.", "Load");
          
AddStringParam("Language code", 'Displayed language. Set "" to use local language.', '""');          
AddAction(2, 0, "Set language code", "Language", 
          "Set language code to <i>{0}</i>", 
          'Set displayed language. Set "" to use local language.', "SetLanguage");          
          
AddComboParamOption("maps.googleapis.com");
AddComboParamOption("maps.google.cn");
AddComboParam("Set API URL", 'Set to "maps.google.cn" if user is in China.',0);          
AddAction(3, 0, "Set api URL", "URL", 
          "Set api URL to <i>{0}</i>", 
          'Set api URL, set to "maps.google.cn" if user is in China.', "SetAPIURL");  

AddStringParam("Key", 'API key', '""');          
AddAction(4, 0, "Set API key", "API key", 
          "Set API key to <i>{0}</i>", 
          'Set API key.', "SetAPIKey");           
                    
////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Initial loading", "Yes", "Enable if you wish to load map at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "API key", "", 'Google API key.'),    
    new cr.Property(ept_text, "Language code", "", 'Specifics language displayed in google map. Set "" to use local language.'),
	new cr.Property(ept_combo, "API URL", "maps.googleapis.com", 'API URL, set to "maps.google.cn" if user is in China.', "maps.googleapis.com|maps.google.cn"),    
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
