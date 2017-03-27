function GetPluginSettings()
{
	return {
		"name":			"User list",
		"id":			"Rex_Firebase_Userlist",
		"version":		"0.1",        
		"description":	"User lists on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_userlist.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On receiving all", "User list", 
            "On receiving all owner's lists", 
            "Triggered when received all owner's lists.", "OnReceivingAllLists");      

AddStringParam("List", "List name.", '""');
AddCondition(2, cf_looping | cf_not_invertible, "For each User ID", "User list - For each", 
             "For each User ID in owner's list <i>{0}</i>", 
             "Repeat the event for each user ID in list.", "ForEachUserIDInList"); 

AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("List", "List name.", '"friends"');             
AddCondition(3, 0, "User ID in list", "User list", 
             "User ID <i>{0}</i> in owner's list <i>{1}</i>", 
             "Return true if User ID in list.", "UserIDInList");             
              
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("User ID", "User ID from authentication.", '""');
AddAction(1, 0, "Set owner", "Owner", 
          "Set user ID of owner to <i>{0}</i>", 
          "Set user ID of owner.", "SetOwner");
          
AddAction(2, 0, "Request lists", "User list - Request", 
          "Request all lists of owner", 
          "Request all lists of owner.", "RequestAllLists");
          
AddStringParam("Target user ID", "User ID of target user.", '""');
AddStringParam("Owner list", "List's name of owner.", '"following"');
AddStringParam("Target user list", "List's name of target user.", '"follower"');
AddAction(11, 0, "Add user in both sides", "User list - bi-direction", 
          "Add target user ID: <i>{0}</i> into owner's list <i>{1}</i>, and add owner user ID into target user list <i>{2}</i>", 
          "Add user in both sides.", "AddUserIn2Sides"); 
          
AddStringParam("Target user ID", "User ID of target user.", '""');
AddStringParam("Owner list", "List's name of owner.", '"following"');
AddStringParam("Target user list", "List's name of target user.", '"follower"');
AddAction(12, 0, "Remove user in both sides", "User list - bi-direction", 
          "Remove target user ID: <i>{0}</i> from owner's list <i>{1}</i>, and remove owner user ID from target user list <i>{2}</i>", 
          "Remove user from both sides.", "RemoveUserFrom2Sides");                                

AddStringParam("User ID", "User ID of target user.", '""');
AddStringParam("Owner list", "List's name of owner.", '"blacklist"');
AddAction(13, 0, "Add user", "User list", 
          "Add target user ID: <i>{0}</i> into owner's list <i>{1}</i>", 
          "Add user into owner's list.", "AddUser");
          
AddStringParam("User ID", "User ID of target user.", '""');
AddStringParam("Owner list", "List's name of owner.", '"blacklist"');
AddAction(14, 0, "Remove user", "User list", 
          "Remove target user ID: <i>{0}</i> from owner's list <i>{1}</i>", 
          "Remove user from owner's list.", "RemoveUser");  

AddStringParam("Target user ID", "User ID of target user.", '""');
AddStringParam("Owner list", "List's name of owner.", '"friend"');
AddStringParam("Target user list", "List's name of target user.", '"friend"');
AddStringParam("Message", "Message of invitation.", '""');
AddAction(21, 0, "Invite user", "User list - invitation", 
          "Invite target user ID: <i>{0}</i> into owner's list <i>{1}</i>, and add owner user ID into target user list <i>{2}</i> with message to <i>{3}</i>", 
          "Invite user.", "InviteUser"); 
          
AddStringParam("Inviter user ID", "User ID of inviter user.", '""');
AddComboParamOption("Reject");
AddComboParamOption("Accept");
AddComboParam("Response", "Result of response", 1);
AddAction(22, 0, "Response invitation", "User list - invitation", 
          "<i>{1}</i> invitation from user ID: <i>{0}</i>", 
          "Response invitation.", "ResponseInvitation");  

AddStringParam("Target user ID", "User ID of target user.", '""');
AddAction(23, 0, "Cancel invitation", "User list - invitation", 
          "Cancel invitation to user ID: <i>{0}</i>", 
          "Cancel invitation.", "CancelInvitation"); 
          
AddStringParam("Target user ID", "User ID of target user.", '""');
AddStringParam("Owner list", "List's name of owner.", '"friend"');
AddStringParam("Target user list", "List's name of target user.", '"friend"');
AddAction(24, 0, "Remove membership", "User list - invitation", 
          "Remove target user ID: <i>{0}</i> from owner's list <i>{1}</i>, and remove owner user ID from target user list <i>{2}</i>", 
          "Remove membership.", "RemoveMembership");        
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "User ID of owner", "Owner", "OwnerUserID", 
              "Get user ID of owner."); 
AddExpression(11, ef_return_string, "Current user ID", "User list - For each", "CurUserID", 
              "Get the current user ID in a For Each loop."); 
              
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
