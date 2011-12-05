function GetPluginSettings()
{
	return {
		"name":			"SocketIO",
		"id":			"Rex_SocketIO",
		"description":	"Allows you to communicate over the Internet via streaming sockets.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Web",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,cf_trigger,"On data received","Socket","On data received","Triggered when the socket receives a chunk of data.","OnData");
AddCondition(1,cf_trigger,"On connect","Socket","On connect","Triggered when the socket successfully connects to an address.","OnConnect");
AddCondition(2,cf_trigger,"On error","Socket","On error","Triggered when there is an error connecting to an address.","OnError");
AddCondition(3,cf_trigger,"On disconnect","Socket","On disconnect","Triggered when the socket disconnects from an address.","OnDisconnect");
AddCondition(4,0,"Is package stack empty","Received","Is package stack empty","Is package stack empty.","IsPkgStackEmpty");
AddCondition(5,cf_trigger,"On user joined","Users","On user joined","Triggered when user joined.","OnUserJoined");
AddCondition(6,cf_trigger,"On user left","Users","On user left","Triggered when user left.","OnUserLeft");


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
AddAction(3,0,"Pop a package","Received","Pop a package","Pop a received package.","PopPkg");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,ef_return_string,"Get received data","Received","Data","Get the last chunk of data that was received via the socket.");
AddExpression(1,ef_return_number,"Get user-id of received data","Received","UsrID","Get the user-id of received data.");
//AddExpression(0,ef_return_string,"Get last address","Socket","LastAddress","Get the last address that the socket connected to.");
//AddExpression(1,ef_return_string,"Get last port","Socket","LastPort","Get the last port that the socket connected through.");

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
