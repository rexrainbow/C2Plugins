function GetPluginSettings()
{
	return {
		"name":			"Storage",
		"id":			"Rex_Firebase_Storage",
		"version":		"0.1",        
		"description":	"File storage in firebase serivice (v3.x only).",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_storage.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
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
           
AddCondition(3, cf_trigger, "On canceled", "Upload", 
            "On upload canceled", 
            "Triggered when uploading canceled.", "OnUploadCanceled");       

AddCondition(4, cf_trigger, "On paused", "Upload", 
            "On upload paused", 
            "Triggered when uploading paused.", "OnPaused");       

AddCondition(5, cf_trigger, "On resmue", "Upload", 
            "On resmue", 
            "Triggered when resmue.", "OnResmue");       

AddCondition(6, 0, "Is uploading", "Upload", 
            "Is uploading", 
            "Return true if uploading.", "IsUploading");    

AddCondition(7, cf_trigger, "On progress", "Upload", 
            "On upload progress",
            "Triggered when uploading progress.", "OnProgress"); 
            
AddCondition(8, cf_trigger, "On start", "Upload", 
            "On upload starting", 
            "Triggered when uploading starting.", "OnStart");             

AddCondition(11, cf_trigger, "On get download URL", "Download", 
            "On get download URL", 
            "Triggered when get download URL success.", "OnGetDownloadURL");
            
AddCondition(12, cf_trigger, "On get download URL error", "Download", 
            "On get download URL error", 
            "Triggered when get download URL error.", "OnGetDownloadURLError");     

AddCondition(13, 0, "File doesn't exist", "Download", 
            "File doesn't exist", 
            "Return true if file doesn't exist.", "FileDoesntExist");  

AddCondition(21, cf_trigger, "On deleted", "Delete", 
            "On delete complete", 
            "Triggered when delete completed.", "OnDeleteCompleted");
            
AddCondition(22, cf_trigger, "On deleted error", "Delete", 
            "On delete error", 
            "Triggered when delete error.", "OnDeleteError");  

AddCondition(71, cf_trigger, "On get metadata", "Metadata", 
            "On get metadata", 
            "Triggered when get metadata success.", "OnGetMetadata");
            
AddCondition(72, cf_trigger, "On get metadata error", "Metadata", 
            "On get metadata error", 
            "Triggered when get metadata error.", "OnGetMetadataError");    

AddCondition(73, cf_trigger, "On update metadata", "Metadata", 
            "On update metadata", 
            "Triggered when update metadata success.", "OnUpdateMetadata");
            
AddCondition(74, cf_trigger, "On update metadata error", "Metadata", 
            "On update metadata error", 
            "Triggered when update metadata error.", "OnUpdateMetadataError");
            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Sub domain", "The Firebase data ref URL", '""');
AddAction(0, 0, "Set sub domain", "Domain", 
          "Set Sub domain ref to <i>{0}</i>", 
          "Set Sub domain ref.", "SetSubDomainRef");
          
AddObjectParam("File chooser", "File chooser object.");
AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(1, 0, "Upload from file chooser", "Upload", 
          "Upload file from <i>{0}</i> to <i>{1}</i>", 
          "Upload file from file chooser to firebase storage.", "UploadFromFileChooser");
          
AddAction(2, 0, "Cancel", "Upload task", 
          "Cancel current uploading", 
          "Cancel current uploading.", "CancelUploading");        

AddAction(3, 0, "Pause", "Upload task", 
          "Pause current uploading", 
          "Pause current uploading.", "PauseUploading");                 
  
AddAction(4, 0, "Resume", "Upload task", 
          "Resume current uploading", 
          "Resume current uploading.", "ResumeUploading");   
          
AddObjectParam("Sprite", "Sprite or canvas object.");
AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(5, 0, "Upload from sprite", "Upload", 
          "Upload image from <i>{0}</i> to <i>{1}</i>", 
          "Upload image from sprite or canvas to firebase storage.", "UploadFromSprite");      

AddStringParam("Data URI", "Data URI of file", '""');
AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(6, 0, "Upload data URL", "Upload", 
          "Upload data URI <i>{0}</i> to <i>{1}</i>", 
          "Upload from data URI to firebase storage.", "UploadDataURI");  

AddStringParam("Content", "String content", '""');
AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(7, 0, "Upload string", "Upload", 
          "Upload string <i>{0}</i> to <i>{1}</i>", 
          "Upload string to firebase storage.", "UploadString"); 

AddStringParam("ObjectURL", "ObjectURL.", '""');
AddStringParam("Content type", 'Content type.', '""');
AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(8, 0, "Upload objectURL", "Upload", 
          "Upload objectURL <i>{0}</i> (type <i>{1}</i>) to <i>{2}</i>", 
          "Upload from objectURL to firebase storage.", "UploadObjectURL");           

AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(11, 0, "Get download url", "Download", 
          "Get download url of <i>{0}</i>", 
          "Get download url of a firebase storage reference.", "GetDownloadURL");          
          
AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(21, 0, "Detete", "Delete", 
          "Detete <i>{0}</i>", 
          "Delete file at url of a firebase storage reference.", "DeleteAtURL");   

AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(71, 0, "Get metadata", "Metadata", 
          "Get metadata of <i>{0}</i>", 
          "Get metadata of a firebase storage reference.", "GetMetadata");        

AddStringParam("DataRef", "The Firebase storage ref URL", '""');
AddAction(72, 0, "Update metadata", "Metadata", 
          "Update metadata of <i>{0}</i>", 
          "Update metadata of a firebase storage reference.", "UpdateMetadata");            
          
AddStringParam("Key", 'Key string.', '""');
AddAnyTypeParam("Value", 'Value.', '""');
AddAction(73, 0, "Set value", "Metadata", 
          "Set metadata <i>{0}</i> to <i>{1}</i>", 
          "Set key of metadata.", "MetadataSetValue");
          
AddStringParam("JSON string", "JSON string.", '""');
AddAction(74, 0, "Load JSON", "Metadata", 
          "Load metadata to <i>{0}</i>", 
          "Load metadata by JSON.", "MetadataLoadJSON");
          
AddStringParam("Key", 'Key string.', '""');
AddAction(75, 0, "Remove key", "Metadata", 
          "Remove metadata <i>{0}</i>", 
          "Remove key of metadata.", "MetadataRemoveKey");          
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get download URL", "Upload", "LastDownloadURL", 
              "Get download URL of last upload file, or result of the last request.");
              
AddExpression(2, ef_return_number, "Get progress", "Upload", "Progress", "Get the progress, from 0 to 1, of the request in 'On upload progress'.");  

AddExpression(3, ef_return_number, "Get transferred bytes", "Upload", "TransferredBytes", "Get transferred bytes, of the request in 'On upload progress'.");
AddExpression(4, ef_return_number, "Get total Bytes", "Upload", "TotalBytes", "Get total bytes, of the request in 'On upload progress'.");                                                
        
AddExpression(21, ef_return_string, "Error code", "Error", "LastErrorCode", 
              "Error code.");        
AddExpression(22, ef_return_string, "Error message", "Error", "LastErrorMessage", 
              "Error message (error.serverResponse) .");
              
AddExpression(71, ef_return_any | ef_variadic_parameters, "Get metadata", "Metadata", "LastMetadata", 
              "Get metadata of last upload file, or result of the last request. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Sub domain", "image", "Sub domain for this function."),        
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
