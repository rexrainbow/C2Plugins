function GetPluginSettings()
{
	return {
		"name":			"Event",
		"id":			"Rex_NGIO_Event",
		"version":		"0.1",        
		"description":	"Handles logging of custom events.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ngio_event.html",
		"category":		"Rex - Web - newgrounds.io",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,       
	};
};

//////////////////////////////////////////////////////////////
// Conditions

AddCondition(1, cf_trigger, "On log event", "Log", 
            "On log event success",
            "Triggered when log event success.", "OnLogEventSuccess");
AddCondition(2, cf_trigger, "On log event error", "Log", 
            "On log event error",
            "Triggered when log event error.", "OnLogEventError");  

//////////////////////////////////////////////////////////////
// Actions

AddStringParam("Event name", "The name of your custom event as defined in your Referrals & Events settings.", '""');    
AddStringParam("Host", 'The domain hosting your app. Example: "newgrounds.com", "localHost"', '"localHost"');
AddAction(1, 0, "Log event", "Event", 
          "Log event <i>{0}</i> ( host: <i>{1}</i> )",
          "Logs a custom event to your API stats.", "LogEvent");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get error message", "Result", "ErrorMessage", 
              "Get last error message from last result.");
 
AddExpression(1, ef_return_string, "Get logged event name", "Log", "EventName", 
              "Get logged event name from last result.");
 
ACESDone();

// Property grid properties for this plugin
var property_list = [
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
