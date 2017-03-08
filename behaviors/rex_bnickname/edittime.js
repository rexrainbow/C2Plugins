function GetBehaviorSettings()
{
	return {
		"name":			"Nickname",
		"id":			"Rex_bNickname",
		"description":	"Assign a nickname to this object.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_bnickname.html",
		"category":		"Rex - Nickname",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Nickname", "Nickname of object.", '""');
AddCondition(1, 0, "Compare nickanme", "Nickname", 
             "{my} nickname is equal to <i>{0}</i>", 
             "Return true if nickname is matched to specific string.", "IsNicknameMatched");	  			 		 
             
//////////////////////////////////////////////////////////////
// Actions

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(3, ef_return_any, "Get nickname", "Nickname", "Nickname", "Get nickname.");


ACESDone();

// Property grid properties for this plugin
var property_list = [ 
    new cr.Property(ept_text, "Nickname", "", "Nickname of this object."),	
    new cr.Property(ept_combo, "Mode", "Manual", "Define nickname manually or using SID. SID is an unique number for each object type.", "Manual|SID"),
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
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
