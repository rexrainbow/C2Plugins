function GetBehaviorSettings()
{
	return {
		"name":			"Interception",
		"id":			"Rex_Interception",
		"description":	"Predict the point of intersection. It assumes that objects move with constant speed.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_interception.html",
		"category":		"Rex - AI",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Has force", "Output", "{my} has force", 
             "Return true if force is not 0.", "HasForce");	 
  
AddCondition(2, 0, "Is locking", "Target", "{my} is locking to target", 
             "Return true if locking target.", "IsLocking");	   
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Target", "Object of target");
AddAction(1, 0, "Lock", "Target", 
          "Lock to <i>{0}</i>", 
          "Lock to target instance.", "LockToInstance");
          
AddAction(2, 0, "Unlock", "Target", 
          "Unlock", 
          "Unlock target.", "Unlock");    

AddNumberParam("Target", "UID of target", 0);
AddAction(3, 0, "Lock by UID", "Target", 
          "Lock to UID: <i>{0}</i>", 
          "Lock to target instance by UID.", "LockToInstanceUID");          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get predict position X", "Output", "PredictX", "Get predict position X.");
AddExpression(2, ef_return_number, "Get predict position Y", "Output", "PredictY", "Get predict position Y.");

AddExpression(11, ef_return_number, "Get angle of force", "Output", "ForceAngle", "Get angle of total attracting force.");
AddExpression(12, ef_return_number, "Get magnitude of force", "Output", "ForceMagnitude", "Get magnitude of total attracting force.");
AddExpression(13, ef_return_number, "Get dx of force", "Output", "ForceDx", "Get dx of total attracting force.");
AddExpression(14, ef_return_number, "Get dy of force", "Output", "ForceDy", "Get dy of total attracting force.");

AddExpression(21, ef_return_number, "Get target instance UID", "Target", "TargetUID", "Get target instance UID. Return -1 if no target assigned.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Initial state", "Enabled", "Whether to initially have the behavior enabled or disabled.", "Disabled|Enabled")
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
