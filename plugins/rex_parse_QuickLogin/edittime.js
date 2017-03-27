function GetPluginSettings()
{
	return {
		"name":			"Quick Login",
		"id":			"Rex_parse_QuickLogin",
		"version":		"0.1",        
		"description":	"Try to login parse server. Creates account if it had not existed.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_parse_quicklogin.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated,
		"dependency":	"parse-1.3.2.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On login successfully", "General - login", 
            "On login successfully", 
            "Triggered when login successfully.", "OnLoginSuccessfully");
            
AddCondition(2, cf_trigger, "On login error", "General - login", 
            "On login error", 
            "Triggered when login error.", "OnLoginError");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Username", "User name.");
AddStringParam("Password", "Password"); 
AddAction(1, 0, "Login", "Quick login", 
          "Login with user name to <i>{0}</i>, password to <i>{1}</i>", 
          "Login with username & password. Create an account if had not existed yet.", "QuickLogin");
		         
AddAction(2, 0, "Logging out", "General", 
          "Logging out current account", 
          "Logging out current account.", "LoggingOut");  
                           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(2, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message."); 
AddExpression(3, ef_return_string, "User ID", "General auth data", "UserID", 
              "Unique user ID (object ID in User class)");
AddExpression(4, ef_return_string, "User name", "General auth data", "UserName", 
              "Unique user name.");
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Application ID", "", "Application ID"),
	new cr.Property(ept_text, "Javascript Key", "", "Javascript Key")
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
