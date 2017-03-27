function GetPluginSettings()
{
	return {
		"name":			"Save slot",
		"id":			"Rex_Firebase_SaveSlot",
		"version":		"0.1",        
		"description":	"Private save slots.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_saveslot.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On save", "Save", 
            "On save",
            "Triggered when save complete.", "OnSave");

AddCondition(2, cf_trigger, "On save error", "Save", 
            "On save error",
            "Triggered when save error.", "OnSaveError");
			
AddCondition(11, cf_trigger, "On get headers", "Load - header", 
            "On get all headers", 
            "Triggered when get all slot headers from server.", "OnGetAllHeaders");
			
AddCondition(12, cf_looping | cf_not_invertible, "For each header", "Load - header", 
             "For each header", 
             "Repeat the event for each slot header.", "ForEachHeader"); 
			 
AddCondition(13, cf_trigger, "On get body", "Load - body", 
            "On get body", 
            "Triggered when get slot body complete from server complete.", "OnGetBody");

AddCondition(14, cf_trigger, "On get unused body", "Load - body", 
            "On get unused body", 
            "Triggered when get unused body.", "OnGetUnusedBody");
            
AddCondition(15, 0, "All slots are empty", "Header", 
             "All slots are empty", 
             "All slots are unused. Call it after load headers from server.", "AllSlotAreEmpty");    

AddAnyTypeParam("Name", "The slot name.", '""');
AddCondition(16, 0, "Slot is occupied", "Header", 
             "Slot <i>{0}</i> is occupied", 
             "Slot is occupied. Call it after load headers from server.", "IsOccupied");      

AddAnyTypeParam("Name", "The slot name.", '""');
AddCondition(17, cf_looping | cf_not_invertible, "For each key", "Header - for each", 
             "For each key in header <i>{0}</i>", 
             "Repeat the event for each key in a header.", "ForEachKeyInHeader"); 

AddCondition(18, cf_looping | cf_not_invertible, "For each key", "Body - for each", 
             "For each key in body", 
             "Repeat the event for each key in body.", "ForEachKeyInBody");     

AddCondition(19, 0, "Invalid body", "Body", 
             "Body is invalid", 
             "Current loaded body is invalid.", "BodyIsInvalid");                 

AddCondition(21, cf_trigger, "On clean", "Clean", 
            "On clean", 
            "Triggered when clean slots complete on server complete.", "OnClean");

AddCondition(22, cf_trigger, "On clean error", "Clean", 
            "On clean error", 
            "Triggered when clean slots error on server error.", "OnCleanError");	

AddCondition(31, cf_trigger, "On get headers error", "Load - header", 
            "On get all headers error", 
            "Triggered when get all slot headers error.", "OnGetAllHeadersError");            

AddCondition(32, cf_trigger, "On get body error", "Load - body", 
            "On get body error", 
            "Triggered when get slot body error.", "OnGetBodyError");            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("User ID", "User ID from authentication.", '""');
AddAction(1, 0, "Set owner", "0. Setup", 
          "Set user ID of slot owner to <i>{0}</i>", 
          "Set user ID of slot owner.", "SetOwner");

AddAnyTypeParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(2, 0, "Set value", "Prepare", 
          "Prepare- Set key <i>{0}</i> to <i>{1}</i> in slot <i>{2}</i>", 
          "Sets value into slot.", "SetValue");
		  
AddAnyTypeParam("Name", "The slot name.", '""');
AddAction(3, 0, "Save", "Save", 
          "Save- Save slot with name <i>{0}</i>", 
          "Save slot into server.", "Save");	

AddAnyTypeParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(4, 0, "Set boolean value", "Prepare", 
          "Prepare- Set key <i>{0}</i> to <i>{1}</i> in slot <i>{2}</i>", 
          "Sets boolean value into slot.", "SetBooleanValue");   

AddAnyTypeParam("Key", "The name of the key.", '""');
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(5, 0, "Set to current server timestamp", "Prepare", 
          "Prepare- Set key <i>{0}</i> to current server timestamp in slot <i>{2}</i>", 
          "Sets current server timestamp into slot.", "SetCurrentServerTimestamp");        

AddAnyTypeParam("Key", "The name of the key.", '""');
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(6, 0, "Remove key", "Prepare", 
          "Prepare- Remove key <i>{0}</i> in slot <i>{2}</i>", 
          "Remove from slot.", "RemoveKey");          
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddStringParam("JSON", "The JSON to set", '""');
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(7, 0, "Set JSON", "Prepare", 
          "Prepare- Set key <i>{0}</i> to <i>{1}</i> in slot <i>{2}</i>", 
          "Sets JSON into slot.", "SetJSON");          

AddAction(11, 0, "Get all headers", "Load", 
          "Get all slot headers", 
          "Get all slot headers from server.", "GetAllHeaders");	

AddAnyTypeParam("Name", "The slot name.", '""');
AddAction(12, 0, "Get body", "Load", 
          "Get slot body with name <i>{0}</i>", 
          "Get slot body from server.", "GetSlotBody");	

AddAction(21, 0, "Clean all slots", "Clean", 
          "Clean all slots on server", 
          "Clean all slots on server.", "CleanSlot");	

AddAnyTypeParam("Name", "The slot name.", '""');
AddAction(22, 0, "Clean slot", "Clean", 
          "Clean slot with name <i>{0}</i>", 
          "Clean slot on server.", "CleanSlot");
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any, "Get current slot name", "For each header", "CurSlotName", 
              "Get current slot name in a For Each loop.");
			  
//AddAnyTypeParam("Key", "The name of the key, could be string or number.", '""');
AddExpression(2, ef_return_any | ef_variadic_parameters, "Get current header value", "For each header", "CurHeaderValue", 
              "Get current header value by key in a For Each loop. Add default value at 2nd parameter if read data is null.");
	
//AddAnyTypeParam("Key", "The name of the key, could be string or number.", '""');
AddExpression(3, ef_return_any | ef_variadic_parameters, "Get body value", "Body", "BodyValue", 
              "Get body value by key. Add key at 1st parameter, add default value at 2nd parameter if read data is null");
			  
AddExpression(4, ef_return_string, "Get all headers", "JSON", "HeadersToJSON", 
              "Get all headers in JSON string.");
			  
AddExpression(5, ef_return_string, "Get all body values", "JSON", "BodyToJSON", 
              "Get all body values in JSON string.");

//AddAnyTypeParam("Slot name", "The name of the slot.", '""');              
//AddAnyTypeParam("Key", "The name of the key.", '""');
AddExpression(6, ef_return_any | ef_variadic_parameters, "Get header value", "Headers", "HeaderValue", 
              "Get header value by slot name and key. Add default value at 3rd parameter if read data is null.");
              
AddExpression(7, ef_return_any, "Get current key", "For each key", "CurKey", 
              "Get current key in a For Each loop.");              
AddExpression(8, ef_return_any, "Get current value", "For each key", "CurValue", 
              "Get current value in a For Each loop.");       
              
AddExpression(9, ef_return_any, "Get last slot name", "Body", "LastSlotName", 
              "Get last loaded slot name.");     
               
AddExpression(21, ef_return_string, "Error code", "Error", "LastErrorCode", 
              "Error code.");        
AddExpression(22, ef_return_string, "Error message", "Error", "LastErrorMessage", 
              "Error message (error.serverResponse) .");     
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "SaveSlot", "Sub domain of this function."),      
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
