function GetBehaviorSettings()
{
	return {
		"name":			"Road",
		"id":			"rex_chess_road",
		"version":		"0.1",
		"description":	"Set frame according to neighbors.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_chess_road.html",
		"category":		"Rex - Board - application",
		"flags":		0	
						| bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Enable the behavior.",1);
AddAction(0, 0, "Set activated", "", "Set {my} activated to <i>{0}</i>", 
          "Enable this behavior.", "SetEnable");        

AddAction(1, 0, "Update", "Update", 
          "Update {my}", 
          "Updating manually.", "Update");
          
AddStringParam("Tag", "Tag.", '""');
AddAction(2, 0, "Set tag", "Tag", "Set {my} tag to <i>{0}</i>",
         "Set tag.", "SetTag");
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get tag", "Tag", "Tag", "Get tag.");
AddExpression(2, ef_return_number, 
              "Get frame index", "Frame", "FrameIndex", 
              "Get frame index.");  
			  
ACESDone();

var property_list = [
    new cr.Property(ept_combo, "Enable", "Yes", "Enable if you wish to update frame every tick.", "No|Yes"),
    new cr.Property(ept_text, "Tag", "", "Tag with the same name will be treated as neighbor."),	    
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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
