function GetPluginSettings()
{
	return {
		"name":			"UserID to ID",
		"id":			"Rex_Firebase_UserID2ID",
		"version":		"0.1",        
		"description":	"Mapping between UserID and another alias ID.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_Firebase_userID2ID.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On request ID successfully", "Request - ID", 
            "On request ID successfully", 
            "Triggered when requested ID successfully.", "OnRequestIDSuccessfully");
            
AddCondition(2, cf_trigger, "On request ID failed", "Request - ID", 
            "On request ID failed", 
            "Triggered when requested ID failed.", "OnRequestIDFailed");
            
AddCondition(3, cf_trigger, "On request User ID successfully", "Request - User ID", 
            "On request User ID successfully", 
            "Triggered when requested User ID successfully.", "OnRequestUserIDSuccessfully");
            
AddCondition(4, cf_trigger, "On request User ID failed", "Request - User ID", 
            "On request User ID failed", 
            "Triggered when requested User ID failed.", "OnRequestUserIDFailed");                   
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("User ID", "Key of User ID.", '""');
AddNumberParam("Digits", "Count of digit characters for default value.", 9);
AddNumberParam("Retry", "Retry count to get default value.", 1000);
AddAction(1, 0, "Get random ID", "Request - ID", 
          "Request - get ID from user ID:<i>{0}</i>, return a <i>{1}</i> digit random ID by default with retry <i>{2}</i> times", 
          "Request random ID.", "RequestGetRandomID");

AddStringParam("ID", "ID.", '""');
AddAction(2, 0, "Get user ID", "Request - User ID", 
          "Request - get user ID from ID:<i>{0}</i>", 
          "Request user ID.", "RequestGetUserID");

AddStringParam("User ID", "Key of User ID.", '""');
AddStringParam("ID", "ID.", '""');
AddAction(3, 0, "Try set ID", "Request - ID", 
          "Request - Try set ID:<i>{1}</i> for user ID:<i>{0}</i>", 
          "Request try set ID.", "RequestTrySetID");                  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get ID of result", "Request - result", "ID", 
              "Get ID of result."); 
AddExpression(2, ef_return_string, "Get User ID of result", "Request - result", "UserID", 
              "Get User ID of result.");
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
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
