function GetBehaviorSettings()
{
	return {
		"name":			"PID Torque",
		"id":			"Rex_physics_torque",
		"description":	"Torque to approach the target speed using by PI controller, standed on physics behavior.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropboxusercontent.com/u/5779181/C2Repo/rex_physics_torque.html",
		"category":		"Physics helper",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
	 		 
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "Configure", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's PID Torque behavior.", "SetActivated");
AddNumberParam("Target speed", "Target speed for approach.", 180);
AddAction(2, 0, "Set target speed", "Configure", "Set {my} target speed to <i>{0}</i>", 
          "Set target speed.", "SetTargetSpeed");
AddNumberParam("Max force", "Maximum force.", 300);
AddAction(3, 0, "Set max force", "Configure", "Set {my} max force to <i>{0}</i>", 
          "Set maximum force.", "SetMaxForce");
AddNumberParam("Kp", "Kp of PID controller.", 1);
AddAction(10, 0, "Set Kp", "PID controller", "Set {my} Kp to <i>{0}</i>", 
          "Set Kp.", "SetKp");
AddNumberParam("Ki", "Ki of PID controller.", 1);
AddAction(11, 0, "Set Ki", "PID controller", "Set {my} Ki to <i>{0}</i>", 
          "Set Ki.", "SetKi");  
AddNumberParam("Kd", "Kd of PID controller.", 1);
AddAction(12, 0, "Set Kd", "PID controller", "Set {my} Kd to <i>{0}</i>", 
          "Set Kd.", "SetKd");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get target speed", "Configure", "TargetSpeed", "Get target speed.");
AddExpression(2, ef_return_number, "Get max force", "Configure", "MaxForce", "Get max force.");
AddExpression(3, ef_return_number, "Get current applied force", "State", "CurForce", "Get current applied force.");
AddExpression(10, ef_return_number, "Get Kp", "PID controller", "Kp", "Get Kp.");
AddExpression(11, ef_return_number, "Get Ki", "PID controller", "Ki", "Get Ki.");
AddExpression(12, ef_return_number, "Get Kd", "PID controller", "Kd", "Get Kd.");


ACESDone();

// Property grid properties for this plugin
var property_list = [  
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                 
    new cr.Property(ept_float, "Target speed", 180, "Target speed for approach."),
	new cr.Property(ept_float, "Max force", 300, "Maximum force."),
    new cr.Property(ept_float, "PID - Kp", 1, "Kp of PID controller."),
	new cr.Property(ept_float, "PID - Ki", 0.01, "Ki of PID controller."),
	new cr.Property(ept_float, "PID - Kd", 0, "Kd of PID controller."),	
	new cr.Property(ept_float, "PID - Reset-windup", 1, "Reset-windup when percent of error is larger then this value. 0 is ignord reset-windup."),	
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
	if (this.properties["Max force"] < 0)
		this.properties["Max force"] = Math.abs(this.properties["Max force"]);	
	if (this.properties["PI - Kp"] < 0)
		this.properties["PI - Kp"] = Math.abs(this.properties["PI - Kp"]);		
	if (this.properties["PI - Ki"] < 0)
		this.properties["PI - Ki"] = Math.abs(this.properties["PI - Ki"]);
	if (this.properties["PI - Kd"] < 0)
		this.properties["PI - Kd"] = Math.abs(this.properties["PI - Kd"]);		
		
	if (this.properties["PID - Reset-windup"] < 0)
		this.properties["PID - Reset-windup"] = 0;							
}
