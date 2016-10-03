function GetPluginSettings()
{
	return {
		"name":			"Current timestamp",
		"id":			"Rex_Parse_CurTime",
		"version":		"0.1",        
		"description":	"Get current time from parse server.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_curtime.html",
		"category":		"Rex - Web - parse - date",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get current time", "Current time", 
            "On get current time", 
            "Triggered when get current time completed.", "OnGetCurrentTimeCompleted");
            
AddCondition(2, cf_trigger, "On get current time error", "Current time", 
            "On get current time error", 
            "Triggered when get current time error.", "OnGetCurrentTimeError");
                             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Get current time", "Current time", 
          "Get current time from parse server", 
          "Get current time from parse server.", "GetCurrentTime");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get current timestamp", "Current time", "LastTimestamp", 
              "Last current timestamp.");
                                                        
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
