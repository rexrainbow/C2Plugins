function GetBehaviorSettings()
{
	return {
		"name":			"Buff",
		"id":			"Rex_buff",
		"version":		"0.1",
		"description":	"A variable which supports buffs. Get sum from base value and buffs.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_buff.html",
		"category":		"Rex - Variable",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On sum changing", "Value", 
             "On {my} changed", 
			 "Triggered when sum changing.", 
			 "OnSumChanging");
AddCmpParam("Comparison", "Choose the way to compare sum.");
AddNumberParam("Value", "The value to compare the sum to.");
AddCondition(1, 0, "Compare sum", "Value", 
             "{my} {0} {1}", 
             "Compare sum.", 
             "CompareSum");	

AddCondition(3, cf_looping | cf_not_invertible, "For each buff", "Queue", 
             "For each buff", 
             "Repeat the event for each buff in queue.", "ForEachBuff");              
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Base", "Base value.", 10);
AddAction(0, 0, "Set value", "Base", 
          "Set {my} base value to <i>{0}</i>", 
          "Set base value.", "SetBase"); 
AddNumberParam("Max", "Maximum bound.", 100);
AddAction(1, 0, "Set maximum bound", "Bound", 
          "Set {my} maximum bound to <i>{0}</i>", 
          "Set maximum bound.", "SetMax"); 
AddNumberParam("Min", "Minimum bound.", 0);
AddAction(2, 0, "Set minimum bound", "Bound", 
          "Set {my} minimum bound to <i>{0}</i>", 
          "Set minimum bound.", "SetMin"); 		  
AddNumberParam("Value", "Value to add to this variable.", 1);
AddAction(3, 0, "Add to", "Base", 
          "Add <i>{0}</i> to {my} base value", 
          "Add to the base value.", "AddToBase"); 
AddNumberParam("Value", "Value to subtract from this variable.", 1);
AddAction(4, 0, "Subtract from", "Base", 
          "Subtract <i>{0}</i> from {my} base value", 
          "Subtract from the base value.", "SubtractFromBase");
AddStringParam("Name", "Buff name", "");  
AddNumberParam("Priority", "Priority of buff. -1 is not in accumulation queue", -1);
AddAnyTypeParam("Value", 'Buff value. Number (1), or string ("10%") for percentage.', 1);
AddComboParamOption("Without clamped");
AddComboParamOption("Clamped in boundaries");
AddComboParam("Clamp", "Clamp in boundaries or not.", 0);
AddAction(5, 0, "Add", "Buff", 
          "{my} add buff <i>{0}</i> with priority to <i>{1}</i>, value to <i>{2}</i>, <i>{3}</i>", 
          "Add buff.", "AddBuff"); 	
AddStringParam("Name", "Buff name", "");
AddAction(6, 0, "Remove", "Buff", 
          "{my} remove buff <i>{0}</i>", 
          "Remove buff.", "RemoveBuff"); 			  
AddAction(7, 0, "Remove all", "Buff", 
          "{my} remove all buffs", 
          "Remove all buffs.", "RemoveAllBuffs");                        
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get sum", "Result", "Sum", 
              "Get sum of base value and buffs.");
AddExpression(2, ef_return_number, "Get base value", "Base", "Base", 
              "Get base value.");			  
AddExpression(3, ef_return_number, "Get maximum bound", "Bound", "Max", 
              "Get maximum bound.");              
AddExpression(4, ef_return_number, "Get minimum bound", "Bound", "Min", 
              "Get minimum bound.");
// AddAnyTypeParam("Name", "Buff name", "");  			  
AddExpression(5, ef_return_number | ef_variadic_parameters, "Get buff value", "Buff", "Buff", 
              "Get total buff value, or add 2nd parameter to get specific buff value by name (string) or queue index (number).");
AddExpression(6, ef_return_number, "Get next priority", "Buff", "NextPriority", 
              "Get next lower priority.");
AddExpression(7, ef_return_number, "Get total buff count", "Queue", "BuffCount", 
              "Get total buff count in queue.");                        
			
AddExpression(11, ef_return_string, "Get current index", "Queue - for each - index", "CurIndex", 
              "Get current index in a for each loop.");            
AddExpression(12, ef_return_string, "Get current buff name", "Queue - for each", "CurBuffName", 
              "Get current buff name in a for each loop.");
AddExpression(13, ef_return_number, "Get current buff value", "Queue - for each", "CurBuffValue", 
              "Get current buff value in a for each loop.");
              
              
AddNumberParam("Index", "Queue index", 0);                
AddExpression(21, ef_return_string, "Get buff name by queue index", "Queue - index", "Index2BuffName", 
              "Get buff name by queue index.");                
AddNumberParam("Index", "Queue index", 0);                   
AddExpression(22, ef_return_string, "Get buff value by queue index", "Queue - index", "Index2BuffValue", 
              "Get buff value by queue index."); 
              
ACESDone();

var property_list = [
    new cr.Property(ept_float, "Base", 10, "Initial base value."),	
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
