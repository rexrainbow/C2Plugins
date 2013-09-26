function GetBehaviorSettings()
{
	return {
		"name":			"Cooldown",
		"id":			"Rex_Cooldown",
		"version":		"1.0",        
		"description":	"Accept request when cooldown",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_cooldown.html",
		"category":		"Timer",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On call accepted", "Callback", 
             "On {my} call accepted", "Triggered when call accepted.", 
             "OnCallAccepted");
AddCondition(1,	cf_trigger, "On call rejected", "Callback", 
             "On {my} call rejected", "Triggered when call rejected.", 
             "OnCallRejected");
AddCondition(2,	cf_trigger, "On cooldown", "Callback", 
             "On {my} cooldown", "Triggered when cooldown.", 
             "OnCD");              
AddCondition(3,	cf_trigger, "On cooldown finished", "Callback", 
             "On {my} cooldown finished", "Triggered when cooldown finished.", 
             "OnCDFinished");             
AddCondition(4,	0, "Is call accepted", "If", 
             "Is {my} call accepted", "Requested call is accepted.", 
             "IsCallAccepted");
AddCondition(5,	0, "Is call rejected", "If", 
             "Is {my} call rejected", "Requested call is rejected.", 
             "IsCallRejected");
AddCondition(6, 0, "Is at cool down", "State", 
             "Is {my} at cool down", "", "IsAtCD");             

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Timeline", "Timeline object for getting timer");
AddNumberParam("Time", "Cooldown interval, in seconds", 0.1);
AddAction(0, 0, "Setup cooldown", "Setup", 
          "{my} get timer from <i>{0}</i>, cooldown interval to <i>{1}</i>", 
          "Setup cooldown.", "Setup");
AddAction(1, 0, "Request a call", "Call", 
          "Request {my} a call", 
          "Request a call.", "Request");
AddNumberParam("Time", "Cooldown interval, in seconds", 0.1);
AddAction(2, 0, "Set Cooldown interval", "Setup", 
          "Set cooldown interval to <i>{0}</i> second", 
          "Set cooldown interval, in second.", "SetCDInterval");
AddAction(3, 0, "Pause", "Control", 
          "{my} pause cooldown", 
          "Pause cooldown.", "Pause"); 
AddAction(4, 0, "Resume", "Control", 
          "{my} resume cooldown", 
          "Resume cooldown.", "Resume");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the cooldown behavior.",1);
AddAction(5, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", "Enable the object's cooldown behavior.", "SetActivated");
AddAction(6, 0, "Cancel", "Control", 
          "{my} cancel cooldown", 
          "Cancel cooldown.", "Cancel"); 
AddNumberParam("Time", "Cooldown remainder time, in seconds", 0.1);
AddAction(7, 0, "Set Cooldown remainder time", "Time", 
          "Set cooldown remainder time to <i>{0}</i> second", 
          "Set cooldown remainder time, in second. This value should smaller then cooldown interval.", "SetRemainerTime");
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get remainder time", 
              "Timer", "Remainder", 
              "Get remainder time.");
AddExpression(1, ef_return_number, "Get elapsed time of timer", 
              "Timer", "Elapsed", 
              "Get elapsed time of timer.");              
AddExpression(2, ef_return_number, "Get remainder time percentage of timer", 
              "Timer", "RemainderPercent", 
              "Get remainder time percentage of timer.");
AddExpression(3, ef_return_number, "Get elapsed time percentage of timer", 
              "Timer", "ElapsedPercent", 
              "Get elapsed time percentage of timer."); 
AddExpression(4, ef_return_number, "Get activated", "", "Activated", "The activated setting, 1 is activated.");              


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),    
    new cr.Property(ept_float, "Cooldown interval", 1, "Cooldown interval, in second."),     
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