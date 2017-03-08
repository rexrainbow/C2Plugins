function GetBehaviorSettings()
{
	return {
		"name":			"Duration",
		"id":			"Rex_Duration",
		"version":		"1.0",          
		"description":	"Execute callback during duration",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_duration.html",
		"category":		"Rex - Timeline",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddAnyTypeParam("Duration", "Duration name", '""');
AddCondition(0, 0, "Is duration running", "Durations", "{my} <i>{0}</i> is running", "", "IsRunning");
AddAnyTypeParam("Duration", "Duration name", '""');
AddCondition(1, cf_trigger, "On start", "Callback", "{my} on <i>{0}</i> start", 
             "Triggered when duration start.", "OnStart");
AddAnyTypeParam("Duration", "Duration name", '""');
AddCondition(2, cf_trigger, "On interval", "Callback", "{my} on <i>{0}</i> interval", 
             "Triggered when duration interval.", "OnInterval");
AddAnyTypeParam("Duration", "Duration name", '""');
AddCondition(3, cf_trigger, "On end", "Callback", "{my} on <i>{0}</i> end", 
             "Triggered when duration end.", "OnEnd");   
             
//////////////////////////////////////////////////////////////
// Actions

// ---- deprecated ----
AddObjectParam("Timeline", "Timeline object for getting timer");
AddObjectParam("Function", "Function object for callback");
AddAction(0, af_deprecated, "Setup", "Z: Deprecated", 
          "{my} get timer from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup.", "Setup_deprecated");          
AddAnyTypeParam("Name", "Duration name. Could be a string or a number.", '""');
AddNumberParam("Duration", "Duration time", 1);
AddNumberParam("Interval", "Interval time", 0.1);
AddStringParam("On start", "Callback at duration starting", '""');
AddStringParam("On interval", 'Callback for each interval', '""');
AddStringParam("On end", "Callback at duration finished", '""');
AddAction(2, af_deprecated, "Start duration", "Z: Deprecated", 
          "Start {my} <i>{0}</i> with duration to <i>{1}</i> second for each <i>{2}</i> second. Callback of 'On start' to <i>{3}</i>, 'On interval' to <i>{4}</i>, and 'On end' to <i>{5}</i>", 
          "Start duration.", "Start_deprecated");
// ---- deprecated ----

AddAnyTypeParam("Name", "Duration name. Could be a string or a number.", '""');
AddNumberParam("Duration", "Persist duration time", 1);
AddNumberParam("Interval", "Interval time", 0.1);
AddAction(1, 0, "Start", "Control", 
          "{my} run <i>{0}</i> each <i>{2}</i> second, persist <i>{1}</i> second",
          "Start duration.", "Start");
AddAnyTypeParam("Name", "Duration name. Could be a string or a number.", '""');      
AddAction(3, 0, "Pause", "Control", 
          "{my} pause <i>{0}</i>", 
          "Pause duration.", "Pause"); 
AddAnyTypeParam("Name", "Duration name. Could be a string or a number.", '""');      
AddAction(4, 0, "Resume", "Control", 
          "{my} resume <i>{0}</i>", 
          "Resume duration.", "Resume"); 
AddAnyTypeParam("Name", "Duration name. Could be a string or a number.", '""');        
AddAction(5, 0, "Force to end", "Control", 
          "{my} force <i>{0}</i> to end", 
          'Force duration to end. "Condition:On end" will be triggered if "Condition:On start" had been triggered before.', "ForceToEnd");
AddAction(6, 0, "Pause all", "Control: All", 
          "{my} pause all durations", 
          "Pause all durations.", "PauseAll");                    
AddAction(7, 0, "Resume all", "Control: All", 
          "{my} resume all durations", 
          "Resume all durations.", "ResumeAll"); 
AddAction(8, 0, "Force to end all", "Control: All", 
          "{my} force all durations to end", 
          'Force all durations to end. "Condition:On end" will be triggered if "Condition:On start" had been triggered before.', "ForceToEndAll");    
AddAnyTypeParam("Name", "Duration name. Could be a string or a number.", '""');        
AddAction(9, 0, "Cancel", "Control", 
          "{my} cancel <i>{0}</i>", 
          "Cancel duration.", "Cancel");		  

AddObjectParam("Timeline", "Timeline object to get timer");
AddAction(10, 0, "Setup", "Setup", 
          "{my} get timer from <i>{0}</i>", 
          "Setup.", "Setup2");
          
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Type", "Type.", 0);
AddAction(11, 0, "Sync timescale", "Sync", "{my} Set timescale synchronization to <i>{0}</i>", "Synchronize to object's timescale.", "SyncTimescale");          
          
AddAnyTypeParam("Duration", "Duration name. Could be a string or a number.", '""');           
AddNumberParam("Duration", "Duration time", 1);
AddAction(15, 0, "Add duration time", "Time", 
          "{my} <i>{0}</i>: add <i>{1}</i> second to duration time", 
          "Add(extend) duration time.", "AddDurationTime");
AddAnyTypeParam("Duration", "Duration name. Could be a string or a number.", '""');           
AddNumberParam("Interval", "Interval time", 0.1);
AddAction(16, 0, "Set interval time", "Time", 
          "{my} <i>{0}</i>: set interval time to <i>{1}</i> second", 
          "Set interval time.", "SetIntervalTime");  
                  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number | ef_variadic_parameters, "Get remainder duration", 
              "Duration", "Remainder", 
              "Get remainder duration. Add second parameter to specify duration.");
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get elapsed time of duration", 
              "Duration", "Elapsed", 
              "Get elapsed time of duration. Add second parameter to specify duration.");              
AddExpression(2, ef_return_number | ef_variadic_parameters, "Get remainder time percentage of duration", 
              "Percentage", "RemainderPercent", 
              "Get remainder time percentage of duration. Add second parameter to specify duration.");
AddExpression(3, ef_return_number | ef_variadic_parameters, "Get elapsed time percentage of duration", 
              "Percentage", "ElapsedPercent", 
              "Get elapsed time percentage of duration. Add second parameter to specify duration.");  
AddExpression(4, ef_return_number | ef_variadic_parameters, "Get interval time", 
              "Duration", "Interval", 
              "Get interval time. Add second parameter to specify duration.");
AddExpression(5, ef_return_number | ef_variadic_parameters, "Get duration time", 
              "Duration", "Duration", 
              "Get duration time. Add second parameter to specify duration.");              


ACESDone();

// Property grid properties for this plugin
var property_list = [
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