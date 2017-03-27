function GetBehaviorSettings()
{
	return {
		"name":			"Pin to image point",
		"id":			"Rex_pin2imgpt",
		"description":	"Stick to another object's image point.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_pin2imgpt.html",
		"category":		"Rex - Movement - pin",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_none, "Is pinned", "", "{my} is pinned", "Object is currently pinned to another object.", "IsPinned");
             
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Pin to", "Choose the object to pin to.");
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddComboParamOption("Position only");
AddComboParamOption("Position & angle");
AddComboParam("Mode", "Choose which properties of the object to update.", 0);
AddAction(1, af_none, "Pin to image point", "Pin", 
          "{my} Pin to {0}(image point {1}) ,{2}", 
          "Pin the object to another object's image point.", "Pin");          

AddAction(10, af_none, "Unpin", "Unpin", "{my} Unpin", "Unpin the object.", "Unpin");
         
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "", "", "PinnedUID", "Get the UID of the object pinned to, or -1 if not pinned.");


ACESDone();

// Property grid properties for this plugin
var property_list = [    
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
