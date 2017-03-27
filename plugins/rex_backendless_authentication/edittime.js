function GetPluginSettings()
{
	return {
		"name":			"Authentication",
		"id":			"Rex_Backendless_Authentication",
		"version":		"0.1",   		
		"description":	"Authentication which is provided by backendless. https://backendless.com/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_backendless_authentication.html",
		"category":		"Rex - Web - Backendless",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions	

// email - password  
AddCondition(1, cf_trigger, "On creating account", "UserID & Password - create account", 
            "On creating account success", 
            "Triggered when creating account success.", "EmailPassword_OnCreateAccountSuccessfully");
            
AddCondition(2, cf_trigger, "On creating account error", "UserID & Password - create account", 
            "On create account error", 
            "Triggered when creating account error.", "EmailPassword_OnCreateAccountError");   
            
AddCondition(5, cf_trigger, "On sending password result email", "UserID & Password - sending password result email", 
            "On sending password result email success", 
            "Triggered when sending password result email success.", "EmailPassword_OnSendPasswordResultEmailSuccessfully");
            
AddCondition(6, cf_trigger, "On sending password result email error", "UserID & Password - sending password result email", 
            "On sending password result email error", 
            "Triggered when sending password result email error.", "EmailPassword_OnSendPasswordResultEmailError");                                
                        
// general            
AddCondition(31, cf_trigger, "On login", "General - login", 
            "On login success", 
            "Triggered when login success.", "OnLoginSuccessfully");
            
AddCondition(32, cf_trigger, "On login error", "General - login", 
            "On login error", 
            "Triggered when login error.", "OnLoginError");

AddCondition(33, cf_trigger, "On logged out", "General - logged out", 
            "On logged out", 
            "Triggered when logged out.", "OnLoggedOut");	

AddCondition(34, cf_trigger, "On logged out error", "General - logged out", 
            "On logged out error", 
            "Triggered when logged out error.", "OnLoggedOutError");	   
            
AddCondition(35, 0, "Is login", "General - login", 
            "Is login", 
            "Return true if logging now.", "IsLogin"); 

AddCondition(41, cf_trigger, "On get valid session", "General - session", 
            "On get valid session", 
            "Triggered when get valid session.", "OnGetValidSession");	

AddCondition(42, cf_trigger, "On get invalid session", "General - session", 
            "On get invalid session", 
            "Triggered when get invalid session.", "OnGetInvalidSession");	  

AddCondition(121, cf_trigger, "On updating user data", "User data", 
            "On update user data success", 
            "Triggered when updating user data success.", "OnUpdateUserDataSuccessfully");
            
AddCondition(122, cf_trigger, "On updating user data error", "User data", 
            "On update user data error", 
            "Triggered when updating user data error.", "OnUpdateUserDataError");                    
       
//////////////////////////////////////////////////////////////
// Actions 
  
// email - password  
AddStringParam("UserID", "UserID.", '""');
AddStringParam("Password", "User password", '""');
AddAction(1, 0, "Create account", "UserID & Password", 
          "Create account with UserID to <i>{0}</i>, password to <i>{1}</i>", 
          "Create account with UserID & password.", "EmailPassword_CreateAccount");

AddStringParam("UserID", "UserID.", '""');
AddStringParam("Password", "User password.", '""');
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Stay logged-in", "Stay logged-in.");
AddAction(2, 0, "Login", "UserID & Password", 
          "Login with UserID to <i>{0}</i>, password to <i>{1}</i>, stay logged-in to <i>{2}</i>", 
          "Login with UserID & password.", "EmailPassword_Login");
          
AddStringParam("Email", "Email", '""');
AddAction(4, 0, "Sending password reset email", "UserID & Password", 
          "Sending password reset email to <i>{0}</i>", 
          "Sending password reset email", "EmailPassword_SendPasswordResultEmail"); 
             
// facebook
AddStringParam("scope", "A comma-delimited list of requested extended permissions", '""');
AddAction(21, 0, "Login by facebook", "Authentication provider", 
          "Login by facebook with scope to <i>{0}</i>", 
          "Login by facebook.", "Facebook_Login");  


AddAction(22, 0, "Login by facebook SDK", "Authentication provider", 
          "Login by facebook SDK", 
          "Login by facebook SDK.", "FacebookSDK_Login");  
          
// twitter          
AddAction(23, 0, "Login by twitter", "Authentication provider", 
          "Login by twitter", 
          "Login by twitter.", "Twitter_Login");            
          
// general         
AddAction(31, 0, "Logging out", "General", 
          "Logging out current account", 
          "Logging out current account.", "LoggingOut");    

// Validating User Login          
AddAction(41, 0, "Test session", "Session", 
          "Test session", 
          "Test if current session is valid.", "IsValidLogin");                     
          
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(111, 0, "Set value", "User data", 
          "User data- Set key <i>{0}</i> to <i>{1}</i>", 
          "Set value into current item.", "SetValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1); 
AddAction(112, 0, "Set boolean value", "User data", 
          "User data- Set key <i>{0}</i> to <i>{1}</i>", 
          "Set boolean value into current item.", "SetBooleanValue");

AddAction(121, 0, "Update", "User data", 
          "Update user data", 
          "Update user data.", "UpdateUserData");               
	  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(2, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");     
AddExpression(3, ef_return_string, "User ID", "General auth data", "UserID", 
              "ObjectId of current user.");
//AddExpression(4, ef_return_string, "Authentication method", "General auth data", "Provider", 
//              "The authentication method used.");                           
AddExpression(9, ef_return_string, "Email", "General auth data", "Email", 
              "The user's primary email address as listed on their profile. Returned only if a valid email address is available, and the email permission was granted by the user. ");	
AddExpression(10, ef_return_string, "User name", "General auth data", "UserName", 
              "The user's screen name, handle, or alias. Twitter screen names are unique, but subject to change. .");

//AddExpression(12, ef_return_string, "Photo URL", "General auth data", "PhotoURL", 
//              "Photo URL.");              
              
//AddStringParam("Key", "The name of the key.", '""');   
//AddStringParam("Default value", "Default value.", '""');            
AddExpression(21, ef_return_any | ef_variadic_parameters, "Get user data", "User data", "UserData", 
              "Get user data by key. Add 1st parameter for a specific key, add 2nd parameter for default value.");   
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Identity", "email", "Property name of identity.")
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
    if (this.properties["UserID"] === "")
        this.properties["UserID"] = "email";    
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
