function GetBehaviorSettings()
{
	return {
		"name":			"state",
		"id":			"Rex_FSM",
		"description":	"Finite state machine",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Varaible",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Clean all memory", "Memory", 
          "Clean {my} all memory", 
          "Clean all memory.", 
          "CleanMemory");
AddAnyTypeParam("Index", "Index of memory, can be number of string", 0);
AddAnyTypeParam("Value", "Value of memory", 0);
AddAction(1, 0, "Set a memory value", "Memory", 
          "Set {my} memory[<i>{0}</i>] to <i>{1}</i>", 
          "Set the value stored in memory in fsm.", 
          "SetMemory");
AddAction(2, 0, "Request", "Request", 
          "Request {my}", 
          "Request a state transfer.", 
          "Request");
AddStringParam("CSV table", "The state transfer logic in CSV table.", '""');
AddComboParamOption("Javascript");
AddComboParamOption("Simple notation");
AddComboParam("Code format", "The code format of state transfer logic", 0);
AddAction(3, 0, "Load state transfer logic from csv table", "Logic", 
          "Load state transfer logic from csv table <i>{0}</i> in <i>{1}</i> format",
          "Load state transfer logic from csv table.", "CSV2Logic");

//////////////////////////////////////////////////////////////
// Conditions


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Current state", "State", "CurState", "Get current state.");
AddExpression(1, ef_return_string, "Previous state", "State", "PreState", "Get previous state.");
AddAnyTypeParam(0, "The index of memory to get, can be number of string.", 0);
AddExpression(2, ef_return_any | ef_variadic_parameters, 
              "Get memory", "Memory", "Mem", 
              "Get the value from memory by index.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "Initial state", "Off", "Set initial state."),
	new cr.Property(ept_text, "Default memory", "", 'Set initial value of memory, ex:"{"x":10, "y":20}".'),     
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
