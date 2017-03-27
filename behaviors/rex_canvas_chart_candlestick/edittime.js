function GetBehaviorSettings()
{
	return {
		"name":			"Candlestick chart",
		"id":			"Rex_canvas_chart_candlestick",
		"description":	"Draw a candlestick chart on the canvas. The api of chart - https://github.com/amih/Candlestick.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_canvas_chart_candlestick.html",
		"category":		"Rex - Canvas - Chart",
		"flags":		0,
		"dependency":	"Candlestick.js"	
	};
};

//////////////////////////////////////////////////////////////
// Conditions
       
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Data", "The data in the finance.yahoo.com format.", '""');
AddAction(1, 0, "Draw", "Draw", 
          "{my} draw chart from data <i>{0}</i>", 
          "Draw chart.", "Draw");                  
          
AddStringParam("Title", "The title for the chart.", '""');
AddAction(11, 0, "Set title", "Options", 
          "{my} set title to <i>{0}</i>", 
          "Set title.", "SetTitle");  
             
AddNumberParam("Adjust", "Adjust.", 0);
AddAction(13, 0, "Set adjust", "Options", 
          "{my} set adjust to <i>{0}</i>", 
          "Set adjust.", "SetAdjust");      
                      
AddComboParamOption("Open");
AddComboParamOption("High");
AddComboParamOption("Low");
AddComboParamOption("Close");
AddComboParamOption("Volume");
AddComboParam("Type", "Type.", 3);   
AddNumberParam("N", "N.", 200);
AddAction(14, 0, "Add SMA", "Options - indicator", 
          "{my} add <i>{0}</i> SMA, n to <i>{1}</i>", 
          "Add SMA.", "AddSMA");    
          
AddComboParamOption("Open");
AddComboParamOption("High");
AddComboParamOption("Low");
AddComboParamOption("Close");
AddComboParamOption("Volume");
AddComboParam("Type", "Type.", 3);   
AddNumberParam("N", "N.", 26);
AddAction(15, 0, "Add EMA", "Options - indicator", 
          "{my} add <i>{0}</i> EMA, n to <i>{1}</i>", 
          "Add EMA.", "AddEMA");       
          
AddNumberParam("N12", "N12.", 12);
AddNumberParam("N26", "N26.", 26);
AddNumberParam("N9", "N9.", 9);
AddAction(16, 0, "Add MACD", "Options - indicator", 
          "{my} add MACD, n to <i>{0}</i>,<i>{1}</i>,<i>{2}</i>", 
          "Add MACD.", "AddMACD");       
//////////////////////////////////////////////////////////////
// Expressions
               
ACESDone();

// Property grid properties for this plugin
var property_list = [  
    new cr.Property(ept_text, "Background color", "rgb(240,240,220)", "Background color."),
    new cr.Property(ept_text, "Upper background color", "rgb(250,250,200)", "Upper background color."),    
    new cr.Property(ept_text, "Upper scale font color", "black", "Upper scale font color."),      
    new cr.Property(ept_text, "Upper horizontal scale line color", "rgb(200,200,150)", "Upper horizontal scale linecolor."),  
    new cr.Property(ept_text, "Upper vertical scale line color", "rgb(200,200,150)", "Upper vertical scale linecolor."), 
    new cr.Property(ept_text, "Upper indicators line color 0", "coral", "Upper indicators line color 0."),    
    new cr.Property(ept_text, "Upper indicators line color 1", "crimson", "Upper indicators line color 1."), 
    new cr.Property(ept_text, "Upper indicators line color 2", "darkblue", "Upper indicators line color 2."),    
    new cr.Property(ept_text, "Upper indicators line color 3", "chocolate", "Upper indicators line color 3."), 
    new cr.Property(ept_text, "Upper indicators line color 4", "chartreuse", "Upper indicators line color 4."),    
    new cr.Property(ept_text, "Upper indicators line color 5", "blueviolet", "Upper indicators line color 5."), 
    new cr.Property(ept_text, "Upper indicators line color 6", "darksalmon", "Upper indicators line color 6."),
    new cr.Property(ept_text, "Upper candle color", "black", "Upper candle color."),
    new cr.Property(ept_text, "Upper candle rise color", "red", "Upper candle rise color."),
    new cr.Property(ept_text, "Upper candle fall color", "lightgreen", "Upper candle fall color."),
    new cr.Property(ept_text, "Lower background color", "rgba(200,250,200, .5)", "Lower background color."),
    new cr.Property(ept_text, "Lower MACD line color", "black", "Lower MACD line color."),    
    new cr.Property(ept_text, "Lower signal line color", "red", "Lower signal line color."),
    new cr.Property(ept_text, "Lower histogram bins color", "blue", "Lower histogram bins color."),    
    
    new cr.Property(ept_integer, "Top margin", 8, "Top margin of this chart, in pixels."),  
    new cr.Property(ept_integer, "Bottom margin", 10, "Bottom margin of this chart, in pixels."), 
    new cr.Property(ept_integer, "Left margin", 5, "Left margin of this chart, in pixels."),  
    new cr.Property(ept_integer, "Right margin", 23, "Right margin of this chart, in pixels."),
    new cr.Property(ept_integer, "Lower height", 200, "Height of lower chart, in pixels."),
    new cr.Property(ept_integer, "Candle width", 4, "Candle width, in pixels."),             
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
