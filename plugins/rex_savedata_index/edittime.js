function GetPluginSettings()
{
	return {
		"name":			"Save-data index ",
		"id":			"Rex_SaveDataIndex",
		"version":		"0.1",        
		"description":	"A wrap of save/load game.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_savedataindex.html",
		"category":		"Rex - Save-load",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Empty", "Slot", "Is empty", "All slots are unused.", "IsEmpty");
AddAnyTypeParam("Index", "Index of slot.", 0);
AddCondition(2, 0, "Is occupied", "Slot", "Slot <i>{0}</i> is occupied", "", "IsOccupied");

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Save game", "Temporary", 
          "Save game in temporary slot", 
          'Save game in temporary slot using official "system action:save".', "TemporarySaveGame");          
AddStringParam("Name", "Parameter's name", '""');
AddAnyTypeParam("Value", "The default value.");
AddAction(2, 0, "Set extra data", "Temporary", "Set extra data <i>{0}</i> to <i>{1}</i>", 'Set extra data before "action:Save slot".', "SetExtraData");
AddAnyTypeParam("Index", "Index of slot.", 0);
AddAction(3, 0, "Save slot", "Slot", 
          "Save to slot <i>{0}</i>", 
          'Save to slot. It need to run "action:Temporary save" first.', "SaveSlot");
AddAnyTypeParam("Index", "Index of slot.", 0);
AddAction(4, 0, "Load game", "Slot", 
          "Load game from slot <i>{0}</i>", 
          'Load game from slot using official "system action:load"', "LoadGame");
AddAction(5, 0, "Load game", "Temporary", 
          "Load game from temporary slot", 
          'Save game from temporary slot using official "system action:load".', "TemporaryLoadGame");
AddAnyTypeParam("Index", "Index of slot.", 0);
AddAction(6, 0, "Clean slot", "Slot", 
          "Clean slot <i>{0}</i>", 
          'Clean slot by removing index', "CleanSlot");                    
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Name", "Parameter's name", '""');
//AddNumberParam("Index", "Index of slot.", 0);
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get extra data", "Extra data", "ExtraData", 
              'Get extra data, add index of slot at 2nd parameter, or to get value from temporary slot.');
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Prefix", "SaveDataIndex_", "Prefix of key name for storing into webstorage.")
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
