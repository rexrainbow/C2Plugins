function GetPluginSettings()
{
	return {
		"name":			"Leader board",
		"id":			"Rex_parse_Leaderboard",
		"version":		"0.1",        
		"description":	"Leader board built on parse.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_parse_leaderboard.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"parse-1.3.2.min.js"
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
AddNumberParam("Start", "Start from rank index (0-based).", 0);  
AddNumberParam("End", "End to rank index (0-based). This value should larger than Start.", 2);    
AddCondition(12, cf_looping | cf_not_invertible, "For each rank in a range", "Update - for each", 
             "For each rank from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each rank in a range.", "ForEachRank");  

//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAnyTypeParam("Score", "Player Score", 0);
AddAnyTypeParam("Extra", "Extra data, could be number or (JSON) string.", '""');
AddAction(1, 0, "Post score", "Send", 
          "Post (User ID: <i>{0}</i>) <i>{1}</i>: <i>{2}</i>, extra data to <i>{3}</i>", 
          "Post score by user ID.", "PostScore");
 
AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10); 
AddAction(2, 0, "Request in a range", "Request", 
          "Request start from <i>{0}</i> with <i>{1}</i> lines", 
          "Request in a range.", "RequestInRange");
          
AddNumberParam("Index", "Page index, 0-based.", 0);
AddAction(3, 0, "Turn to page", "Request - page", 
          "Request - turn to page <i>{0}</i>", 
          "Turn to page.", "RequestTurnToPage");
                           
AddAction(4, 0, "Update current page", "Request - page", 
          "Request - update current page", 
          "Update current page.", "RequestUpdateCurrentPage"); 
          
AddAction(5, 0, "Turn to next page", "Request - page", 
          "Request - turn to next page", 
          "Update turn to next page.", "RequestTurnToNextPage");  

AddAction(6, 0, "Turn to previous page", "Request - page", 
          "Request - turn to previous page", 
          "Update turn to previous page.", "RequestTurnToPreviousPage");     

AddStringParam("Leaderboard ID", "ID of leader board.", '"0"');
AddAction(11, 0, "Set leaderboard ID", "Leaderboard", 
          "Set leaderboard ID to <i>{0}</i>", 
          "Set leaderboard ID and clean all.", "SetLeaderboardID");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Current player name", "Update - for each", "CurPlayerName", 
              "Get the current player name in a For Each loop.");   			  
AddExpression(2, ef_return_any, "Current player score", "Update - for each", "CurPlayerScore", 
              "Get the current player score in a For Each loop."); 
AddExpression(3, ef_return_number, "Current player rank", "Update - for each", "CurPlayerRank", 
              "Get the current player rank (0-based) in a For Each loop."); 
AddExpression(4, ef_return_string, "Current user ID", "Update - for each", "CurUserID", 
              "Get the current user id in a For Each loop.");               
AddExpression(5, ef_return_any, "Current extra data", "Update - for each", "CurExtraData", 
              "Get the current extra data in a For Each loop.");
                            
AddExpression(11, ef_return_string, "Post player name", "Post", "PostPlayerName", 
              'The post player name. Uses under "condition:On post complete".');

AddStringParam("UserID", "UserID from authentication.", '""');
AddExpression(22, ef_return_number, "Get rank by user ID", "Rank", "UserID2Rank", 
              "Get rank by user ID. Return (-1) if not found."); 
AddNumberParam("Rank", "Rank index (0-based).", 0);   
AddExpression(23, ef_return_string, "Player name", "Rank index", "Rank2PlayerName", 
              "Get player name by rank index.");                
AddNumberParam("Rank", "Rank index (0-based).", 0);                  			  
AddExpression(24, ef_return_any, "Player score", "Rank index", "Rank2PlayerScore", 
              "Get player score by rank index.");                                              
AddNumberParam("Rank", "Rank index (0-based).", 0);               
AddExpression(25, ef_return_any, "Extra data", "Rank index", "Rank2ExtraData",
              "Get extra data by rank index."); 

AddExpression(31, ef_return_number, "Get current page index", "Page", "PageIndex", 
              "Get current page index. (0-based)"); 
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Application ID", "", "Application ID"),
	new cr.Property(ept_text, "Javascript Key", "", "Javascript Key"),
    new cr.Property(ept_text, "Class name", "Leaderboard", "Class name for storing leaderboard structure."), 
    new cr.Property(ept_text, "ID", "0", "ID of leader board."),
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),    
	new cr.Property(ept_combo, "Order", "Large to small", "Ranking order.", "Small to large|Large to small"), 	
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
