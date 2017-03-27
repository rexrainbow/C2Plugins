function GetPluginSettings()
{
	return {
		"name":			"Marker",
		"id":			"rex_googlemap_marker",
		"version":		"0.1",
		"description":	"Marker of google map.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_googlemap_marker.html",
		"category":		"Rex - Web - Google map",
		"type":			"object",			// not in layout
		"rotatable":	false,
	};
};

////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On clicked", "Input", "On clicked", 
                    "Triggered when marker clicked.", "OnClicked");     
                    
AddCondition(11,	0, "Is on map", "Put", "Is on map", 
                    "Return true if this marker is on the map.", "IsOnMap");                        
////////////////////////////////////////
// Actions
AddObjectParam("Map", "Map object.");         
AddNumberParam("Latitude", "Latitude.", 0);
AddNumberParam("Longitude", "Longitude.", 0);
AddAction(1, 0, "Put on map", "Put", 
          "Put on <i>{0}</i> at latitude-longitude ( <i>{1}</i>, <i>{2}</i> )", 
          "Put this marker on map.", "PutOnMap");
          
AddComboParamOption("bounce");
AddComboParamOption("drop");
AddComboParam("Type", "Animation type.",0);  
AddAction(11, 0, "Start", "Animation", 
          "Start animation: <i>{0}</i>", 
          "Start animation.", "SetAnim");              
          
AddAction(12, 0, "Stop", "Animation", 
          "Stop animation", 
          "Stop animation.", "SetAnim");            

AddStringParam("Title", "Rollover text.", '""');  
AddAction(21, 0, "Set title", "Title", 
          "Set title to <i>{0}</i>", 
          "Set title.", "SeTtitle"); 
          
AddComboParamOption("Invisible");
AddComboParamOption("Visible");
AddComboParam("Visible", "Visible status.",0);  
AddAction(31, 0, "Set visible", "Appearance", 
          "Set <i>{0}</i>", 
          "Set visible status.", "SetVisible");          
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get latitude", "Position", "Latitude", "Get latitude of current position.");
AddExpression(2, ef_return_number, "Get longitude", "Position", "Longitude", "Get longitude of current position.");
AddExpression(3, ef_return_string, "Get title", "Title", "Title", "Get title.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Title", "", "Rollover text."),
    new cr.Property(ept_combo, "Animation", "None", "Animation.", "None|BOUNCE|DROP"), 
    
    new cr.Property(ept_section, "Label", "",	""),     
    new cr.Property(ept_text, "Label text", "", "The text to be displayed in the label. Only the first character of this string will be shown."),    
    new cr.Property(ept_text, "Label color", "", "The color of the label text."),    
    new cr.Property(ept_text, "Label font family", "", "The font family of the label text (equivalent to the CSS font-family property)."),        
    new cr.Property(ept_text, "Label font size", "", "The font size of the label text (equivalent to the CSS font-size property). Default size is 14px."),    
    new cr.Property(ept_text, "Label font weight", "", "The font weight of the label text (equivalent to the CSS font-weight property)."), 
    
    new cr.Property(ept_section, "Icon", "",	""),   
    new cr.Property(ept_text, "Icon url", "", "The URL of the image or sprite sheet."),    
    new cr.Property(ept_float, "Icon scaled width", -1, 'The size of the entire image after scaling. Set (-1) to use default value.'),    
    new cr.Property(ept_float, "Icon scaled height", -1, 'The size of the entire image after scaling.  Set (-1) to use default value.'),        
    
    new cr.Property(ept_section, "UI - Drag", "",	""),   
    new cr.Property(ept_combo, "Clickable", "Enabled", "If true, the marker receives mouse and touch events.", "Disabled|Enabled"),  
    new cr.Property(ept_combo, "Draggable", "Disabled", "If true, the marker can be dragged.", "Disabled|Enabled"),    
    
    new cr.Property(ept_section, "Appearance", "",	""),  
    new cr.Property(ept_float, "Opacity", 1, "The marker's opacity between 0.0 and 1.0."),        
    new cr.Property(ept_combo, "Visible", "Visible", "If true, the marker is visible.", "Invisible|Visible"),          
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
