function GetPluginSettings()
{
	return {
		"name":			"Audio helper",
		"id":			"Rex_audio_helper",
		"version":		"0.1",   		
		"description":	"Some helper methods for audio object",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_audio_helper.html",
		"category":		"Rex - Media",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions     
AddAudioFileParam("Audio file", "Choose the audio file to play.");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0);
AddNumberParam("Stop volume", "Stop volume in dB.", 0);
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", '""');
AddNumberParam("Fade-in", "The duration of fade-in, in second.", 1);
AddNumberParam("Start volume", "Start volume in dB.", -60);
AddAction(1, 0, "Play", "Playback", 
          "Play <b>{0}</b> {1} with volume fade-in from <i>{5}</i> dB to <i>{2}</i> dB in <b>{4}</b> second (tag <i>{3}</i>)", 
          "Play an audio file with fade-in.", "Play");    

AddStringParam("Tag", "The tag identifying the sound to stop.  Leave empty to affect the last played sound.", '""');
AddNumberParam("Fade-out", "The duration of fade-out, in second.", 1);
AddNumberParam("Stop volume", "Stop volume in dB.", -60);
AddAction(2, 0, "Stop", "Playback", 
         "Stop <b>{0}</b> with volume fade-out to <b>{2}</b> dB in <b>{1}</b> second", 
         "Stop a sound from playing with fade-out.", "Stop");

AddStringParam("Tag", "The tag identifying the sound to loop.  Leave empty to affect the last played sound.", '""');
AddNumberParam("Volume", "Mapping from (1~0) to (0db~-60db) with linear interpolation.", 1);
AddNumberParam("Fade", "The duration of fade, in second.", 1);
AddAction(3, 0, "Set volume", "Volume", 
          "Set <i>{0}</i> volume to <b>{1}</b> with fade to <b>{2}</b> second", 
          "Set the volume (loudness) of a sound with fade.", "SetVolume");

AddComboParamOption("Sounds");
AddComboParamOption("Music");
AddComboParam("Folder", "Choose the folder which contains the audio file.");
AddStringParam("Audio file name", "A string with the name of the audio file to play, without the file extension.  For example, to play myfile.ogg, use only \"myfile\".");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0);
AddNumberParam("Volume", "Mapping from (1~0) to (0db~-60db) with linear interpolation.", 1);
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", '""');
AddNumberParam("Fade-in", "The duration of fade-in, in second.", 1);
AddAction(4, 0, "Play (by name)", "Playback", 
          "Play <b>{1}</b> {2} from {0} at volume to {3} (tag <i>{4}</i>) with fade-in to <b>{5}</b> second", 
          "Play an audio file using a string for the filename with fade.", "PlayByName");

AddStringParam("Tag", "The audio tag to pause or resume.");
AddComboParamOption("Pause");
AddComboParamOption("Resume");
AddComboParam("State", "Whether to pause or resume the sound with the given tag.");
AddNumberParam("Fade", "The duration of fade, in second.", 1);
AddAction(5, 0, "Set paused", "Playback", 
          "{1} tag <i>{0}</i> with fade to <b>{2}</b> second", 
          "Pause or resume audio with a given tag with fade.", "SetPaused");

AddStringParam("Audio file", "Audio file string", "");
AddAction(50, 0, "Preload", "Preload", 
          "Preload <b>{0}</b>", 
          "Download an audio file from the server without playing it. This ensures it will play immediately.", "Preload");      
//////////////////////////////////////////////////////////////
// Expressions


ACESDone();

// Property grid properties for this plugin
var property_list = [
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
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
