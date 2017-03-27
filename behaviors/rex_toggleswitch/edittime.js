function GetBehaviorSettings()
{
	return {
		"name":			"Toggle switch",
		"id":			"Rex_ToggleSwitch",
		"description":	"A switch for toggling between on and off.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_toggleswitch.html",
		"category":		"Rex - Variable",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On turn on", "Event", "On {my} turn on", "Triggered when turn on.", "OnTurnOn");
AddCondition(1, cf_trigger, "On turn off", "Event", "On {my} turn off", "Triggered when turn off.", "OnTurnOff");
AddCondition(2, 0, "Is turn on", "If", "Is turn on", "", "IsTurnOn");

//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Toggle switch", "Toggle", 
          "Toggle {my}","Toggle switch between on and off.", "ToogleValue");  
AddComboParamOption("Off");
AddComboParamOption("On");
AddComboParam("Value", "Set value to.",0);
AddAction(1, 0, "Set value", "Set", 
          "Set {my} value to <i>{0}</i>", "Set value of switch.", "SetValue");
AddNumberParam("Value", "Set value. 0 = Off, 1 = On",0);
AddAction(2, 0, "Set value by number", "Set", 
          "Set {my} value to <i>{0}</i>", "Set value of switch.", "SetValue");          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get value of switch", "Value", "Value", "Get value of switch.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Initial value", "Off", "Set the initialize value of switch.", "Off|On"),
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
