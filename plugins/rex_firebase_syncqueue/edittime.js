function GetPluginSettings()
{
	return {
		"name":			"Sync queue",
		"id":			"Rex_Firebase_SyncQueue",
		"version":		"0.1",        
		"description":	"Sync queue on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_syncqueue.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get data", "Output", 
            "On get data", 
            "Triggered when get data from output queue.", "OnGetData");
                                  
AddCondition(2, cf_trigger, "On get data", "Token owner", 
            "On get data", 
            "Triggered when get data from input queue for token owner.", "OnGetInputData");   
//////////////////////////////////////////////////////////////
// Actions
AddObjectParam("Token", "Token object.");
AddAction(1, 0, "Setup token", "0. Setup", 
          "Set token to <i>{0}</i>", 
          "Setup token to identify sync queue owner.", "SetupToken");   
          
AddAnyTypeParam("Value", "The value to set", 0);
AddAction(2, 0, "Push", "Input", 
          "Push <i>{0}</i> to input queue", 
          "Push data to input queue.", "Push2In");
          
AddAnyTypeParam("Output", "Output value.", 0);
AddAction(3, 0, "Push", "Token owner",
          "Push <i>{0}</i> to output queue", 
          "Push data to output queue.", "Push2Out");          
                                   
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any, "Get last input data", "Token", "LastIn", 
              "Get last input data.");              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Token", "Sub domain of this function."),  
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
