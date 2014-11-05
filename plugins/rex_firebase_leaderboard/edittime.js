function GetPluginSettings()
{
	return {
		"name":			"Leader board",
		"id":			"Rex_Firebase_Leaderboard",
		"version":		"0.1",        
		"description":	"Leader board built on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_leaderboard.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On post complete", "Send", 
            "On post complete",
            "Triggered when post complete.", "OnPostComplete");

AddCondition(2, cf_trigger, "On post error", "Send", 
            "On post error",
            "Triggered when post error.", "OnPostError");
            
AddCondition(3, cf_trigger, "On update", "Update", 
            "On update ranks",
            "Triggered when ranks updated.", "OnUpdate");     

AddCondition(11, cf_looping | cf_not_invertible, "For each rank", "Update - for each", 
             "For each rank", 
             "Repeat the event for each rank.", "ForEachRank");            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Name", "Player name.", '""');
AddAnyTypeParam("Score", "Player Score", 0);
AddAction(1, 0, "Post score", "Send", 
          "Post <i>{0}</i>: <i>{1}</i>", 
          "Post score.", "PostScore");
                  
AddAction(2, 0, "Update all", "Update", 
          "Update all ranks", 
          "Update all ranks.", "UpdateAllRanks");
          
AddNumberParam("Count", "The count of top ranks.", 10);       
AddAction(3, 0, "Update top", "Update", 
          "Update top <i>{0}</i> ranks", 
          "Update top ranks.", "UpdateTopRanks");	
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Current player name", "Update - for each", "CurPlayerName", 
              "Get the current player name in a For Each loop.");   			  
AddExpression(2, ef_return_number, "Current player score", "Update - for each", "CurPlayerScore", 
              "Get the current player score in a For Each loop."); 
AddExpression(3, ef_return_number, "Current player rank", "Update - for each", "CurPlayerRank", 
              "Get the current player rank (0-based) in a For Each loop."); 

AddExpression(11, ef_return_string, "Post player name", "Post", "PostPlayerName", 
              'The post player name. Uses under "condition:On post complete".');
                                    
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "ID", "", "ID of leader board."),  
	new cr.Property(ept_combo, "Order", "Large to small", "Ranking order.", "Small to large|Large to small"), 
    new cr.Property(ept_combo, "Update", "Manual", "Manual update or auto update.", "Manual|Auto"), 
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
