function GetBehaviorSettings()
{
	return {
		"name":			"Spline",
		"id":			"Rex_Spline",
		"description":	"Move Sprite along a spline path.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_spline.html",
		"category":		"Rex - Movement - position",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On reach last point", "Reach", 
             "On {my} reach last point", 
			 "Triggered when reach last point.", 
			 "OnHitTarget");               
             
AddCondition(1,	0, "Is moving", "", "Is {my} moving", "Is object moving.", "IsMoving");               

AddCondition(2, cf_trigger, "On reach any point", "Reach", 
             "On {my} reach any point", 
			 "Triggered when reach any point.", 
			 "OnHitAnyPoint"); 
//////////////////////////////////////////////////////////////
// Actions 
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.", 1);
AddAction(0, 0, "Set enabled", "Enable", "Set {my} <b>{0}</b>", 
		  "Set whether this behavior is enabled. It will also pause current moving.", "SetEnabled");
		  
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.", 1);
AddAction(1, 0, "Enable set angle", "Enable", "<b>{0}</b> {my} set angle", 
		  'Enable or disable "Set angle property".', "SetAngleEnabled");		  
          
AddNumberParam("X", "The X co-ordinate of this point.", 0);
AddNumberParam("Y", "The Y co-ordinate of this point.", 0);
AddAction(2, af_none, "Add point", "Path", 
          "{my} add point (<i>{0}</i>, <i>{1}</i>)", 
          "Add a point on the spline path to go through.", 
          "AddPoint");
          
AddNumberParam("Index", "Index of point.", 0);          
AddNumberParam("X", "The X co-ordinate of this point.", 0);
AddNumberParam("Y", "The Y co-ordinate of this point.", 0);
AddAction(3, af_none, "Reset position", "Path", 
          "{my} reset position of point <i>{0}</i> to (<i>{1}</i>, <i>{2}</i>)", 
          "Reset position of point. Can not reset current moving segment.", 
          "ResetPoint");         

AddAction(4, af_none, "Clean all points", "Path", 
          "{my} clean all points", 
          "Clean all points. It will stop current moving.", 
          "CleanAll");
                   
AddAction(11, 0, "Start", "Move", 
          "{my} start moving", 
          "Start moving.", "Start");
          
AddAction(12, 0, "Stop", "Move", 
          "{my} stop moving", 
          "Stop moving.", "Stop");          
          
          
AddNumberParam("Speed", "Speed, in pixel per second.", 400);
AddAction(51, 0, "Set speed", "Speed", 
          "Set {my} speed to <i>{0}</i>", 
          "Set the object's speed.", "SetSpeed");                    
          
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Enable", "Enable to connect last point to start point.", 1);
AddAction(61, 0, "Set looping", "Enable", "Set {my} looping to <b>{0}</b>", 
          "Enable or disable looping.", "SetLooping");    

AddNumberParam("Tension", "Tension of curve.", 0.5);
AddAction(71, 0, "Set tension", "Tension", 
          "Set {my} tension to <i>{0}</i>", 
          "Set tension of curve.", "SetTension");          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get speed", "Speed", "Speed", 
              "The current object speed, in pixels per second.");           
AddExpression(2, ef_return_number, "Get tension", "Tension", "Tension", 
              "The tension of curve.");      
AddExpression(3, ef_return_number, "Get angle of motion", "Angle", "AngleOfMotion", 
              "Get angle of motion.");                    

AddExpression(11, ef_return_any | ef_variadic_parameters, "Get points or a point or x/y of a point", "Point", "Point", 
              'Get points or a point or x/y of a point. Add 1st parameter for index of point, add 2nd parameter "x" or "y" or 0 or 1 to get x/y of a point.');              
AddExpression(12, ef_return_number | ef_variadic_parameters, "Get start point index of current segment, or x/y of that point", "Current segment", "CurSegP0", 
              'Get start point index of current segment. Add 2nd parameter "x" or "y" or 0 or 1 to get x/y of a point.');
AddExpression(13, ef_return_number |ef_variadic_parameters, "Get end point index of current segment, or x/y of that point", "Current segment", "CurSegP1", 
              'Get end point index of current segment Add 2nd parameter "x" or "y" or 0 or 1 to get x/y of a point.');                
AddExpression(14, ef_return_number, "Get amount of points", "Point", "PointsCount", 
             "Get amount of points.");      

AddExpression(31, ef_return_number, "Get traveled distance", "Distance", "TraveledDistance", 
              "Traveled distance, in pixels.");

ACESDone();

// Property grid properties for this plugin
var property_list = [    
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),    
	new cr.Property(ept_float, "Speed", 400, "Speed, in pixel per second."),
	new cr.Property(ept_combo, "Set angle", "No", "Set the object's angle to the angle of motion.", "No|Yes"),    
	new cr.Property(ept_combo, "Looping", "No", "Enable to connect last point to start point.", "No|Yes"),        
	new cr.Property(ept_float, "Tension", 0.5, "Tension of curve."),      
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
