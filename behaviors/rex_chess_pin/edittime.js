function GetBehaviorSettings()
{
	return {
		"name":			"Logic Pin",	
		"id":			"rex_ChessPin",	
		"description":	"Change logic position (X, Y) with pined chess.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_chess_pin.html",
		"category":		"Rex - Board - application",
		"flags":		bf_onlyone
	};
};

////////////////////////////////////////
// Conditions		
AddCondition(0, cf_none, "Is pinned", "Pin", "{my} is pinned", "Object is currently pinned to another object.", "IsPinned");
AddCondition(1,	cf_trigger, "On logical position changed", "Logical position", 
             "On {my} logical position changed", "Triggered when logical position changed.", 
             "OnLogicalPositionChanged");
////////////////////////////////////////
// Actions
AddObjectParam("Pin to", "Choose the chess to pin to.");
AddAction(0, af_none, "Pin to chess", "Pin", "{my} Pin to {0}", "Pin the chess to another chess.", "Pin");

AddAction(1, af_none, "Unpin", "Unpin", "{my} Unpin", "Unpin the chess.", "Unpin");

AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(2, 0, "Set activated", "Enable", "Set {my} activated to <i>{0}</i>", 
          "Enable this behavior.", "SetActivated");        

AddNumberParam("UID of chess", "Choose the chess to pin to.", 0);
AddAction(3, af_none, "Pin to chess by UID ", "Pin", "{my} Pin to UID: {0}", "Pin the chess to another chess by UID.", "PinUID");
////////////////////////////////////////
// Expressions

////////////////////////////////////////
ACESDone();

////////////////////////////////////////

var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
