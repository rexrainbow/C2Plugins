function GetBehaviorSettings()
{
	return {
		"name":			"Max-min",
		"id":			"Rex_maxmin",
		"version":		"0.1",
		"description":	"A variable which clamped between maximum and minimum bound.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_maxmin.html",
		"category":		"Rex - Variable",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On value changing", "Value", 
             "On {my} changed", 
			 "Triggered when value changing.", 
			 "OnValueChanging");				 
AddCmpParam("Comparison", "Choose the way to compare the current value.");
AddNumberParam("Value", "The value to compare the current value to.");
AddCondition(1, 0, "Compare value", "Value", 
             "{my} {0} {1}", 
             "Compare the current value.", 
             "CompareValue");
AddCondition(2, 0, "Is value changed", "Value", 
             "Is {my} changed", 
			 "Return true if value changed.", 
			 "IsValueChanged");
AddCmpParam("Comparison", "Choose the way to compare the current value.");
AddNumberParam("Value", "The value to compare the delta value to.");
AddCondition(3, 0, "Compare delta value", "Value", 
             "Delta {my} {0} {1}", 
             "Compare the delta value which is equal to current value - previous value.", 
             "CompareDeltaValue");
AddComboParamOption("Min");
AddComboParamOption("Max");
AddComboParam("Bound", "Maximum bound or minimum bound to compare.", 1);			 
AddCmpParam("Comparison", "Choose the way to compare the current value.");
AddNumberParam("Value", "The value to compare the bound to.");
AddCondition(4, 0, "Compare bound", "Bound", 
             "{my} <i>{0}</i> {1} {2}", 
             "Compare bound.", 
             "CompareBound");			 
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Value", "Value.", 100);
AddAction(0, 0, "Set value", "Value", 
          "Set {my} to <i>{0}</i>", 
          "Set value.", "SetValue"); 
AddNumberParam("Max", "Maximum bound.", 100);
AddAction(1, 0, "Set maximum bound", "Bound", 
          "Set {my} maximum bound to <i>{0}</i>", 
          "Set maximum bound.", "SetMax"); 
AddNumberParam("Min", "Minimum bound.", 0);
AddAction(2, 0, "Set minimum bound", "Bound", 
          "Set {my} minimum bound to <i>{0}</i>", 
          "Set minimum bound.", "SetMin"); 
AddNumberParam("Value", "Value to add to this variable.", 1);
AddAction(3, 0, "Add to", "Value", 
          "Add <i>{0}</i> to {my}", 
          "Add to the value.", "AddTo"); 
AddNumberParam("Value", "Value to subtract from this variable.", 1);
AddAction(4, 0, "Subtract from", "Value", 
          "Subtract <i>{0}</i> from {my}", 
          "Subtract from the value.", "SubtractFrom");
                        
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get current value", "Value", "Value", 
              "Get current value.");
AddExpression(2, ef_return_number, "Get maximum bound", "Bound", "Max", 
              "Get maximum bound.");              
AddExpression(3, ef_return_number, "Get minimum bound", "Bound", "Min", 
              "Get minimum bound.");  
AddExpression(4, ef_return_number, "Get percentage of current value", "Value", "Percentage", 
              "Get percentage of current value in bounds.");               
AddExpression(5, ef_return_number, "Get previous value", "Value", "PreValue", 
              "Get previous value.");
                                          
ACESDone();

var property_list = [
    new cr.Property(ept_float, "Initial", 100, "Initial value."),	
    new cr.Property(ept_float, "Max", 100, "Maximum bound."),		
    new cr.Property(ept_float, "Min", 0, "Minimum bound."),		
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
