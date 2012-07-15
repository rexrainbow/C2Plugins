function GetPluginSettings()
{
	return {
		"name":			"Bahamut",
		"id":			"Rex_Bahamut",
		"version":		"0.1",   		
		"description":	"Get user data from Bahamut website.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Web",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"jquery.xdomainajax.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,cf_trigger,"On user data received","User data","On user data received",
             "Triggered when receives user's data.","OnGetUserData");
AddCondition(2,cf_trigger,"On user data received failed","User data","On user data received failed",
             "Triggered when receives user's data failed.","OnGetUserDataFailed");
AddStringParam("Name","User name.","");
AddCondition(3, cf_looping | cf_not_invertible, "For each friend", "Friend list", 
             "For each friend of <i>{0}</i>", "Repeat the event for each friend.", "ForEachFriend");
			 
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Name","User name.","");
AddAction(1,0,"Get user's data","User data",
          "Get user's data <b>{0}</b>",
          "Get user's data.","GetUserData");
AddAction(2,0,"Clean all users data","Clean",
          "Clean all users data",
          "Clean all users data.","CleanUserData");	 
                    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1,ef_return_string,"Get current user name","User data","CurUserName","Get current user name.");
AddExpression(2,ef_return_number,"Get user's STR","User data","STR","Get user's STR.");
AddExpression(3,ef_return_number,"Get user's DEX","User data","DEX","Get user's DEX.");
AddExpression(4,ef_return_number,"Get user's INT","User data","INT","Get user's INT.");
AddExpression(5,ef_return_number,"Get user's LUK","User data","LUK","Get user's LUK.");
AddExpression(6,ef_return_number,"Get user's VIT","User data","VIT","Get user's VIT.");
AddExpression(7,ef_return_number,"Get user's AGI","User data","AGI","Get user's AGI.");
AddExpression(8,ef_return_number,"Get user's MND","User data","MND","Get user's MND.");
AddExpression(9,ef_return_string,"Get url of user image","User data","ImageURL","Get url of user image.");
AddExpression(10, ef_return_string, "Current friend name", "Friend list", "CurFriendName", "Get the current friend name in For each friend event.");
AddExpression(11, ef_return_string, "Current friend nickname", "Friend list", "CurFriendNickname", "Get the current friend nickname in For each friend event.");


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
