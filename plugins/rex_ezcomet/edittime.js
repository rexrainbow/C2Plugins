function GetPluginSettings()
{
	return {
		"name":			"EZ Comet",
		"id":			"Rex_EZComet",
		"version":		"0.1",   		
		"description":	"Send or receive message through EZ Comet service: http://ezcomet.com/",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_ezcomet.html",
		"category":		"Web",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "Function name", '""');
AddCondition(0, cf_trigger, "On function", "Function", "On function <i>{0}</i>", "", "OnFunctionCalled");
             
//////////////////////////////////////////////////////////////
// Actions     
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(1, 0, "Set a parameter", "Parameter", 
          "Set parameter[<i>{0}</i>] to <i>{1}</i>",
          "Set a parameter pass into function.", "SetParameter");   
AddAction(2, 0, "Clean all parameters", "Parameter", 
          "Clean all parameters", "Clean all parameters.", "CleanParameters"); 
AddStringParam("Name", "Function name", '""');
AddAction(3, 0, "Call function", "Function", "Call <i>{0}</i>", "Call function.", "CallFunction");  
AddStringParam("Channel", "Channel", "");
AddAction(10, 0, "Set channel", "Send", 
          "Set channel to <i>{0}</i>", 
          "Set channel.", "SetChannel");    
          
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("0", "The index of parameter to get, can be number of string.", "0");
AddExpression(0, ef_return_any | ef_variadic_parameters, "Get parameter", "Parameter", "Param", "Get a parameter by index.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Sync-mode", "Network", "Sync-mode.", "Network|Stand alone"), 
    new cr.Property(ept_text, "User name", "", "User name, only need for receiver"),
    new cr.Property(ept_text, "API key", "", "API key of current user name, only need for sender."),
    new cr.Property(ept_text, "Channel", "", "Only can get message from the same channel", "message"),
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
