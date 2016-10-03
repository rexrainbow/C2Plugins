function GetPluginSettings()
{
	return {
		"name":			"Date in a row",
		"id":			"Rex_Parse_dateInARow",
		"version":		"0.1",        
		"description":	"Get continuous date count.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_dateinarow.html",
		"category":		"Rex - Web - parse - date",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On paste complete", "Paste", 
            "On paste complete",
            "Triggered when paste complete.", "OnPasteComplete");

AddCondition(2, cf_trigger, "On paste error", "Paste", 
            "On paste error",
            "Triggered when paste error.", "OnPasteError");
                                       
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("Record name", "Record name.", '""');
AddNumberParam("Timestamp", "Paste timestamp.", 0); 
AddComboParamOption("Year");
AddComboParamOption("Month");
AddComboParamOption("Day");
AddComboParamOption("Hour");
AddComboParamOption("Minute");
AddComboParam("Scale", "Scale of date.", 2);  
AddAction(1, 0, "Paste timestamp", "Paste", 
          "Owner ID: <i>{0}</i> paste <i>{1}</i> to timestamp <i>{2}</i>, in <i>{3}</i> scale", 
          "Paste timestamp.", "Paste");
          
AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("Record name", "Record name.", '""');
AddComboParamOption("Year");
AddComboParamOption("Month");
AddComboParamOption("Day");
AddComboParamOption("Hour");
AddComboParamOption("Minute");
AddComboParam("Scale", "Scale of date.", 2);  
AddAction(2, 0, "Paste server time", "Paste", 
          "Owner ID: <i>{0}</i> paste <i>{1}</i> to current server timestamp, in <i>{2}</i> scale", 
          "Paste current server timestamp.", "PasteServerTimestamp");          
                 
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable");                                                             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Pasted continuous count", "Paste", "PastedContinuousCount", 
              "Get continuous count in a row of pasted record.");
              
AddExpression(2, ef_return_number, "Pasted last-pasted-timestamp", "Paste", "PastedLastTimestamp", 
              "Get last pasted timestamp of pasted record.");
              
AddExpression(3, ef_return_string, "Pasted ownerID", "Paste", "PastedOwnerID", 
              "Get ownerID of pasted record.");
              
AddExpression(4, ef_return_string, "Pasted record name", "Paste", "PastedRecordName", 
              "Get record name of pasted record.");
              
AddExpression(5, ef_return_number, "Pasted previous continuous count", "Paste", "PastedPreviousContinuousCount", 
              "Get previous continuous count in a row of pasted record.");            
          
              
AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Class name", "DateInARow", "Class name of this dateInARow system."), 	    
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
