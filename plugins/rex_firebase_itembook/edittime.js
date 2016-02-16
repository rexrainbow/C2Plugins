function GetPluginSettings()
{
	return {
		"name":			"Item book v2",
		"id":			"Rex_Firebase_ItemBook",
		"version":		"0.1",        
		"description":	"Item book has many item talbs, each item table is indexed by (itemID, key), supports writing reading items back, and query items with condition filters.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_itembook.html",
		"category":		"Rex - Web - firebase",
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

//////////////////////////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Counter", "Sub domain for this function."),
    new cr.Property(ept_float, "Initial", 0, "Initial value if counter value is null."),
    new cr.Property(ept_text, "Upper bound", "", 'Upper bound of counter, "" is none. Counter value will be clamped at upper bound.'),         
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
