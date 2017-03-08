function GetBehaviorSettings()
{
	return {
		"name":			"LJ potential",
		"id":			"Rex_LJ_potential",
		"description":	"Lennard-Jones potential formula - ( (A/r^n)-(B/r^m) ) for attracting or rejecting objects.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_lj_potential.html",
		"category":		"Rex - AI",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Has been attracted", "Target", "{my} has been attracted", 
             "Return true if target has been attracted by source.", "HasBeenAttracted");
AddCondition(2, cf_trigger, "Begin attracted", "Target", 
             "{my} Begin attracted", 
			 "Triggered when attracted beginning, to get attracted source uid.", 
			 "BeginAttracted");  
AddCondition(3, cf_trigger, "Begin attracting", "Source", 
             "{my} Begin attracting", 
			 "Triggered when attracting beginning, to get attracted target uid.", 
			 "BeginAttracting");  	
AddCondition(4, cf_trigger, "End attracted", "Target", 
             "{my} End attracted", 
			 "Triggered when attracted ending, to get attracted source uid.", 
			 "EndAttracted");  
AddCondition(5, cf_trigger, "End attracting", "Source", 
             "{my} End attracting", 
			 "Triggered when attracting end, to get attracted target uid.", 
			 "EndAttracting"); 
AddCondition(6, 0, "Has attracting", "Source", "{my} has attracting", 
             "Return true if source has attracting target.", "HasAttracting");	
	 		
AddCondition(11, 0, "Has force", "Output", "{my} has force", 
             "Return true if force is not 0.", "HasForce");	 		 
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
AddNumberParam("Range", "Sensitivity range.");
AddAction(4, 0, "Set sensitivity range", "Sensitivity", "Set {my} sensitivity range to <i>{0}</i>", 
          "Set sensitivity range for source.", "SetRange");
AddStringParam("Source tag", "Source tag.", '""');
AddAction(5, 0, "Set source tag", "Tag", "Set {my} source tag to <i>{0}</i>",
         "Set source tag.", "SetSourceTag");
AddStringParam("Target tag", "Target tag.", '""');
AddAction(6, 0, "Set target tag", "Tag", "Set {my} target tag to <i>{0}</i>",
         "Set target tag.", "SetTargetTag");    
AddComboParamOption("A");
AddComboParamOption("n");
AddComboParamOption("B");
AddComboParamOption("m");
AddComboParam("Parameter", "Parameter of LJ potential.", 0);
AddNumberParam("Value", "Value of parameter.");
AddAction(7, 0, "Set parameter", "LJ potential", "Set {my} LJ potential parameter <i>{0}</i> to <i>{1}</i>", 
          "Set parameters of LJ potential.", "SetLJParam");          
AddAction(11, 0, "Update", "Update", "Update {my} output force", 
          "Update output force.", "UpdateForce");          
AddAction(12, 0, "Clean", "Update wo tag", "Clean {my} output force to 0", 
          "Clean output force to 0.", "CleanForce");
AddObjectParam("Source", "Source for attracting or rejecting.");          
AddAction(13, 0, "Attracted by source", "Update wo tag", "Attracted {my} by source <i>{0}</i>", 
          "Attracted by source.", "AttractedBySource"); 
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get source enable", "Enable", "IsSource", "1 is source.");
AddExpression(2, ef_return_number, "Get target enable", "Enable", "IsTarget", "1 is target.");
AddExpression(4, ef_return_number, "Get sensitivity range", "Sensitivity", "Range", "Get sensitivity range.");
AddExpression(5, ef_return_number, "Get attracting source uid", "Source", "SourceUID", "Get attracting source uid.");
AddExpression(6, ef_return_number, "Get attracted target uid", "Target", "TargetUID", "Get attracted target uid.");
AddExpression(7, ef_return_string, "Get source tag", "Tag", "SourceTag", "Get source tag.");
AddExpression(8, ef_return_string, "Get target tag", "Tag", "TargetTag", "Get target tag.");
AddExpression(11, ef_return_number, "Get angle of force", "Output", "ForceAngle", "Get angle of total attracting force.");
AddExpression(12, ef_return_number, "Get magnitude of force", "Output", "ForceMagnitude", "Get magnitude of total attracting force.");
AddExpression(13, ef_return_number, "Get dx of force", "Output", "ForceDx", "Get dx of total attracting force.");
AddExpression(14, ef_return_number, "Get dy of force", "Output", "ForceDy", "Get dy of total attracting force.");

AddExpression(15, ef_return_number, "Get param A (attracting force)", "Parameters", "A", "Get param A (attracting force)");
AddExpression(16, ef_return_number, "Get param n (attracting declined)", "Parameters", "n", "Get param n (attracting declined)");
AddExpression(17, ef_return_number, "Get param B (rejecting force)", "Parameters", "B", "Get param B (rejecting force)");
AddExpression(18, ef_return_number, "Get param m (rejecting declined)", "Parameters", "m", "Get param m (rejecting declined)");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Source", "Yes", "Source for attracting or rejecting.", "No|Yes"),     
    new cr.Property(ept_text, "Source tag", "", "Target will attract or reject to sources which have the same tag."),   
    new cr.Property(ept_float, "A", 1, "Parameter A, for attracting magnitude. (A/r^n)-(B/r^m)"), 
    new cr.Property(ept_float, "n", 1, "Parameter n, for attracting declined. (A/r^n)-(B/r^m)"),   
    new cr.Property(ept_float, "B", 1, "Parameter B, for rejecting magnitude. (A/r^n)-(B/r^m)"), 
    new cr.Property(ept_float, "m", 1, "Parameter m, for rejecting declined. (A/r^n)-(B/r^m)"),  
    new cr.Property(ept_float, "Sensitivity range", 0, "Affecting when distance is less then this range. 0 is infinity. Source only."),    
    new cr.Property(ept_combo, "Target", "No", "Attract or reject to source.", "No|Yes"),    
    new cr.Property(ept_text, "Target tag", "", "Target will attract or reject to sources which have the same tag."),    
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
	if (this.properties["Gravitation range"] < 0)
		this.properties["Gravitation range"] = Math.abs(this.properties["Gravitation range"]);		
}
