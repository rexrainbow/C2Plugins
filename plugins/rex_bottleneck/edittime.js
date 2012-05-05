function GetPluginSettings()
{
	return {
		"name":			"Bottleneck",
		"id":			"Rex_Bottleneck",
		"version":		"0.1",               
		"description":	"Allows you to communicate over the Internet via streaming sockets.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Web",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
        "dependency":	"socket.io.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,cf_trigger,"On data received","Message","On data received",
             "Triggered when the socket receives a chunk of data.","OnData");
AddCondition(1,cf_trigger,"On entered","Room","On entered room",
             "Triggered when the socket successfully connects to an address.","OnConnect");
AddCondition(2,cf_trigger,"On error","Room","On error",
             "Triggered when there is an error connecting to an address.","OnError");
AddCondition(3,cf_trigger,"On left","Room","On left room",
             "Triggered when the socket disconnects from an address.","OnDisconnect");
// 4
AddCondition(5,cf_trigger,"On user joined","Users","On user joined",
             "Triggered when user joined.","OnUserJoined");
AddCondition(6,cf_trigger,"On user left","Users","On user left",
             "Triggered when user left.","OnUserLeft");
AddCondition(7, cf_looping | cf_not_invertible, "For each user id", "For Each", 
             "For each user id", "Repeat the event for each user id.", "ForEachUsrID");
AddCondition(8, 0, "Room moderator", "Room management", 
             "I am room moderator", "Reture true if I am room moderator", "AmIRoomModerator");
AddCondition(9,cf_trigger,"On start of layout","Start layout","On start of layout",
             'Triggered when all users are prepared by passing "Action:Start of layout".',"OnStartOfLayout");
AddCondition(10, 0, "Has external setting", "Room setting", 
             "Has external setting", "Reture true if it has external setting from querystring", "HasExternalSetting");
AddCondition(11,cf_trigger,"On room unavaliable","Room","On room unavaliable",
             'Triggered when room unavaliable.',"OnRoomUnavaiable");             
           
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Address","The address (eg. URL or IP) to connect to. Supports cross-domain requests.",'"http://localhost/game"');
AddAction(0,0,"Set channel","Room",
          "Set channel url to <b>{0}</b>",
          "Set channel url.","SetChannel");
AddStringParam("Room ID","Room ID.","");
AddStringParam("User name","The user name in this game.",'""');
AddNumberParam("Is public","This room is public or not. 1=public, 0=private",0);
AddAction(1,0,"Join","Room",
          "User <b>{1}</b> join to room <b>{0}</b>",
          "Connect to game channel and join to room.","Connect");
AddAction(2,0,"Quick join","Room",
          "Join room by external setting",
          "Connect to game channel and join to room by external setting.","QucikConnect");          
AddAction(5,0,"Leave","Room","Leave","Disconnect from the current connection.","Disconnect");
AddAnyTypeParam("Data","The data to send through the socket.","\"\"");
AddAction(6,0,"Send","Message","Send <b>{0}</b>","Send data through the connection.","Send");
AddNumberParam("Count","The maximum user count of room. 0 is infinty.",0);
AddAction(7,0,"Set max user count","Room management: Room",
          "Set max user count to <b>{0}</b>",
          "Set the maximum user count of room. 0 is infinty.","SetMaxMemberCount");
AddAnyTypeParam("User","User name(string) or user id(number).","\"\"");
AddAction(8,0,"Kick user","Room management: User",
          "Kick user <b>{0}</b>",
          "Kick user.","KickMember");  
AddAnyTypeParam("Key","The key of data stored in room storage.","\"\"");
AddAnyTypeParam("Data","The data stored in room storage.","\"\""); 
AddAction(9,0,"Save data","Room storage",
          "Save data <b>{1}</b> with key <b>{0}</b> into room storage",
          "Save data to room storage.","SetRoomStorage");          
AddAction(10,0,"Start layout","Sync",
          "Start layout",
          'Send "start" signal. It will trigger "Condition:On start of layout" when all user prepared.',"EnterLayout"); 
AddComboParamOption("Closed");
AddComboParamOption("Open");
AddComboParamOption("Toggle");
AddComboParam("Room state", "Set room state.",0);
AddAction(11,0,"Set room state","Room management: Room",
          "Set room state to <b>{0}</b>",
          "Set room state","SetRoomState"); 
AddAction(12,0,"Set room state by number","Room management: Room",
          "Set room state to <b>{0}</b>",
          "Set room state","SetRoomState");          
       
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,ef_return_string,"Get received data","Received","Data","Get the last chunk of data that was received via the socket.");
AddExpression(1,ef_return_number,"Get triggered user id","Triggered","UsrID","Get triggered user id.");
AddExpression(2,ef_return_string,"Get triggered user name","Triggered","UsrName","Get triggered user name.");
AddExpression(3,ef_return_string,"Get server address","Socket","IPAddr",
              "Get the server address that the socket connected to.");
AddAnyTypeParam("Key","The key of data stored in room storage.","\"\"");
AddExpression(5,ef_return_any | ef_variadic_parameters, 
              "Get room storage data","Room","RoomData","Get room storage data from key.");
AddExpression(6,ef_return_string,"Get user name from external","External","ExtUsrName","Get user name from external.");    
AddExpression(7,ef_return_string,"Get room id from external","External","ExtRoomID","Get room id from external.");          
AddNumberParam("UsrID","The user id.",0);
AddExpression(15,ef_return_string | ef_variadic_parameters, 
              "Get user name from user id","Users","UsrID2Name","Get user name from user id.");                            
AddExpression(16,ef_return_string,"Get my user name","My","MyUserName","Get my user name."); 
AddExpression(17,ef_return_string,"Get my user id","My","MyUserID","Get my user id.");               

ACESDone();

var property_list = [  
    new cr.Property(ept_text, 'Channel', 'http://bottleneck.herokuapp.com/game', 'The URL of game channel.'),
    new cr.Property(ept_section, "Properties of game", "",	"Properties of game."),
    new cr.Property(ept_text, 'Name', 'Chat', 'Name of this game.'),    
    new cr.Property(ept_text, 'Description', '', 'Description of this game.'), 
	new cr.Property(ept_integer, "Players", 0, "Maximun players count. 0 is infinity."),
    ];

function CreateIDEObjectType()
{
	return new IDEObjectType();
}

function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");

	this.instance = instance;
	this.type = type;
	
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}
IDEInstance.prototype.OnCreate = function()
{
}
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
IDEInstance.prototype.Draw = function(renderer)
{
}
IDEInstance.prototype.OnRendererReleased = function()
{
}
