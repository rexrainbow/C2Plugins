function GetPluginSettings()
{
	return {
		"name":			"Message",
		"id":			"Rex_parse_message",
		"version":		"0.1",        
		"description":	"Send/receive messages.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_parse_message.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"parse-1.3.2.min.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On send complete", "Message - send",
            "On send complete",
            "Triggered when send complete.", "OnSendComplete");

AddCondition(2, cf_trigger, "On send error", "Message - send",
            "On send error",
            "Triggered when send error.", "OnSendError");
            
AddCondition(3, cf_trigger, "On received", "Request - page", 
            "On received messages",
            "Triggered when received messages.", "OnReceived");
            
AddCondition(11, cf_looping | cf_not_invertible, "For each message", "Request - for each", 
             "For each message", 
             "Repeat the event for each message.", "ForEachRank"); 
AddNumberParam("Start", "Start from message index (0-based).", 0);  
AddNumberParam("End", "End to message index (0-based). This value should larger than Start.", 2);    
AddCondition(12, cf_looping | cf_not_invertible, "For each message in a range", "Request - for each", 
             "For each message from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each message in a range.", "ForEachRank");                             
             
AddCondition(91, cf_trigger, "On fetch one", "Message - fetch one", 
            "On fetch one complete",
            "Triggered when fetch one message complete.", "OnFetchOneComplete");

AddCondition(92, cf_trigger, "On fetch error", "Message - fetch one", 
            "On fetch one error",
            "Triggered when fetch one message error.", "OnFetchOneError");             
//////////////////////////////////////////////////////////////
// Actions      
AddStringParam("Sender ID", "Sender ID.", '""');
AddStringParam("Sender name", "Sender name.", '""');
AddAction(1, 0, "Set user", "User info", 
          "Set sender name to <i>{1}</i>, sender ID to <i>{0}</i>", 
          "Set user info.", "SetUserInfo");

AddStringParam("Receiver UserID", "UserID of receiver.", '""');
AddStringParam("Title", "Title of this message.", '""');
AddStringParam("Content", "Content of this message. String or JSON string for object.", '""');
AddStringParam("Tag", "Tag of this message for filtering.", '""');
AddAction(11, 0, "Send", "Message - send", 
          "Send message to user ID: <i>{0}</i> with title: <i>{1}</i>, content: <i>{2}</i>, tag to <i>{3}</i>", 
          "Send message.", "Send");    

AddAction(21, 0, "1. New", "Message filter - 1. new", 
          "1. Create a new message filter", 
          "Create a new message filter.", "NewFilter");       

AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10);
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);                    
AddAction(22, 0, "5. Request in a range", "Message filter - 5. request", 
          "5. Request message start from <i>{0}</i> with <i>{1}</i> lines, <i>{2}</i> content", 
          "Request messages in a range.", "RequestInRange");   

AddNumberParam("Index", "Page index, 0-based.", 0);
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);   
AddAction(23, 0, "5. Request to page", "Message filter - 5. request", 
          "Request message at page <i>{0}</i>, <i>{1}</i> content", 
          "Request messages at page.", "RequestTurnToPage");

AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(24, 0, "5. Request current page",  "Message filter - 5. request", 
          "Request message at current page, <i>{0}</i> content",  
          "Request messages at current page.", "RequestUpdateCurrentPage"); 
          
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(25, 0, "5. Request next page", "Message filter - 5. request", 
          "Request message at next page, <i>{0}</i> content",  
          "Request messages at next page.", "RequestTurnToNextPage");  

AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Content", "Get content.", 0);             
AddAction(26, 0, "5. Request previous page", "Message filter - 5. request", 
          "Request message at previous page, <i>{0}</i> content",  
          "Request messages at previous page.", "RequestTurnToPreviousPage");           

AddAction(31, 0, "2. all Senders", "Message filter - 2. senderID", 
          "2. add all senders into filter", 
          "Add all senders into filter.", "AddAllSenders"); 
          
AddStringParam("Sender ID", "Sender ID.", '""');
AddAction(32, 0, "2. add sender", "Message filter - 2. senderID", 
          "2. add senderID: <i>{0}</i> into filter", 
          "Add a sender into filter.", "AddSender");          

AddAction(41, 0, "3. all receivers", "Message filter - 3. receiverID", 
          "3. add all receivers into filter", 
          "Add all receivers into filter.", "AddAllReceivers"); 

AddStringParam("Receiver ID", "Receiver ID.", '""');
AddAction(42, 0, "3. add receiver", "Message filter - 3. receiverID", 
          "3. add receiverID: <i>{0}</i> into filter", 
          "Add a receiver into filter.", "AddReceiver");           

AddAction(51, 0, "4. all tags", "Message filter - 4. tag", 
          "4. add all tags into filter", 
          "Add all tags into filter.", "AddAllTags"); 
          
AddStringParam("Type", "Type.", '""');
AddAction(52, 0, "4. add tag", "Message filter - 4. tag", 
          "4. add tag: <i>{0}</i> into filter", 
          "Add a tag into filter.", "AddTag");

          
AddStringParam("Message ID", "Message ID.", '""');
AddAction(91, 0, "Fetch one", "Message - fetch one", 
          "Fetch messageID: <i>{0}</i>", 
          "Fetch one message by messageID.", "FetchByMessageID");          
                   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "My userID", "User info", "MyUserID", 
              "Get my userID.");    
AddExpression(2, ef_return_string, "My user name", "User info", "MyUserName", 
              "Get my user name."); 

AddExpression(3, ef_return_string, "Last sent messageID", "Send", "LastSentMessageID", 
              'Get last sent messageID under "Condition:On send complete".');          
                   
AddExpression(11, ef_return_string, "Current sender ID", "Received - for each", "CurSenderID", 
              "Get the current senderID in a For Each loop.");         
AddExpression(12, ef_return_string, "Current sender name", "Received - for each", "CurSenderName", 
              "Get the current sender name in a For Each loop.");      
AddExpression(13, ef_return_string, "Current receiverID", "Received - for each", "CurReceiverID", 
              "Get the current receiverID in a For Each loop.");       
AddExpression(14, ef_return_string, "Current title", "Received - for each", "CurTitle", 
              "Get the current title in a For Each loop.");    
AddExpression(15, ef_return_string, "Current content", "Received - for each", "CurContent", 
              "Get the current content in a For Each loop.");               
AddExpression(16, ef_return_string, "Current messageID", "Received - for each", "CurMessageID", 
              "Get the current messageID in a For Each loop.");  
AddExpression(17, ef_return_number, "Current sent unix timestamp", "Received - for each", "CurSentAt", 
              "Get the current sent unix timestamp (number of milliseconds since the epoch) in a For Each loop.");
AddExpression(18, ef_return_number, "Current message index", "Received - for each", "CurMessageIndex", 
              "Get the current message index in a For Each loop.");        

AddExpression(91, ef_return_string, "Current sender ID", "Received - for each", "LastFetchedSenderID", 
              "Get the current senderID in a For Each loop.");         
AddExpression(92, ef_return_string, "Current sender name", "Received - for each", "LastFetchedSenderName", 
              "Get the current sender name in a For Each loop.");      
AddExpression(93, ef_return_string, "Current receiverID", "Received - for each", "LastFetchedReceiverID", 
              "Get the current receiverID in a For Each loop.");       
AddExpression(94, ef_return_string, "Current title", "Received - for each", "LastFetchedTitle", 
              "Get the current title in a For Each loop.");    
AddExpression(95, ef_return_string, "Current content", "Received - for each", "LastFetchedContent", 
              "Get the current content in a For Each loop.");               
AddExpression(96, ef_return_string, "Current messageID", "Received - for each", "LastFetchedMessageID", 
              "Get the current messageID in a For Each loop.");  
AddExpression(97, ef_return_number, "Current sent unix timestamp", "Received - for each", "LastFetchedSentAt", 
              "Get the current sent unix timestamp (number of milliseconds since the epoch) in a For Each loop.");
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_text, "Application ID", "", "Application ID"),
	new cr.Property(ept_text, "Javascript Key", "", "Javascript Key"),
    new cr.Property(ept_text, "Class name", "Message", "Class name for storing messages structure."), 
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),    
	new cr.Property(ept_combo, "Order", "Later to eariler", "Order.", "Eariler to later|Later to eariler"),     
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
