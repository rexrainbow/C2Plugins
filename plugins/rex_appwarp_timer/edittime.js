function GetPluginSettings()
{
	return {
		"name":			"Timer",
		"id":			"Rex_Appwarp_Timer",
		"version":		"0.1",        
		"description":	"Timer service. http://api.shephertz.com/app42-docs/timer-service/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_appwarp_timer.html",
        "category":		"Rex - Web - appwarp",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated,
		"dependency":	"App42-all-2.9.1.min.js"		
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get current time successfully", "Current time", 
            "On get current time successfully", 
            "Triggered when get current time successfully.", "OnGetCurrentTimeSuccessfully");
            
AddCondition(2, cf_trigger, "On get current time error", "Current time", 
            "On get current time error", 
            "Triggered when get current time error.", "OnGetCurrentTimeError");

AddCondition(11, cf_trigger, "On create Or update timer successfully", "Timer - create Or update timer", 
            "On create Or update timer successfully", 
            "Triggered when create Or update timer successfully.", "OnCreateOrUpdateTimerSuccessfully");
            
AddCondition(12, cf_trigger, "On create Or update timer error", "Timer - create Or update timer", 
            "On create Or update timer error", 
            "Triggered when create Or update timer error.", "OnCreateOrUpdateTimerError");     
            
AddCondition(13, cf_trigger, "On start timer successfully", "Timer - start timer", 
            "On start timer successfully", 
            "Triggered when start timer successfully.", "OnStartTimerSuccessfully");
            
AddCondition(14, cf_trigger, "On start timer error", "Timer - start timer", 
            "On start timer error", 
            "Triggered when start timer error.", "OnStartTimerError");       
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Get current time", "Current time", 
          "Get current time", 
          "Fetch the current UTC time on server..", "GetCurrentTime");
      
AddStringParam("Timer name", "Name of the timer which has to be start.", '""'); 
AddNumberParam("Time", "Times in seconds upto which timer will active.", 1);    
AddAction(11, 0, "Create Or update timer", "Timer - create timer", 
          "Create Or update timer <i>{0}</i> with active time to <i>{1}</i>", 
          "Create a new timer and also update the time of existing timer.", "CreateOrUpdateTimer"); 
          
AddStringParam("Timer name", "Name of the timer which has to be start.", '""');
AddStringParam("User name", "Name of the user for whom timer count down has to be started.", '""');   
AddAction(12, 0, "Start timer", "Timer - control", 
          "Start timer <i>{0}</i> for user <i>{1}</i>", 
          "Start the timer count down for a particular user.", "StartTimer"); 

          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get current time", 
              "Current time", "CurrentTime", 
              "Result of fetching current time in unix timestamp."); 
              
AddExpression(2, ef_return_string, "Get current UTC time", 
              "Current UTC time", "CurrentUTCTime", 
              "Result of fetching current utc time.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "API Key", "", "The Application key given when the application was created."),
	new cr.Property(ept_text, "Secret Key", "", "The secret key corresponding to the application key given when the application was created. "),
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
