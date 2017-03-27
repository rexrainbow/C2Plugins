function GetPluginSettings()
{
	return {
		"name":			"Pause",
		"id":			"Rex_Pause",
		"version":		"1.0",        
		"description":	"Pause timescale",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_pause.html",
		"category":		"Rex - Logic",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On pause", "Event", "On pause", "Trigger when game is pausing", "OnPause");
AddCondition(1, cf_trigger, "On resume", "Event", "On resume", "Trigger when game is resuming", "OnResume");
AddCondition(2, 0, "Is pause", "If", "Is pause", "Return true if it is in pause state.", "IsPause");

//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Toggle pause", "Pause/Resume", 
          "Toggle pause","Toggle pause.", "TooglePause");  
AddComboParamOption("Pause");
AddComboParamOption("Run");
AddComboParam("State", "Set puase state to.",0);
AddAction(1, 0, "Set pause state", "Pause/Resume", 
          "Set pause state to <i>{0}</i>", "Set the puase state.", "SetState");
           

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "Previous timescale", "Timescale", "PreTimescale", "Get previous timescale.");



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
