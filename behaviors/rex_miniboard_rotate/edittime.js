function GetBehaviorSettings()
{
	return {
		"name":			"Rotate",
		"id":			"rex_miniboard_rotate",
		"version":		"0.1",
		"description":	"Spin chess on mini board logically and physically.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_miniboard_rotate.html",
		"category":		"Mini board",
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
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddCondition(1, 0, "Can rotate", "Rotate - Square grid", 
             "Can {my} rotate <i>{0}</i>, checking mode to <i>{1}</i>", 
             "Return true if this mini board could be spined.", "TestRotate");
          
AddComboParamOption("0 degree");
AddComboParamOption("90 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("270 (-90) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddCondition(2, 0, "Can rotate", "Rotate - Hexagon grid", 
             "Can {my} rotate <i>{0}</i>, checking mode to <i>{1}</i>", 
             "Return true if this mini board could be spined.", "TestRotate");
             
AddNumberParam("Direction", "Rotating direction.", 1);    
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddCondition(3, 0, "Can rotate", "Rotate", 
              "Can {my} rotate direction <i>{0}</i>, checking mode to <i>{1}</i>", 
              "Return true if this mini board could be spined.", "TestRotate");       

AddNumberParam("Direction", "Face direction.", 0);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);  
AddCondition(4, 0, "Can face", "Face", 
             "Can {my} face to direction <i>{0}</i>, checking mode to <i>{1}</i>",  
             "Return true if this mini board could face to direction.", "TestFaceTo");      
             
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "Face direction.", 0); 
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddCondition(5, 0, "Can face", "Face - Square grid", 
             "Can {my} face to <i>{0}</i>, checking mode to <i>{1}</i>",  
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
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddCondition(6, 0, "Can face", "Face - Hexagon grid (Left-Right)", 
             "Can {my} face to <i>{0}</i>, checking mode to <i>{1}</i>",   
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
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddCondition(7, 0, "Can face", "Face - Hexagon grid (Up-Down)", 
             "Can {my} face to <i>{0}</i>, checking mode to <i>{1}</i>",  
             "Return true if this mini board could face to direction.", "TestFaceTo");                
                                 
AddCondition(11, 0, "Rotating accepted", "Request", 
             "Is {my} rotating request accepted", 
             "Return true if rotating request accepted.", "IsRotatingRequestAccepted");   
       
AddCondition(12, cf_trigger, "On rotating accepted", "Request", 
             "On {my} rotating request accepted", 
             "Triggered when rotating request accepted.", "OnRotatingRequestAccepted"); 
             
AddCondition(13,	cf_trigger, "On rotating rejected", "Request", 
             "On {my} rotating request rejected", 
             "Triggered when rotating request rejected.", "OnRotatingRequestRejected");
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("0 degree");
AddComboParamOption("90 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("270 (-90) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(1, 0, "Rotate", "Rotate - Square grid", 
          "{my} rotate <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>", 
          "Spin chess on mini board.", "Rotate");
          
AddComboParamOption("0 degree");
AddComboParamOption("60 degrees");
AddComboParamOption("120 degrees");
AddComboParamOption("180 degrees");
AddComboParamOption("240 (-120) degrees");
AddComboParamOption("300 (-60) degrees");
AddComboParam("Angle", "Spin angle",1);
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(2, 0, "Rotate", "Rotate - Hexagon grid", 
          "{my} rotate <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>",  
          "Spin chess on mini board.", "Rotate");
          
AddNumberParam("Direction", "Rotating direction.", 1);    
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(3, 0, "Rotate", "Rotate", 
          "{my} rotate direction <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>", 
          "Spin chess on mini board.", "Rotate");  
          
AddNumberParam("Direction", "Face direction.", 0);    
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(4, 0, "Face", "Face", 
          "{my} face to direction <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>", 
          "Rotate mini board to face to direction.", "FaceTo"); 
          
AddComboParamOption("Right");		  
AddComboParamOption("Down");
AddComboParamOption("Left");
AddComboParamOption("Up");
AddComboParam("Direction", "Face direction.", 0);  
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(5, 0, "Face", "Face - Square grid", 
          "{my} face to <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>", 
          "Rotate mini board to face to direction.", "FaceTo");
          
AddComboParamOption("Right");
AddComboParamOption("Down-right");	  
AddComboParamOption("Down-left");	 
AddComboParamOption("Left");
AddComboParamOption("Up-left");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Face direction.", 0);  
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(6, 0, "Face", "Face - Hexagon grid (Left-Right)", 
          "{my} face to <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>", 
          "Rotate mini board to face to direction.", "FaceTo");
          
AddComboParamOption("Down-right");	      
AddComboParamOption("Down");
AddComboParamOption("Down-left");	 
AddComboParamOption("Up-left");
AddComboParamOption("Up");
AddComboParamOption("Up-right");
AddComboParam("Direction", "Face direction.", 0);  
AddComboParamOption("logically only");
AddComboParamOption("logically and physically");
AddComboParam("Mode", "Mode of spin.", 1);
AddComboParamOption("None");
AddComboParamOption("Empty");
AddComboParamOption("Putable");
AddComboParam("Putable checking", "Mode of putable checking.", 1);
AddAction(7, 0, "Face", "Face - Hexagon grid (Up-Down)", 
          "{my} face to <i>{0}</i> (<i>{1}</i>), checking mode to <i>{2}</i>", 
          "Rotate mini board to face to direction.", "FaceTo");                                      
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Face direction", "Mini board", "Direction",
              "Face direction of mini board.");
              
ACESDone();

var property_list = [  
    new cr.Property(ept_integer, "Direction", 0, "Face direction."),
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
