function GetPluginSettings()
{
	return {
		"name":			"Dictionary Cache",
		"id":			"Rex_DictionaryLCache",
		"version":		"0.1",        
		"description":	"Dictionary cache for local storage.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_eex_dictionaryLCache.html",
		"category":		"Rex - Local storage",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Key", "The name of the key to test.");
AddCmpParam("Comparison", "How to compare the key's value.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(0, cf_none, "Compare value", "Dictionary", "Key <b>{0}</b> {1} <b>{2}</b>", "Compare the value at a key.", "CompareValue");

AddCondition(1, cf_looping, "For each key", "For Each", "For each key", "Repeat the event for each key/value pair that has been stored.", "ForEachKey");

AddCmpParam("Comparison", "How to compare the value of the current key in the for-each loop.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(2, cf_none, "Compare current value", "For Each", "Current value {0} <b>{1}</b>", "Compare the value at the current key in the for-each loop.", "CompareCurrentValue");

AddStringParam("Key", "The name of the key to check if exists.");
AddCondition(3, cf_none, "Has key", "Dictionary", "Has key <b>{0}</b>", "Check if a key name has been stored.", "HasKey");

AddCondition(4, cf_none, "Is empty", "Dictionary", "Is empty", "True if no keys are in storage.", "IsEmpty");


// cache
AddCondition(101, cf_trigger, "On load cache complete", "Load cache", 
             "On load cache complete", 
             "Triggered when load cache complete.", "OnLoadCacheComplete");

AddCondition(102, cf_none, "Is loading", "Load cache", 
             "Is loading", "True if in loading cache progress.", "IsLoading");       

AddCondition(103, cf_trigger, "On initial cache", "Initial cache", 
             "On initial cache", 
             "Triggered when initial cache.", "OnInitialCache");                  
             
AddCondition(111, cf_trigger, "On writing actions complete", "Writing actions", 
             "On writing actions complete", 
             "Triggered when writing actions complete.", "OnWritingActionsComplete");

AddCondition(112, cf_none, "Is writing", "Writing actions", 
             "Is writing", "True if in writing cache progress.", "IsWriting");
        
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Key", "The name of the key.  If it already exists, its value will be overwritten.");
AddAnyTypeParam("Value", "The value to store for the key.");
AddAction(0, af_none, "Add key", "Dictionary", "Add key <i>{0}</i> with value <i>{1}</i>", "Add a new key in to storage. If it already exists, its value will be overwritten.", "AddKey");

AddStringParam("Key", "The name of the key.  If it does not exist, this will have no effect.");
AddAnyTypeParam("Value", "The value to store for the key.");
AddAction(1, af_none, "Set key", "Dictionary", "Set key <i>{0}</i> to value <i>{1}</i>", "Set an existing key in to storage. If it does not exist, this will have no effect.", "SetKey");

AddStringParam("Key", "The name of the key to delete.");
AddAction(2, af_none, "Delete key", "Dictionary", "Delete key <i>{0}</i>", "Delete a key from storage.", "DeleteKey");

AddAction(3, af_none, "Clear", "Dictionary", "Clear", "Delete all keys and values from storage, returning to empty.", "Clear");

AddStringParam("Cache name", "Cache name.");
AddStringParam("JSON", "A string of the JSON data to load.");
AddAction(4, 0, "Load", "JSON", 
          "Load cache <i>{0}</i> from JSON string <i>{1}</i>", 
          "Load from a dictionary previously encoded in JSON format.", "JSONLoad");

AddStringParam("Filename", "The name of the file to download.", "\"data.json\"");
AddAction(5, 0, "Download", "JSON", "Download as JSON data with filename <i>{0}</i>", "Download the contents of the dictionary as a JSON file.", "JSONDownload");
         
// cache         
AddStringParam("Cache name", "Cache name.");
AddAction(101, af_none, "Load cache", "Load cache", 
         "Load cache <i>{0}</i>", 
         "Load cache from local storage.", "LoadCache");       
//////////////////////////////////////////////////////////////
// Expressions

AddStringParam("Key", "The name of the key to retrieve.");
AddExpression(0, ef_return_any, "Get", "Dictionary", "Get", "Get the value from a key.  0 is returned if it does not exist.");

AddExpression(1, ef_return_number, "KeyCount", "Dictionary", "KeyCount", "Get the number of keys in storage.");

AddExpression(2, ef_return_string, "CurrentKey", "For Each", "CurrentKey", "Get the current key name in a for-each loop.");
AddExpression(3, ef_return_any, "CurrentValue", "For Each", "CurrentValue", "Get the current key value in a for-each loop.");

AddExpression(4, ef_return_string, "Get as JSON", "JSON", "AsJSON", "Return the contents of the array in JSON format.");


// cache    
AddExpression(101, ef_return_number, "Total loading keys count", "Load cache", 
              "TotalLoadingKeysCount", 
              "Get total loading keys count. Return if loading progress had been done.");
              
AddExpression(102, ef_return_number, "Current loaded keys count", "Load cache", 
              "CurrentLoadedKeysCount", 
              "Get current loaded keys count. Return if loading progress had been done.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Prefix", "DC", "Prefix for storing into local storage.")
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
