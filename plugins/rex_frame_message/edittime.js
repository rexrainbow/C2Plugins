function GetPluginSettings()
{
	return {
		"name":			"Frame message",
		"id":			"Rex_FrameMessage",
		"version":		"0.1",        
		"description":	"Call function (postMessage) on other frames.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_framemessage.html",
		"category":		"Rex - Iframe",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "The name of the function that is being called.", "\"\"");
AddCondition(1,	cf_trigger, "On function", "Function", "On <b>{0}</b>", "Triggered when a function is called.", "OnFunction");

AddStringParam("Name", "The name of the function that is being returned.", "\"\"");
AddCondition(2,	cf_trigger, "On Return", "Function", "On <b>{0}</b> returned", "Triggered when a function is returned.", "OnReturn");

AddCondition(11, 0, "Top frame", "Parent", "Is top frame", 
             "Return true if current frame is top frame. i.e. not in iframe or pop-up window", "IsTopFrame");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Frame name", "My frame name for receiving.", '""');
AddAction(1, 0, "Set my frame name", "Receive", 
          "Set my frame name to <i>{0}</i>", 
          "Set my frame name for receiving.", "SetReceivingFrameName");

AddStringParam("Receiver", 'Frame name of receiver. Set "" to broadcast to all frames.', '""');          
AddStringParam("Name", "The name of the function to call.", "\"\"");
AddVariadicParams("Parameter {n}", "A parameter to pass for the function call, which can be accessed with Function.Param({n}).");
AddAction(2, 0, "Call function", "Send", 
          "Call <b>{1}</b> (<i>{...}</i>) on frame <i>{0}</i>", 
          "Call function on other frame.", "CallFunction");
           
AddAnyTypeParam("Value", "A number or some text to return from the function call.");
AddAction(3, 0, "Set return value", "Function", "Set return value to <b>{0}</b>", "In an 'On function' event, set the return value.", "SetReturnValue");

AddComboParamOption("Log");
AddComboParamOption("Warn");
AddComboParamOption("Error");
AddComboParam("Type", "Choose the type of message to log to the browser console.");
AddAnyTypeParam("Message", "Enter the message text to log to the browser console.");
AddAction(11, 0, "Log", "Console", "{0} in top frame console: <i>{1}</i>", "Log a message to the top frame console, which can be useful for debugging.", "ConsoleLog");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "My frame name", "Frame name", "MyFrameName", "Get my frame name.");
AddExpression(2, ef_return_string, "Last sender name", "Message", "LastSender", "Get Frame name of last sender.");

AddExpression(3, ef_return_number, "", "Function", "ParamCount", "Get the number of parameters passed to this function.");

AddNumberParam("Index", "The zero-based index of the parameter to get.");
AddExpression(4, ef_return_any, "", "Function", "Param", "Get the value of a parameter passed to the function.");

AddExpression(5, ef_return_any, "", "Function", "ReturnValue", "Get the value set by 'Set return value'.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Frame name", "main", "My frame name for receiving."),
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
