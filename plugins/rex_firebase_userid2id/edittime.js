function GetPluginSettings()
{
	return {
		"name":			"UserID to ID",
		"id":			"Rex_Firebase_UserID2ID",
		"version":		"0.1",        
		"description":	"Each UserID could register an alias ID.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_Firebase_userID2ID.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On request ID", "Request - ID", 
            "On request ID", 
            "Triggered when requested ID successful.", "OnRequestIDSuccessful");
            
AddCondition(2, cf_trigger, "On request ID error", "Request - ID", 
            "On request ID error", 
            "Triggered when requested ID error.", "OnRequestIDError");
            
AddCondition(3, cf_trigger, "On request User ID", "Request - User ID", 
            "On request User ID", 
            "Triggered when requested User ID successful.", "OnRequestUserIDSuccessful");
            
AddCondition(4, cf_trigger, "On request User ID error", "Request - User ID", 
            "On request User ID error", 
            "Triggered when requested User ID error.", "OnRequestUserIDError"); 

AddCondition(11, cf_trigger, "On remove User ID", "Remove", 
            "On remove User ID", 
            "Triggered when removed User ID successful.", "OnRemoveUserIDSuccessful");
            
AddCondition(12, cf_trigger, "On remove User ID error", "Remove", 
            "On remove User ID error", 
            "Triggered when removed User ID error.", "OnRemoveUserIDError");             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("User ID", "Key of User ID.", '""');
AddNumberParam("Digits", "Count of digit characters for default value.", 9);
AddNumberParam("Retry", "Retry count to get default value.", 1000);
AddAction(1, 0, "Get random ID", "Request - ID", 
          "Request - get ID from User ID:<i>{0}</i>, return a <i>{1}</i> digit random ID by default with retry <i>{2}</i> times", 
          "Request random ID.", "RequestGetRandomID");

AddStringParam("ID", "ID.", '""');
AddAction(2, 0, "Get User ID", "Request - User ID", 
          "Request - get User ID by ID:<i>{0}</i>", 
          "Request User ID.", "RequestGetUserID");

AddStringParam("User ID", "Key of User ID.", '""');
AddStringParam("ID", "ID.", '""');
AddAction(3, 0, "Try set ID", "Request - ID", 
          "Request - try set ID:<i>{1}</i> for User ID:<i>{0}</i>", 
          "Request try set ID.", "RequestTryGetID"); 
          
AddStringParam("User ID", "Key of User ID.", '""');
AddAction(4, 0, "Get ID", "Request - ID", 
          "Request - get ID by User ID:<i>{0}</i>", 
          "Request ID.", "RequestTryGetID");  
          
AddStringParam("User ID", "Key of User ID.", '""');
AddAction(11, 0, "Remove User ID", "Remove", 
          "Remove User ID:<i>{0}</i>", 
          "Remove User ID.", "RemoveUserID");              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get ID of result", "Request - result", "ID", 
              "Get ID of result."); 
AddExpression(2, ef_return_string, "Get User ID of result", "Request - result", "UserID", 
              "Get User ID of result.");
               
AddExpression(21, ef_return_string, "Error code", "Error", "LastErrorCode", 
              "Error code.");        
AddExpression(22, ef_return_string, "Error message", "Error", "LastErrorMessage", 
              "Error message (error.serverResponse) .");               
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "UserID-ID", "Sub domain for this function."),
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
