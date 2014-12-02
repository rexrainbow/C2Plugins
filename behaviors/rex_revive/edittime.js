function GetBehaviorSettings()
{
	return {
		"name":			"Revive",
		"id":			"Rex_Revive",
		"description":	"Revive sprite after destroyed.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Timer",
		"flags":		bf_onlyone
	};
};

////////////////////////////////////////
// Conditions	
AddCondition(0,	cf_trigger, "On destroy", "", "On {my} destroy", "Triggered when sprite destroyed.", "OnDestroy");  
AddCondition(1,	cf_trigger, "On revive", "", "On {my} revive", "Triggered when sprite revived.", "OnRevive");  

////////////////////////////////////////
// Actions
AddObjectParam("Timeline", "Timeline object for getting timer");
AddAction(0, 0, "Setup revive timer", "Setup", 
          "Get revive timer {my} from <i>{0}</i>", 
          "Setup revive timer.", "Setup");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(1, 0, "Set activated", "Setup", "Set {my} activated to <i>{0}</i>", "Enable the object's revive behavior.", "SetActivated");
AddNumberParam("Revive time", "Revive sprite after destroyed, in second.");
AddAction(2, 0, "Set revive time", "", "Set {my} revive time to <i>{0}</i>", "Set the revive time.", "SetReviveTime");
AddAnyTypeParam("Index", "Index of memory, can be number of string", 0);
AddAnyTypeParam("Value", "Value of memory", 0);
AddAction(3, 0, "Set a memory value", "Memory", 
          "Set {my} Mem[<i>{0}</i>] to <i>{1}</i>", 
          "Set the value stored in memory.", 
          "SetMemory");
          
////////////////////////////////////////
// Expressions
AddAnyTypeParam("Index", "Index of memory, can be number of string", 0);
AddExpression(0, ef_return_any | ef_variadic_parameters, 
              "Get memory", "Memory", "Mem", 
              "Get the value from memory by index.");

////////////////////////////////////////
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),    
    new cr.Property(ept_float, "Revive time", 1, "Revive sprite after destroyed, in second."),
    new cr.Property(ept_combo, "Revive at", "Initial state", "Revive sprite at Initial state or last state.", "Initial state|Last state"),
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
    if (this.properties["Revive time"] < 0)
		this.properties["Revive time"] = Math.abs(this.properties["Revive time"]);		
}
