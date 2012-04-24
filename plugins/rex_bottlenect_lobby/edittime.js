function GetPluginSettings()
{
	return {
		"name":			"Lobby",
		"id":			"Rex_Bottleneck_Lobby",
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
AddCondition(1,cf_trigger,"On entered","Lobby","On entered lobby",
             "Triggered when the socket successfully connects to an address.","OnConnect");
AddCondition(2,cf_trigger,"On error","Lobby","On error",
             "Triggered when there is an error connecting to an address.","OnError");
AddCondition(3,cf_trigger,"On left","Lobby","On left lobby",
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
AddCondition(10,cf_trigger,"On avaiable","Gameroom","On gameroom avaiable",
             'Triggered when gameroom avaiable',"OnGameroomAvaiable");
 AddCondition(11,cf_trigger,"On unavaiable.","Gameroom","On gameroom unavaiable",
             'Triggered when gameroom unavaiable.',"OnGameroomUnavaiable");
AddCondition(12, cf_looping | cf_not_invertible, "For each avaiable gameroom", "For Each", 
             "For each avaiable gameroom", "Repeat the event for each avaiable gameroom.", "ForEachGameroom");
             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Address","The address (eg. URL or IP) to connect to. Supports cross-domain requests.",'"http://localhost/game"');
AddAction(0,0,"Set channel","Lobby",
          "Set channel url to <b>{0}</b>",
          "Set channel url.","SetChannel");
AddStringParam("Room ID","Room ID.","");
AddStringParam("User name","The user name in the chat room.",'""');
AddNumberParam("Is public","This room is public or not. 1=public, 0=private",0);
AddAction(1,0,"Join","Lobby",
          "User <b>{1}</b> join to room <b>{0}</b>",
          "Connect to game channel and join to room.","Connect");
AddAction(5,0,"Leave","Lobby","Leave","Disconnect from the current connection.","Disconnect");
AddAnyTypeParam("Data","The data to send through the socket.","\"\"");
AddAction(6,0,"Send","Message","Send <b>{0}</b>","Send data through the connection.","Send");
AddNumberParam("Count","The maximum member count of room. 0 is infinty.",0);
AddAction(7,0,"Set max member count","Room management",
          "Set max member count to <b>{0}</b>",
          "Set the maximum member count of room. 0 is infinty.","SetMaxMemberCount");
AddAnyTypeParam("User","User name(string) or user id(number).","\"\"");
AddAction(8,0,"Kick member","Room management",
          "Kick member <b>{0}</b>",
          "Kick member.","KickMember");         
AddAction(10,0,"Enter layout","Start layout",
          "Enter layout",
          'Send "prepared" signal. It will trigger "Condition:OnStartOfLayout" when all user prepared.',"EnterLayout"); 
AddStringParam("Game url","Url of game.","");
AddStringParam("Room ID","Room ID.","");
AddStringParam("User name","The user name in this game.",'""');
AddAction(11,0,"Join game","Game",
          "User <b>{2}</b> join to room <b>{1}</b> of game <b>{0}</b>",
          "Join game","JoinGame"); 
        
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,ef_return_string,"Get received data","Received","Data","Get the last chunk of data that was received via the socket.");
AddExpression(1,ef_return_number,"Get triggered user id","Triggered","UsrID","Get triggered user id.");
AddExpression(2,ef_return_string,"Get triggered user name","Triggered","UsrName","Get triggered user name.");
AddExpression(3,ef_return_string,"Get server address","Socket","IPAddr",
              "Get the server address that the socket connected to.");
AddExpression(6,ef_return_string,"Get name","Avaiable gameroom","RoomName","Get room name (game name)."); 
AddExpression(7,ef_return_string,"Get id","Avaiable gameroom","RoomID","Get room id."); 
AddExpression(8,ef_return_string,"Get description","Avaiable gameroom","RoomDescription","Get room description."); 
AddExpression(9,ef_return_string,"Get url","Avaiable gameroom","RoomURL","Get room url."); 
AddNumberParam("UsrID","The user id.",0);
AddExpression(15,ef_return_string | ef_variadic_parameters, 
              "Get user name from user id","Users","UsrID2Name","Get user name from user id.");
              
ACESDone();

var property_list = [  
    new cr.Property(ept_text, 'Channel', 'http://bottleneck.herokuapp.com/lobby', 'The URL of lobby channel.'),
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
