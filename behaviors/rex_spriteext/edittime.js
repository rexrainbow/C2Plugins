function GetBehaviorSettings()
{
	return {
		"name":			"Sprite Ext",
		"id":			"Rex_SpriteExt",
		"description":	"Extension of sprite",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"General",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Visible", "1 = visible, 0 = invisible, 2 = toggle", 0);
AddAction(1, 0, "Set visible", "Appearance", 
          "Set {my} visible to <i>{0}</i>", 
          "Set the sprite is hidden or shown .", "SetVisible"); 
AddNumberParam("Mirrored", "1 = mirrored, 0 = not mirrored, 2 = toggle", 0);          
AddAction(2, 0, "Set mirrored", "Animations", 
          "Set {my} mirrored to <i>{0}</i>", 
          "Set the sprite is horizontally mirrored or back to normal.", "SetMirrored");       
AddNumberParam("Flipped", "1 = flipped, 0 = not flipped, 2 = toggle", 0);          
AddAction(3, 0, "Set flipped", "Animations", 
          "Set {my} flipped to <i>{0}</i>", 
          "Set the sprite is vertically flipped or back to normal.", "SetFlipped");           
          
//////////////////////////////////////////////////////////////
// Conditions
             
//////////////////////////////////////////////////////////////
// Expressions
   
ACESDone();

// Property grid properties for this plugin
var property_list = [
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
