function GetBehaviorSettings()
{
	return {
		"name":			"Ground",
		"id":			"Rex_mode7ground",
		"description":	"Ground instance with mode7 effect.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_mode7ground.html",
		"category":		"Rex - Effect - mode7",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
             
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Camera", "Camera object."); 
AddAction(1, 0, "Set camera", "Camera", 
         "{my} Set camera to <i>{0}</i>", 
          "Set camera to control parameters pos_x, pos_y, ang of mode7 effect.", "SetCamera");  

AddNumberParam("horizon", "Offset the horizon up or down. -0.5 to move to top of sprite.", 0);
AddAction(11, 0, "Set horizon", "Parameters of mode7", 
          "Set {my} horizon to <i>{0}</i>", 
          "Set horizon.", "SetHorizon");

AddNumberParam("fov", "Can also be thought of as eye height.", 1);
AddAction(12, 0, "Set fov", "Parameters of mode7", 
          "Set {my} fov to <i>{0}</i>", 
          "Set fov.", "SetFOV"); 
          
AddNumberParam("scale_x", "Scale X of this image", 1);
AddAction(13, 0, "Set scale_x", "Parameters of mode7", 
          "Set {my} scale_x to <i>{0}</i>", 
          "Set scale_x.", "SetScaleX");

AddNumberParam("scale_y", "Scale Y of this image", 1);
AddAction(14, 0, "Set scale_y", "Parameters of mode7", 
          "Set {my} scale_y to <i>{0}</i>", 
          "Set scale_y.", "SetScaleY");                                     
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Name", "mode7", "The name of mode7 effect."),
    new cr.Property(ept_float, "horizon", 0, "Offset the horizon up or down. -0.5 to move to top of sprite."),
    new cr.Property(ept_float, "fov", 1, "Can also be thought of as eye height."),     
    new cr.Property(ept_float, "scale_x", 1, "Scale Y of this image."),      
    new cr.Property(ept_float, "scale_y", 1, "Scale X of this image."),   
	new cr.Property(ept_combo, "Image", "Infinite", "Infinite or just one image.", "Infinite|One")
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
