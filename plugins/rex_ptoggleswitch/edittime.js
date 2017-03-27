function GetPluginSettings()
{
	return {
		"name":			"Toggle switch",
		"id":			"Rex_pToggleSwitch",
		"version":		"0.1",        
		"description":	"A switch for toggling between on and off.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_pToggleSwitch.html",
		"category":		"Rex - Variable",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On turn on", "Event", "On {my} turn on", "", "OnTurnOn");
AddCondition(1, cf_trigger, "On turn off", "Event", "On {my} turn off", "", "OnTurnOff");
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
