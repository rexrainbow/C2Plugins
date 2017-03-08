function GetBehaviorSettings()
{
	return {
		"name":			"Zigzag",
		"id":			"Rex_Zigzag",
		"version":		"1.0",          
		"description":	"Using LOGO-like script to move or rotate sprite.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_zigzag.html",
		"category":		"Rex - Movement - position and angle",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCmpParam("Comparison", "Choose the way to compare the current moving speed.");
AddNumberParam("Speed", "The moving speed, in pixel per second, to compare the current speed to.");
AddCondition(0, 0, "Compare moving speed", "Moving", 
             "{my} moving speed {0} {1}", 
             "Compare the current moving speed of the object.", 
             "CompareMovSpeed");
AddCmpParam("Comparison", "Choose the way to compare the current rotation speed.");
AddNumberParam("Speed", "The rotation speed, in degree per second, to compare the current speed to.");
AddCondition(1, 0, "Compare rotation speed", "Rotation", 
             "{my} rotation speed {0} {1}", 
             "Compare the current rotation speed of the object.", 
             "CompareRotSpeed");
AddComboParamOption("Move (F)orward");
AddComboParamOption("Move (B)ackward");
AddComboParamOption("Turn (R)ight");
AddComboParamOption("Turn (L)eft");
AddComboParamOption("(W)ait");
AddComboParamOption("Any");
AddComboParam("Command Type", "Command Types.",5);
AddCondition(2, 0, "Is executing command", "Command", 
             "Is {my} executing <i>{0}</i>", 
			 "Is executing command.", 
			 "IsCmd");
AddCondition(3, cf_trigger, "On command queue finish", "Command", 
             "On {my} command queue finish", 
			 "Triggered when command queue finish.", 
			 "OnCmdQueueFinish");             
AddComboParamOption("Move (F)orward");
AddComboParamOption("Move (B)ackward");
AddComboParamOption("Turn (R)ight");
AddComboParamOption("Turn (L)eft");
AddComboParamOption("(W)ait");
AddComboParamOption("Any");
AddComboParam("Command Type", "Command Types.",5);
AddCondition(4, cf_trigger, "On command start", "Command", 
             "On {my} <i>{0}</i> command start", 
			 "Triggered when command start.", 
			 "OnCmdStart");  
AddComboParamOption("Move (F)orward");
AddComboParamOption("Move (B)ackward");
AddComboParamOption("Turn (R)ight");
AddComboParamOption("Turn (L)eft");
AddComboParamOption("(W)ait");
AddComboParamOption("Any");
AddComboParam("Command Type", "Command Types.",5);
AddCondition(5, cf_trigger, "On command finish", "Command", 
             "On {my} <i>{0}</i> command finish", 
			 "Triggered when command finish.", 
			 "OnCmdFinish");              

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "Setting", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's Zigzag behavior.", "SetActivated");
AddAction(1, 0, "Execution start", "Control", 
          "Start {my} to execute commands", 
          "Start to execute command.", "Start"); 
AddAction(2, 0, "Execution stop", "Control", 
          "Stop {my} to execute command", 
          "Stop to execute command.", "Stop");  
AddNumberParam("Max moving speed", "Maximum moving speed, in pixel per second.");
AddAction(3, 0, "Set maximum moving speed", "Moving", 
          "Set {my} maximum moving speed to <i>{0}</i>", 
          "Set the object's maximum moving speed.", "SetMaxMovSpeed");
AddNumberParam("Moving acceleration", "The moving acceleration setting, in pixel per second per second.");
AddAction(4, 0, "Set moving acceleration", "Moving", 
          "Set {my} moving acceleration to <i>{0}</i>", 
          "Set the object's moving acceleration.", "SetMovAcceleration");
AddNumberParam("Moving deceleration", "The moving deceleration setting, in pixels per second per second.");
AddAction(5, 0, "Set moving deceleration", "Moving", 
          "Set {my} moving deceleration to <i>{0}</i>", 
          "Set the object's moving deceleration.", "SetMovDeceleration");
AddNumberParam("Max rotation speed", "Maximum rotation speed, in degrees per second.");
AddAction(6, 0, "Set maximum rotation speed", "Rotation", 
          "Set {my} maximum rotation speed to <i>{0}</i>", 
          "Set the object's maximum rotation speed.", "SetMaxRotSpeed");
AddNumberParam("Rotation acceleration", "The rotation acceleration setting, in pixels per second per second.");
AddAction(7, 0, "Set rotation acceleration", "Rotation", 
          "Set {my} rotation acceleration to <i>{0}</i>", 
          "Set the object's rotation acceleration.", "SetRotAcceleration");
AddNumberParam("Rotation deceleration", "The rotation deceleration setting, in pixels per second per second.");
AddAction(8, 0, "Set rotation deceleration", "Rotation", 
          "Set {my} rotation deceleration to <i>{0}</i>", 
          "Set the object's rotation deceleration.", "SetRotDeceleration");
AddNumberParam("Repeat count", "The times to execute commands repeatly. 0 is infinity.", 0);
AddAction(9, 0, "Set repeat count", "Command queue", 
          "Set {my} repeat count to <i>{0}</i>", 
          "Set times to execute commands repeatly. 0 is infinity.", "SetRepeatCount");          
AddAction(10, 0, "Clean command queue", "Command queue", 
          "Clean {my} command queue", 
          "Clean command queue.", "CleanCmdQueue");
AddComboParamOption("Move (F)orward");
AddComboParamOption("Move (B)ackward");
AddComboParamOption("Turn (R)ight");
AddComboParamOption("Turn (L)eft");
AddComboParamOption("(W)ait");
AddComboParam("Command Type", "Command Types.",0);
AddNumberParam("Parameter", "The parameter of command.");  
AddAction(11, 0, "Add command", "Command queue", 
          "Add <i>{0}</i> <i>{1}</i> into {my} command queue", 
          "Add a command into command queue.", "AddCmd"); 
AddStringParam("Commansd", 'Commands string. F=Move Forward, B=Move Backward, R=Turn Right, L=Turn Left, W=Wait. ex:"F 100;L 60"', '""');
AddAction(12, 0, "Add commands", "Command queue", 
          "Add '<i>{0}</i>' into {my} command queue", 
          "Add commands string into command queue.", "AddCmdString");           
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Rotatable", "Set rotatable.",1);
AddAction(13, 0, "Set rotatable", "Rotation", 
          "Set {my} rotatable to <i>{0}</i>", 
          "Set rotatable.", "SetRotatable");  
AddNumberParam("Angle", "The angle of moving direction.");  
AddAction(14, 0, "Set moving angle", "Rotation", 
          "Set {my} moving angle to <i>{0}</i>", 
          "Set moving angle in degree. Also rotate sprite at rotatable mode", "SetMovingAngle");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Precise", "Set precise.",0);
AddAction(15, 0, "Set precise", "Setting", 
          "Set {my} precise to <i>{0}</i>", 
          "Set precise.", "SetPrecise");           
  

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current activated state", "Current", "Activated", 
              "The current activated state of behavior.");
AddExpression(1, ef_return_number, "Get current moving speed", "Current", "MovSpeed", 
              "The current moving speed, in pixel per second.");
AddExpression(2, ef_return_number, "Get max moving speed", "Setting", "MaxMovSpeed", 
              "The maximum moving speed setting, in pixel per second.");
AddExpression(3, ef_return_number, "Get moving acceleration", "Setting", "MovAcc", 
              "The moving acceleration setting, in pixel per second per second.");
AddExpression(4, ef_return_number, "Get moving deceleration", "Setting", "MovDec", 
              "The moving deceleration setting, in pixel per second per second.");              
AddExpression(5, ef_return_number, "Get current rotation speed", "Current", "RotSpeed", 
              "The current rotation speed, in degrees per second.");
AddExpression(6, ef_return_number, "Get max rotation speed", "Setting", "MaxRotSpeed", 
              "The maximum rotation speed setting, in degrees per second.");
AddExpression(7, ef_return_number, "Get rotation acceleration", "Setting", "RotAcc", 
              "The acceleration setting, in degrees per second per second.");
AddExpression(8, ef_return_number, "Get rotation deceleration", "Setting", "RotDec", 
              "The rotation deceleration setting, in degrees per second per second.");
AddExpression(9, ef_return_number, "Get rotatable", "Setting", "Rotatable", 
              "1 to rotate sprite with command."); 
AddExpression(10, ef_return_number, "Get repeat count", "Setting", "RepCnt", 
              "The times to execute commands repeatly. 0 is infinity.");
AddExpression(11, ef_return_number, "Get current command index", "Current", "CmdIndex", 
              "Get current command index in command queue. 0 is the first command.");               
AddExpression(12, ef_return_number, "Get moving angle", "Current", "MovAngle", 
              "The moving angle, in degree.");               

              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
    new cr.Property(ept_combo, "Start", "Yes", "Enable if you wish this to start at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Rotatable", "Yes", "Enable to rotate sprite with command.", "No|Yes"),    
    // command queue
    new cr.Property(ept_integer, "Repeat count", 0, "The times to execute commands repeatly. 0 is infinity."),                
    new cr.Property(ept_text, "Commands", "", 'F=Move Forward, B=Move Backward, R=Turn Right, L=Turn Left, W=Wait. ex:"F 100;L 60"'),    
    // Moving setup
	new cr.Property(ept_float, "Max moving speed", 400, 
                    "Maximum moving speed, in pixel per second."),
	new cr.Property(ept_float, "Moving acceleration", 0, 
                    "Moving acceleration, in pixel per second per second."),
	new cr.Property(ept_float, "Moving deceleration", 0, 
                    "Moving deceleration, in pixel per second per second."),
    // Rotation setup                
    new cr.Property(ept_float, "Max rotation speed", 180, 
                    "Maximum rotation speed, in degrees per second."),
	new cr.Property(ept_float, "Rotation acceleration", 0, 
                    "Rotation acceleration, in degrees per second per second. 0 is using max speed directly."),
	new cr.Property(ept_float, "Rotation deceleration", 0, 
                    "Rotation deceleration, in degrees per second per second. 0 is ignored deceleration"),
    // initial zigzag angle for non-rotatable mode
    new cr.Property(ept_float, "Initial angle", 0, 
                    "Initial zigzag angle for non-rotatable mode, in degrees."),
    // mode                    
    new cr.Property(ept_combo, "Precise mode", "No", "Force sprite move to target.", "No|Yes"),                    
    new cr.Property(ept_combo, "Continued mode", "No", "Running zigzag as in continued-time.", "No|Yes"),        
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
	if (this.properties["Max moving speed"] < 0)
		this.properties["Max moving speed"] = 0;
		
	if (this.properties["Moving acceleration"] < 0)
		this.properties["Moving acceleration"] = 0;
		
	if (this.properties["Moving deceleration"] < 0)
		this.properties["Moving deceleration"] = 0;
        
	if (this.properties["Max rotation speed"] < 0)
		this.properties["Max rotation speed"] = 0;
		
	if (this.properties["Rotation acceleration"] < 0)
		this.properties["Rotation acceleration"] = 0;
		
	if (this.properties["Rotation deceleration"] < 0)
		this.properties["Rotation deceleration"] = 0;     
}
