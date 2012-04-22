function GetPluginSettings()
{
	return {
		"name":			"Bottleneck",
		"id":			"Rex_SocketIO_Bottleneck",
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
             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Address","The address (eg. URL or IP) to connect to. Supports cross-domain requests.",'"http://localhost/game"');
AddAction(0,0,"Set channel","Room",
          "Set channel url to <b>{0}</b>",
          "Set channel url.","SetChannel");
AddStringParam("Room ID","Room ID.","");
AddStringParam("Nickname","The nickname in this local network.",'""');
AddNumberParam("Is public","This room is public or not. 1=public, 0=private",0);
AddAction(1,0,"Join","Room",
          "User <b>{1}</b> join to room <b>{0}</b>",
          "Connect to game channel and join to room.","Connect");
AddAction(5,0,"Leave","Room","Leave","Disconnect from the current connection.","Disconnect");
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
AddAnyTypeParam("Key","The key of data stored in room storage.","\"\"");
AddAnyTypeParam("Data","The data stored in room storage.","\"\""); 
AddAction(9,0,"Save data","Room storage",
          "Save data <b>{1}</b> with key <b>{0}</b> into room storage",
          "Save data to room storage.","SetRoomStorage");          
AddAction(10,0,"Enter layout","Start layout",
          "Enter layout",
          'Send "prepared" signal. It will trigger "Condition:OnStartOfLayout" when all user prepared.',"EnterLayout"); 
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,ef_return_string,"Get received data","Received","Data","Get the last chunk of data that was received via the socket.");
AddExpression(1,ef_return_number,"Get triggered user id","Received","UsrID","Get triggered user id.");
AddNumberParam("UsrID","The user id.",0);
AddExpression(2,ef_return_string | ef_variadic_parameters, 
              "Get user name from user id","Users","UsrName","Get user name from user id.");
AddExpression(3,ef_return_string,"Get server address","Socket","IPAddr",
              "Get the server address that the socket connected to.");
AddAnyTypeParam("Key","The key of data stored in room storage.","\"\"");
AddExpression(5,ef_return_any | ef_variadic_parameters, 
              "Get room storage data","Room","RoomData","Get room storage data from key.");              

ACESDone();

var property_list = [  
    new cr.Property(ept_text, 'Channel', 'http://bottleneck.herokuapp.com/game', 'The URL of game channel.'),
    new cr.Property(ept_text, 'Game name', 'Chat', 'Name of this game.'),
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
