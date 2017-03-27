function GetPluginSettings()
{
	return {
		"name":			"File Upload",
		"id":			"Rex_Parse_FileUpload",
		"version":		"0.1",        
		"description":	"Upload image to parse server, then get public URL.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_parse_fileupload.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_deprecated
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On complete", "Upload", 
            "On upload complete", 
            "Triggered when uploading completed.", "OnUploadCompleted");
            
AddCondition(2, cf_trigger, "On error", "Upload", 
            "On upload error", 
            "Triggered when uploading error.", "OnUploadError");
                             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("URI", "Data URI of upload image", '""');
AddStringParam("File name", "File name of upload image.", '"MyImage.png"');
AddAction(1, 0, "Upload image", "Upload", 
          "Upload image <i>{0}</i>", 
          "Upload image to parse server. Each uploaded file will have a new URL.", "UploadImage");
          
AddObjectParam("Sprite", "Sprite object.");
AddStringParam("File name", "File name of upload image.", '"MyImage.png"');
AddAction(2, 0, "Upload current frame", "Upload", 
          "Upload <i>{0}</i> 's current frame", 
          "Upload current frame of sprite to parse server. Each uploaded file will have a new URL.", "UploadSpriteCurrentFrame");                           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get URL", "Upload", "LastURL", 
              "Get URL of last upload file .");
AddExpression(2, ef_return_string, "Get File name", "Upload", "LastFileName", 
              "Get file name of last upload file .");

AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
                                                                      
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
