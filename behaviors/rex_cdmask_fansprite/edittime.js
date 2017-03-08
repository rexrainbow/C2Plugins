function GetBehaviorSettings()
{
	return {
		"name":			"CD Mask w fan sprites",
		"id":			"Rex_cdmask_fansprite",
		"description":	"Cool down mask with fan sprites. 9 Fan frames are 256,128,64,32,16,8,4,2,1 degrees",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_cdmask_fansprite.html",
		"category":		"Rex - Effect",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Pick fan sprites", "SOL", 
             "{my} pick fan sprites", "Pick fan sprites to SOL.", "PickFan");
             
//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Fan", "Fan object.");
AddAction(1, 0, "Setup fan", "Setup", 
          "{my} set fan object to <i>{0}</i>", 
          "Setup fan object.", "SetupFan");             
AddNumberParam("percentage", "Cool down percentage, 1-0", 0);
AddAction(3, 0, "Set percentage", "Mask", 
          "Set cool down percentage to <i>{0}</i>", 
          "Set cool down percentage.", "SetCoolDownPercentage"); 
AddAction(4, 0, "Pick fan sprites", "SOL", 
          "Pick fan sprites", 
          "Pick fan sprites.", "PickFan");                 
 

//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "Start angle", -90, "Start angle, in degree."),
    new cr.Property(ept_combo, "Direction", "Anti-clockwise", "Select clockwise or anticlockwise rotation.", "Anti-clockwise|Clockwise"),
    //new cr.Property(ept_combo, "Z order", "Front", "Z order of mask.", "Front|Back"),    
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
