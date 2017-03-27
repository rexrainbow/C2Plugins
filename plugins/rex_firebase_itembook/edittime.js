function GetPluginSettings()
{
	return {
		"name":			"Item book",
		"id":			"Rex_Firebase_ItemBook",
		"version":		"0.1",        
		"description":	"Item tables to save and query items. Each value is indexed by (tableID, itemID, key).",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_itembook.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddAnyTypeParam("Table", "Table ID.", '""');
AddCondition(1, cf_not_invertible, "Table node", "Prepare - Tree structure", 
             "Table {0}", 
             "Add a table node.", "AddTableNode");
             
AddAnyTypeParam("ItemID", "ItemID", '""');
AddCondition(2, cf_not_invertible, "Item node", "Prepare - Tree structure", 
             "Item {0}", 
             "Add a item node.", "AddItemNode");
             
AddCondition(3, cf_not_invertible, "Remove on disconnected", "On disconnected - Tree", 
             "On disconnected- remove", 
             "Remove node on disconnected.", "TreeOnDisconnectedRemove");      
             
AddCondition(4, cf_not_invertible, "Cancel all handlers of disconnected", "On disconnected - Tree", 
             "On disconnected- cancel all handlers", 
             "Cancel all handlers of disconnected.", "TreeOnDisconnectedCancel");             
             

AddCondition(11, cf_trigger, "On update complete", "Save", 
            "On update complete",
            "Triggered when update book complete.", "OnUpdateComplete");

AddCondition(12, cf_trigger, "On update error", "Save", 
            "On update error",
            "Triggered when update book error.", "OnUpdateError");    

AddAnyTypeParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(51, cf_trigger, "On request complete", "Request", 
            "On request <i>{0}</i> complete",
            "Triggered when request current item complete.", "OnRequestComplete");

AddAnyTypeParam("Table", "Table ID.", '""');      
AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParamOption("logical descending");
AddComboParamOption("logical ascending");
AddComboParam("Order", "Order of itemID.", 1);          
AddCondition(52, cf_looping | cf_not_invertible, "For each itemID", "Load", 
             "Table {0}: for each itemID <i>{1}</i>", 
             "Repeat the event for each itemID of load result in a table.", "ForEachItemID");

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "ID of item.", '""');
AddCondition(53, cf_looping | cf_not_invertible, "For each key", "Load", 
             "Table {0}: for each key in item: <i>{1}</i>", 
             "Repeat the event for each key of a item of load result in a table.", "ForEachKey");     
             
AddAnyTypeParam("Table", "Table ID.", '""');               
AddCondition(54,  0, "Table is empty", "Load", 
             "Table {0}: is empty", 
             "Return true if no item in a table.", "TableIsEmpty");             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set sub domain", "Domain", 
          "Set sub domain to <i>{0}</i>", 
          "Set sub domain ref.", "SetSubDomainRef");
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(1, 0, "Set value", "Prepare - Tree", 
          "{0}: {1}",
          "Set number or string value.", "TreeSetValue");

AddAnyTypeParam("Key", "The name of the key.", '""');        
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(2, 0, "Set boolean value", "Prepare - Tree", 
          "{0}: {1}",
          "Set boolean value.", "TreeSetBooleanValue");   
          
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(3, 0, "Remove key", "Prepare - Tree", 
          "{0}: remove",
          "Remove key.", "TreeSetNullValue");            

AddAction(4, 0, "Remove all", "Prepare - Tree",  
          "Remove all",
          "Remove all keys or items.", "CleanAll");     
          
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(5, 0, "Set server timesetamp", "Prepare - Tree", 
          "{0}: server timestamp",
          "Set to server timestamp.", "TreeSetServerTimestamp");        
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddStringParam("JSON", "The JSON value to set.", '""');
AddAction(6, 0, "Set JSON", "Prepare - Tree", 
          "{0}: {1}",
          "Set JSON value.", "TreeSetJSON");          

AddAction(11, 0, "Update", "Save", 
          "Update",
          "Update book.", "UpdateBook");   

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');            
AddAnyTypeParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(21, 0, "Set value", "Prepare - Enumeration", 
          "Table {0}, item {1}: set key {2} to {3}",
          "Set number or string value.", "EnumSetValue");

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');            
AddAnyTypeParam("Key", "The name of the key.", '""');      
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(22, 0, "Set boolean value", "Prepare - Enumeration", 
           "Table {0}, item {1}: set key {2} to {3}",
          "Set boolean value.", "EnumSetBooleanValue");          

AddAnyTypeParam("Table", 'Table ID. Set to "" to remove all tables.', '""');      
AddAnyTypeParam("Item", 'Item ID. Set to "" to remove all items in the table.' , '""');            
AddAnyTypeParam("Key", 'The name of the key. Set to "" to remove all keys in the item.', '""');      
AddAction(23, 0, "Remove", "Prepare - Enumeration", 
           "Table {0}, item {1}: remove key {2}",
          "Remove key or item or table.", "EnumSetNullValue"); 

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');           
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(24, 0, "Set server timesetamp", "Prepare - Enumeration", 
         "Table {0}, item {1} set key {2} to server timestamp",
          "Set to server timestamp.", "EnumSetServerTimestamp");
          
AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');                
AddAnyTypeParam("Key", "The name of the key.", '""');
AddStringParam("JSON", "The JSON value to set.", '""');
AddAction(25, 0, "Set JSON", "Prepare - Enumeration", 
          "Table {0}, item {1} set key {2} to {3}",
          "Set JSON value.", "EnumSetJSON");            
          
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(31, 0, "Remove key", "On disconnected - Tree", 
          "{0}: remove (on disconnected)",
          "Remove key on disconnected.", "TreeOnDisconnectedRemove");       

AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(32, 0, "Set server timesetamp", "On disconnected - Tree", 
          "On disconnected- {0}: server timestamp",
          "Set to server timestamp on disconnected.", "TreeOnDisconnectedSetServerTimestamp");       

AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(33, 0, "Set value", "On disconnected - Tree", 
          "On disconnected- {0}: {1}",
          "Set value on disconnected.", "TreeOnDisconnectedSetValue");  

AddAnyTypeParam("Key", "The name of the key.", '""');        
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(34, 0, "Set boolean value", "On disconnected - Tree",
          "On disconnected- {0}: {1}",
          "Set boolean value on disconnected.", "TreeOnDisconnectedSetBooleanValue");     

AddAnyTypeParam("Key", "The name of the key.", '""');        
AddStringParam("JSON", "The JSON value to set.", '""');
AddAction(35, 0, "Set JSON", "On disconnected - Tree",
          "On disconnected- {0}: {1}",
          "Set JSON value on disconnected.", "TreeOnDisconnectedSetJSON")    
          
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(36, 0, "Cancel all handlers", "On disconnected - Tree", 
          "{0}: cancel all handlers (on disconnected)",
          "Cancel all handlers of disconnected.", "TreeOnDisconnectedCancel");                 

AddAnyTypeParam("Table", 'Table ID. Set to "" to remove all tables.', '""');      
AddAnyTypeParam("Item", 'Item ID. Set to "" to remove all items in the table.' , '""');            
AddAnyTypeParam("Key", 'The name of the key. Set to "" to remove all keys in the item.', '""');      
AddAction(41, 0, "Remove key", "On disconnected - Enumeration", 
          "On disconnected- table {0}, item {1}: remove key {2}",
          "Remove key on disconnected.", "EnumOnDisconnectedRemove");       

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');             
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAction(42, 0, "Set server timesetamp", "On disconnected - Enumeration", 
          "On disconnected- table {0}, item {1}: set key {2} to server timestamp",
          "Set to server timestamp on disconnected.", "EnumOnDisconnectedSetServerTimestamp");       

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');             
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(43, 0, "Set server timesetamp", "On disconnected - Enumeration", 
          "On disconnected- table {0}, item {1}: set key {2} to {3}",
          "Set value on disconnected.", "EnumOnDisconnectedSetValue");       

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');             
AddAnyTypeParam("Key", "The name of the key.", '""');          
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(44, 0, "Set boolean value", "On disconnected - Enumeration",
          "On disconnected- table {0}, item {1}: set key {2} to {3}",
          "Set boolean value on disconnected.", "EnumOnDisconnectedSetBooleanValue");          

AddAnyTypeParam("Table", "Table ID.", '""');      
AddAnyTypeParam("Item", "Item ID.", '""');             
AddAnyTypeParam("Key", "The name of the key.", '""');   
AddStringParam("JSON", "The JSON value to set.", '""');
AddAction(45, 0, "Set server timesetamp", "On disconnected - Enumeration", 
          "On disconnected- table {0}, item {1}: set key {2} to {3}",
          "Set JSON value on disconnected.", "EnumOnDisconnectedSetJSON");     

AddAnyTypeParam("Table", 'Table ID. Set to "" to remove all tables.', '""');      
AddAnyTypeParam("Item", 'Item ID. Set to "" to remove all items in the table.' , '""');            
AddAnyTypeParam("Key", 'The name of the key. Set to "" to remove all keys in the item.', '""');      
AddAction(46, 0, "Cancel", "On disconnected - Enumeration", 
          "On disconnected- table {0}, item {1}: cancel all handlers",
          "Cancel all handlers of disconnected.", "EnumOnDisconnectedCancel");       


AddAnyTypeParam("Table", "Table ID.", '""');          
AddAnyTypeParam("Key", "The name of the key.", '""');          
AddAnyTypeParam("Start", "Start value.", 0);             
AddAnyTypeParam("End", "End value.", 0);
AddComboParamOption("Limit to first");       
AddComboParamOption("Limit to last");
AddComboParam("Limit", "Limit types.", 0);
AddNumberParam("Count", "Limit count. Set to (-1) to pick all queried items.", -1);    
AddStringParam("Tag", "A tag, to distinguish between different requests.", '"_"');
AddAction(51, 0, 'Get items by "In Range"', "Load - Signle query", 
          "Load - table {0}: get <i>{5}</i> items by condition: <i>{1}</i> in range <i>{2}</i> - <i>{3}</i>, <i>{4}</i> (tag <i>{6}</i>)", 
          "Get items by single condition-In Range with count limit in a table.", "GetItemsBySingleConditionInRange");  
          
AddAnyTypeParam("Table", "Table ID.", '""');          
AddAnyTypeParam("Key", "The name of the key.", '""');          
AddComboParamOption("Equal to");       
AddComboParamOption("Greater than or Equal to");
AddComboParamOption("Less than or Equal to");
AddComboParam("Comparison", "Comparison types.", 0);          
AddAnyTypeParam("Value", "Compared value.", 0);
AddComboParamOption("Limit to first");       
AddComboParamOption("Limit to last");
AddComboParam("Limit", "Limit types.", 0);
AddNumberParam("Count", "Limit count. Set to (-1) to pick all queried items.", -1);    
AddStringParam("Tag", "A tag, to distinguish between different requests.", '"_"');
AddAction(52, 0, 'Get items by comparison', "Load - Signle query", 
          "Load - table {0}: get <i>{5}</i> items by condition: <i>{1}</i> <i>{2}</i> <i>{3}</i>, <i>{4}</i> (tag <i>{6}</i>)", 
          "Get items by single condition with count limit in a table.", "GetItemsBySingleCondition");          

AddAnyTypeParam("Table", 'Table ID. Set to "" to load all tables.', '""');      
AddAnyTypeParam("Item", 'Item ID. Set to "" to load all items in the table.' , '""');            
AddStringParam("Tag", "A tag, to distinguish between different requests.", '"_"');          
AddAction(53, 0, "Load item", "Load - table/item", 
          "Load- table {0}, item {1} (tag <i>{2}</i>)", 
          "Load an item or a table, or all tables.", "LoadItem");      
  
AddStringParam("Tag", "A tag, to distinguish between different requests.", '"_"');     
AddAction(81, 0, "Start new request queue", "Load - queue", 
          "Start new request queue (tag <i>{0}</i>)", 
          "Start new request queue.", "StartQueue");   
       
AddAction(82, 0, "Process request queue", "Load - queue", 
          "Process request queue", 
          "Process all requests in queue.", "ProcessQueue");          

AddAnyTypeParam("Table", 'Table ID. Set to "" to clean all tables.', '""');     
AddAction(83, 0, "Clean result table", "Load",
          "Clean result table {0}",
          "Clean result table.", "CleanResultTable");                
          
AddAnyTypeParam("Table", "Key of table ID.", '"TableID"');      
AddAnyTypeParam("Item", "Key of item ID.", '"TItemID"');
AddAction(91, 0, "Set key name", "Convert - Item list", 
          "Convert tableID to key <i>{0}</i>, itemID to key <i>{1}</i>",
          "Set key name of item list.", "SetConvertKeyName");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Generate new key from push", "ItemID", "GenerateKey", 
              "Generate new key from push action.");               
AddExpression(2, ef_return_string, "Get last generated key", "ItemID", "LastGeneratedKey", 
              "Get last generate a key from push action.");   
                    
//AddAnyTypeParam("Table", "Table ID.", '""');      
//AddAnyTypeParam("Item", "Item ID.", '""');      
//AddAnyTypeParam("Key", "The name of the key.", '""');
AddExpression(3, ef_return_any | ef_variadic_parameters, "Get value at", "Value", "At", 
              "Get value in book, optional parameters are (tableID, itemID, key, defaultValue).");
              
AddExpression(4, ef_return_string, "Get last tableID", "Load", "LastTableID", 
              "Get last tableID of request.");   

AddExpression(5, ef_return_string, "Get last itemID", "Load", "LastItemID", 
              "Get last itemID of request.");       


AddExpression(51, ef_return_string, "Get itemID", "For Each", "CurItemID", 
              "Get current itemID in a For Each loop.");
              
AddExpression(52, ef_return_string, "Get key", "For Each", "CurKey", 
              "Get current key in a For Each loop.");

AddExpression(54, ef_return_any | ef_variadic_parameters, "Get value", "For Each", "CurValue", 
              "Get current value in a For Each loop."); 
              
AddExpression(55, ef_return_any | ef_variadic_parameters, "Get current item content", "For Each", "CurItemContent", 
              'Get current content in JSON stringin in a For Each loop. Add 2nd parameter for specific key, 3rd parameter for default value if this key is not existed.');              
                               
                                          
//AddAnyTypeParam("Table", "Table ID.", '""');      
//AddAnyTypeParam("Item", "Item ID.", '""');
AddExpression(91, ef_return_string | ef_variadic_parameters, "Convert table to item list", "Convert", "AsItemList", 
              "Convert table to item list (JSON string), optional parameters are (tableID, itemID).");              
              
//AddAnyTypeParam("Table", "Table ID.", '""');
AddExpression(92, ef_return_number | ef_variadic_parameters, "Get items count ", "Item count", "ItemCount", 
              "Get items count of all tables or add table ID in 1st parameter to get items count in that table.");                 
              
//AddAnyTypeParam("Table", "Table ID.", '""');      
//AddAnyTypeParam("Item", "Item ID.", '""');      
//AddAnyTypeParam("Key", "The name of the key.", '""');
AddExpression(101, ef_return_string | ef_variadic_parameters, "Get reference", "Reference", "Ref", 
              "Get renerence in book, optional parameters are (tableID, itemID, key).");
              
AddNumberParam("Length", "Length of string.", 1);
AddExpression(201, ef_return_string, "Get a random base32 string", "Random", "RandomBase32", 
              "Get a random base32 string.");
AddExpression(202, ef_return_string, "Get last random base32 string", "Random", "LastRandomBase32", 
              "Get last random base32 string.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Sub domain", "book", "Sub domain for this function."),
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
