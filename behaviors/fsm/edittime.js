function GetBehaviorSettings()
{
	return {
		"name":			"state",
		"id":			"MyFSM",
		"description":	"Finite state machine",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Varaible",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Clean all variables", "Variable", 
          "Clean {my} all variables", 
          "Clean all variables.", 
          "CleanVariables");
AddAnyTypeParam("Index", "Index of variable, can be number of string", "0");
AddAnyTypeParam("Value", "Value of variable", "0");
AddAction(1, 0, "Set a variable", "Variable", 
          "Set {my} variable[<i>{0}</i>] to <i>{1}</i>", 
          "Set a variable stored in fsm.", 
          "SetVariable");
AddAction(2, 0, "Request", "Request", 
          "Request {my}", 
          "input a request.", 
          "Request");        
AddStringParam("Name", "State name", '""');
AddAction(3, 0, "Transit to state", "Request", 
          "Transit {my} to <i>{0}</i>", 
          "Transit to state.", 
          "Transit");
AddStringParam("Name", "State name", '""');
AddAction(4, 0, "Force transit to state", "Request", 
          "Force transit {my} to <i>{0}</i>", 
          "Force transit to state.", 
          "ForceTransit");
AddStringParam("Name", "Function name", '""');
AddAction(5, 0, "Call function", "Function", "Call <i>{0}</i>", "Call function.", "CallFunction");
AddStringParam("Name", "JS function object name", '""');
AddStringParam("Code", "JS function code", '""');
AddAction(6, 0, "Create JS function object", "JS Function", 
          "Create JS <i>{0}</i>", "Create JS function object.", "CreateJSFunctionObject");
AddStringParam("Name", "JS function object name", '""');
AddAction(7, 0, "Call JS function object", "JS Function", 
          "Call JS <i>{0}</i>", "Call JS function.", "CallJSFunctionObject");


//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "State name", '""');
AddCondition(0, cf_trigger, "On request", "Request", 
             "On {my} request at <i>{0}</i>", 
			 "Triggered when request.", 
			 "OnRequest");
AddStringParam("Name", "State name", '""');
AddCondition(1, cf_trigger, "On enter state", "State changed", 
             "On {my} enter to <i>{0}</i>", 
			 "Triggered when enter state.", 
			 "OnEnter");
AddStringParam("Name", "State name", '""');
AddCondition(2, cf_trigger, "On exit state", "State changed", 
             "On {my} exit from <i>{0}</i>", 
			 "Triggered when exit state.", 
			 "OnExit");
AddStringParam("Name", "Exit from state", '""');
AddStringParam("Name", "Enter to state", '""');
AddCondition(3, cf_trigger, "On state transfer", "State changed", 
             "On {my} exit from <i>{0}</i> and enter to <i>{1}</i>", 
			 "Triggered when state transfer.", 
			 "OnTransfer");
AddCondition(4, cf_trigger, "On default request", "Request", 
             "On {my} request at any state", 
			 "Triggered when no request callback.", 
			 "OnDefaultRequest");
AddCondition(5, cf_trigger, "On default enter", "State changed", 
             "On {my} enter to any state", 
			 "Triggered when no enter callback.", 
			 "OnDefaultEnter");             
AddCondition(6, cf_trigger, "On default exit", "State changed", 
             "On {my} exit from any state", 
			 "Triggered when no exit callback.", 
			 "OnDefaultExit"); 
AddStringParam("Name", "Function name", '""');
AddCondition(7, cf_trigger, "On function", "Function", "On function <i>{0}</i>", "", "OnFunctionCalled");             
AddAnyTypeParam("Index", "The index of variable to get, can be number of string.", "0");			 
AddCmpParam("Comparison", "Choose the way to compare the varaible.");
AddAnyTypeParam("Value", "Value to be compared.", "0");
AddCondition(8, 0, "Compare variable", "Compare", 
             "{my} Var[{0}] {1} {2}", 
			 "Compare the value of variable.", 
			 "CompareVariable");
			 

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Current state", "State", "CurState", "Get current state.");
AddExpression(1, ef_return_string, "Previous state", "State", "PreState", "Get previous state.");
AddAnyTypeParam("0", "The index of variable to get, can be number of string.", "0");
AddExpression(2, ef_return_any | ef_variadic_parameters, "Get variable", "Varaiable", "Var", "Get a variable by index.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "Off", "Enable to show error message.", "Off|On"),
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "Initial state", "Off", "Set initial state."),
	new cr.Property(ept_text, "Default variables", "", 'Set initial value of variables, ex:"{"x":10, "y":20}".'),
    new cr.Property(ept_text, "Default transition", "", 'Set default transition, ex:"{"IDLE":["RUN","EAT"],"EAT":["IDLE"]}".'),	     
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
