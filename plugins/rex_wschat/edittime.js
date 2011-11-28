function GetPluginSettings()
{
	return {
		"name":			"WS Chat",
		"id":			"Rex_WSChat",
		"description":	"WasabiStudio Chatroom protocol",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Server",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On system message", "System", "On system message", 
             "Trigger when system message occured", "OnSysMsg");
AddCondition(1, cf_trigger, "On system error", "System", "On system error", 
             "Trigger when system error occured", "OnSysError");
AddCondition(2, cf_trigger, "On user message received", "Send/Receive", "On user message received", 
             "Trigger when user message received", "OnUsrMsgReceived");

//////////////////////////////////////////////////////////////
// Actions  
AddAction(1, 0, "Connect to server", "System", "Connect to server", "Connect to server.", "Connect"); 
AddStringParam("Message", "Message", '""');
AddAction(2, 0, "Send message", "Send/Receive", "Send message <i>{0}</i>", "Send message.", "SendMsg");
AddStringParam("Url", "url of server", '""');
AddAction(3, 0, "Set server", "System", "Set url of server to <i>{0}</i>", "Set server.", "SetServerUrl");
  
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "System message", "System", "SysMsg", "Get the system message/error.");
AddExpression(1, ef_return_string, "User message", "Send/Receive", "Msg", "Get the user message.");
AddExpression(2, ef_return_string, "Chatroom url", "System", "URL", "Get the chatroom url.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish connect to server at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "Chatroom url", "http://chat.wasabistudio.ca", 
                    "Url of WasabiStudio chatroom."),
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
