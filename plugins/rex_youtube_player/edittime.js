function GetPluginSettings()
{
	return {
		"name":			"Youtube player",
		"id":			"rex_youtube_player",
		"version":		"0.1",
		"description":	"Play youtube video at iframe.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_youtube_player.html",
		"category":		"Web - Youtube",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces
	};
};

////////////////////////////////////////
// Conditions
							
AddCondition(0, cf_none, "Is playing", "Video", "Is playing", 
             "True if video is currently playing.", "IsPlaying");

AddCondition(1, cf_none, "Is paused", "Video", "Is paused", 
             "True if video is currently paused.", "IsPaused");

AddCondition(2, cf_none, "Has ended", "Video", "Has ended", 
             "True if video has finished playing.", "HasEnded");

AddCondition(3, cf_none, "Is muted", "Video", "Is muted", 
             "True if video sound is muted.", "IsMuted");

AddComboParamOption("Unstarted");			// 0
AddComboParamOption("Ended");	            // 1
AddComboParamOption("Playing");				// 2
AddComboParamOption("Paused");				// 3
AddComboParamOption("Buffering");		    // 4
AddComboParamOption("Video cued");		    // 5
AddComboParam("Event", "The playback event to check for.");
AddCondition(4, cf_trigger, "On playback event", "Video", "On {0}", 
             "Triggered when a playback event occurs.", "OnPlaybackEvent");

AddCmpParam("Comparison", "Choose the way to compare the distance travelled.");
AddNumberParam("Playback time", "Current playback time, in seconds.");
AddCondition(5, 0, "Compare playback time", "Video", 
             "Playback time {0} {1}", "Compare current playback time.", "ComparePlaybackTime");

AddCondition(11, cf_trigger, "On player ready", "Initial", "On player ready", 
             "Triggered when player ready.", "OnPlayerReady");
             
AddCondition(12, cf_trigger, "On player error", "Video", "On player error",
             "Triggered when player has error.", "OnPlayerError");
             
AddCondition(13, cf_none, "Is full screen", "Full screen", "Is full screen", 
             "True if video is in full screen mode.", "IsFullScreen");

AddCondition(14, cf_none, "Is full window", "Full window", "Is full window", 
             "True if video is in full window.", "IsFullWindow");      

AddCondition(22, cf_trigger, "On mouse over", "Mouse", "On mouse over",
             "Triggered when mouse over.", "OnMouseOver");             
////////////////////////////////////////
// Actions

AddStringParam("Video ID", "Video ID.", '""');
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Play", "Start playing upon buffered.", 1);
AddAction(0, af_none, "Load video", "Video", 
          "Load video with ID to <i>{0}</i>, auto play to <i>{1}</i>", 
          "Load video with ID.", "LoadVideoID");

AddNumberParam("Time", "Playback time in seconds to seek to.", 0);
AddAction(1, af_none, "Set playback time", "Video", 
          "Set playback time to <b>{0}</b> seconds", 
          "Set the current playback time in seconds.", "SetPlaybackTime");

AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Mode", "Whether or not the video should loop when it reaches the end.", 0);
AddAction(2, af_none, "Set looping", "Video", 
          "Set {0}", 
          "Set whether the video loops when it reaches the end.", "SetLooping");

AddComboParamOption("not muted");
AddComboParamOption("muted");
AddComboParam("Mode", "Whether or not the audio should be muted.", 0);
AddAction(3, af_none, "Set muted", "Video", "Set {0}", "Set whether the audio is muted.", "SetMuted");

AddNumberParam("Volume", "The volume of the audio to set, from 0 to 100.", 100);
AddAction(4, af_none, "Set volume", "Video", "Set volume to <b>{0}</b>", "Set the volume of the accompanying audio.", "SetVolume");

AddAction(5, af_none, "Pause", "Video", "Pause", "Pause the current playback.", "Pause");

AddAction(6, af_none, "Play", "Video", "Play", "Start playing the video if stopped or paused. On mobile, may only work in a user input trigger.", "Play");

AddComboParamOption("Exit");
AddComboParamOption("Enter");
AddComboParamOption("Toggle");
AddComboParam("Command", "Enter or exit, or toggle fullscreen mode.", 1);
AddAction(11, af_none, "Full window", "Size", 
          "<i>{0}</i> full window", 
          "Enter or exit full window.", "SetFullWindow");       
          
AddComboParamOption("Invisible");
AddComboParamOption("Visible");
AddComboParam("Visibility", "Choose whether to hide or show this object.", 1);
AddAction(12, af_none, "Set visible", "Appearance", "Set <b>{0}</b>", "Hide or show this object.", "SetVisible");          

AddComboParamOption("Exit");
AddComboParamOption("Enter");
AddComboParamOption("Toggle");
AddComboParam("Command", "Enter or exit, or toggle fullscreen mode.", 1);
AddAction(13, af_none, "Set full screen mode", "Full screen", 
          "<i>{0}</i> full screen", 
          'Enter or exit full screen mode. "Enter full screen" can only be called under a user input.', "SetFullScreen");   
                
AddAction(21, af_deprecated, "Set focused", "Player", "Set focused", "Set the input focus to the player.", "SetFocus");
AddAction(22, af_deprecated, "Set unfocused", "Player", "Set unfocused", "Remove the input focus from the player.", "SetBlur");        
////////////////////////////////////////
// Expressions

AddExpression(0, ef_return_number, "Get current playback time", "Video", "PlaybackTime", "Current playback time, in seconds.");
AddExpression(1, ef_return_number, "Get video duration", "Video", "Duration", "Video duration in seconds, if known.");
AddExpression(2, ef_return_number, "Get current video volume", "Video", "Volume", "Current video volume in dB attenuation.");
AddExpression(3, ef_return_number, "Get current error code", "Video", "ErrorCode", "Current error code.");
AddExpression(11, ef_return_string, "Get current video statee", "Debug", "VideoState", "Current video statee.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Video ID", "r45t8CgSBeA", "Video ID to play."),  // 0
    new cr.Property(ept_combo, "Autoplay", "Yes", "Start playing upon buffered.", "No|Yes"), // 1
    new cr.Property(ept_combo, "Looping", "No", "Restart video after ended.", "No|Yes"),  // 2
    new cr.Property(ept_combo,	"Control bar", "Yes", "Enable control bar or not.", "No|Yes"),  // 3
	new cr.Property(ept_combo,"Show info", "Yes", "Enable to show video information", "No|Yes"),  // 4
	new cr.Property(ept_combo,"Modest branding", "No", "Enable to remove youtube logos", "No|Yes"),   // 5   
	new cr.Property(ept_combo,"Keyboard control", "Yes", "Enable to control video by keyboard.", "Yes|No"),  // 6
	new cr.Property(ept_combo,	"Play in background",	"No",	"Keep playing even when the tab or app goes in to the background.", "No|Yes"), // 7
    new cr.Property(ept_combo, "Initial visibility", "Visible", "Choose whether the text box is visible on startup.", "Invisible|Visible"),  // 8
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