function GetPluginSettings()
{
	return {
		"name":			"Authentication",
		"id":			"Rex_Firebase_Authentication",
		"version":		"0.1",   		
		"description":	"Authentication which is provided by firebase. https://www.firebase.com/",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebase_authentication.html",
		"category":		"Rex - Web - Firebase - core",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions	

// email - password  
AddCondition(1, cf_trigger, "On creating account success", "Email & Password - create account", 
            "On creating account success", 
            "Triggered when creating account success.", "EmailPassword_OnCreateAccountSuccessfully");
            
AddCondition(2, cf_trigger, "On creating account error", "Email & Password - create account", 
            "On create account error", 
            "Triggered when creating account error.", "EmailPassword_OnCreateAccountError");   
            
AddCondition(3, cf_trigger, "On changing password success", "Email & Password - changing password", 
            "On changing password success", 
            "Triggered when changing password success.", "EmailPassword_OnChangingPasswordSuccessfully");
            
AddCondition(4, cf_trigger, "On changing password error", "Email & Password - changing password", 
            "On changing password error", 
            "Triggered when changing password error.", "EmailPassword_OnChangingPasswordError");    
            
AddCondition(5, cf_trigger, "On sending password result email success", "Email & Password - sending password result email", 
            "On sending password result email success", 
            "Triggered when sending password result email success.", "EmailPassword_OnSendPasswordResultEmailSuccessfully");
            
AddCondition(6, cf_trigger, "On sending password result email error", "Email & Password - sending password result email", 
            "On sending password result email error", 
            "Triggered when sending password result email error.", "EmailPassword_OnSendPasswordResultEmailError");                         
     
AddCondition(7, cf_trigger, "On deleting user success", "Email & Password - deleting user", 
            "On deleting user success", 
            "Triggered when deleting user success.", "EmailPassword_OnDeleteUserSuccessfully");
            
AddCondition(8, cf_trigger, "On deleting user error", "Email & Password - deleting user", 
            "On sending password result email error", 
            "Triggered when deleting user error.", "EmailPassword_OnDeleteUserError"); 
            
AddCondition(9, cf_trigger, "On updating profile success", "Email & Password - update profile", 
            "On update profile success", 
            "Triggered when updating profile success.", "EmailPassword_OnUpdatingProfileSuccessfully");
            
AddCondition(10, cf_trigger, "On updating profile error", "Email & Password - update profile", 
            "On update profile error", 
            "Triggered when updating profile error.", "EmailPassword_OnUpdatingProfileError");         

AddCondition(21, cf_trigger, "Is anonymous", "Anonymous", 
            "Is anonymous login", 
            "Return true if current user is anonymous.", "IsAnonymous");                  
                        
// general            
AddCondition(31, cf_trigger, "On login success", "General - login", 
            "On login success", 
            "Triggered when login success.", "OnLoginSuccessfully");
            
AddCondition(32, cf_trigger, "On login error", "General - login", 
            "On login error", 
            "Triggered when login error.", "OnLoginError");

AddCondition(33, cf_trigger, "On logged out", "General - logged out", 
            "On logged out", 
            "Triggered when logged out.", "OnLoggedOut");	

AddCondition(34, 0, "Is login", "General - login", 
            "Is login", 
            "Return true if logging now.", "IsLogin");     

            
AddCondition(41, cf_trigger, "On login by other app", "General - login", 
            "On login by other app", 
            "Triggered when login by other app.", "OnLoginByOther");                        
            
AddCondition(42, cf_trigger, "On logged out by other app", "General - logged out", 
            "On logged out by other app", 
            "Triggered when logged out by other app.", "OnLoggedOutByOther");	


AddCondition(51, cf_trigger, "On link success", "Link multiple auth providers", 
            "On link success", 
            "Triggered when link success.", "OnLinkSuccessfully");
            
AddCondition(52, cf_trigger, "On link error", "Link multiple auth providers", 
            "On link error", 
            "Triggered when link error.", "OnLinkError");            
//////////////////////////////////////////////////////////////
// Actions 

// email - password  
AddStringParam("Email", "User email", '""');
AddStringParam("Password", "User password", '""');
AddAction(1, 0, "Create account", "Email & Password", 
          "Create account with email: <i>{0}</i>, password: <i>{1}</i>", 
          "Create account with email & password.", "EmailPassword_CreateAccount");

AddStringParam("Email", "User email", '""');
AddStringParam("Password", "User password", '""');
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember", "Persisting type");
AddAction(2, 0, "Login", "Email & Password", 
          "Login with email: <i>{0}</i>, password: <i>{1}</i>, persisting type to <i>{2}</i>", 
          "Login with email & password.", "EmailPassword_Login");
          
AddStringParam("Email", "(2.x) User email", '""');
AddStringParam("Old password", "(2.x) Old password", '""');
AddStringParam("New password", "New password", '""');
AddAction(3, 0, "Change password", "Email & Password", 
          "Change password to <i>{1}</i>", 
          "Change password of current user.", "EmailPassword_ChangePassword");          

AddStringParam("Email", "User email", '""');
AddAction(4, 0, "Sending password reset email", "Email & Password", 
          "Sending password reset email: <i>{0}</i>", 
          "Sending password reset email", "EmailPassword_SendPasswordResultEmail"); 
             
AddStringParam("Email", "(2.x) User email", '""');
AddStringParam("Password", "(2.x) User password", '""');
AddAction(5, 0, "Delete user", "Email & Password", 
          "Delete current user", 
          "Delete current user.", "EmailPassword_DeleteUser");                  
          
// anonymous   
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember", "Persisting type");       
AddAction(11, 0, "Login", "Anonymous", 
          "Login with anonymous, persisting type to <i>{0}</i>", 
          "Login with anonymous.", "Anonymous_Login");   
          
AddStringParam("Token", "Token", '""');
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember", "Persisting type");       
AddAction(12, 0, "Login", "Authentication token", 
          "Login with token <i>{0}</i>, persisting type to <i>{1}</i>", 
          "Login with authentication token.", "AuthenticationToken_Login");          
          
// facebook/google/twitter/github
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

AddStringParam("Access token", 'Access token from other plugin. Set "" if using official facebook to login.', '""');
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember ", "Persisting type");
AddStringParam("scope", "A comma-delimited list of requested extended permissions");	  
AddAction(22, 0, "Connect Facebook", "Authentication with token", 
          "Authentication with Facebook access token <i>{0}</i>, persisting type to <i>{1}</i>, scope to <i>{2}</i>", 
          "Authentication with Facebook access token, call it after facebook login.", "AuthWithOAuthToken_FB");
          
AddStringParam("Provider", "Code of authentication provider.", '""');
AddComboParamOption("popup");
AddComboParamOption("redirect");
AddComboParam("Type ", "Type of login window");
AddComboParamOption("default");
AddComboParamOption("sessionOnly");
AddComboParamOption("never");
AddComboParam("Remember ", "Persisting type");
AddStringParam("scope", "A comma-delimited list of requested extended permissions");
AddAction(23, 0, "Login (provider name)", "Authentication provider", 
          "Login by <i>{0}</i> with <i>{1}</i>, persisting type to <i>{2}</i>, scope to <i>{3}</i>", 
          "Login by authentication provider.", "ProviderAuthentication_Login");          
		  
// general         
AddAction(31, 0, "Logging out", "General", 
          "Logging out current account", 
          "Logging out current account.", "LoggingOut");                           
		
// online       
AddAction(41, 0, "Go offline", "Online", 
          "Go offline", 
          "Manually disconnect the Firebase client from the server and disable automatic reconnection.", "GoOffline");
AddAction(42, 0, "Go online", "Online", 
          "Go online", 
          "Manually reestablish a connection to the Firebase server and enable automatic reconnection.", "GoOnline");  
          
// link , 3.x only        
AddStringParam("Access token", 'Access token from other plugin. Set "" if using official facebook to login.', '""');
AddAction(51, 0, "Link to facebook", "Link multiple auth providers", 
          "Link to facebook account by access token: <i>{0}</i>", 
          "Link to facebook account by access token.", "LinkToFB");
          
AddStringParam("ID token", 'ID token from other plugin.', '""');
AddAction(52, 0, "Link to google", "Link multiple auth providers", 
          "Link to google account by ID token: <i>{0}</i>", 
          "Link to google account by ID token.", "LinkToGoogle");
          
AddStringParam("Email", "User email", '""');
AddStringParam("Password", "User password", '""');
AddAction(53, 0, "Link to email-password", "Link multiple auth providers", 
          "Link to email: <i>{0}</i>, password: <i>{1}</i>", 
          "Link to email-password.", "LinkToEmailPassword");          
	  
// 3.x only
AddStringParam("Display name", "Display name of current user.", '""');
AddStringParam("Photo URL", "Photo URL of current user", '""');
AddAction(61, 0, "Update profile", "Email & Password", 
          "Update display name to <i>{0}</i>, photo URL to <i>{1}</i>", 
          "Update profile. 3.x only.", "UpdateProfile");	  
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(2, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");     
AddExpression(3, ef_return_string, "User ID", "General auth data", "UserID", 
              "Unique user ID, intended as the user's unique key across all providers.");
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
AddExpression(11, ef_return_string, "Error detail", "Error", "ErrorDetail", 
              "Error detail.");
AddExpression(12, ef_return_string, "Photo URL", "General auth data", "PhotoURL", 
              "Photo URL.");              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data. Deprecated in firebase3.x."),    
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
