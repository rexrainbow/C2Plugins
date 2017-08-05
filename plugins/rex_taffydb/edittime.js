function GetPluginSettings()
{
	return {
		"name":			"Taffydb",
		"id":			"Rex_taffydb",
		"version":		"0.1",        
		"description":	"Database. Reference from http://www.taffydb.com/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_taffydb.html",
		"category":		"Rex - Data structure - Database",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"taffy.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions      
AddCondition(1, cf_looping | cf_not_invertible, "For each row", "For each row", 
             "For each row", 
             "Repeat the event for each queried row.", "ForEachRow");

AddCondition(21, 0, "1. New", "Filter - 1. new", 
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
AddCondition(22, 0, "2. value compare", "Filter - 2. key", 
             "Filter- 2. key <i>{0}</i>: value is <i>{1}</i> <i>{2}</i>", 
             "Add a value compared for this key.", "AddValueComparsion");      
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Compared value", "Compared value.", 1);
AddCondition(23, 0, "2. boolean value compare", "Filter - 2. key", 
             "Filter- 2. key <i>{0}</i>: value is <i>{1}</i>", 
             "Add a boolean value compared for this key.", "AddBooleanValueComparsion");       
             
AddStringParam("Key", "The name of the key.", '""');  
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddCondition(24, 0, "2. value include", "Filter - 2. key", 
             "Filter- 2. key <i>{0}</i>: value include <i>{1}</i>", 
             "Add a value including of this key.", "AddValueInclude");   

AddStringParam("Key", "The name of the key.", '""');  
AddStringParam("Regex", "Test string with regular expression.", '""');  
AddStringParam("Flags", "Test flags with regular expression.", '""');  
AddCondition(25, 0, "2. regex matched", "Filter - 2. key", 
             "Filter- 2. key <i>{0}</i>: regex matched with regex <i>{1}</i>, flags <i>{2}</i>", 
             "Add a regex matched for this key.", "AddRegexTest");                                                          
             
AddStringParam("Key", "The name of the key.", '""'); 
AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParamOption("logical descending");
AddComboParamOption("logical ascending");
AddComboParam("Order", "Order of items.", 1);                
AddCondition(31, 0, "3. order", "Filter - 3. order", 
             "Filter- 3. sort with <i>{1}</i> order by key <i>{0}</i>", 
             "Order items.", "AddOrder");         
             
//AddNumberParam("Start index", "Index of queried rows.", 0);
//AddNumberParam("Rows", "Number of rows.", 10);
//AddCondition(41, 0, "4. page", "Page", 
//             "Page- start from <i>{0}</i> with <i>{1}</i> rows", 
//             "Get queried rows in a range.", "Page");                   
//////////////////////////////////////////////////////////////
// Actions

AddStringParam("CSV string", "The CSV string for inserting.", '""');
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Eval", "Eval the string.", 1);
AddStringParam("Delimiter", "Delimiter for splitting items.", '","');
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
         
AddStringParam("Keys", 'Index keys, separated by ","'); 
AddAction(4, 0, "Set index keys", "Index keys", 
          "Set index keys to <i>{0}</i>", 
          "Set index keys.", "SetIndexKeys");   

AddStringParam("Row ID", "Row ID");           
AddAction(5, 0, "Remove by row ID", "Remove - row ID",
         "Remove row by row ID: <i>{0}</i>",
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
          
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(14, 0, "Update value", "Update queried rows", 
          "Update key <i>{0}</i> to <i>{1}</i> in all queried rows", 
          "Update queried rows.", "UpdateQueriedRows");                 
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1); 
AddAction(15, 0, "Update boolean value", "Update queried rows", 
          "Update key <i>{0}</i> to <i>{1}</i> in all queried rows", 
          "Update queried rows.", "UpdateQueriedRows_BooleanValue");
                    
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
          
AddStringParam("Key", "The name of the key.", '""');
AddStringParam("JSON", "The JSON value to set.", '"{}"');
AddAction(19, 0, "Set JSON", "Save - prepare item", 
          "Prepare- Set JSON <i>{0}</i> to <i>{1}</i>", 
          "Set JSON value into current item.", "SetJSON");          

AddAction(21, 0, "1. New", "Filter - 1. new", 
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
AddAction(22, 0, "2. value compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value is <i>{1}</i> <i>{2}</i>", 
          "Add a value compared for this key.", "AddValueComparsion"); 
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Compared value", "Compared value.", 1);
AddAction(23, 0, "2. boolean value compare", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value is <i>{1}</i>", 
          "Add a boolean value compared for this key.", "AddBooleanValueComparsion"); 
          
AddStringParam("Key", "The name of the key.", '""');  
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(24, 0, "2. value include", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: value include <i>{1}</i>", 
          "Add a value including of this key.", "AddValueInclude");    

AddStringParam("Key", "The name of the key.", '""');  
AddStringParam("Regex", "Test string with regular expression.", '""');  
AddStringParam("Flags", "Test flags with regular expression.", '""');  
AddAction(25, 0, "2. regex matched", "Filter - 2. key", 
          "Filter- 2. key <i>{0}</i>: regex matched with regex <i>{1}</i>, flags <i>{2}</i>", 
          "Add a regex matched for this key.", "AddRegexTest");         
          
AddStringParam("Key", "The name of the key.", '""'); 
AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParamOption("logical descending");
AddComboParamOption("logical ascending");
AddComboParam("Order", "Order of items.", 1);                
AddAction(31, 0, "3. order", "Filter - 3. order", 
          "Filter- 3. sort with <i>{1}</i> order by key <i>{0}</i>", 
          "Order items.", "AddOrder");                     
          
//AddNumberParam("Start index", "Index of queried rows.", 0);
//AddNumberParam("Rows", "Number of rows.", 10);
//AddAction(41, 0, "4. page", "Page", 
//          "Page- start from <i>{0}</i> with <i>{1}</i> rows", 
//          "Get queried rows in a range.", "Page");                     
          
AddAction(101, 0, "Remove queried rows", "Remove - queried rows",
          "Remove- remove queried rows", 
          "Remove queried rows.", "RemoveQueriedRows");  

AddStringParam("Key", "The name of the key.", '""');  
AddComboParamOption("string");
AddComboParamOption("number");
AddComboParamOption("any (eval)");
AddComboParam("Type", "Type.", 1);
AddAction(200, 0, "Define type", "Insert - CSV", 
         "Define key <i>{0}</i> to <i>{1}</i> type",
         "Define value type of a key.", "InsertCSV_DefineType"); 

AddStringParam("Name", 'Database reference. Sets "" to be a private database.', '""');
AddAction(211, 0, "Link to database", "Database", 
          "Link to database <i>{0}</i>", 
          "Link to database.", "LinkToDatabase");          
//////////////////////////////////////////////////////////////
// Expressions

AddExpression(1, ef_return_any | ef_variadic_parameters, "Get value at", "Table", "At", 
              "Get value from current database. Add index keys then add 1 data key. Add an optional default value at the last.");

AddExpression(2, ef_return_any | ef_variadic_parameters, "Current row content", "Queried rows - For each row", "CurRowContent", 
              "Get current row content in JSON string in a For Each loop. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");

AddNumberParam("Index", "Index of queried rows.", 0);
AddExpression(3, ef_return_any | ef_variadic_parameters, "Index to queried row content", "Queried rows - Index", "Index2QueriedRowContent", 
              "Get queried rows content by index in JSON format. Add 2nd parameter to get value at the specific key. Add 3rd parameter for default value if this key is not existed.");
                                           
AddExpression(4, ef_return_number, "Current queried rows count", "Queried rows", "QueriedRowsCount", 
              'Get current queried rows count.');

AddStringParam("Key", "The name of the key.", '""');
AddExpression(5, ef_return_number, "Sum in current queried rows of a key", "Queried rows", "QueriedSum", 
              'Get sum in current queried rows of a key.'); 
                               
AddStringParam("Key", "The name of the key.", '""');
AddExpression(6, ef_return_number, "Min in current queried rows of a key", "Queried rows", "QueriedMin", 
              'Get min in current queried rows of a key.');                 
              
AddStringParam("Key", "The name of the key.", '""');
AddExpression(7, ef_return_number, "Max in current queried rows of a key", "Queried rows", "QueriedMax", 
              'Get max in current queried rows of a key.');  
              
AddExpression(8, ef_return_string, "Queried rows to string", "Queried rows", "QueriedRowsAsJSON", 
              "Get JSON string of queried rows.");     
              
AddExpression(9, ef_return_string, "Key name of row ID", "Key name", "KeyRowID", 
              "Get key name of row ID.");
              
AddExpression(10, ef_return_string, "Last saved row ID", "Save", "LastSavedRowID", 
              "Get last saved row ID.");   

AddStringParam("Row ID", "Row ID.", '""');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Row ID to row content", "Row ID", "ID2RowContent", 
              "Get rows content by row ID in JSON format. Add 2nd parameter to get value at the specific key. Add 3rd parameter for default value if this key is not existed.");

AddNumberParam("Index", "Index of queried rows.", 0);
AddExpression(12, ef_return_string | ef_deprecated, "Get rowID by Index of queried rows", "Queried rows - Index", "QueriedRowsIndex2RowID", 
              'Get rowID by Index of queried rows. Return "" if the specific row had not existed.');
                                    
AddExpression(13, ef_return_number, "index of current row", "Queried rows - For each row", "CurRowIndex", 
              "Get index oif current row in a For Each loop.");
           
AddExpression(14, ef_return_string, "Current row ID", "Queried rows - For each row", "CurRowID", 
              "Get current rowID in a For Each loop.");
              
AddNumberParam("Index", "Index of queried rows.", 0);
AddExpression(15, ef_return_string, "Get rowID by Index of queried rows", "Queried rows - Index", "Index2QueriedRowID", 
              'Get rowID by Index of queried rows. Return "" if the specific row had not existed.');              
              

              
              
AddExpression(101, ef_return_string, "All rows to string", "All data", "AllRowsAsJSON", 
              "Get JSON string of all rows.");              
AddExpression(102, ef_return_number, "Count of all rows", "All data", "AllRowsCount", 
              "Get count of all rows.");  
              
AddExpression(211, ef_return_string, "Database name", "Database", "DatabaseName", 
              "Get current linked database name.");    
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Database name", "", 'Database reference. Sets "" to be a private database.'),
	new cr.Property(ept_text, "Index keys", "", 'Index keys, separated by ","'),
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
