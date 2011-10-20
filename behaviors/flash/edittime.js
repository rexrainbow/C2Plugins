function GetBehaviorSettings()
{
	return {
		"name":			"Flash",
		"id":			"MyFlash",
		"description":	"Change an object's opacity over time.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"General",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On flash finish", "", 
             "On {my} flash finish", 
			 "Triggered when flash finish.", 
			 "OnFlashFinish"); 

//////////////////////////////////////////////////////////////
// Actions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's flash behavior.", "SetActivated");
AddAction(1, 0, "Flash start", "Control", 
          "Start {my} to flash", 
          "Start to flash.", "Start"); 
AddAction(2, 0, "Flash stop", "Control", 
          "Stop {my} to flash", 
          "Stop to flash.", "Stop");  
AddStringParam("Parameters", 
               '"start, stop, start2stop, stopHold, stop2start, startHold, repeat"', 
               '"0, 1.0, 0.1, 0.1, 0.1, 0.1, 2"');
AddAction(3, 0, "Set parameters", "Setting", 
          "Set {my} parameters to <i>{0}</i>", 
          'Set parameters from string.', "SetParameters");            
//AddNumberParam("opacity", "Opacity start value.", 0);
//AddAction(4, 0, "Set opacity start value", "Setting", 
//          "Set {my} opacity start value to <i>{0}</i>", 
//          "Set opacity start value.", "SetStartValue"); 
//AddNumberParam("opacity", "Opacity stop value.", 1.0);
//AddAction(5, 0, "Set opacity stop value", "Setting", 
//          "Set {my} stop value to <i>{0}</i>", 
//          "Set opacity stop value.", "SetStopValue");            
//AddComboParamOption("From start value to stop value");
//AddComboParamOption("Holding on stop");
//AddComboParamOption("From stop value to start value");
//AddComboParamOption("Holding on start");
//AddComboParam("Duration", "Duration type.",0);    
//AddNumberParam("Duration", "Duration.", 0.1);
//AddAction(6, 0, "Set duration.", "Setting", 
//          "Set {my} duration <i>{0}</i> to <i>{1}</i>", 
//          "Duration in seconds. Zero to skip.", "SetDuration"); 
         

//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
    new cr.Property(ept_combo, "Start", "Yes", "Enable if you wish this to start at the start of the layout.", "No|Yes"),
    new cr.Property(ept_float, "Start value", 0, "Opacity start value."),    
    new cr.Property(ept_float, "Stop value", 1.0, "Opacity stop value."),    
	new cr.Property(ept_float, "Duration from start to stop", 0.1, 
                    "Duration in seconds from start value to stop value. Zero to skip."),
    new cr.Property(ept_float, "Duration of holding on stop", 0.1, 
                    "Duration in seconds of holding on stop. Zero to skip."),
	new cr.Property(ept_float, "Duration from stop to start", 0.1, 
                    "Duration in seconds from stop value to start value. Zero to skip."),
    new cr.Property(ept_float, "Duration of holding on start", 0.1, 
                    "Duration in seconds of holding on start. Zero to skip."),          
    new cr.Property(ept_integer, "Repeat count", 1, "The times to flash repeatly. 0 is infinity."),                                    
	new cr.Property(ept_combo, "Destroy", "Yes", "Destroy the object after flash finish.", "No|Yes")
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
	if (this.properties["Duration from start to stop"] < 0)
		this.properties["Duration from start to stop"] = 0;
		
	if (this.properties["Duration of holding on stop"] < 0)
		this.properties["Duration of holding on stop"] = 0;
		
	if (this.properties["Duration from stop to start"] < 0)
		this.properties["Duration from stop to start"] = 0;
        		
	if (this.properties["Duration of holding on start"] < 0)
		this.properties["Duration of holding on start"] = 0;        
}
