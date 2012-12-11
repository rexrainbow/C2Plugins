function GetPluginSettings()
{
	return {
		"name":			"Instance Bank",
		"id":			"Rex_InstanceBank",
		"version":		"0.8",            
		"description":	"Save/Load instances.",
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
AddObjectParam("Object", "Object for saving");
AddCondition(1, cf_trigger, "On saving", "Save instance", 
             "On saving <i>{0}</i>", 'Saving handler. Triggered by "action:Save instances"', "OnSave");
AddObjectParam("Object", "Object for loading");
AddCondition(2, cf_trigger, "On loading", "Load instance", 
             "On loading <i>{0}</i>", 'Loading handler. Triggered by "action:Load all instances"', "OnLoad");
AddObjectParam("Object", "Object for picking");             
AddNumberParam("UID", "UID of object", 0);
AddCondition(3, 0, "Pick by saved UID", "Load instance", 
             "Pick <i>{0}</i> by saved UID to <i>{1}</i>", 
              "Pick instance by saved UID.", "PickBySavedUID");     
//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Clean bank", "Bank", 
          "Clean bank to empty", 
          "Clean bank to empty.", "CleanBank");  
AddObjectParam("Object", "Object for saving");
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddAction(1, 0, "Save instances", "Save instance", 
          "Save <i>{0}</i> from <i>{1}</i>", 
          "Save instances of sprite.", "SaveInstances");
AddAction(2, 0, "Load all instances", "Load instance", 
          "Load all saved instances", 
          "Load all saved instances.", "LoadInstances");
AddStringParam("JSON string", "JSON string.", '""');
AddAction(3, 0, "Load bank from JSON string", "Bank", "Load bank from JSON string <i>{0}</i>",
         "Load bank from JSON string.", "StringToBank");
AddAnyTypeParam("Index", "Index of info, can be number of string", "0");
AddAnyTypeParam("Value", "Value of info", 0);
AddAction(4, 0, "Save info", "Save", 
          "Save custom info[<i>{0}</i>] to <i>{1}</i>", 'Save custom info. Used under "Condition:On saving"', "SaveInfo"); 
AddObjectParam("Object", "Object for picking");          
AddNumberParam("UID", "UID of object", 0);
AddAction(5, 0, "Pick by saved UID", "Load instance", 
          "Pick <i>{0}</i> by saved UID to <i>{1}</i>", 
          "Pick instance by saved UID.", "PickBySavedUID");   
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Transfer bank to string", "Bank", "BankToString", "Transfer current bank to JSON string.");
AddAnyTypeParam("0", "The index of info to get, can be number of string.", "0");
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get info", "Load", "SavedInfo", 
             'Get saved custom info for instances loading. Used under "Condition:On loading"');


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
