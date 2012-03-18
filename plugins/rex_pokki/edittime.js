function GetPluginSettings()
{
	return {
		"name":			"Pokki",
		"id":			"Rex_Pokki",
		"version":		"0.1",        
		"description":	"Event of Pokki",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"General",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On hidden", "Popup", "On hidden", 
            "Trigger when hidden.", "OnHidden");
AddCondition(2, cf_trigger, "On showing", "Popup", "On showing", 
             "Trigger when pop up after hidden.", "OnShown");
AddCondition(3, 0, "Has Pokki", "Pokki", "Has Pokki", 
             "Test if Pokki is in environment.", "HasPokki");             

//////////////////////////////////////////////////////////////
// Actions     
AddAction(1, 0, "Close popup window", "Popup", "Close popup window", 
          "Close popup window.", "ClosePopup"); 
AddStringParam("URL", "Enter the full URL to navigate to.", "\"http://\"");         
AddAction(2, 0,	"Open url in default browser", "Browser", 
          "Open {0}", "Open url in default browser.", "OpenURLInDefaultBrowser");
            
          
//////////////////////////////////////////////////////////////
// Expressions


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
