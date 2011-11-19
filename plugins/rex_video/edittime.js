function GetPluginSettings()
{
	return {
		"name":			"Video",
		"id":			"Rex_Video",
		"description":	"Play video.",
		"author":		"",
		"help url":		"",
		"category":		"Html5",
		"type":			"world",			// appears in layout
		"rotatable":	false,
		"flags":		pf_position_aces | pf_size_aces
	};
};

////////////////////////////////////////
// Conditions

////////////////////////////////////////
// Actions

////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Source", "", "The location (URL) of the video file."),    
    new cr.Property(ept_text, "Poster", "", 
                    "An image to be shown while the video is downloading."),        
    new cr.Property(ept_combo,"Autoplay", "No", 
                    "The video will start playing as soon as it is ready.", "No|Yes"),
    new cr.Property(ept_combo,"Controls", "No", 
                    "Add controls on video.", "No|Yes"),
    new cr.Property(ept_combo,"Preload", "None", 
                    "Specifies if and how the author thinks the video should be loaded when the page loads.", "Auto|Metadata|None"),  
    new cr.Property(ept_combo,"Loop", "No", 
                    "The video will start over again, every time it is finished.", "No|Yes"),      
    new cr.Property(ept_combo,"Muted", "No", 
                    "The audio output of the video should be muted.", "No|Yes"),        
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
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}