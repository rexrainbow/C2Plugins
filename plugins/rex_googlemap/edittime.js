function GetPluginSettings()
{
	return {
		"name":			"Google map",
		"id":			"rex_googlemap",
		"version":		"0.1",
		"description":	"Display google map at a div element.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_googlemap.html",
		"category":		"Rex - Web - Google map",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces,
		"dependency":	"html2canvas.min.js"
	};
};

////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On map loaded", "Load", "On map loaded", 
                    "Triggered when map loaded.", "OnMapLoaded");

AddCondition(2,	cf_trigger, "On clicked", "Input", "On clicked", 
                    "Triggered when map clicked.", "OnClicked");    

AddCondition(201,	cf_trigger, "On snapsot", "Snapshot", "On snapsot", 
                    "Triggered when the snapshot of current map is ready.", "OnSnapshot");                        
////////////////////////////////////////
// Actions
AddNumberParam("Latitude", "Latitude.", 0);
AddNumberParam("Longitude", "Longitude.", 0);
AddAction(1, 0, "Set center", "Load", 
          "Set center to latitude-longitude ( <i>{0}</i> , <i>{1}</i> )", 
          "Set center.", "SetCenter");
          
AddComboParamOption("Roadmap");
AddComboParamOption("Satellite");
AddComboParamOption("Terrain");
AddComboParamOption("Hybrid");
AddComboParam("Map type", "Map type.",0);
AddAction(2, 0, "Set map type", "Map type", 
          "Set map type to <i>{0}</i>", 
          "Set map type.", "SetMapType");
          
AddNumberParam("Zoom level", "Zoom level of the map. Set (-1) to clean this parameter.", 10);
AddAction(3, 0, "Set zoom level", "Zoom level", 
          "Set zoom level to <i>{0}</i>", 
          "Set zoom level.", "SetZoomLevel");               
          
AddAction(101, 0, "Refresh", "Refresh", "Refresh the map", "Refresh the map displaying in case of graphical issues.", "Refresh" );

AddAction(201, 0, "Snapshot", "Snapshot", 
          "Take a snapshot.", 
          "Take a screenshot of the current map.", "Snapshot");       
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get last latitude", "Event", "LastLatitude", "Get latitude returned by the last triggered event.");
AddExpression(2, ef_return_number, "Get last longitude", "Event", "LastLongitude", "Get longitude returned by the last triggered event.");

AddExpression(11, ef_return_number, "Get center latitude", "Center", "CenterLatitude", "Get latitude of center position.");
AddExpression(12, ef_return_number, "Get center longitude", "Center", "CenterLongitude", "Get longitude of center position.");

AddExpression(201, ef_return_string, "Get map snapshot", "Snapshot", "Snapshot", "Get map snapshot.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Map type", "Roadmap", "Map type.", "Roadmap|Satellite|Terrain|Hybrid"),   
    new cr.Property(ept_integer, "Zoom level", 10, "Zoom level of the map. Set (-1) to ignore this parameter."),     
    new cr.Property(ept_text, "Back ground color", "", "Color used for the background of the Map div. This color will be visible when tiles have not yet loaded as the user pans. This option can only be set when the map is initialized."),   
    
    new cr.Property(ept_section, "UI", "",	"User interface configuration."),    
    new cr.Property(ept_combo, "Default UI", "Enabled", "Enables/disables all default UI.", "Disabled|Enabled"),       
    new cr.Property(ept_combo, "Keyboard shortcuts", "Enabled", "Set disabled to prevent the map from being controlled by the keyboard.", "Disabled|Enabled"),      
    
    new cr.Property(ept_section, "UI - Drag", "",	""),     
    new cr.Property(ept_combo, "Draggable", "Enabled", "Set disabled to prevent the map from being dragged.", "Disabled|Enabled"),         
    new cr.Property(ept_text, "Draggable cursor", "", "The url of the cursor to display when mousing over a draggable map."),
    new cr.Property(ept_text, "Dragging cursor", "", "The url of  the cursor to display when the map is being dragged."),   
    
    new cr.Property(ept_section, "UI - Full screen", "",	""),         
    new cr.Property(ept_combo, "Fullscreen control", "Disabled", "The enabled/disabled state of the Fullscreen control.", "Disabled|Enabled"),     
    new cr.Property(ept_combo, "Fullscreen control position", "Bottom center", "Specify the position of the control on the map.", "Bottom center|Bottom left|Bottom right|Left bottom|Left center|Left top|Right bottom|Right center|Right top|Top center|Top left|Top right"),      
    
    new cr.Property(ept_section, "UI - Map type", "",	""),      
    new cr.Property(ept_combo, "Map type control", "Enabled", "The initial enabled/disabled state of the Map type control.", "Disabled|Enabled"),         
    new cr.Property(ept_combo, "Map type control position", "Top right", "Specify the position of the control on the map.", "Bottom center|Bottom left|Bottom right|Left bottom|Left center|Left top|Right bottom|Right center|Right top|Top center|Top left|Top right"),       
    new cr.Property(ept_combo, "Map type control style", "Default", "Select what style of map type control to display.", "Default|Dropdown menu|Horizontal bar"),       

    new cr.Property(ept_section, "UI - Zoom", "",	""),       
    new cr.Property(ept_integer, "Max zoom level", -1, "Max zoom level of the map. Set (-1) to ignore this parameter."),  
    new cr.Property(ept_integer, "Min zoom level", -1, "Min zoom level of the map. Set (-1) to ignore this parameter."),     
    new cr.Property(ept_combo, "Zoom control", "Enabled", "The enabled/disabled state of the Zoom control.", "Disabled|Enabled"),         
    new cr.Property(ept_combo, "Zoom control position", "Top left", "Specify the position of the control on the map.", "Bottom center|Bottom left|Bottom right|Left bottom|Left center|Left top|Right bottom|Right center|Right top|Top center|Top left|Top right"),    
    new cr.Property(ept_combo, "Double-click zoom", "Enabled", "Enables/disables zoom and center on double click.", "Disabled|Enabled"), 
    new cr.Property(ept_combo, "Scroll wheel", "Enabled", "If false, disables scrollwheel zooming on the map.", "Disabled|Enabled"),  

    new cr.Property(ept_section, "UI - Rotate", "",	""),   
    new cr.Property(ept_combo, "Rotate control", "Enabled", "The enabled/disabled state of the Rotate control.", "Disabled|Enabled"),    
    new cr.Property(ept_combo, "Rotate control position", "Top left", "Specify the position of the control on the map.", "Bottom center|Bottom left|Bottom right|Left bottom|Left center|Left top|Right bottom|Right center|Right top|Top center|Top left|Top right"),   

    new cr.Property(ept_section, "UI - Scale", "",	""),   
    new cr.Property(ept_combo, "Scale control", "Enabled", "The initial enabled/disabled state of the Scale control.", "Disabled|Enabled"),   
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
	this.just_inserted = false;
}

IDEInstance.prototype.OnCreate = function()
{
	this.instance.SetHotspot(new cr.vector2(0, 0));
}

IDEInstance.prototype.OnInserted = function()
{
	this.instance.SetSize(new cr.vector2(150, 22));
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
	if (!this.font)
		this.font = renderer.CreateFont("Arial", 14, false, false);
		
	renderer.SetTexture(null);
	var quad = this.instance.GetBoundingQuad();
	renderer.Fill(quad, cr.RGB(224, 224, 224));
	renderer.Outline(quad, cr.RGB(0, 0, 0));
	
	cr.quad.prototype.offset.call(quad, 0, 2);
	var rc = new cr.rect();
	cr.quad.prototype.bounding_box.call(quad, rc);

	this.font.DrawText("Youtube player",
						rc,
						cr.RGB(0, 0, 0),
						ha_center);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}