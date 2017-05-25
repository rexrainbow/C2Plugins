function GetPluginSettings()
{
	return {
		"name":			"Kongregate",
		"id":			"Rex_kongregate",
		"version":		"0.1",        
		"description":	"Api of kongregate. Reference: https://docs.kongregate.com/v1.0/docs/javascript-api",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_kongregate_api.html",
		"category":		"Rex - Kongregate",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,     
	};
};

//////////////////////////////////////////////////////////////
// Conditions

// API Load
AddCondition(0, cf_trigger, "On api loaded", "API Load", "On api loaded", "Triggered when api loaded.", "OnAPILoaded");
AddCondition(1, 0, "Is api loaded", "API Load", "Is api loaded", "Return true if api is loaded.", "IsAPILoaded");

// callback
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');
AddCondition(2, cf_trigger, "Callback", "Callback", "On <i>{0}</i>", "Callback of request.", "OnCallback");

// Authentication
AddCondition(101, cf_trigger, "On login", "Authentication", "On login", "Triggered when the user logs in (either automatically or during the game).", "OnLogin");
AddCondition(102, cf_none, "Is guest", "Authentication", "Is guest", "True if the user is a guest (not logged in).", "IsGuest");

// Incentivized Ads
AddCondition(201, cf_trigger, "2. On ads available", "Incentivized Ads", "2. On ads available", "Triggered when ads is available.", "OnAdsAvailable");
AddCondition(202, cf_trigger, "2. On ads unavailable", "Incentivized Ads", "2. On ads unavailable", "Triggered when ads is unavailable.", "OnAdsUnavailable");
AddCondition(203, cf_trigger, "4. On ads opened", "Incentivized Ads", "4. On ads opened", "Triggered when ads is opened.", "OnAdOpened");
AddCondition(204, cf_trigger, "5. On ads completed", "Incentivized Ads", "5. On ads completed", "Triggered when ads is completed.", "OnAdCompleted");
AddCondition(205, cf_trigger, "5. On ads abandoned", "Incentivized Ads", "5. On ads abandoned", "Triggered when ads is abandoned.", "OnAdAbandoned");

// Kreds & Virtual Goods

//////////////////////////////////////////////////////////////
// Actions

// Authentication
AddAction(101, 0, "Show registration box", "Authentication", "Show registration box", 
          "Show a dialog prompting the user to register an account.", 
          "ServicesShowRegBox");

// Incentivized Ads
AddAction(201, 0, "1. Initialize incentivized Ads", "Incentivized Ads", 
          "1. Initialize incentivized Ads", 
          "Initialize the incentivized ad system.", "MtxInitializeIncentivizedAds"); 
          
AddAction(202, 0, "3. Show incentivized Ad", "Incentivized Ads", 
          "3. Show incentivized Ad", 
          "Attempt to display an incentivized ad to the user.", "MtxShowIncentivizedAd");    

// Kreds & Virtual Goods
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');
AddAction(301, 0, "Request user item list", "Kreds & Virtual Goods", 
          "Request user item list (callback <i>{0}</i>)", 
          "Request user item list.", "MtxRequestUserItemList"); 

AddStringParam("Tags", 'Item tags, separated by ",".', '""');          
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');
AddAction(302, 0, "Request item list", "Kreds & Virtual Goods", 
          "Request item list with tags to <i>{0}</i> (callback <i>{1}</i>)", 
          "Request item list.", "MtxRequestItemList");
          
AddStringParam("Identifiers", 'Item identifier strings, separated by ",".', '""');          
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');
AddAction(303, 0, "Purchase items", "Kreds & Virtual Goods", 
          "Purchase items <i>{0}</i> (callback <i>{1}</i>)", 
          "Start the purchase flow for predefined items.", "MtxPurchaseItems");          
          
AddComboParamOption("default");
AddComboParamOption("OfferPal");
AddComboParamOption("Mobile/Zong");
AddComboParam("Type", "Optional type of offer to display.", 0);
AddAction(304, 0, "Show Kred purchase dialog", "Kreds & Virtual Goods", 
          "Show Kred purchase <i>{0}</i> dialog ", 
          "Opens the Kred Purchase lightbox.", "MtxShowKredPurchaseDialog");                  
          
// Feeds & User Messaging
AddStringParam("Content", "A string containing the text for the feed post.", '""');
AddStringParam("Image URI", "Link to an image to use as an icon for the feed post.", '""');
AddStringParam("kv_params", "Optional parameters to be passed into the game when the feed post link is followed.", '""');
AddAction(401, 0, "Show feed post box", "Feeds & User Messaging", 
          "Show feed post box with content <i>{0}</i>, image URI <i>{1}</i>, kv_params <i>{2}</i>", 
          "Create a post in the user's activity feed.", "ServicesShowFeedPostBox");

AddStringParam("Message", "The message text to add to the shout.", '""');
AddAction(402, 0, "Show shout box", "Feeds & User Messaging", 
          "Show shout box with message <i>{0}</i>", 
          "Post a shout on the user's profile page.", "ServicesShowShoutBox");          

AddStringParam("Content", "The text content of the invitation.", '""');
AddStringParam("Filter", 'One of these values: "", "played", "not_played", a list of userID ex "123 8219"', '""');
AddStringParam("kv_params", "Optional parameters to be passed into the game when the feed post link is followed.", '""');
AddAction(403, 0, "Show invitation box", "Feeds & User Messaging", 
          "Show shout box with content <i>{0}</i>, filter <i>{1}</i>, kv_params <i>{2}</i>", 
          "Post a shout on the user's profile page.", "ServicesShowInvitationBox");  

AddStringParam("Content", "The message to send.", '""');
AddAction(404, 0, "Private message", "Feeds & User Messaging", 
          "Show private message <i>{0}</i>", 
          "Send a private message to the user.", "ServicesPrivateMessage");    

// Custom Chat
AddStringParam("Tab name", "Name of the tab.", '""');
AddStringParam("Description", "Description of the tab.", '""');
AddStringParam("Options", "Extra options for the tab, in JSON", '""');
AddAction(501, 0, "Show tab", "Custom Chat", 
          "Show tab <i>{0}</i> (<i>{1}</i>) with options <i>{2}</i>", 
          "Displays a custom chat tab.", "ChatShowTab");  
          
AddStringParam("Message", "The message to display.", '""');
AddAction(502, 0, "Display message", "Custom Chat", 
          "Display message <i>{0}</i>", 
          "Displays a custom chat tab.", "ChatDisplayMessage");  
          
AddAction(503, 0, "Clear messages", "Custom Chat", 
          "Clear messages", 
          "Remove all chat messages from the custom tab.", "ChatClearMessages");   
        
AddAction(504, 0, "Close tab", "Custom Chat", 
          "Close tab", 
          "Close a custom chat tab.", "ChatCloseTab");  

AddComboParamOption("message");
AddComboParamOption("room.message");
AddComboParamOption("tab_visible");
AddComboParam("Event", "Type of event to listen for.", 0);  
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');        
AddAction(505, 0, "Add event listener", "Custom Chat", 
          "Add chat event <i>{0}</i> listener (callback <i>{1}</i>)", 
          "Listen for chat messages from the user.", "ChatAddEventListener");      

// Shared Content
AddStringParam("type", "Type of content the user wishes to save, 12 characters max.", '""');
AddStringParam("Content", "Value of content to be saved.", '""');
AddStringParam("Label", "Optional label for sub-classing the shared content.", '""');
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');        
AddAction(601, 0, "Save", "Shared Content", 
          "Save shared content <i>{0}</i>: <i>{1}</i> with label to <i>{2}</i> (callback <i>{3}</i>)", 
          "Save a custom level or other shared content.", "SharedContentSave"); 
          
AddStringParam("type", "Type of content the user wishes to save, 12 characters max.", '""');
AddComboParamOption("own");
AddComboParamOption("newest");
AddComboParamOption("load count");
AddComboParamOption("friends");
AddComboParam("Sort by", "How to sort the content.", 0);  
AddStringParam("Label", "Optional label for sub-classing the shared content.", '""');   
AddAction(602, 0, "Browse", "Shared Content", 
          "Browse shared content <i>{0}</i> with label to <i>{2}</i>, sort by <i>{1}</i>", 
          "Allow the player to browse shared content.", "SharedContentBrowse");           
          
AddStringParam("type", "Type of content to listen for.", '""');
AddStringParam("Callback", "A tag, which can be anything you like, to distinguish between different callback.", '""');        
AddAction(603, 0, "Add load listener", "Shared Content", 
          "Add shared Content's load event listener <i>{0}</i> (callback <i>{1}</i>)", 
          "Receive notifications when shared content is loaded.", "SharedContentAddLoadListener");           

// Statistics          
AddStringParam("Statistic name", "The name of the statistic to submit.", '""');
AddNumberParam("Value", "The value of the statistic to submit.", '""');        
AddAction(701, 0, "Submit", "Statistics", 
          "Submit <i>{0}</i> to <i>{1}</i>", 
          "Submit statistics/scores to the server.", "StatsSubmit");

//////////////////////////////////////////////////////////////
// Expressions
// AddStringParam("Key", "The key string.", '""');
AddExpression(0, ef_return_any | ef_variadic_parameters, "Get result", "Callback", "Result", "Get result of callback, in JSON string.");

// Authentication
AddExpression(101, ef_return_number, "User ID", "Authentication", "UserID", "Return the current user's ID, or 0 if guest.");
AddExpression(102, ef_return_string, "User name", "Authentication", "UserName", "Return the current user's name, or a guest name if not logged in.");
AddExpression(103, ef_return_string, "Game auth token", "Authentication", "GameAuthToken", "Get the game authentication token for the current user.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
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
