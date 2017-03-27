function GetPluginSettings()
{
	return {
		"name":			"JSMIDIparser",
		"id":			"Rex_JSMIDIparser",
		"version":		"0.1",
		"description":	"Convert a midi binary data to JSON to get note events.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_jsmidiparser.html",
		"category":		"Rex - Media",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"JSMIDIparser.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On convert completed", "Convert", 
            "On convert completed", 
            "Triggered when convert completed.", "OnConvertCompleted");
AddCondition(2, cf_trigger, "On convert error", "Convert", 
            "On convert error", 
            "Triggered when convert error.", "OnConvertError");
              
AddCondition(11, 0, "Is playing", "Play", 
             "Is playing", 
             "Is playing.", "IsPlaying");
             
AddCondition(12, cf_trigger, "On note on", "Note", 
            "On note on", 
            "Triggered when note on.", "OnNoteOn"); 
AddCondition(13, cf_trigger, "On note off", "Note", 
            "On note off", 
            "Triggered when note off.", "OnNoteOff");  

AddCmpParam("Comparison", "Choose the way to compare the current channel.");
AddNumberParam("Channel", "The channel, to compare to.");
AddCondition(14, 0, "Compare current channel", "Note", 
             "Current channel {0} {1}", 
             "Compare current channel of note.", "CompareChannel");
            
AddCmpParam("Comparison", "Choose the way to compare the current track.");
AddNumberParam("Track ID", "The track ID, to compare to.");
AddCondition(15, 0, "Compare current track ID", "Note", 
             "Current track ID {0} {1}", 
             "Compare current track ID of note.", "CompareTrackID");  

AddCondition(16, cf_trigger, "On ended", "Play", 
            "On playing ended", 
            "Triggered when playing ended.", "OnEnded");
                        
AddCondition(21, cf_looping | cf_not_invertible, "For each note", "For each", 
             "For each note", 
             "Repeat the event for each note.", "ForEachNote");                
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("URL", "URL of midi file.", '""');
AddAction(1, 0, "Load & Convert midi", "0. Load & Convert", 
          "Load & Convert midi from URL <i>{0}</i> to JSON object", 
          "Load & Convert midi to JSON object.", "ConvertMidi2JSON");

AddAction(11, 0, "Start", "Control", 
          "Start playing notes", 
          "Start playing notes with current loaded JSON object.", "Play"); 
AddAction(12, 0, "Stop", "Control", 
          "Stop", 
          "Stop playing notes.", "Stop");
AddAction(13, 0, "Pause", "Control", 
          "Pause", 
          "Pause playing notes.", "Pause"); 
AddAction(14, 0, "Resume", "Control", 
          "Resume", 
          "Resume playing notes.", "Resume");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Midi in JSON", "Midi", "Midi2JSON", 
              "Midi in JSON.");  
AddExpression(2, ef_return_number, "End time of current midi", "Midi", "EndTime", 
              "End time of current midi, in seconds.");
              
              
AddExpression(11, ef_return_number, "Current pitch of note", "Note", "CurPitch", 
              "Get current playing pitch of note.");
AddExpression(12, ef_return_number, "Current velocity of note", "Note", "CurVelocity", 
              "Get current playing velocity of note.");
AddExpression(13, ef_return_string, "Current pitch key of note", "Note", "CurPitchKey", 
              "Get current playing pitch key of note.");
AddExpression(14, ef_return_number, "Current time in tick", "Note", "CurTick", 
              "Get current time of playing a note, in ticks.");              
AddExpression(15, ef_return_number, "Current duration of note", "Note", "CurDuration", 
              "Get current duration of playing a note, in seconds.");
AddExpression(16, ef_return_number, "Current duration of note in ticls", "Note", "CurDurationTick", 
              "Get current duration of playing a note, in ticls.");
AddExpression(17, ef_return_number, "Current time in second", "Note", "CurTime", 
              "Get current time of playing a note, in second.");              
AddExpression(18, ef_return_string, "Current pitch key name of note", "Note - pitch", "CurPitchKeyName", 
              "Get current playing pitch key name of note.");
AddExpression(19, ef_return_number, "Current pitch's octave of note", "Note - pitch", "CurPitchKeyOctave", 
              "Get current playing pitch's octave of note.");   
AddExpression(20, ef_return_number, "Current channel of note", "Note", "CurChannel", 
              "Get current channel of note.");
AddExpression(21, ef_return_number, "Current track ID of note", "Note", "CurTrackID", 
              "Get current track ID of note.");
              
AddExpression(101, ef_return_number, "Current loop index", "For each", "LoopIndex", 
              "Current loop index in for each loop.");              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "Beat period", 0.5, "Beat period, in seconds."), 
    new cr.Property(ept_integer, "Octave offset", 0, "Octave offset for pitch key."),    
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
