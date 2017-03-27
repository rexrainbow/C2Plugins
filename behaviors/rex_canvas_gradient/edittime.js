function GetBehaviorSettings()
{
	return {
		"name":			"Gradient",
		"id":			"Rex_CanvasGradient",
		"description":	"Fill gradient color at canvas.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvasgradient.html",
		"category":		"Rex - Canvas helper",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Start X", "X co-ordinate of start circle.", 0);
AddNumberParam("Start Y", "Y co-ordinate of start circle.", 0);
AddNumberParam("start radius", "Radius of start circle.", 0);
AddNumberParam("End X", "X co-ordinate of end circle.", 0);
AddNumberParam("End Y", "Y co-ordinate of end circle.", 0);
AddNumberParam("End radius", "Radius of end circle.", 0);
AddAction(1, 0, "Define radius gradient", "Gradient - radius", 
          "Define radius gradient from center ({0},{1}) and radius {2}, to center ({3},{4}) and radius {5}", 
          "Define radius gradient.", "DefineRadiusGradient");
AddNumberParam("X", "X co-ordinate of concentric circle.", 0);
AddNumberParam("Y", "Y co-ordinate of concentric circle.", 0);
AddNumberParam("start radius", "Radius of start circle.", 0);
AddNumberParam("End radius", "Radius of end circle.", 0);
AddAction(2, 0, "Define concentric circle gradient", "Gradient - radius", 
          "Define concentric circle gradient at center ({0},{1}), radius from {2} to {3}", 
          "Define concentric circle gradient.", "DefineConcentricCircleGradient"); 
                   
AddNumberParam("Start X", "X co-ordinate of start point.", 0);
AddNumberParam("Start Y", "Y co-ordinate of start point.", 0);
AddNumberParam("End X", "X co-ordinate of end point.", 0);
AddNumberParam("End Y", "Y co-ordinate of end point.", 0);
AddAction(5, 0, "Define line gradient", "Gradient - line", 
          "Define line gradient from ({0},{1}), to ({2},{3})", 
          "Define line gradient.", "DefineLineGradient");       

AddNumberParam("Center X", "X co-ordinate of center point.", 0);
AddNumberParam("Center Y", "Y co-ordinate of center point.", 0);
AddNumberParam("Width", "Width.", 0);
AddNumberParam("Height", "Height.", 0);          
AddAction(7, 0, "Define by center", "Filled area", 
          "Define filled area at center ({0},{1}), width to {2} and height to {3}", 
          "Define filled area.", "DefineFilledAreaAtC");              
AddNumberParam("Left-top X", "X co-ordinate of left-top point.", 0);
AddNumberParam("Left-top Y", "Y co-ordinate of left-top point.", 0);
AddNumberParam("Width", "Width.", 0);
AddNumberParam("Height", "Height.", 0);          
AddAction(8, 0, "Define by left-top", "Filled area", 
          "Define filled area at left-top ({0},{1}), width to {2} and height to {3}", 
          "Define filled area.", "DefineFilledAreaAtLT");    
          
AddNumberParam("Offset", "Offset, from 0 to 1.", 0);
AddStringParam("color", "Use color name, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", "\"black\"");
AddAction(9, 0, "Define color stop", "Color stop", 
          "Define color stop at offset to {0}, color to {1}", 
          "Define color stop.", "DefineColorStop");        
AddAction(10, 0, "Draw gradient", "Draw", 
          "Draw gradient", 
          "Draw gradient.", "DrawGradient");
         
//////////////////////////////////////////////////////////////
// Expressions

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
