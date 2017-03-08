function GetPluginSettings()
{
	return {
		"name":			"Sequence matcher",
		"id":			"Rex_SequenceMatcher",
		"version":		"0.1",   		
		"description":	"To find sequence pattern.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_sequence_matcher.html",
		"category":		"Rex - Logic",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Pattern", "Pattern.", '""');
AddCondition(2, cf_trigger, "On matching", "Patern checking: trigger", 
             "On matching <i>{0}</i>", 'Trigger by "Action:Put symbol" when matching pattern.', "OnMatchPattern");    
AddCondition(3, cf_trigger, "On no matching pattern", "Patern checking: trigger", 
             "On no matching pattern", 'Trigger by "Action:Put symbol" when matching pattern.', "OnNoMatchPattern");   
AddStringParam("Pattern", "Pattern.", '""');
AddCondition(4, 0, "Is matching", "Patern checking", 
             "Is matching <i>{0}</i>", 'Return true if pattern matched.', "IsMatchPattern");             
//////////////////////////////////////////////////////////////
// Actions 
AddAction(1, 0, "Clean buffer", "Symbol buffer", 
          "Clean symbol buffer", 
          "Clean symbol buffer.", "CleanSymbolBuffer");
AddNumberParam("Length", "length of symbol buffer ", 10);           
AddAction(2, 0, "Set buffer length", "Symbol buffer", 
          "Set symbol buffer length to <i>{0}</i>", 
          "Set symbol buffer length.", "SetSymbolBufferLength");
AddStringParam("Symbol", "Symbol to push", '""');
AddAction(5, 0, "Push symbol", "Request: Matching", 
          "Push symbol: <i>{0}</i>", 
          "Push symbol into buffer then do matching.", "PushSymbol");
             
//////////////////////////////////////////////////////////////
// Expressions             

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_integer, "Buffer length", 10, "Buffer length of saved symbols."),   
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
