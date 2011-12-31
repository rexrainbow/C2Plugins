function GetBehaviorSettings()
{
	return {
		"name":			"shell",
		"id":			"Rex_Shell",
		"description":	"Shell behavior allowed inserted javascript",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"General",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", 
          "Enable the object's tick behavior.", "SetActivated");
AddAction(1, 0, "Clean all memory", "Memory", 
          "Clean {my} all memory", 
          "Clean all memory.", 
          "CleanMemory");
AddAnyTypeParam("Index", "Index of memory, can be number of string", 0);
AddAnyTypeParam("Value", "Value of memory", 0);
AddAction(2, 0, "Set a memory value", "Memory", 
          "Set {my} Mem[<i>{0}</i>] to <i>{1}</i>", 
          "Set the value stored in memory in fsm.", 
          "SetMemory");          
AddStringParam("Code", "JS function code", '""');
AddAction(3, 0, "Inject JS function objects", "JS Function", 
          "Inject JS <i>{0}</i> into {my}", "Inject JS function objects.", "InjectJSFunctionObjects");
AddObjectParam("Function", "Function object for controlling the game world");
AddAction(4, 0, "Connect to function object", "Advance: Setup", 
          "Connect to function object <i>{0}</i>", 
          "Connect to function object.", "ConnectFn");
AddObjectParam("CSV", "CSV object for accessing global variables");
AddAction(5, 0, "Connect to CSV object", "Advance: Setup", 
          "Connect to CSV object <i>{0}</i>", 
          "Connect to CSV object.", "ConnectCSV");     

          
          
//////////////////////////////////////////////////////////////
// Conditions
             
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam(0, "The index of memory to get, can be number of string.", 0);
AddExpression(0, ef_return_any | ef_variadic_parameters, 
              "Get memory", "Memory", "Mem", 
              "Get the value from memory by index.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
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
