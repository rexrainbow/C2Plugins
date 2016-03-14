function GetPluginSettings()
{
	return {
		"name":			"Live2D Object",
		"id":			"Rex_Live2DObj",      
		"description":	"Live2D object.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_live2dobj.html",
		"category":		"Rex - Live2D",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces | pf_effects,
		"dependency":	"live2d.min.js;PlatformManager.js;Live2DFramework.js;ModelSettingJson.js;LAppModel.js;MatrixStack.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(11, cf_trigger, "On successful", "Model - load", "On model loaded successful", 
             "Triggered when model is loaded successful.", 
             "OnModelLoaded");
             
AddCondition(12, cf_trigger, "On failed", "Model - load", "On model loaded failed", 
             "Triggered when model is loaded failed.", 
             "OnModelLoadedFailed");  

AddCondition(13, 0, "Is ready", "Model", "Is model ready", 
             "Retrun true if model is ready to use.", 
             "IsModelReady");                
                    
AddStringParam("Motion name", "Enter the name of the motion to check if playing.");
AddCondition(21, 0, "Is playing", "Motion", "Is motion {0} playing", "Test which of the object's motion is currently playing.", "IsMotionPlaying");

AddStringParam("Motion name", "Enter the name of the motion to check if playing.");
AddCondition(22, cf_trigger, "On finished", "Motion", "On motion {0} finished", "Triggered when a motion has finished.", "OnMotionFinished");

AddCondition(23, cf_trigger, "On any finished", "Motion", "On any motion finished", "Triggered when any motion has finished.", "OnAnyMotionFinished");

AddNumberParam("X", "Position X.", 0);
AddNumberParam("Y", "Position Y.", 0);
AddStringParam("Area name", "Enter the name of the area to check.");
AddCondition(51, 0, "Is inside area", "Hit test", "({0}, {1}) is inside {2}", 
                   "Return true if the position is inside the area.", "IsInsideArea");
             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("URI", "Enter the URL on the web, or data URI, of a model JSON to load.", "\"http://\"");
AddAction(11, 0, "Load", "Load model", 
          "Load model from <i>{0}</i>", 
          "Load model from model.json.", "Load");
          
AddStringParam("Parameter name", "Parameter name.", '""');
AddNumberParam("Value", "Value.", 0);
AddAction(12, 0, "Set parameter", "Model", 
          "Set parameter <i>{0}</i> to <i>{1}</i>", 
          "Set parameter value of model.", "SetParameterValue");             
          
AddStringParam("Motion name", "Motion name.", '""');
AddAction(21, 0, "Start motion", "Motion", 
          "Start motion <i>{0}</i>", 
          "Start motion.", "StartMotion");                 

AddStringParam("Motion name", "Motion name.", '""');
AddAction(22, 0, "Set idle motion", "Motion", 
          "Set idle motion to <i>{0}</i>", 
          "Set idle motion.", "SetIdleMotion");            
          
AddStringParam("Expression name", "Expression name.", '""');
AddAction(31, 0, "Set expression", "Expression", 
          "Set expression to <i>{0}</i>", 
          "Set expression.", "SetExpression");  

//AddAction(32, 0, "Set random expression", "Expression", 
//          "Set random expression", 
//          "Set random expression.", "SetRandomExpression");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(21, ef_return_string, "Get motion name", "Motion", "MotionName", "The name of the current motion.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_color, "Color",	cr.RGB(0, 0, 0), "Color for showing at editor.", "firstonly"),
    new cr.Property(ept_combo, "Hotspot", "Top-left", "Choose the location of the hot spot in the object.", 
                    "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right"), 
	new cr.Property(ept_text,	"Idle motion",	"idle",	"Motion name of idle."),                    
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
	// this.myValue = 0...
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
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
	// Edit image link
	if (property_name === "Hotspot")
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
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
    var quad = this.instance.GetBoundingQuad();
    renderer.Fill(quad, this.properties["Color"]);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}

IDEInstance.prototype.OnTextureEdited = function ()
{
}