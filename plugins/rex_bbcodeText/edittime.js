function GetPluginSettings()
{
	return {
		"name":			"BBcode Text",
		"id":			"rex_bbcodeText",
		"version":		"0.1",
		"description":	"Displays text with bbcode protocol.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Rex - Text",
		"type":			"world",			// appears in layout
		"rotatable":	true,				// can be rotated in layout
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces | pf_effects,
	};
};

// Conditions, actions and expressions
AddStringParam("Text to compare", "Enter the text to compare with the object's content.", "\"\"");
AddComboParamOption("Ignore case");
AddComboParamOption("Case sensitive");
AddComboParam("Case sensitivity", "Choose whether capital letters count as different to lowercase.  If ignoring case, \"ABC\" matches \"abc\".", 0);
AddCondition(0, 0, "Compare text", "Text", "Text is <b>{0}</b> <i>({1})</i>", "Compare the text in this object.", "CompareText");

////////////////////////
AddAnyTypeParam("Text", "Enter the text to set the object's content to.", "\"\"");
AddAction(0, 0, "Set text", "Text", "Set text to <i>{0}</i>", "Set the text of this object.", "SetText");

AddAnyTypeParam("Text", "Enter the text to append to the object's content.", "\"\"");
AddAction(1, 0, "Append text", "Text", "Append <i>{0}</i>", "Add text to the end of the existing text.", "AppendText");

AddStringParam("Font face", "The new font face name to set.", "\"Arial\"");
AddComboParamOption("normal");
AddComboParamOption("bold");
AddComboParamOption("italic");
AddComboParamOption("bold and italic");
AddComboParam("Style", "Choose the style for the given font face.");
AddAction(2, 0, "Set font face", "Appearance", "Set font face to <i>{0}</i> (<i>{1}</i>)", "Set the font face used to display text.", "SetFontFace");

AddNumberParam("Size (pt)", "The new font size.", "12");
AddAction(3, 0, "Set font size", "Appearance", "Set font size to <i>{0}</i> pt", "Set the font size.", "SetFontSize");

AddAnyTypeParam("Color", "The new font color, in the form rgb(r, g, b).", '"rgb(0, 0, 0)"');
AddAction(4, 0, "Set font color", "Appearance", "Set font color to <i>{0}</i>", "Set the font color.", "SetFontColor");

AddStringParam("Family name", "Enter the font family name.");
AddStringParam("CSS URL", "Enter the web URL to the CSS file referencing the web font.", "\"http://\"");
AddAction(5, 0, "Set web font", "Appearance", "Set web font <i>{0}</i> from <i>{1}</i>", "Set the font face from an online web font.", "SetWebFont");

AddComboParamOption("Normal");
AddComboParamOption("Additive");
AddComboParamOption("XOR");
AddComboParamOption("Copy");
AddComboParamOption("Destination over");
AddComboParamOption("Source in");
AddComboParamOption("Destination in");
AddComboParamOption("Source out");
AddComboParamOption("Destination out");
AddComboParamOption("Source atop");
AddComboParamOption("Destination atop");
AddComboParam("Blend mode", "Choose the new blend mode for this object.");
AddAction(6, 0, "Set blend mode", "Appearance", "Set blend mode to <i>{0}</i>", "Set the background blend mode for this object.", "SetEffect");

AddComboParamOption("normal");
AddComboParamOption("bold");
AddComboParamOption("italic");
AddComboParamOption("bold and italic");
AddComboParam("Style", "Choose the style for the given font face.");
AddAction(50, af_deprecated, "Set font style", "Appearance", "Set font style <i>{0}</i>", "Set the font style.", "SetFontStyle");

AddStringParam("Font face", "The new font face name to set.", "\"Arial\"");
AddAction(51, 0, "Set font face only", "Appearance", "Set font face to <i>{0}</i>", "Set the font face.", "SetFontFace2");

AddNumberParam("Line height", "Offset to the default line height, in pixels. 0 is default line height", 0);      
AddAction(52, 0, "Set line height", "Properties", 
          "Set line height to <i>{0}</i>", 
          "Set line height.", "SetLineHeight");

AddComboParamOption("Left");
AddComboParamOption("Center");
AddComboParamOption("Right");
AddComboParam("Horizontal alignment", "Horizontal alignment of the text", 0);          
AddAction(53, 0, "Set horizontal alignment", "Properties", 
          "{my} Set horizontal alignment to <i>{0}</i>", 
          "Set horizontal alignment.", "SetHorizontalAlignment"); 
          
AddNumberParam("Horizontal alignment", "Horizontal alignment. 0=Left, 1=Center. 2=Right", 0);          
AddAction(54, 0, "Set horizontal alignment (#)", "Properties", 
          "{my} Set horizontal alignment to <i>{0}</i>", 
          "Set horizontal alignment.", "SetHorizontalAlignment"); 
          
AddComboParamOption("Top");
AddComboParamOption("Center");
AddComboParamOption("Bottom");
AddComboParam("Vertical alignment", "Horizontal alignment of the text", 0);          
AddAction(55, 0, "Set Vertical alignment", "Properties", 
          "{my} Set vertical alignment to <i>{0}</i>", 
          "Set vertical alignment.", "SetVerticalAlignment"); 

AddNumberParam("Vertical alignment", "Vertical alignment. 0=Top, 1=Center. 2=Bottom", 0);          
AddAction(56, 0, "Set Vertical alignment (#)", "Properties", 
          "{my} Set vertical alignment to <i>{0}</i>", 
          "Set vertical alignment.", "SetVerticalAlignment"); 
          
AddComboParamOption("Word");
AddComboParamOption("Character");
AddComboParam("Wrapping", "Wrap text by space-separated words or nearest character", 0);          
AddAction(57, 0, "Set wrapping", "Properties", 
          "{my} Set wrapping to <i>{0}</i>", 
          "Set wrapping.", "SetWrapping");   

AddNumberParam("Wrapping", "Wrap text. 0=Word, 1=Character", 0);    
AddAction(58, 0, "Set wrapping (#)", "Properties", 
          "{my} Set wrapping to <i>{0}</i>", 
          "Set wrapping.", "SetWrapping");   

AddNumberParam("Offset X", "Offset X of shadow, in pixels.", 10);
AddNumberParam("Offset Y", "Offset Y of shadow, in pixels.", 10);
AddNumberParam("Blur", "Blur of shadow, in pixels.", 20);    
AddAnyTypeParam("Color", "The new shadow color, in the form rgb(r, g, b).", '"rgb(0, 0, 0)"');
AddAction(61, 0, "Set shadow", "Shadow", 
          "Set shadow with offset to (<i>{0}</i>, <i>{1}</i>), blur to <i>{2}</i>, color to <i>{3}</i>", 
          "Set shadow.", "SetShadow");
          
AddNumberParam("Thickness", "Thickness in pixels.", 1);
AddAction(71, 0, "Set thickness", "Underline", "Set thickness to <i>{0}</i>", "Set thickness of underline.", "SetThickness"); 
         
AddNumberParam("Offset", "Offset Y in pixels.", 1);
AddAction(72, 0, "Set offset Y", "Underline", "Set offset Y to <i>{0}</i>", "Set offset Y of underline.", "SetOffsetY"); 

AddNumberParam("line width", "Line width in pixels.", 1);
AddAction(81, 0, "Set line width", "Stroke", "Set line width to <i>{0}</i>", "Set line width of stroke.", "SetStrokeLineWidth"); 
          
AddComboParamOption("Miter");
AddComboParamOption("Round");
AddComboParamOption("Bevel");
AddComboParam("Line join", "Line join of the stroke", 0);
AddAction(82, 0, "Set line join", "Stroke", "Set line join to <i>{0}</i>", "Set line join of stroke.", "SetStrokeLineJoin"); 

AddAnyTypeParam("Color", 'The new background color, in the form rgb(r, g, b). Set "" to be transparent.', '""');
AddAction(91, 0, "Set background color", "Background", "Set background to <i>{0}</i>", "Set background color.", "SetBackgroundColor");
		  

AddNumberParam("Width", "Canvas width in pixels.", 0);
AddNumberParam("Height", "Canvas height in pixels.", 0);
AddAction(101, 0, "Lock canvas size", "Canvas", "Lock canvas size to <i>{0}</i>x<i>{1}</i>", "Lock canvas size.", "LockCanvasSize"); 

AddAction(102, 0, "Unlock canvas size", "Canvas", "Unlock canvas size", "Unlock canvas size.", "UnLockCanvasSize"); 

AddStringParam("Key", "Index of this image.", '""');
AddObjectParam("Image", "Current frame of Sprite, or canvas object.");
AddNumberParam("Y offset", "Y offset of this image.", 0);
AddAction(111, 0, "Add image", "Image bank", 
          "Add <i>{1}</i> with key <i>{0}</i>, Y offset to <i>{2}</i>","Add image from sprite or canvas.", "AddImage"); 

AddStringParam("Key", "Index of this image.", '""');
AddAction(112, 0, "Remove image", "Image bank", 
          "Remve image with key <i>{0}</i>","Remove image by key.", "RemoveImage"); 
          
AddAction(113, 0, "Remove all", "Image bank", 
          "Remve all images","Remove all images.", "RemoveAll"); 
          

////////////////////////
AddExpression(0, ef_return_string | ef_variadic_parameters, "Get text", "Text", "Text", "Get the object's text. Add 2nd/3rd parameter for start/end index");
AddExpression(1, ef_return_string, "Get face name", "Appearance", "FaceName", "Get the current font face name.");
AddExpression(2, ef_return_number, "Get face size", "Appearance", "FaceSize", "Get the current font face size (pt).");
AddExpression(3, ef_return_number, "Get text width", "Text", "TextWidth", "Get the width extent of the text in the object in pixels.");
AddExpression(4, ef_return_number, "Get text height", "Text", "TextHeight", "Get the height extent of the text in the object in pixels.");
AddExpression(5, ef_return_string, "Get raw text", "Text", "RawText", "Get the object's raw text.");

AddStringParam("Name", "Property name.", '""');
AddExpression(21, ef_return_any | ef_variadic_parameters, "Get property value", "Class", 
              "LastClassPropValue", 
              "Get property value of last class. Add 2nd parameter for default value if this property had not found.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Text", lang("project\\misc\\text-initialtext"), "Text to display."),
	new cr.Property(ept_combo, "Initial visibility", "Visible",	"Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
	new cr.Property(ept_font, "Font", "Arial,-16",	"Choose the font to display.  This applies to all instances of this type."),
	new cr.Property(ept_color, "Color", cr.RGB(0, 0, 0),	"Color of the text."),
	new cr.Property(ept_combo, "Horizontal alignment", "Left", "Horizontal alignment of the text.", "Left|Center|Right"),
	new cr.Property(ept_combo, "Vertical alignment", "Top", "Vertical alignment of the text.", "Top|Center|Bottom"),
	new cr.Property(ept_combo,	"Hotspot", "Top-left", "Choose the location of the hot spot in the object.", "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right"),
	new cr.Property(ept_combo, "Wrapping", "Word", "Wrap text by space-separated words or nearest character.", "Word|Character"),
	new cr.Property(ept_float, "Line height", 0, "Offset to the default line height, in pixels. 0 is default line height."),	
	new cr.Property(ept_combo, "Baseline", "Top", "Baseline of text alignment.", "Alphabetic|Top"),
	new cr.Property(ept_float, "Shift down", 13, "Shift the text down for alphabetic baseline, in pixels."),	
    new cr.Property(ept_combo, "Force render", "No", "Force rendering immediately after any property setting.", "No|Yes"),	
    new cr.Property(ept_combo, "Lock canvas size", "No", "Lock canvas size to initial size.", "No|Yes"),

    new cr.Property(ept_section, "Stroke", "",	""),  
    new cr.Property(ept_integer, "Stroke line width", 1, "Line width of stroke, in pixels."),  
	new cr.Property(ept_combo, "Stroke line join", "Miter", "Baseline of text alignment.", "Miter|Round|Bevel"),
    
    
    new cr.Property(ept_section, "Underline", "",	""),  
    new cr.Property(ept_integer, "Underline thickness", 1, "Thickness of underline, in pixels."),
    new cr.Property(ept_integer, "Underline offset Y", 0, "Offset Y of underline, in pixels."),    
    
    new cr.Property(ept_section, "Shadow", "",	""),    
    new cr.Property(ept_integer, "Shadow offset X", 10, "Offset X of shadow, in pixels."),
    new cr.Property(ept_integer, "Shadow offset Y", 10, "Offset Y of shadow, in pixels."),    
    new cr.Property(ept_integer, "Shadow blur", 20, "Blur of shadow, in pixels."),       
	new cr.Property(ept_color, "Shadow color", cr.RGB(0, 0, 0),	"Color of the shadow."),

    new cr.Property(ept_section, "Background", "",	""),    
	new cr.Property(ept_text, "Background color", "", 'Background color, Set "" to be transparent.'),
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
	this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnInserted = function()
{
	// Default to 200x30 with top left hotspot
	this.instance.SetSize(new cr.vector2(200, 30));
	
	this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));	
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
		this.instance.SetHotspot(GetHotspot(this.properties["Hotspot"]));
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
		var valign = va_top;
		
		var hprop = this.properties["Horizontal alignment"];
		var vprop = this.properties["Vertical alignment"];
		
		if (hprop == "Center")
			halign = ha_center;
		else if (hprop == "Right")
			halign = ha_right;
			
		if (vprop == "Center")
			valign = ha_center;
		else if (vprop == "Bottom")
			valign = va_bottom;
		
		this.font.DrawText(this.properties["Text"],
								this.instance.GetBoundingQuad(),
								this.properties["Color"],
								halign,
								this.instance.GetOpacity(),
								this.instance.GetAngle(),
								(this.properties["Wrapping"] === "Word"),
								this.properties["Line height"],
								valign);
	}
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
	this.font = null;		// drop reference to created font
	this.old_font_str = "";
}
