function GetBehaviorSettings()
{
	return {
		"name":			"Perspective",
		"id":			"Rex_mode7perspective",
		"description":	"Perspective instance stands on the (mode7) ground.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_mode7perspective.html",
		"category":		"Rex - Effect - mode7",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Ground", "Ground object."); 
AddAction(1, 0, "Set ground", "Ground", 
         "{my} Set ground to <i>{0}</i>", 
          "Set ground instance.", "SetGround");
          
AddNumberParam("Logic X", "Logic position X on ground.", 0);
AddAction(11, 0, "Set logic X", "Logic position", 
          "Set {my} logic X to <i>{0}</i>", 
          "Set logic position X.", "SetLX");

AddNumberParam("Logic Y", "Logic position Y on ground.", 0);
AddAction(12, 0, "Set logic Y", "Logic position", 
          "Set {my} logic Y to <i>{0}</i>", 
          "Set logic position Y.", "SetLY"); 
          
AddNumberParam("Logic X", "Logic position X on ground.", 0);
AddNumberParam("Logic Y", "Logic position Y on ground.", 0);
AddAction(13, 0, "Set logic position", "Logic position", 
          "Set {my} logic position to (<i>{0}</i> , <i>{1}</i>)", 
          "Set logic position.", "SetLXY");              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get logic X", "Logic position", "LX", 
              'Get logic posixtion X.');
AddExpression(2, ef_return_number, "Get logic Y", "Logic position", "LY", 
              'Get logic posixtion Y.');
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "Logic X", 0, "Logic position X on ground."),      
    new cr.Property(ept_float, "Logic Y", 0, "Logic position Y on ground."),      
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
