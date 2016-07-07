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
	};
};

//////////////////////////////////////////////////////////////
// Conditions 
// Room - create       
AddCondition(11, cf_trigger, "On create", "Create room", 
            "On create room", 
            "Triggered when room created.", "OnCreateRoom");
            
AddCondition(12, cf_trigger, "On create error", "Create room", 
            "On create room error", 
            "Triggered when room created error.", "OnCreateRoomError");  
                                  
// Room - join            
AddCondition(13, cf_trigger, "On join", "Join room", 
            "On join room", 
            "Triggered when join room.", "OnJoinRoom");
            
AddCondition(14, cf_trigger, "On join error", "Join room", 
            "On join room error", 
            "Triggered when join room error.", "OnJoinRoomError");                
// Room - leave
AddCondition(15, cf_trigger, "On left", "Leave room", 
            "On left room", 
            "Triggered when left room or room removed", "OnLeftRoom");
        
AddCondition(16, cf_trigger, "On kicked", "Leave room", 
            "On kicked out from room", 
            "Triggered when user kicked out or room removed.", "OnKicked");
           
// Room            
AddCondition(19, 0, "In room", "Room", 
            "Is in a room",
            "Return true if current user is in a room.", "IsInRoom");              
            
// room list            
AddCondition(21, cf_trigger, "On update", "Rooms list", 
            "On update rooms list",
            "Triggered when rooms list updated.", "OnUpdateRoomsList");     
AddCondition(22, cf_looping | cf_not_invertible, "For each room", "Rooms list", 
             "For each room", 
             "Repeat the event for each room in rooms list.", "ForEachRoom");     
AddNumberParam("Start", "Start from index (0-based).", 0);  
AddNumberParam("End", "End to index (0-based). This value should larger than Start.", 2);    
AddCondition(23, cf_looping | cf_not_invertible, "For each room in a range", "Rooms list", 
             "For each room from <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each room in a range.", "ForEachRoom");

// user list
AddCondition(31, cf_trigger, "On update", "Users list", 
            "On update user list",
            "Triggered when user list updated.", "OnUpdateUsersList"); 
AddCondition(32, cf_looping | cf_not_invertible, "For each user", "Users list", 
             "For each user", 
             "Repeat the event for each room in rooms list.", "ForEachUser");     
AddNumberParam("Start", "Start from index (0-based).", 0);  
AddNumberParam("End", "End to index (0-based). This value should larger than Start.", 2);    
AddCondition(33, cf_looping | cf_not_invertible, "For each user in a range", "Users list", 
             "For each user from <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each user in a range.", "ForEachUser"); 
AddCondition(35, cf_trigger, "On user joined", "Users list", 
            "On user joined",
            "Triggered when user joined.", "OnUserJoin");
AddCondition(36, cf_trigger, "On user left", "Users list", 
            "On user left",
            "Triggered when user left.", "OnUserLeft");
AddCondition(37, 0, "I am first user", "Users list", 
            "I am first user",
            "Return true if client is the first user of current room.", "IsFirstUser");            
AddCondition(38, 0, "Is full", "Users list", 
            "Room is full",
            "Return true if room is full of users.", "IsFull");                   
AddCondition(39, cf_trigger, "On become first user", "Users list", 
            "On become first user",
            "Triggered when became first user of current room.", "OnBecomeFirstUser");   
            
// deprecated            
AddCondition(41, cf_deprecated| cf_trigger, "On receive", "Message", 
            "On receive message",
            "Triggered when received message.", "OnReceivedMessage");                       
            
AddCondition(51, cf_trigger, "On receive permission lists", "Room - permission list", 
            "On receive permission lists",
            "Triggered when receive permission lists.", "OnReceivedPermissionLists");            
            
AddCondition(100, 0, "Locked", "Action", 
            "Is locked",
            "Return true if plugin is locked which could not run any action.", "IsLocked");                            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAction(1, 0, "Set user", "User info", 
          "Set user name to <i>{1}</i>, user ID to <i>{0}</i>", 
          "Set user info.", "SetUserInfo");

AddStringParam("Name", "Room name.", '""');
AddStringParam("Type", 'Room type. "public", "private", or others.', '"public"');
AddNumberParam("Max peers", "The maximum number of peers that can join this room. Leave 0 for unlimited.", 0);
AddComboParamOption("Temporary");
AddComboParamOption("Persisted");
AddComboParam("Life period ", "Life period of this room.", 0);
AddComboParamOption("Closed");
AddComboParamOption("Open");
AddComboParam("Door state", "Door state of this room.", 1);
AddComboParamOption("Anyone");
AddComboParamOption("Black list");
AddComboParamOption("White list");
AddComboParam("Join permission", "Join permission.", 0);
AddStringParam("Room ID", 'Room ID. Leave "" to use timestamp form server.', '""');
AddComboParamOption("Create");
AddComboParamOption("Leave current room, then create or join");
AddComboParam("Create action", "Create action.", 1);
AddAction(11, 0, "Create", "Room", 
          "{7} <i>{3}</i> <i>{1}</i> room: <i>{0}</i>, ID: <i>{6}</i>, with max peers to <i>{2}</i>, door state to <i>{4}</i>, Join permission to <i>{5}</i>", 
          "Create then join this room.", "CreateRoom"); 

AddComboParamOption("Closed");
AddComboParamOption("Open");
AddComboParam("Door state", "Door state of this room.", 1);
AddAction(12, 0, "Open or close", "Room state", 
          "<i>{0}</i> current room", 
          "Open or close current room.", "SwitchDoor");    
          
AddStringParam("Name", "Room name.", '""');
AddStringParam("Type", 'Room type. "public", "private", or others.', '"public"');
AddNumberParam("Max peers", "The maximum number of peers that can join this room. Leave 0 for unlimited.", 0);
AddNumberParam("Life period", "0=Temporary, 1=Persisted.", 0);
AddNumberParam("Door state", "0=Closed, 1=Open.", 1);
AddNumberParam("oin permission", "0=Anyone, 1=Black list, 2=White list.", 0);
AddStringParam("Room ID", 'Room ID. Leave "" to use timestamp form server.', '""');
AddComboParamOption("Create");
AddComboParamOption("Create then join");
AddComboParam("Create action", "Create action.", 1);
AddAction(13, 0, "Create (#)", "Room", 
          "{7} <i>{3}</i> <i>{1}</i> room: <i>{0}</i>, ID: <i>{6}</i>, with max peers to <i>{2}</i>, door state to <i>{4}</i>, Join permission to <i>{5}</i>", 
          "Create then join this room.", "CreateRoom");                    
          
AddStringParam("Room ID", "Room ID.", '""');
AddComboParamOption("Join");
AddComboParamOption("Leave current room then join");
AddComboParam("Join action", "Join action.", 1);
AddAction(15, 0, "Join", "Room", 
          "{1} room ID: <i>{0}</i>", 
          "Join room.", "JoinRoom"); 

AddAction(16, 0, "Leave", "Room", 
          "Leave current room", 
          "Leave current room.", "LeaveRoom"); 
          
// deprecated          
AddStringParam("Name", "Room name.", '""');
AddStringParam("Type", 'Room type. "public", "private", or others.', '"public"');
AddNumberParam("Max peers", "The maximum number of peers that can join this room. Leave 0 for unlimited.", 0);
AddComboParamOption("Temporary");
AddComboParamOption("Persisted");
AddComboParam("Life period ", "Life period of this room.", 0);
AddComboParamOption("Closed");
AddComboParamOption("Open");
AddComboParam("Door state", "Door state of this room.", 1);
AddComboParamOption("Anyone");
AddComboParamOption("Black list");
AddComboParamOption("White list");
AddComboParam("Join permission", "Join permission.", 0);
AddStringParam("Room ID", 'Room ID. Leave "" to use timestamp form server.', '""');
AddAction(17, af_deprecated, "Create or join", "Room", 
          "Create or join <i>{3}</i> <i>{1}</i> room: <i>{0}</i>, ID: <i>{6}</i>, with max peers to <i>{2}</i>, door state to <i>{4}</i>, Join permission to <i>{5}</i>", 
          "Try create room, or join the room if existed.", "CreateOrJoinRoom");           
          
// deprecated          
AddStringParam("Name", "Room name.", '""');
AddStringParam("Type", 'Room type. "public", "private", or others.', '"public"');
AddNumberParam("Max peers", "The maximum number of peers that can join this room. Leave 0 for unlimited.", 0);
AddNumberParam("Life period", "0=Temporary, 1=Persisted.", 0);
AddNumberParam("Door state", "0=Closed, 1=Open.", 1);
AddNumberParam("oin permission", "0=Anyone, 1=Black list, 2=White list.", 0);
AddStringParam("Room ID", 'Room ID. Leave "" to use timestamp form server.', '""');
AddAction(18, af_deprecated, "Create or join (#)", "Room", 
          "Create <i>{3}</i> <i>{1}</i> room: <i>{0}</i>, ID: <i>{6}</i>, with max peers to <i>{2}</i>, door state to <i>{4}</i>, Join permission to <i>{5}</i>", 
          "Create room.", "CreateOrJoinRoom"); 
                    
//AddStringParam("Room ID", "Room ID.", '""');
//AddComboParamOption("Anyone");
//AddComboParamOption("Creater");
//AddComboParam("Permission ", "Permission.", 1);
//AddAction(17, 0, "Remove", "Room", 
//          "Remove room ID: <i>{0}</i> (Permission: <i>{1}</i>)", 
//          "Remove room.", "RemoveRoom");        

AddStringParam("Type", 'Room type. "public", "private", or others. Leave "" to get all "open" rooms for all types.', '"public"');          
AddAction(21, 0, "Update", "Room list", 
          "Start updating <i>{0}</i> rooms list", 
          "Update opened rooms list.", "UpdateOpenRoomsList"); 

AddAction(22, 0, "Stop updating", "Room list", 
          "Stop updating rooms list", 
          "Stop updating opened rooms list.", "StopUpdatingOpenRoomsList");   
          
// deprecated          
AddStringParam("Message", "Message.", '""');
AddAction(41, af_deprecated, "Broadcast", "Message", 
          "Broadcast message: <i>{0}</i>", 
          "Broadcast message.", "BroadcastMessage");
          
// unfinished       
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAction(51, af_deprecated, "Add white list", "Room - permission list", 
          "Add user <i>{1}</i>, ID: <i>{0}</i> to white list", 
          "Add user to white list.", "AddUserToWhiteList");             

AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(52, af_deprecated, "Remove white list", "Room - permission list", 
          "Remove user ID: <i>{0}</i> from white list", 
          "Remove user from white list.", "RemoveUserFromWhiteList");    
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAction(55, af_deprecated, "Add black list", "Room - permission list", 
          "Add user <i>{1}</i>, ID: <i>{0}</i> to black list", 
          "Add user to black list.", "AddUserToBlackList");             

AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(56, af_deprecated, "Remove black list", "Room - permission list", 
          "Remove user ID: <i>{0}</i> from black list", 
          "Remove user from black list.", "RemoveUserFromBlackList"); 
          
AddAction(59, af_deprecated, "Request permission lists", "Room - permission list", 
          "Request permission lists", 
          "Request permission list (white list, black list).", "RequestPermissionLists");                         
    
                   
//AddStringParam("UserID", "UserID from authentication.", '""');          
//AddAction(90, 0, "Request", "User metadata", 
//          "Request metadata of user ID: <i>{0}</i>", 
//          "Request metadata of the user.", "RequestUserMetadata");           
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "My user name", "My", "UserName", 
              "Get my user name.");  
AddExpression(2, ef_return_string, "My user ID", "My", "UserID", 
              "Get my user ID.");
              
AddExpression(11, ef_return_string, "Room name", "Room", "RoomName", 
              "Get current room name.");  
AddExpression(12, ef_return_string, "Room ID", "Room", "RoomID", 
              "Get current room ID.");
AddExpression(13, ef_return_string, "Triggered room name", "Triggered", "TriggeredRoomName", 
              "Get triggered room name.");  
AddExpression(14, ef_return_string, "Triggered room ID", "Triggered", "TriggeredRoomID", 
              "Get triggered room ID.");              
              
// rooms list              
AddExpression(21, ef_return_string, "Current room name", "Rooms list - for each", "CurRoomName", 
              "Get the current room name in a For Each loop.");  
AddExpression(22, ef_return_string, "Current room ID", "Rooms list - for each", "CurRoomID", 
              "Get the current room ID in a For Each loop.");       
AddExpression(23, ef_return_string, "Current creater name", "Rooms list", "CurCreaterName", 
              "Get the current creater name in a For Each loop.");  
AddExpression(24, ef_return_string, "Current creater ID", "Rooms list", "CurCreaterID", 
              "Get the current creater ID in a For Each loop.");  
AddNumberParam("Index", "Room index.", 0);
AddExpression(25, ef_return_string, "Get room name by room index", "Rooms list - index", "RoomIndex2Name", 
              "Get room name by room index.");  
AddNumberParam("Index", "Room index.", 0);              
AddExpression(26, ef_return_string, "Get room ID by room index", "Rooms list - index", "RoomIndex2ID", 
              "Get room ID by room index.");  
              
// users list              
AddExpression(31, ef_return_string, "Current user name", "Users list", "CurUserName", 
              "Get the current user name in a For Each loop.");  
AddExpression(32, ef_return_string, "Current user ID", "Users list", "CurUserID", 
              "Get the current user ID in a For Each loop.");  
AddNumberParam("Index", "User index.", 0);
AddExpression(33, ef_return_string, "Get user name by user index", "Users list - index", "UserIndex2Name", 
              "Get user name by user index.");  
AddNumberParam("Index", "User index.", 0);              
AddExpression(34, ef_return_string, "Get user ID by user index", "Users list - index", "UserIndex2ID", 
              "Get user ID by user index.");  
AddExpression(35, ef_return_string, "Triggered user name", "Users list", "TriggeredUserName", 
              "Get triggered user name.");  
AddExpression(36, ef_return_string, "Triggered user ID", "Users list", "TriggeredUserID", 
              "Get triggered user ID.");                 

// deprecated              
AddExpression(41, ef_deprecated | ef_return_string, "Lest sender ID", "Message", "LastSenderID", 
              "Get sender ID of last message.");  
AddExpression(42, ef_deprecated | ef_return_string, "Lest sender name", "Message", "LastSenderName", 
              "Get sender name of last message.");            
AddExpression(43, ef_deprecated | ef_return_string, "Lest message", "Message", "LastMessage", 
              "Get last message.");  

AddExpression(51, ef_return_string, "Get white list", "White list", "WhiteListToJSON", 
              "Get white list in JSON string.");
			  
AddExpression(52, ef_return_string, "Get black list", "Black list", "BlackListToJSON", 
              "Get black list in JSON string.");
          
//AddStringParam("Channel name", "Custom channel name.", '""');  
AddExpression(81, ef_return_string | ef_variadic_parameters, "Get custom channel reference", "Custom channel", "ChannelRef", 
              "Get custom channel absolute reference. Add 2nd parameter for roomID.");
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Rooms", "Sub domain for this function."),
    //new cr.Property(ept_combo, "Message type", "String", "Sent message type, string or JSON object in string.", "String|JSON string"),    
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
