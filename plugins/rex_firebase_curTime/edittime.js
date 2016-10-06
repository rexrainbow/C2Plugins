function GetPluginSettings()
{
	return {
		"name":			"Current timestamp",
		"id":			"Rex_Firebase_CurTime",
		"version":		"0.1",        
		"description":	"Get server timestamp periodically.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebase_curTime.html",
		"category":		"Rex - Web - Firebase - date",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "Is updating", "Updating", 
             "Is updating", 
             "Return true if timestamp is valid.", "IsUpdating");
             
AddCondition(2, cf_trigger, "On start", "Updating", 
            "On updating start", 
            'Triggered when updating start.', "OnStart");             
          
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");

AddStringParam("User ID", "Key of User ID.", '""');
AddAction(1, 0, "Start", "Control", 
          "Start updating server timestamp of user ID: <i>{0}</i>", 
          "Start updating server timestamp.", "Start");
  
AddAction(2, 0, "Stop", "Control", 
          "Stop updating server timestamp", 
          "Stop updating server timestamp.", "Stop");  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get current timestamp", "Current", "Timestamp", 
              "Get current timestamp, in milliseconds.");    
              
AddExpression(2, ef_return_number, "Get last predicted error", "Error", "LastPredictedError", 
              "Get last predicted error, in seconds");   
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "CurTime", "Sub domain for this function."), 
    new cr.Property(ept_float, "Updating period", 1, "Updating period of server timestamp, in secondes."),    
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
