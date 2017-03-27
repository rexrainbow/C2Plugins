function GetPluginSettings()
{
	return {
		"name":			"CSV to Array",
		"id":			"Rex_CSV2Array",
		"version":		"0.1",   		
		"description":	"Transfer csv string to array object",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_csv2array.html",
		"category":		"Rex - Data structure - CSV",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Data", "Data in CSV format", "");
AddCondition(1, cf_looping | cf_not_invertible, "For each cell", "For each cell", 
             "For each cell in <i>{0}</i>", 
             "Repeat the event for each cell in the csv table.", "ForEachCell");
             
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Data", "Data in CSV format", "");
AddObjectParam("Array", "Array object");
AddComboParamOption("Row to X, Col to Y");
AddComboParamOption("Row to Y, Col to X");
AddComboParam("Mapping", "Map row/col to X/Y", 0);
AddAction(1, af_deprecated, "Put csv data into array", "CSV to Array", 
          "Put csv data <i>{0}</i> into array <i>{1}</i>, map <i>{2}</i>", 
          "Put csv data into array.", "CSV2Array");
          
AddStringParam("Data", "Data in CSV format", "");
AddObjectParam("Array", "Array object");
AddComboParamOption("Row to X, Col to Y");
AddComboParamOption("Row to Y, Col to X");
AddComboParam("Mapping", "Map row/col to X/Y", 0);
AddNumberParam("Z", "Z index (0-based) of array.", 0);
AddAction(2, 0, "Put csv data into array", "CSV to Array", 
          "Put csv data <i>{0}</i> into array <i>{1}</i> at Z index to <i>{3}</i>, map <i>{2}</i>", 
          "Put csv data into array.", "CSV2Array");          
          
AddStringParam("Delimiter", "Set delimiter for splitting items.", '","');
AddAction(11, 0, "Set delimiter", "Delimiter", "Set delimiter to <i>{0}</i>",
         "Set delimiter for splitting items.", "SetDelimiter");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Current X", "For Each cell", "CurX", 
              "Get the current X index in a For Each loop.");
AddExpression(2, ef_return_number, "Current Y", "For Each cell", "CurY", 
              "Get the current Y index in a For Each loop.");
AddExpression(3, ef_return_any, "Current value", "For Each cell", "CurValue", 
              "Get the current cell value in a For Each loop.");
AddExpression(4, ef_return_number, "Width of array", "For Each cell", "Width", 
              "Get width of array in a For Each loop.");
AddExpression(5, ef_return_number, "Height of array", "For Each cell", "Height", 
              "Get height of array in a For Each loop.");
              
AddExpression(11, ef_return_string, "Get delimiter", "Delimiter", "Delimiter", "Get delimiter.");
              
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
}
