function GetPluginSettings()
{
	return {
		"name":			"MP chat",
		"id":			"Rex_MPchat",
		"version":		"0.1",        
		"description":	"Chat message buffer manager",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_mpchat.html",
		"category":		"Multi-player helper",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Condition
AddCondition(1, cf_trigger, "On content updated", "Content", "On content updated", 
             "Triggered when content updated by message received.", "OnContentUpdate");
AddCondition(2, cf_trigger, "On decorating message", "Decorate", "On decorating message", 
             "Callback to decorate chat-message.", "OnDecorateMessage");
//////////////////////////////////////////////////////////////
// Actions           
AddStringParam("Message", "The message data to send.");
AddVariadicParams("Extra data {n}", 
                  'Extra data, which can be accessed with MPchat.ExtraData({n}), used under callback "Condition:On decorating message".');
AddAction(1, af_none, "Push message", "Input", 
          "Push message <i>{0}</i>, with extra data to (<i>{...}</i>)", 
          "Push a message into buffer.", "PushMsg");
AddStringParam("Log", "Log.");
AddAction(2, af_none, "Push log", "Input", "Push log <i>{0}</i>", "Push a log into buffer.", "PushLog");
AddStringParam("Message", "Decorated result.");
AddAction(3, af_none, "Set result", "Decorate", "Set decorated result to <i>{0}</i>", 
          'Set decorated result, used under callback "Condition:On decorating chat message".', "SetDecoratedResult");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Content of message", "Content", "Content", 
              'The content of message buffer.');
AddExpression(2, ef_return_string, "Raw message", "Decorate", "RawMessage", 
              'Raw message, used under callback "Condition:On decorating message".');
AddExpression(3, ef_return_string, "Sender Alias", "Decorate", "SenderAlias", 
              'The alias of sender, used under callback "Condition:On decorating message".');
AddExpression(4, ef_return_string, "Last message", "Content", "LastMsg", 
              'The last updated message of current content.');			  
AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
AddExpression(5, ef_return_any, "Decorating parameter", "Decorate", "ExtraData", 
              'Get the value of a parameter, used under callback "Condition:On decorating message".');

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Tag prefix", "_chat", "Tag prefix for sending and receiving message.", "", "readonly"),
    new cr.Property(ept_integer, "Buffer length", 100, "Buffer length of message. 0 is infinite."),
    new cr.Property(ept_combo, "Reorder", "No", "Reorder chat message to match to host.", "No|Yes"),
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
