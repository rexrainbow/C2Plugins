function GetBehaviorSettings()
{
	return {
		"name":			"Pie chart",
		"id":			"Rex_canvas_chart_pie",
		"description":	"Draw a pie chart on the canvas. The api of chart - http://www.chartjs.org/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_chart_pie.html",
		"category":		"Rex - Canvas - Chart.js",
		"flags":		0,	
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On drawing finished", "Drawing", 
             "On {my} drawing finished", "Triggered when drawing finished.", 
             "OnDrawingFinished");           
AddCondition(2,	0, "Is drawing", "Drawing", 
             "Is {my} drawing", "Return true while drawing.", 
             "IsDrawing");            
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Draw", "Draw", 
          "{my} Draw chart", 
          "Draw chart.", "DrawChart");
AddNumberParam("Value", "Data value.", 0);
AddStringParam("Color", "Color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddAction(4, 0, "Add data", "Chart - data", 
          "{my} Add data value to <i>{0}</i>, with color to <i>{1}</i>", 
          "Add data.", "AddData");  
AddAction(13, 0,  "Clean all data", "Chart - data", 
          "{my} Clean all data", 
          "Clean all data.", "CleanData");	

// configure    	  
// segment stroke
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the segment stroke.", 1);  
AddAction(59, 0, "Enable bar stroke", "Configure - Segment stroke", 
          "Set {my} segment stroke to <b>{0}</b>", 
          "Set whether the segment stroke is enabled.", 
          "SetEnabledSegmentStroke");
AddStringParam("Color", "Stroke color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddNumberParam("Width", "Stroke width.", 2);                 
AddAction(60, 0, "Set segment stroke", "Configure - Segment stroke", 
          "Set {my} segment stroke color to <b>{0}</b>, width to <b>{1}</b>", 
          "Set segment stroke.", 
          "SetSegmentStroke");          
// animation
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the animation.", 1);  
AddAction(66, 0, "Enable animation", "Configure - Animation", 
          "Set {my} animation to <b>{0}</b>", 
          "Set whether the animation is enabled.", 
          "SetEnabledAnimation");
AddNumberParam("Duration", "Duration of animation in seconds.", 1);    
AddAction(67, 0, "Set duration", "Configure - Animation", 
          "Set {my} animation duration to <b>{0}</b>", 
          "Set animation duration.", 
          "SetAnimationDuration");
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("Rotate", "Set whether to animate the rotation of the Pie.", 1);  
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("Scale", "Set whether to animate scaling the Pie from the centre.", 1);  
AddAction(68, 0, "Enable animation type", "Configure - Animation", 
          "Set {my} rotation animation to <b>{0}</b>, scaling animation to <b>{1}</b>", 
          "Set whether the animation types are enabled.", 
          "SetEnabledAnimationType");          
//////////////////////////////////////////////////////////////
// Expressions             
                           
ACESDone();

// Property grid properties for this plugin
var property_list = [
	// segment stroke
    new cr.Property(ept_combo, "Segment stroke", "Yes", "Show a stroke on each segment.", "No|Yes"),	
    new cr.Property(ept_text, "Segment stroke color", "#fff", "The colour of each segment stroke."),
    new cr.Property(ept_float, "Segment stroke width", 2, "The width of each segment stroke."),
        
	// animation
	new cr.Property(ept_combo, "Animation", "Yes", "Animate the chart.", "No|Yes"),	
	new cr.Property(ept_combo, "Animation easing", "EaseOutBounce", "Animate the chart.", "Linear|EaseInQuad|EaseOutQuad|EaseInOutQuad|EaseInCubic|EaseOutCubic|EaseInOutCubic|EaseInQuart|EaseOutQuart|EaseInOutQuart|EaseInQuint|EaseOutQuint|EaseInOutQuint|EaseInSine|EaseOutSine|EaseInOutSine|EaseInExpo|EaseOutExpo|EaseInOutExpo|EaseInCirc|EaseOutCirc|EaseInOutCirc|EaseInElastic|EaseOutElastic|EaseInOutElastic|EaseInBack|EaseOutBack|EaseInOutBack|EaseInBounce|EaseOutBounce|EaseInOutBounce"),
	new cr.Property(ept_combo, "Animate rotate", "Yes", "Animate the rotation of the Pie.", "No|Yes"),
	new cr.Property(ept_combo, "Animate scale", "No", "Animate scaling the Pie from the centre.", "No|Yes"),	
	new cr.Property(ept_float, "Duration", 1, "Duration of animation in seconds."),
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
