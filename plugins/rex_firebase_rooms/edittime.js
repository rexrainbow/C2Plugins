function GetPluginSettings()
{
	return {
		"name":			"Rooms",
		"id":			"Rex_Firebase_Rooms",
		"version":		"0.1",        
		"description":	"Rooms on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_rooms.html",
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
            
AddCondition(11, cf_trigger, "On create successfully", "Room", 
            "On create room successfully", 
            "Triggered when create room successfully.", "OnCreateRoomSuccessfully");
            
AddCondition(12, cf_trigger, "On create error", "Room", 
            "On create room error", 
            "Triggered when create room error.", "OnCreateRoomError");
            
AddCondition(13, cf_trigger, "On join successfully", "Room", 
            "On join room successfully", 
            "Triggered when join room successfully.", "OnJoinRoomSuccessfully");
            
AddCondition(14, cf_trigger, "On join error", "Room", 
            "On join room error", 
            "Triggered when join room error.", "OnJoinRoomError");            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAction(1, 0, "Login", "Login", 
          "Login with name: <i>{1}</i>, ID: <i>{0}</i>", 
          "Login.", "Login");
          
AddAction(2, 0, "Logging out", "Login", 
          "Logging out", 
          "Logging out.", "LoggingOut");          

AddComboParamOption("Create & Join");
AddComboParamOption("Create persisted");
AddComboParam("Action ", "Action type", 0);
AddStringParam("Name", "Room name.", '""');
AddComboParamOption("Private");
AddComboParamOption("Public");
AddComboParam("Type ", "room type", 1);
AddNumberParam("Max peers", "The maximum number of peers that can join this room. Leave 0 for unlimited.", 0);
AddAction(11, 0, "Create", "Room", 
          "<i>{0}</i> <i>{2}</i> room: <i>{1}</i> with max peers to <i>{3}</i>", 
          "Create room.", "CreateRoom");  

AddStringParam("Name", "Room name.", '""');
AddAction(12, 0, "Join", "Room", 
          "Join room: <i>{0}</i>", 
          "Join room.", "JoinRoom"); 

AddAction(13, 0, "Leave", "Room", 
          "Leave current room", 
          "Leave current room.", "LeaveRoom");       
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
