function GetBehaviorSettings()
{
	return {
		"name":			"Camera follower",
		"id":			"Rex_CameraFollower",
		"description":	"Move object to follow camera with a ratio. It could be used to simulate parallax.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_camerafollower.html",
		"category":		"Rex - Movement - position",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions 
AddNumberParam("X", "Moving ratio of position X.", 1);
AddAction(1, 0, "Set moving ratio X", "Mving ratio", 
          "{my} set moving ratio X to <i>{0}</i>", "Set moving ratio of position X.", "SetMovingRatioX");

AddNumberParam("Y", "Moving ratio of position Y.", 1);
AddAction(2, 0, "Set moving ratio Y", "Mving ratio", 
          "{my} set moving ratio Y to <i>{0}</i>", "Set moving ratio of position Y.", "SetMovingRatioY");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Enable or disable following.");
AddAction(11, 0, "Set following", "Follower", 
           "{my} set following to <i>{0}</i>", 
           "Enable or disable following.", "SetFollowingEnable");      
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get moving ratio X", 
              "Mving ratio", "MovingRatioX", 
              "Get moving ratio of position X.");
AddExpression(2, ef_return_number, "Get moving ratio Y", 
              "Mving ratio", "MovingRatioY", 
              "Get moving ratio of position Y.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Type", "Follower", "Object type.", "Follower|Camera"), 
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish follower followers camera.", "No|Yes"),
	new cr.Property(ept_float, "X", 1, "Moving ratio of position X of follower."),    
	new cr.Property(ept_float, "Y", 1, "Moving ratio of position Y of follower."),
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
