function GetPluginSettings()
{
	return {
		"name":			"Leader board",
		"id":			"Rex_Firebase_Leaderboard",
		"version":		"0.1",        
		"description":	"Leader board built on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_leaderboard.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
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
             "For each rank from <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each rank in a range.", "ForEachRank");   

AddCondition(23, cf_trigger, "On get score", "Score - get", 
            "On get score",
            "Triggered when get score.", "OnGetScore");
                                 
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("ID", 'ID of leader board, i.e. "Sub domain".', '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, ID to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");

AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "Player name.", '""');
AddAnyTypeParam("Score", "Player Score", 0);
AddAnyTypeParam("Extra", "Extra data, could be number or (JSON) string.", '""');
AddComboParamOption("");                // 0
AddComboParamOption("if greater");  // 1
AddComboParamOption("if less");       // 2
AddComboParamOption("if not existed");  // 3
AddComboParam("Post condition", "Post if score is greater or less then saved score.", 0);
AddAction(1, 0, "Post score", "Send", 
          "Post (User ID: <i>{0}</i>) <i>{1}</i>: <i>{2}</i>, extra data to <i>{3}</i> <i>{4}</i>", 
          "Post score by user ID.", "PostScore");
                  
AddAction(2, 0, "Update all", "Update", 
          "Update all ranks", 
          "Update all ranks.", "UpdateAllRanks");
          
AddNumberParam("Count", "The count of top ranks.", 10);       
AddAction(3, 0, "Update top", "Update", 
          "Update top <i>{0}</i> ranks", 
          "Update top ranks.", "UpdateTopRanks");	
          
AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(4, 0, "Remove post", "Remove", 
          "Remove post by User ID: <i>{0}</i>", 
          "Remove post by User ID.", "RemovePost");
          
AddAction(5, 0, "Stop updating", "Update", 
          "Stop updating", 
          "Stop updating ranks.", "StopUpdating");   

AddStringParam("UserID", "UserID from authentication.", '""');
AddStringParam("Name", "(Optional) Player name.", '""');
AddAnyTypeParam("Add", "Add score", 0);
AddAnyTypeParam("Extra", "(Optional) Extra data, could be number or (JSON) string.", '""');
AddAction(6, 0, "Add to score", "Send", 
          "Add <i>{2}</i> to (User ID: <i>{0}</i>) <i>{1}</i> 's score, extra data to <i>{3}</i>", 
          "Add score by user ID.", "AddScore");       

AddStringParam("UserID", "UserID from authentication.", '""');
AddAction(22, 0, "Get score", "Score", 
          "Get score of User ID: <i>{0}</i>", 
          "Get score.", "GetScore");                   
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
AddExpression(12, ef_return_any, "Current player score", "Post", "PostPlayerScore", 
              'Get posted current player score under "condition:On post complete".'); 
AddExpression(14, ef_return_string, "Current user ID", "Post", "PostPlayerUserID", 
              'Get posted current user id under "condition:On post complete".');               
AddExpression(15, ef_return_any, "Current extra data", "Post", "PostExtraData", 
              'Get posted current extra data under "condition:On post complete".');              

AddExpression(21, ef_return_number, "Get rank count", "Rank", "RankCount", 
              "Get total rank count."); 
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
AddNumberParam("Rank", "Rank index (0-based).", 0);   
AddExpression(26, ef_return_string | ef_variadic_parameters, "Player userID", "Rank index", "Rank2PlayerUserID",
              "Get userID by rank index. Add default value at 2nd parameter."); 
                            
AddExpression(52, ef_return_string, "Get requested userID", "Request", "LastUserID", 
              'Get requested userID. Return "" if invalided.'); 
AddExpression(53, ef_return_any, "Get requested score", "Request", "LastScore", 
              'Get requested score. Return 0 if invalided.');
AddExpression(54, ef_return_any, "Get requested name", "Request", "LastPlayerName", 
              'Get requested score. Return "" if invalided.');

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "ID", "Leaderboard", 'ID of leader board, i.e. "Sub domain".'),  
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
