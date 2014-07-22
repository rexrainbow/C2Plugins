function GetPluginSettings()
{
	return {
		"name":			"CSV",
		"id":			"Rex_CSV",
		"version":		"1.0",          
		"description":	"Read 2d table from cvs string.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_csv.html",
		"category":		"Data & Storage",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_looping | cf_not_invertible, "For each col", "For each col", "For each col", 
             "Repeat the event for each column in the table.", "ForEachCol");
AddStringParam("Col", "The column index.", '""');
AddCondition(1, cf_looping | cf_not_invertible, "For each row in col", "For each col", 
             "For each row in column <i>{0}</i>", "Repeat the event for each row in a column.", "ForEachRowInCol");
AddCondition(2, cf_looping | cf_not_invertible, "For each page", "For each page", "For each page", 
             "Repeat the event for each page.", "ForEachPage");
AddCondition(3, cf_looping | cf_not_invertible, "For each row", "For each row", "For each row", 
             "Repeat the event for each row in the table.", "ForEachRow");
AddStringParam("Row", "The row index.", '""');
AddCondition(4, cf_looping | cf_not_invertible, "For each col in row", "For each row", 
             "For each col in a row <i>{0}</i>", "Repeat the event for each column in a row.", "ForEachColInRow");             
AddAnyTypeParam("Data", "Data to compare.", 0);
AddStringParam("Col", "The col index.", '""');
AddCondition(5, 0, "Data in col", "In", 
             "Data <i>{0}</i> in col <i>{1}</i>", "Return true if data in col.", "IsDataInCol");
AddAnyTypeParam("Data", "Data to compare.", 0);
AddStringParam("Row", "The row index.", '""');
AddCondition(6, 0, "Data in row", "In", 
             "Data <i>{0}</i> in row <i>{1}</i>", "Return true if data in row.", "IsDataInRow");
AddStringParam("Key", "The col index.", '""');
AddCondition(7, 0, "Key in col", "In", 
             "Key <i>{0}</i> in col", "Return true if key in col.", "IsKeyInCol");
AddStringParam("Key", "The row index.", '""');
AddCondition(8, 0, "Key in row", "In", 
             "Key <i>{0}</i> in row", "Return true if key in row.", "IsKeyInRow"); 
AddStringParam("Col", "The col index.", '""');             
AddStringParam("Row", "The row index.", '""');
AddCondition(9, 0, "Entry is valid", "In", 
             "(<i>{0}</i>, <i>{1}</i>) is valid", "Return true if the entry is valid.", "IsEntryValid");              
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("CSV string", "The csv string for loading.", '""');
AddAction(1, 0, "Load table", "0: Load", "Load table from csv string <i>{0}</i>",
         "Load table from csv string.", "LoadCSV");
AddStringParam("Col", "The column index.", '""');
AddStringParam("Row", "The row index.", '""');
AddAnyTypeParam("Value", "The value to store.", "0");
AddAction(2, 0, "Set entry", "Set", "Set value at (<i>{0}</i>, <i>{1}</i>) to <i>{2}</i>", 
          "Set the value in the table at current page.", "SetEntry");
AddAction(3, 0, "Clear", "Set", "Clear", "Clear all entries.", "Clear");
AddStringParam("Row", "The row index.", '""');
AddComboParamOption("Integer");
AddComboParamOption("Float");
AddComboParam("Type", "Conver type to numver.",0);
AddAction(4, 0, "Convert type", "Convert", "Convert entries type to <i>{1}</i> on row <i>{0}</i>",
         "Convert entries type in a row.", "ConvertType");
AddStringParam("Page", "The index of page.", '""');
AddAction(5, 0, "Turn page", "Page", "Turn the page to <i>{0}</i>",
         "Turn the page.", "TurnPage");     
AddStringParam("JSON string", "JSON string.", '""');
AddAction(6, 0, "Load one table", "0: Load", "Load table from JSON string <i>{0}</i>",
         "Load table from JSON string.", "StringToPage");  
AddStringParam("Col index", "Column index.", '""');
AddAnyTypeParam("Value", "The initial value.", '""');
AddAction(7, 0, "Append a column", "Resize", "Append column <i>{0}</i> with initial value to <i>{1}</i>",
         "Append a column.", "AppendCol");
AddStringParam("Row index", "Row index.", '""');
AddAnyTypeParam("Value", "The initial value.", '""');
AddAction(8, 0, "Append a row", "Resize", "Append row <i>{0}</i> with initial value to <i>{1}</i>",
         "Append a row.", "AppendRow");  
AddStringParam("Col index", "Column index.", '""');
AddAction(9, 0, "Remove a column", "Resize", "Remove column <i>{0}</i>",
         "Remove a column.", "RemoveCol");
AddStringParam("Row index", "Row index.", '""');
AddAction(10, 0, "Remove a row", "Resize", "Remove row <i>{0}</i>",
         "Remove a row.", "RemoveRow");           
AddStringParam("Delimiter", "Set delimiter for splitting items.", ",");
AddAction(11, 0, "Set delimiter", "Delimiter", "Set delimiter to <i>{0}</i>",
         "Set delimiter for splitting items.", "SetDelimiter");
AddStringParam("JSON string", "JSON string.", '""');
AddAction(12, 0, "Load all tables", "0: Load", "Load all tables from JSON string <i>{0}</i>",
         "Load all tables from JSON string.", "StringToAllTables"); 
AddStringParam("Col index", "Col index.", '""');
AddComboParamOption("Increasing");
AddComboParamOption("Decreasing");
AddComboParam("Order", "Sorting order of item.", 0); 
AddAction(13, 0, "Sort items in col", "Sort", "Sort items in col <i>{0}</i> , by <i>{1}</i> order",
         "Sort items in col.", "SortCol");
AddStringParam("Row index", "Row index.", '""');
AddComboParamOption("Increasing");
AddComboParamOption("Decreasing");
AddComboParam("Order", "Sorting order of item.", 0); 
AddAction(14, 0, "Sort items in row", "Sort", "Sort items in row <i>{0}</i> , by <i>{1}</i> order",
         "Sort items in row.", "SortRow");  
AddStringParam("Col", "The column index.", '""');
AddStringParam("Row", "The row index.", '""');
AddStringParam("Page", "The index of page.", '""');
AddAnyTypeParam("Value", "The value to store.", "0");
AddAction(15, 0, "Set entry at page", "Set", "Set value at (<i>{0}</i>, <i>{1}</i>, <i>{2}</i>) to <i>{3}</i>", 
          "Set the value in the table at a specific page.", "SetEntryAtPage");
          
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Col", "The column index.", '""');
AddStringParam("Row", "The row index.", '""');
AddExpression(0, ef_return_any | ef_variadic_parameters, "Get value at", "Table: At", "At", 
              "Get value from current table. Add page index at 3rd parameter to turn the page. Add default value at 4th parameter for invalid value.");
AddExpression(1, ef_return_string, "Current Col", "For Each", "CurCol", "Get the current column index in a For Each loop.");
AddExpression(2, ef_return_string, "Current Row", "For Each", "CurRow", "Get the current row index in a For Each loop.");
AddExpression(3, ef_return_any, "Current Value", "For Each", "CurValue", "Get the current value in a For Each loop.");
AddExpression(4, ef_return_string, "At Col", "Table: At", "AtCol", "Get the column index in the last At expression.");
AddExpression(5, ef_return_string, "At Row", "Table: At", "AtRow", "Get the row index in the last At expression.");
AddExpression(6, ef_return_string, "At Page", "Page", "AtPage", "Get the page index in the last At expression.");
AddExpression(7, ef_return_string, "Current Page", "For Each", "CurPage", "Get the current page index in a For Each loop.");
AddExpression(8, ef_return_string, "Transfer page to string", "JSON", "TableToString", "Transfer current table to JSON string.");
AddExpression(9, ef_return_number | ef_variadic_parameters, "Get col count", "Table: Count", "ColCnt", "Get column count.");
AddExpression(10, ef_return_number | ef_variadic_parameters, "Get row count", "Table: Count", "RowCnt", "Get row count.");
AddExpression(11, ef_return_string, "Get delimiter", "Delimiter", "Delimiter", "Get delimiter.");
AddExpression(12, ef_return_string, "Transfer all tables to string", "JSON", "AllTalbesToString", "Transfer all tables to a JSON string.");
AddExpression(13, ef_return_string, "Transfer page to csv string", "CSV", "TableToCSV", "Transfer current table to csv string.");

ACESDone();

// Property grid properties for this plugin
var property_list = [	
    new cr.Property(ept_text, "Delimiter", ",", "Set delimiter for splitting items."), 
    new cr.Property(ept_combo, "Eval mode", "No", 'Enable "Eval mode" for parsing value.', "No|Yes"),    
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
    if (this.properties["Delimiter"] == "")
        this.properties["Delimiter"] = ",";
}
