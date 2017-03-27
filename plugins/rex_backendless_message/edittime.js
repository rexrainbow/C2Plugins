function GetPluginSettings()
{
	return {
		"name":			"Message",
		"id":			"Rex_Backendless_message",
		"version":		"0.1",        
		"description":	"Send/receive messages.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_backendless_message.html",
		"category":		"Rex - Web - Backendless",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On send", "Send - message",
            "On send complete",
            "Triggered when send complete.", "OnSendComplete");

AddCondition(2, cf_trigger, "On send error", "Send - message",
            "On send error",
            "Triggered when send error.", "OnSendError");
            
AddCondition(3, cf_trigger, "On received", "Load", 
            "On received messages",
            "Triggered when received messages.", "OnReceived");
            
AddCondition(4, cf_trigger, "On received error", "Load", 
            "On received messages error",
            "Triggered when received messages error.", "OnReceivedError");   

AddCondition(5, cf_trigger, "On set status", "Send - status",
            "On set status complete",
            "Triggered when set status complete.", "OnSetStatusComplete");

AddCondition(6, cf_trigger, "On set status error", "Send - status",
            "On set status error",
            "Triggered when set status error.", "OnSetStatusError");        
            
//AddCondition(7, cf_trigger, "On update mark", "Send - mark",
//            "On update mark complete",
//            "Triggered when update mark complete.", "OnUpdateMarkComplete");
//
//AddCondition(8, cf_trigger, "On update mark error", "Send - mark",
//            "On update mark error",
//            "Triggered when update mark error.", "OnUpdateMarkError");                   
            
AddCondition(11, cf_looping | cf_not_invertible, "For each message", "Load - for each", 
             "For each message", 
             "Repeat the event for each message.", "ForEachMessage"); 
AddNumberParam("Start", "Start from message index (0-based).", 0);  
AddNumberParam("End", "End to message index (0-based). This value should larger than Start.", 2);    
AddCondition(12, cf_looping | cf_not_invertible, "For each message in a range", "Load - for each", 
             "For each message from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each message in a range.", "ForEachMessage");    
             
AddCondition(14, 0, "Last page", "Load", 
             "Is the last page", 
             "Return true if current page is the last page.", "IsTheLastPage");                                        
             
AddCondition(91, cf_trigger, "On load by messageID", "Load by messageID", 
            "On load by messageID complete",
            "Triggered when load by messageID message complete.", "OnFetchOneComplete");

AddCondition(92, cf_trigger, "On load by messageID error", "Load by messageID", 
            "On load by messageID error",
            "Triggered when load by messageID message error.", "OnFetchOneError"); 
            
AddCondition(101, cf_trigger, "On remove by messageID", "Remove by messageID",
            "On remove by messageID complete",
            "Triggered when remove complete.", "OnRemoveComplete");

AddCondition(102, cf_trigger, "On remove by messageID error", "Remove by messageID",
            "On remove by messageID error",
            "Triggered when remove error.", "OnRemoveError"); 
            
AddCondition(103, cf_trigger, "On remove queried messages", "Remove queried messages",
            "On remove queried messages complete",
            "Triggered when remove complete.", "OnRemoveQueriedMessagesComplete");

AddCondition(104, cf_trigger, "On remove queried messages error", "Remove queried messages",
            "On remove queried messages error",
            "Triggered when remove error.", "OnRemoveQueriedMessagesError");    
            
AddCondition(111, cf_trigger, "On get messages count", "Queried messages count",
            "On get messages count complete",
            "Triggered when get messages count.", "OnGetMessagesCountComplete");

AddCondition(112, cf_trigger, "On get messages count error", "Queried messages count",
            "On get messages count error",
            "Triggered when get messages count error.", "OnGetMessagesCountError");                                                
                         
//////////////////////////////////////////////////////////////
// Actions      
AddStringParam("Sender ID", "Sender ID.", '""');
AddAction(1, 0, "Set user", "User info", 
          "Set sender ID to <i>{0}</i>", 
          "Set user info.", "SetUserInfo");

AddStringParam("Receiver UserID", "UserID of receiver.", '""');
AddStringParam("Title", "Title of this message.", '""');
AddStringParam("Content", "Content of this message. String or JSON string for object.", '""');
AddStringParam("Category", "Category of this message for filtering.", '""');
AddStringParam("Status", "Status of this message.", '""');
AddAction(11, 0, "Send", "Send - message", 
          "Send- Send message to channel ID: <i>{0}</i> with title: <i>{1}</i>, content: <i>{2}</i>, category to <i>{3}</i> (status: <i>{4}</i>)", 
          "Send message.", "Send");   

AddStringParam("Message ID", "Message ID.", '""');
AddStringParam("Status", "Status of this message.", '""');
AddAction(12, 0, "Set status", "Send - Status", 
          "Send- MessageID <i>{0}</i>: set status to <i>{1}</i>", 
          "Change status of message.", "SetStatus");              

//AddStringParam("Message ID", "Message ID.", '""');
//AddStringParam("Mark", "Unique mark.", '""');
//AddAction(13, 0, "Append mark", "Send - mark", 
//          "Send- Append an unique mark <i>{1}</i> on messageID: <i>{0}</i>", 
//          "Append an unique mark on message.", "AppendMark"); 
//          
//AddStringParam("Message ID", "Message ID.", '""');
//AddStringParam("Mark", "Unique mark.", '""');
//AddAction(14, 0, "Remove mark", "Send - mark", 
//          "Send- Remove mark <i>{1}</i> on messageID: <i>{0}</i>", 
//          "Remove mark on message.", "RemoveMark");    

AddNumberParam("Index", "Index of queried rows.", 0);  
AddStringParam("Status", "Status of this message.", '""');
AddAction(15, 0, "Set status by index", "Send - Status", 
          "Send- Index <i>{0}</i>: set status to <i>{1}</i>", 
          "Change status of message by index.", "SetStatusByIndex");       
          
AddAction(21, 0, "New", "Filter - 1. new", 
          "Filter- 1. Create a new message filter", 
          "Create a new message filter.", "NewFilter");       

AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10);
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);                    
AddAction(22, 0, "Request in a range", "Load", 
          "Load- Request messages start from <i>{0}</i> with <i>{1}</i> lines, <i>{2}</i> content", 
          "Request messages in a range.", "RequestInRange");   

AddNumberParam("Index", "Page index, 0-based.", 0);
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);   
AddAction(23, 0, "Request to page", "Load", 
          "Load- Request messages at page <i>{0}</i>, <i>{1}</i> content", 
          "Request messages at page.", "RequestTurnToPage");

AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(24, 0, "Request current page",  "Load", 
          "Load- Request messages at current page, <i>{0}</i> content",  
          "Request messages at current page.", "RequestUpdateCurrentPage"); 
          
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(25, 0, "Request next page", "Load", 
          "Load- Request messages at next page, <i>{0}</i> content",  
          "Request messages at next page.", "RequestTurnToNextPage");  

AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(26, 0, "Request previous page", "Load", 
          "Load- Request messages at previous page, <i>{0}</i> content",  
          "Request messages at previous page.", "RequestTurnToPreviousPage");   

AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(27, 0, "Request all messages", "Load - all", 
          "Load- Request all messages, <i>{0}</i> content", 
          "Load all messages.", "LoadAllMessages");                   

AddAction(31, 0, "All senders", "Filter - 2. senderID", 
          "Filter- 2. add all senders into filter", 
          "Add all senders into filter.", "AddAllSenders"); 
          
AddStringParam("Sender ID", "Sender ID.", '""');
AddAction(32, 0, "Add sender", "Filter - 2. senderID", 
          "Filter- 2. add senderID: <i>{0}</i> into filter", 
          "Add a sender into filter.", "AddSender");          

AddAction(41, 0, "All receivers", "Filter - 3. receiverID", 
          "Filter- 3. add all receivers into filter", 
          "Add all receivers into filter.", "AddAllReceivers"); 

AddStringParam("Receiver ID", "Receiver ID.", '""');
AddAction(42, 0, "Add receiver", "Filter - 3. receiverID", 
          "Filter- 3. add receiverID: <i>{0}</i> into filter", 
          "Add a receiver into filter.", "AddReceiver");           

AddAction(51, 0, "All categories", "Filter - 4. category", 
          "Filter- 4. add all categories into filter", 
          "Add all categories into filter.", "AddAllTags"); 

AddStringParam("Category", "Category.", '""');
AddAction(52, 0, "Add category", "Filter - 4. category", 
          "Filter- 4. add category: <i>{0}</i> into filter", 
          "Add a category into filter.", "AddTag");
          
AddAction(61, 0, "All timestamps", "Filter - 6. timestamp", 
          "Filter- 6. add all timestamps into filter", 
          "Add all timestamps into filter.", "AddAllTimestamps"); 
                    
AddComboParamOption("Before");
AddComboParamOption("After");
AddComboParam("When", "Before or after the timestamp.", 1); 
AddNumberParam("Timestamp", "Timestamp in milliseconds.", 0);
AddComboParamOption("Excluded");
AddComboParamOption("Included");
AddComboParam("Include", "Include compared timestamp or excluded.", 1); 
AddComboParamOption("Created");
AddComboParamOption("Updated");
AddComboParam("Type", "Type of compared timestamp.", 0);  
AddAction(62, 0, "Add timestamp constraint", "Filter - 6. timestamp", 
          "Filter- 6. add timestamp constraint: <i>{3}</i> <i>{0}</i> <i>{1}</i> (<i>{2}</i>) into filter", 
          "Add a timestamp constraint into filter. They will be jointed by AND operation.", "AddTimeConstraint");    

AddAction(71, 0, "All status", "Filter - 5. status", 
          "Filter- 5. add all status into filter", 
          "Add all status into filter.", "AddAllStatus"); 

AddStringParam("Status", "Status.", '""');
AddAction(72, 0, "Add status", "Filter - 5. status", 
          "Filter- 5. add status: <i>{0}</i> into filter", 
          "Add a status into filter.", "AddStatus");    
          
//AddStringParam("Mark", "Unique mark.", '""');
//AddComboParamOption("Excluded");
//AddComboParamOption("Included");
//AddComboParam("Include", "Include compared timestamp or excluded.", 0);
//AddAction(82, 0, "Set mark constraint", "Filter - 7. mark", 
//          "Filter- 7. set mark constraint: <i>{1}</i> <i>{0}</i> into filter", 
//          "Set mark constraint into filter.", "SetMarkConstraint");            

AddStringParam("Message ID", "Message ID.", '""');
AddAction(91, 0, "Load by messageID", "Load - messageID", 
          "Load- load message by messageID: <i>{0}</i>", 
          "Load message by messageID.", "FetchByMessageID");     

AddNumberParam("Index", "Index of queried rows.", 0);     
AddAction(92, 0, "Load by index", "Load - messageID", 
          "Load- load message by index to <i>{0}</i>", 
          "Load message by index.", "FetchByIndex");            
          
AddStringParam("Message ID", "Message ID.", '""');
AddAction(101, 0, "Remove by messageID", "Remove", 
          "Send- MessageID <i>{0}</i>: remove", 
          "Remove message by messageID.", "RemoveByMessageID");    
                   
AddAction(102, 0, "Remove queried messages", "Remove", 
          "Send- Remove queried messages", 
          "Remove queried messages.", "RemoveQueriedMessages");   
          
AddNumberParam("Index", "Index of queried rows.", 0);         
AddAction(103, 0, "Remove by index", "Remove", 
         "Send- Index <i>{0}</i>: remove",
         "Remove message by index.", "RemoveByIndex");            

AddAction(111, 0, "Get messages count", "Queried messages count", 
          "Get queried messages count", 
          "Get queried messages count. Maximum of 160 requests per minute.", "GetMessagesCount");   
                                       
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable")                                       
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "My userID", "User info", "MyUserID", 
              "Get my userID.");    
              
AddExpression(3, ef_return_string, "Last sent messageID", "Send", "LastSentMessageID", 
              'Get last sent messageID under "Condition:On send complete".');          
                   
AddExpression(11, ef_return_string, "Current senderID", "Load - for each", "CurSenderID", 
              "Get the current senderID in a For Each loop.");           
AddExpression(13, ef_return_string, "Current receiverID", "Load - for each", "CurReceiverID", 
              "Get the current receiverID in a For Each loop.");       
AddExpression(14, ef_return_string, "Current title", "Load - for each", "CurTitle", 
              "Get the current title in a For Each loop.");    
AddExpression(15, ef_return_string, "Current content", "Load - for each", "CurContent", 
              "Get the current content in a For Each loop.");               
AddExpression(16, ef_return_string, "Current messageID", "Load - for each", "CurMessageID", 
              "Get the current messageID in a For Each loop.");  
AddExpression(17, ef_return_number, "Current sent unix timestamp", "Load - for each", "CurSentAt", 
              "Get the current sent unix timestamp (number of milliseconds since the epoch) in a For Each loop.");
AddExpression(18, ef_return_number, "Current message index", "Load - for each - index", "CurMessageIndex", 
              "Get the current message index in a For Each loop.");
AddExpression(19, ef_return_string, "All read messages", "Received", "MessagesToJSON", 
              "Get all read messages in JSON string.");
AddExpression(20, ef_return_string, "Current status", "Load - for each", "CurStatus", 
              "Get the current status of message in a For Each loop.");  
AddExpression(21, ef_return_number, "Current message count", "Received", "CurMessageCount", 
              "Get message count in current received page.");
AddExpression(22, ef_return_number, "Current start index", "Load - for each - index", "CurStartIndex", 
              "Get start index in current received page.");
AddExpression(23, ef_return_number, "Current loop index", "Load - for each - index", "LoopIndex", 
              "Get loop index in current received page.");
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(24, ef_return_any | ef_variadic_parameters, "Get property in current sender data", "Load - for each", "CurSenderData", 
              "Get value of current sender data in a For Each loop.");              
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(25, ef_return_any | ef_variadic_parameters, "Get property in current receiver data", "Load - for each", "CurReceiverrData", 
              "Get value of current receiver data in a For Each loop."); 

AddNumberParam("Index", "Index of queried rows.", 0);                  
AddExpression(31, ef_return_string, "Get senderID by index", "Received - index", "Index2SenderID", 
              'Get senderID by index.');          
AddNumberParam("Index", "Index of queried rows.", 0);                  
AddExpression(32, ef_return_string, "Get receiverID by index", "Received - index", "Index2ReceiverID", 
              'Get receiverID by index.');
AddNumberParam("Index", "Index of queried rows.", 0);                  
AddExpression(33, ef_return_string, "Get title by index", "Received - index", "Index2Title", 
              'Get title by index.');
AddNumberParam("Index", "Index of queried rows.", 0);                  
AddExpression(34, ef_return_string, "Get content by index", "Received - index", "Index2Content", 
              'Get content by index.');              
AddNumberParam("Index", "Index of queried rows.", 0);                  
AddExpression(35, ef_return_string, "Get messageID by index", "Received - index", "Index2MessageID", 
              'Get messageID by index.');
AddNumberParam("Index", "Index of queried rows.", 0);                  
AddExpression(36, ef_return_number, "Get sent unix timestamp by index", "Received - index", "Index2SentAt", 
              'Get sent unix timestamp (number of milliseconds since the epoch) under "Condition: On load by messageID complete".');
AddNumberParam("Index", "Index of queried rows.", 0);                   
AddExpression(37, ef_return_string, "Get status by index", "Received - index", "Index2Status", 
              'Get status by index.');  
AddNumberParam("Index", "Index of queried rows.", 0);                   
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(38, ef_return_any | ef_variadic_parameters, "Get sender data by index", "Received - index", "Index2SenderData", 
              'Get sender data by index.');            
AddNumberParam("Index", "Index of queried rows.", 0);                   
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(39, ef_return_any | ef_variadic_parameters, "Get receiver data by index", "Received - index", "Index2ReceiverData", 
               'Get receiver data by index.');                          
                                                        
AddExpression(91, ef_return_string, "Last loaded senderID", "Received - messageID", "LastFetchedSenderID", 
              'Get senderID under "Condition: On load by messageID".');          
AddExpression(93, ef_return_string, "Last loaded receiverID", "Received - messageID", "LastFetchedReceiverID", 
              'Get receiverID under "Condition: On load by messageID".');
AddExpression(94, ef_return_string, "Last loaded title", "Received - messageID", "LastFetchedTitle", 
              'Get title under "Condition: On load by messageID".');
AddExpression(95, ef_return_string, "Last loaded content", "Received - messageID", "LastFetchedContent", 
              'Get content under "Condition: On load by messageID".');              
AddExpression(96, ef_return_string, "Last loaded messageID", "Received - messageID", "LastFetchedMessageID", 
              'Get messageID under "Condition: On load by messageID".');
AddExpression(97, ef_return_number, "Last loaded sent unix timestamp", "Received - messageID", "LastFetchedSentAt", 
              'Get sent unix timestamp (number of milliseconds since the epoch) under "Condition: On load by messageID complete".');
AddExpression(98, ef_return_string, "Last loaded status", "Received - messageID", "LastFetchedStatus", 
              'Get status under "Condition: On load by messageID".');       
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(99, ef_return_any | ef_variadic_parameters, "Last loaded sender data", "Received - messageID", "LastFetchedSenderData", 
              'Get sender data under "Condition: On load by messageID".');              
//AddStringParam("Key", "Key of object.", '""');       
AddExpression(100, ef_return_any | ef_variadic_parameters, "Last loaded receiver data", "Received - messageID", "LastFetchedReceiverData", 
               'Get receiver data under "Condition: On load by messageID".');              
                            
AddExpression(101, ef_return_string, "Last removed messageID", "Remove", "LastRemovedMessageID", 
              'Get last removed messageID under "Condition:On remove complete".');   
                    
AddExpression(111, ef_return_number, "Last messages count", "Queried messages count", "LastMessagesCount", 
              'Get last queried messages count under "Condition: On get messages count complete".');


AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
                                                         
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Class", "",	"Class of the table."), 
    new cr.Property(ept_text, "Class name", "Message", "Class name for storing messages structure."), 
    
    new cr.Property(ept_section, "Page", "",	"Paging for reading."),      
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),    
	new cr.Property(ept_combo, "Order", "Later to earlier", "Order.", "Earlier to later|Later to earlier"),

    new cr.Property(ept_section, "Linked tables", "",	"Linked tables."),   
    new cr.Property(ept_text, "Sender class name", "", 'Class name for storing sender data structure. Set "" to ignore sender data.'),     
    new cr.Property(ept_text, "Receiver class name", "", 'Class name for storing receiver data structure. Set "" to ignore receiver data.'),  
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
