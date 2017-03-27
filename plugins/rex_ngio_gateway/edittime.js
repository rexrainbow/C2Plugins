function GetPluginSettings()
{
	return {
		"name":			"Gateway",
		"id":			"Rex_NGIO_Gateway",
		"version":		"0.1",        
		"description":	"Provides information about the gateway server.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ngio_gateway.html",
		"category":		"Rex - Web - newgrounds.io",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,      
	};
};

//////////////////////////////////////////////////////////////
// Conditions
     
AddCondition(1, cf_trigger, "On get date time", "Get date time", 
            "On get date time success",
            "Triggered when get date time success.", "OnGetDateTimeSuccess");
AddCondition(2, cf_trigger, "On get date time error", "Get date time", 
            "On get date time error",
            "Triggered when get date time error.", "OnGetDateTimeError");       
AddCondition(3, cf_trigger, "On get version", "Get version", 
            "On get version success",
            "Triggered when get version success.", "OnGetVersionSuccess");
AddCondition(4, cf_trigger, "On get version error", "Get version", 
            "On get version error",
            "Triggered when get version error.", "OnGetVersionError");     
AddCondition(5, cf_trigger, "On ping", "Ping", 
            "On ping success",
            "Triggered when pong success.", "OnPingSuccess");
AddCondition(6, cf_trigger, "On ping error", "Ping", 
            "On ping error",
            "Triggered when ping error.", "OnPingError"); 

//////////////////////////////////////////////////////////////
// Actions
    
AddAction(1, 0, "Get date time", "Gateway", 
          "Get date time",
          "Loads the current date and time from the Newgrounds.io server.", "GetDatetime");     
AddAction(2, 0, "Get version", "Gateway", 
          "Get version",
          "Returns the current version of the Newgrounds.io gateway.", "GetVersion");
AddAction(3, 0, "Ping", "Gateway", 
          "Ping",
          "Pings the Newgrounds.io server.", "Ping");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get error message", "Result", "ErrorMessage", 
              "Get last error message from last result.");
 
AddExpression(1, ef_return_string, "Get date time", "Get date time", "Datetime", 
              "Get server's date and time in ISO 8601 format from last result.");
AddExpression(2, ef_return_string, "Get version", "Get version", "Version", 
              "The version number (in X.Y.Z format) from last result.");
AddExpression(3, ef_return_string, "Get pong", "Ping", "Pong", 
              "Will always return a value of 'pong' from last result.");  
   
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
