function GetPluginSettings()
{
	return {
		"name":			"Rooms",
		"id":			"Rex_Firebase_Rooms",
		"version":		"0.1",        
		"description":	"Rooms management.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebase_rooms.html",
		"category":		"Rex - Web - Firebase",
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
            
// Room - open or close
AddCondition(17, cf_trigger, "On opened", "Door state", 
            "On opened", 
            "Triggered when room is opened.", "OnOpened");
        
AddCondition(18, cf_trigger, "On closed", "Door state", 
            "On closed", 
            "Triggered when room is closed.", "OnClosed");         
           
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
             "Repeat the event for each user in users list.", "ForEachUser");     
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
          
AddComboParamOption("white - list");
AddComboParamOption("black - lisk");
AddComboParam("List", "List type.", 1);
AddCondition(51, cf_looping | cf_not_invertible, "For each user", "Permission list", 
             "For each user in  <i>{0}</i>", 
             "Repeat the event for each user in permission list.", "ForEachUserInPermissionList");     

AddCondition(100, 0, "Locked", "Action", 
            "Is locked",
            "Return true if plugin is locked which could not run any action.", "IsLocked");     

AddCondition(111, cf_trigger, "On get users list", "Users list", 
            "On get users list", 
            "Triggered when get users list.", "OnGetUsersList");            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "User name.", '""');
AddAction(1, 0, "Set my info", "0. My info", 
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
AddStringParam("Room ID", 'Room ID. Leave "" to use timestamp form server.', '""');
AddComboParamOption("Create");
AddComboParamOption("Leave current room, then create or join");
AddComboParam("Create action", "Create action.", 1);
AddAction(11, 0, "Create", "Room", 
          "{6} <i>{3}</i> <i>{1}</i> room: <i>{0}</i>, ID: <i>{5}</i>, with max peers to <i>{2}</i>, door state to <i>{4}</i>", 
          "Create then join this room.", "CreateRoom"); 

AddComboParamOption("Close");
AddComboParamOption("Open");
AddComboParam("Door state", "Door state of this room.", 1);
AddAction(12, 0, "Open", "Door state", 
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
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(19, 0, "Kick user", "Room", 
          "Kick user ID: <i>{0}</i>", 
          "Kick user.", "KickUser");          
                    
AddStringParam("Type", 'Room type. "public", "private", or others. Leave "" to get all "open" rooms for all types.', '"public"');          
AddAction(21, 0, "Update", "Room list", 
          "Start updating <i>{0}</i> rooms list", 
          "Update opened rooms list.", "UpdateOpenRoomsList"); 

AddAction(22, 0, "Stop updating", "Room list", 
          "Stop updating rooms list", 
          "Stop updating opened rooms list.", "StopUpdatingOpenRoomsList");   
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddComboParamOption("white - list");
AddComboParamOption("black - lisk");
AddComboParam("List", "List type.", 1);
AddAction(51, 0, "Add", "Permission list", 
          "Add user <i>{1}</i>, ID: <i>{0}</i> to <i>{2}</i>", 
          "Add user to permission list.", "PermissionListAdd");             

AddStringParam("UserID", "UserID from authentication.", '""');
AddComboParamOption("white - list");
AddComboParamOption("black - lisk");
AddComboParam("List", "List type.", 1);
AddAction(52, 0, "Remove", "Permission list", 
          "Remove user ID: <i>{0}</i> from <i>{1}</i>", 
          "Remove user from permission list.", "PermissionListRemove");    
          
AddAction(61, 0, "Get metadata", "Room - metadata", 
          "Get metadata", 
          "Get metadata included white list and black list.", "RequestMetadata");                         
          
AddComboParamOption("Join");
AddComboParamOption("Leave current room then join");
AddComboParam("Join action", "Join action.", 1);
AddNumberParam("Retry", "Retry count to get default value.", 10);
AddAction(101, 0, "Join random", "Room", 
          "<i>{0}</i> random room with retry <i>{1}</i> times", 
          "Join random room from current rooms list.", "JoinRandomRoom");           
          
AddStringParam("Room ID", "Room ID.", '""');
AddAction(111, 0, "Get users list of room", "User list", 
          "Get users list of room ID: <i>{0}</i>", 
          "Get users list of room.", "GetUsersList");           
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string | ef_deprecated, "My user name", "My", "UserName", 
              "Get my user name.");  
AddExpression(2, ef_return_string | ef_deprecated, "My user ID", "My", "UserID", 
              "Get my user ID.");

AddExpression(3, ef_return_string, "My user name", "My", "MyUserName", 
              "Get my user name.");  
AddExpression(4, ef_return_string, "My user ID", "My", "MyUserID", 
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
AddExpression(23, ef_return_string, "Current creater name", "Rooms list", "CurCreatorName", 
              "Get the current creater name in a For Each loop.");  
AddExpression(24, ef_return_string, "Current creater ID", "Rooms list", "CurCreatorID", 
              "Get the current creater ID in a For Each loop.");  
AddNumberParam("Index", "Room index.", 0);
AddExpression(25, ef_return_string, "Get room name by room index", "Rooms list - index", "Index2RoomName", 
              "Get room name by room index.");  
AddNumberParam("Index", "Room index.", 0);              
AddExpression(26, ef_return_string, "Get room ID by room index", "Rooms list - index", "Index2RoomID", 
              "Get room ID by room index.");  
AddExpression(27, ef_return_number, "Rooms count", "Rooms list", "RoomsCount", 
              "Get amount of opened rooms.");              
              
// users list              
AddExpression(31, ef_return_string, "Current user name", "Users list - for each", "CurUserName", 
              "Get the current user name in a For Each loop.");  
AddExpression(32, ef_return_string, "Current user ID", "Users list - for each", "CurUserID", 
              "Get the current user ID in a For Each loop.");  
AddNumberParam("Index", "User index.", 0);
AddExpression(33, ef_return_string, "Get user name by user index", "Users list - index", "Index2UserName", 
              "Get user name by user index.");  
AddNumberParam("Index", "User index.", 0);              
AddExpression(34, ef_return_string, "Get user ID by user index", "Users list - index", "Index2UserID", 
              "Get user ID by user index.");  
AddExpression(35, ef_return_string, "Triggered user name", "Users list", "TriggeredUserName", 
              "Get triggered user name.");  
AddExpression(36, ef_return_string, "Triggered user ID", "Users list", "TriggeredUserID", 
              "Get triggered user ID."); 
AddExpression(37, ef_return_number, "Users count", "Users list", "UsersCount", 
              "Get amount of users in users list.");  

// max peers and user count            
AddExpression(41, ef_return_string, "Max peers of current room", "Rooms list - for each", "CurRoomMaxPeers", 
              "Get max peers of current room in a For Each loop.");               

AddNumberParam("Index", "Room index.", 0);
AddExpression(42, ef_return_string, "Get max peers by room index", "Rooms list - index", "Index2RoomMaxPeers", 
              "Get room name by room index.");                
              
              
// black or white list              
AddExpression(51, ef_return_string, "Get white list in JSON", "Permission list", "WhiteListToJSON", 
              "Get white list in JSON string.");
			  
AddExpression(52, ef_return_string, "Get black list in JSON", "Permission list", "BlackListToJSON", 
              "Get black list in JSON string.");
          
//AddStringParam("Channel name", "Custom channel name.", '""');  
AddExpression(81, ef_return_string | ef_variadic_parameters, "Get custom channel reference", "Custom channel", "ChannelRef", 
              "Get custom channel absolute reference. Add 2nd parameter for roomID.");
              
AddExpression(100, ef_return_number, "Current loop index", "For each - index", "LoopIndex", 
              "Get loop index in for each loop.");                
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Rooms", "Sub domain for this function."), 
    new cr.Property(ept_combo, "Door control", "Manual", 'Set "Auto" to close or open door when room is full or not.', "Manual|Auto"),  
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
