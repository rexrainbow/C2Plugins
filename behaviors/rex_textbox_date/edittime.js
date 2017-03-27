function GetBehaviorSettings()
{
	return {
		"name":			"Date input",
		"id":			"Rex_textbox_date",
		"description":	"Accept date input",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_textbox_date.html",
		"category":		"Rex - Textbox helper",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
            

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get year", "Date", 
              "Year", 
              "Get year.");
AddExpression(2, ef_return_number, "Get month", "Date", 
              "Month", 
              "Get month.");
AddExpression(3, ef_return_number, "Get date", "Date", 
              "Date", 
              "Get date.");              

              
ACESDone();

// Property grid properties for this plugin
var property_list = [    
    new cr.Property(ept_combo, "Type", "Date",		
                   "The kind of text entered in to the text box, which also affects on-screen keyboards on touch devices.", 
                   "Date|Datetime|Datetime-local|Month|Week|Time"),              
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
