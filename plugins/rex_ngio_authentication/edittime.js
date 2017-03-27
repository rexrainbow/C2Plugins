function GetPluginSettings()
{
	return {
		"name":			"Authentication",
		"id":			"Rex_NGIO_Authentication",
		"version":		"0.1",        
		"description":	"Authentication which is provided by Newgrounds.io.",        
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ngio_authentication.html",
		"category":		"Rex - Web - newgrounds.io",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"newgroundsio.min.js"        
	};
};

//////////////////////////////////////////////////////////////
// Conditions

AddCondition(1, cf_trigger, "On login", "Login", 
            "On login success",
            "Triggered when login success.", "OnLoginSuccess");
AddCondition(2, cf_trigger, "On login error", "Login", 
            "On login error",
            "Triggered when login error.", "OnLoginError");  
AddCondition(3, cf_trigger, "On login cancel", "Login", 
            "On login cancel",
            "Triggered when login cancel.", "OnLoginCancel");  
AddCondition(4, 0, "Is login", "Login", 
            "Is login",
            "Return true if login.", "IsLogin");
AddCondition(5, cf_trigger, "On logged out", "Logging out", 
            "On logged out",
            "Triggered when logged ou.", "OnLoggedOut");
            
//////////////////////////////////////////////////////////////
// Actions

AddAction(1, 0, "Login", "Login", 
          "Login",
          "Logint.", "Login");  
          
AddAction(2, 0, "Logging out", "Login", 
          "Logging out",
          "Logging out.", "LoggingOut");


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get user name", "User", "UserName", 
             "Get user name of current session.");
AddExpression(2, ef_return_number, "Get user id", "User", "UserID", 
             "Get user id of current session."); 
             
AddAnyTypeParam("Size", "0=small, 1=medium, 2=large, or S,M,L.", 0);   
AddExpression(3, ef_return_string | ef_variadic_parameters, "Get URL of user icon", "User", "UserIconURL", 
             "Get user icon URL of current session. Add 1st parameter to 0=small, 1=medium, 2=large");              
             
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "App id", "39685:NJ1KkPGb", "App id."),
    new cr.Property(ept_text, "AES Key", "qsqKxz5dJouIkUNe3NBppQ==", "Aes encryption key."),    
    new cr.Property(ept_combo, "Debug", "No", "Enable debug mode.", "No|Yes"),          
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
