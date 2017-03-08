function GetBehaviorSettings()
{
	return {
		"name":			"Numbers",
		"id":			"Rex_layouter_numbers",
		"description":	"Show numbers using spriters in layouter. The frames are 0,1,2,3,4,5,6,7,8,9, ,-",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_layouter_numbers.html",
		"category":		"Rex - Layouter",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
	  			 		 
//////////////////////////////////////////////////////////////
// Actions     
AddObjectParam("Number", "Sprite of number.");
AddNumberParam("Digit", "Count of digit.");
AddAction(0, 0, "Create digits", "0: Setup", "Create digits to <i>{1}</i> <i>{0}</i>", 
          "Create digits.", "CreateNumberSprites");  
AddNumberParam("Value", "Value.");
AddAction(1, 0, "Set value", "Number", 
          "Set {my} value to <i>{0}</i>", 
          "Set number value.", 
          "SetValue");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Value", "Value", "Value", "Get value.");

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
