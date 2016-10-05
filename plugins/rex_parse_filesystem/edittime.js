function GetPluginSettings()
{
	return {
		"name":			"File system",
		"id":			"Rex_Parse_filesystem",
		"version":		"0.1",        
		"description":	"File system to save files and folders.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_parse_filesystem.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On command responded", "Command", 
            "On command responded",
            "Triggered when command responded.", "OnCommandResponded");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Command", "Command.", '""');
AddAction(1, 0, "Run command", "Command", 
          "Run command <i>{0}</i>", 
          "Run command.", "RunCommand");         
          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Last responded message", "Command", "LastRespondedMessage", 
              "Get last responded message.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Class name", "data", "Class name of this function."), 	
    new cr.Property(ept_combo, "Response", "Yes", "Enable response event and get response message.", "NO|Yes"),     
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
