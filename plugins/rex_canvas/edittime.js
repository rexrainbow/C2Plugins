function GetPluginSettings()
{
	return {
		"name":			"Canvas",
		"id":			"Rex_canvas",
		"version":		"0.1",
		"description":	"Canvas element and api. https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_canvas.html",
		"category":		"Rex - Canvas",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_texture | pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_tiling | pf_zorder_aces | pf_effects,
        "dependency":	"zlib_and_gzip.min.js"        
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(2000, cf_trigger, "On image URL loaded", "Web", "On image URL loaded", "Triggered after 'Load image from URL' when the image has finished loading.", "OnURLLoaded");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Js code", "Code string for drawing.", '""');
AddAction(1, 0, "Eval", "Script", 
    "Run <i>{0}</i>", 
    "Run code to draw on canvas (ctx).", "Eval");
    
AddNumberParam("width", "canvas width", 100);
AddNumberParam("height", "canvas height", 100);
AddAction(2, 0, "Resize canvas", "Canvas", "Resize canvas to ({0},{1})", "Resizes the canvas.", "ResizeCanvas");    
    
// Drawing rectangles
AddNumberParam("x", "The x axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("width", "The rectangle's width.", 100);
AddNumberParam("height", "The rectangle's height.", 100);
AddAction(201, 0, "Clear rectangle", "Drawing rectangles", 
    "Clear rectangle (x,y) = (<i>{0}</i>,<i>{1}</i>), (width, height) = (<i>{2}</i>,<i>{3}</i>)", 
    "Clear rectangle.", "ClearRect");
    
AddNumberParam("x", "The x axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("width", "The rectangle's width.", 100);
AddNumberParam("height", "The rectangle's height.", 100);
AddAction(202, 0, "Fill rectangle", "Drawing rectangles", 
    "Fill rectangle (x,y) = (<i>{0}</i>,<i>{1}</i>), (width, height) = (<i>{2}</i>,<i>{3}</i>)", 
    "Fill rectangle.", "FillRect");    
    
AddNumberParam("x", "The x axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("width", "The rectangle's width.", 100);
AddNumberParam("height", "The rectangle's height.", 100);
AddAction(203, 0, "Stroke rectangle", "Drawing rectangles", 
    "Stroke rectangle (x,y) = (<i>{0}</i>,<i>{1}</i>), (width, height) = (<i>{2}</i>,<i>{3}</i>)", 
    "Stroke rectangle.", "StrokeRect");        

// Drawing text    
AddStringParam("Text", "The text to render.", '""');
AddNumberParam("x", "The x axis of the coordinate for the text starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the text starting point.", 0);
AddAction(301, 0, "Fill text", "Drawing text", 
    "Fill text <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>)", 
    "Fill text.", "FillText"); 
    
AddStringParam("Text", "The text to render.", '""');
AddNumberParam("x", "The x axis of the coordinate for the text starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the text starting point.", 0);
AddAction(302, 0, "Stroke text", "Drawing text", 
    "Stroke text <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>)", 
    "Stroke text.", "StrokeText");     
    
// Line styles
AddNumberParam("Width", "A number specifying the line width in space units. Zero, negative, Infinity and NaN values are ignored.", 1);
AddAction(401, 0, "Set line width", "Line styles", 
    "Set line width to <i>{0}</i>", 
    "Set line width.", "SetLineWidth");     
    
AddComboParamOption("butt");
AddComboParamOption("round");
AddComboParamOption("square");
AddComboParam("Cap", "How the end points of every line are drawn.");
AddAction(402, 0, "Set line cap", "Line styles", 
    "Set line cap to <i>{0}</i>" , 
    "How the end points of every line are drawn.", "SetLineCap");
 
AddStringParam("Cap", "How the end points of every line are drawn.", '""');
AddAction(403, 0, "Set line cap #", "Line styles", 
    "Set line cap to <i>{0}</i>", 
    "How the end points of every line are drawn.", "SetLineCap");    
    
AddComboParamOption("bevel");
AddComboParamOption("round");
AddComboParamOption("miter");
AddComboParam("Join", "How two connecting segments.");
AddAction(404, 0, "Set line join", "Line styles", 
    "Set line join to <i>{0}</i>",
    "How two connecting segments.", "SetLineJoin");
 
AddStringParam("Join", "How two connecting segments.", '""');
AddAction(405, 0, "Set line join #", "Line styles", 
    "Set line join to <i>{0}</i>",
    "How two connecting segments.", "SetLineJoin");      
    
AddNumberParam("Value", "A number specifying the line width in space units. Zero, negative, Infinity and NaN values are ignored.", 1);
AddAction(406, 0, "Set miter limit", "Line styles", 
    "Set miter limit to <i>{0}</i>", 
    "Set miter limit.", "SetMiterLimit");    

// TODO    
    
// Text styles    
AddStringParam("Font", "A DOMString parsed as CSS font value.", '"10px sans-serif"');
AddAction(501, 0, "Set font", "Text styles", 
    "Set font to <i>{0}</i>", 
    "Set font.", "SetFont"); 
    
AddComboParamOption("left");
AddComboParamOption("right");
AddComboParamOption("center");
AddComboParamOption("start");
AddComboParamOption("end");
AddComboParam("Align", "Specifies the current text alignment being used when drawing text.");
AddAction(502, 0, "Set text align", "Text styles", 
    "Set text align to <i>{0}</i>",
    "Specifies the current text alignment being used when drawing text.", "SetTextAlign");
 
AddStringParam("Align", "Specifies the current text alignment being used when drawing text.", '""');
AddAction(503, 0, "Set text align #", "Text styles", 
    "Set text align to <i>{0}</i>",
    "Specifies the current text alignment being used when drawing text.", "SetTextAlign"); 
    
AddComboParamOption("top");
AddComboParamOption("hanging");
AddComboParamOption("middle");
AddComboParamOption("alphabetic");
AddComboParamOption("ideographic");
AddComboParamOption("bottom");
AddComboParam("Baseline", "Specifies the current text baseline.");
AddAction(504, 0, "Set text baseline", "Text styles", 
    "Set text baseline to <i>{0}</i>",
    "Specifies the current text alignment being used when drawing text.", "SetTextBaseline");
 
AddStringParam("Baseline", "Specifies the current text baseline.", '""');
AddAction(505, 0, "Set text baseline #", "Text styles", 
    "Set text baseline to <i>{0}</i>",
    "Specifies the current text alignment being used when drawing text.", "SetTextBaseline"); 
    
// Fill and stroke styles
AddStringParam("Color", "A DOMString parsed as CSS <color> value.", '"black"');
AddAction(601, 0, "Set fill color", "Fill and stroke styles", 
    "Set fill color to <i>{0}</i>", 
    "Set fill color.", "SetFillColor"); 
    
AddStringParam("Color", "A DOMString parsed as CSS <color> value.", '"black"');
AddAction(602, 0, "Set stroke color", "Fill and stroke styles", 
    "Set stroke color to <i>{0}</i>", 
    "Set stroke color.", "SetStrokeColor");     
    
// TODO    

    
// Shadows
AddNumberParam("Level", "A float specifying the level of the blurring effect. The default value is 0. Negative, Infinity or NaN values are ignored.", 0);
AddAction(701, 0, "Set shadow blur", "Shadows", 
    "Set shadow blur to <i>{0}</i>", 
    "Set shadow blur.", "SetShadowBlur");    
    
AddStringParam("Color", "A DOMString parsed as CSS <color> value.", '"black"');
AddAction(702, 0, "Set shadow color", "Shadows", 
    "Set shadow color to <i>{0}</i>", 
    "Set shadow color.", "SetShadowColor");   
    
AddNumberParam("Offset", "A float specifying the distance that the shadow will be offset in horizontal distance. The default value is 0. Infinity or NaN values are ignored.", 0);
AddAction(703, 0, "Set shadow offsetX", "Shadows", 
    "Set shadow offsetX to <i>{0}</i>", 
    "Set shadow offsetX.", "SetShadowOffsetX");     
    
AddNumberParam("Offset", "A float specifying the distance that the shadow will be offset in vertical distance. The default value is 0. Infinity or NaN values are ignored.", 0);
AddAction(704, 0, "Set shadow offsetY", "Shadows", 
    "Set shadow offsetY to <i>{0}</i>", 
    "Set shadow offsetY.", "SetShadowOffsetY");
    
// Paths
AddAction(801, 0, "Begin path", "Paths", 
    "Begin path", 
    "Starts a new path by emptying the list of sub-paths. Call this method when you want to create a new path.", "BeginPath");
    
AddAction(802, 0, "Close path", "Paths", 
    "Close path", 
    "Causes the point of the pen to move back to the start of the current sub-path. It tries to draw a straight line from the current point to the start.", "ClosePath");
    
AddNumberParam("x", "The x axis of the point.", 0);
AddNumberParam("y", "The y axis of the point.", 0);
AddAction(803, 0, "Move to", "Paths", 
    "Move to (<i>{0}</i>,<i>{1}</i>)", 
    "Moves the starting point of a new sub-path to the (x, y) coordinates.", "MoveTo");       
    
AddNumberParam("x", "The x axis of the coordinate for the end of the line.", 0);
AddNumberParam("y", "The y axis of the coordinate for the end of the line.", 0);
AddAction(804, 0, "Line to", "Paths", 
    "Line to (<i>{0}</i>,<i>{1}</i>)", 
    "Connects the last point in the subpath to the x, y coordinates with a straight line.", "LineTo");  
    
AddNumberParam("cp1x", "The x axis of the coordinate for the first control point.", 0);
AddNumberParam("cp1y", "The y axis of the coordinate for first control point.", 0);
AddNumberParam("cp2x", "The x axis of the coordinate for the second control point.", 0);
AddNumberParam("cp2y", "ThThe y axis of the coordinate for the second control point.", 0);    
AddNumberParam("x", "The x axis of the coordinate for the end point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the end point.", 0);
AddAction(805, 0, "Bezier curve to", "Paths", 
    "Bezier curve to (<i>{4}</i>,<i>{5}</i>) with control points (<i>{0}</i>,<i>{1}</i>) , (<i>{2}</i>,<i>{3}</i>)", 
    "Adds a cubic Bezier curve to the path.", "BezierCurveTo");  
    
AddNumberParam("cpx", "The x axis of the coordinate for the control point.", 0);
AddNumberParam("cpy", "The y axis of the coordinate for the control point.", 0);   
AddNumberParam("x", "The x axis of the coordinate for the end point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the end point.", 0);
AddAction(806, 0, "Quadratic curve to", "Paths", 
    "Quadratic curve to (<i>{2}</i>,<i>{3}</i>) with control points (<i>{0}</i>,<i>{1}</i>)", 
    "Adds a quadratic Bézier curve to the current path.", "QuadraticCurveTo");  

AddNumberParam("x", "The x coordinate of the arc's center.", 0);
AddNumberParam("y", "The y coordinate of the arc's center.", 0);
AddNumberParam("radius", "The arc's radius.", 0);
AddNumberParam("start angle", "The angle at which the arc starts, measured clockwise from the positive x axis and expressed in degrees.", 0);
AddNumberParam("end angle", "The angle at which the arc ends, measured clockwise from the positive x axis and expressed in degrees.", 0);
AddComboParamOption("anti-clockwise");
AddComboParamOption("clockwise");
AddComboParam("Clockwise", "The arc to be drawn counter-clockwise between the two angles");
AddAction(807, 0, "Arc", "Paths", 
    "Arc to center (<i>{0}</i>,<i>{1}</i>) with radius <i>{2}</i>, from angle <i>{3}</i> to <i>{4}</i>, <i>{5}</i>", 
    "Adds an arc to the path.", "Arc");
    
AddNumberParam("x1", "The x axis of the coordinate for the second control point.", 0);
AddNumberParam("y1", "The y axis of the coordinate for the first control point.", 0);
AddNumberParam("x2", "The x axis of the coordinate for the first control point.", 0);
AddNumberParam("y2", "The y axis of the coordinate for the second control point.", 0);
AddNumberParam("radius", "The arc's radius.", 0);
AddAction(808, 0, "Arc", "Paths", 
    "Arc with control points (<i>{0}</i>,<i>{1}</i>) , (<i>{2}</i>,<i>{3}</i>) and radius <i>{4}</i>", 
    "Adds an arc to the path with the given control points and radius, connected to the previous point by a straight line.", "ArcTo");
    
// TODO    
AddNumberParam("x", "The x axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("y", "The y axis of the coordinate for the rectangle starting point.", 0);
AddNumberParam("width", "The rectangle's width.", 100);
AddNumberParam("height", "The rectangle's height.", 100);
AddAction(810, 0, "Fill rectangle", "Paths", 
    "Rectangle to (x,y) = (<i>{0}</i>,<i>{1}</i>), (width, height) = (<i>{2}</i>,<i>{3}</i>)", 
    "Creates a path for a rectangle.", "Rect");  
    
// Drawing paths
AddComboParamOption("nonzero");
AddComboParamOption("evenodd");
AddComboParam("Fill rule", "The algorithm by which to determine if a point is inside a path or outside a path.", 0);
AddAction(901, 0, "Fill", "Drawing paths", 
    "Fill path with fill rule <i>{0}</i>", 
    "Fills the subpaths with the current fill style.", "Fill");  
    
AddAction(902, 0, "Stroke", "Drawing paths", 
    "Stroke path", 
    "Strokes the subpaths with the current stroke style.", "Stroke");      
    
AddComboParamOption("nonzero");
AddComboParamOption("evenodd");
AddComboParam("Fill rule", "The algorithm by which to determine if a point is inside a path or outside a path.", 0);
AddAction(903, 0, "Clip", "Drawing paths", 
    "Clip path with fill rule <i>{0}</i>", 
    "Creates a clipping path from the current sub-paths. Everything drawn after clip() is called appears inside the clipping path only.", "Clip");  
    
    
// Transformations



    
AddStringParam("URI", "Enter the URL on the web, or data URI, of an image to load.", "\"http://\"");
AddComboParamOption("Resize to image size");
AddComboParamOption("Keep current size");
AddComboParamOption("Scale down if larger than canvas");
AddComboParam("Size", "Whether to resize the sprite to the size of the loaded image, or stretch it to the current size.");
AddAction(2001, 0, "Load image from URL", "Load", "Load image from <i>{0}</i> ({1})", "Replace the currently displaying animation frame with an image loaded from a web address or data URI.", "LoadURL");
 
AddObjectParam("object", "Object to erase.");
AddAction(2011, 0, "Erase object", "Paste", "Erase Object {0}", "Erase objects.", "EraseObject");

AddObjectParam("object", "Object to erase.");
AddComboParamOption("source-over");
AddComboParamOption("source-in");
AddComboParamOption("source-out");
AddComboParamOption("source-atop");
AddComboParamOption("destination-over");
AddComboParamOption("destination-in");
AddComboParamOption("destination-out");
AddComboParamOption("destination-atop");
AddComboParamOption("lighter");
AddComboParamOption("copy");
AddComboParamOption("xor");
AddComboParamOption("multiply");
AddComboParamOption("screen");
AddComboParamOption("overlay");
AddComboParamOption("darken");
AddComboParamOption("lighten");
AddComboParamOption("color-dodge");
AddComboParamOption("color-burn");
AddComboParamOption("hard-light");
AddComboParamOption("soft-light");
AddComboParamOption("difference");
AddComboParamOption("exclusion");
AddComboParamOption("hue");
AddComboParamOption("saturation");
AddComboParamOption("color");
AddComboParamOption("luminosity");
AddComboParam("Compositing", "Choose the compositing of this drawing.");
AddAction(2012, 0, "Draw object", "Paste", "Draw Object {0} ({1})", "Draw objects.", "DrawObject");

AddObjectParam("object", "Object to erase.");
AddStringParam("Compositing", "Compositing of this drawing.", "source-over");
AddAction(2013, 0, "Draw object #", "Paste", "Draw Object {0} ({1})", "Draw objects.", "DrawObject");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get canvas width", "Canvas", "CanvasWidth", "Get canvas width.");
AddExpression(2, ef_return_number, "Get canvas height", "Canvas", "CanvasHeight", "Get canvas height.");

AddStringParam("Text", "The text to render.", 0);
AddExpression(31, ef_return_number, "Get text width", "Drawing text", "TextWidth", "Get text width in current ctx.");

AddExpression(2001, ef_return_string, "Get image url", "canvas", "ImageUrl", "Get the image url from current ctx.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_link,	"Image",				"Edit",		"Click to edit the object's image.", "firstonly"),
	new cr.Property(ept_combo,	"Initial visibility",	"Visible",	"Choose whether the object is visible when the layout starts.", "Visible|Invisible"),
	new cr.Property(ept_combo,	"Hotspot",				"Top-left",	"Choose the location of the hot spot in the object.", "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right")
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

	switch (this.properties["Hotspot"])
	{
    case "Top-left" :
      this.instance.SetHotspot(new cr.vector2(0, 0));
      break;
    case "Top" :
      this.instance.SetHotspot(new cr.vector2(0.5, 0));
      break;
    case "Top-right" :
      this.instance.SetHotspot(new cr.vector2(1, 0));
      break;
    case "Left" :
      this.instance.SetHotspot(new cr.vector2(0, 0.5));
      break;
    case "Center" :
      this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
      break;
    case "Right" :
      this.instance.SetHotspot(new cr.vector2(1, 0.5));
      break;
    case "Bottom-left" :
      this.instance.SetHotspot(new cr.vector2(0, 1));
      break;
    case "Bottom" :
      this.instance.SetHotspot(new cr.vector2(0.5, 1));
      break;
    case "Bottom-right" :
		  this.instance.SetHotspot(new cr.vector2(1, 1));
      break;
	}
}

IDEInstance.prototype.OnInserted = function()
{
	this.just_inserted = true;
}

IDEInstance.prototype.OnDoubleClicked = function()
{
	this.instance.EditTexture();
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
	// Edit image link
	if (property_name === "Image")
	{
		this.instance.EditTexture();
	}
	else if (property_name === "Hotspot")
	{
    switch (this.properties["Hotspot"])
    {
      case "Top-left" :
        this.instance.SetHotspot(new cr.vector2(0, 0));
      break;
      case "Top" :
        this.instance.SetHotspot(new cr.vector2(0.5, 0));
      break;
      case "Top-right" :
        this.instance.SetHotspot(new cr.vector2(1, 0));
      break;
      case "Left" :
        this.instance.SetHotspot(new cr.vector2(0, 0.5));
      break;
      case "Center" :
        this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
      break;
      case "Right" :
        this.instance.SetHotspot(new cr.vector2(1, 0.5));
      break;
      case "Bottom-left" :
        this.instance.SetHotspot(new cr.vector2(0, 1));
      break;
      case "Bottom" :
        this.instance.SetHotspot(new cr.vector2(0.5, 1));
      break;
      case "Bottom-right" :
        this.instance.SetHotspot(new cr.vector2(1, 1));
      break;
    }
	}
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
	renderer.LoadTexture(this.instance.GetTexture());
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
	var texture = this.instance.GetTexture();
	renderer.SetTexture(this.instance.GetTexture());
	
	// First draw after insert: use 2x the size of the texture so user can see four tiles.
	// Done after SetTexture so the file is loaded and dimensions known, preventing
	// the file being loaded twice.
	//if (this.just_inserted)
	//{
	//	this.just_inserted = false;
	//	var sz = texture.GetImageSize();
	//	this.instance.SetSize(new cr.vector2(sz.x, sz.y));
	//	RefreshPropertyGrid();		// show new size
	//}
	
	// Calculate tiling
	// This ignores cards without NPOT texture support but... meh.  Tiling by repeated quads is a massive headache.
	//var texsize = texture.GetImageSize();
	//var objsize = this.instance.GetSize();
	//var uv = new cr.rect(0, 0, objsize.x / texsize.x, objsize.y / texsize.y);
	
	//renderer.EnableTiling(false);
	var q=this.instance.GetBoundingQuad();
	renderer.Quad(q, this.instance.GetOpacity());
	renderer.Outline(q, cr.RGB(0,0,0))
	//renderer.EnableTiling(false);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
	renderer.ReleaseTexture(this.instance.GetTexture());
}