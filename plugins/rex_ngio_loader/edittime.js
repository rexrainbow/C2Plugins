function GetPluginSettings()
{
	return {
		"name":			"Loader",
		"id":			"Rex_NGIO_Loader",
		"version":		"0.1",        
		"description":	"Handles loading various URLs and tracking referral stats.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ngio_loader.html",
		"category":		"Rex - Web - newgrounds.io",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,      
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(101, cf_trigger, "On get url", "Get URL", 
            "On get url success",
            "Triggered when get url success.", "OnGetURLSuccess");
AddCondition(102, cf_trigger, "On get url error", "Get URL", 
            "On get url error",
            "Triggered when get url error.", "OnGetURLError");      
            
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Get url of");
AddComboParamOption("Open");
AddComboParam("Operation", "Operation.", 0);
AddAction(1, 0, "Load Newground page", "Newgrounds", 
          "<i>{0}</i> newground page",
          "Loads Newgrounds, and logs the referral to your API stats.", "LoadNewgrounds");      
         
AddComboParamOption("Get url of");
AddComboParamOption("Open");
AddComboParam("Operation", "Operation.", 0);         
AddAction(2, 0, "Load more game", "Newgrounds", 
          "<i>{0}</i> more game page",
          "Loads the Newgrounds game portal, and logs the referral to your API stats.", "LoadMoreGames");
          
AddComboParamOption("Get url of");
AddComboParamOption("Open");
AddComboParam("Operation", "Operation.", 0);             
AddAction(11, 0, "Load author page", "Official URLs", 
          "<i>{0}</i> author page",
          'Loads the official URL of the app\'s author (as defined in your "Official URLs" settings), and logs a referral to your API stats.', "LoadAuthorUrl");
          
AddComboParamOption("Get url of");
AddComboParamOption("Open");
AddComboParam("Operation", "Operation.", 0);          
AddAction(12, 0, "Load official page", "Official URLs", 
          "<i>{0}</i>> official page",
          'Loads the official URL where the latest version of your app can be found (as defined in your "Official URLs" settings), and logs a referral to your API stats.', "LoadOfficialUrl");            
         
AddComboParamOption("Get url of");
AddComboParamOption("Open");
AddComboParam("Operation", "Operation.", 0);                
AddStringParam("Referral", 'The name of the referral (as defined in your \"Referrals & Events\" settings). ', '""');              
AddAction(21, 0, "Load referral", "Referral", 
          "<i>{0}</i> referral <i>{1}</i>",
          'Loads a custom referral URL (as defined in your "Referrals & Events" settings), and logs the referral to your API stats.', "LoadReferral");                
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get error message", "Result", "ErrorMessage", 
              "Get last error message from last result.");
              
AddExpression(1, ef_return_string, "Get URL", "Result", "LastURL", 
              "Get url from last result.");    
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Host", "localHost", "The domain hosting your app."),   
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
