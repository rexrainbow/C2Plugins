function GetPluginSettings()
{
	return {
		"name":			"Authentication",
		"id":			"Rex_Firebase_Authentication",
		"version":		"0.1",   		
		"description":	"Authentication which is provided by firebase. https://www.firebase.com/",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_authentication.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions	

// email - password  
AddCondition(1, cf_trigger, "On creating account successfully", "Email & Password - create account", 
            "On creating account successfully", 
            "Triggered when creating account successfully.", "EmailPassword_OnCreateAccountSuccessfully");
            
AddCondition(2, cf_trigger, "On creating account error", "Email & Password - create account", 
            "On create account error", 
            "Triggered when creating account error.", "EmailPassword_OnCreateAccountError");   
            
AddCondition(3, cf_trigger, "On changing password successfully", "Email & Password - changing password", 
            "On changing password successfully", 
            "Triggered when changing password successfully.", "EmailPassword_OnChangingPasswordSuccessfully");
            
AddCondition(4, cf_trigger, "On changing password error", "Email & Password - changing password", 
            "On changing password error", 
            "Triggered when changing password error.", "EmailPassword_OnChangingPasswordError");    
            
AddCondition(5, cf_trigger, "On sending password result email successfully", "Email & Password - sending password result email", 
            "On sending password result email successfully", 
            "Triggered when sending password result email successfully.", "EmailPassword_OnSendPasswordResultEmailSuccessfully");
            
AddCondition(6, cf_trigger, "On sending password result email error", "Email & Password - sending password result email", 
            "On sending password result email error", 
            "Triggered when sending password result email error.", "EmailPassword_OnSendPasswordResultEmailError");                         
     
AddCondition(7, cf_trigger, "On deleting user successfully", "Email & Password - deleting user", 
            "On deleting user successfully", 
            "Triggered when deleting user successfully.", "EmailPassword_OnDeleteUserSuccessfully");
            
AddCondition(8, cf_trigger, "On deleting user error", "Email & Password - deleting user", 
            "On sending password result email error", 
            "Triggered when deleting user error.", "EmailPassword_OnDeleteUserError"); 
                        
// general            
AddCondition(31, cf_trigger, "On login successfully", "General - login", 
            "On login successfully", 
            "Triggered when login successfully.", "OnLoginSuccessfully");
            
AddCondition(32, cf_trigger, "On login error", "General - login", 
            "On login error", 
            "Triggered when login error.", "OnLoginError");

AddCondition(33, cf_trigger, "On logged out", "General - login", 
            "On logged out", 
            "Triggered when logged out.", "OnLoggedOut");			
//////////////////////////////////////////////////////////////
// Actions 
  
// email - password  
AddStringParam("Email", "User email");
AddStringParam("Password", "User password");
AddAction(1, 0, "Create account", "Email & Password", 
          "Create account with email to <i>{0}</i>, password to <i>{1}</i>", 
          "Create account with email & password.", "EmailPassword_CreateAccount");

AddStringParam("Email", "User email");
AddStringParam("Password", "User password");
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember", "Persisting type");
AddAction(2, 0, "Login", "Email & Password", 
          "Login with email to <i>{0}</i>, password to <i>{1}</i>, persisting type to <i>{2}</i>", 
          "Login with email & password.", "EmailPassword_Login");
          
AddStringParam("Email", "User email");
AddStringParam("Old password", "User password");
AddStringParam("New password", "User password");
AddAction(3, 0, "Change password", "Email & Password", 
          "Change password with email to <i>{0}</i>, password from old <i>{1}</i> to new <i>{1}</i>", 
          "Change password.", "EmailPassword_ChangePassword");          

AddStringParam("Email", "User email");
AddAction(4, 0, "Sending password reset email", "Email & Password", 
          "Sending password reset email to <i>{0}</i>", 
          "Sending password reset email", "EmailPassword_SendPasswordResultEmail"); 
             
AddStringParam("Email", "User email");
AddStringParam("Password", "User password");
AddAction(5, 0, "Delete user", "Email & Password", 
          "Delete user with email to <i>{0}</i>, password to <i>{1}</i>", 
          "Delete user with email & password.", "EmailPassword_DeleteUser");  
          
// anonymous   
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember", "Persisting type");       
AddAction(11, 0, "Login", "Anonymous", 
          "Login with anonymous, persisting type to <i>{0}</i>", 
          "Login with anonymous.", "Anonymous_Login");   
          
// facebook/google
AddComboParamOption("Facebook");
AddComboParamOption("Twitter");
AddComboParamOption("Github");
AddComboParamOption("Google");
AddComboParam("Provider", "Authentication provider");  
AddComboParamOption("popup");
AddComboParamOption("redirect");
AddComboParam("Type ", "Type of login window");
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember ", "Persisting type");
AddStringParam("scope", "A comma-delimited list of requested extended permissions");
AddAction(21, 0, "Login", "Authentication provider", 
          "Login by <i>{0}</i> with <i>{1}</i>, persisting type to <i>{2}</i>, scope to <i>{3}</i>", 
          "Login by authentication provider.", "ProviderAuthentication_Login");  
 
// general         
AddAction(31, 0, "Logging out", "General", 
          "Logging out current account", 
          "Logging out current account.", "LoggingOut");                           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(2, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");     
AddExpression(3, ef_return_string, "User ID", "General auth data", "UserID", 
              "A unique user ID, intended as the user's unique key across all providers.");
AddExpression(4, ef_return_string, "Authentication method", "General auth data", "Provider", 
              "The authentication method used.");                           
AddExpression(5, ef_return_string, "Display name", "General auth data", "DisplayName", 
              "Display name.");
AddExpression(6, ef_return_string, "User ID from provider", "General auth data", "UserIDFromProvider", 
              "User ID from provider.");
AddExpression(7, ef_return_string, "Access token", "General auth data", "AccessToken", 
              "The FOAuth 2.0 access token granted by provider during user authentication.");						  
AddExpression(8, ef_return_string, "Cached user profile", "General auth data", "CachedUserProfile", 
              "Cached user profile from provier.");	
AddExpression(9, ef_return_string, "Email", "General auth data", "Email", 
              "The user's primary email address as listed on their profile. Returned only if a valid email address is available, and the email permission was granted by the user. ");	
AddExpression(10, ef_return_string, "User name", "General auth data", "UserName", 
              "The user's screen name, handle, or alias. Twitter screen names are unique, but subject to change. .");
			  
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data.")
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
