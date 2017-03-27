function GetPluginSettings()
{
	return {
		"name":			"Token",
		"id":			"Rex_Firebase_Token",
		"version":		"0.1",        
		"description":	"The first user of a group.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_token.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get token", "Token", 
            "On get token", 
            "Triggered when get the token.", "OnGetToken");
            
AddCondition(2, cf_trigger, "On owner changed", "Token", 
            "On owner changed", 
            "Triggered when token owner changed.", "OnTokenOwnerChanged");            
            
AddCondition(3, 0, "Is owner", "Token", 
            "Is owner", 
            "Return true if thie client owns the token.", "IsOwner");     
            
AddCondition(4, cf_trigger, "On release token", "Token", 
            "On release token", 
            "Triggered when release the token.", "OnReleaseToken");             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddStringParam("User ID", "Key of User ID.", '""');
AddAction(1, 0, "Join", "Group", 
          "Join into group with user ID:<i>{0}</i>", 
          "Join into group, try to get token.", "JoinGroup");
          
AddAction(2, 0, "Leave", "Group", 
          "Leave group", 
          "Leave group, release owned token.", "LeaveGroup");                          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get owner ID", "Token", "OwnerID", 
              "Get owner ID."); 
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Token", "Sub domain of this function."),  
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
