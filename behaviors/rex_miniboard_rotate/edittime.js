function GetBehaviorSettings()
{
	return {
		"name":			"(Miniboard) Rotate",
		"id":			"rex_miniboard_rotate",
		"version":		"0.1",
		"description":	"Spin chess on mini board logically and physically.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_miniboard_rotate.html",
		"category":		"Rex - Board - application - mini board",
		"flags":		0	
						| bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddComboParamOption("0 degree");
AddComboParamOption("90 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("270 (-90) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(1, 0, "Can rotate", "Rotate - Square grid", 
             "Can {my} rotate <i>{0}</i>, test mode: <i>{1}</i>", 
             "Return true if this mini board could be spined.", "TestRotate");
          
AddComboParamOption("0 degree");
AddComboParamOption("90 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("270 (-90) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(2, 0, "Can rotate", "Rotate - Hexagon grid", 
             "Can {my} rotate <i>{0}</i>, test mode: <i>{1}</i>", 
             "Return true if this mini board could be spined.", "TestRotate");
             
AddNumberParam("Direction", "Rotating direction.", 1);    
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(3, 0, "Can rotate", "Rotate", 
              "Can {my} rotate direction <i>{0}</i>, test mode: <i>{1}</i>", 
              "Return true if this mini board could be spined.", "TestRotate");       

AddNumberParam("Direction", "Face direction.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1); 
AddCondition(4, 0, "Can face", "Face", 
             "Can {my} face to direction <i>{0}</i>, test mode: <i>{1}</i>",  
             "Return true if this mini board could face to direction.", "TestFaceTo");      
             
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "Face direction.", 0); 
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(5, 0, "Can face", "Face - Square grid", 
             "Can {my} face to <i>{0}</i>, test mode: <i>{1}</i>",  
             "Return true if this mini board could face to direction.", "TestFaceTo");              
                     
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Face direction.", 0); 
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(6, 0, "Can face", "Face - Hexagon grid (Left-Right)", 
             "Can {my} face to <i>{0}</i>, test mode: <i>{1}</i>",   
             "Return true if this mini board could face to direction.", "TestFaceTo");
             
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Face direction.", 0); 
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(7, 0, "Can face", "Face - Hexagon grid (Up-Down)", 
             "Can {my} face to <i>{0}</i>, test mode: <i>{1}</i>",  
             "Return true if this mini board could face to direction.", "TestFaceTo"); 
             
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(8, 0, "Can flip", "Flip", 
             "Can {my} flip (<i>{0}</i>), test mode: <i>{1}</i>", 
             "Return true if this mini board could flip.", "TestFlip");  
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddCondition(9, 0, "Can mirror", "Mirror", 
             "Can {my} mirror (<i>{0}</i>), test mode: <i>{1}</i>", 
             "Return true if this mini board could mirror.", "TestMirror");                               
                                 
AddCondition(11, 0, "Rotating accepted", "Request - Rotate", 
             "Is {my} rotating request accepted", 
             "Return true if rotating request accepted.", "IsRotatingRequestAccepted");   
       
AddCondition(12, cf_trigger, "On rotating accepted", "Request - Rotate", 
             "On {my} rotating request accepted", 
             "Triggered when rotating request accepted.", "OnRotatingRequestAccepted"); 
             
AddCondition(13, cf_trigger, "On rotating rejected", "Request - Rotate", 
             "On {my} rotating request rejected", 
             "Triggered when rotating request rejected.", "OnRotatingRequestRejected");
             
AddCondition(14, 0, "Flipping accepted", "Request- Flip", 
             "Is {my} flipping request accepted", 
             "Return true if flipping request accepted.", "IsFlippingRequestAccepted");              
             
AddCondition(15, cf_trigger, "On flipping accepted", "Request- Flip", 
             "On {my} flipping request accepted", 
             "Triggered when flipping request accepted.", "OnFlippingRequestAccepted"); 
             
AddCondition(16, cf_trigger, "On flipping rejected", "Request- Flip", 
             "On {my} flipping request rejected", 
             "Triggered when flipping request rejected.", "OnFlippingRequestRejected");     
             
AddCondition(17, 0, "Mirroring accepted", "Request- Mirror", 
             "Is {my} mirroring request accepted", 
             "Return true if mirroring request accepted.", "IsMirroringRequestAccepted");  
                          
AddCondition(18, cf_trigger, "On mirroring accepted", "Request- Mirror", 
             "On {my} mirroring request accepted", 
             "Triggered when mirroring request accepted.", "OnMirroringRequestAccepted"); 
             
AddCondition(19, cf_trigger, "On mirroring rejected", "Request- Mirror", 
             "On {my} mirroring request rejected", 
             "Triggered when mirroring request rejected.", "OnMirroringRequestRejected");                      
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("0 degree");
AddComboParamOption("90 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("270 (-90) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(1, 0, "Rotate", "Rotate - Square grid", 
          "{my} rotate <i>{0}</i>, test mode: <i>{1}</i>", 
          "Spin chess on mini board.", "Rotate");
          
AddComboParamOption("0 degree");
AddComboParamOption("60 degrees");
AddComboParamOption("120 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("240 (-120) degrees");
AddComboParamOption("300 (-60) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(2, 0, "Rotate", "Rotate - Hexagon grid", 
          "{my} rotate <i>{0}</i>, test mode: <i>{1}</i>", 
          "Spin chess on mini board.", "Rotate");
          
AddNumberParam("Direction", "Rotating direction.", 1);    
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(3, 0, "Rotate", "Rotate", 
          "{my} rotate direction <i>{0}</i>, test mode: <i>{1}</i>", 
          "Spin chess on mini board.", "Rotate");  
          
AddNumberParam("Direction", "Face direction.", 0);    
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(4, 0, "Face", "Face", 
          "{my} face to direction <i>{0}</i>, test mode: <i>{1}</i>", 
          "Rotate mini board to face to direction.", "FaceTo"); 
          
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "Face direction.", 0);  
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(5, 0, "Face", "Face - Square grid", 
          "{my} face to <i>{0}</i>, test mode: <i>{1}</i>", 
          "Rotate mini board to face to direction.", "FaceTo");
          
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Face direction.", 0);  
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(6, 0, "Face", "Face - Hexagon grid (Left-Right)", 
          "{my} face to <i>{0}</i>, test mode: <i>{1}</i>", 
          "Rotate mini board to face to direction.", "FaceTo");
          
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Face direction.", 0);  
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(7, 0, "Face", "Face - Hexagon grid (Up-Down)", 
          "{my} face to <i>{0}</i>, test mode: <i>{1}</i>", 
          "Rotate mini board to face to direction.", "FaceTo");  
          
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(11, 0, "Flip", "Flip", 
          "{my} flip, test mode: <i>{0}</i>", 
          "Flip mini board by toggling sign of logic Y for each chess.", "Flip");  
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable test", "Mode of putable test.", 1);
AddAction(12, 0, "Mirror", "Mirror", 
          "{my} mirror, test mode: <i>{0}</i>", 
          "Mirror mini board by toggling sign of logic X for each chess.", "Mirror");                                        
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Face direction", "Mini board", "Direction",
              "Face direction of mini board.");
              
ACESDone();

var property_list = [  
    new cr.Property(ept_integer, "Direction", 0, "Face direction."),
    new cr.Property(ept_combo, "RotateTo", "Yes", 
                    "Set Yes to change the logical and physical position of chess. Set No will only change the logical position.", "No|Yes"),     
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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
