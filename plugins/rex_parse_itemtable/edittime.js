function GetPluginSettings()
{
	return {
		"name":			"Item table",
		"id":			"Rex_parse_ItemTable",
		"version":		"0.1",        
		"description":	"Items table indexed by (itemID, key), supports writing a item or reading items back.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_parse_itemtable.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"parse-1.3.2.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(1, cf_trigger, "On save complete", "Save", 
            "On save <i>{0}</i> complete",
            "Triggered when save current item complete.", "OnSaveComplete");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(2, cf_trigger, "On save error", "Save", 
            "On save <i>{0}</i> error",
            "Triggered when save current item error.", "OnSaveError");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(3, cf_trigger, "On remove complete", "Remove", 
            "On remove <i>{0}</i> complete",
            "Triggered when remove current item complete.", "OnRemoveComplete");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(4, cf_trigger, "On remove error", "Remove", 
            "On remove <i>{0}</i> error",
            "Triggered when remove current item error.", "OnRemoveError");
            
AddCondition(11, cf_trigger, "On update complete", "Load", 
            "On update complete",
            "Triggered when update complete.", "OnReceived");
      
AddCondition(12, cf_looping | cf_not_invertible, "For each itemID", "Load", 
             "For each itemID", 
             "Repeat the event for each itemID of load result.", "ForEachItem");
             
AddCondition(91, cf_trigger, "On fetch one", "Load - itemID", 
            "On fetch one complete",
            "Triggered when fetch one item complete.", "OnFetchOneComplete");

AddCondition(92, cf_trigger, "On fetch error", "Load - itemID", 
            "On fetch one error",
            "Triggered when fetch one item error.", "OnFetchOneError"); 
            
AddCondition(101, cf_trigger, "On remove complete", "Remove - itemID", 
            "On remove complete",
            "Triggered when remove complete.", "OnRemoveComplete");

AddCondition(102, cf_trigger, "On remove error", "Remove - itemID", 
            "On remove error",
            "Triggered when remove error.", "OnRemoveError"); 
            
AddCondition(103, cf_trigger, "On remove items complete", "Remove - queried items", 
            "On remove queried items complete",
            "Triggered when remove complete.", "OnRemoveQueriedItemsComplete");

AddCondition(104, cf_trigger, "On remove items error", "Remove - queried items", 
            "On remove queried items error",
            "Triggered when remove error.", "OnRemoveQueriedItemsError");               
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(1, 0, "Set value", "Prepare item", 
          "Prepare- Set key <i>{0}</i> to  <i>{1}</i> in current item", 
          "Set value into current item.", "SetValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddAction(2, 0, "Set boolean value", "Prepare item", 
          "Prepare- Set key <i>{0}</i> to <i>{1}</i> in current item", 
          "Set boolean value into current item.", "SetBooleanValue"); 
          
AddStringParam("Key", "The name of the key.", '""');
AddAction(3, 0, "Remove key", "Prepare item",
          "Prepare- Remove key <i>{0}</i> in server", 
          "Remove key in firebase server.", "RemoveKey");            
          
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(4, 0, "Save to itemID", "Save", 
          "Save- Save current item at itemID: <i>{0}</i> (tag <i>{1}</i>)", 
          'Save current item into server. Push item if ID is equal to "".', "Save"); 

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(5, 0, "Push", "Save", 
          "Save- Push current item (tag <i>{0}</i>)", 
          'Push current item into server. Get itemID by "expression:LastItemID".', "Push");       

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(6, 0, "Save at first queried item", "Save", 
          "Save- Save current item at first queried item (tag <i>{0}</i>)", 
          "Overwrite first queried item. Create one if there had no queried item.", "OverwriteQueriedItems"); 		  

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
          "Load - update current page", 
          "Update current page.", "RequestUpdateCurrentPage"); 
          
AddAction(14, 0, "Turn to next page", "Load - page", 
          "Load- turn to next page", 
          "Turn to next page.", "RequestTurnToNextPage");  

AddAction(15, 0, "Turn to previous page", "Load - page", 
          "Load- turn to previous page", 
          "Turn to previous page.", "RequestTurnToPreviousPage");     

AddAction(21, 0, "1. New", "Item filter - 1. new", 
          "Filter- 1. Create a new item filter", 
          "Create a new item filter.", "NewFilter");  

AddStringParam("Key", "The name of the key.", '""');
AddAction(22, 0, "2. add all values", "Item filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: add all values ", 
          "Add all values for this key.", "AddAllValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(23, 0, "2. add to white list", "Item filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: add <i>{1}</i> to white list", 
          "Add a value into white list of this key.", "AddToWhiteList");
          
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(24, 0, "2. add to black list", "Item filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: add <i>{1}</i> to black list", 
          "Add a value into black list of this key.", "AddToBlackList"); 
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("equal to");
AddComboParamOption("not equal to");
AddComboParamOption("greater than");
AddComboParamOption("less than");
AddComboParamOption("greater than or equal to");
AddComboParamOption("less than or equal to");
AddComboParam("Conditions", "Condition type.", 0);
AddAnyTypeParam("Value", "The value to comparsion, could be number or string.", 0);
AddAction(25, 0, "2. add value compare", "Item filter - 2. key", 
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
AddAction(26, 0, "2. add timestamp constraint", "Item filter - 2. key", 
          "Filter- 2. add timestamp constraint: <i>{3}</i> <i>{0}</i> <i>{1}</i> (<i>{2}</i>)", 
          "Add a timestamp constraint into filter. They will be jointed by AND operation.", "AddTimeConstraint");

AddComboParamOption("Descending");
AddComboParamOption("Ascending");
AddComboParam("Order", "Order of items.", 1);     
AddStringParam("Key", "The name of the key.", '""');            
AddAction(31, 0, "3. order", "Item filter - 3. order", 
          "Filter- 3. sort with <i>{0}</i> order by key <i>{1}</i>", 
          "Order items.", "AddOrder");
          
AddAction(41, 0, "4. add all keys", "Item filter - 4. fetching fields", 
          "Filter- 4. add all keys into fetching fields", 
          "Add all keys into fetching fields.", "AddAllFields");          

AddStringParam("Key", "The name of the key.", '""');          
AddAction(42, 0, "4. add a key", "Item filter - 4. fetching fields", 
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
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Current itemID", "Received - for each", "CurItemID", 
              "Get the current itemID in a For Each loop.");               
AddExpression(2, ef_return_any | ef_variadic_parameters, "Current item content", "Received - for each", "CurItemContent", 
              "Get current item content in JSON string in a For Each loop. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
AddExpression(3, ef_return_number, "Current sent unix timestamp", "Received - for each", "CurSentAt", 
              "Get the current sent unix timestamp (number of milliseconds since the epoch) in a For Each loop.");
AddExpression(4, ef_return_number, "Current message index", "Received - for each", "CurItemIndex", 
              "Get the current message index in a For Each loop."); 
AddExpression(5, ef_return_any | ef_variadic_parameters, "Prepared item content", "Prepare item", "PreparedItemContent", 
              "Get prepared item content in JSON string. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
AddNumberParam("Index", "Global index, 0-based.", 0); 			  
AddExpression(12, ef_return_any | ef_variadic_parameters, "Get item content by global insex", "Received", "Index2ItemContent", 
              "Get item content in JSON string by global index. Add 2nd parameter to get value at the specific key. Add 3rd parameter for default value if this key is not existed.");
			  
AddExpression(91, ef_return_string, "Last fetched itemID", "Fetch one", "LastFetchedItemID", 
              "Get last fetched itemID.");               
AddExpression(92, ef_return_any | ef_variadic_parameters, "Last fetched item content", "Fetch one", "LastFetchedItemContent", 
              "Get last fetched item content in JSON string. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
AddExpression(93, ef_return_number, "Last fetched item's sent unix timestamp", "Fetch one", "LastFetchedSentAt", 
              "Get last fetched item's sent unix timestamp (number of milliseconds since the epoch).");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Application ID", "", "Application ID"),
	new cr.Property(ept_text, "Javascript Key", "", "Javascript Key"),
    new cr.Property(ept_text, "Class name", "items", "Class name for storing leaderboard structure."), 
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),
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
