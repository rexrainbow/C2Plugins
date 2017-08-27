function GetPluginSettings()
{
	return {
		"name":			"Prompt wrap",
		"id":			"Rex_PromptWrap",
		"version":		"0.1",        
		"description":	"Prompt wrap for web and cocoonJS",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_inputwrap.html",
		"category":		"Rex - CocoonJS helper",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different requests.", '""');
AddCondition(11, cf_trigger, "On input cancelled", "Keyboard input", 
			 "On input cancelled (tag <i>{0}</i>)", 
			 "Triggered after opening a text input dialog which is then cancelled.", "OnKeyboardCancelled");

AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different requests.", '""');
AddCondition(12, cf_trigger, "On input OK", "Keyboard input", 
			 "On input OK (tag <i>{0}</i>)", 
			 "Triggered after opening a text input dialog which is then OK'd.", "OnKeyboardOK");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Title", "The title to appear on the dialog.");
AddStringParam("Message", "A message to appear on the dialog.");
AddStringParam("Initial text", "The initial entered text to show on the dialog.");
AddComboParamOption("Text");
AddComboParamOption("Number");
AddComboParamOption("Phone");
AddComboParamOption("Email");
AddComboParamOption("URL");
AddComboParam("Type", "The type of text input to use.");
AddStringParam("Cancel text", "The 'Cancel' button text.", "\"Cancel\"");
AddStringParam("OK text", "The 'OK' button text.", "\"OK\"");
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different requests.", '""');
AddAction(8, 0, "Prompt text input", "Keyboard input", 
          "Prompt text input: title <i>{0}</i>, message <i>{1}</i>, initial text <i>{2}</i>, type <i>{3}</i>, cancel text <i>{4}</i>, OK text <i>{5}</i> (tag <i>{6}</i>)", 
          "Open a dialog where the user can enter some text via the on-screen keyboard.", "PromptKeyboard");
      

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "", "Keyboard input", "InputText", "In 'On input OK', get the text entered.");


ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Enable wrap", "Yes", "Set No to popup prompt box by browser api.", "No|Yes"),  
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
