function GetBehaviorSettings()
{
	return {
		"name":			"Beat Counter",
		"id":			"Rex_betCounter",
		"description":	"Get beat count in latest duration.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_betCounter.html",
		"category":		"Rex - Attributes",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Count", "Bet count.");
AddCondition(0, 0, "Compare bet count", "Value", "{my} bet count {0} {1}", "Compare the bet count.", "CompareBetCount");
AddCondition(1, cf_trigger, "On value changed", "Value", "On {my} value changed", "Triggered when value changed.", "OnValueChanged");
AddNumberParam("From", "Value changed from.", 0);
AddNumberParam("To", "Value changed to.", 1);
AddCondition(2, cf_trigger, "On value changed from ...to ...", "Value", 
             "On {my} value changed from <i>{0}</i> to <i>{1}</i>", "Triggered when value changed.", "OnValueChanged");

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Count", "Bet count.", 1);
AddAction(0, 0, "Beat", "Beat", 
          "{my} beat <i>{0}</i>", "Increase beat counter.", "Beat");  
          
AddAction(1, 0, "Clean", "Beat", 
          "{my} clean", "Clean beat counter.", "Clean");            

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_deprecated | ef_return_number, "Get bet count", "Bet count", "BetCount", "Get bet count.");
AddExpression(1, ef_return_number, "Get beat count", "Beat count", "BeatCount", "Get beat count.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_float,	"Interval",	1, "Count interval, in second.")
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
