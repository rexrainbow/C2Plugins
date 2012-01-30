function GetPluginSettings()
{
	return {
		"name":			"Popup window",
		"id":			"Rex_PopupWindow",
		"description":	"Pop-up a window",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Utility",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Name", "Name of window", '""');
AddStringParam("Url", "The location (URL) of the window", '""');
AddNumberParam("Width", "Width of window", 300);
AddNumberParam("Height", "Height of window", 200);
AddNumberParam("Top", "Top margin of window", 0);
AddNumberParam("Left", "Left margin of window", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Toolbar", "Has toolbar", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Menubar", "Has menubar", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Scrollbar", "Has scrollbar", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Resizable", "Can resizable", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Location", "Display location", 0);
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Status", "Display status", 0);
AddAction(1, 0, "Pop-up a window", "Pop-up", 
          "Pop-up a window <i>{1}</i> from <i>{0}</i> with <i>{2}</i>x<i>{3}</i>", 
          "Pop-up a window.", "PopupWindow");
AddObjectParam("Function", "Function object to get commands");
AddAction(2, 0, "Setup command processor", "Setup", 
          "Send commands to <i>{0}</i>", 
          "Send commands to a function object.", "Setup");        
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(3, 0, "Set a parameter", "Parameter", 
          "Set parameter[<i>{1}</i>] to <i>{2}</i>",
          "Set a parameter pass into parent or child window.", "SeParameter");
AddAction(4, 0, "Clean all parameters", "Parameter", 
          "Clean all parameters", "Clean all parameters.", "CleanParameters");  
AddStringParam("Name", "Name of window", '""');
AddStringParam("Commands", "Commands", '""');
AddAction(5, 0, "Send commands to child", "Function", 
         "Send commands <i>{1}</i> to child <i>{0}</i>.", 
         "Send commands to child window.", "SendCmd2Child");
AddStringParam("Commands", "Commands", '""');
AddAction(6, 0, "Send commands to parent", "Function", 
         "Send commands <i>{0}</i> to parent window.", 
         "Send commands to parent window.", "SendCmd2Parent");         
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
