function GetPluginSettings()
{
	return {
		"name":			"Chat",
		"id":			"Rex_SocketIO_Chat",
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
AddCondition(0,cf_trigger,"On data received","Socket","On data received",
             "Triggered when the socket receives a chunk of data.","OnData");
AddCondition(1,cf_trigger,"On connect","Socket","On connect",
             "Triggered when the socket successfully connects to an address.","OnConnect");
AddCondition(2,cf_trigger,"On error","Socket","On error",
             "Triggered when there is an error connecting to an address.","OnError");
AddCondition(3,cf_trigger,"On disconnect","Socket","On disconnect",
             "Triggered when the socket disconnects from an address.","OnDisconnect");
// 4
AddCondition(5,cf_trigger,"On user joined","Users","On user joined",
             "Triggered when user joined.","OnUserJoined");
AddCondition(6,cf_trigger,"On user left","Users","On user left",
             "Triggered when user left.","OnUserLeft");
AddCondition(7, cf_looping | cf_not_invertible, "For each user id", "For Each", 
             "For each user id", "Repeat the event for each user id.", "ForEachUsrID");
AddCondition(8, 0, "Am I room moderator", "Room", 
             "Am I room moderator?", "If I am room moderator", "AmIRoomModerator");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Address","The address (eg. URL or IP) to connect to. Supports cross-domain requests.",'"http://localhost"');
AddNumberParam("Port","The port to try and connect to the address through. This should be specific to your server.",8001);
AddStringParam("Nickname","The nickname in this local network.",'""');
AddAction(0,0,"Connect","Socket",
          "User <b>{2}</b> connect to <b>{0}</b>, port: <b>{1}</b>",
          "Connect to an address (eg. URL or IP).","Connect");
AddAction(1,0,"Disconnect","Socket","Disconnect","Disconnect from the current connection.","Disconnect");
AddAnyTypeParam("Data","The data to send through the socket.","\"\"");
AddAction(2,0,"Send","Socket","Send <b>{0}</b>","Send data through the connection.","Send");
AddNumberParam("Count","The maximum member count of room. 0 is infinty.",0);
AddAction(3,0,"Set max member count","Room",
          "Set max member count to <b>{0}</b>",
          "Set the maximum member count of room. 0 is infinty.","SetMaxMemberCount");
AddAnyTypeParam("User","User name(string) or user id(number).","\"\"");
AddAction(4,0,"Kick member","Room",
          "Kick member <b>{0}</b>",
          "Kick member.","KickMember");  
AddAnyTypeParam("Key","The key of data stored in room storage.","\"\"");
AddAnyTypeParam("Data","The data stored in room storage.","\"\""); 
AddAction(5,0,"Save data to room storage","Room",
          "Save data <b>{1}</b> with key <b>{0}</b> to room storage",
          "Save data to room storage.","SetRoomStorage");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,ef_return_string,"Get received data","Received","Data","Get the last chunk of data that was received via the socket.");
AddExpression(1,ef_return_number,"Get triggered user id","Received","UsrID","Get triggered user id.");
AddNumberParam("UsrID","The user id.",0);
AddExpression(2,ef_return_string | ef_variadic_parameters, 
              "Get user name from user id","Users","UsrName","Get user name from user id.");
AddExpression(3,ef_return_string,"Get server address","Socket","IPAddr",
              "Get the server address that the socket connected to.");
AddExpression(4,ef_return_string,"Get server port","Socket","Port",
              "Get the server port that the socket connected through.");
AddAnyTypeParam("Key","The key of data stored in room storage.","\"\"");
AddExpression(5,ef_return_any | ef_variadic_parameters, 
              "Get room storage data","Room","RoomData","Get room storage data from key.");              

ACESDone();

var property_list = [  
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
	
	for(property in property_list)
		this.properties[property.name] = property.initial_value;
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
