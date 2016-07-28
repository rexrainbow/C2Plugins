function GetPluginSettings()
{
	return {
		"name":			"Timer V2",
		"id":			"Rex_Firebase_TimerV2",
		"version":		"0.1",        
		"description":	"Get elapsed interval from firebase - version 2.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_timerv2.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On start timer", "Start timer", 
            "On start timer",
            "Triggered when start timer complete.", "OnStartTimerComplete");

AddCondition(2, cf_trigger, "On start timer error", "Start timer", 
            "On start timer error",
            "Triggered when start timer error.", "OnStartTimerError");     
            
AddCondition(21, cf_trigger, "On update", "Timers", 
            "On update timers",
            "Triggered when timers updated.", "OnUpdate");  
            
AddCondition(22, cf_looping | cf_not_invertible, "For each timer", "For each", 
             "For each timer", 
             "Repeat the event for each timer.", "ForEachTimer");               
             
AddCondition(31, cf_trigger, "On time-out", "Time out", 
            "On time-out",
            "Triggered when time-out.", "OnTimeout");                  
            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set sub domain", "Domain", 
          "Set sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddNumberParam("Interval", "Time-out interval, in seconds.", 0);     
AddAction(1, 0, "Start", "Timer", 
          "Start timer <i>{1}</i> of user ID: <i>{0}</i>, with time-out interval to <i>{2}</i>", 
          "Start timer.", "StartTimer");
          
AddStringParam("User ID", "User ID.", '""');    
AddAction(11, 0, "Start", "Monitor", 
          "Start monitor timers of user ID: <i>{0}</i>", 
          "Start monitor timers.", "StartUpdate");

AddAction(12, 0, "Stop", "Monitor", 
          "Stop monitor", 
          "Stop monitor.", "StopUpdate");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get owner ID", "Timer", "LastOwnerID", 
              "Get owner ID of last triggered timer.");
AddExpression(2, ef_return_string, "Get timer name", "Timer", "LastTimerName", 
              "Get timer name of last triggered timer.");

AddExpression(11, ef_return_number, "Get current timestamp", "Timestamp", "CurTimestamp", 
              "Get current timestamp.");              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Sub domain", "Timers", "Sub domain for this function."),   
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
