function GetBehaviorSettings()
{
	return {
		"name":			"Trigger touch",
		"id":			"Rex_TriggerTouch",
		"description":	"Trigger touch events manually.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_triggertouch.html",
		"category":		"Rex - Touch",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Is touching", "State", "{my} is touching", 
             "Return true if touching", "IsTouching");
             
//////////////////////////////////////////////////////////////
// Actions 
AddNumberParam("Identifier", "Identifier of touch event.", 0);    
AddAction(1, 0, "Set identifier", "Identifier", 
          "Set identifier to <i>{0}</i>", 
          "Set identifier.", "SetIdentifier");
          
AddComboParamOption("start");
AddComboParamOption("end");          
AddComboParam("Type", "Trigger type.",0);
AddAction(11, 0, "Trigger touch event", "Trigger", 
          "{my} <i>{0}</i>", 
          "Trigger touch event.", "TriggerTouchEvent");
          
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [    
	new cr.Property(ept_combo, "Touch start", "Yes", "Enable if you wish touch starting to begin at the start of the layout.", "No|Yes"),
	new cr.Property(ept_integer, "Identifier", 0, "Identifier of touch event."),
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
