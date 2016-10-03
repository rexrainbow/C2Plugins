function GetPluginSettings()
{
	return {
		"name":			"Leader board",
		"id":			"Rex_parse_Leaderboard",
		"version":		"0.1",        
		"description":	"Leader board built on parse.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_leaderboard.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On post complete", "Score - post", 
            "On post complete",
            "Triggered when post complete.", "OnPostComplete");

AddCondition(2, cf_trigger, "On post error", "Score - post", 
            "On post error",
            "Triggered when post error.", "OnPostError");
            
AddCondition(3, cf_trigger, "On receive", "Load", 
            "On receive ranks",
            "Triggered when receive updated.", "OnReceived");    

AddCondition(4, cf_trigger, "On receive error", "Load", 
            "On receive ranks error",
            "Triggered when receive ranks error.", "OnReceivedError");       
            
AddCondition(11, cf_looping | cf_not_invertible, "For each rank", "Load - for each", 
             "For each rank", 
             "Repeat the event for each rank.", "ForEachRank"); 
             
AddNumberParam("Start", "Start from rank index (0-based).", 0);  
AddNumberParam("End", "End to rank index (0-based). This value should larger than Start.", 2);    
AddCondition(12, cf_looping | cf_not_invertible, "For each rank in a range", "Load", 
             "For each rank from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each rank in a range.", "ForEachRank");  
             
AddCondition(13, 0, "Last page", "Load", 
             "Is the last page", 
             "Return true if current page is the last page.", "IsTheLastPage");              

AddCondition(21, cf_trigger, "On get ranking", "Ranking", 
            "On get ranking",
            "Triggered when get ranking.", "OnGetRanking");

AddCondition(22, cf_trigger, "On get ranking error", "Ranking", 
            "On get ranking error",
            "Triggered when get ranking error.", "OnGetRankingError");
            
AddCondition(23, cf_trigger, "On get score", "Score - get", 
            "On get score",
            "Triggered when get score.", "OnGetScore");

AddCondition(24, cf_trigger, "On get score error", "Score - get", 
            "On get score error",
            "Triggered when get score error.", "OnGetScoreError");            
            
AddCondition(31, cf_trigger, "On get users count", "Users count", 
            "On get messages count",
            "Triggered when get messages count.", "OnGeUsersCount");

AddCondition(32, cf_trigger, "On get users count error", "Users count", 
            "On get users count error",
            "Triggered when get users count error.", "OnGetUsersCountError");             
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "(Optional) Player name.", '""');
AddAnyTypeParam("Score", "Player Score", 0);
AddAnyTypeParam("Extra", "(Optional) Extra data, could be number or (JSON) string.", '""');
AddComboParamOption("");
AddComboParamOption("if greater");
AddComboParamOption("if less");
AddComboParam("Post condition", "Post if score is greater or less then saved score.", 0);
AddAction(1, 0, "Post score", "Score", 
          "Post (User ID: <i>{0}</i>) <i>{1}</i>: <i>{2}</i>, extra data to <i>{3}</i> <i>{4}</i>", 
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

AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "(Optional) Player name.", '""');
AddAnyTypeParam("Add", "Add score", 0);
AddAnyTypeParam("Extra", "(Optional) Extra data, could be number or (JSON) string.", '""');
AddAction(7, 0, "Add to  score", "Score", 
          "Add <i>{2}</i> to (User ID: <i>{0}</i>) <i>{1}</i> 's score, extra data to <i>{3}</i>", 
          "Add score by user ID.", "AddScore");          

AddStringParam("Leaderboard ID", "ID of leader board.", '"0"');
AddAction(11, 0, "Set leaderboard ID", "Leaderboard", 
          "Set leaderboard ID to <i>{0}</i>", 
          "Set leaderboard ID and clean all.", "SetLeaderboardID");        
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(21, 0, "Get ranking", "Ranking", 
          "Get ranking of User ID: <i>{0}</i>", 
          "Get ranking.", "GetRanking");   
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(22, 0, "Get score", "Score", 
          "Get score of User ID: <i>{0}</i>", 
          "Get score.", "GetScore");             
          
AddAction(31, 0, "Get users count", "Users count", 
          "Get users count", 
          "Get users count. Maximum of 160 requests per minute.", "GetUsersCount");  
          
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable");                             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Current player name", "Load - for each", "CurPlayerName", 
              "Get the current player name in a For Each loop.");   			  
AddExpression(2, ef_return_any, "Current player score", "Load - for each", "CurPlayerScore", 
              "Get the current player score in a For Each loop."); 
AddExpression(3, ef_return_number, "Current player rank", "Load - for each - index", "CurPlayerRank", 
              "Get the current player rank (0-based) in a For Each loop."); 
AddExpression(4, ef_return_string, "Current user ID", "Load - for each", "CurUserID", 
              "Get the current user id in a For Each loop.");               
AddExpression(5, ef_return_any, "Current extra data", "Load - for each", "CurExtraData", 
              "Get the current extra data in a For Each loop.");
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(6, ef_return_any | ef_variadic_parameters, "Value of current user object", "Load - for each", "CurUserObject", 
              "Get value of current user object in a For Each loop.");
AddExpression(7, ef_return_number, "Current ranking count", "Received - for each", "CurRankingCount", 
              "Get ranking count in current received page.");   
AddExpression(8, ef_return_number, "Current start index", "Load - for each - index", "CurStartIndex", 
              "Get start index in current received page.");           
AddExpression(9, ef_return_number, "Current loop index", "Load - for each - index", "LoopIndex", 
              "Get loop index in current received page.");                             
                                       
AddExpression(11, ef_return_string, "Posted player name", "Post", "PostPlayerName", 
              'Get posted player name under "condition:On post complete".');
AddExpression(12, ef_return_any, "Current player score", "Post", "PostPlayerScore", 
              'Get posted current player score under "condition:On post complete".'); 
AddExpression(14, ef_return_string, "Current user ID", "Post", "PostPlayerUserID", 
              'Get posted current user id under "condition:On post complete".');               
AddExpression(15, ef_return_any, "Current extra data", "Post", "PostExtraData", 
              'Get posted current extra data under "condition:On post complete".');
              
AddStringParam("UserID", "UserID from authentication.", '""');
AddExpression(22, ef_return_number, "Get rank by user ID", "Rank", "UserID2Rank", 
              "Get rank by user ID. Return (-1) if not found."); 
AddNumberParam("Rank", "Rank index (0-based).", 0);   
AddExpression(23, ef_return_string | ef_variadic_parameters, "Player name", "Rank index", "Rank2PlayerName", 
              "Get player name by rank index. Add default value at 2nd parameter.");                
AddNumberParam("Rank", "Rank index (0-based).", 0);                  			  
AddExpression(24, ef_return_any | ef_variadic_parameters, "Player score", "Rank index", "Rank2PlayerScore", 
              "Get player score by rank index. Add default value at 2nd parameter.");                                              
AddNumberParam("Rank", "Rank index (0-based).", 0);               
AddExpression(25, ef_return_any | ef_variadic_parameters, "Extra data", "Rank index", "Rank2ExtraData",
              "Get extra data by rank index. Add default value at 2nd parameter."); 
AddNumberParam("Rank", "Rank index (0-based).", 0);   
AddExpression(26, ef_return_string | ef_variadic_parameters, "Player userID", "Rank index", "Rank2PlayerUserID",
              "Get userID by rank index. Add default value at 2nd parameter."); 
//AddStringParam("Key", "Key of object.", '""');  
AddExpression(27, ef_return_string | ef_variadic_parameters, "Player object", "Rank index", "Rank2PlayerObject",
              "Get player object by rank index. Add default value at 2nd parameter.");               

AddExpression(31, ef_return_number, "Get current page index", "Page", "PageIndex", 
              "Get current page index. (0-based)"); 

AddExpression(51, ef_return_number, "Get ranking of userID", "Ranking", "LastRanking", 
              'Get ranking of userID (0-based) under "Condition:On get ranking". Return (-1) if invalided.'); 
AddExpression(52, ef_return_string, "Get requested userID", "Ranking", "LastUserID", 
              'Get requested userID under "Condition:On get ranking". Return "" if invalided.'); 
AddExpression(53, ef_return_any, "Get requested score", "Ranking", "LastScore", 
              'Get requested score under "Condition:On get score". Return "" if invalided.');
                             
AddExpression(61, ef_return_number, "Last users count", "Users count", "LastUsersCount", 
              'Get users count under "Condition: On get users count".');              

              
AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
                                    
                                                  
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Class name", "Leaderboard", "Class name for storing leaderboard structure."), 
    new cr.Property(ept_text, "ID", "0", "ID of leader board."),
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),    
	new cr.Property(ept_combo, "Order", "Large to small", "Ranking order.", "Small to large|Large to small"), 	
	new cr.Property(ept_combo, "Write permission", "All users", "All user or only owner could write the save slot.", "All users|Owner"),  
	new cr.Property(ept_combo, "Read permission", "All users", "All user or only owner could read the save slot.", "All users|Owner", true),  
	new cr.Property(ept_text, "User class name", "", 'Class name of user. "" would ignore this feature.'), 
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
