function GetBehaviorSettings()
{
	return {
		"name":			"Command queue",
		"id":			"Rex_bCmdqueue",
		"description":	"A command queue to pend commands.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_bcmdqueue.html",
		"category":		"Rex - Logic - flow control",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
// function behavior
AddStringParam("Name", "Command name", "");      
AddCondition(1, cf_trigger, "On command", "Command", 
             "{my} On <b>{0}</b>", 
             "Triggered when command executing.", "OnCommand"); 
AddAnyTypeParam("Index", "The index of the parameter to get.", 0);
AddCmpParam("Comparison", "How to compare the function parameter.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(2, cf_none, "Compare parameter", "Parameter", 
             "{my} Parameter {0} {1} {2}", 
             "Compare the value of a parameter in a function call.", "CompareParam");
AddAnyTypeParam("Index", "The index of the parameter to get.");
AddComboParamOption("Number");
AddComboParamOption("String");
AddComboParam("Type", "The type of value.", 0);
AddCondition(3, cf_none, "Type of parameter", "Parameter", 
             "{my} Parameter {0} is a {1}", 
             "Test the type of parameter.", "TypeOfParam");
AddCondition(4, cf_none, "Empty", "Queue", 
             "{my} Is empty", 
             "Return true if the queue is empty.", "IsEmpty");
AddCondition(5, cf_none, "Last", "Queue", 
             "{my} Is last command", 
             "Return true if running last command.", "IsLast");  
AddCondition(6, cf_none, "First", "Queue", 
             "{my} Is first command", 
             "Return true if running first command.", "IsFirst");               
//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Index", "The index of the parameter to get.", 0);
AddAnyTypeParam("Value", "The value of this parameter", 0);
AddAction(1, 0, "Set parameter", "Add", 
          "{my} set parameter <i>{0}</i> to <i>{1}</i>", 
          "Set parameter.", 
          "SetParameter");
AddStringParam("Name", "Command name.", '""');
AddAction(2, 0, "Push", "Add", 
          "{my} push command <i>{0}</i>", 
          "Push a command with current parameters into back of queue.", "PushCmd");
AddAction(3, 0, "Pop", "Run - Pop", 
          "{my} pop and run command", 
          'Pop and run a command from front of queue, it will trigger "Condition:On command".', "PopCmd");  
AddAction(4, 0, "Clean", "Clean", 
          "{my} Clean all pendding commands", 
          "Clean all pendding commands", "CleanCmds");  
AddAction(5, 0, "Next", "Run - Next", 
          "{my} run next command", 
          'Run next command, it will trigger "Condition:On command".', "NextCmd");  
AddComboParamOption("Ring");
AddComboParamOption("Ping-pong");
AddComboParam("Mode", "Repeat mode.", 0);
AddAction(6, 0, "Set repeat mode", "Configure", "Set {my} repeat mode to <b>{0}</b>", 
          "Set repeat mode.", "SetRepeatMode");     
AddStringParam("Commands", "Commands in JSON format", "");
AddAction(7, 0, "Load JSON commands", "Load", 
          "Load JSON commands <i>{0}</i>", 
          "Load commands in JSON format.", "LoadJSONCmds");
AddStringParam("Commands", "Commands in CSV format", "");
AddAction(8, 0, "Load CSV commands", "Load", 
          "Load csv commands <i>{0}</i>", 
          "Load commands in CSV format.", "LoadCSVCmds");
AddNumberParam("Index", "Next index", 0);
AddAction(9, 0, "Set next index", "Run - Next", 
          "Set next index to <i>{0}</i>", 
          'Set next index for "action:Next".', "SetNextIndex");
AddStringParam("Name", "Command name.", '""');
AddNumberParam("Index", "Next index, zero-based index.", 0);
AddAction(10, 0, "Insert at", "Add", 
          "{my} Insert command <i>{0}</i> at index to <i>{1}</i>", 
          "Insert command at specific index.", "InsertCmdAt");   
AddAction(11, 0, "Current", "Run - Next", 
          "{my} run current command", 
          'Run current command, it will trigger "Condition:On command".', "RunCurCmd");            
//////////////////////////////////////////////////////////////
// Expressions
// function behavior
AddAnyTypeParam("Index", "The index of the parameter to get.", 0);
AddExpression(1, ef_return_any, "Get parameter value", "Parameter", 
              "Param", 
              "Get the value of a parameter passed to the command.");
AddExpression(2, ef_return_string, "Get commands in JSON string", "JSON", 
              "CmdToString", 
              "Get commands in JSON string.");
AddExpression(3, ef_return_number, "Get count of commands", "Queue", 
              "CmdCount", 
              "Get count of commands, i.e. length of queue.");          
AddExpression(4, ef_return_number, "Get current index", "Run", 
              "CurIndex", 
              "Get current index of executed command.");
AddExpression(5, ef_return_number, "Get last index", "Queue", 
              "LastIndex", 
              "Get last index of queue.");            
ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_combo, "Repeat mode", "Ring", 'Repeat mode for "action:Next".', "Ring|Ping-pong"),
    //new cr.Property(ept_combo, "Fetch direction", "Increase", 'Fetch direction for repeating.', "Increase|Decrease"),
    new cr.Property(ept_combo, "Activated", "No", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
    new cr.Property(ept_text, "Commands", "[]", "Commands in JSON format"),    
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
