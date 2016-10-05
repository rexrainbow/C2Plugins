function GetPluginSettings()
{
	return {
		"name":			"Round FSM",
		"id":			"Rex_RoundFSM",
		"version":		"0.1",   		
		"description":	"A finite state machine to descript a round",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_roundfsm.html",
		"category":		"Control flow",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddComboParamOption("Idle");
AddComboParamOption("GetSource");
AddComboParamOption("GetCommand");
AddComboParamOption("GetTarget");
AddComboParamOption("AcceptCommand");
AddComboParamOption("RunCommand");
AddComboParam("State", "States in Round FSM", 0);
AddCondition(0, 0, "Current state", "State", 
             "Current state is <i>{0}</i>", "Compare current state.", "IsState");
AddCondition(1, cf_trigger, 'On enter "Idle"', '1. "Idle" state', 
             'On enter "Idle"', 'Trigger when state enter to "Idle".', "OnEnterIdle");
AddCondition(2, cf_trigger, 'On exit "Idle"', '1. "Idle" state', 
             'On exit "Idle"', 'Trigger when state exit from "Idle".', "OnExitIdle");   
AddCondition(3, cf_trigger, 'On enter "GetSource"', '2. "GetSource" state', 
             'On enter "GetSource"', 'Trigger when state enter to "GetSource".', "OnEnterGetSource");
AddCondition(4, cf_trigger, 'On exit "GetSource"', '2. "GetSource" state', 
             'On exit "GetSource"', 'Trigger when state exit from "GetSource".', "OnExitGetSource");   
AddCondition(5, cf_trigger, 'On enter "GetCommand"', '3. "GetCommand" state', 
             'On enter "GetCommand"', 'Trigger when state enter to "GetCommand".', "OnEnterGetCommand");
AddCondition(6, cf_trigger, 'On exit "GetCommand"', '3. "GetCommand" state', 
             'On exit "GetCommand"', 'Trigger when state exit from "GetCommand".', "OnExitGetCommand");                        
AddCondition(7, cf_trigger, 'On enter "GetTarget"', '4. "GetTarget" state', 
             'On enter "GetTarget"tate', 'Trigger when state enter to "GetTarget".', "OnEnterGetTarget");
AddCondition(8, cf_trigger, 'On exit "GetTarget"', '4. "GetTarget" state', 
             'On exit "GetTarget"', 'Trigger when state exit from "GetTarget".', "OnExitGetTarget");                        
AddCondition(9, cf_trigger, 'On enter "AcceptCommand"', '5. "AcceptCommand" state', 
             'On enter "AcceptCommand"', 'Trigger when state enter to "AcceptCommand".', "OnEnterAcceptCommand");
AddCondition(10, cf_trigger, 'On exit "AcceptCommand"', '5. "AcceptCommand" state', 
             'On exit "AcceptCommand"', 'Trigger when state exit from "AcceptCommand".', "OnExitAcceptCommand"); 
AddCondition(11, cf_trigger, 'On enter "RunCommand"', '6. "RunCommand" state', 
             'On enter "RunCommand"', 'Trigger when state enter to "RunCommand".', "OnEnterRunCommand");
AddCondition(12, cf_trigger, 'On exit "RunCommand"', '6. "RunCommand" state', 
             'On exit "RunCommand"', 'Trigger when state exit from "RunCommand".', "OnExitRunCommand"); 
AddCondition(13, cf_trigger, "On state changed", "Debug", 
             "On state changed", "Trigger when state changed.", "OnStateChanged");           
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable fsm.",1);
AddAction(1, 0, "Set activated", "Activated", "Set activated to <i>{0}</i>", "Enable fsm transfer.", "SetActivated");    
AddAction(4, 0, "Turn off", "Request", 
          "Turn off", 
          'Turn off this fsm. It will push state to "Off" and set activated to "No"', "TurnOff");       
AddAction(5, 0, "Start", '1. Request: "Idle"', 
          "Start a round", 
          'Start a round. It will push state from "Idle" to "GetSource"', "Start"); 
AddAnyTypeParam("Source", "Source instance(s)", 0);
AddAction(6, 0, "Get source", '2. Request: "GetSource"', 
          "Get source to <i>{0}</i>", 
         'Get source. It will push state from "GetSource" to "GetCommand"', "GetSource");
AddAnyTypeParam("Commands", "Executed command", '""');
AddAction(7, 0, "Get command", '3. Request: "GetCommand"', 
          "Get executed command to <i>{0}</i>", 
          'Get executed command. It will push state from "GetCommand" to "GetTarget"', "GetCommand");       
AddAnyTypeParam("Target", "Target instance(s)", 0);
AddAction(8, 0, "Get target", '4. Request: "GetTarget"', 
          "Get target to <i>{0}</i>", 
          'Get target. It will push state from "GetTarget" to "AcceptCommand"', "GetTarget"); 
AddAction(9, 0, "Accept command", '5. Request: "AcceptCommand"', 
          "Accept command", 
          'Accept command. It will push state from "AcceptCommand" to "RunCommand"', "AcceptCommand");   
AddAction(10, 0, "Finish", '6. Request: "RunCommand"', 
          "Finish this round", 
          'Finish this round. It will push state from "RunCommand" to "Idle"', "Finish");          
AddAction(11, 0, "Cancel", 'Request: Cancel', 
          "Cancel", 
          "Cancel operation.", "Cancel");   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(3, ef_return_string, 
              "Get current state", "State", "CurState", "Get current state.");
AddExpression(4, ef_return_string, 
              "Get previous state", "State", "PreState", "Get previous state.");              
AddExpression(5, ef_return_any, 
              "Get source", "Command", "Source", "Get source.");
AddExpression(6, ef_return_any, 
              "Get command", "Command", "Command", "Get command.");
AddExpression(7, ef_return_any, 
              "Get target", "Command", "Target", "Get target.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
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
