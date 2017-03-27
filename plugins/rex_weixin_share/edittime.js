function GetPluginSettings()
{
	return {
		"name":			"Weixin share",
		"id":			"Rex_Weixin_share",
		"version":		"0.1",   		
		"description":	"Post messages on Weixin.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_weixin_share.html",
		"category":		"Rex - Web - service",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On ready", "Ready", "On bridge ready", 
             "Triggered when weixin JS bridge ready.", "OnReady");
AddCondition(1, 0, "Is ready", "Ready", "Is ready", 
             "Is weixin JS bridge ready.", "IsReady");
AddCondition(2, cf_trigger, "On share message", "Message", "On share message", 
             "Triggered when share message.", "OnShareMessage");    
AddCondition(3, cf_trigger, "On share timeline", "Timeline", "On share timeline", 
             "Triggered when share timeline.", "OnShareTimeline"); 
AddCondition(4, cf_trigger, "On share weibo", "Weibo", "On share weibo", 
             "Triggered when share weibo.", "OnShareWeibo");             
AddCondition(11, cf_trigger, "On share message error", "Message", "On share message error", 
             "Triggered when share message error.", "OnShareMessageError");    
AddCondition(12, cf_trigger, "On share timeline error", "Timeline", "On share timeline error", 
             "Triggered when share timeline error.", "OnShareTimelineError"); 
AddCondition(13, cf_trigger, "On share weibo error", "Weibo", "On share weibo error", 
             "Triggered when share weibo error.", "OnShareWeiboError");              
//////////////////////////////////////////////////////////////
// Actions  
AddStringParam("App ID", "App ID", '""');
AddStringParam("Description", "Description", '""');
AddStringParam("Title", "Title", '""');
AddStringParam("Link", "Link", '""');
AddStringParam("Image url", "Image url", '""');
AddNumberParam("Image width", "Image width", 0);
AddNumberParam("Image height", "Image height", 0);
AddAction(2, 0, "Share message", "Message", 
          "Share message: <i>{1}</i>, title to <i>{2}</i>, link to <i>{3}</i> with image url to <i>{4}</i>, size to <i>{5}</i>x<i>{6}</i>", 
          "Share message.", "ShareMessage");  

AddStringParam("Description", "Description", '""');
AddStringParam("Title", "Title", '""');
AddStringParam("Link", "Link", '""');
AddStringParam("Image Url", "Image url", '""');
AddNumberParam("Image width", "Image width", 0);
AddNumberParam("Image height", "Image height", 0);
AddAction(3, 0, "Share timeline", "Timeline", 
          "Share timeline: <i>{0}</i>, title to <i>{1}</i>, link to <i>{2}</i> with image url to <i>{3}</i>, size to <i>{4}</i>x<i>{5}</i>", 
          "Share timeline.", "ShareTimeline");      
          
AddStringParam("Content", "Content", '""');
AddStringParam("Url", "Url", '""');
AddAction(4, 0, "Share weibo", "Weibo", 
          "Share weibo: <i>{0}</i>, url to <i>{1}</i>", 
          "Share weibo.", "ShareWeibo");        
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Error message", "Error", "ErrorMessage", "Error message when error raise.");
          
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
