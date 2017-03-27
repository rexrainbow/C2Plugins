function GetPluginSettings()
{
	return {
		"name":			"Web font loader",
		"id":			"Rex_GoogleWebFontLoader",
		"version":		"0.1",        
		"description":	"Loads web font then gets web font loaded events.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_googlewebfontloader.html",
		"category":		"Rex - Text",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On loading", "Load fonts", 
            "On loading",
            "This event is triggered when all fonts have been requested.", "OnLoading");
AddCondition(2, cf_trigger, "On active", "Load fonts", 
            "On active",
            "This event is triggered when the fonts have rendered.", "OnActive");            
AddCondition(3, cf_trigger, "On inactive", "Load fonts", 
            "On inactive",
            "This event is triggered when the browser does not support linked fonts or if none of the fonts could be loaded.", "OnInactive");               
AddCondition(4, cf_trigger, "On font loading", "Load font", 
            "On font loading",
            "This event is triggered once for each font that's loaded.", "OnFontloading");
AddCondition(5, cf_trigger, "On font active", "Load font", 
            "On font active",
            "This event is triggered once for each font that renders.", "OnFontactive"); 
AddCondition(6, cf_trigger, "On font inactive", "Load font", 
            "On font inactive",
            "This event is triggered if the font can't be loaded.", "OnFontinactive");   

AddCondition(11, cf_trigger, "On load api error", "Load API", 
            "On load api error",
            "Triggered when load web font loader api error.", "OnLoadAPIError");           
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Loading", "Load", 
         "Loading", 
         "Load fonts.", "Load");
         
AddStringParam("Name", "Family name to add.", '"Droid Sans"');         
AddAction(11, 0, "Google", "Add", 
         "Add google web font {0}", 
         "Add google web font.", "AddGoogleFont");     
AddStringParam("ID", "ID.", '"adamina;advent-pro"');      
AddStringParam("API", "Edge Web Fonts URL.", '"\/\/use.edgefonts.net"');         
AddAction(12, 0, "Typekit", "Add", 
         "Add Typekit web font with ID: {0}, api: {1}", 
         "Add Typekit web font.", "AddTypekitFont");    
AddStringParam("Project ID", "Project ID.", '""');      
AddNumberParam("Version", "Version, optional, flushes the CDN cache.",  1234);      
AddComboParamOption("");
AddComboParamOption("load all fonts");
AddComboParam("Load all", "Load all fonts.", 1);   
AddAction(13, 0, "Fonts.com web fonts", "Add", 
         "Add Fonts.com web fonts by project ID: {0}, version: {1}, {2}", 
         "Add Fonts.com web fonts.", "AddFontsCom");  

AddStringParam("Family name", "Enter the font family name.");
AddStringParam("URL", "Enter the CSS file URL or font file URL.", "\"http://\"");   
AddAction(21, 0, "Custom", "Add", 
         "Add custom web font {0} from {1}", 
         "Add custom web font.", "AddCustomFont");         
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get last triggered family name", "Load", "LastFamilyName", 
              "Get last triggered family name.");   

              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_float, "Timeout", 5, "Timeout, in seconds."),
	new cr.Property(ept_combo, "API source", "Web", "Load api from web or local (webfont.js).", "Local|Web"),    
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
