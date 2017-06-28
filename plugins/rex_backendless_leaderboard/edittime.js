function GetPluginSettings()
{
	return {
		"name":			"Leaderboard",
		"id":			"Rex_Backendless_Leaderboard",
		"version":		"0.1",        
		"description":	"Leader board built on backendless.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_backendless_leaderboard.html",
		"category":		"Rex - Web - Backendless",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On post", "Score - post", 
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
            
//AddCondition(31, cf_trigger, "On get users count", "Users count", 
//            "On get messages count",
//            "Triggered when get messages count.", "OnGeUsersCount");
//
//AddCondition(32, cf_trigger, "On get users count error", "Users count", 
//            "On get users count error",
//            "Triggered when get users count error.", "OnGetUsersCountError");             
//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("UserID", 'UserID.', '""');
AddAnyTypeParam("Score", "User Score", 0);
AddComboParamOption("");
AddComboParamOption("if greater");
AddComboParamOption("if less");
AddComboParam("Post condition", "Post if score is greater or less then saved score.", 0);
AddAction(1, 0, "Post score", "Score", 
          "User ID: <i>{0}</i> post score  to <i>{1}</i> <i>{2}</i>", 
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

AddStringParam("ID", "ID of leader board.", '"0"');
AddAction(11, 0, "Set board ID", "Configuration", 
          "Set board ID to <i>{0}</i>", 
          "Set board ID and clean all.", "SetBoardID");    

AddStringParam("Tag", 'A tag that can be used to filter scores. Set "" to ignore this feature.', '""');      
AddAction(12, 0, "Set tag", "Configuration", 
          "Set tag to <i>{0}</i>", 
          "Set filter tag.", "SetTag");         

AddComboParamOption("Current day");
AddComboParamOption("Current week");
AddComboParamOption("Current month");
AddComboParamOption("Current year");
AddComboParamOption("All-time");
AddComboParam("Period", "The time-frame to pull scores from.", 0);
AddAction(13, 0, "Set period", "Configuration", 
          "Set period to <i>{0}</i>",
          "Set period.", "SetPeriod");

AddNumberParam("Timestamp", 'Datetime in timestamp.', 0);
AddAction(14, 0, "Set date time", "Configuration", 
          "Set date time to <i>{0}</i>", 
          "Set date time for querying.", "SetDateTime");          
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(21, 0, "Get ranking", "Ranking", 
          "Get ranking of User ID: <i>{0}</i>", 
          "Get ranking.", "GetRanking");   
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(22, 0, "Get score", "Score", 
          "Get score of User ID: <i>{0}</i>", 
          "Get score.", "GetScore");
          
//AddAction(31, 0, "Get users count", "Users count", 
//          "Get users count", 
//          "Get users count.", "GetUsersCount");  
          
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable");                             
//////////////////////////////////////////////////////////////
// Expressions			  
AddExpression(2, ef_return_any, "Current user score", "Load - for each", "CurScore", 
              "Get the current user score in a For Each loop."); 
AddExpression(3, ef_return_number, "Current user rank", "Load - for each - index", "CurUserRank", 
              "Get the current user rank (0-based) in a For Each loop."); 
AddExpression(4, ef_return_string, "Current user ID", "Load - for each", "CurUserID", 
              "Get the current user id in a For Each loop.");               
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(6, ef_return_any | ef_variadic_parameters, "Get property in current user data", "Load - for each", "CurUserData", 
              "Get value of current user data in a For Each loop.");
AddExpression(7, ef_return_number, "Current ranking count", "Received - for each", "CurRankingCount", 
              "Get ranking count in current received page.");   
AddExpression(8, ef_return_number, "Current start index", "Load - for each - index", "CurStartIndex", 
              "Get start index in current received page.");           
AddExpression(9, ef_return_number, "Current loop index", "Load - for each - index", "LoopIndex", 
              "Get loop index in current received page.");                             
                                       
AddExpression(12, ef_return_any, "Current user score", "Post", "PostScore", 
              'Get posted current user score under "condition:On post complete".'); 
AddExpression(14, ef_return_string, "Current user ID", "Post", "PostUserID", 
              'Get posted current user id under "condition:On post complete".');               
              
AddStringParam("UserID", "UserID from authentication.", '""');
AddExpression(22, ef_return_number, "Get rank by user ID", "Rank", "UserID2Rank", 
              "Get rank by user ID. Return (-1) if not found.");                
AddNumberParam("Rank", "Rank index (0-based).", 0);                  			  
AddExpression(24, ef_return_any | ef_variadic_parameters, "Get score by rank", "Rank index", "Rank2Score", 
              "Get user score by rank index. Add default value at 2nd parameter.");
AddNumberParam("Rank", "Rank index (0-based).", 0);   
AddExpression(26, ef_return_string | ef_variadic_parameters, "Get userID by rank", "Rank index", "Rank2UserID",
              "Get userID by rank index. Add default value at 2nd parameter."); 
AddNumberParam("Rank", "Rank index (0-based).", 0);    
AddExpression(27, ef_return_string | ef_variadic_parameters, "Get property in user data by rank", "Rank index", "Rank2UserData",
              "Get user data by rank index. Add default value at 2nd parameter.");               

AddExpression(31, ef_return_number, "Get current page index", "Page", "PageIndex", 
              "Get current page index. (0-based)"); 

AddExpression(51, ef_return_number, "Get ranking of userID", "Request", "LastRanking", 
              'Get ranking of userID (0-based). Return (-1) if invalided.'); 
AddExpression(52, ef_return_string, "Get requested userID", "Request", "LastUserID", 
              'Get requested userID. Return "" if invalided.'); 
AddExpression(53, ef_return_any, "Get requested score", "Request", "LastScore", 
              'Get requested score. Return "" if invalided.');
                             
//AddExpression(61, ef_return_number, "Last users count", "Users count", "LastUsersCount", 
//              'Get users count under "Condition: On get users count".');              


AddExpression(101, ef_return_number, "Get board ID", "Configuration", "BoardID", 
              "Get board ID.");    
              
AddExpression(102, ef_return_string, "Get tag", "Configuration", "Tag", 
              "Get tag.");       
              
AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
                                    
                                                  
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Class", "",	"Class of the table."), 
    new cr.Property(ept_text, "Class name", "Leaderboard", "Class name for storing leaderboard structure."), 
    
    new cr.Property(ept_section, "Primary keys", "",	"Primary keys for indexing."),     
    new cr.Property(ept_text, "ID", "0", "ID of leader board."),
    new cr.Property(ept_text, "Tag", "", 'A tag that can be used to filter scores. Set "" to ignore this feature.'), 
    
    new cr.Property(ept_section, "Page", "",	"Paging for reading."),      
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page for loading scores."),    
	new cr.Property(ept_combo, "Order", "Large to small", "Ranking order.", "Small to large|Large to small"), 	
    new cr.Property(ept_combo, "Period", "All-time", "The time-frame to pull scores from.", "Current day|Current week|Current month|Current year|All-time"),          
    
    new cr.Property(ept_section, "Linked tables", "",	"Linked tables."),  
    new cr.Property(ept_text, "Owner class name", "", 'Class name of owner data structure. Set "" to ignore owner data.'),        
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
