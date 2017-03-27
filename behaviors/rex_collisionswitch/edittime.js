function GetBehaviorSettings()
{
	return {
		"name":			"Collision switch",
		"id":			"Rex_CollisionSwitch",
		"description":	"Enable or disable collision setting.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_collisionswitch.html",
		"category":		"Rex - Collision",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(11, 0, "Collisions enabled", "Collisions", "Collisions enabled", "True if the object's collisions are enabled and will fire collision events.", "IsCollisionEnabled");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("Collisions", "Whether to enable or disable collisions for this object.");
AddAction(11, 0, "Set collisions enabled", "Collision", "Set collisions <b>{0}</b>", 
          "Set whether the object will register collision events or not.", "SetCollisions");
        
          
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo,	"Collisions", "Enabled", "Whether the object will register collision events or not.", "Disabled|Enabled")
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
