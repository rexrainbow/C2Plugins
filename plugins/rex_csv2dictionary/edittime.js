function GetPluginSettings()
{
	return {
		"name":			"CSV to Dictionary",
		"id":			"Rex_CSV2Dictionary",
		"version":		"0.1",   		
		"description":	"Transfer csv string to dictionary object",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_csv2dictionary.html",
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
AddObjectParam("Dictionary", "Dictionary object");
AddAction(1, 0, "Put csv data into dictionary", "CSV to Dictionary", 
          "Put csv data <i>{0}</i> into dictionary <i>{1}</i>", 
          "Put csv data into dictionary.", "CSV2Dictionary");
          
AddStringParam("Delimiter", "Set delimiter for splitting items.", '","');
AddAction(11, 0, "Set delimiter", "Delimiter", "Set delimiter to <i>{0}</i>",
         "Set delimiter for splitting items.", "SetDelimiter");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Current key", "For Each cell", "CurKey", 
              "Get the current key in a For Each loop.");
AddExpression(2, ef_return_any, "Current value", "For Each cell", "CurValue", 
              "Get the current cell value in a For Each loop.");

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
