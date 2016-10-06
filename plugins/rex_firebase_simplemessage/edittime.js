function GetPluginSettings()
{
	return {
		"name":			"Simple message",
		"id":			"Rex_Firebase_SimpleMessage",
		"version":		"0.1",        
		"description":	"Send message to ID.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebase_simplemessage.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On receive", "Message", 
            "On receive message",
            "Triggered when received message.", "OnReceivedMessage");                   
//////////////////////////////////////////////////////////////
// Actions      
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddStringParam("Sender ID", "Sender ID.", '""');
AddStringParam("Sender name", "Sender name.", '""');
AddAction(1, 0, "Set user", "User info", 
          "Set sender name to <i>{1}</i>, sender ID to <i>{0}</i>", 
          "Set user info.", "SetUserInfo");

AddStringParam("Receiver ID", "ID of receiver.", '""');          
AddAction(11, 0, "Start", "Update", 
          "Start receiving on channel ID <i>{0}</i>", 
          "Start receiving.", "StartUpdate");
          
AddAction(12, 0, "Stop", "Update", 
          "Stop receiving", 
          "Stop receiving.", "StopUpdate");  

AddStringParam("Send to ID", "Send to ID.", '""');
AddStringParam("Message", "Message. String or JSON string for object.", '""');
AddAction(21, 0, "Send", "Message", 
          "Send message: <i>{1}</i> to ID: <i>{0}</i>", 
          "Send message.", "SendMessage");   

AddStringParam("Send to ID", "Send to ID.", '""');
AddAction(22, 0, "Clean", "Message", 
          "Clean message box of ID: <i>{0}</i>", 
          "Clean message box.", "CleanMessageBox");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Lest sender ID", "Message", "LastSenderID", 
              "Get sender ID of last message.");  
AddExpression(2, ef_return_string, "Lest sender name", "Message", "LastSenderName", 
              "Get sender name of last message.");            
AddExpression(3, ef_return_string, "Lest message", "Message", "LastMessage", 
              "Get last message.");  
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "private message", "Sub domain for this function."),
    new cr.Property(ept_combo, "Message type", "String", "Sent message type, string or JSON object in string.", "String|JSON string"),
    new cr.Property(ept_combo, "Offline message", "Discard", "Discard or pend offline message. Pend mode is only used for single receiver.", "Discard|Pend"),
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
