function GetPluginSettings()
{
	return {
		"name":			"Event balancer",
		"id":			"Rex_EventBalancer",
		"version":		"0.1",   		
		"description":	"Divide heavy looping into ticks",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_eventbalancer.html",
		"category":		"Rex - Logic - flow control",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,cf_trigger,"On start","Procedure",
             "On procedure start",
             "Triggered when procedure start.","OnStart");
AddCondition(2,cf_trigger,"On processing","Procedure",
             "On procedure processing",
             "Triggered when procedure processing.","OnProcessing");
AddCondition(3,cf_trigger,"On stop","Procedure",
             "On procedure stop",
             "Triggered when procedure stop.","OnStop");  
AddCondition(4,0 ,"Is processing","Procedure",
             "Is procedure processing",
             "Return true if procedure processing.","IsProcessing");

// for loop             
AddCondition(11, cf_looping | cf_not_invertible, "Dynamic loop", "Dynamic loop", 
             "Dynamic loop", 
			 'Repeat the event until time-out.', "DynamicLoop"); 
//////////////////////////////////////////////////////////////
// Actions
AddAction(1,0,"Start","Procedure",
          "Start procedure",
          'Start procedure. It will trigger Condition:"On start", then trigger Condition:"On processing"',"Start");
AddAction(2,0,"Stop","Procedure",
          "Stop procedure",
          'Stop procedure. It will trigger Condition:"On Stop"',"Stop");  
AddNumberParam("Processing time", "Processing time per tick in percentage. A tick time is (1/60), 1 is using full tick time.", 0.5);          
AddAction(3,0,"Set processing time","Dynamic mode",
          "Set processing time to <i>{0}</i>",
          "Set processing time","SetProcessingTime"); 
AddNumberParam("Repeat count", 'Repeat count of triggering condition:"On processing" each tick.', 10);          
AddAction(4,0,"Set repeat count","Static mode",
          "Set repeat count to <i>{0}</i>",
          "Set repeat count","SetRepeatCount");
          
AddAction(11,0,"Stop","Dynamic loop",
          "Stop loop",
          "Stop loop.","StopLoop");                      	  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, 
              "Get Processing time", "Processing time", "ProcessingTime", 
              "Processing time per tick in percentage."); 
AddExpression(2, ef_return_number, 
              "Get elapsed ticks", "Processing", "ElapsedTicks", 
              "Get elapsed ticks from processing start.");
                                       
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Mode", "Dynamic", 'Mode of trigger condition:"On processing".', 
                    "Dynamic|Static"),    
    new cr.Property(ept_section, "Dynamic", "",	"Setting when using dynamic mode."),
    new cr.Property(ept_float, "Processing time", 1, "Processing time per tick in percentage. A tick time is (1/60), 1 is using full tick time."),
    new cr.Property(ept_section, "Static", "",	"Setting when using static mode."),
    new cr.Property(ept_integer, "Repeat count", 10, 'Repeat count of triggering condition:"On processing" each tick.'),    
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
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
    if (this.properties["Processing time"] < 0.01)
        this.properties["Processing time"] = 0.01; 
    if (this.properties["Repeat count"] < 1)
        this.properties["Repeat count"] = 1;         
               
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
