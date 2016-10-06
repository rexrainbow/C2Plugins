function GetPluginSettings()
{
	return {
		"name":			"Firebase API v3",
		"id":			"Rex_FirebaseAPIV3",
		"version":		"3.3.0",   		
		"description":	"3.x API of real time database-as-a-service. https://firebase.google.com/",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebaseapiv3.html",
		"category":		"Rex - Web - Firebase - api",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions	

//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Api key", "Api key", '""');
AddStringParam("Auth domain", "Auth domain", '""');
AddStringParam("Database URL", "Database URL", '""');
AddStringParam("Storage bucket", "Storage bucket", '""');
AddAction(1, 0, "Initialize", "Initialize", 
          "Initialize with Api key: <i>{0}</i>, Auth domain: <i>{1}</i>, Database URL: <i>{2}</i>, Storage bucket: <i>{3}</i>", 
          "Initialize connection.", "initializeApp"); 
//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Api key", "", "APi key."),
    new cr.Property(ept_text, "Auth domain", "", "Auth domain."),    
    new cr.Property(ept_text, "Database URL", "", "Database URL."),     
    new cr.Property(ept_text, "Storage bucket", "", "Storage bucket."),       
    //new cr.Property(ept_text, "App name", "", 'Connect to another firebase project. Set to "" to ignore this feature.'),        
    new cr.Property(ept_combo, "Log", "No", "Enable log.", "No|Yes"),
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
