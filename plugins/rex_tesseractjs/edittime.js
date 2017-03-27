function GetPluginSettings()
{
	return {
		"name":			"Tesseract",
		"id":			"Rex_tesseractjs",
		"version":		"0.1",        
		"description":	"Pure Javascript OCR for 62 Languages. Reference: https://github.com/naptha/tesseract.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_tesseractjs.html",
		"category":		"Rex - Image",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"tesseract.js"             
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On completed", "Event", "On completed", "Trigger when recognize completed", "OnCompleted");
AddCondition(2, cf_trigger, "On error", "Event", "On error", "Trigger when recognize error", "OnError");
AddCondition(3, cf_trigger, "On progress", "Event", "On progress", "Trigger when recognize progress", "OnProgress");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Image", "Current frame of Sprite, or canvas object.");    
AddAction(1, 0, "Recognize", "Job", 
          "Recognize <i>{0}</i>",
          "Figures out what words are in image, where the words are in image.", "Recognize");  
          
AddObjectParam("Image", "Current frame of Sprite, or canvas object.");    
AddAction(2, 0, "Detect", "Job", 
          "Detect <i>{0}</i>",
          "Figures out what script (e.g. 'Latin', 'Chinese') the words in image are written in.", "Detect");            

AddStringParam("Property", "Property name", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(11, 0, "Add property", "Options", 
          "Add <i>{0}</i>: <i>{1}</i> to options",
          "Add property to options.", "AddProperty"); 
          
AddStringParam("Language", "Language.", '"eng"');
AddAction(12, 0, "Set language", "Options", 
          "Set language to <i>{0}</i>",
          "Set language.", "SetLanguage");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get result", "Result", "Result", "Get result text or script type.");
AddExpression(2, ef_return_string, "Get error", "Result", "Error", "Get error.");
AddExpression(11, ef_return_string, "Current status", "Progress", "Status", "Get current status.");
AddExpression(12, ef_return_number, "Current progress", "Progress", "Progress", "Get current progress.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Language", "eng", "Languages, listed in https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_lang_list.md"),
    new cr.Property(ept_section, "Custom paths", "",	"Custom path."),   
	new cr.Property(ept_text, "Core path", "", "A string specifying the location of the tesseract.js-core library."),
	new cr.Property(ept_text, "Lang path", "", "A string specifying the location of the tesseract language files."),    
	new cr.Property(ept_text, "Worker path", "", "A string specifying the location of the tesseract.worker.js file."),        
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
