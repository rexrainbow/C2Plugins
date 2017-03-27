function GetPluginSettings()
{
	return {
		"name":			"Date in a row",
		"id":			"Rex_dateInARow",
		"version":		"0.1",        
		"description":	"Get continuous date count.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_dateinarow.html",
		"category":		"Rex - Date & time",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Record name", "Record name.", '""');
AddNumberParam("Timestamp", "Paste timestamp.", 0); 
AddComboParamOption("Year");
AddComboParamOption("Month");
AddComboParamOption("Day");
AddComboParamOption("Hour");
AddComboParamOption("Minute");
AddComboParam("Scale", "Scale of date.", 2);  
AddAction(1, 0, "Paste timestamp", "Paste", 
          "Paste <i>{0}</i> to timestamp <i>{1}</i> in <i>{2}</i> scale", 
          "Paste timestamp.", "Paste");
          
AddStringParam("Record name", "Record name.", '""');
AddAction(2, 0, "Remove record", "Remove", 
          "Remove record <i>{0}</i>", 
          "Remove record.", "Remove");      

AddAction(3, 0, "Remove all", "Remove", 
          "Remove all records", 
          "Remove all records.", "RemoveAll");          
                               
AddStringParam("JSON", "A string of the JSON data to load.");
AddAction(11, 0, "Load", "JSON", "Load from JSON string <i>{0}</i>", "Load from an object previously encoded in JSON format.", "JSONLoad");
         
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Record name", "Record name.", '""');
AddExpression(1, ef_return_number, "Get continuous count", "Row", "ContinuousCount", 
              "Get continuous count in a row of this record.");
              
AddStringParam("Record name", "Record name.", '""');
AddExpression(2, ef_return_number, "Get last pasted timestamp", "Row", "LastTimestamp", 
              "Get last pasted timestamp of this record.");

AddStringParam("Record name", "Record name.", '""');
AddExpression(3, ef_return_number, "Get previous continuous count", "Row", "PreviousContinuousCount", 
              "Get previous continuous count in a row of this record.");
              
AddExpression(11, ef_return_string, "Get as JSON", "JSON", "AsJSON", "Return the contents of the dateInARow in JSON format.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [	    
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
