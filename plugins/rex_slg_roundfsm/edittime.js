function GetPluginSettings()
{
	return {
		"name":			"Round FSM",
		"id":			"Rex_SLGRoundFSM",
		"description":	"Round FSM of SLG game",
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
             
//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Group", "Instance group object");
AddAction(0, 0, "Setup", "Setup", 
          "Set instance group object to <i>{1}</i>", 
          "Set instance group object.", "Setup"); 
AddAction(5, 0, "Start", 'Request: "Idle"', 
          "Start a round", 
          "Start a round.", "Start");            
AddStringParam("Available", "Group name of available instances", '""');
AddAction(6, 0, "Get available source group", 'Input: "GetSource"', 
          "Get available source group to <i>{0}</i>", 
          "Get available source group.", "GetAvailableSourceGroup");     
AddStringParam("Source", "Group name of target instances", '""');
AddAction(7, 0, "Get source group", 'Request: "GetSource"', 
          "Get source group to <i>{0}</i>", 
          "Get source group.", "GetSourceGroup");
AddStringParam("Commands", "Available commands", '""');
AddAction(8, 0, "Get available commands", 'Input: "GetCommand"', 
          "Get available commands to <i>{0}</i>", 
          "Get available commands.", "GetAvailableCommands");
AddStringParam("Commands", "Executed command", '""');
AddAction(9, 0, "Get command", 'Request: "GetCommand"', 
          "Get executed command to <i>{0}</i>", 
          "Get executed command.", "GetCommand");   
AddStringParam("Available", "Group name of available instances", '""');
AddAction(10, 0, "Get available target group", 'Input: "GetTarget"', 
          "Get available target group to <i>{0}</i>", 
          "Get available target group.", "GetAvailableTargetGroup");         
AddStringParam("Target", "Group name of target instances", '""');
AddAction(11, 0, "Get target group", 'Request: "GetTarget"', 
          "Get target group to <i>{0}</i>", 
          "Get target group.", "GetTargetGroup"); 
AddAction(12, 0, "Accept command", 'Request: "AcceptCommand"', 
          "Accept command", 
          "Accept command.", "AcceptCommand");   
AddAction(13, 0, "Finish", 'Request: "RunCommand"', 
          "Finish this round", 
          "Finish this round.", "Finish");          
AddAction(14, 0, "Cancel", 'Request: Cancel', 
          "Cancel", 
          "Cancel operation.", "Cancel");   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(3, ef_return_string, 
              "Get current state", "State", "CurState", "Get current state.");
AddExpression(4, ef_return_string, 
              "Get previous state", "State", "PreState", "Get previous state.");              
AddExpression(5, ef_return_string, 
              "Get source group", "Command", "Source", "Get source group.");
AddExpression(6, ef_return_string, 
              "Get command", "Command", "Command", "Get command.");
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
