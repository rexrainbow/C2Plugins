function GetPluginSettings()
{
	return {
		"name":			"Video",
		"id":			"Rex_Video",
		"version":		"1.0",  
		"description":	"Play video.",
		"author":		"Rex.Rainbow, JP Deblonde",
		"help url":		"",
		"category":		"Media",
		"type":			"world",			// appears in layout
		"rotatable":	false,
		"flags":		pf_position_aces | pf_size_aces
	};
};

////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On play ended", "Control", "On ended", 
             "Triggered when video play ended.", "OnEnded");
AddCondition(1, 0, "Is play ended", "Control", "Is ended", 
             "Is video play ended.", "IsEnded");            
AddCondition(2, cf_trigger, "On play", "Control", "On play", 
             "Triggered when video starts playing.", "OnPlay");

////////////////////////////////////////
// Actions
AddStringParam("Source", "The location (URL) of the video file", '""');
AddAction(0, 0, "Set source", "Setting", "Set video source to <i>{0}</i>", "Set video source.", "SetSource");
AddAction(1, 0, "Play", "Control", "Play video", "Play video.", "Play");
AddAction(2, 0, "Pause", "Control", "Pause video", "Pause video.", "Pause");
AddComboParamOption("Disable");
AddComboParamOption("Enable");
AddComboParam("Controls", "Enable controls.",1);
AddAction(3, 0, "Enable controls", "Setting", "Set controls to <i>{0}</i>", "Enable controls of video.", "SetControls");
AddNumberParam("Volume", "Volume value, is between 0 to 1.", 1);
AddAction(4, 0, "Set volume", "Setting", "Set volume to <i>{0}</i>", "Set volume.", "SetVolume");   
AddStringParam("Poster", "An image to be shown while the video is downloading.", '""');
AddAction(5, 0, "Set poster", "Setting", "Set poster to <i>{0}</i>", "Set poster.", "SetPoster");   
AddComboParamOption("Disable");
AddComboParamOption("Enable");
AddComboParam("Loop", "Enable loop.",1);
AddAction(6, 0, "Enable Loop", "Setting", "Set loop to <i>{0}</i>", "Enable loop of video.", "SetLoop");  
AddComboParamOption("Disable");
AddComboParamOption("Enable");
AddComboParam("Muted", "Enable muted.",1);
AddAction(7, 0, "Enable muted", "Setting", "Set muted to <i>{0}</i>", "Enable muted of video.", "SetMuted"); 
AddComboParamOption("Disable");
AddComboParamOption("Enable");
AddComboParam("Autoplay", "Enable autoplay.",1);
AddAction(8, 0, "Enable autoplay", "Setting", "Set autoplay to <i>{0}</i>", "Enable autoplay of video.", "SetAutoplay"); 

AddAction(9, 0, "Stop", "Control", "Stop video", "Stop video.", "Stop");

AddComboParamOption("Invisible");
AddComboParamOption("Visible");
AddComboParam("Visibility", "Choose whether to hide or show the button.");
AddAction(10, 0, "Set visible", "Appearance", "Set <b>{0}</b>", "Hide or show the video.", "SetVisible");

////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Get current time", "State", "CurrentTime", "Get current video time.");
AddExpression(1, ef_return_number, "Is paused", "State", "IsPaused", "Is video paused? 1 is paused.");
AddExpression(2, ef_return_number, "Is muted", "State", "IsMuted", "Is video muted? 1 is muted.");
AddExpression(3, ef_return_number, "Get volume", "State", "Volume", "Get video volume.");
AddExpression(4, ef_return_number, "Get ready state", "State", "ReadyState", 
              "Get ready state. 0=uninitialized, 1=loading, 2=loaded, 3=interactive, 4=complete.");
AddExpression(5, ef_return_number, "Get width", "Properties", "SourceWidth", "Get source video width.");			  
AddExpression(6, ef_return_number, "Get height", "Properties", "SourceHeight", "Get source video height.");			  

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Source", "", "The location (URL) of the video file."),   
    new cr.Property(ept_text, "Source 2", "", "The location (URL) of the video file."),   
    new cr.Property(ept_text, "Source 3", "", "The location (URL) of the video file."),    
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
    new cr.Property(ept_text, "ID (optional)", "", 
                    "An ID for the control allowing it to be styled with CSS from the page HTML.")                    
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

	this.font.DrawText("Video",
						rc,
						cr.RGB(0, 0, 0),
						ha_center);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}