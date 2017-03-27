function GetBehaviorSettings()
{
	return {
		"name":			"Polar area chart",
		"id":			"Rex_canvas_chart_polarArea",
		"description":	"Draw a polar area chart on the canvas. The api of chart - http://www.chartjs.org/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_chart_polararea.html",
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
// Scale overlay
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the scale overlay.", 1);
AddAction(50, 0, "Enable scale overlay", "Configure - Scale overlay", 
          "Set {my} scale overlay to <b>{0}</b>", 
          "Set whether the scale overlay is enabled.", 
          "SetEnabledScaleOverlay");
// Scale override          
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the scale override.", 1);
AddAction(51, 0, "Enable scale overlay", "Configure - Scale override", 
          "Set {my} scale override to <b>{0}</b>", 
          "Set whether the scale override is enabled.", 
          "SetEnabledScaleOverride");   
AddNumberParam("Steps", "The number of steps in a hard coded scale.", 1);
AddNumberParam("Step width", "The value jump in the hard coded scale.", 1);
AddNumberParam("Start value", "The centre starting value.", 1);                 
AddAction(52, 0, "Set scale", "Configure - Scale override", 
          "Set {my} scale steps to <b>{0}</b>, scale step width to <b>{1}</b>, scale start value to <b>{2}</b>", 
          "Set scale properties.", 
          "SetScaleOverride");
// scale line          
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the scale line.", 1);
AddAction(53, 0, "Enable scale line", "Configure - Scale line", 
          "Set {my} scale line to <b>{0}</b>", 
          "Set whether the scale line is enabled.", 
          "SetEnabledScaleLine"); 
AddStringParam("Color", "Colour of the scale line, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddNumberParam("Width", "Pixel width of the scale line.", 1);          
AddAction(54, 0, "Set scale line", "Configure - Scale line", 
          "Set {my} scale line color to <b>{0}</b>, scale width to <b>{1}</b>", 
          "Set whether the scale line is enabled.", 
          "SetScaleLine"); 
// scale labels
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the scale labels.", 1);
AddAction(55, 0, "Enable scale labels", "Configure - Scale labels", 
          "Set {my} scale labels to <b>{0}</b>", 
          "Set whether the scale labels is enabled.", 
          "SetEnabledScaleLabels");
AddStringParam("Font family", "Scale label font declaration for the scale label.", '""Arial""');
AddNumberParam("Font size", "Scale label font size in pixels.", 12); 
AddComboParamOption("Normal");
AddComboParamOption("Bold");
AddComboParamOption("Bolder");
AddComboParam("Font style", "Scale label font weight style.", 0);
AddStringParam("Font color", "Colour of the scale line, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddAction(56, 0, "Set font", "Configure - Scale labels", 
          "Set {my} scale labels: font family to <b>{0}</b>, font size to <b>{1}</b>, font style to <b>{2}</b>, font color to <b>{3}</b>", 
          "Set font of scale labels.", 
          "SetScaleLabelsFont"); 
// scale backdrop
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the label backdrop.", 1);  
AddAction(57, 0, "Enable label backdrop", "Configure - Scale label backdrop", 
          "Set {my} label backdrop to <b>{0}</b>", 
          "Set whether the label backdrop is enabled.", 
          "SetEnabledScaleLabelBackdrop");
AddStringParam("Color", "Backdrop color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');    
AddNumberParam("Padding X", "The backdrop padding above & below the label in pixels.", 2);    
AddNumberParam("Padding Y", "The backdrop padding above & below the label in pixels.", 2);    
AddAction(58, 0, "Set label backdrop", "Configure - Scale label backdrop", 
          "Set {my} label backdrop color to <b>{0}</b>, padding X to <b>{1}</b>, padding Y to <b>{2}</b>", 
          "Set scale label backdrop.", 
          "SetScaleLabelBackdrop");  	  
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
    // scale overlay
    new cr.Property(ept_combo, "Scale overlay", "No", "Show the scale above the chart data.", "No|Yes"),

	// scale override
    new cr.Property(ept_combo, "Scale override", "No", "Override with a hard coded scale.", "No|Yes"),	
    new cr.Property(ept_float, "Scale steps", 1, "The number of steps in a hard coded scale, required if Scale override sets to Yes"),	
    new cr.Property(ept_float, "Scale step width", 1, "The value jump in the hard coded scale, required if Scale override sets to Yes"),	
    new cr.Property(ept_float, "Scale start value", 1, "The centre starting value, required if Scale override sets to Yes"),	
	
	// scale line
    new cr.Property(ept_combo, "Scale show line", "Yes", "Show lines for each scale point.", "No|Yes"),	
    new cr.Property(ept_text, "Scale line color", "rgba(0,0,0,.1)", "Colour of the scale line."),
    new cr.Property(ept_float, "Scale line width", 1, "Pixel width of the scale line."),
	
	// scale labels
    new cr.Property(ept_combo, "Scale show labels", "No", "Show labels on the scale.", "No|Yes"),	
	new cr.Property(ept_text, "Scale label", "<%=value%>", "Interpolated JS string - can access value."),
	new cr.Property(ept_text, "Scale font family", "Arial", "Scale label font declaration for the scale label."),	
    new cr.Property(ept_float, "Scale font size", 12, "Scale label font size in pixels."),	
    new cr.Property(ept_combo, "Scale font style", "Normal", "Scale label font weight style.", "Normal|Bold|Bolder"),	
	new cr.Property(ept_text, "Scale font color", "#666", "Scale label font colour."),    

	// scale backdrop
	new cr.Property(ept_combo, "Scale show label backdrop", "Yes", "Show a backdrop to the scale label.", "No|Yes"),
    new cr.Property(ept_text, "Scale backdrop color", "rgba(255,255,255,0.75)", "The colour of the label backdrop."),
    new cr.Property(ept_float, "Scale backdrop padding X", 2, "The backdrop padding above & below the label in pixels."),		
    new cr.Property(ept_float, "Scale backdrop padding Y", 2, "The backdrop padding above & below the label in pixels."),	
	
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
