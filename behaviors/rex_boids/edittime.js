function GetBehaviorSettings()
{
	return {
		"name":			"Boids",
		"id":			"Rex_Boids",
		"description":	"Calculate steer force by flocking algorithm.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_boids.html",
		"category":		"Rex - AI",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Has force", "Output", "{my} has force", 
             "Return true if force is not 0.", "HasForce");	 
             
//////////////////////////////////////////////////////////////
// Actions 
AddAction(1, 0, "Clean", "Force - clean", 
          "{my} Clean output force to 0", 
          "Clean output force to 0.", "CleanForce");

AddObjectParam("Neighbors", "Object of neighbors");
AddNumberParam("Distance", "Cohesion distance, in pixels, to normalize the cohesion force.", 300);
AddNumberParam("weight", "Weight of cohesion force.", 0.7);
AddAction(2, 0, "Cohesion", "Force - flocking", 
          "{my} Add cohesion force by <i>{0}</i>, with cohesion distance to <i>{1}</i> (x <i>{2}</i>)", 
          "Add cohesion force which remaining close to the centre of neighbors.", "AddCohesionForce");

AddObjectParam("Neighbors", "Object of neighbors");
AddNumberParam("weight", "Weight of alignment force.", 0.2);
AddAction(3, 0, "Alignment", "Force - flocking", 
          "{my} Add alignment force by <i>{0}</i> (x <i>{1}</i>)", 
          "Add alignment force which aligning to the average direction of neighbors.", "AddAlignmentForce");

AddObjectParam("Neighbors", "Object of neighbors");
AddNumberParam("Distance", "Separation distance, in pixels, to normalize the separation force.", 100);
AddNumberParam("weight", "Weight of separation force.", 1);
AddAction(4, 0, "Separation", "Force - flocking",
          "{my} Add separation force by <i>{0}</i>, with separation distance to <i>{1}</i> (x <i>{2}</i>)", 
          "Add separation force which retaining separation from close neighbours.", "AddSeparationForce");
                              
AddNumberParam("X", "The X co-ordinate to apply the force towards.");
AddNumberParam("Y", "The Y co-ordinate to apply the force towards.");
AddNumberParam("Force", "The force to apply.");
AddAction(21, 0, "Apply force towards position", "Forces",
          "{my} Apply force <i>{2}</i> toward (<i>{0}</i>, <i>{1}</i>)", 
          "Apply a force towards a position.", "ApplyForceToward");
          
AddNumberParam("Angle", "The angle, in degrees, to apply the force towards.");          
AddNumberParam("Force", "The force to apply.");
AddAction(22, 0, "Apply force at angle", "Forces", 
          "{my} Apply force <i>{1}</i> at angle <i>{2}</i>", 
          "Apply a force in a particular direction.", "ApplyForceAtAngle");
                    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(11, ef_return_number, "Get angle of force", "Output", "ForceAngle", "Get angle of total attracting force.");
AddExpression(12, ef_return_number, "Get magnitude of force", "Output", "ForceMagnitude", "Get magnitude of total attracting force.");
AddExpression(13, ef_return_number, "Get dx of force", "Output", "ForceDx", "Get dx of total attracting force.");
AddExpression(14, ef_return_number, "Get dy of force", "Output", "ForceDy", "Get dy of total attracting force.");

AddExpression(21, ef_return_number, "Get last position X of cohesion", "Output - cohesion", "LastCohesionX", "Get last position X of cohesion.");
AddExpression(22, ef_return_number, "Get last position Y of cohesion", "Output - cohesion", "LastCohesionY", "Get last position Y of cohesion.");
AddExpression(23, ef_return_number, "Get last angle of alignment", "Output - alignment", "LastAlignmentAngle", "Get last angle of alignment.");


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
}
