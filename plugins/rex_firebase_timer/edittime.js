function GetPluginSettings()
{
	return {
		"name":			"Timer",
		"id":			"Rex_Firebase_Timer",
		"version":		"0.1",        
		"description":	"Get elapsed interval from firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_timer.html",
		"category":		"Rex - Web - Firebase - date",
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
            
AddCondition(3, cf_trigger, "On get timer", "Get timer", 
            "On get timer",
            "Triggered when get timer.", "OnGetTimerComplete");

AddCondition(4, cf_trigger, "On get timer error", "Get timer", 
            "On get timer error",
            "Triggered when get timer error.", "OnGetTimerError"); 
            
AddCondition(5, cf_trigger, "On remove timer complete", "Remove timer", 
            "On remove timer complete",
            "Triggered when remove timer complete.", "OnRemoveTimerComplete");

AddCondition(6, cf_trigger, "On remove timer error", "Remove timer", 
            "On remove timer error",
            "Triggered when remove timer error.", "OnRemoveTimerError");

AddCondition(21, 0, "Is time-out", "Time out", 
            "Is time-out",
            'Return true if current triggered timer is time-out under "Condition: On get timer".', "IsTimeOut");
            
AddCondition(22, 0, "Is valid", "Valid", 
            "Is valid",
            "Return true if get valid timer.", "IsValid");            
            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddNumberParam("Interval", "Time-out interval, in seconds.", 0);     
AddAction(1, 0, "Start", "Timer", 
          "Start timer <i>{1}</i> of user ID: <i>{0}</i>, with time-out interval to <i>{2}</i>", 
          "Start timer.", "StartTimer");
          
AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddNumberParam("Interval", "Time-out interval, in seconds, for starting timer.", 0); 
AddAction(2, 0, "Get or start", "Timer", 
          "Get timer <i>{1}</i> of user ID: <i>{0}</i>, or start timer with time-out interval to <i>{2}</i>", 
          "Get timer.", "GetTimer");
          
AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddAction(3, 0, "Remove", "Timer", 
          "Remove timer <i>{1}</i> of user ID: <i>{0}</i>", 
          "Remove timer.", "RemoveTimer");    

AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddAction(4, 0, "Get", "Timer", 
          "Get timer <i>{1}</i> of user ID: <i>{0}</i>", 
          "Get timer.", "GetTimer");          
          
AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddNumberParam("Interval", "Time-out interval, in seconds, for starting timer.", 0); 
AddAction(11, 0, "Start on disconnect", "On disconnect",  
          "Start timer <i>{1}</i> of user ID: <i>{0}</i> when disconnected, with time-out interval to <i>{2}</i>.", 
          "Start timer when disconnected.", "StartTimerWhenDisconnect");  

AddStringParam("User ID", "User ID.", '""');
AddStringParam("Timer", "Name of timer.", '""');
AddAction(12, 0, "Delete on disconnect", "On disconnect",  
          "Delete timer <i>{1}</i> of user ID: <i>{0}</i> when disconnected.", 
          "Delete timer when disconnected.", "DeleteTimerWhenDisconnect");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_deprecated | ef_return_string, "Get user ID", "Timer", "LastUserID", 
              "Get user ID of last triggered timer");
AddExpression(2, ef_return_string, "Get timer name", "Timer", "LastTimerName", 
              "Get timer name of last triggered timer");
AddExpression(3, ef_return_number, "Get start timestamp", "Timer", "LastStartTimestamp", 
              'Get start timestamp of last triggered timer under "Condition: On get timer".');
AddExpression(4, ef_return_number, "Get current timestamp", "Timer", "LastCurrentTimestamp", 
              'Get current timestamp of last triggered timer under "Condition: On get timer".');          
AddExpression(5, ef_return_number, "Get elapsed time", "Timer", "LastElapsedTime", 
              'Get elapsed time (current - start) of last triggered timer under "Condition: On get timer", in seconds.');               
AddExpression(6, ef_return_number, "Get time-out interval", "Timer", "LastTimeoutInterval", 
              'Get time-out interval of last triggered timer under "Condition: On get timer", in seconds.'); 
AddExpression(7, ef_return_number, "Get remain interval", "Timer", "LastRemainInterval", 
              'Get   interval of last triggered timer under "Condition: On get timer", in seconds.');      
AddExpression(8, ef_return_string, "Get owner ID", "Timer", "LastOwnerID", 
              "Get owner ID of last triggered timer");
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
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
