function GetPluginSettings()
{
	return {
		"name":			"Control FSM",
		"id":			"Rex_SLGCTLFSM",
		"description":	"Control FSM of SLG game",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"SLG",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, 'On enter "Idle"', "Enter", 
             'On enter "Idle" state', 'Trigger when state enter to "Idle".', "OnEnterIdle");
AddCondition(2, cf_trigger, 'On exit "Idle"', "Exit", 
             'On exit "Idle" state', 'Trigger when state exit from "Idle".', "OnExitIdle");   
AddCondition(3, cf_trigger, 'On enter "GetSource"', "Enter", 
             'On enter "GetSource" state', 'Trigger when state enter to "GetSource".', "OnEnterGetSource");
AddCondition(4, cf_trigger, 'On exit "GetSource"', "Exit", 
             'On exit "GetSource" state', 'Trigger when state exit from "GetSource".', "OnExitGetSource");   
AddCondition(5, cf_trigger, 'On enter "GetCommand"', "Enter", 
             'On enter "GetCommand" state', 'Trigger when state enter to "GetCommand".', "OnEnterGetCommand");
AddCondition(6, cf_trigger, 'On exit "GetCommand"', "Exit", 
             'On exit "GetCommand" state', 'Trigger when state exit from "GetCommand".', "OnExitGetCommand");                        
AddCondition(7, cf_trigger, 'On enter "GetTarget"', "Enter", 
             'On enter "GetTarget" state', 'Trigger when state enter to "GetTarget".', "OnEnterGetTarget");
AddCondition(8, cf_trigger, 'On exit "GetTarget"', "Exit", 
             'On exit "GetTarget" state', 'Trigger when state exit from "GetTarget".', "OnExitGetTarget");                        
AddCondition(9, cf_trigger, 'On enter "AcceptCommand"', "Enter", 
             'On enter "AcceptCommand" state', 'Trigger when state enter to "AcceptCommand".', "OnEnterAcceptCommand");
AddCondition(10, cf_trigger, 'On exit "AcceptCommand"', "Exit", 
             'On exit "AcceptCommand" state', 'Trigger when state exit from "AcceptCommand".', "OnExitAcceptCommand"); 
AddCondition(11, cf_trigger, 'On enter "RunCommand"', "Enter", 
             'On enter "RunCommand" state', 'Trigger when state enter to "RunCommand".', "OnEnterRunCommand");
AddCondition(12, cf_trigger, 'On exit "RunCommand"', "Exit", 
             'On exit "RunCommand" state', 'Trigger when state exit from "RunCommand".', "OnExitRunCommand"); 
             
//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Group", "Instance group object");
AddAction(0, 0, "Setup", "Setup", 
          "Set instance group object to <i>{1}</i>", 
          "Set instance group object.", "Setup"); 
AddStringParam("Available", "Group name of available instances", '""');
AddAction(3, 0, "Get available source group", "Request: Source", 
          "Get available source group to <i>{0}</i>", 
          "Get available source group.", "GetAvailableSourceGroup");     
AddStringParam("Source", "Group name of target instances", '""');
AddAction(4, 0, "Get source group", "Request: Source", 
          "Get source group to <i>{0}</i>", 
          "Get source group.", "GetSourceGroup");
AddStringParam("Commands", "Available commands", '""');
AddAction(5, 0, "Get available commands", "Request: Command", 
          "Get available commands to <i>{0}</i>", 
          "Get available commands.", "GetAvailableCommands");
AddStringParam("Commands", "Executed command", '""');
AddAction(6, 0, "Get command", "Request: Command", 
          "Get executed command to <i>{0}</i>", 
          "Get executed command.", "GetCommand");   
AddStringParam("Available", "Group name of available instances", '""');
AddAction(7, 0, "Get available target group", "Request: Target", 
          "Get available target group to <i>{0}</i>", 
          "Get available target group.", "GetAvailableTargetGroup");         
AddStringParam("Target", "Group name of target instances", '""');
AddAction(8, 0, "Get target group", "Request: Target", 
          "Get target group to <i>{0}</i>", 
          "Get target group.", "GetTargetGroup"); 
AddAction(9, 0, "Accept", "Request: Run command", 
          "Accept command", 
          "Accept command.", "AcceptCommand");   
AddAction(10, 0, "Finish", "Request: Run command", 
          "Finish execution", 
          "Finish execution.", "FinishExecution");          
AddAction(15, 0, "Cancel", "Request: Cancel", 
          "Cancel", 
          "Cancel operation.", "Cancel");   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(3, ef_return_string, 
              "Get new state", "State", "NewState", "Get new state.");
AddExpression(4, ef_return_string, 
              "Get current state", "State", "CurState", "Get current state.");              
AddExpression(5, ef_return_string, 
              "Get source group", "Command", "Source", "Get source group.");
AddExpression(6, ef_return_string, 
              "Get command", "Command", "command", "Get command.");
AddExpression(7, ef_return_string, 
              "Get target group", "Command", "Target", "Get target group.");              

              
ACESDone();

// Property grid properties for this plugin
var property_list = [
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
