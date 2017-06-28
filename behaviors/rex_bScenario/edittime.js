function GetBehaviorSettings()
{
	return {
		"name":			"Scenario",
		"id":			"rex_bScenario",
		"version":		"0.1",
		"description":	"Executing function from a csv table while time-out",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_bscenario.html",
		"category":		"Rex - Script",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On loop end", "Control", "On loop end", 
             "Triggered when loop end.", "OnLoopEnd");
AddCondition(1, 0, "Is running", "Control", "Is running", 
             "Is scenario running.", "IsRunning");
AddCondition(2, cf_trigger, "On tag changed", "Tag", "On tag changed", 
             "Triggered when tag changed.", "OnTagChanged");  
AddStringParam("Tag", 'Tag in csv table. "" is start from 1st command.', "");             
AddCondition(3, 0, "Is tag existed", "Tag", "Is tag <i>{0}</i> existed", 
             "Return true if tag is existed.", "IsTagExisted");

// function behavior
AddStringParam("Name", "Command name", "");      
AddCondition(10, cf_trigger, "On command", "Command", 
             "On <b>{0}</b>", 
             "Triggered when command executing.", "OnCommand"); 
AddAnyTypeParam("Index", "The zero-based index of the parameter to get.");
AddCmpParam("Comparison", "How to compare the function parameter.");
AddAnyTypeParam("Value", "The value to compare to.");
AddCondition(11, cf_none, "Compare parameter", "Command", 
             "Parameter {0} {1} {2}", 
             "Compare the value of a parameter in a function call.", "CompareParam");
AddAnyTypeParam("Index", "The zero-based index of the parameter to get.");
AddComboParamOption("Number");
AddComboParamOption("String");
AddComboParam("Type", "The type of value.", 0);
AddCondition(12, cf_none, "Type of parameter", "Command", 
             "Parameter {0} is a {1}", 
             "Test the type of parameter.", "TypeOfParam");
             
AddCondition(21, 0, "Is waiting any", "Wait", "Is waiting", 
             "Is scenario waiting for any signal.", "IsWaiting");    
AddAnyTypeParam("Key", "Key of locked-wait command", '""');                
AddCondition(22, 0, "Is waiting", "Wait", "Is waiting", 
             "Is scenario waiting for signal.", "IsWaiting");                 
AddCondition(23, cf_trigger, "On waiting any start", "Wait", "On waiting start", 
             "Triggered when On waiting (for signal) start.", "OnWaitingStart");       
AddAnyTypeParam("Key", "Key of locked-wait command", '""');                   
AddCondition(24, cf_trigger, "On waiting start", "Wait", "On waiting <i>{0}</i> start", 
             "Triggered when On waiting (for signal) start.", "OnWaitingStart");              
                   
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Commands", "Commands string", '""');
AddComboParamOption("csv");
AddComboParamOption("JSON");
AddComboParam("Format", "String format.",0); 
AddAction(2, 0, "Load CSV commands", "0: Load", 
          "Load csv commands <i>{0}</i> (<i>{1}</i>)", 
          "Load commands in csv or json format.", "LoadCSVCmds");
AddNumberParam("Offset", "Time offset at start", 0);
AddStringParam("Tag", 'Tag in csv table. "" is start from 1st command.', "");
AddNumberParam("Repeat", "Repeat count. 0 is infinity.", 1);
AddAction(3, 0, "Start scenario", "Flow control", 
          "Start scenario with offset to <i>{0}</i>, tag to <i>{1}</i>, repeat count to <i>{2}</i>", 
          "Start scenario.", "Start");     
AddAction(4, 0, "Pause scenario", "Control", 
          "Pause scenario", 
          "Pause scenario.", "Pause");
AddAction(5, 0, "Resume scenario", "Control", 
          "Resume scenario", 
          "Resume scenario.", "Resume"); 
AddAction(6, 0, "Stop scenario", "Control", 
          "Stop scenario", 
          "Stop scenario.", "Stop"); 
AddNumberParam("Offset", "Time offset at start", 0);     
AddAction(7, 0, "Set time offset", "Setting", 
          "Set offset to <i>{1}</i>", 
          "Set time offset.", "SetOffset");  
AddAction(8, 0, "Clean commands", "0: Load", 
          "Clean all commands", 
          "Clean all commands.", "CleanCmds");            
AddStringParam("Commands", "Commands string", '""');
AddComboParamOption("csv");
AddComboParamOption("JSON");
AddComboParam("Format", "String format.",0); 
AddAction(9, 0, "Append commands", "0: Load", 
          "Append commands <i>{0}</i> (<i>{1}</i>)", 
          "Append commands in csv or json format", "AppendCmds");          
AddAction(20, 0, "Continue all", "Response - Wait", 
          "Continue scenario (response of wait command)", 
          "Continue scenario, response of wait command.", "Continue");  
//AddStringParam("Tag", "Tag in csv table", "");
//AddAction(21, af_deprecated, "Goto tag", "Flow control", 
//          "Goto tag <i>{0}</i>", 
//          "Set current table index to tag.", "GoToTag");		
AddAnyTypeParam("Index", "Index of memory, can be number of string", 0);
AddAnyTypeParam("Value", "Value of memory", 0);
AddAction(31, 0, "Set value", "Memory", 
          "Set MEM[<i>{0}</i>] to <i>{1}</i>", 
          "Set the value stored in memory.", 
          "SetMemory");	
AddStringParam("JSON string", "JSON string.", '""');
AddAction(32, 0, "Load from JSON", "Memory", "Load MEM form JSON string to <i>{0}</i>",
         "Load memory from JSON string.", "StringToMEM");
AddAnyTypeParam("Key", "Key of locked-wait command", "");         
AddAction(33, 0, "Continue with key", "Response - Wait", 
          "Continue scenario (response of wait <i>{0}</i> command)", 
          "Continue scenario, response of locked-wait command.", "Continue");
AddStringParam("Commands", "Commands in JSON format", "");
AddAction(34, 0, "Load JSON commands", "0: Load", 
          "Load json commands <i>{0}</i>", 
          "Load commands in JSON format.", "LoadJSONCmds");                        
AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(41, 0, "Setup", "Setup", 
          "Get timer from <i>{0}</i>", 
          "Setup.", "Setup2");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, "Get last tag", 
              "Tag", "LastTag", 
              "Get last tag."); 
AddAnyTypeParam(0, "The index of memory to get, can be number of string.", 0);
AddExpression(3, ef_return_any, 
              "Get memory", "Memory", "Mem", 
              "Get the value from memory by index.");
AddExpression(4, ef_return_string, "Transfer memory to string", 
              "Memory", "MEMToString", 
              "Transfer memory to JSON string."); 
AddExpression(5, ef_return_string, "Get previous tag", 
              "Tag", "PreviousTag", 
              "Get previous tag.");
AddExpression(6, ef_return_string, "Get current tag", 
              "Tag", "CurrentTag", 
              "Get current(last) tag.");                    

// function behavior
AddAnyTypeParam("Index", "The zero-based index of the parameter to get.");
AddExpression(10, ef_return_any, "Get parameter value", "Command", 
              "Param", 
              "Get the value of a parameter passed to the command.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "No", "Enable to show log.", "No|Yes"),
    new cr.Property(ept_combo, "Time stamp", "Differential", "Time stamp type.", "Accumulation|Differential"),
    new cr.Property(ept_combo, "Eval mode", "Yes", 'Enable "Eval mode" for parameters. "Mem" feature only could be used in eval mode.', "No|Yes"),
    // auto start command
    new cr.Property(ept_combo, "Activated", "No", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
    new cr.Property(ept_text, "Commands", "[]", "Commands in JSON format"),  
    new cr.Property(ept_float, "Offset", 0, "Time offset at start"),      
    new cr.Property(ept_text, "Tag", "", 'Tag in csv table. "" is start from 1st command.'),  
    new cr.Property(ept_integer, "Repeat count", 0, "The times to execute commands repeatly. 0 is infinity."),    
    new cr.Property(ept_combo, "Sync timescale", "Yes", "Sync to object's timescale.", "No|Yes"),    
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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
