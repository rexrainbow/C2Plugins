function GetPluginSettings()
{
	return {
		"name":			"Save slot",
		"id":			"Rex_parse_saveslot",
		"version":		"0.1",        
		"description":	"Save slot on parse.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_saveslot.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On save", "Save", 
            "On save complete",
            "Triggered when save complete.", "OnSaveComplete");

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
            "On get body complete", 
            "Triggered when get slot body complete from server complete.", "OnGetBodyComplete");

AddCondition(14, cf_trigger, "On get body error", "Load - body", 
            "On get body error", 
            "Triggered when get slot body error from server error.", "OnGetBodyError");
            
AddCondition(15, 0, "Empty", "Load - slot", 
             "Is empty", 
             "All slots are unused. Call it after load headers from server.", "IsEmpty");    

AddAnyTypeParam("Name", "The slot name.", '""');
AddCondition(16, 0, "Is occupied", "Load - slot", 
             "Slot <i>{0}</i> is occupied", 
             "Slot is occupied. Call it after load headers from server.", "IsOccupied");   
             
AddCondition(17, cf_trigger, "On get headers error", "Load - header", 
            "On get all headers error", 
            "Triggered when get all slot headers error.", "OnGetAllHeadersError");
            
AddAnyTypeParam("Name", "The slot name.", '""');
AddCondition(18, cf_looping | cf_not_invertible, "For each key", "Load - header", 
             "For each key in header <i>{0}</i>", 
             "Repeat the event for each key in a header.", "ForEachKeyInHeader"); 

AddCondition(19, cf_looping | cf_not_invertible, "For each key", "Load - body", 
             "For each key in body", 
             "Repeat the event for each key in body.", "ForEachKeyInBody");                  
            
AddCondition(21, cf_trigger, "On clean", "Clean", 
            "On clean complete", 
            "Triggered when clean slots complete on server complete.", "OnCleanComplete");

AddCondition(22, cf_trigger, "On clean error", "Clean", 
            "On clean error", 
            "Triggered when clean slots error on server error.", "OnCleanError");	
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("User ID", "User ID from authentication.", '""');
AddAction(1, 0, "Set owner", "0. Setup", 
          "Set user ID of slot owner to <i>{0}</i>", 
          "Set user ID of slot owner.", "SetOwner");

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(2, 0, "Set value", "Save", 
          "Set key <i>{0}</i> to value <i>{1}</i> in slot <i>{2}</i>", 
          "Sets value into slot.", "SetValue");
		  
AddAnyTypeParam("Name", "The slot name.", '""');
AddAction(3, 0, "Save", "Save", 
          "Save slot with name <i>{0}</i> into server", 
          "Save slot into server.", "Save");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddComboParamOption("Header");
AddComboParamOption("Body");
AddComboParam("Slot", "Header or body.", 0);
AddAction(4, 0, "Set boolean value", "Save", 
          "Set key <i>{0}</i> to <i>{1}</i> in slot <i>{2}</i>", 
          "Sets boolean value into slot.", "SetBooleanValue");              	 

AddAction(11, 0, "Get all headers", "Load", 
          "Get all slot headers from server", 
          "Get all slot headers from server.", "GetAllHeaders");	

AddAnyTypeParam("Name", "The slot name.", '""');
AddAction(12, 0, "Get body", "Load", 
          "Get slot body with name <i>{0}</i> from server", 
          "Get slot body from server.", "GetSlotBody");	

AddAction(21, 0, "Clean all slots", "Clean", 
          "Clean all slots on server", 
          "Clean all slots on server.", "CleanAll");	

AddAnyTypeParam("Name", "The slot name.", '""');
AddAction(22, 0, "Clean slot", "Clean", 
          "Clean slot with name <i>{0}</i> on server", 
          "Clean slot on server.", "CleanSlot");      
          
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable");               
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any, "Get current slot name", "For each header", "CurSlotName", 
              "Get current slot name in a For Each loop.");
			  
AddStringParam("Key", "The name of the key.", '""');
AddExpression(2, ef_return_any | ef_variadic_parameters, "Get current header value", "For each header", "CurHeaderValue", 
              "Get current header value by key in a For Each loop. Add default value at 2nd parameter if read data is null.");
	
AddStringParam("Key", "The name of the key, could be string or number.", '""');
AddExpression(3, ef_return_any, "Get body value", "Body", "BodyValue", 
              "Get body value by key. Add default value at 2nd parameter if read data is null");
			  
AddExpression(4, ef_return_string, "Get all headers", "JSON", "HeadersToJSON", 
              "Get all headers in JSON string.");
			  
AddExpression(5, ef_return_string, "Get all body values", "JSON", "BodyToJSON", 
              "Get all body values in JSON string.");

AddStringParam("Slot name", "The name of the slot.", '""');              
AddStringParam("Key", "The name of the key.", '""');
AddExpression(6, ef_return_any | ef_variadic_parameters, "Get header value", "Headers", "HeaderValue", 
              "Get header value by slot name and key. Add default value at 3rd parameter if read data is null.");
              
AddExpression(7, ef_return_any, "Get current key", "For each key", "CurKey", 
              "Get current key in a For Each loop.");              
AddExpression(8, ef_return_any, "Get current value", "For each key", "CurValue", 
              "Get current value in a For Each loop.");                 

AddExpression(31, ef_return_string, "Key of Last saved time", "Key", "KeyLastSaveTime", 
              'Key of Last saved time ("updatedAt")'); 


AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
          
                        
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Class name of header", "Header", "Class name for storing header structure."), 
    new cr.Property(ept_text, "Class name of body", "Body", "Class name for storing body structure."),
	new cr.Property(ept_combo, "Write permission", "All users", "All user or only owner could write the save slot.", "All users|Owner"),  
	new cr.Property(ept_combo, "Read permission", "All users", "All user or only owner could read the save slot.", "All users|Owner"),      
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
