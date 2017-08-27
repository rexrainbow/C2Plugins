function GetPluginSettings()
{
	return {
		"name":			"Scoreboard",
		"id":			"Rex_NGIO_Scoreboard",
		"version":		"0.1",        
		"description":	"Handles loading and posting of high scores and scoreboards.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ngio_scoreboard.html",
		"category":		"Rex - Web - newgrounds.io",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,      
	};
};

//////////////////////////////////////////////////////////////
// Conditions
            
AddCondition(11, cf_trigger, "On get boards", "Get boards", 
            "On get boards success",
            "Triggered when get boards success.", "OnGetBoardsSuccess");
AddCondition(12, cf_trigger, "On get boards error", "Get boards", 
            "On get boards error",
            "Triggered when get boards error.", "OnGetBoardsError");            
AddCondition(13, cf_looping | cf_not_invertible, "For each board", "Get boards", 
             "For each board", 
             "Repeat the event for each board.", "ForEachBoard");       
             
AddCondition(21, cf_trigger, "On post score", "Post score", 
            "On post score success",
            "Triggered when post score success.", "OnPostScoreSuccess");
AddCondition(22, cf_trigger, "On post score error", "Post score", 
            "On post score error",
            "Triggered when post score error.", "OnPostScoreError");           

AddCondition(41, cf_trigger, "On get scores", "Get scores", 
            "On get scores success",
            "Triggered when get scores success.", "OnGetScoresSuccess");
AddCondition(42, cf_trigger, "On get scores error", "Get scores", 
            "On get scores error",
            "Triggered when get scores error.", "OnGetScoresError");  
AddCondition(43, cf_looping | cf_not_invertible, "For each score", "Get scores", 
             "For each score", 
             "Repeat the event for each score.", "ForEachScore"); 
AddNumberParam("Start", "Start from rank index (0-based).", 0);  
AddNumberParam("End", "End to rank index (0-based). This value should larger than Start.", 2);    
AddCondition(44, cf_looping | cf_not_invertible, "For each score in range", "Get scores", 
             "For each score from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each score in a range.", "ForEachScore"); 
//////////////////////////////////////////////////////////////
// Actions
          
AddNumberParam("ID", "The numeric ID of the scoreboard.", 0);           
AddAction(1, 0, "Set board ID", "Configuration", 
          "Set board ID to <i>{0}</i>", 
          "Set board ID and clean all.", "SetBoardID");    
          
AddStringParam("Tag", 'A tag that can be used to filter scores. Set "" to ignore this feature.', '""');      
AddAction(2, 0, "Set tag", "Configuration", 
          "Set tag to <i>{0}</i>", 
          "Set filter tag.", "SetTag");       

AddAction(11, 0, "Get boards", "ScoreBoard", 
          "Get boards",
          "Returns a list of available scoreboards.", "GetBoards");          
          
AddNumberParam("Value", "The int value of the score.", 0);               
AddStringParam("Tag", 'A tag that can be used to filter scores. Set "" to ignore this feature.', '""');            
AddAction(21, 0, "Post score", "ScoreBoard", 
          "Post score <i>{0}</i> (<i>{1}</i>)",
          "Posts a score to the specified scoreboard.", "PostScore");  

AddComboParamOption("Current day");
AddComboParamOption("Current week");
AddComboParamOption("Current month");
AddComboParamOption("Current year");
AddComboParamOption("All-time");
AddComboParam("Period", "The time-frame to pull scores from.", 0);
AddAction(31, 0, "Set period", "Get scores - period", 
          "Set period to <i>{0}</i>",
          "Set period.", "SetPeriod");             

AddStringParam("Period", "The time-frame to pull scores from. D=current day, W=current week , M=current month, Y=current year, A=all-time", '"D"'); 
AddAction(32, 0, "Set period by code", "Get scores - period", 
          "Set period to <i>{0}</i>",
          "Set period.", "SetPeriod");                 

AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10); 
AddAction(41, 0, "Request in a range", "Get scores", 
          "Get scores started from <i>{0}</i> with <i>{1}</i> lines", 
          "Get scores in a range.", "RequestInRange");     

AddNumberParam("Index", "Page index, 0-based.", 0);
AddAction(42, 0, "Turn to page", "Get scores - page", 
          "Get scores - turn to page <i>{0}</i>", 
          "Turn to scores page.", "RequestTurnToPage");
                           
AddAction(43, 0, "Update current page", "Get scores - page", 
          "Get scores - update current page", 
          "Update current scores page.", "RequestUpdateCurrentPage"); 
          
AddAction(44, 0, "Turn to next page", "Get scores - page", 
          "Get scores - turn to next page", 
          "Update turn to next scores page.", "RequestTurnToNextPage");  

AddAction(45, 0, "Turn to previous page", "Get scores - page", 
          "Get scores - turn to previous page", 
          "Update turn to previous scores page.", "RequestTurnToPreviousPage")          
          
AddAction(51, 0, "All users", "Get scores - social", 
          "Show scores of all users",
          "Show scores of all users.", "ShowAll");            
          
AddAnyTypeParam("ID or name", "User ID (number) or user name (string).", '""');           
AddAction(52, 0, "Set user", "Get scores - social", 
          "Show scores of user <i>{0}</i> and their friends",
          "Show scores of user and their friends.", "ShowUser");            

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get error message", "Result", "ErrorMessage", 
              "Get last error message from last result.");
              
AddExpression(1, ef_return_number, "Get board ID", "Get/Post score", "BoardID", 
              "Get board ID.");    
              
AddExpression(2, ef_return_string, "Get period", "Get/Post score", "Period", 
              "Get period. D=current day, W=current week , M=current month, Y=current year, A=all-time");         

AddExpression(3, ef_return_string, "Get tag", "Get/Post score", "Tag", 
              "Get tag.");               
              
AddExpression(4, ef_return_number, "Get page index", "Get scores - page", "PageIndex", 
              "Get page index.");               
              
AddExpression(10, ef_return_number, "Current loop index", "For each - index", "LoopIndex", 
              "Get loop index in for each loop.");  
       
AddExpression(11, ef_return_string, "Get received boards as JSON", "Get boards", "BoardsAsJSON", 
              "Get received boards as JSON.");         
AddExpression(12, ef_return_number, "Get current boardID", "Get boards - for each", "CurBoardID", 
              "The numeric ID of the scoreboard in a For Each loop.");  
AddExpression(13, ef_return_string, "Get current board name", "Get boards - for each", "CurBoardName", 
              "The name of the scoreboard in a For Each loop.");     

AddExpression(21, ef_return_number, "Get boardID by index", "Get boards - index", "Index2BoardID", 
              "The numeric ID of the scoreboard by index.");  
AddExpression(22, ef_return_string, "Get board name by index", "Get boards - index", "Index2BoardName", 
              "The name of the scoreboard by index.");     

AddExpression(29, ef_return_number, "Get amount of boards","Get boards", "BoardsCount", 
              "Get amount of boards.");                       

AddExpression(31, ef_return_string, "Get received scores as JSON", "Get scores", "ScoresAsJSON", 
              "Get received scores as JSON.");               
AddExpression(32, ef_return_string, "Current formatted value", "Get scores - for each", "CurFormattedValue", 
              "Current formatted value of a score in for each loop.");         
AddExpression(33, ef_return_string, "Current user name", "Get scores - for each", "CurUserName", 
              "Current user name of a score in for each loop.");        
AddExpression(34, ef_return_number, "Current user ID", "Get scores - for each", "CurUserID", 
              "Current user ID of a score in for each loop.");    
AddExpression(35, ef_return_number, "Current value", "Get scores - for each", "CurValue", 
              "Current integer value of the score in for each loop.");
              
AddExpression(41, ef_return_string, "Get formatted value by array index", "Get scores - index", "Index2FormattedValue", 
              "Formatted value of a score by array index.");         
AddExpression(42, ef_return_string, "Get user name by array index", "Get scores - index", "Index2UserName", 
              "User name of a score by array index.");        
AddExpression(43, ef_return_number, "Get user ID by array index", "Get scores - index", "Index2UserID", 
              "User ID of a score by array index.");    
AddExpression(44, ef_return_number, "Get value by array index", "Get scores - index", "Index2Value", 
              "User ID of a score by array index.");              

AddExpression(51, ef_return_number, "Start index of received scores", "Get scores - for each - index", "CurStartIndex", 
              "Get start index in current received scores.");              
AddExpression(52, ef_deprecated | ef_return_number, "Scores count", "Get scores - for each", "CurScoresCount", 
              "Get ranking count in current received scores.");                 
AddExpression(53, ef_return_number, "Scores count", "Get scores", "ScoresCount", 
              "Get ranking count in current received scores.");  
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_integer, "ID", 0, "The numeric ID of the scoreboard."),
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page for loading scores."),    
    new cr.Property(ept_combo, "Period", "Current day", "The time-frame to pull scores from.", "Current day|Current week|Current month|Current year|All-time"),      
    new cr.Property(ept_text, "Tag", "", 'A tag that can be used to filter scores. Set "" to ignore this feature.'),   
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
