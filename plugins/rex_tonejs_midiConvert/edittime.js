function GetPluginSettings()
{
	return {
		"name":			"MidiConvert",
		"id":			"Rex_ToneJS_MidiConvert",
		"version":		"0.1",        
		"description":	"Convert MIDI into Tone.js-friendly JSON.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_midiconvert.html",
		"category":		"Rex - Audio - Tone - midi",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"MidiConvert.js"        
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
            
AddCondition(11, cf_trigger, "On event", "Event", 
            "On event", 
            "Triggered when event fired.", "OnEvent");
                        
            
//////////////////////////////////////////////////////////////
// Actions            
AddStringParam("URL", "URL of midi file.", '""');
AddAction(1, 0, "Load & Convert midi", "0. Load & Convert", 
          "Load & Convert midi from URL to <i>{0}</i> to JSON object", 
          "Load & Convert midi to JSON object.", "ConvertMidi2JSON");

AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)").', '"+0"');          
AddAction(11, 0, "Start", "Control", 
          "Start at time <i>{0}</i>", 
          "Start playing notes at the given time.", "Start"); 
          
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)").', '"+0"');          
AddAction(12, 0, "Stop", "Control", 
          "Stop at time <i>{0}</i>", 
          "Stop playing notes at the given time.", "Stop");
          
//AddAction(13, 0, "Pause", "Control", 
//          "Pause", 
//          "Pause playing notes.", "Pause"); 
//AddAction(14, 0, "Resume", "Control", 
//          "Resume", 
//          "Resume playing notes.", "Resume");          
//////////////////////////////////////////////////////////////
// Expressions                      
AddExpression(1, ef_return_string, "Midi in JSON", "Midi", "Midi2JSON", 
              "Midi in JSON.");  

AddExpression(11, ef_return_any, 
              "Get time of event", "Event", "Time", 
              "Get time of note event, in seconds.");
   
AddExpression(12, ef_return_string, 
              "Get note name of event", "Event", "Note", 
              "Get note name of note event.");  
              
AddExpression(13, ef_return_any, 
              "Get duration of event", "Event", "Duration", 
              "Get duration between noteOn and noteOff, in note event.");  
              
AddExpression(14, ef_return_number, 
              "Get velocity of event", "Event", "Velocity", 
              "Get velocity of note event.");  
              
AddExpression(15, ef_return_number, 
              "Get ticks of event", "Event", "Ticks", 
              "Get ticks of note event.");  
              
AddExpression(16, ef_return_number, 
              "Get midi number of event", "Event", "Midi", 
              "Get midi number of note event.");                
              
AddExpression(21, ef_return_any, 
              "Get track index of event", "Event", "TrackIndex", 
              "Get track index of note event.");              
              
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
