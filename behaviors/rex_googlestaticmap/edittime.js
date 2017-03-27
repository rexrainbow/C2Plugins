function GetBehaviorSettings()
{
	return {
		"name":			"Google static map",
		"id":			"Rex_GoogleStaticMap",
		"description":	"Display google static map on sprite or canvas.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_googlestaticmap.html",
		"category":		"Rex - Web - Google map",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On map loaded", "Map", "On map loaded", "Triggered while the map has loaded.", "OnMapLoaded");

//////////////////////////////////////////////////////////////
// Actions 
AddComboParamOption("Roadmap");
AddComboParamOption("Satellite");
AddComboParamOption("Terrain");
AddComboParamOption("Hybrid");
AddComboParam("Map type", "Map type.",0);
AddAction(1, 0, "Set map type", "Map type", 
          "{my} set map type to <i>{0}</i>", 
          "Set map type.", "SetMapType");

AddComboParamOption("png8");
AddComboParamOption("png32");
AddComboParamOption("gif");
AddComboParamOption("jpg");
AddComboParamOption("jpg-baseline");
AddComboParam("Image format", "Image format.",0);
AddAction(2, 0, "Set image format", "Image format", 
          "{my} set image format to <i>{0}</i>", 
          "Set image format.", "SetImageFormat");          
          
AddNumberParam("Zoom level", "Zoom level of the map. Set (-1) to clean this parameter.", 10);
AddAction(3, 0, "Set zoom level", "Zoom level", 
          "{my} set zoom level to <i>{0}</i>", 
          "Set zoom level.", "SetZoomLevel");              
          
AddStringParam("Center", "The center of the map, could be location or {latitude,longitude}, or string address.", '"London"');
AddAction(4, 0, "Set center", "Center", 
          "{my} set center to <i>{0}</i>", 
          "Set center of the map.", "SetCenter");          

AddAction(5, 0, "Clean all markers", "Marker", 
          "{my} clean all markers", 
          "Clean all markers.", "CleanMarkers"); 
          
AddStringParam("Locations", 'Marker locations separated by "|" character.', '""');
AddComboParamOption("Tiny");
AddComboParamOption("Middle");
AddComboParamOption("Small");
AddComboParam("Size", "The size of marker.",1);
AddStringParam("Color", 'The color of marker. Set "" to be default color.', '""');
AddStringParam("Label", 'A single upper character {A-Z, 0-9} which displayed in marker size to "Middle".', '""');
AddStringParam("Icon", "Specifies a URL to use as the marker's custom icon. Images may be in PNG, JPEG or GIF formats, though PNG is recommended.", '""');
AddAction(6, 0, "Add marker", "Marker", 
          "{my} add <i>{0}</i> to marker with size to <i>{1}</i>, color to <i>{2}</i>, label to <i>{3}</i>, icon to <i>{4}</i>", 
          "Add marker.", "AddMarker");  

AddAction(7, 0, "Clean all paths", "Path", 
          "{my} clean all paths", 
          "Clean all paths.", "CleanPaths"); 
          
AddStringParam("Path start", 'Path locations separated by "|" character.', '""');
AddStringParam("Path end", 'Path locations separated by "|" character.', '""');
AddNumberParam("Weight", "The thickness of the path in pixels.", 5);
AddStringParam("Path color", 'The color of path. Set "" to be default color.', '""');
AddStringParam("Area fill color", 'The color to fill the polygonal area. Set "" to be default color.', '""');
AddAction(8, 0, "Add path", "Path", 
          "{my} add path from <i>{0}</i> to <i>{1}</i> with weight to <i>{2}</i>, path color to <i>{3}</i>, area fill color to <i>{4}</i>", 
          "Add path.", "AddPath");           
          
AddAction(10, 0, "Load map", "Map", "Load map", "Load map image into canvas.", "LoadMap");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get request map url", "URL", "MapURL",  "Get request map url.");  
              
ACESDone();

// Property grid properties for this plugin
var property_list = [    
	new cr.Property(ept_combo, "Initial loading", "Yes", "Enable if you wish to load map at the start of the layout.", "No|Yes"),
    new cr.Property(ept_combo, "Map type", "Roadmap", "Map type.", "Roadmap|Satellite|Terrain|Hybrid"),   
    new cr.Property(ept_combo, "Format", "png8", "Map type.", "png8|png32|gif|jpg|jpg-baseline"),
    new cr.Property(ept_integer, "Zoom level", 10, "Zoom level of the map. Set (-1) to ignore this parameter."),    
    new cr.Property(ept_text, "Center", "London", "The center of the map, could be location or {latitude,longitude}, or string address."),	    
    new cr.Property(ept_text, "Marker locations", "", 'Marker locations separated by "|" character.'),	
    new cr.Property(ept_combo, "Marker size", "Middle", "The size of marker.", "Tiny|Middle|Small"),    
    new cr.Property(ept_text, "Marker color", "", 'The color of marker. Set "" to be default color.'),
    new cr.Property(ept_text, "Marker label", "", 'A single upper character {A-Z, 0-9} which displayed in marker size to "Middle".'),    
    new cr.Property(ept_text, "Marker icon", "", "Specifies a URL to use as the marker's custom icon. Images may be in PNG, JPEG or GIF formats, though PNG is recommended."),    
    new cr.Property(ept_text, "Path locations", "", 'Path locations separated by "|" character.'),
    new cr.Property(ept_integer, "Path weight", 5, "The thickness of the path in pixels."),  
    new cr.Property(ept_text, "Path color", "", 'The color of path. Set "" to be default color.'),    
    new cr.Property(ept_text, "Area fill color", "", 'The color to fill the polygonal area. Set "" to be default color.'),     
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
