function GetBehaviorSettings()
{
	return {
		"name":			"Sprite Ext",
		"id":			"Rex_SpriteExt",
		"version":		"0.1",			
		"description":	"Extension of sprite",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_spriteext.html",
		"category":		"Rex - Sprite helper",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_deprecated, "Is shown", "Appearance", 
             "Is {my} shown", "True if the object's layer is visible and object is visible.", "IsShown");
             
AddCondition(1, cf_deprecated | cf_trigger, "On creating", "Constructor & destructor", 
             "On creating", "Triggered when instance creating.", "OnCreating");  
             
AddCondition(2, cf_deprecated | cf_trigger, "On destroying", "Constructor & destructor", 
             "On destroying", "Triggered when instance destroying.", "OnDestroying"); 

AddCondition(11, 0, "Is solid", "Soild", 
             "Is {my} solid", "Return true if the object has solid enable.", "IsSolid");
             
AddNumberParam("X", "The X co-ordinate of point.", 0);
AddNumberParam("Y", "The Y co-ordinate of point.", 0);
AddCondition(21, 0, "Is overlapping point", "Overlap", 
             "Is {my} overlapping at point (<i>{0}</i> , <i>{1}</i>)", "Return true if the object is overlapping at a point.", "ContainsPt");             
             
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
 
AddNumberParam("Enable", "1 = enable, 0 = disable, 2 = toggle", 0);          
AddAction(11, 0, "Set solid", "Solid", 
          "Set {my} solid to <i>{0}</i>", 
          "Set solid property.", "SetSolid");           
             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(2, ef_return_string, "Get image url", "canvas", "imageUrl", "This returns a temporary url to the image on the canvas.");

AddExpression(11, ef_return_number, "Is mirror", "Animations", "IsMirror", "Return 1 if sprirte is horizontally mirrored.");
AddExpression(12, ef_return_number, "Is flipped", "Animations", "IsFlipped", "Return 1 if sprirte is vertically flipped.");


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
