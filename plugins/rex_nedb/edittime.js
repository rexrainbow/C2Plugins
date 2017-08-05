function GetPluginSettings()
{
	return {
		"name":			"Nedb",
		"id":			"Rex_nedb",
		"version":		"0.1",        
		"description":	"Asynchronous database. Reference from https://github.com/louischatriot/nedb",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_nedb.html",
		"category":		"Rex - Data structure - Database",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"nedb.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions                   
 AddCondition(11, cf_trigger, "On update", "Save", 
            "On update complete",
            "Triggered when update book complete.", "OnUpdateComplete");

AddCondition(12, cf_trigger, "On update error", "Save", 
            "On update error",
            "Triggered when update book error.", "OnUpdateError");

AddCondition(81, cf_trigger, "On load rows", "Load", 
            "On load rows",
            "Triggered when load rows complete.", "OnReceivedComplete");

AddCondition(82, cf_trigger, "On load rows error", "Load", 
            "On load rows error",
            "Triggered when load rows error.", "OnReceivedError");   
            
AddCondition(83, cf_looping | cf_not_invertible, "For each row", "For each row", 
             "For each row", 
             "Repeat the event for each queried row.", "ForEachRow");            

AddCondition(103, cf_trigger, "On remove rows", "Remove", 
            "On remove rows complete",
            "Triggered when remove complete.", "OnRemoveRowsComplete");

AddCondition(104, cf_trigger, "On remove rows error", "Remove", 
            "On remove rows error",
            "Triggered when remove error.", "OnRemoveRowsError");               
            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("CSV string", "The CSV string for inserting.", '""');
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Eval", "Eval the string.", 1);
AddStringParam("Delimiter", "Delimiter for splitting rows.", '","');
AddAction(1, 0, "Insert CSV data", "Insert - CSV", 
         "Insert data to <i>{0}</i> (CSV format with eval mode to <i>{1}</i>, delimiter to <i>{2}</i>)",
         "Insert data from CSV string.", "InsertCSV");
         
AddStringParam("JSON string", "The JSON string for inserting.", '""');
AddAction(2, 0, "Insert JSON data", "Insert - JSON", 
         "Insert data to <i>{0}</i> (JSON format)",
         "Insert data from JSON string.", "InsertJSON");
         
AddAction(3, 0, "Remove all", "Remove", 
         "Remove all rows",
         "Remove all rows.", "RemoveAll");         
         
AddStringParam("Keys", 'Unique index keys, separated by ","'); 
AddComboParamOption("");
AddComboParamOption("Unique");
AddComboParam("Type", "Type of index keys.", 1);
AddAction(4, 0, "Set index keys", "Index keys", 
          "Set <i>{1}</i> index keys to <i>{0}</i>", 
          "Set index keys.", "SetIndexKeys");   
          
AddStringParam("Row ID", "Row ID");           
AddAction(5, 0, "Remove by row ID", "Remove - row ID",
         "Remove row by row ID to <i>{0}</i>",
         "Remove row by row ID.", "RemoveByRowID");  

AddNumberParam("Index", "Index of queried rows.", 0);         
AddAction(6, 0, "Remove by row index", "Remove - row ID",
         "Remove row by row index to <i>{0}</i>",
         "Remove row by row index.", "RemoveByRowIndex");          

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddComboParamOption("");
AddComboParamOption("if greater");
AddComboParamOption("if less");
AddComboParam("Condition", "Set value if new value is greater or less then old value.", 0);
AddAction(11, 0, "Set value", "Save - prepare item", 
          "Prepare- Set key <i>{0}</i> to <i>{1}</i> <i>{2}</i>", 
          "Set value into current item.", "SetValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1); 
AddAction(12, 0, "Set boolean value", "Save - prepare item", 
          "Prepare- Set key <i>{0}</i> to <i>{1}</i>", 
          "Set boolean value into current item.", "SetBooleanValue"); 

AddAction(13, 0, "Save", "Save", 
          "Save- Save prepared item", 
          'Save prepared item into server.', "Save");          

AddAction(14, 0, "Add to queue", "Save - save-all queue", 
          "Add current prepared item into save-all queue", 
          "Add current prepared item into save-all queue.", "AddToSaveAllQueue"); 
          
AddAction(15, 0, "Save all", "Save - save-all queue", 
          "Save all rows in queue",
          "Save all rows in queue.", "SaveAll");  
                    
AddStringParam("Row ID", "Row ID"); 
AddAction(16, 0, "Set row ID", "Save - row ID", 
          "Prepare- Set row ID to <i>{0}</i>", 
          'Set row ID.', "SetRowID");    

AddNumberParam("Index", "Index of queried rows.", 0);
AddAction(17, 0, "Set row index", "Save - row ID", 
          "Prepare- Set index of queried rows to <i>{0}</i>", 
          "Convert index of queried rows to row ID for saving. Append row if row ID had not found.", "SetRowIndex");           

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(18, 0, "Add to", "Save - prepare item", 
          "Prepare- Add <i>{1}</i> to key <i>{0}</i>", 
          "Add value to key.", "IncValue");

AddAction(19, 0, "Update queried rows", "Save", 
          "Save- Update queried rows by prepared item", 
          'Update queried rows by prepared item.', "Update");
          
AddStringParam("Key", "The name of the key.", '""');
AddStringParam("JSON", "The JSON value to set.", '"{}"');
AddAction(20, 0, "Set JSON", "Save - prepare item", 
          "Prepare- Set JSON <i>{0}</i> to <i>{1}</i>", 
          "Set JSON value into current item.", "SetJSON");             
          
AddAction(41, 0, "1. New", "Filter - 1. new", 
          "Filter- 1. Create a new row filter", 
          "Create a new row filter.", "NewFilters");

AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("equal to");
AddComboParamOption("not equal to");
AddComboParamOption("greater than");
AddComboParamOption("less than");
AddComboParamOption("greater than or equal to");
AddComboParamOption("less than or equal to");
AddComboParam("Conditions", "Condition type.", 0);
AddAnyTypeParam("Value", "The value to comparsion, could be number or string.", 0);
AddAction(42, 0, "2. value compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value is <i>{1}</i> <i>{2}</i>", 
          "Add a value compared for this key.", "AddValueComparsion"); 
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Compared value", "Compared value.", 1);
AddAction(43, 0, "2. boolean value compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value is <i>{1}</i>", 
          "Add a boolean value compared for this key.", "AddBooleanValueComparsion");    

AddStringParam("Key", "The name of the key.", '""');  
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(44, 0, "2. value include", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value include <i>{1}</i>", 
          "Add a value including of this key.", "AddValueInclude");          

AddStringParam("Key", "The name of the key.", '""'); 
AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParam("Order", "Order of rows.", 1);                
AddAction(51, 0, "3. order", "Filter - 3. order", 
          "Filter- 3. sort with <i>{1}</i> order by key <i>{0}</i>", 
          "Order rows.", "AddOrder");             


AddAction(81, 0, "Load queried rows", "Load", 
          "Load queried rows", 
          "Load queried rows.", "LoadQueriedRows");  

AddAction(101, 0, "Remove queried rows", "Remove",
          "Remove queried rows", 
          "Remove queried rows.", "RemoveQueriedRows");            
          
AddStringParam("Key", "The name of the key.", '""');  
AddComboParamOption("string");
AddComboParamOption("number");
AddComboParamOption("any (eval)");
AddComboParam("Type", "Type.", 1);
AddAction(200, 0, "Define type", "Insert - CSV", 
         "Define key <i>{0}</i> to <i>{1}</i> type",
         "Define value type of a key.", "InsertCSV_DefineType");         
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Last error message", "Error", "LastErrorMessage", 
              "Get last error message.");
              
AddExpression(1, ef_return_string, "Key name of row ID", "Key name", "KeyRowID", 
              "Get key name of row ID.");
              
AddExpression(2, ef_return_string, "Last saved row ID", "Save", "LastSavedRowID", 
              "Get last saved row ID."); 
              
AddExpression(11, ef_return_string, "Queried rows to string", "Queried rows", "QueriedRowsAsJSON", 
              "Get JSON string of queried rows.");    

AddExpression(12, ef_return_any | ef_variadic_parameters, "Current row content", "Queried rows - For each row", "CurRowContent", 
              "Get current row content in JSON string in a For Each loop. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");

AddExpression(13, ef_return_number, "index of current row", "Queried rows - For each row", "CurRowIndex", 
              "Get index oif current row in a For Each loop.");

AddExpression(14, ef_return_string, "Current row ID", "Queried rows - For each row", "CurRowID", 
              "Get current rowID in a For Each loop.");
                                           
AddExpression(15, ef_return_number, "Current queried rows count", "Queried rows", "QueriedRowsCount", 
              'Get current queried rows count.');
                            
AddNumberParam("Index", "Index of queried rows.", 0);
AddExpression(21, ef_return_any | ef_variadic_parameters, "Index to queried row content", "Queried rows - Index", "Index2QueriedRowContent", 
              "Get queried rows content by index in JSON format. Add 2nd parameter to get value at the specific key. Add 3rd parameter for default value if this key is not existed.");

AddNumberParam("Index", "Index of queried rows.", 0);
AddExpression(22, ef_return_string, "Get rowID by Index of queried rows", "Queried rows - Index", "Index2QueriedRowID", 
              'Get rowID by Index of queried rows. Return "" if the specific row had not existed.');              
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Database name", "Nedb", 'Database reference. Sets "" to be a private in-memory database.'),
    new cr.Property(ept_combo, "Storage", "Disk", "Storage of this database.", "In memory|Disk"),    
	new cr.Property(ept_text, "Unique index keys", "", 'Unique index keys, separated by ","'),
	new cr.Property(ept_text, "Index keys", "", 'Index keys to speed up querying, separated by ","'),    
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
    if (this.properties["Database name"] === "")
        this.properties["Storage"] = "In memory";
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
