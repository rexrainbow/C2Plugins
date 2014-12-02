function GetPluginSettings()
{
	return {
		"name":			"User list",
		"id":			"Rex_Firebase_Userlist",
		"version":		"0.1",        
		"description":	"User list on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_userlist.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions        
AddCondition(1, cf_trigger, "On login successfully", "Login", 
            "On login successfully", 
            "Triggered when login successfully.", "OnLoginSuccessfully");
            
AddCondition(2, cf_trigger, "On login error", "Login", 
            "On login error", 
            "Triggered when login error.", "OnLoginError");
            
AddCondition(3, cf_trigger, "On logged out", "Login", 
            "On logged out", 
            "Triggered when logged out.", "OnLoggedOut");
            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAction(1, 0, "Login", "Login", 
          "Login with name: <i>{1}</i>, ID: <i>{0}</i>", 
          "Login.", "Login");
          
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
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
