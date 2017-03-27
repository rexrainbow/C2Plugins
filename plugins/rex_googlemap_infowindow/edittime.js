function GetPluginSettings()
{
	return {
		"name":			"Info window",
		"id":			"rex_googlemap_infowindow",
		"version":		"0.1",
		"description":	"Info window of google map.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_googlemap_infowindow.html",
		"category":		"Rex - Web - Google map",
		"type":			"object",			// not in layout
		"rotatable":	false,
	};
};

////////////////////////////////////////
// Conditions
                      
////////////////////////////////////////
// Actions
AddObjectParam("Map", "Map object.");         
AddNumberParam("Latitude", "Latitude.", 0);
AddNumberParam("Longitude", "Longitude.", 0);
AddAction(1, 0, "Put on map", "Put", 
          "Put on <i>{0}</i> at latitude-longitude ( <i>{1}</i>, <i>{2}</i> )", 
          "Put this info window on map.", "PutOnMap");
          
AddAction(2, 0, "Close", "Close", 
          "Close", 
          "Close.", "Close");   
                 
AddObjectParam("Marker", "Marker.");
AddAction(3, 0, "Put above marker", "Put", 
          "Put above <i>{0}</i>", 
          "Put this info window above marker.", "PutOnMarker");          

AddStringParam("Content", "This can be an HTML element, a plain-text string, or a string containing HTML.", '""');  
AddAction(21, 0, "Set content", "Content", 
          "Set content to <i>{0}</i>", 
          "Set content.", "SetContent"); 
          
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get latitude", "Position", "Latitude", "Get latitude of current position.");
AddExpression(2, ef_return_number, "Get longitude", "Position", "Longitude", "Get longitude of current position.");
AddExpression(3, ef_return_string, "Get content", "Content", "Content", "Get content.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Content", "", "Content to display in the InfoWindow. This can be an HTML element, a plain-text string, or a string containing HTML. The InfoWindow will be sized according to the content. To set an explicit size for the content, set content to be a HTML element with that size."),         
    new cr.Property(ept_float, "Max width", -1, "Maximum width of the infowindow, regardless of content's width. This value is only considered if it is set before a call to open. Set -1 to use default width"),     
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
