function GetPluginSettings()
{
	return {
		"name":			"GIF render",
		"id":			"Rex_GIFJS",
		"version":		"1.0",        
		"description":	"GIF encoder. Reference: https://github.com/jnordberg/gif.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_gifjs.html",
		"category":		"Rex - Image",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"gif.js;gif.worker.js"        
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On finished", "Event", "On finished", "Trigger when render is finished", "OnFinished");

//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Frame", "Current frame of Sprite, or canvas object.");    
AddNumberParam("Delay", "Frame delay, in seconds", 0.5);
AddComboParamOption("Add");
AddComboParamOption("Copy");
AddComboParam("Copy", "Copy or add frame.", 0); 
AddAction(1, 0, "Add frame", "1. Add frame", 
          "<i>{2}</i> <i>{0}</i> with delay to <i>{1}</i>","Add frame from sprite or canvas.", "AddCanvas");  

AddAction(2, 0, "Render", "2. Render", 
          "Render","Render GIF.", "Render");  

AddStringParam("URI", "Image in base64", '""');          
AddNumberParam("Delay", "Frame delay, in seconds", 0.5);          
AddAction(3, af_deprecated, "Add uri", "1. Add frame", 
          "Add frame from <i>{0}</i> with delay to <i>{1}</i>","Add frame from base64 string.", "AddURI");            
          
AddNumberParam("Repeat", "Repeat count, -1 = no repeat, 0 = forever.", 0); 
AddAction(11, 0, "Set repeat", "0. Configuration", 
          "Set repeat count to <i>{0}</i>","Set repeat count.", "SetRepeat");          
          
AddNumberParam("Quality", "Pixel sample interval, lower is better.", 10); 
AddAction(12, 0, "Set quality", "0. Configuration", 
          "Set pixel sample interval to <i>{0}</i>","Set pixel sample interval.", "SetQuality");

AddNumberParam("Workers", "Number of web workers to spawn.", 2); 
AddAction(13, 0, "Set workers", "0. Configuration", 
          "Set workers to <i>{0}</i>","Set workers.", "SetWorkers");           
          
AddAnyTypeParam("Background", "Background color where source image is transparent.", '"#fff"'); 
AddAction(14, 0, "Set background color", "0. Configuration", 
          "Set background color to <i>{0}</i>","Set background color", "SetBackground");     
          
AddAnyTypeParam("Transparent", 'Transparent hex color, "0x00FF00" = green, "" = null.', '""'); 
AddAction(15, 0, "Set transparent", "0. Configuration", 
          "Set transparent hex color to <i>{0}</i>","Set transparent hex color", "SetTransparent");    

AddAction(21, 0, "Release", "Result", 
          "Release result","Release object URL of render result.", "Release");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get object URL", "Result", "ObjectURL", 'Get object URL of render result. Return "" if result is invalid.');
AddExpression(2, ef_return_string, "Get content type", "Result", "ContentType", 'Get content type of render result. Return "" if result is invalid.');

ACESDone();

// Property grid properties for this plugin
var property_list = [
		new cr.Property(ept_integer, "Repeat", 0, "Repeat count, -1 = no repeat, 0 = forever."),
		new cr.Property(ept_integer, "Quality", 10, "Pixel sample interval, lower is better."),   
		new cr.Property(ept_integer, "Workers", 2, "Number of web workers to spawn."),            
		new cr.Property(ept_text, "Background", "#fff", "Background color where source image is transparent."), 
		new cr.Property(ept_text, "Transparent", "", 'Transparent hex color, "0x00FF00" = green, "" = null.'),                      
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
