function GetPluginSettings()
{
	return {
		"name":			"String",
		"id":			"Rex_Parse_string",
		"version":		"0.1",        
		"description":	"Save string with any kind of size. This plugin will divide string into many rows for saving.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_string.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On save complete", "Save", 
            "On save complete",
            "Triggered when save complete.", "OnSaveComplete");

AddCondition(2, cf_trigger, "On save error", "Save", 
            "On save error",
            "Triggered when save error.", "OnSaveError");
            
AddCondition(11, cf_trigger, "On load complete", "Load", 
            "On load complete",
            "Triggered when load complete.", "OnLoadComplete");

AddCondition(12, cf_trigger, "On load error", "Load", 
            "On load error",
            "Triggered when load error.", "OnLoadError");            

AddCondition(21, cf_trigger, "On remove complete", "Remove", 
            "On remove complete",
            "Triggered when remove complete.", "OnRemoveComplete");

AddCondition(22, cf_trigger, "On remove error", "Remove", 
            "On remove error",
            "Triggered when remove error.", "OnRemoveError");   
            
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable");                         
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("Key", "Key name.", '""');
AddStringParam("Value", "String value.", '""');
AddAction(1, 0, "Save", "Save", 
          "Owner ID: <i>{0}</i> save <i>{1}</i> to <i>{2}</i>", 
          "Save value.", "Save");
          
AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("Key", "Key name.", '""');
AddAction(11, 0, "Load", "Load", 
          "Owner ID: <i>{0}</i> load <i>{1}</i>", 
          "Load value.", "Load");         

AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("Key", "Key name.", '""');
AddAction(21, 0, "Remove", "Remove", 
          "Owner ID: <i>{0}</i> remove <i>{1}</i>", 
          "Remove value.", "Remove");    

AddStringParam("OwnerID", "Object ID of owner.", '""');
AddAction(22, 0, "Remove all keys", "Remove", 
          "Owner ID: <i>{0}</i> remove all keys", 
          "Remove all keys.", "Remove");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Last saved ownerID", "Save", "LastSavedOwnerID", 
              "Get last saved ownerID.");
              
AddExpression(2, ef_return_string, "Last saved key", "Save", "LastSavedKey", 
              "Get last saved key.");
              
AddExpression(3, ef_return_string, "Last saved value", "Save", "LastSavedValue", 
              "Get last saved value.");             

AddExpression(11, ef_return_string, "Last loaded ownerID", "Load", "LastLoadedOwnerID", 
              "Get last loaded ownerID.");
              
AddExpression(12, ef_return_string, "Last loaded key", "Load", "LastLoadedKey", 
              "Get last loaded key.");
              
AddExpression(13, ef_return_string, "Last loaded value", "Load", "LastLoadedValue", 
              "Get last loaded value.");  

AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
          
          
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Class name", "Files", "Class name of this function."), 	    
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
