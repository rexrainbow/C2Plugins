function GetPluginSettings()
{
	return {
		"name":			"Bahamut",
		"id":			"Rex_Bahamut",
		"version":		"0.1",   		
		"description":	"Get user data from Bahamut website. http://www.gamer.com.tw/",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_bahamut.html",
		"category":		"Rex - Web - YQL",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"jquery.xdomainajax.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag","Tag.","");
AddCondition(1,cf_trigger,"On user data received",
             "User data","On user data received, tag: <b>{0}</b>",
             "Triggered when receives user data.","OnGetUserData");
AddStringParam("Tag","Tag.","");             
AddCondition(2,cf_trigger,"On user data received failed","User data",
             "On user data received failed, tag: <b>{0}</b>",
             "Triggered when receives user data failed.","OnGetUserDataFailed");
AddStringParam("Name","User name.","");
AddCondition(3, cf_looping | cf_not_invertible, "For each friend", "Friend list", 
             "For each friend of <i>{0}</i>", "Repeat the event for each friend.", "ForEachFriend");
AddStringParam("Tag","Tag.","");
AddCondition(4,cf_trigger,"On friends list received","Friend list",
             "On friends list received, tag: <b>{0}</b>",
             "Triggered when receives friends list.","OnGetFriendList");
AddStringParam("Tag","Tag.","");             
AddCondition(5,cf_trigger,"On friends list received failed","Friend list",
             "On friends list received failed, tag: <b>{0}</b>",
             "Triggered when receives friends list failed.","OnGetFriendListFailed");
AddStringParam("Tag","Tag.","");
AddCondition(6, cf_deprecated | cf_trigger,"On game card received","Game card",
             "On game card received, tag: <b>{0}</b>",
             "Triggered when receives game card.","OnGetGameCard");
AddStringParam("Tag","Tag.","");             
AddCondition(7,cf_deprecated | cf_trigger,"On game card received failed","Game card",
             "On game card received failed, tag: <b>{0}</b>",
             "Triggered when receives game card failed.","OnGetGameCardFailed");             
                          	 
//////////////////////////////////////////////////////////////
// Actions     
AddAction(2,0,"Clean all users data","Clean",
          "Clean all users data",
          "Clean all users data.","CleanUserData");	 
AddStringParam("Name","User name.","");
AddStringParam("Tag","Tag for received callback.","");
AddAction(3,0,"Get user data","User data",
          "Get <b>{0}</b>'s user data, tag to <b>{1}</b>",
          "Get user data.","GetUserData"); 
AddStringParam("Name","User name.","");
AddStringParam("Tag","Tag for received callback.","");
AddAction(4,0,"Get friends list","Friend list",
          "Get <b>{0}</b>'s friends list, tag to <b>{1}</b>",
          "Get friends list.","GetFriendList");     
AddStringParam("Name","User name.","");
AddStringParam("Tag","Tag for received callback.","");
AddAction(5,af_deprecated,"Get game card","Game card",
          "Get <b>{0}</b> game card, tag to <b>{1}</b>",
          "Get game card.","GetGameCard");                          
                    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get current user name","User data","CurUserName","Get current user name.");
AddExpression(2, ef_return_number | ef_variadic_parameters,"Get user's STR","User data","STR","Get user's STR.");
AddExpression(3, ef_return_number | ef_variadic_parameters,"Get user's DEX","User data","DEX","Get user's DEX.");
AddExpression(4, ef_return_number | ef_variadic_parameters,"Get user's INT","User data","INT","Get user's INT.");
AddExpression(5, ef_return_number | ef_variadic_parameters,"Get user's LUK","User data","LUK","Get user's LUK.");
AddExpression(6, ef_return_number | ef_variadic_parameters,"Get user's VIT","User data","VIT","Get user's VIT.");
AddExpression(7, ef_return_number | ef_variadic_parameters,"Get user's AGI","User data","AGI","Get user's AGI.");
AddExpression(8, ef_return_number | ef_variadic_parameters,"Get user's MND","User data","MND","Get user's MND.");
AddExpression(9, ef_return_string | ef_variadic_parameters,"Get url of user image","User data","ImageURL","Get url of user image.");
AddExpression(10, ef_return_string, "Current friends name", "Friend list", "CurFriendName", "Get the current friends name in For each friends event.");
AddExpression(11, ef_return_string, "Current friends nickname", "Friend list", "CurFriendNickname", "Get the current friends nickname in For each friends event.");
AddExpression(12, ef_deprecated | ef_return_string | ef_variadic_parameters,"Get url of user game card","User data","GameCardURL","Get url of user game card.");
AddExpression(13, ef_return_string | ef_variadic_parameters,"Get user's nickname","User data","Nickname","Get user's nickname.");
AddExpression(14, ef_return_number | ef_variadic_parameters,"Get user's level","User data","LV","Get user's level.");
AddExpression(15, ef_return_string | ef_variadic_parameters,"Get user's race","User data","RACE","Get user's race.");
AddExpression(16, ef_return_string | ef_variadic_parameters,"Get user's occupation","User data","OCCUPATION","Get user's occupation.");

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
