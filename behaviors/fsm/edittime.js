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
AddAction(0, 0, "Clean all arguments", "Argument", 
          "Clean {my} all arguments", 
          "Clean all arguments.", 
          "CleanArguments");
AddAnyTypeParam("Index", "Index of argument, can be number of string", "0");
AddAnyTypeParam("Value", "Value of argument", "0");
AddAction(1, 0, "Add a argument", "Argument", 
          "Set {my} arguments[<i>{0}</i>] = <i>{1}</i>", 
          "Set a arguments pass into callback.", 
          "SetArgument");
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

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "State name", '""');
AddCondition(0, cf_trigger, "On request", "Callback", 
             "On {my} request at <i>{0}</i>", 
			 "Triggered when request.", 
			 "OnRequest");
AddStringParam("Name", "State name", '""');
AddCondition(1, cf_trigger, "On enter state", "Callback", 
             "On {my} enter to <i>{0}</i>", 
			 "Triggered when enter state.", 
			 "OnEnter");
AddStringParam("Name", "State name", '""');
AddCondition(2, cf_trigger, "On exit state", "Callback", 
             "On {my} exit from <i>{0}</i>", 
			 "Triggered when exit state.", 
			 "OnExit");
AddStringParam("Name", "Exit from state", '""');
AddStringParam("Name", "Enter to state", '""');
AddCondition(3, cf_trigger, "On state transfer", "Callback", 
             "On {my} exit from <i>{0}</i> and enter to <i>{1}</i>", 
			 "Triggered when state transfer.", 
			 "OnTransfer");
AddCondition(4, cf_trigger, "On default request", "Callback", 
             "On {my} default request", 
			 "Triggered when no request callback.", 
			 "OnDefaultRequest");
AddCondition(5, cf_trigger, "On default enter", "Callback", 
             "On {my} default enter", 
			 "Triggered when no enter callback.", 
			 "OnDefaultEnter");             
AddCondition(6, cf_trigger, "On default exit", "Callback", 
             "On {my} default exit", 
			 "Triggered when no exit callback.", 
			 "OnDefaultExit"); 

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Current state", "State", "CurState", "Get current state.");
AddExpression(1, ef_return_string, "Previous state", "State", "PreState", "Get previous state.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "Start state", "Off", "State at the start of the layout."),
    new cr.Property(ept_text, "Default transition", "", 'Set default transition, ex:"IDLE,RUN".'),	     
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
