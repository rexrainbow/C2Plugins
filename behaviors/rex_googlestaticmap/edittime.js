function GetBehaviorSettings()
{
	return {
		"name":			"Google static map",
		"id":			"Rex_GoogleStaticMap",
		"description":	"Display google static map.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_googlestaticmap.html",
		"category":		"Rex - Web",
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On map loaded", "Map", "On map loaded", "Triggered while the map has loaded.", "OnMapLoaded");

//////////////////////////////////////////////////////////////
// Actions 
AddAction(10, 0, "Load mao", "Map", "Load map", "Load map image into canvas.", "LoadMap");

//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [    
	new cr.Property(ept_combo, "Initial loading", "Yes", "Enable if you wish to load map at the start of the layout.", "No|Yes"),
    new cr.Property(ept_text, "Center", "Taiwan", "The center of the map, could be location or {latitude,longitude}, or string address."),	
    new cr.Property(ept_integer, "Zoom level", 10, "Zoom level of the map."),
    new cr.Property(ept_combo, "Map type", "Roadmap", "Map type.", "Roadmap|Satellite|Terrain|Hybrid"),   
    new cr.Property(ept_combo, "Format", "png8", "Map type.", "png8|png32|gif|jpg|jpg-baseline"),
    new cr.Property(ept_text, "Marker locations", "", 'Marker locations separated by "|" character.'),	
    new cr.Property(ept_combo, "Marker size", "Middle", "The size of marker.", "Tiny|Middle|Small"),    
    new cr.Property(ept_text, "Marker color", "", 'The color of marker. Set "" to be default color.'),
    new cr.Property(ept_text, "Marker label", "", 'A single upper chaeacter {A-Z, 0-9} which displayed in marker size to "Middle".'),    
    new cr.Property(ept_text, "Path locations", "", 'Path locations separated by "|" character.'),
    new cr.Property(ept_integer, "Path weight", 5, "The thickness of the path in pixels."),  
    new cr.Property(ept_text, "Path color", "", 'The color of path. Set "" to be default color.'),    
    //new cr.Property(ept_text, "Area fill color", "", 'The color to fill the polygonal area. Set "" to be default color.'),     
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
