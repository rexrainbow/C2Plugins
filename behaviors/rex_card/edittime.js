function GetBehaviorSettings()
{
	return {
		"name":			"Card",
		"id":			"Rex_Card",
		"description":	"Card.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Object",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2, 0, "Is back face", "Face", "Is {my} at back face", "Test if the card is at back face.", "IsBackFace");
AddCondition(3, 0, "Is front face", "Face", "Is {my} at front face", "Test if the card is at front face.", "IsFrontFace");

//////////////////////////////////////////////////////////////
// Actions 
AddAction(2, 0, "Turn to front face", "Turn face", 
          "Turn {my} to front face", 
          "Turn to front face.", "TurnFrontFace");  
AddAction(3, 0, "Turn to back face", "Turn face", 
          "Turn {my} to back face", 
          "Turn to back face.", "TurnBackFace"); 
AddNumberParam("Frame index", "Frame index of back face", 0);		  
AddAction(4, 0, "Set back face", "Set face", 
          "Set {my} back face to frame index <i>{0}</i>", 
          "Set back face.", "SetBackFace");  			  
AddNumberParam("Frame index", "Frame index of front face", 1);		  
AddAction(5, 0, "Set front face", "Set face", 
          "Set {my} front face to frame index <i>{0}</i>", 
          "Set front face.", "SetFrontFace");  		  
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Face", "Back", "Set initial face.", "Back|Front"),
	new cr.Property(ept_integer, "Back", 0, "Frame index of back face."),	
    new cr.Property(ept_integer, "Front", 1, "Frame index of front face."),		
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
