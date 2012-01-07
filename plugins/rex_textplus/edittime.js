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
		"rotatable":	true,				// can be rotated in layout
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Text to compare", "Enter the text to compare with the object's content.", "\"\"");
AddComboParamOption("Ignore case");
AddComboParamOption("Case sensitive");
AddComboParam("Case sensitivity", "Choose whether capital letters count as different to lowercase.  If ignoring case, \"ABC\" matches \"abc\".", 0);
AddCondition(0, 0, "Compare text", "Text", "Text is <b>{0}</b> <i>({1})</i>", "Compare the text in this object.", "CompareText");
AddCondition(1, cf_trigger, "On text typing", "Typing", "On typing", 
             "Triggered when text typing.", "OnTextTyping");
AddCondition(2, cf_trigger, "On typing completed", "Typing", "On typing completed", 
             "Triggered when typing completed.", "OnTypingCompleted");            
AddCondition(3, 0, "Is text typing", "Typing", "Is typing", 
             "Is text typing.", "IsTextTyping");

//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Text", "Enter the text to set the object's content to.", "\"\"");
AddAction(0, 0, "Set text", "Text", "Set text to <i>{0}</i>", "Set the text of this object.", "SetText");
AddAnyTypeParam("Text", "Enter the text to append to the object's content.", "\"\"");
AddAction(1, 0, "Append text", "Text", "Append <i>{0}</i>", "Add text to the end of the existing text.", "AppendText");
AddObjectParam("Timeline", "Timeline object for getting timer");
AddAction(2, 0, "Setup text-typing", "Setup", 
          "Get timer from <i>{0}</i> for text-typing", 
          "Setup text-typing.", "SetupTimer");
AddAnyTypeParam("Text", "Enter the text to set the object's content to.", "\"\"");
AddNumberParam("Speed", "1 letter per seconds", 0.1);
AddAction(3, 0, "Type text", "Type", 
          "Type <i>{0}</i> at 1 letter per <i>{1}</i> seconds", 
          "Type text letter by letter.", "TypeText");
AddNumberParam("Speed", "1 letter per seconds", 0.1);
AddAction(4, 0, "Set typing speed", "Type", 
          "Set typing speed to <i>{0}</i> seconds", 
          "Set typing speed.", "SetTypingSpeed");      
AddStringParam("color", "Use color name, hex \"#FFA500\", \"rgb(0-255,0-255,0-255)\", \"rgba(0-255,0-255,0-255,0-1)\", \"hsl(0-360,0-100%,0-100%)\", or \"hsla(0-360,0-100%,0-100%,0-1)\" ", "\"black\"");
AddAction(5, 0, "Set text color", "Text", 
          "Set text color to <i>{0}</i>", 
          "Set text color.", "SetTextColor"); 
          
AddStringParam("Font face", "The new font face name to set.", "\"Arial\"");
AddComboParamOption("normal");
AddComboParamOption("bold");
AddComboParamOption("italic");
AddComboParamOption("bold and italic");
AddComboParam("Style", "Choose the style for the given font face.");
AddAction(6, 0, "Set font face", "Appearance", "Set font face to <i>{0}</i> (<i>{1}</i>)", "Set the font face used to display text.", "SetFontFace");

AddNumberParam("Size (pt)", "The new font size.", "12");
AddAction(7, 0, "Set font size", "Appearance", "Set font size to <i>{0}</i> pt", "Set the font size.", "SetFontSize");

AddNumberParam("Color", "The new font color, in the form rgb(r, g, b).", "rgb(0, 0, 0)");
AddAction(8, 0, "Set font color", "Appearance", "Set font color to <i>{0}</i>", "Set the font color.", "SetFontColor");

AddStringParam("Family name", "Enter the font family name.");
AddStringParam("CSS URL", "Enter the web URL to the CSS file referencing the web font.", "\"http://\"");
AddAction(9, 0, "Set web font", "Appearance", "Set web font <i>{0}</i> from <i>{1}</i>", "Set the font face from an online web font.", "SetWebFont");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string,	"Get text",	"Text", "Text", "Get the object's text.");
AddExpression(1, ef_return_number,	"Get typing speed",	"Type", "TypingSpeed", "Get typing speed.");
AddExpression(2,	ef_return_number,	"Get face size",	"Appearance",	"FaceSize",	"Get the current font face size (pt).");
AddExpression(3,	ef_return_number,	"Get text width",	"Text",			"TextWidth", "Get the width extent of the text in the object in pixels.");
AddExpression(4,	ef_return_number,	"Get text height",	"Text",			"TextHeight", "Get the height extent of the text in the object in pixels.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text,		"Text",		"Text",			"Text to display."),
	new cr.Property(ept_combo, "Initial visibility",	"Visible",	"Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
	new cr.Property(ept_font, 		"Font",		"Arial,-16",	"Choose the font to display.  This applies to all instances of this type."),
	new cr.Property(ept_color,		"Color",	cr.RGB(0, 0, 0),	"Color of the text."),
	new cr.Property(ept_combo,		"Horizontal alignment", "Left", "Horizontal alignment of the text.", "Left|Center|Right"),
	new cr.Property(ept_combo,	"Hotspot",				"Top-left",	"Choose the location of the hot spot in the object.", "Top-left|Center")
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
	if (this.properties["Hotspot"] === "Top-left")
		this.instance.SetHotspot(new cr.vector2(0, 0));
	else
		this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
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
	if (property_name === "Font")
	{
		this.font_str = this.properties["Font"];
		this.recreate_font = true;
	}
	else if (property_name === "Hotspot")
	{
		if (this.properties["Hotspot"] === "Top-left")
			this.instance.SetHotspot(new cr.vector2(0, 0));
		else
			this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
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
								this.instance.GetBoundingQuad(),
								this.properties["Color"],
								halign,
								this.instance.GetOpacity(),
								this.instance.GetAngle());
	}
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
	this.font = null;		// drop reference to created font
	this.old_font_str = "";
}
