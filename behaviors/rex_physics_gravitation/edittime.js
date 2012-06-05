function GetBehaviorSettings()
{
	return {
		"name":			"Gravitation",
		"id":			"Rex_physics_gravitation",
		"description":	"Local gravitation, standed on physics behavior.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Attributes",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Has been inhaled", "", "{my} has been inhaled", 
             "Target has been inhaled by source.", "Inhaled");
AddCondition(2, cf_trigger, "On inhaled", "", 
             "On {my} inhaled", 
			 "Triggered when inhaled, to get inhaled source uid.", 
			 "OnInhaled");  

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Source", "Enable to be source.",1);
AddAction(1, 0, "Set source enable", "Activated", "Set {my} source enable to <i>{0}</i>", 
          "Enable to be a gravitation source.", "SetSourceActivated");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Target", "Enable to be target.",1);
AddAction(2, 0, "Set target enable", "Activated", "Set {my} target enable to <i>{0}</i>", 
          "Enable to be a gravitation target.", "SetTargetActivated");
AddNumberParam("Force", "Gravitation force.");
AddAction(3, 0, "Set force", "", "Set {my} force to <i>{0}</i>", 
          "Set applied force for source.", "SetForce");
AddNumberParam("Range", "Sensitivity range.");
AddAction(4, 0, "Set sensitivity range", "", "Set {my} sensitivity range to <i>{0}</i>", 
          "Set sensitivity range for source.", "SetRange");
AddStringParam("Source tag", "Source tag.", '""');
AddAction(5, 0, "Set source tag", "Tag", "Set {my} source tag to <i>{0}</i>",
         "Set source tag.", "SetSourceTag");
AddStringParam("Target tag", "Target tag.", '""');
AddAction(6, 0, "Set target tag", "Tag", "Set {my} target tag to <i>{0}</i>",
         "Set target tag.", "SetTargetTag");         

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get source enable", "Enable", "IsSource", "1 is source.");
AddExpression(2, ef_return_number, "Get target enable", "Enable", "IsTarget", "1 is target.");
AddExpression(3, ef_return_number, "Get force", "", "Force", "Get applied force.");
AddExpression(4, ef_return_number, "Get sensitivity range", "", "Range", "Get sensitivity range.");
AddExpression(5, ef_return_number, "Get inhaled source uid", "Source", "SourceUID", "Get inhaled source uid.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Source", "Yes", "Gravitation source.", "No|Yes"),     
    new cr.Property(ept_text, "Source tag", "", "Target will be attracted with souces which have the same tag."),   
    new cr.Property(ept_float, "Force", 1, "Appling force to target. Source only."),    
    new cr.Property(ept_float, "Sensitivity range", 0, "Appling force when distance is less then this range. 0 is infinity. Source only."),    
    new cr.Property(ept_combo, "Traget", "No", "Gravitated by source.", "No|Yes"),    
    new cr.Property(ept_text, "Target tag", "", "Target will be attracted with souces which have the same tag."),     
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
	if (this.properties["Gravitation force"] < 0)
		this.properties["Gravitation force"] = Math.abs(this.properties["Gravitation force"]);
	if (this.properties["Gravitation range"] < 0)
		this.properties["Gravitation range"] = Math.abs(this.properties["Gravitation range"]);		
}
