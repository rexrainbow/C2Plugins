function GetBehaviorSettings()
{
	return {
		"name":			"shell",
		"id":			"Rex_Shell",
		"version":		"0.1",           
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
AddAction(4, 0, "Connect to function object", "Setup", 
          "Connect to function object <i>{0}</i>", 
          "Connect to function object.", "ConnectFn");
AddObjectParam("CSV", "CSV object for accessing global variables");
AddAction(5, 0, "Connect to CSV object", "Setup", 
          "Connect to CSV object <i>{0}</i>", 
          "Connect to CSV object.", "ConnectCSV");     
AddStringParam("Function name", "Function of shell", '""');
AddAction(6, 0, "Call shell's function", "JS Function", 
          "Call {my}'s function <i>{0}</i>", "Call shell's function.", "CallFunction");
          
          
//////////////////////////////////////////////////////////////
// Conditions
             
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam(0, "The index of memory to get, can be number of string.", 0);
AddExpression(0, ef_return_any | ef_variadic_parameters, 
              "Get memory", "Memory", "Mem", 
              "Get the value from memory by index.");
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(1, ef_return_number | ef_variadic_parameters, 
              "Get position x", "Instance expression", "X", 
              "Get instance's position x form uid.");              
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(2, ef_return_number | ef_variadic_parameters, 
              "Get position y", "Instance expression", "Y", 
              "Get instance's y form uid.");  
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(3, ef_return_number | ef_variadic_parameters, 
              "Get width", "Instance expression", "Width", 
              "Get instance's width form uid.");              
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(4, ef_return_number | ef_variadic_parameters, 
              "Get height", "Instance expression", "Height", 
              "Get instance's height form uid.");
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(5, ef_return_number | ef_variadic_parameters, 
              "Get angle", "Instance expression", "Angle", 
              "Get instance's angle form uid.");
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(6, ef_return_number | ef_variadic_parameters, 
              "Get opacity", "Instance expression", "Opacity", 
              "Get instance's opacity form uid.");              
AddNumberParam(0, "The UID of instance.", 0);
AddExpression(7, ef_return_number | ef_variadic_parameters, 
              "Get visible", "Instance expression", "Visible", 
              "Get instance's visible form uid.");
AddNumberParam(0, "The UID of instance.", 0);
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.", 0);
AddExpression(8, ef_return_number | ef_variadic_parameters, 
              "Get image point X", "Instance expression",	"ImagePointX", 
              "The X position of one of the object's image points.");
AddNumberParam(0, "The UID of instance.", 0);
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.", 0);
AddExpression(9, ef_return_number | ef_variadic_parameters, 
              "Get image point Y", "Instance expression",	"ImagePointY", 
              "The Y position of one of the object's image points.");              

                                          
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
	new cr.Property(ept_text, "Default memory", "", 'Set initial value of memory, ex:"{"x":10, "y":20}".'),
    new cr.Property(ept_text, "Create callback", "", 'function(shell){...}'),
    new cr.Property(ept_text, "Tick callback", "", 'function(shell){...}'),   
    new cr.Property(ept_text, "Destroy callback", "", 'function(shell){...}'),   
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
