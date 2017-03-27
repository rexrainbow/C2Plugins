function GetPluginSettings()
{
	return {
		"name":			"Counter",
		"id":			"Rex_Firebase_Counter",
		"version":		"0.1",        
		"description":	"Counter to increase or decrease value.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_counter.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On update", "Update", 
            "On update",
            "Triggered when counter updated.", "OnUpdate");
            
AddCondition(2, cf_trigger, "On my writing", "Add", 
            "On my writing",
            "Triggered when my writing successfully.", "OnMyWriting"); 
            
AddCmpParam("Comparison", "Choose the way to compare my last wrote value.");
AddNumberParam("Value", "The value to compare my last wrote value to.");
AddCondition(3, 0, "Compare my last wrote value", "Add", 
             "My last wrote value {0} {1}", 
             "Compare my last wrote value.", 
             "CompareLastWroteValue");
             
AddCmpParam("Comparison", "Choose the way to compare last counter value.");
AddNumberParam("Value", "The value to compare last counter value to.");
AddCondition(4, 0, "Compare last counter value", "Add", 
             "Last counter value {0} {1}", 
             "Compare last counter value.", 
             "CompareLastValue");             
             
AddCondition(5, cf_trigger, "On my writing abort", "Add", 
            "On my writing abort",
            "Triggered when my writing abort.", "OnMyWritingAbort");  
            
AddCondition(6, cf_trigger, "On my writing error", "Add", 
            "On my writing error",
            "Triggered when my writing error.", "OnMyWritingError");              

AddStringParam("Function", "Function for increasing counter.", '"_"');
AddCondition(21, cf_trigger, "On custom add", "Custom add", 
            "On custom add function: <i>{0}</i>",
            "Custom add function.", "OnAddFn");              
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddAction(1, 0, "Start", "Update", 
          "Start update", 
          "Start update.", "StartUpdate");
          
AddAction(2, 0, "Stop", "Update", 
          "Stop update", 
          "Stop update.", "StopUpdate");  
          
AddNumberParam("Init", "Initial value.", 0);
AddAnyTypeParam("Upper bound", 'Upper bound value. "" is none.', '""');
AddAction(3, 0, "Set boundaries", "Configure", 
          "Set initial value to <i>{0}</i>, upper bound to <i>{1}</i>", 
          'Set initial value and upper bound. "" is none.', "SetInit");                

AddAnyTypeParam("Value", 'Value to add. Positive or negative number, or "+10%" string based on current value.', 1);
AddAction(11, 0, "Try add to", "Add", 
          "Try add <i>{0}</i>", 
          "Try add to.", "Add");  

AddNumberParam("Value", "Value to set.", 0);
AddAction(12, 0, "Force set to", "Set", 
          "Force set value to <i>{0}</i>", 
          "Force set value, it will cancel any pending adding action.", "ForceSet"); 

AddStringParam("Function", "Function for increasing counter.", '"_"');
AddAction(21, 0, "Try add by function", "Custom add", 
          "Try add by function: <i>{0}</i>", 
          "Try add by function.", "CustomAddByFn");     
AddNumberParam("Value", 'Value to add. Positive or negative number.', 1);
AddAction(22, 0, "Add to", "Custom add", 
          "Custom add: add <i>{0}</i>", 
          'Try add to, used under "Condition:On custom add".', "CustomAddAdd");
AddAction(23, 0, "Abort", "Custom add", 
          "Custom add:: abort", 
          'Abort current action, used under "Condition:On custom add".', "CustomAddAbort");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get last value", "Counter", "LastValue", 
              "Get last value. Return Init value if last value is null.");              
AddExpression(2, ef_return_number, "Get my last wrote value", "Add", "LastWroteValue", 
              'Get my last wrote value. Valid under "condition:On my writing".');
AddExpression(3, ef_return_number, "Get my last added value", "Add", "LastAddedValue", 
              'Get my last added value. Valid under "condition:On my writing".');              
              
AddExpression(21, ef_return_number, "Get current value", "Custom add", "CustomAddIn", 
              'Get current value, used under "Condition:On custom add".');
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Counter", "Sub domain for this function."),
    new cr.Property(ept_float, "Initial", 0, "Initial value if counter value is null."),
    new cr.Property(ept_text, "Upper bound", "", 'Upper bound of counter, "" is none. Counter value will be clamped at upper bound.'),         
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
