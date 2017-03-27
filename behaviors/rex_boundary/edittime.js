function GetBehaviorSettings()
{
	return {
		"name":			"Boundary",
		"id":			"Rex_boundary",
		"description":	"Clamp or wrap position.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_boundary.html",
		"category":		"Rex - Movement - position",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2,	cf_trigger, "On hit any boundary", "Hit", 
             "On {my} hit any boundary", "Triggered when object hit any boundary.", "OnHitAnyBoundary");  
AddCondition(3,	cf_trigger, "On hit left boundary", "Hit", 
             "On {my} hit left boundary", "Triggered when object hit left boundary.", "OnHitLeftBoundary"); 
AddCondition(4,	cf_trigger, "On hit right boundary", "Hit", 
             "On {my} hit right boundary", "Triggered when object hit right boundary.", "OnHitRightBoundary"); 
AddCondition(5,	cf_trigger, "On hit top boundary", "Hit", 
             "On {my} hit top boundary", "Triggered when object hit top boundary.", "OnHitTopBoundary"); 
AddCondition(6,	cf_trigger, "On hit bottom boundary", "Hit", 
             "On {my} hit bottom boundary", "Triggered when object hit bottom boundary.", "OnHitBottomBoundary"); 
             
AddComboParamOption("Any");
AddComboParamOption("Left");
AddComboParamOption("Right");
AddComboParamOption("Top");
AddComboParamOption("Bottom");
AddComboParam("Boundary", "Enable the horizontal boundary.",1);
AddCondition(12,	0, "Is hit boundary", "Hit", 
             "Is {my} hit <i>{0}</i> boundary", "Return true if object hit any boundary.", "IsHitBoundary");             
             
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Horizontal", "Enable the horizontal boundary.",1);
AddAction(3, 0, "Horizontal boundary enable", "Enable boundary", 
          "Set {my} horizontal boundary enable to <i>{0}</i>", "Enable the object's horizontal boundary.", "EnableHorizontal");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Vertical", "Enable the vertical boundary.",1);
AddAction(4, 0, "Vertical boundary enable", "Enable boundary", 
          "Set {my} vertical boundary enable to <i>{0}</i>", "Enable the object's vertical boundary.", "EnableVertical");		  
AddNumberParam("Left", "Left boundary.");
AddNumberParam("Right", "Right boundary.");
AddAction(5, 0, "Set horizontal boundary", "Set boundary", 
          "Set {my} horizontal boundary to [<i>{0}</i>, <i>{1}</i>]", "Set the object's horizontal boundary.", "SetHorizontalBoundary");
AddNumberParam("Top", "Top boundary.");
AddNumberParam("Bottom", "Bottom boundary.");
AddAction(6, 0, "Set vertical boundary", "Set boundary", 
          "Set {my} vertical boundary to [<i>{0}</i>, <i>{1}</i>]", "Set the object's vertical boundary.", "SetVerticalBoundary");         
AddObjectParam("Pin to", "Choose the object to pin to.");
AddAnyTypeParam("Left", "Name or number of image point for left boundary.");
AddAnyTypeParam("Right", "Name or number of image point for right boundary.");
AddAction(7, 0, "Set horizontal boundary to", "Set boundary to object", 
          "Set {my} horizontal boundary to <i>{0}</i> at image point [<i>{1}</i>, <i>{2}</i>]", "Set the object's horizontal boundary.", "SetHorizontalBoundaryToObject");
AddObjectParam("Pin to", "Choose the object to pin to.");
AddAnyTypeParam("Top", "Name or number of image point for top boundary.");
AddAnyTypeParam("Bottom", "Name or number of image point for bottom boundary.");
AddAction(8, 0, "Set vertical boundary to", "Set boundary to object", 
          "Set {my} vertical boundary to <i>{0}</i> at image point [<i>{1}</i>, <i>{2}</i>]", "Set the object's vertical boundary.", "SetVerticalBoundaryToObject"); 
          
AddNumberParam("Percentage", "Percentage between 0 to 1.");
AddAction(11, af_deprecated, "Set X", "Position", 
          "Set X to <i>{0}</i> of {my} horizontal boundaries", "Set the object's X position by horizontal boundaries.", "SetXByPercentage");              
AddNumberParam("Percentage", "Percentage between 0 to 1.");
AddAction(12, af_deprecated, "Set Y", "Position", 
          "Set Y to <i>{0}</i> of {my} vertical boundaries", "Set the object's Y position by percentage of vertical boundaries.", "SetYByPercentage");          
AddNumberParam("Horizontal", "Percentage of horizontal between 0 to 1.");
AddNumberParam("Vertical", "Percentage of vertical between 0 to 1.");
AddAction(13, af_deprecated, "Set psoition", "Position", 
          "Set position to (<i>{0}</i>, <i>{1}</i>) of {my} horizontal and vertical boundaries", "Set the object's position by horizontal and boundaries.", "SetYXByPercentage");              
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get horizontal boundary enable", "Enable", "HorizontalEnable", "Horizontal boundary enable setting.");
AddExpression(2, ef_return_number, "Get vertical boundary enable", "Enable", "VerticalEnable", "Vertical boundary enable setting.");
AddExpression(3, ef_return_number, "Get left boundary", "Boundary", "LeftBound", "Left boundary setting.");
AddExpression(4, ef_return_number, "Get right boundary", "Boundary", "RightBound", "Right boundary setting.");
AddExpression(5, ef_return_number, "Get top boundary", "Boundary", "TopBound", "Top boundary setting.");
AddExpression(6, ef_return_number, "Get bottom boundary", "Boundary", "BottomBound", "Bottom boundary setting.");
AddExpression(7, ef_return_number, "Get horizontal position persentage", "Persentage", "HorPercent", 
             "Get horizontal position persentage. 0 is at left boundary, 1 is at right boundary");
AddExpression(8, ef_return_number, "Get vertical position persentage", "Persentage", "VerPercent", 
              "Get vertical position persentage. 0 is at top boundary, 1 is at bottom boundary");
AddNumberParam("Left", "Left value.", 0);         
AddNumberParam("Right", "Right value.", 1);      
AddExpression(9, ef_return_number | ef_variadic_parameters, "Get horizontal scaled value", "Scaled value", "HorScale", 
              "Get horizontal scaled value between left and right value");
AddNumberParam("Top", "Minimum value.", 0);         
AddNumberParam("Bottom", "Maximum value.", 1);      
AddExpression(10, ef_return_number | ef_variadic_parameters, "Get vertical scaled value", "Scaled value", "VerScale", 
              "Get vertical scaled value between top and bottom value");              

AddNumberParam("Percentage", "Percentage between 0 to 1.");
AddExpression(11, ef_return_number, "Get position X by percentage of horizontal boundaries", "Position", "HorPercent2PosX", 
              "Get position X by percentage of horizontal boundaries");   
AddNumberParam("Percentage", "Percentage between 0 to 1.");
AddExpression(12, ef_return_number, "Get position Y by percentage of vertical boundaries", "Position", "VerPercent2PosY", 
              "Get position X by percentage of vertical boundaries"); 
              
ACESDone();

// Property grid properties for this plugin
var property_list = [        
    new cr.Property(ept_combo, "Mode", "Clamp", "Clamp or wrap the position of instance.", "Clamp|Wrap|Mod wrap"),
    new cr.Property(ept_combo, "Align", "Origin", "Align at origin or boundaries of instance. Only used for clamp or wrap mode.", "Origin|Boundaries"),	
    new cr.Property(ept_combo, "Horizontal", "No", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),	
    new cr.Property(ept_float, "Left", 0, "Left boundary."),	
	new cr.Property(ept_float, "Right", 0, "Right boundary."),	
	new cr.Property(ept_combo, "Vertical", "No", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),
	new cr.Property(ept_float, "Top", 0, "Top boundary."),	
	new cr.Property(ept_float, "Bottom", 0, "Bottom boundary."),	
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
