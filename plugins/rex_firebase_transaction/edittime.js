function GetPluginSettings()
{
	return {
		"name":			"Transaction",
		"id":			"Rex_Firebase_Transaction",
		"version":		"0.1",        
		"description":	"Read-modify-write the value.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_transaction.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On transaction", "Write", 
            "On transaction", 
            'Triggered by calling "action: Transaction", to get return value.', "OnTransaction");     
            
AddCondition(2, 0, "ValueIn is null", "Read", 
             "ValueIn is null", 
             "Return true if ValueIn is null.", "ValueInIsNull");  

AddCondition(11, 0, "Is aborted", "Result", 
             "Is aborted", 
             "Return true if the transaction is aborted.", "IsAborted");    
             
AddCondition(12, cf_trigger, "On complete", "Result", 
            "On complete", 
            "Triggered while transaction success.", "OnComplete"); 

AddCondition(13, cf_trigger, "On error", "Result", 
            "On error ", 
            "Triggered while transaction  error.", "OnError");      

AddCondition(14, 0, "ValueOut is null", "Result", 
             "ValueOut is null", 
             "Return true if ValueOut is null.", "ValueOutIsNull");              
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAction(1, 0, "Transaction", "Read", 
          "Transaction at <i>{0}</i>",
          "Transaction", "Transaction");
          
AddAnyTypeParam("Value", "The value to set", 0);
AddAction(11, 0, "Return value", "Write", 
          "Set return to <i>{0}</i>", 
          "Returns transaction value.", "ReturnValue");
           
AddStringParam("JSON value", "JSON value to set", '"{}"');
AddAction(12, 0, "Return JSON", "Write", 
          "Set return to JSON <i>{0}</i>", 
          "Returns transaction JSON.", "ReturnJSON"); 

AddAnyTypeParam("Value", "The value to set", 0);
AddAction(13, 0, "Return null", "Write", 
          "Set return to null", 
          "Returns transaction value to null. i.e. remove data.", "ReturnNull");    

AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(14, 0, "Return boolean", "Write", 
          "Set return to <i>{0}</i>", 
          "Returns transaction value to true or false.", "ReturnBoolean");    

AddAnyTypeParam("Key", "The name of the key.", '""');   
AddAnyTypeParam("Value", "The value to set, could be number or string.", 0);
AddAction(21, 0, "Return value", "Write - JSON", 
          "Set return {0}: {1}",
          "Set value in returned JSON.", "ReturnKeyValue");    

AddAnyTypeParam("Key", "The name of the key.", '""');   
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.",1);
AddAction(22, 0, "Return boolean", "Write - JSON", 
          "Set return to {0}: {1}",
          "Set boolean in returned JSON.", "ReturnKeyBoolean");            
          
AddAction(31, 0, "Abort", "Write", 
          "Abort", 
          "Abort transaction.", "Abort");           
//////////////////////////////////////////////////////////////
// Expressions

AddExpression(1, ef_return_any | ef_variadic_parameters, "Read value", "Read", "ValueIn", 
              'Read value, using under "condition:On transaction". Add 1st parameter for specific key, 2nd parameter for default value if this key is not existed.');
AddExpression(2, ef_return_any | ef_variadic_parameters, "Result value", "Result", "ValueOut", 
              'Transaction wrote result, using under "condition:On completed". Add 1st parameter for specific key, 2nd parameter for default value if this key is not existed.');  
              
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
