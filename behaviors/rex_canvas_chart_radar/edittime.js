function GetBehaviorSettings()
{
	return {
		"name":			"Radar chart",
		"id":			"Rex_canvas_chart_radar",
		"description":	"Draw a radar chart on the canvas. The api of chart - http://www.chartjs.org/",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_canvas_chart_radar.html",
		"category":		"Canvas",
		"flags":		0,
		"dependency":	"Chart.js"		
	};
};

//////////////////////////////////////////////////////////////
// Conditions
//AddCondition(1,	cf_trigger, "On drawing finished", "Drawing", 
//             "On {my} drawing finished", "Triggered when drawing finished.", 
//             "OnFinished");           
             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Plot", "Plot", 
          "{my} Plot", 
          "Plot chart.", "PlotChart");
AddStringParam("Label", "Label", '"Col"');
AddAction(2, 0, "Add label", "Chart - label", 
          "{my} Add label name to <i>{0}</i>", 
          "Add label.", "Addlabel");
AddStringParam("Data set", "Data set", '"Row"');
AddStringParam("Fill color", "Fill color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,0.5)"');
AddStringParam("Stroke color", "Stroke color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,1)"');
AddStringParam("Point color", "Point color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"rgba(220,220,220,1)"');
AddStringParam("Point stroke color", "Point stroke color, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", '"#fff"');
AddAction(3, 0, "Add dataset", "Chart - dataset", 
          "{my} Add dataset, name to <i>{0}</i>, fill color to <i>{1}</i>, stroke color to <i>{2}</i>, point color to <i>{3}</i>, point stroke color to <i>{4}</i>", 
          "Add dataset name and colors.", "AddDataSetCfg");  
AddStringParam("Label", "Label", '"Col"');
AddStringParam("Data set", "Data set", '"Row"');
AddNumberParam("Value", "Data value.", 0);
AddAction(4, 0, "Set data", "Chart - data", 
          "{my} Set data ( <i>{0}</i> , <i>{1}</i> ) to <i>{2}</i>", 
          "Set data.", "SetData");
AddAction(11, 0, "Clean all labels", "Chart - label", 
          "{my} Clean all labels", 
          "Clean all labels. It will also clean datasets and data.", "CleanLabels");
AddAction(12, 0,  "Clean all datasets", "Chart - dataset", 
          "{my} Clean all datasets", 
          "Clean all datasets. It will also clean data.", "CleanDatasets");
AddAction(13, 0,  "Clean all data", "Chart - data", 
          "{my} Clean all data", 
          "Clean all data.", "CleanData");		  
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Label", "Label", '"Col"');
AddStringParam("Data set", "Data set", '"Row"');
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
    new cr.Property(ept_combo, "Scale show label backdrop", "Yes", "Show a backdrop to the scale label.", "No|Yes"),
	
	// scale backdrop
    new cr.Property(ept_text, "Scale backdrop color", "rgba(255,255,255,0.75)", "The colour of the label backdrop."),
    new cr.Property(ept_float, "Scale backdrop padding X", 2, "The backdrop padding above & below the label in pixels."),		
    new cr.Property(ept_float, "Scale backdrop padding Y", 2, "The backdrop padding above & below the label in pixels."),	
	
	// angle line
    new cr.Property(ept_combo, "Angle show line-out", "Yes", "Show the angle lines out of the radar.", "No|Yes"),
    new cr.Property(ept_text, "Angle line color ", "rgba(0,0,0,.1)", "Colour of the angle line."),
    new cr.Property(ept_float, "Angle line width", 1, "Pixel width of the angle line."),
	
	// point label
	new cr.Property(ept_text, "Point label font family", "Arial", "Point label font declaration."),	
    new cr.Property(ept_float, "Point label font size", 12, "Point label font size in pixels."),	
    new cr.Property(ept_combo, "Point label font style", "Normal", "Point label font weight.", "Normal|Bold|Bolder"),	
	new cr.Property(ept_text, "Point label font color ", "#666", "Point label font colour."),
	
	// point dot
    new cr.Property(ept_combo, "Point dot", "Yes", "Show a dot for each point.", "No|Yes"),	
    new cr.Property(ept_float, "Point dot radius", 3, "Radius of each point dot in pixels."),
    new cr.Property(ept_float, "Point dot stroke width", 1, "Pixel width of point dot stroke."),
    
	// dataset
	new cr.Property(ept_combo, "Dataset stroke", "Yes", "Show a stroke for datasets.", "No|Yes"),	
    new cr.Property(ept_float, "Dataset stroke width", 2, "Pixel width of dataset stroke."),
	new cr.Property(ept_combo, "Dataset fill", "Yes", "Fill the dataset with a colour.", "No|Yes"),			              
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
	// Clamp values
	if (this.properties["Start angle"] < 0)
		this.properties["Start value"] = 0;  
	if (this.properties["Start angle"] > 359)
		this.properties["Start value"] = 359;  
	if (this.properties["Delta angle"] < -180)
		this.properties["Delta angle"] = -180;  
	if (this.properties["Delta angle"] > 180)
		this.properties["Delta angle"] = 180; 
	if (this.properties["Duration"] < 0)
		this.properties["Duration"] = 0;  			 		    
}
