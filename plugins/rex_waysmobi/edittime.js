function GetPluginSettings()
{
	return {
		"name":			"Waysmobi",
		"id":			"rex_waysmobi",
		"version":		"0.1",
		"description":	"Advertising of Waysmobi. http://www.kusogi.com/",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_waysmobi.html",
		"category":		"Web - Advertising",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces,
		"dependency":	"wsad.js"        
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
    new cr.Property(ept_text, "APID", "ZZZZZ0100", "APID."),
    new cr.Property(ept_combo, "Interstitial", "No", "Interstitial.", "No|Yes"),
    //new cr.Property(ept_combo,	"Initial visibility",	"Visible",	"Choose whether the video is visible on startup.", "Invisible|Visible")    
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