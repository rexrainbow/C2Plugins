function GetBehaviorSettings()
{
	return {
		"name":			"Turntable",
		"id":			"Rex_Turntable",
		"version":		"0.1",        
		"description":	"Spin this object to the specific angle with a deceleration.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_turntable.html",
		"category":		"Rex - Movement - angle",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target angle", "Target", 
             "On {my} hit angle", 
			 "Triggered when hit target angle.", 
			 "OnHitTarget");         
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Speed", "The speed, in degree per second, to compare the current speed to.");
AddCondition(1, 0, "Compare speed", "Speed", 
             "{my} speed {0} {1}", 
             "Compare the current speed of the object.", 
             "CompareSpeed");
AddCondition(3,	0, "Is rotating", "", "Is {my} rotating", "Is object rotating.", "IsRotating");                


//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Turns", "Number of turns.", 0);
AddComboParamOption("Anti-Clockwise");
AddComboParamOption("Clockwise");
AddComboParam("Clockwise", "Rotate clockwise or anti-clockwise.",1);
AddNumberParam("Angle", "The angle to rotate toward, in degrees which between 0 to 360.", 0);
AddNumberParam("Deceleration", "The deceleration setting, in degrees per second per second.", 180);
AddAction(1, 0, "Start spinning", "Target angle", 
          "{my} spin <i>{0}</i> turns <i>{1}</i>, stop at angle <i>{2}</i> with deceleration to <i>{3}</i>", 
          "Spin this object to the specific angle with a deceleration.", 
          "StartSpinning");
          
    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get current speed", "Current", "Speed", 
              "The current object speed, in degree per second.");
AddExpression(2, ef_return_number, "Get deceleration", "Setting", "Dec", 
              "The deceleration setting, in degree per second per second.");
AddExpression(3, ef_return_number, "Get target angle", "Target", "TargetAngle", 
              "The target angle to spin toward.");
              
         
ACESDone();

// Property grid properties for this plugin
var property_list = [	
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
	if (this.properties["Max speed"] < 0)
		this.properties["Max speed"] = 0;
		
	if (this.properties["Acceleration"] < 0)
		this.properties["Acceleration"] = 0;
		
	if (this.properties["Deceleration"] < 0)
		this.properties["Deceleration"] = 0;
}
