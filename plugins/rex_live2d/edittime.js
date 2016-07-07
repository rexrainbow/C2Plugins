function GetPluginSettings()
{
	return {
		"name":			"Live2D Object",
		"id":			"Rex_Live2DObj",      
		"description":	"Load and play Live2D object. http://www.live2d.com/en",
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
AddCondition(11, cf_trigger, "On loaded successful", "Model - load", "On model loaded successful", 
             "Triggered when model is loaded successful.", 
             "OnModelLoaded");
             
AddCondition(12, cf_trigger, "On loaded failed", "Model - load", "On model loaded failed", 
             "Triggered when model is loaded failed.", 
             "OnModelLoadedFailed");  

AddCondition(13, 0, "Is ready", "Model", "Is model ready", 
             "Retrun true if model is ready to use.", 
             "IsModelReady");                
                    
AddStringParam("Motion name", "Enter the name of the motion to check if playing.");
AddCondition(21, 0, "Is motion playing", "Motion", "Is motion {0} playing", "Test which of the object's motion is currently playing.", "IsMotionPlaying");

AddStringParam("Motion name", "Enter the name of the motion to check if playing.");
AddCondition(22, cf_trigger, "On motion finished", "Motion - finished", "On motion {0} finished", "Triggered when a motion has finished.", "OnMotionFinished");

AddCondition(23, cf_trigger, "On any motion finished", "Motion - finished", "On any motion finished", "Triggered when any motion has finished.", "OnAnyMotionFinished");

AddStringParam("Motion name", "Enter the name of the motion to check if playing.");
AddCondition(24, cf_trigger, "On motion began", "Motion - began", "On motion {0} began", "Triggered when a motion has began.", "OnMotionBegan");

AddCondition(25, cf_trigger, "On any motion began", "Motion - began", "On any motion began", "Triggered when any motion has began.", "OnAnyMotionBegan");


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
AddAction(12, 0, "Set value", "Parameter", 
          "Set parameter <i>{0}</i> to <i>{1}</i>", 
          "Set the value of model's parameter.", "SetParameterValue");             
          
AddStringParam("Parameter name", "Parameter name.", '""');
AddNumberParam("Value", "Value.", 0);
AddAction(13, 0, "Add to", "Parameter", 
          "Add <i>{1}</i> to parameter <i>{0}</i>", 
          "Add to the value of a model's parameter.", "AddToParameterValue");                       
          
AddStringParam("Motion name", "Motion name.", '""');
AddAction(21, 0, "Start motion", "Motion", 
          "Start motion <b>{0}</b>", 
          "Start motion.", "StartMotion");                 

AddStringParam("Motion name", "Motion name.", '""');
AddAction(22, 0, "Set idle motion", "Motion", 
          "Set idle motion to <i>{0}</i>", 
          "Set idle motion.", "SetIdleMotion");          
          
AddStringParam("Expression name", "Expression name.", '""');
AddAction(31, 0, "Set expression", "Expression", 
          "Set expression to <i>{0}</i>", 
          "Set expression.", "SetExpression");  
          
AddNumberParam("Scale", "Set 1 to original size.", 1);     
AddAction(41, 0, "Set model scale", "Camera", 
          "Set model scale to <i>{0}</i>", 
          "Set model scale without changing object size.", "SetModelScale"); 

AddStringParam("Part index", "Part index.", '""');
AddNumberParam("Opacity", "Opacity, range from 0 to 1.", 1);
AddAction(51, 0, "Set part opacity", "Part", 
          "Set part <i>{0}</i> opacity to <i>{1}</i>", 
          "Set part opacity.", "SetPartOpacity");            

AddNumberParam("X", "Position X.", 0);
AddNumberParam("Y", "Position Y.", 0);          
AddAction(101, 0, "Look at", "Look", 
          "Look at ({0}, {1})", 
          "Look at a specific position.", "LookAt");                
        
AddAction(102, 0, "Look front", "Look", 
          "Look front", 
          "Look front.", "LookFront"); 

AddComboParamOption("Disable");          
AddComboParamOption("Enable");
AddComboParam("Enable", "Enable the breathing behavior.",1);          
AddAction(111, 0, "Breathing", "breathing", 
          "{0} breathing", 
          "Enable or disable Breathing.", "Breathing");                
          
AddComboParamOption("Disable");          
AddComboParamOption("Enable");
AddComboParam("Enable", "Enable the lip sync.",1);          
AddAction(121, 0, "Lip sync", "Lip sync", 
          "{0} lip sync", 
          "Enable or disable lip sync.", "SetLipSync");    

AddNumberParam("Value", "Lip sync value. Range is 0~1", 0);     
AddAction(122, 0, "Set lip sync value", "Lip sync", 
          "Set lip sync value to <i>{0}</i>", 
          "Set lip sync value.", "SetLipSyncValue");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(12, ef_return_string, "Get path of loaded failed files", "Model - load", "LoadedFailedFilePaths", 'Get path of loaded failed files. Joins by ";".');
AddExpression(21, ef_return_string, "Get motion name", "Motion", "MotionName", "The name of the current motion.");
AddExpression(22, ef_return_string, "Gettriggered motion name", "Motion", "TriggeredMotionName", 
    'The name of the triggered motion, used under "Condition: On any motion began", or "Condition: On any motion finished"');
    
//AddStringParam("Key", "Key.", '""');
AddExpression(23, ef_return_any | ef_variadic_parameters, "Get current motion data", "Motion", "MotionData", 
    "Get data of current motion. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");

AddExpression(41, ef_return_number, "Get model scale", "Model scale", "ModelScale", "Get current model scale. 1 is original size");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_color, "Color",	cr.RGB(0, 0, 0), "Color for showing at editor.", "firstonly"),
    new cr.Property(ept_combo, "Hotspot", "Top-left", "Choose the location of the hot spot in the object.", 
                    "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right"), 
	new cr.Property(ept_text,	"Idle motion",	"idle",	'Motion name of idle. Set "" if no idle motion.'),  
    new cr.Property(ept_combo, "Breathing", "Enable", "Enable breathing.", "Disable|Enable"),     
    new cr.Property(ept_combo, "Lip sync", "Disable", "Enable lip sync.", "Disable|Enable"),        
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