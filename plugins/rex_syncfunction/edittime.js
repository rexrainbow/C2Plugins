function GetPluginSettings()
{
	return {
		"name":			"Sync-Function",
		"id":			"Rex_SyncFn",
		"version":		"0.1",          
		"description":	"Sync function call for network.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Control flow",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,0,"Network mode","Network mode","Is network mode","True if sync-mode is network mode.","IsNetworkMode");
AddCondition(1,0,"My command","My","Is my command","True if current command is sent by myself.","IsMyCommand");

//////////////////////////////////////////////////////////////
// Actions     
AddObjectParam("Network", "Network object for synchronization");
AddObjectParam("Function", "Function object for callback");
AddAction(0, 0, "Setup Sync Function", "Setup", 
          "Get connection from <i>{0}</i>, callback to <i>{1}</i>", 
          "Setup Sync Function.", "Setup");
AddComboParamOption("Network");
AddComboParamOption("Stand alone");
AddComboParam("Sync-mode", "Set sync-mode.",0);
AddAction(1, 0, "Set sync-mode", "Setup", 
          "Set sync-mode to <i>{0}</i>", 
          "Set sync-mode.", "SetSyncMode");         
AddAnyTypeParam("Index", "Index of parameter, can be number of string", 0);
AddAnyTypeParam("Value", "Value of paramete", 0);
AddAction(2, 0, "Set a parameter", "Parameter", 
          "Set parameter[<i>{0}</i>] to <i>{1}</i>",
          "Set a parameter pass into function.", "SetParameter");          
AddStringParam("Commands", "Commands", '""');
AddAction(3, 0, "Execute commands", "Function", "Execute commands <i>{0}</i>", "Execute commands.", "ExecuteCommands");
AddStringParam("Name", "Function name", '""');
AddAction(4, 0, "Call function", "Function", "Call <i>{0}</i>", "Call function.", "CallFunction");
AddAction(5, 0, "Clean all parameters", "Parameter", 
          "Clean all parameters", "Clean all parameters.", "CleanParameters");         
AddStringParam("Name", "User name", '""');
AddAction(6, 0, "Set user name", "Users", 
         "Set user name to <i>{0}</i>", 
         "Set user name for stand alone mode.", "SetUserName");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0,ef_return_number,"Get triggered user id","Triggered","UsrID","Get triggered user id.");
AddNumberParam("UsrID","The user id.",0);
AddExpression(1,ef_deprecated | ef_return_string | ef_variadic_parameters, 
              "Get user name from user id","Users","UsrName","Get user name from user id.");
AddNumberParam("UsrID","The user id.",0);
AddExpression(15,ef_return_string | ef_variadic_parameters, 
              "Get user name from user id","Users","UsrID2Name","Get user name from user id.");                 
AddExpression(16,ef_return_string,"Get my user name","My","MyUserName","Get my user name."); 
AddExpression(17,ef_return_string,"Get my user id","My","MyUserID","Get my user id.");     

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Sync-mode", "Network", "Sync-mode.", "Network|Stand alone"),  
    new cr.Property(ept_text, "User name", "Guest", "Default user name for stand alone mode."),     
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
