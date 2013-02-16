function GetPluginSettings()
{
	return {
		"name":			"Hash",
		"id":			"Rex_Hash",
		"version":		"0.5",            
		"description":	"Store value in a hash table",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Data & Storage",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Key string", "The key string of the hash table.", '""');
AddCondition(1, cf_looping | cf_not_invertible, "For each item", "For Each", 
             "For each item in <i>{0}</i>", "Repeat the event for each item in key.", "ForEachKey");
AddStringParam("Key string", "The key string of the hash table.", '""');
AddCondition(2,0,"Key exists","Key","Key {0} exists","Check if a key exists in hash table.","KeyExists");

            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Key string", "The key string of the hash table value to set.", '""');
AddAnyTypeParam("Value", "The value to store in the hash table.", 0);
AddAction(1, 0, "Set value by key string", "Value", 
          "Set key <i>{0}</i> to <i>{1}</i>",
         "Set value by a key string.", "SetByKeyString");
AddStringParam("Key string", "The key string of the hash entry to get.", '""');
AddAction(2, 0, "Set current entry", "Entry", "Get hash table entry from <i>{0}</i>",
         "Set current entry by key string.", "SetCurHashEntey");
AddStringParam("Key name", "The key of the hash value to set.", '""');
AddAnyTypeParam("Value", "The value to store in the hash table.", 0);
AddAction(3, 0, "Set value at current entry", "Entry", "Set value at <i>{0}</i> to <i>{1}</i> in current entry",
         "Set value at current entry.", "SetValueInCurHashEntey");
AddAction(4, 0, "Clean all", "Hash table", "Clean table",
         "Clean table.", "CleanAll"); 
AddStringParam("JSON string", "JSON string.", '""');
AddAction(5, 0, "Load hash table from JSON string", "JSON", 
          "Load hash table from JSON string <i>{0}</i>",
          "Load hash table from JSON string.", "StringToHashTable");
AddStringParam("Key string", "The key string of the hash table value to remove.", '""');          
AddAction(6, 0, "Remove value by key string", "Remove", 
          "Remove value at <i>{0}</i>",
          "Remove value by a key string.", "RemoveByKeyString");
AddStringParam("Key string", "The key string of the hash table.", '""');
AddObjectParam("Arra", "Array instance to put result.");      
AddAction(7, 0, "Pick keys", "Keys", 
          "Pick keys at <i>{0}</i> into <i>{1}</i>",
          "Pick keys into an array.", "PickKeysToArray");          
AddObjectParam("Hash table B", "Hash table instance to merge.");  
AddComboParamOption("Overwrite from hash B");
AddComboParamOption("Merge new keys from hash table B");
AddComboParamOption("Clean then copy from hash table B");
AddComboParam("Mode", "Merge mode.",0);
AddAction(8, 0, "Merge", "Merge", 
          "Merge hash table with <i>{0}</i>, <i>{1}</i>",
          "Merge hash table with other hash table.", "MergeTwoHashTable");   
          
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Key", "The key string of the hash to get.", '""');
AddExpression(0, ef_deprecated | ef_return_any | ef_variadic_parameters, "Get value at", 
              "Value", "Hash", "Get value from the hash by key string. Add second parameter to return default value when got invalid value.");
AddStringParam("Key", "The key string of the hash value to get.", '""');
AddExpression(1, ef_return_any | ef_variadic_parameters, 
              "Get value from current entry", "Entry", "Entry", 
              "Get value from current entry.");              
AddExpression(2, ef_return_string, "Transfer hash to string", 
              "JSON", "HashTableToString", "Transfer hash table to JSON string.");
AddStringParam("Key", "The key string of the hash to get.", '""');
AddExpression(3, ef_return_any | ef_variadic_parameters, "Get value at", 
              "Value", "At", "Get value from the hash by key string, return JSON string if the item is an object. Add second parameter to return default value when got invalid value.");
AddExpression(4, ef_return_string, "Current key", "For Each", "CurKey", "Get the current key in a For Each loop.");
AddExpression(5, ef_return_any, "Current value", "For Each", "CurValue", "Get the current value in a For Each loop.");
AddAnyTypeParam("Key", "The key of the hash to get.", '""');
AddExpression(6, ef_return_any | ef_variadic_parameters, "Get value at", 
              "Value", "AtKeys", "Get value from the hash by keys, each parameter is a key.");
AddStringParam("Key", "The key of the hash to get.", '""');
AddExpression(7, ef_return_number, "Get items count", "Items", "ItemCnt", 
              "Get item count. 0 means the item is number or string type, (-1) means the item does not exist.");              
AddAnyTypeParam("Key", "The key of the hash to get.", '""');
AddExpression(8, ef_return_number | ef_variadic_parameters, "Get items count by keys", "Items", "Keys2ItemCnt", 
              "Get item count by keys, each parameter is a key. 0 means the item is number or string type, (-1) means the item does not exist.");
AddExpression(9, ef_return_string | ef_variadic_parameters, "Transfer hash table to string", 
              "JSON", "ToString", "Create a hash table and transfer it to JSON string. If there has no parameter, transfer current hash table to JSON string.");			  


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Initial data", "", 
                   'Set initial data. ex:"{"a":10,"b":{"c":"d"}}".'),	     
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
    if (this.properties["Initial data"] != "")
        var data = JSON.parse(this.properties["Initial data"]);
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
