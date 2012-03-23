function GetBehaviorSettings()
{
	return {
		"name":			"Gleam",
		"id":			"Rex_Flash",
		"version":		"1.0",        
		"description":	"Change an object's opacity over time periodly.",
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
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's flash behavior.", "SetActivated");
AddAction(1, 0, "Flash start", "Control", 
          "Start {my} to flash", 
          "Start to flash.", "Start"); 
AddAction(2, 0, "Flash end", "Control", 
          "End {my} to flash", 
          "End to flash.", "End");  
AddStringParam("Parameters", 
               '"start, end, start2end, endHold, end2start, startHold, repeat"', 
               '"0, 1.0, 0.1, 0.1, 0.1, 0.1, 2"');
AddAction(3, 0, "Set parameters", "Setting", 
          "Set {my} parameters to <i>{0}</i>", 
          'Set parameters from string.', "SetParameters");            
AddNumberParam("Start", "Opacity start value.", 0);
AddNumberParam("End", "Opacity end value.", 1.0);
AddAction(4, 0, "Set start-end value", "Setting", 
          "Set {my} opacity changing from <i>{0}</i> to <i>{1}</i>", 
          "Set opacity changing value.", "SetStartEndValue");             
AddNumberParam("Start-end", "Duration from start to end.", 0.1);
AddNumberParam("End hold", "Duration of end holding.", 0.1);
AddNumberParam("End-start", "Duration from end to start.", 0.1);
AddNumberParam("Start hold", "Duration of start holding.", 0.1);
AddAction(5, 0, "Set duration", "Setting", 
          "Set {my} duration start-end to <i>{0}</i>, end holding to <i>{1}</i>, end-start to <i>{2}</i>, Start holding to <i>{3}</i>", 
          "Duration in seconds. 0 to skip.", "SetDuration"); 
AddNumberParam("Count", "Repeat count.", 1);
AddAction(6, 0, "Set repeat count", "Setting", 
          "Set {my} repeat count to <i>{0}</i>", 
          "Set repeat count, 0 is infinity.", "SetRepeatCount"); 
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Destroy", "Destroy the object after flash finish.",1);
AddAction(7, 0, "Set destroy", "Setting", 
          "Set {my} destroy to <i>{0}</i>", 
          "Destroy the object after flash finish.", "SetDestroy");
AddNumberParam("Period", "Period of flash.", 0.4);
AddNumberParam("Count", "Repeat count.", 1);
AddAction(8, 0, "Set flash", "Quick-Setting", 
          "Set {my} flash period to <i>{0}</i>, <i>{1}</i> times", 
          "Flash an object.", "Flash");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get start value", "Setting", "StartValue", 
              "Opacity start value.");    
AddExpression(2, ef_return_number, "Get end value", "Setting", "EndValue", 
              "Opacity end value."); 
AddExpression(3, ef_return_number, "Get duration from start to end", "Setting", "Start2End", 
              "Duration from start to end.");    
AddExpression(4, ef_return_number, "Get duration of holding on end", "Setting", "EndHold", 
              "Duration of holding on end.");
AddExpression(5, ef_return_number, "Get duration from end to start", "Setting", "End2Start", 
              "Duration from end to start.");    
AddExpression(6, ef_return_number, "Get duration of holding on start", "Setting", "StartHold", 
              "Duration of holding on start.");   
AddExpression(7, ef_return_number, "Get repeat count", "Setting", "Repeat", 
              "The times to flash repeatly. 0 is infinity.");        
AddExpression(8, ef_return_number, "Get destroy", "Setting", "IsDestroy", 
              "Destroy the object after flash finish.");  
              

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
    new cr.Property(ept_combo, "Start", "Yes", "Enable if you wish this to start at the start of the layout.", "No|Yes"),
    new cr.Property(ept_float, "Start value", 0, "Opacity start value."),    
    new cr.Property(ept_float, "End value", 1.0, "Opacity end value."),    
	new cr.Property(ept_float, "Duration from start to end", 0.1, 
                    "Duration in seconds from start value to end value. 0 to skip."),
    new cr.Property(ept_float, "Duration of holding on end", 0.1, 
                    "Duration in seconds of holding on end. 0 to skip."),
	new cr.Property(ept_float, "Duration from end to start", 0.1, 
                    "Duration in seconds from end value to start value. 0 to skip."),
    new cr.Property(ept_float, "Duration of holding on start", 0.1, 
                    "Duration in seconds of holding on start. 0 to skip."),          
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
	if (this.properties["Start value"] < 0)
		this.properties["Start value"] = 0;  
    else if (this.properties["Start value"] > 1)
		this.properties["Start value"] = 1;  
        
	if (this.properties["End value"] < 0)
		this.properties["End value"] = 0;  
    else if (this.properties["End value"] > 1)
		this.properties["End value"] = 1;            
    
	if (this.properties["Duration from start to end"] < 0)
		this.properties["Duration from start to end"] = 0;
		
	if (this.properties["Duration of holding on end"] < 0)
		this.properties["Duration of holding on end"] = 0;
		
	if (this.properties["Duration from end to start"] < 0)
		this.properties["Duration from end to start"] = 0;
        		
	if (this.properties["Duration of holding on start"] < 0)
		this.properties["Duration of holding on start"] = 0; 
        		
	if (this.properties["Repeat count"] < 0)
		this.properties["Repeat count"] = 0; 
        
}
