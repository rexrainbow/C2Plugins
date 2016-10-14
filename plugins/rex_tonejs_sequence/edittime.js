function GetPluginSettings()
{
	return {
		"name":			"Sequence",
		"id":			"Rex_ToneJS_sequence",
		"version":		"0.1",        
		"description":	"An alternate notation of a part.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_tonejs_master.html",
		"category":		"Rex - Audio - Tone - object",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(11, cf_trigger, "On event", "Event", 
            "On event", 
            "Triggered when event fired.", "OnEvent");
            
//////////////////////////////////////////////////////////////
// Actions            
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)").', '"+0"');
AddAction(11, 0, "Start", "Control", 
          "Start at time <i>{0}</i>", 
          "Start the part at the given time.", "Start");   
          
AddAnyTypeParam("Time", 'When the note should be triggered. Time in seconds(1), Notation("4n", "8t"), TransportTime("4:3:2"), Frequency("8hz"), Now-Relative("+1"), Expressions("3:0 + 2 - (1m / 7)").', '"+0"');
AddAction(12, 0, "Stop", "Control", 
          "Stop at time <i>{0}</i>", 
          "Stop the part at the given time.", "Stop");   
          
AddStringParam("Notes", 'Notes in array.', '"[]"');
AddAction(21, 0, "Reload", "Notes", 
          "Reload notes to <i>{0}</i>", 
          "Stop and reload notes.", "Reload");
          
AddAction(22, 0, "Remove all", "Notes", 
          "Remove all notes", 
          "Remove all of the notes from the group.", "RemoveAll"); 
          
AddNumberParam("Index", 'The index to add the event to.', 0);
AddAnyTypeParam("Value", 'Notes to add at that index, separated by ","', '""');
AddAction(23, 0, "Add", "Notes", 
          "Add <i>{1}</i> at <i>{0}</i>", 
          "Add notes at an index, if there's already something at that index, overwrite it.", "Add");   
          
AddNumberParam("Index", 'The index of the event to remove.', 0);
AddAction(24, 0, "Remove", "Notes", 
          "Remove notes at <i>{0}</i>", 
          "Remove a value from the sequence by index.", "Remove"); 
          
//////////////////////////////////////////////////////////////
// Expressions                      
AddExpression(1, ef_return_number, 
              "The current progress of the loop interval", "State", "Progress", 
              "The current progress of the loop interval.");                
                  
AddExpression(11, ef_return_any, 
              "Get time of note event", "Event", "Time", 
              "Get time of note event.");
              
AddExpression(12, ef_return_any, 
              "Get note of note event", "Event", "Note", 
              "Get note of note event.");              
             
AddNumberParam("Index", 'The index of the event to remove.', 0);             
AddExpression(21, ef_return_any | ef_variadic_parameters, 
              "Get note of the sequence", "Notes", "At", 
              "Get note of the sequence. Add 2nd or more parameters to get note in subsequence.");   

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Subdivision", "4n", 'The subdivision between which events are placed.'),
    new cr.Property(ept_integer, "Loop", 1, "Loop count. Set 0 to be an infinity loop."),    
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
