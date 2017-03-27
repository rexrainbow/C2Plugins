function GetPluginSettings()
{
	return {
		"name":			"Verbal Expressions",
		"id":			"Rex_VerbalExpressions",
		"version":		"0.1",        
		"description":	"Create Regular expression. https://github.com/VerbalExpressions/JSVerbalExpressions/blob/master/VerbalExpressions.js",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_verbalexpressions.html",
		"category":		"Rex - String",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"VerbalExpressions.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Input", "Input string.", '""');
AddCondition(1, 0, "Is matched", "Test", 
             "Is <i>{0}</i> matched", "Return true if input is matched current expression.", "IsMatched");   

AddStringParam("Callback", "Callback name.", '"_"');
AddCondition(51, cf_trigger, "On callback", "Replace", 
             "On replacing callbakc <i>{0}</i>", 'Triggered when replacing string by "Expression: Replacing by callback".', "OnReplacingCallback");             
//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "New", "New", 
          "Create a new expression", 
          "Create a new expression.", "NewExp");
   
AddAction(11, 0, "Start of line", "Line start / line end", 
          "Start of line", 
          "Mark the expression to start at the beginning of the line.", "StartOfLine");    
          
AddAction(12, 0, "End of line", "Line start / line end", 
          "End of line", 
          "Mark the expression to end at the last character of the line.", "EndOfLine");              
         
AddStringParam("Value", "The string to be looked for.", '""');          
AddAction(13, 0, "Find", "Source", 
          "Find <i>{0}</i>", 
          "Add a string to the expression.", "Find");   
          
AddStringParam("Value", "The string to be looked for.", '""');          
AddAction(14, 0, "Maybe", "Source", 
          "Maybe <i>{0}</i>", 
          "Add a string to the expression that might appear once (or not).", "Maybe");     
          
AddAction(15, 0, "Anything", "Source", 
          "Any character any number of times", 
          "Mark the expression to any character any number of times.", "Anything");     
          
AddStringParam("Value", "The string to be looked for.", '""');          
AddAction(16, 0, "Anything but", "Source", 
          "Anything but these characters <i>{0}</i>", 
          "Add a string to anything but these characters.", "AnythingBut");        
          
AddAction(17, 0, "Something", "Source", 
          "Any character at least one time", 
          "Mark the expression to any character at least one time.", "Something");     
          
AddStringParam("Value", "The string to be looked for.", '""');          
AddAction(18, 0, "Something but", "Source", 
          "Any character at least one time except for these characters <i>{0}</i>", 
          "Add a string to any character at least one time except for these characters.", "SomethingBut");                                  
          
AddAction(31, 0, "Line break", "Special characters", 
          "Line break", 
          "Add universal line break expression.", "LineBreak");
          
AddAction(32, 0, "Word", "Special characters and groups", 
          "Word", 
          "Adds an expression to match a word -- all letters, numbers and underscores.", "Word");
          
AddAction(33, 0, "Tab", "Special characters", 
          "Tab", 
          "Add expression to match a tab character.", "Tab");        
          
AddAnyTypeParam("Value", "Replaced by.", '""');          
AddAction(51, 0, "Set result", "Replace", 
          "Set replaced result to <i>{0}</i>", 
          'Set replaced result, used under "Condition: On callback', "SetReplaceResult");                                                     
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Input", "Input string.", '""');
AddStringParam("Replace", "Replace by.", '""');
AddExpression(1, ef_return_string, "Replacing by string", "Replace", "Replace", 
              "Replacing by string.");

AddStringParam("Input", "Input string.", '""');
AddStringParam("Callback", "Replace by function.", '"_"');
AddExpression(51, ef_return_string, "Replacing by callback", "Replace", "ReplaceByCallback", 
              'Replacing by "Condition: On callback" with "Action: Set result".');

AddExpression(52, ef_return_string, "Replacing target", "Replace", "ReplacingTarget", 
              'Target string to be replaced, used under "Condition: On callback".');

AddExpression(91, ef_return_string, "Get current regex", "Expression", "Regex", 
              "Get current regex.");     
AddExpression(92, ef_return_string, "Get current flags", "Expression", "Flags", 
              "Get current flags.");                                                    
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
