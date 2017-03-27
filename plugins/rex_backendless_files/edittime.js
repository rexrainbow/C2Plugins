function GetPluginSettings()
{
	return {
		"name":			"Files",
		"id":			"Rex_Backendless_Files",
		"version":		"0.1",        
		"description":	"Files stored in backendless serivice.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_backendless_files.html",
		"category":		"Rex - Web - Backendless",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On upload", "Upload", 
            "On upload complete", 
            "Triggered when uploading completed.", "OnUpload");
            
AddCondition(2, cf_trigger, "On upload error", "Upload", 
            "On upload error", 
            "Triggered when uploading error.", "OnUploadError");
            
AddCondition(11, cf_trigger, "On get files list", "List", 
            "On get files list", 
            "Triggered when get files list success.", "OnGetList");
            
AddCondition(12, cf_trigger, "On get files list error", "List", 
            "On get files list", 
            "Triggered when get files list error.", "OnGetListError");    

AddCondition(13, cf_looping | cf_not_invertible, "For each files", "List - for each", 
             "For each files", 
             "Repeat the event for each file of listing result.", "ForEachFile");            
            
AddCondition(21, cf_trigger, "On rename", "Rename", 
            "On rename", 
            "Triggered when rename success.", "OnRename");
            
AddCondition(22, cf_trigger, "On rename error", "Rename", 
            "On rename error", 
            "Triggered when rename error.", "OnRenameError");     
            
AddCondition(23, cf_trigger, "On copy", "Copy", 
            "On copy", 
            "Triggered when copy success.", "OnCopy");
            
AddCondition(24, cf_trigger, "On copy error", "Copy", 
            "On copy error", 
            "Triggered when copy error.", "OnCopyError");  

AddCondition(25, cf_trigger, "On move", "Move", 
            "On move", 
            "Triggered when move success.", "OnMovey");
            
AddCondition(26, cf_trigger, "On move error", "Move", 
            "On move error", 
            "Triggered when move error.", "OnMoveError");                
            
AddCondition(27, cf_trigger, "On deleted", "Delete", 
            "On delete complete", 
            "Triggered when delete completed.", "OnDeleteCompleted");
            
AddCondition(28, cf_trigger, "On deleted error", "Delete", 
            "On delete error", 
            "Triggered when delete error.", "OnDeleteError");            
//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("File chooser", "File chooser object.");
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddAction(1, 0, "Upload from file chooser", "Upload", 
          "Upload file from <i>{0}</i> to directory <i>{1}</i>", 
          "Upload file from file chooser to file storage.", "UploadFromFileChooser");
          
AddObjectParam("Sprite", "Sprite or canvas object.");
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", "Name of the file where the byte content should be written to.", '""');
AddAction(5, 0, "Upload from sprite", "Upload", 
          "Upload image from <i>{0}</i> to path <i>{1}</i>/<i>{2}</i>", 
          "Upload image from sprite or canvas to firebase storage.", "UploadFromSprite");      

AddStringParam("Data URI", "Data URI of file", '""');
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", "Name of the file where the byte content should be written to.", '""');
AddAction(6, 0, "Upload data URL", "Upload", 
          "Upload data URI <i>{0}</i> to path <i>{1}</i>/<i>{2}</i>",
          "Upload data URI to firebase storage.", "UploadDataURI");    

AddStringParam("Content", "String content", '""');
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", "Name of the file where the byte content should be written to.", '""');
AddAction(7, 0, "Upload string", "Upload", 
          "Upload string <i>{0}</i> to path <i>{1}</i>/<i>{2}</i>",
          "Upload string to firebase storage.", "UploadString");           

AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddComboParamOption("");
AddComboParamOption("include sub folders");
AddComboParam("Sub directory", "Include sub directory or not.", 0);   
AddAction(11, 0, "Set directory", "List - 0. setting", 
          "List- Set directory <i>{0}</i> <i>{1}</i>", 
          "Set listing directory path.", "List_SetDirectory"); 
          
AddStringParam("Pattern", "A pattern which the returned files and directories must match, which can include wildcard characters.", '"*.*"');
AddAction(12, 0, "Set pattern", "List - 0. setting", 
          "List- Set pattern to <i>{0}</i>", 
          "Set listing pattern.", "List_SetPattern");
     
AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10); 
AddAction(13, 0, "Request in a range", "List", 
          "List- start from <i>{0}</i> with <i>{1}</i> lines", 
          "Load in a range.", "RequestInRange");
          
AddNumberParam("Index", "Page index, 0-based.", 0);
AddAction(14, 0, "Turn to page", "Load - page", 
          "List- turn to page <i>{0}</i>", 
          "Turn to page.", "RequestTurnToPage");
                           
AddAction(15, 0, "Update current page", "List - page", 
          "List- update current page", 
          "Update current page.", "RequestUpdateCurrentPage"); 
          
AddAction(16, 0, "Turn to next page", "List - page", 
          "List- turn to next page", 
          "Turn to next page.", "RequestTurnToNextPage");  

AddAction(17, 0, "Turn to previous page", "List - page", 
          "List- turn to previous page", 
          "Turn to previous page.", "RequestTurnToPreviousPage");    
          
AddAction(18, 0, "Request all", "List - all", 
          "List- all files", 
          "Load all files list.", "LoadAllItems");            
          
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", 'Name of the file. Set to "" to renane directory.', '""');
AddStringParam("New name", "New name for the file or directory.", '""');
AddAction(21, 0, "Rename", "Rename", 
          "Rename <i>{0}</i>/<i>{1}</i> to <i>{2}</i>", 
          "Rename file or directory.", "Rename");          
          
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", 'Name of the file. Set to "" to renane directory.', '""');
AddStringParam("New name", "New name for the file or directory.", '""');
AddAction(22, 0, "Copy", "Copy", 
          "Copy <i>{0}</i>/<i>{1}</i> to <i>{2}</i>", 
          "Copy file or directory.", "Copy");

AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", 'Name of the file. Set to "" to renane directory.', '""');
AddStringParam("New directory path", "New name for the file or directory.", '""');
AddAction(23, 0, "Move", "Move", 
          "Move <i>{0}</i>/<i>{1}</i> to <i>{2}</i>", 
          "Move file or directory.", "Move");           
          
AddStringParam("Directory path", "Directory path without the name of the file in the Backendless file storage.", '""');
AddStringParam("File name", 'Name of the file where the byte content should be written to. Set to "" to delete directory.', '""');
AddAction(24, 0, "Detete", "Delete", 
          "Detete <i>{0}</i>/<i>{1}</i>",
          "Delete file or directory.", "Delete");              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get download URL of result", "Result", "LastDownloadURL", 
              "Get download URL of last action (upload/copy/move/rename) result.");
              
AddExpression(2, ef_return_string | ef_variadic_parameters, "Get download URL", "URL", "DownloadURL", 
              "Get download URL, add directory path in 1st parameter, fileName in 2nd parameter.");              
             
AddExpression(11, ef_return_string, "Current file name", "List - for each", "CurFileName", 
              "Get current file name in a For Each loop.");
AddExpression(12, ef_return_string, "Current public url", "List - for each", "CurPublicUrl", 
              "Get current public url in a For Each loop.");              
AddExpression(13, ef_return_string, "Current directory", "List - for each", "CurDirectory", 
              "Get current directory in a For Each loop.");      
AddExpression(14, ef_return_number, "Current created timestamp", "List - for each", "CurCreated", 
              "Get current created timestamp in a For Each loop.");    
AddExpression(15, ef_return_number, "Current file size", "List - for each", "CurFileSize", 
              "Get current file size in a For Each loop.");    
              
AddExpression(21, ef_return_number, "Current start index", "Load - for each - index", "CurStartIndex", 
              "Get start index in current received page.");
AddExpression(22, ef_return_number, "Current loop index", "Load - for each - index", "LoopIndex", 
              "Get loop index in current received page.");
AddExpression(23, ef_return_number, "Current file index", "Load - for each - index", "CurFileIndex", 
              "Get the current file index in a For Each loop.");      

AddNumberParam("Index", "Global index, 0-based.", 0);                
AddExpression(31, ef_return_string, "Get file name by index", "List - index", "Index2FileName", 
              "Get file name by index.");
AddNumberParam("Index", "Global index, 0-based.", 0);                
AddExpression(32, ef_return_string, "Get public url by index", "List - index", "Index2PublicUrl", 
              "Get public url by index.");              
AddNumberParam("Index", "Global index, 0-based.", 0);                
AddExpression(33, ef_return_string, "Get directory by index", "List - index", "Index2Directory", 
              "Get directory by index.");      
AddNumberParam("Index", "Global index, 0-based.", 0);                
AddExpression(34, ef_return_number, "Get created timestamp by index", "List - index", "Index2Created", 
              "Get created timestamp by index.");    
AddNumberParam("Index", "Global index, 0-based.", 0);                
AddExpression(35, ef_return_number, "Get file size by index", "List - index", "Index2FileSize", 
              "Get file size by index.");                  

AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),        
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
