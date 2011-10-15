function GetBehaviorSettings()
{
	return {
		"name":			"Zigzag",
		"id":			"Zigzag",
		"description":	"Move sprite to specific position",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Movements",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On hit target position", "", 
             "On {my} hit target", 
			 "Triggered when hit target position.", 
			 "OnHitTarget");             
AddCmpParam("Comparison", "Choose the way to compare the current speed.");
AddNumberParam("Speed", "The speed, in pixel per second, to compare the current speed to.");
AddCondition(1, 0, "Compare speed", "Speed", 
             "{my} speed {0} {1}", 
             "Compare the current speed of the object.", 
             "CompareSpeed");
AddCondition(2,	cf_trigger, "On moving", "", "On {my} moving", "Triggered when object moving.", "OnMoving");                          
AddCondition(3,	0, "Is moving", "", "Is {my} moving", "Is object moving.", "IsMoving");                


//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", 
          "Set {my} activated to <i>{0}</i>", 
          "Enable the object's Zigzag behavior.", "SetActivated");
AddAction(1, 0, "Trigger start", "", 
          "Start {my} to execute command", 
          "Start to execute command.", "Start"); 
AddAction(2, 0, "Trigger stop", "", 
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
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Repeat", "Executing command queue repeatly.",1);
AddAction(9, 0, "Set repeat", "", 
          "Set {my} repeat mode to <i>{0}</i>", 
          "Enable to execute command queue repeatly.", "SetRepeat");          
AddAction(10, 0, "Clean command queue", "Command queue", 
          "Clean {my} command queue", 
          "Clean command queue.", "CleanCmdQueue");
AddComboParamOption("Move forward");
AddComboParamOption("Move backward");
AddComboParamOption("Turn left");
AddComboParamOption("Turn Right");
AddComboParamOption("Wait");
AddComboParam("Command Type", "Command Types.",1);
AddNumberParam("Parameter", "The parameter of command.");  
AddAction(11, 0, "Add command", "Command queue", 
          "Add <i>{0}</i> <i>{0}</i> into {my} command queue", 
          "Add a command into command queue.", "AddCmd");          
  
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
            

         
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this to begin at the start of the layout.", "No|Yes"),                
    new cr.Property(ept_combo, "Start", "Yes", "Enable if you wish this to start at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Rotatable", "Yes", "Enable to rotate sprite with command.", "No|Yes"),    
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
    // command queue
    new cr.Property(ept_combo, "Repeat", "Yes", "Executing command queue repeatly.", "No|Yes"),                
    new cr.Property(ept_text, "Command queue", "", "Set command queue."),
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
