function GetBehaviorSettings()
{
	return {
		"name":			"Bar chart",
		"id":			"Rex_canvas_chart_bar",
		"description":	"Draw a bar chart on the canvas. The api of chart - http://www.chartjs.org/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_chart_bar.html",
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
AddStringParam("Label", "Label", '"Col"');
AddAction(2, 0, "Add label", "Chart - label", 
          "{my} Add label name to <i>{0}</i>", 
          "Add label.", "Addlabel");
AddStringParam("Data set", "Data set", '"Row"');
AddStringParam("Fill color", "Fill color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddStringParam("Stroke color", "Stroke color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,1)"');
AddAction(3, 0, "Add dataset", "Chart - dataset", 
          "{my} Add dataset, name to <i>{0}</i>, fill color to <i>{1}</i>, stroke color to <i>{2}</i>", 
          "Add dataset name and colors.", "AddDataSetCfg");  
AddStringParam("Data set", "Data set", '"Row"');
AddStringParam("Label", "Label", '"Col"');
AddNumberParam("Value", "Data value.", 0);
AddAction(4, 0, "Set data", "Chart - data", 
          "{my} Set data ( <i>{0}</i>, <i>{1}</i> ) to <i>{2}</i>", 
          "Set data.", "SetData");
AddAction(11, 0, "Clean all labels", "Chart - label", 
          "{my} Clean all labels", 
          "Clean all labels.", "CleanLabels");
AddAction(12, 0,  "Clean all datasets", "Chart - dataset", 
          "{my} Clean all datasets", 
          "Clean all datasets.", "CleanDatasets");
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
// scale grid lines
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the scale grid lines.", 1);  
AddAction(57, 0, "Enable point dot", "Configure - Scale grid lines", 
          "Set {my} scale grid lines to <b>{0}</b>", 
          "Set whether the scale grid lines is enabled.", 
          "SetEnabledScaleGridLines");
AddStringParam("Color", "Colour of the grid lines, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddNumberParam("Width", "Width of the grid lines.", 1);          
AddAction(58, 0, "Set scale grid lines", "Configure - Scale grid lines", 
          "Set {my} scale grid lines color to <b>{0}</b>, scale width to <b>{1}</b>", 
          "Set scale grid lines.", 
          "SetScaleGridLines");		  
// bar stroke
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the bar stroke.", 1);  
AddAction(59, 0, "Enable bar stroke", "Configure - Bar stroke", 
          "Set {my} bar stroke to <b>{0}</b>", 
          "Set whether the bar stroke is enabled.", 
          "SetEnabledBarStroke");
AddNumberParam("Stroke width", "Pixel width of the bar stroke.", 2);
AddNumberParam("Value spacing", "Spacing between each of the X value sets.", 5);
AddNumberParam("Dataset spacing", "Spacing between data sets within X values.", 1);                 
AddAction(60, 0, "Set bar stroke", "Configure - Bar stroke", 
          "Set {my} bar stroke width to <b>{0}</b>, value spacing to <b>{1}</b>, dataset spacing to <b>{2}</b>", 
          "Set scale properties.", 
          "SetBarStroke");          
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
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Data set", "Data set", '"Row"');
AddStringParam("Label", "Label", '"Col"');
AddExpression(1, ef_return_number, "Get data", 
              "Chart - data", "Data", 
              "Get data.");                 
                           
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
    new cr.Property(ept_text, "Scale line color", "rgba(0,0,0,.1)", "Colour of the scale line."),
    new cr.Property(ept_float, "Scale line width", 1, "Pixel width of the scale line."),
	
	// scale labels
    new cr.Property(ept_combo, "Scale show labels", "Yes", "Show labels on the scale.", "No|Yes"),	
	new cr.Property(ept_text, "Scale label", "<%=value%>", "Interpolated JS string - can access value."),
	new cr.Property(ept_text, "Scale font family", "Arial", "Scale label font declaration for the scale label."),	
    new cr.Property(ept_float, "Scale font size", 12, "Scale label font size in pixels."),	
    new cr.Property(ept_combo, "Scale font style", "Normal", "Scale label font weight style.", "Normal|Bold|Bolder"),	
	new cr.Property(ept_text, "Scale font color", "#666", "Scale label font colour."),    
	
	// scale grid lines
	new cr.Property(ept_combo, "Scale show grid lines", "Yes", "Whether grid lines are shown across the chart.", "No|Yes"),
    new cr.Property(ept_text, "Scale grid line color", "rgba(0,0,0,.05)", "Colour of the grid lines."),
    new cr.Property(ept_float, "Scale grid line width", 1, "Width of the grid lines."),

	// bar stroke
    new cr.Property(ept_combo, "Bar stroke", "Yes", "Show a stroke on each bar.", "No|Yes"),	
    new cr.Property(ept_float, "Bar stroke width", 2, "Pixel width of the bar stroke."),
    new cr.Property(ept_float, "Bar value spacing", 5, "Spacing between each of the X value sets."),
    new cr.Property(ept_float, "Bar dataset spacing", 1, "Spacing between data sets within X values."),
        
	// animation
	new cr.Property(ept_combo, "Animation", "Yes", "Animate the chart.", "No|Yes"),	
	new cr.Property(ept_combo, "Animation easing", "EaseOutQuart", "Animate the chart.", "Linear|EaseInQuad|EaseOutQuad|EaseInOutQuad|EaseInCubic|EaseOutCubic|EaseInOutCubic|EaseInQuart|EaseOutQuart|EaseInOutQuart|EaseInQuint|EaseOutQuint|EaseInOutQuint|EaseInSine|EaseOutSine|EaseInOutSine|EaseInExpo|EaseOutExpo|EaseInOutExpo|EaseInCirc|EaseOutCirc|EaseInOutCirc|EaseInElastic|EaseOutElastic|EaseInOutElastic|EaseInBack|EaseOutBack|EaseInOutBack|EaseInBounce|EaseOutBounce|EaseInOutBounce"),
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
