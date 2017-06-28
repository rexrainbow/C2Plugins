function GetPluginSettings()
{
	return {
		"name":			"Scenario",
		"id":			"Rex_Scenario",
		"version":		"0.1",   		
		"description":	"Executing function from a csv table while time-out",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_scenario.html",
		"category":		"Rex - Script",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"mustache.min.js",    
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On execution completed", "Control", "On completed", 
             "Triggered when scenario executed completed.", "OnCompleted");
AddCondition(1, 0, "Is running", "Control", "Is running", 
             "Is scenario running.", "IsRunning");
AddCondition(2, cf_trigger, "On tag changed", "Tag", "On tag changed", 
             "Triggered when tag changed.", "OnTagChanged");  
AddStringParam("Tag", 'Tag in csv table. "" is start from 1st command.', "");             
AddCondition(3, 0, "Is tag existed", "Tag", "Is tag <i>{0}</i> existed", 
             "Return true if tag is existed.", "IsTagExisted");

AddCondition(11, 0, "Is waiting any", "Wait", "Is waiting", 
             "Is scenario waiting for any signal.", "IsWaiting");    
AddAnyTypeParam("Key", "Key of locked-wait command", '""');               
AddCondition(12, 0, "Is waiting", "Wait", "Is waiting", 
             "Is scenario waiting for signal.", "IsWaiting");                 
AddCondition(13, cf_trigger, "On waiting any start", "Wait", "On waiting start", 
             "Triggered when On waiting (for signal) start.", "OnWaitingStart");       
AddAnyTypeParam("Key", "Key of locked-wait command", '""');                 
AddCondition(14, cf_trigger, "On waiting start", "Wait", "On waiting <i>{0}</i> start", 
             "Triggered when On waiting (for signal) start.", "OnWaitingStart");                   
             
//////////////////////////////////////////////////////////////
// Actions     
AddObjectParam("Timeline", "Timeline object to get timer");
AddObjectParam("Function", "Function object for callback");
AddAction(1, af_deprecated, "Setup", "Z: Deprecated", 
          "Get timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup.", "Setup");
          
AddStringParam("Commands", "Commands string", '""');
AddComboParamOption("csv");
AddComboParamOption("JSON");
AddComboParam("Format", "String format.",0); 
AddAction(2, 0, "Load commands", "0: Load", 
          "Load commands <i>{0}</i> (<i>{1}</i>)", 
          "Load commands in csv or json format.", "LoadCmds");
AddNumberParam("Offset", "Time offset at start", 0);
AddStringParam("Tag", 'Tag in csv table. "" is start from 1st command.', "");
AddAction(3, 0, "Start scenario", "Flow control", 
          "Start scenario with offset to <i>{0}</i>, tag to <i>{1}</i>", 
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
          "Append commands in csv or json format.", "AppendCmds");          
                     
AddAction(20, 0, "Continue all", "Response - Wait", 
          "Continue scenario (response of wait command)", 
          "Continue scenario, response of wait command.", "Continue");  
AddStringParam("Tag", "Tag in csv table", "");
AddAction(21, af_deprecated, "Goto tag", "Flow control", 
          "Goto tag <i>{0}</i>", 
          "Set current table index to tag.", "GoToTag");		
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
          
AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(41, 0, "Setup timeline", "Setup", 
          "Get timer from <i>{0}</i>", 
          "Setup timeline.", "SetupTimeline");	
          
AddComboParamOption("Official function");
AddComboParamOption("Rex function2");
AddComboParam("Callback", "Callback object.",0);          
AddAction(42, 0, "Setup callback", "Setup", 
          "Set callback to <i>{0}</i>", 
          "Setup callback.", "SetupCallback");	
          
AddStringParam("Left delimiter", 'Left delimiter. Set "" to use default delimiter "{{"', '"{{"');
AddStringParam("Right delimiter", 'Right delimiter. Set "" to use default delimiter "}}"', '"}}"');
AddAction(101, 0, "Set delimiters", "Mustache", 
         "Set delimiters to <i>{0}</i> <i>{1}</i>",
         "Set delimiters .", "SetDelimiters ");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, "Get last tag", 
              "Tag", "LastTag", 
              "Get last tag."); 
AddAnyTypeParam("Index", "Index of memory, can be number of string", 0);
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
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Debug mode", "No", "Enable to show log.", "No|Yes"),
    new cr.Property(ept_combo, "Time stamp", "Differential", "Time stamp type.", "Accumulation|Differential"),
    new cr.Property(ept_combo, "Eval mode", "Yes", 'Enable "Eval mode" for parameters. "Mem" feature only could be used in eval mode.', "No|Yes"),
    new cr.Property(ept_combo, "Sync timescale", "Yes", "Sync to object's timescale.", "No|Yes"),   
    new cr.Property(ept_combo, "Mustache", "Yes", "Enable to process string by Mustache templating engine.", "No|Yes"),
	new cr.Property(ept_text, "Left delimiter", "{{", 'Left delimiter. Set "" to use default delimiter "{{"'),
	new cr.Property(ept_text, "Right delimiter", "}}", 'Right delimiter. Set "" to use default delimiter "}}"'),        
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
