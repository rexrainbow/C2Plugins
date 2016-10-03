function GetPluginSettings()
{
	return {
		"name":			"Authentication",
		"id":			"Rex_Parse_Authentication",
		"version":		"0.1",        
		"description":	"Authentication which is provided by parse.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_authentication.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On creating account successfully", "User name & Password - create account", 
            "On creating account successfully", 
            "Triggered when creating account successfully.", "UsernamePassword_OnCreateAccountSuccessfully");
            
AddCondition(2, cf_trigger, "On creating account error", "User name & Password - create account", 
            "On create account error", 
            "Triggered when creating account error.", "UsernamePassword_OnCreateAccountError");
            
AddCondition(5, cf_trigger, "On sending password result email successfully", "User name & Password - sending password result email", 
            "On sending password result email successfully", 
            "Triggered when sending password result email successfully.", "UsernamePassword_OnSendPasswordResultEmailSuccessfully");
            
AddCondition(6, cf_trigger, "On sending password result email error", "User name & Password - sending password result email", 
            "On sending password result email error", 
            "Triggered when sending password result email error.", "UsernamePassword_OnSendPasswordResultEmailError"); 
                            
// general            
AddCondition(31, cf_trigger, "On login successfully", "General - login", 
            "On login successfully", 
            "Triggered when login successfully.", "OnLoginSuccess");
            
AddCondition(32, cf_trigger, "On login error", "General - login", 
            "On login error", 
            "Triggered when login error.", "OnLoginError");

AddCondition(33, cf_trigger, "Is login", "General - login", 
            "Is login", 
            "Return true if logging now.", "IsLogin");
            
AddCondition(101, 0, "Is first login", "Quick login", 
            "Is first login", 
            'Return true if first login by "action: Sign up & Login".', "IsFirstLogin");            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("User name", "Unique user name.");
AddStringParam("Password", "User password");
AddStringParam("Email", "User email, optional.");
AddAction(1, 0, "Create account", "User name & Password - sign up", 
          "Create account with user name to <i>{0}</i>, password to <i>{1}</i>, email to <i>{2}</i>", 
          "Create account with user name & password.", "UsernamePassword_CreateAccount");

AddStringParam("User name", "Unique user name.");
AddStringParam("Password", "User password");
AddAction(2, 0, "Login", "User name & Password - login", 
          "Login with user name to <i>{0}</i>, password to <i>{1}</i>", 
          "Login with user name & password.", "UsernamePassword_Login"); 
       
AddStringParam("Email", "User email");
AddAction(4, 0, "Sending password reset email", "User name & Password - reset password",
          "Sending password reset email to <i>{0}</i>", 
          "Sending password reset email", "UsernamePassword_SendPasswordResultEmail"); 
                   
// general         
AddAction(31, 0, "Logging out", "General", 
          "Logging out current account", 
          "Logging out current account.", "LoggingOut"); 
          

AddStringParam("User name", "Unique user name.");
AddStringParam("Password", "User password");
AddAction(101, 0, "Sign up & Login", "Quick login", 
          "Sign up & login with user name to <i>{0}</i>, password to <i>{1}</i>", 
          "Sign up & login with user name & password.", "UsernamePassword_SignUpLogin");   

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(111, 0, "Set value", "Initial user data", 
          "User data- Set key <i>{0}</i> to <i>{1}</i>", 
          "Set value into current item.", "SetValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1); 
AddAction(112, 0, "Set boolean value", "Initial user data", 
          "User data- Set key <i>{0}</i> to <i>{1}</i>", 
          "Set boolean value into current item.", "SetBooleanValue");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(2, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
AddExpression(3, ef_return_string, "User ID", "General auth data", "UserID", 
              "Unique user ID (object ID in User class)");
AddExpression(4, ef_return_string, "User name", "General auth data", "UserName", 
              "Unique user name.");
AddExpression(5, ef_return_string, "Email", "General auth data", "Email", 
              "Registered Email address.");              

AddExpression(11, ef_return_number, "Get login counter", "General auth data", "LoginCount", 
              "Get login counter (1-base). Return 0 if this feature is not enable.");
                                                                                   
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Login counter", "No", "Enable login counter.", "No|Yes"),	
    new cr.Property(ept_combo, "Revocable session", "No", "Enable revocable session.", "No|Yes"),    
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
