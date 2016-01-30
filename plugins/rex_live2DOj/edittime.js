function GetPluginSettings()
{
	return {
		"name":			"Live2D Object",
		"id":			"Rex_Live2DObj",      
		"description":	"Live2D object.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_live2dobj.html",
		"category":		"Rex - Live2D",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces | pf_effects,
		"dependency":	"PlatformManager.js"        
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("URI", "Enter the URL on the web, or data URI, of an image to load.", "\"http://\"");
AddAction(1, 0, "Add texture", "Initialize", 
          "Add texture from <i>{0}</i>", 
          "Add texture from a web address or data URI.", "AddTexture");
          
AddStringParam("URI", "Enter the URL on the web, or data URI, of an image to load.", "\"http://\"");
AddAction(2, 0, "Set model", "Initialize", 
          "Set model from <i>{0}</i>", 
          "Set model from a web address or data URI.", "SetModel");      
       
AddStringParam("Name", "Motion name.", '""');          
AddStringParam("URI", "Enter the URL on the web, or data URI, of an image to load.", "\"http://\"");
AddAction(3, 0, "Add motion", "Initialize", 
          "Add motion <i>{0}</i> from <i>{1}</i>", 
          "Add motion from a web address or data URI.", "AddMotion");                

AddAction(9, 0, "Initial", "Initialize", 
          "Initial", 
          "Load resources and initial this object.", "Initial");             
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
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
	return new IDEInstance(instance);
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
		
	// Plugin-specific variables
	// this.myValue = 0...
}

IDEInstance.prototype.OnCreate = function()
{
    this.instance.SetHotspot(new cr.vector2(0, 0));
}

IDEInstance.prototype.OnInserted = function()
{
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{   
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
    var quad = this.instance.GetBoundingQuad();
    renderer.Fill(quad, this.properties["Color"]);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}

IDEInstance.prototype.OnTextureEdited = function ()
{
}