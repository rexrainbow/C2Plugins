function GetPluginSettings()
{
	return {
		"name":			"Single login",
		"id":			"Rex_Firebase_SingleLogin",
		"version":		"0.1",        
		"description":	"Test if user account had been logined on one client only.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_singlelogin.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On success", "Login", 
            "On login success",
            "Triggered when single login success.", "OnLoginSuccess");
            
AddCondition(2, cf_trigger, "On error", "Login", 
            "On login error",
            "Triggered when single login error.", "OnLoginError");            
            
AddCondition(3, cf_trigger, "On kicked", "Multiple login", 
            "On kicked",
            "Triggered when kicked by multiple login.", "OnKicked");
            
AddCondition(4, cf_trigger, "On login list changed", "Multiple login", 
            "On login list changed",
            "Triggered when login list changed.", "OnLoginListChanged");            

AddCondition(11, cf_looping | cf_not_invertible, "For each login", "Multiple login - for each", 
             "For each login", 
             "Repeat the event for each login.", "ForEachLogin");              
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");

AddStringParam("UserID", "User ID.", '""');
AddAction(1, 0, "Login", "Login", 
          "Login with user ID: <i>{0}</i>", 
          "Login.", "Login");
                  
AddAction(2, 0, "Logging out", "General", 
          "Logging out", 
          "Logging out.", "LoggingOut"); 
          
AddNumberParam("Index", "Index in login list.", 0);
AddAction(21, 0, "Kick by index", "Kick", 
          "Kick login by index to <i>{0}</i>", 
          "Kick login by index.", "KickByIndex");          
//////////////////////////////////////////////////////////////
// Expressions	
AddExpression(1, ef_return_number, "Get current login cout", "Multiple login",  "LoginCount", 
              "Get the current login cout.");
              
AddExpression(11, ef_return_number, "Current login index", "Multiple login - for each",  "CurLoginIndex", 
              "Get the current login index in a For Each loop.");
AddExpression(12, ef_return_number, "Current login timestamp", "Multiple login - for each",  "CurLoginTimestamp", 
              "Get the current login timestamp in a For Each loop."); 
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Single-login", "Sub domain for this function."),
    new cr.Property(ept_combo, "Kick mode", "Kick previous", "Choose the kicking action while multiple login.",  "Do nothing|Kick previous|Kick current"),       
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
