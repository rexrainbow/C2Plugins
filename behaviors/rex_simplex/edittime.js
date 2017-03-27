function GetBehaviorSettings()
{
	return {
		"name":			"Simplex",
		"id":			"Rex_Simplex",
		"description":	"Adjust an object's position, size, angle or other properties with simplex 1d algorithm.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_simplex.html",
		"category":		"Rex - Movement",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions

AddCondition(0, 0, "Is active", "", "Is {my} active", "True if the movement is currently active.", "IsActive");

AddComboParamOption("Horizontal");
AddComboParamOption("Vertical");
AddComboParamOption("Size");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value only");
AddComboParamOption("Forwards/backwards");
AddComboParam("Movement", "Select the movement property to compare to.");
AddCondition(1, 0, "Compare movement", "", "{my} movement is {0}", "Compare the current sine movement property.", "CompareMovement");

AddCmpParam("Comparison", "Select how to compare the magnitude.");
AddNumberParam("Value", "Value to compare the magnitude to.");
AddCondition(3, 0, "Compare magnitude", "", "{my} magnitude {0} {1}", "Compare the current magnitude of the oscillation.", "CompareMagnitude");

//////////////////////////////////////////////////////////////
// Actions 

AddComboParamOption("Inactive");
AddComboParamOption("Active");
AddComboParam("State", "Set whether the movement is active or inactive.");
AddAction(0, af_none, "Set active", "Enable", "Set {my} <b>{0}</b>", "Enable or disable the movement.", "SetActive");
        
AddNumberParam("Magnitude", "The maximum change in pixels (or degrees for Angle).");
AddAction(1, af_none, "Set magnitude", "Magnitude", 
          "Set {my} magnitude to <b>{0}</b>", "Set the magnitude of the movement.", "SetMagnitude");

AddNumberParam("Mapping position", "The progress through noise to set.", 0);
AddAction(2, af_none, "Set mapping position", "Simplex", 
          "Set {my} mapping position to <b>{0}</b>", "Set the progress.", "SetMappingPosition");
          
AddNumberParam("Increment", "Increment of position of 1d simplex curve, in 1 second.", 4);
AddAction(3, af_none, "Set increment", "Simplex", 
          "Set {my} increment to <b>{0}</b>", "Set the increment of mapping position.", "SetIncreasement"); 

AddNumberParam("Seed", "Random seed.", 1234);
AddAction(4, af_none, "Set seed", "Simplex", 
          "Set {my} random seed to <b>{0}</b>", "Set the random seed.", "SetSeed"); 
                    
AddComboParamOption("Horizontal");
AddComboParamOption("Vertical");
AddComboParamOption("Size");
AddComboParamOption("Width");
AddComboParamOption("Height");
AddComboParamOption("Angle");
AddComboParamOption("Opacity");
AddComboParamOption("Value only");
AddComboParamOption("Forwards/backwards");
AddComboParam("Movement", "Select the movement property to compare to.");
AddAction(5, af_none, "Set movement", "Movement", 
          "Set {my} movement to <b>{0}</b>", "Set the type of movement.", "SetMovement");

AddAction(6, af_none, "Update initial state", "State", 
          "Update {my} initial state", 
          "Set the initial state to oscillate from to the current state of the object.", "UpdateInitialState");
   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get magnitude",			"Magnitude", "Magnitude",		"Return the current magnitude of the movement.");

AddExpression(2, ef_return_number, "Get mapping Position",	"Simplex", "MappingPosition",	"Return the current mapping position.");
AddExpression(3, ef_return_number, "Get increment",	         "Simplex", "Increment",	"Return the current increment.");
AddExpression(4, ef_return_number, "Get seed",	             "Simplex", "Seed",	"Return the random seed.");

AddExpression(11, ef_return_number, "Get value",			"Simplex", "Value",			"Return the current oscillating value.");
   
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, 		"Active on start",		"Yes",		"Enable the behavior at the beginning of the layout.", "No|Yes"),
	new cr.Property(ept_combo,		"Movement",				"Horizontal", "Select what property of the object to modify.", "Horizontal|Vertical|Size|Width|Height|Angle|Opacity|Value only|Forwards/backwards"),
	new cr.Property(ept_float,		"Initial",				0,			"Initial position of 1d simplex curve."),
	new cr.Property(ept_float,		"Initial random",		0,			"Add a random number to the initial position, up to this value."),
	new cr.Property(ept_float,		"Increment",		    4,		    "Increment of position of 1d simplex curve, in 1 second."),
	new cr.Property(ept_float,		"Increment random",	    0,			"Add a random number to the increment, up to this value."),
	new cr.Property(ept_float,		"Magnitude",			50,			"The maximum change in pixels, degrees, percent etc."),
	new cr.Property(ept_float,		"Magnitude random",		0,			"Add a random number to the magnitude, up to this value."),
    new cr.Property(ept_float,		"Seed",			        0,			"Random seed."),
	new cr.Property(ept_float,		"Seed random",		  100,			"Add a random number to the seed, up to this value.")	
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
