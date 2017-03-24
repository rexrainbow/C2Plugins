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
AddCondition(1, cf_trigger, "On created account", "Email & Password - create account", 
            "On created account success", 
            "Triggered when created account success.", "EmailPassword_OnCreateAccountSuccessful");
            
AddCondition(2, cf_trigger, "On created account error", "Email & Password - create account", 
            "On create account error", 
            "Triggered when created account error.", "EmailPassword_OnCreateAccountError");   
            
AddCondition(3, cf_trigger, "On changed password", "Email & Password - change password", 
            "On changed password success", 
            "Triggered when changed password success.", "EmailPassword_OnChangingPasswordSuccessful");
            
AddCondition(4, cf_trigger, "On changed password error", "Email & Password - change password", 
            "On changed password error", 
            "Triggered when changed password error.", "EmailPassword_OnChangingPasswordError");    
            
AddCondition(5, cf_trigger, "On sent password reset email", "Email & Password - send password reset email", 
            "On sent password reset email success", 
            "Triggered when sent password reset email success.", "EmailPassword_OnSendPasswordResetEmailSuccessful");
            
AddCondition(6, cf_trigger, "On sent password reset email error", "Email & Password - send password reset email", 
            "On sent password reset email error", 
            "Triggered when sent password reset email error.", "EmailPassword_OnSendPasswordResetEmailError");                         
     
AddCondition(7, cf_trigger, "On deleted user", "Email & Password - delete user", 
            "On deleted user", 
            "Triggered when deleted user success.", "EmailPassword_OnDeleteUserSuccessful");
            
AddCondition(8, cf_trigger, "On deleted user error", "Email & Password - delete user", 
            "On deleted user error", 
            "Triggered when deleted user error.", "EmailPassword_OnDeleteUserError"); 
            
AddCondition(9, cf_trigger, "On updated profile", "Email & Password - update profile", 
            "On update profile success", 
            "Triggered when updated profile success.", "EmailPassword_OnUpdatingProfileSuccessful");
            
AddCondition(10, cf_trigger, "On updated profile error", "Email & Password - update profile", 
            "On update profile error", 
            "Triggered when updated profile error.", "EmailPassword_OnUpdatingProfileError");      

AddCondition(11, cf_trigger, "On updated email", "Email & Password - update email", 
            "On update email success", 
            "Triggered when updated email success.", "EmailPassword_OnUpdatingEmailSuccessful");
            
AddCondition(12, cf_trigger, "On updated email error", "Email & Password - update email", 
            "On update email error", 
            "Triggered when updated email error.", "EmailPassword_OnUpdatingEmailError");                

AddCondition(13, cf_trigger, "On send verification email", "Email & Password - send verification email", 
            "On send verification email success", 
            "Triggered when send verification email success.", "EmailPassword_OnSendVerificationEmailSuccessful");
            
AddCondition(14, cf_trigger, "On send verification email error", "Email & Password - send verification email", 
            "On send verification email error", 
            "Triggered when send verification email error.", "EmailPassword_OnSendVerificationEmailError");   


AddCondition(21, cf_trigger, "Is anonymous", "Anonymous", 
            "Is anonymous login", 
            "Return true if current user is anonymous.", "IsAnonymous");                  
                        
// general            
AddCondition(31, cf_trigger, "On login", "General - login", 
            "On login success", 
            "Triggered when login success.", "OnLoginSuccessful");
            
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


AddCondition(51, cf_trigger, "On link", "Link multiple auth providers", 
            "On link success", 
            "Triggered when link success.", "OnLinkSuccessful");
            
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
AddAction(4, 0, "Send password reset email", "Email & Password", 
          "Send password reset email: <i>{0}</i>", 
          "Send password reset email", "EmailPassword_SendPasswordResetEmail"); 
             
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

AddStringParam("Email", "User email", '""');
AddAction(62, 0, "Update email", "Email & Password", 
          "Update email to <i>{0}</i>", 
          "Update email. 3.x only.", "UpdateEmail");	           

AddAction(63, 0, "Send verification email", "Email & Password", 
          "Send verification email", 
          "Send verification email. 3.x only.", "SendEmailVerification");          
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
              
// ef_deprecated              
AddExpression(8, ef_deprecated | ef_return_string, "Cached user profile", "General auth data", "CachedUserProfile", 
              "Cached user profile from provier.");	
// ef_deprecated
              
AddExpression(9, ef_return_string, "Email", "General auth data", "Email", 
              "The user's primary email address as listed on their profile. Returned only if a valid email address is available, and the email permission was granted by the user. ");	
              
// ef_deprecated               
AddExpression(10, ef_deprecated | ef_return_string, "User name", "General auth data", "UserName", 
              "The user's screen name, handle, or alias. Twitter screen names are unique, but subject to change. .");
// ef_deprecated              
              
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
