function GetPluginSettings()
{
	return {
		"name":			"Item table",
		"id":			"Rex_Backendless_ItemTable",
		"version":		"0.1",        
		"description":	"Items table indexed by (itemID, key), supports writing an item or reading items back.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_backendless_itemtable.html",
		"category":		"Rex - Web - Backendless",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On save", "Save", 
            "On save complete",
            "Triggered when save current item complete.", "OnSaveComplete");

AddCondition(2, cf_trigger, "On save error", "Save", 
            "On save error",
            "Triggered when save current item error.", "OnSaveError");

AddCondition(11, cf_trigger, "On receive items", "Load", 
            "On receive items",
            "Triggered when receive items complete.", "OnReceived");
      
AddCondition(12, cf_looping | cf_not_invertible, "For each itemID", "Load - for each", 
             "For each item", 
             "Repeat the event for each itemID of load result.", "ForEachItem");
             
AddCondition(13, cf_trigger, "On receive items error", "Load", 
            "On receive items error",
            "Triggered when receive items error.", "OnReceivedError");    
            
AddCondition(14, 0, "Last page", "Load", 
             "Is the last page", 
             "Return true if current page is the last page.", "IsTheLastPage");   
             
AddNumberParam("Start", "Start from message index (0-based).", 0);  
AddNumberParam("End", "End to message index (0-based). This value should larger than Start.", 2);    
AddCondition(15, cf_looping | cf_not_invertible, "For each item in a range", "Load - for each", 
             "For each item from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each item in a range.", "ForEachItem");                                
             
AddCondition(91, cf_trigger, "On load by itemID", "Load - itemID", 
            "On load by itemID complete",
            "Triggered when load by itemID item complete.", "OnLoadByItemIDComplete");

AddCondition(92, cf_trigger, "On load by itemID error", "Load - itemID", 
            "On load by itemID error",
            "Triggered when load by itemID item error.", "OnLoadByItemIDError"); 
            
AddCondition(101, cf_trigger, "On remove by itemID", "Remove by itemID", 
            "On remove by itemID complete",
            "Triggered when remove by itemID complete.", "OnRemoveByItemIDComplete");

AddCondition(102, cf_trigger, "On remove by itemID error", "Remove by itemID", 
            "On remove by itemID error",
            "Triggered when remove by itemID error.", "OnRemoveByItemIDError"); 
            
AddCondition(103, cf_trigger, "On remove queried items", "Remove by queried items", 
            "On remove queried items complete",
            "Triggered when remove complete.", "OnRemoveQueriedItemsComplete");

AddCondition(104, cf_trigger, "On remove queried items error", "Remove by queried items", 
            "On remove queried items error",
            "Triggered when remove error.", "OnRemoveQueriedItemsError");    
            
AddCondition(111, cf_trigger, "On get items count", "Queried items count",
            "On get items count complete",
            "Triggered when get items count.", "OnGetItemsCountComplete");

AddCondition(112, cf_trigger, "On get items count error", "Queried items count",
            "On get items count error",
            "Triggered when get items count error.", "OnGetItemsCountError");   
            
AddCondition(211, cf_trigger, "On save all", "Save all", 
            "On save all complete",
            "Triggered when save all items complete.", "OnSaveAllComplete");

AddCondition(212, cf_trigger, "On save all error", "Save all", 
            "On save all error",
            "Triggered when save all items error.", "OnSaveAllError");                                   
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddComboParamOption("");
AddComboParamOption("Primary ");
AddComboParam("Key type", "Key type.", 0);
AddAction(1, 0, "Set value", "Save - prepare item", 
          "Prepare- Set {2}key <i>{0}</i> to <i>{1}</i>", 
          "Set value into current item.", "SetValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddComboParamOption("");
AddComboParamOption("Primary ");
AddComboParam("Key type", "Key type.", 0); 
AddAction(2, 0, "Set boolean value", "Save - prepare item", 
          "Prepare- Set {2}key <i>{0}</i> to <i>{1}</i>", 
          "Set boolean value into current item.", "SetBooleanValue");
     
AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10); 
AddAction(11, 0, "Load in a range", "Load", 
          "Load- start from <i>{0}</i> with <i>{1}</i> lines", 
          "Load in a range.", "RequestInRange");
          
AddNumberParam("Index", "Page index, 0-based.", 0);
AddAction(12, 0, "Turn to page", "Load - page", 
          "Load- turn to page <i>{0}</i>", 
          "Turn to page.", "RequestTurnToPage");
                           
AddAction(13, 0, "Update current page", "Load - page", 
          "Load- update current page", 
          "Update current page.", "RequestUpdateCurrentPage"); 
          
AddAction(14, 0, "Turn to next page", "Load - page", 
          "Load- turn to next page", 
          "Turn to next page.", "RequestTurnToNextPage");  

AddAction(15, 0, "Turn to previous page", "Load - page", 
          "Load- turn to previous page", 
          "Turn to previous page.", "RequestTurnToPreviousPage");    
          
AddAction(16, 0, "Load all queried items", "Load - all", 
          "Load- Load all queried items", 
          "Load all queried items.", "LoadAllItems");            

AddAction(21, 0, "1. New", "Filter - 1. new", 
          "Filter- 1. Create a new item filter", 
          "Create a new item filter.", "NewFilter");
          
AddStringParam("Key", "The name of the key.", '""');
AddAction(22, 0, "2. all values", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: all values ", 
          "Add all values for this key.", "AddAllValue")

AddStringParam("Condition", "Condition of filter.", '""');
AddAction(24, 0, "2. condition", "Filter - 2. key", 
          "Filter- 2. <i>{0}</i>", 
          "Add condition.", "AddFilterCondition");           

AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("equal to");
AddComboParamOption("not equal to");
AddComboParamOption("greater than");
AddComboParamOption("less than");
AddComboParamOption("greater than or equal to");
AddComboParamOption("less than or equal to");
AddComboParam("Conditions", "Condition type.", 0);
AddAnyTypeParam("Value", "The value to comparsion, could be number or string.", 0);
AddAction(25, 0, "2. value compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value is <i>{1}</i> <i>{2}</i>", 
          "Add a value compared for this key.", "AddValueComparsion");          
          
AddComboParamOption("Before");
AddComboParamOption("After");
AddComboParam("When", "Before or after the timestamp.", 1); 
AddNumberParam("Timestamp", "Timestamp in milliseconds.", 0);
AddComboParamOption("Excluded");
AddComboParamOption("Included");
AddComboParam("Include", "Include compared timestamp or excluded.", 1); 
AddComboParamOption("Created");
AddComboParamOption("Updated");
AddComboParam("Type", "Type of compared timestamp.", 0);  
AddAction(26, 0, "2. timestamp constraint", "Filter - 2. key", 
          "Filter- 2. add timestamp constraint: <i>{3}</i> <i>{0}</i> <i>{1}</i> (<i>{2}</i>)", 
          "Add a timestamp constraint into filter. They will be jointed by AND operation.", "AddTimeConstraint");
          
AddStringParam("Key", "The name of the key.", '""');
AddStringParam("Pattern", "String pattern.", '""');
AddComboParamOption("at start");
AddComboParamOption("at end");
AddComboParamOption("within");
AddComboParam("Type", "Type of compared timestamp.", 0);  
AddAction(27, 0, "2. string pattern compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: pattern <i>{1}</i> <i>{2}</i>", 
          "Add string pattern compare for this key.", "AddStringPattern"); 

AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("does not exist");
AddComboParamOption("exist");
AddComboParam("Exist", "Key exists or not.", 1); 
AddAction(28, 0, "2. key exist", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: <i>{1}</i>", 
          "Add existing for this key.", "AddExist");    
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Compared value", "Compared value.", 1);
AddAction(29, 0, "2. boolean value compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value is <i>{1}</i>", 
          "Add a boolean value compared for this key.", "AddBooleanValueComparsion");                  

AddStringParam("Key", "The name of the key.", '""'); 
AddComboParamOption("Descending");
AddComboParamOption("Ascending");
AddComboParam("Order", "Order of items.", 1);                
AddAction(31, 0, "3. order", "Filter - 3. order", 
          "Filter- 3. sort with <i>{1}</i> order by key <i>{0}</i>", 
          "Order items.", "AddOrder");
          
AddStringParam("Key", "The name of the key.", '""');          
AddAction(42, 0, "4. add a key", "Filter - 4. fetching fields", 
          "Filter- 4. add key <i>{0}</i> into fetching fields", 
          "Add a key into fetching fields.", "AddAField");          

AddStringParam("ID", "ID of item.", '""');
AddAction(91, 0, "Load by itemID", "Load - itemID", 
          "Load- load item by itemID: <i>{0}</i>", 
          "Load item by itemID.", "FetchByItemID");          
          
AddStringParam("ID", "ID of item.", '""');
AddAction(101, 0, "Remove by itemID", "Remove", 
          "Remove- remove item by itemID: <i>{0}</i>", 
          "Remove item by itemID.", "RemoveByItemID");    

AddAction(102, 0, "Remove queried items", "Remove - queried items", 
          "Remove- remove queried items", 
          "Remove queried items.", "RemoveQueriedItems");  

// NEW          
AddNumberParam("Index", "Index of queried rows.", 0);         
AddAction(103, 0, "Remove by index", "Remove", 
         "Remove item by index to <i>{0}</i>",
         "Remove item by index.", "RemoveByIndex");             
          
AddAction(111, 0, "Get items count", "Queried items count", 
          "Get queried items count", 
          "Get queried items count.", "GetItemsCount");    
          
AddNumberParam("Count", "Count of picked item.", 1);    
AddAction(112, 0, "Load random queried items", "Load - random", 
          "Load - load <i>{0}</i> random queried items", 
          "Load random queried items.", "LoadRandomItems");
     
AddStringParam("Key", "The name of the key.", '""');
AddStringParam("Class name", "Class name of linked object.", '""');
AddStringParam("Object ID", "Object ID of linked object.", '""'); 
AddAction(121, 0, "Link to object", "Save - prepare item", 
          "Prepare- set key <i>{0}</i> to objectID: <i>{1}</i> on <i>{2}</i>", 
          "Link to object at key into current item.", "LinkToObject");   

AddStringParam("Key", "The name of the key.", '""');
AddAction(122, 0, "Link to current user", "Save - prepare item", 
          "Prepare- set key <i>{0}</i> to current user", 
          "Link to current user at key into current item.", "LinkToCurrentUser");          

AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("does not include");
AddComboParamOption("include");
AddComboParam("Include", "Include or not.", 1);   
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(201, 0, "2. value include", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value <i>{1}</i> <i>{2}</i>", 
          "Add a value including/not including of this key.", "AddValueInclude");       

AddStringParam("Key", "The name of the key.", '""');
AddAction(202, 0, "4. Get linked object", "Filter - 4. fetching fields", 
          "Filter- 4. key <i>{0}</i>: get linked object", 
          "Get linked object at this key.", "AddGetLinkedObject"); 
          
AddStringParam("ItemID", "Object ID of item.", '""');
AddAction(203, 0, "2. itemID include", "Filter - 2. itemID", 
          "Filter- 2. itemID: include <i>{0}</i>", 
          "Add an itemID including.", "AddItemIDInclude");
          
AddStringParam("ID", "ID of item.", '""');
AddAction(204, 0, "Set itemID", "Save - prepare item", 
          "Prepare- Set itemID to <i>{0}</i>", 
          "Set itemID of current item.", "SetItemID"); 
          
AddAction(205, 0, "Save", "Save", 
          "Save- Save prepared item", 
          'Save prepared item into server.', "Save"); 

AddNumberParam("Index", "Index of queried rows.", 0);
AddAction(206, 0, "Set index", "Save", 
          "Prepare- Set index of queried items to <i>{0}</i>", 
          "Convert index of queried items to itemID for saving. Append item if index had not found.", "SetItemIDByIndex");                      
          
AddAction(211, 0, "Add to queue", "Save - save-all queue", 
          "Add current prepared item into save-all queue", 
          "Add current prepared item into save-all queue.", "AddToSaveAllQueue"); 

AddAction(212, 0, "Save all", "Save - save-all queue", 
          "Save all items in queue",
          "Save all items in queue.", "SaveAll");  
          
AddStringParam("Keys", 'Primary keys, separated by ","');         
AddAction(213, 0, "Set primary keys", "Primary keys", 
          "Set primary keys to <i>{0}</i>", 
          "Set primary keys.", "SetPrimaryKeys");                             
                                        
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Current itemID", "Load - for each", "CurItemID", 
              "Get the current itemID in a For Each loop.");               
AddExpression(2, ef_return_any | ef_variadic_parameters, "Current item content", "Load - for each", "CurItemContent", 
              "Get current item content in JSON string in a For Each loop. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
AddExpression(3, ef_return_number, "Current saved unix timestamp", "Load - for each", "CurSavedTime", 
              "Get the current saved unix timestamp (number of milliseconds since the epoch) in a For Each loop.");
AddExpression(4, ef_return_number, "Current item index", "Load - for each - index", "CurItemIndex", 
              "Get the current item index in a For Each loop."); 
AddExpression(5, ef_return_any | ef_variadic_parameters, "Prepared item content", "Prepare item", "PreparedItemContent", 
              "Get prepared item content in JSON string. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
AddExpression(6, ef_return_number, "Received items count", "Received", "ReceivedItemsCount", 
              "Get received items count in current received page.");
AddExpression(7, ef_return_number, "Current start index", "Load - for each - index", "CurStartIndex", 
              "Get start index in current received page.");
AddExpression(8, ef_return_number, "Current loop index", "Load - for each - index", "LoopIndex", 
              "Get loop index in current received page.");              

AddNumberParam("Index", "Global index, 0-based.", 0);                    
AddExpression(11, ef_return_string, "Get itemID by global index", "Load - index", "Index2ItemID", 
              "Get itemID by global index.");                                               
AddNumberParam("Index", "Global index, 0-based.", 0); 			  
AddExpression(12, ef_return_any | ef_variadic_parameters, "Get item content by global index", "Load - index", "Index2ItemContent", 
              "Get item content in JSON string by global index. Add 2nd parameter to get value at the specific key. Add 3rd parameter for default value if this key is not existed.");
AddNumberParam("Index", "Global index, 0-based.", 0); 	
AddExpression(13, ef_return_number, "Get saved unix timestamp by global index", "Load - index", "Index2SavedTime", 
              "Get saved unix timestamp (number of milliseconds since the epoch) by global index.");              
              
AddExpression(21, ef_return_string, "All read items", "Load", "ItemsToJSON", 
              "Get all read items in JSON string.");              
              
AddExpression(31, ef_return_string, "Last saved itemID", "Save", "LastSavedItemID", 
              "Get last saved itemID.");   
			  
AddExpression(91, ef_return_string, "Last fetched itemID", "Load by itemID", "LastFetchedItemID", 
              "Get last fetched itemID.");               
AddExpression(92, ef_return_any | ef_variadic_parameters, "Last fetched item content", "Load by itemID", "LastFetchedItemContent", 
              "Get last fetched item content in JSON string. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
AddExpression(93, ef_return_number, "Last fetched item's saved unix timestamp", "Load by itemID", "LastFetchedSavedTime", 
              "Get last fetched item's saved unix timestamp (number of milliseconds since the epoch).");
              
AddExpression(101, ef_return_string, "Last removed itemID", "Remove", "LastRemovedItemID", 
              'Get last removed itemID under "Condition:On remove by itemID complete".');               

AddExpression(111, ef_return_number, "Last items count", "Queried items count", "LastItemsCount", 
              'Get last queried items count under "Condition: On get items count complete".');              
              
              
AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");

AddExpression(2100, ef_return_any | ef_variadic_parameters, "Get value at", "Load", "At", 
              "Get value from current database. Add index keys then add 1 data key. Add an optional default value at the last.");
              
                                                  
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Class", "",	"Class of the table."),        
    new cr.Property(ept_text, "Class name", "Items", "Class name for storing items structure."), 
    
    new cr.Property(ept_section, "Page", "",	"Paging for reading."),        
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),
    
    new cr.Property(ept_section, "Indexing", "",	"Primary keys for indexing."),     
	new cr.Property(ept_text, "Primary keys", "", 'Primary keys, separated by ","'),  
    
    new cr.Property(ept_section, "Misc", "",	"Other setting."),  
	new cr.Property(ept_combo, "Clean meta data", "Yes", "Clean meta data of receiving items.", "No|Yes"), 
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
