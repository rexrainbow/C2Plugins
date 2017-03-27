function GetPluginSettings()
{
	return {
		"name":			"FSM",
		"id":			"Rex_FSM",
		"version":		"0.1",   		
		"description":	"Finite state machine",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_gfsm.html",
		"category":		"Rex - Logic -finite state machine",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Actions   
AddAction(2, 0, "Request", "Request", 
          "Request", 
          "Request a state transfer.", 
          "Request");     
AddStringParam("Name", "State name", '""');
AddAction(11, 0, "Go to state", "Request", 
          "Go to state <i>{0}</i>", "Assign next state.",  "GotoState");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(13, 0, "Set activated", "Setup", "Set activated to <i>{0}</i>", "Enable the object's cursor behavior.", "SetActivated");
AddStringParam("Name", "State name", '""');
AddAction(14, 0, "Set next state", "Logic", 
          "Set next state to <i>{0}</i>", 'Set next state. Used in "Condition: On transfer logic"',  "NextStateSet");          
          
//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "State name", '""');
AddCondition(0, cf_trigger, "On enter", "Action", 
             "On enter to <i>{0}</i>", 
			 "Triggered when enter state.", 
			 "OnEnter");
AddStringParam("Name", "State name", '""');
AddCondition(1, cf_trigger, "On exit", "Action", 
             "On exit from <i>{0}</i>", 
			 "Triggered when exit state.", 
			 "OnExit");
AddStringParam("Exit", "Exit from state", '""');
AddStringParam("Enter", "Enter to state", '""');
AddCondition(2, cf_trigger, "On transfer", "Action", 
             "On exit from <i>{0}</i> and enter to <i>{1}</i>", 
			 "Triggered when state transfer.", 
			 "OnTransfer");             
AddCondition(3, cf_trigger, "On default enter", "Action", 
             "On enter to any state", 
			 "Triggered when no enter callback.", 
			 "OnDefaultEnter");             
AddCondition(4, cf_trigger, "On default exit", "Action", 
             "On exit from any state", 
			 "Triggered when no exit callback.", 
			 "OnDefaultExit"); 
AddCondition(5, cf_trigger, "On state changed", "Action", 
             "On state changed", 
			 "Triggered when state changed. Useful when debugging.", 
			 "OnStateChanged");
AddStringParam("Name", "State name", '""');
AddCondition(6, cf_trigger, "On transfer logic", "Logic", 
             "On <i>{0}</i> transfer logic", 
			 "Triggered to get next state.", 
			 "OnLogic");
AddStringParam("Name", "State name", '""');
AddCondition(7, 0, "Compare current state", "State", 
             "Current state = <i>{0}</i>", 
			 "Compare current state.", 
			 "IsCurState");
AddStringParam("Name", "State name", '""');             
AddCondition(8, 0, "Compare previous state", "State", 
             "Previous state = <i>{0}</i>", 
			 "Compare previous state.", 
			 "IsPreState");
AddCondition(9, cf_trigger, "On default logic", "Logic", 
             "On {my} default transfer logic", 
			 'Triggered to get next state if no matched "condition:On transfer logic" fired.', 
			 "OnDefaultLogic");				 
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Current state", "State", "CurState", "Get current state.");
AddExpression(1, ef_return_string, "Previous state", "State", "PreState", "Get previous state.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "Initial state", "Off", "Set initial state."),
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
