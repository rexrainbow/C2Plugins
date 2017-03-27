function GetPluginSettings()
{
	return {
		"name":			"Counter",
		"id":			"Rex_Backendless_Counter",
		"version":		"0.1",        
		"description":	"Atomic Counters to increase or decrease value.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_counter.html",
		"category":		"Rex - Web - Backendless",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Counter", "Counter name.", '""');
AddCondition(1, cf_trigger, "On increase", "Increase", 
            "On increase <i>{0}</i>",
            "Triggered when increase counter complete.", "OnIncrease");

AddStringParam("Counter", "Counter name.", '""');        
AddCondition(2, cf_trigger, "On increase error", "Increase", 
            "On increase <i>{0}</i> error",
            "Triggered when increase counter error.", "OnIncreaseError");            

AddCondition(3, cf_trigger, "On increase any", "Increase", 
            "On increase any",
            "Triggered when increase any counter complete.", "OnIncreaseAny");
       
AddCondition(4, cf_trigger, "On increase any error", "Increase", 
            "On increase any error",
            "Triggered when increase any counter error.", "OnIncreaseAnyError");

AddStringParam("Counter", "Counter name.", '""');
AddCondition(11, cf_trigger, "On reset", "Reset", 
            "On reset <i>{0}</i>",
            "Triggered when reset counter complete.", "OnReset");

AddStringParam("Counter", "Counter name.", '""');       
AddCondition(12, cf_trigger, "On reset error", "Reset", 
            "On reset <i>{0}</i> error",
            "Triggered when reset counter error.", "OnResetError");            

AddCondition(13, cf_trigger, "On reset any", "Reset", 
            "On reset any",
            "Triggered when reset any counter complete.", "OnResetAny");
       
AddCondition(14, cf_trigger, "On reset any error", "Reset", 
            "On reset any error",
            "Triggered when reset any counter error.", "OnResetAnyError");

AddStringParam("Counter", "Counter name.", '""');
AddCondition(21, cf_trigger, "On get current", "Get current", 
            "On get current <i>{0}</i>",
            "Triggered when get current counter complete.", "OnGetCurrent");

AddStringParam("Counter", "Counter name.", '""');           
AddCondition(22, cf_trigger, "On get current error", "Get current", 
            "On get current <i>{0}</i> error",
            "Triggered when get current counter error.", "OnGetCurrentError");            

AddCondition(23, cf_trigger, "On get current any", "Get current", 
            "On get current any",
            "Triggered when get current any counter complete.", "OnGetCurrentAny");
       
AddCondition(24, cf_trigger, "On get current any error", "Get current", 
            "On get current any error",
            "Triggered when get current any counter error.", "OnGetCurrentAnyError");

AddStringParam("Counter", "Counter name.", '""');
AddCondition(31, cf_trigger, "On compare then set", "Compare then set", 
            "On compare then set <i>{0}</i>",
            "Triggered when compare then set counter complete.", "OnCompareThenSet");

AddStringParam("Counter", "Counter name.", '""');        
AddCondition(32, cf_trigger, "On compare then set error", "Compare then set", 
            "On compare then set <i>{0}</i> error",
            "Triggered when compare then set counter error.", "OnCompareThenSetError");            

AddCondition(33, cf_trigger, "On compare then set any", "Compare then set", 
            "On compare then set any",
            "Triggered when compare then set any counter complete.", "OnCompareThenSetAny");
       
AddCondition(34, cf_trigger, "On compare then set any error", "Compare then set", 
            "On compare then set any error",
            "Triggered when compare then set any counter error.", "OnCompareThenSetAnyError");
     
AddCondition(35, 0, "Is value set", "Compare then set", 
            "Is value set",
            "Return true if value set when condition is matched.", "CompareThenSet_IsValueSet");      
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Counter", "Counter name.", '""');
AddNumberParam("Value", "Value to add.", 1);
AddAction(1, 0, "Increase", "Increase", 
          "Add <i>{1}</i> to counter <i>{0}</i>", 
          "Increase counter.", "Increase");
       
AddStringParam("Counter", "Counter name.", '""');    
AddAction(11, 0, "Reset", "Reset", 
          "Reset counter<i>{0}</i> to 0", 
          "Reset counter to 0.", "Reset"); 
          
AddStringParam("Counter", "Counter name.", '""');     
AddAction(21, 0, "Get current value", "Get current", 
          "Get curent value of counter <i>{0}</i>", 
          "Get curent value of counter.", "GetCurrent");     

AddStringParam("Counter", "Counter name.", '""');
AddNumberParam("Set to", "Value to set.", 1);
AddNumberParam("Condition", "Test if value is equal to.", 1);
AddAction(31, 0, "Compare then set", "Compare then set", 
          "Set counter <i>{0}</i> to <i>{1}</i> if previous value is <i>{2}</i>", 
          "Set value if previous value is equal to target value.", "CompareThenSet");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get counter name", "Result", "CounterName", 
              "Get counter name of last callback.");      
              
AddExpression(2, ef_return_number, "Get current value", "Result", "CurrentValue", 
              "Get counter value of last callback.");          
              
AddExpression(3, ef_return_number, "Get previous value", "Result", "PreviousValue", 
              "Get previous value of last callback.");              
              
AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
                                    
                                    
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
