function GetPluginSettings()
{
	return {
		"name":			"CSV",
		"id":			"MyCSV",
		"description":	"Read a 2d table from cvs string.",
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
AddCondition(0, cf_looping | cf_not_invertible, "For each col", "For Each", "For each col", 
             "Repeat the event for each col in the table.", "ForEachCol");
AddStringParam("Col", "The col index.", '""');
AddCondition(1, cf_looping | cf_not_invertible, "For each row in col", "For Each", 
             "For each row in a col <i>{0}</i>", "Repeat the event for each row in a col.", "ForEachRowInCol");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("CSV string", "The csv string for loading.", '""');
AddAction(1, 0, "Load table", "Table", "Load table from csv string",
         "Load table from csv string.", "LoadCSV");
AddStringParam("Col", "The col index.", '""');
AddStringParam("Row", "The row index.", '""');
AddAnyTypeParam("Value", "The value to store.", "0");
AddAction(2, 0, "Set entry", "Table", "Set value at (<i>{0}</i>, <i>{1}</i>) to <i>{2}</i>", 
          "Set the value in the table.", "SetEntry");
AddAction(3, 0, "Clear", "Table", "Clear", "Clear all entries.", "Clear");
AddStringParam("Row", "The row index.", '""');
AddComboParamOption("Integer");
AddComboParamOption("Float");
AddComboParam("Type", "Conver type to numver.",0);
AddAction(4, 0, "Convert type", "Table", "Convert entries type to <i>{1}</i> on row <i>{0}</i>",
         "Convert entries type in a row.", "ConvertType");


//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Col", "The col index.", '""');
AddStringParam("Row", "The row index.", '""');
AddExpression(0, ef_return_any | ef_variadic_parameters, "Get value at", "Table", "At", "Get value from the table.");
AddExpression(1, ef_return_string, "Current Col", "For Each", "CurCol", "Get the current col index in a For Each loop.");
AddExpression(2, ef_return_string, "Current Row", "For Each", "CurRow", "Get the current row index in a For Each loop.");
AddExpression(3, ef_return_any, "Current Value", "For Each", "CurValue", "Get the current value in a For Each loop.");


ACESDone();

// Property grid properties for this plugin
var property_list = [	
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),     
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
