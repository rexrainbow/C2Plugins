function GetPluginSettings()
{
	return {
		"name":			"Debug Panel",
		"id":			"Rex_DebugPanel",
		"version":		"0.1",        
		"description":	"Dump debug message to panel.",
		"author":		"",
		"help url":		"",
		"category":		"General",
		"type":			"object",			// appears in layout
		"rotatable":	false,
		"flags":		0
	};
};

////////////////////////////////////////
// Conditions        

////////////////////////////////////////
// Actions
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Activated", "Active debug panel.",1);
AddAction(0, 0, "Set activated", "Setting", "Set activated to <i>{0}</i>", 
          "Active the debug panel.", "SetActivated");
AddAction(1, 0, "Clean all messages", "Log", "Clean all message", "Clean all messages.", "CleanMessages");
AddAnyTypeParam("Message", "Log message", '""');
AddAction(2, 0, "Append a log message", "Log", 
          "Append log message <i>{0}</i>", "Append a log message.", "AppendLogMessage");
AddAnyTypeParam("Name", "Variable name", '""');
AddAnyTypeParam("Value", "Value", 0);
AddAction(3, 0, "Update watch variable", "Watch", 
          "Update watch variable <i>{0}</i> to <i>{1}</i>", "Update watch variable.", "UpdateWatchVariable");
AddAnyTypeParam("Message", "Error message", '""');
AddAction(4, 0, "Append an error message", "Log", 
          "Append error message <i>{0}</i>", "Append an error message.", "AppendErrorMessage");
AddKeybParam("Key code", "Pop-up Key code.");
AddAction(5, 0, "Set pop-up key", "Setting", 
          "Set pop-up key to <i>{0}</i>", 
          "Set pop-up key for showing debug panel.", "SetPopupKey");   
          
////////////////////////////////////////
// Expressions

ACESDone();

// Property grid properties for this plugin
var property_list = [  
    new cr.Property(ept_combo, "Enable", "Yes", "Set 'Yes' to allow dump message.", "No|Yes"),             
    new cr.Property(ept_combo, "Activated", "Yes", "Set 'Yes' if you wish this to begin at the start of the layout.", "No|Yes"),     
    new cr.Property(ept_combo, "Stay on top", "No", "Set 'Yes' if you wish debug pannel always stay on top.", "No|Yes"),     
    new cr.Property(ept_integer, "Log buffer length", 100, "The length of maximun log message. 0 is infinity."),             
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
