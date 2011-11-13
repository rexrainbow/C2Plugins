function GetPluginSettings()
{
	return {
		"name":			"Text",
		"id":			"Rex_TextPlus",
		"description":	"Enhancement text object.",
		"author":		"Scirra",
		"help url":		"http://www.scirra.com",
		"category":		"General",
		"type":			"world",			// appears in layout
		"rotatable":	false,				// cannot be rotated in layout
		"flags":		pf_position_aces | pf_size_aces | pf_appearance_aces | pf_zorder_aces
	};
};

// Conditions, actions and expressions
AddStringParam("Text to compare", "Enter the text to compare with the object's content.", "\"\"");
AddComboParamOption("Ignore case");
AddComboParamOption("Case sensitive");
AddComboParam("Case sensitivity", "Choose whether capital letters count as different to lowercase.  If ignoring case, \"ABC\" matches \"abc\".", 0);
AddCondition(0, 0, "Compare text", "Text", "Text is <b>{0}</b> <i>({1})</i>", "Compare the text in this object.", "CompareText");

AddAnyTypeParam("Text", "Enter the text to set the object's content to.", "\"\"");
AddAction(0, 0, "Set text", "Text", "Set text to <i>{0}</i>", "Set the text of this object.", "SetText");

AddAnyTypeParam("Text", "Enter the text to append to the object's content.", "\"\"");
AddAction(1, 0, "Append text", "Text", "Append <i>{0}</i>", "Add text to the end of the existing text.", "AppendText");

AddExpression(0,	ef_return_string,	"Get text",	"Text", "Text", "Get the object's text.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text,		"Text",		"Text",			"Text to display."),
	new cr.Property(ept_combo, "Initial visibility",	"Visible",	"Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
	new cr.Property(ept_font, 		"Font",		"Arial,-16",	"Choose the font to display.  This applies to all instances of this type."),
	new cr.Property(ept_color,		"Color",	cr.RGB(0, 0, 0),	"Color of the text."),
	new cr.Property(ept_combo,		"Horizontal alignment", "Left", "Horizontal alignment of the text.", "Left|Center|Right")
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
		
	// Properties for font
	this.font_str = "Arial,-16";		// default font string
	this.old_font_str = "";				// last font string, in case not changed
	this.recreate_font = true;			// font not yet created
	this.font = null;					// handle to font in IDE
}

// Called when drawing the text and the font needs to be recreated
IDEInstance.prototype.RecreateFont = function(renderer)
{
	// The font hasn't really changed: don't actually recreate
	if (this.font_str == this.old_font_str)
	{
		this.recreate_font = false;
		return;
	}
		
	var had_font = false;
	
	// Release any existing font first
	if (this.font != null)
	{
		renderer.ReleaseFont(this.font);
		had_font = true;
	}
	
	// Parse the font details out of the font string
	var font_info = cr.ParseFontString(this.font_str);
	
	// Attempt to create the font as requested
	this.font = renderer.CreateFont(font_info.face_name, font_info.face_size, font_info.bold, font_info.italic);
	
	// Creating the font failed: fall back to arial
	if (this.font == null)
	{
		this.font = renderer.CreateFont("Arial", font_info.face_size, false, false);
		
		// Notify the user if the font has been changed via the property grid.  Don't notify
		// if this error happens just loading a layout.
		if (had_font)
		{
			BalloonTipLastProperty("Font not supported",
								   "The font you chose does not appear to be supported by Construct 2, for technical reasons.  "
								   + "The object has fallen back to 'Arial'.  Click the help link for more information.",
								   bti_warning);
		}
	}
	else if (!this.font.exact_match && had_font)
	{
		// The font was not an exact match.  Notify the user, but only when the font was changed,
		// don't display this when loading a layout.
		BalloonTipLastProperty("Font variation not supported",
							   "The exact font you chose does not appear to be supported by Construct 2, for technical reasons.  "
							   + "The object has fallen back to a different variation of the chosen font.  Click the help link for more information.",
							   bti_warning);
	}
	
	assert2(this.font != null, "Failed to create font or default Arial font");
		
	// Font has been created
	this.recreate_font = false;
	this.old_font_str = this.font_str;
}

IDEInstance.prototype.OnCreate = function()
{
	// Use upper-left hotspot
	this.instance.SetHotspot(new cr.vector2(0, 0));
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnInserted = function()
{
	// Default to 200x30 with top left hotspot
	this.instance.SetSize(new cr.vector2(200, 30));
	this.instance.SetHotspot(new cr.vector2(0, 0));
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
	// Recreate font if font property changed
	if (property_name == "Font")
	{
		this.font_str = this.properties["Font"];
		this.recreate_font = true;
	}
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
	// If the font is not yet created or needs recreating, recreate it
	if (this.font == null || this.recreate_font)
		this.RecreateFont(renderer);
		
	// If there is a font present, draw it
	if (this.font != null)
	{
		var halign = ha_left;
		
		if (this.properties["Horizontal alignment"] == "Center")
			halign = ha_center;
		else if (this.properties["Horizontal alignment"] == "Right")
			halign = ha_right;
		
		this.font.DrawText(this.properties["Text"],
								this.instance.GetBoundingRect(),
								this.properties["Color"],
								halign,
								this.instance.GetOpacity());
	}
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
	this.font = null;		// drop reference to created font
}
