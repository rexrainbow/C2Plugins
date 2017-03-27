function GetPluginSettings()
{
	return {
		"name":			"Fuzzy",
		"id":			"Rex_Fuzzy",
		"version":		"0.1",   		
		"description":	"Fuzzy logic",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_fuzzy.html",
		"category":		"Rex - AI",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
                     
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Name", "Input variable name.", '""');
AddStringParam("---", 'Range setting of Negative Big. Empty string is ignored.', '"0, 17"');
AddStringParam("--", 'Range setting of Negative Medium. Empty string is ignored.', '"0, 17, 33"');
AddStringParam("-", 'Range setting of Negative Small. Empty string is ignored.', '"17, 33, 50"');
AddStringParam("", 'Range setting of Zero. Empty string is ignored.', '"33, 50, 66"');
AddStringParam("+", 'Range setting of Positive Small. Empty string is ignored.', '"50, 66, 83"');
AddStringParam("++", 'Range setting of Positive Medium. Empty string is ignored.', '"66, 83, 100"');
AddStringParam("+++", 'Range setting of Positive Big. Empty string is ignored.', '"83, 100"');
AddAction(1, 0, "0. Define membership (7 levels)", "0. Define membership", 
          "Define membership <i>{0}</i>: NB to <i>{1}</i>, NM to <i>{2}</i>, NS to <i>{3}</i>, ZO to <i>{4}</i>, PS to <i>{5}</i>, PM to <i>{6}</i>, PB to <i>{7}</i>", 
          "Define membership.", "DefineMembership_7levles");
AddStringParam("Name", "Input variable name.", '""');
AddStringParam("--", 'Range setting of Negative Medium. Empty string is ignored.', '"0, 25"');
AddStringParam("-", 'Range setting of Negative Small. Empty string is ignored.', '"0, 25, 50"');
AddStringParam("", 'Range setting of Zero. Empty string is ignored.', '"25, 50, 75"');
AddStringParam("+", 'Range setting of Positive Small. Empty string is ignored.', '"50, 75, 100"');
AddStringParam("++", 'Range setting of Positive Medium. Empty string is ignored.', '"75, 100"');
AddAction(2, 0, "0. Define membership (5 levels)", "0. Define membership", 
          "Define membership <i>{0}</i>: NB to <i>{1}</i>, NS to <i>{2}</i>, ZO to <i>{3}</i>, PS to <i>{4}</i>, PB to <i>{5}</i>", 
          "Define membership.", "DefineMembership_5levles");    
AddStringParam("Name", "Input variable name.", '""');
AddStringParam("-", 'Range setting of Negative Small. Empty string is ignored.', '"0, 50"');
AddStringParam("", 'Range setting of Zero. Empty string is ignored.', '"0, 50, 100"');
AddStringParam("+", 'Range setting of Positive Small. Empty string is ignored.', '"50, 100"');
AddAction(3, 0, "0. Define membership (3 levels)", "0. Define membership", 
          "Define membership <i>{0}</i>: N to <i>{1}</i>, ZO to <i>{2}</i>, P to <i>{3}</i>", 
          "Define membership.", "DefineMembership_3levles");           
AddStringParam("Rule", "Rule name.", '""');   
AddStringParam("Expression", "Expression of memberships.", '""');
AddAction(10, 0, "Add", "0. Define rule", 
          "Add rule <i>{0}</i> <- <i>{1}</i>", "Add rule.", "AddRule");  
AddAction(11, 0, "Execute rules", "Output", 
          "Execute rules", "Execute rules.", "ExecuteRules");          
AddStringParam("Name", "Variable name.", '""');
AddNumberParam("Value", "Variable value.", 0);
AddAction(12, 0, "Set variable value", "Input", 
          "Set variable <i>{0}</i> value to <i>{1}</i>", "Set variable value.", "SetVarValue");
AddAction(13, 0, "Clean all", "0. Define rule", 
          "Clean all rules", "Clean all rules.", "CleanAllRules");  
AddStringParam("Rule", "Rule name.", '""');   
AddAction(14, 0, "Clean", "0. Define rule", 
          "Clean rule <i>{0}</i>", "Clean rule.", "CleanRule"); 
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Output", "Output name.", '""');
AddExpression(1, ef_return_number, "Get output grade", "Output", "OutputGrade", "Get output grade.");
AddStringParam("Input", "Input name.", '""');
AddExpression(2, ef_return_number, "Get input grade", "Input", "InputGrade", "Get input grade.");
AddAnyTypeParam("Expression", "Expression of membership, or a number.", '""');
AddExpression(3, ef_return_any | ef_variadic_parameters, "NOT operation", "Logic", "NOT", "Do NOT operation of these expressions.");
AddAnyTypeParam("Expression A", "Expression of membership, or a number.", '""');
AddAnyTypeParam("Expression B", "Expression of membership, or a number.", '""');
AddExpression(4, ef_return_any | ef_variadic_parameters, "OR operation", "Logic", "OR", "Do OR operation of these expressions.");
AddAnyTypeParam("Expression A", "Expression of membership, or a number.", '""');
AddAnyTypeParam("Expression B", "Expression of membership, or a number.", '""');
AddExpression(5, ef_return_any | ef_variadic_parameters, "AND operation", "Logic", "AND", "Do AND operation of these expressions.");
AddExpression(6, ef_return_string, "Get max output", "Output", "MaxOutput", "Get maximun output.");
AddStringParam("Input", "Input name.", '""');
AddExpression(7, ef_return_string, "Get input membership of max grade", "Input", "MaxInputMembership", "Get input membership of maximun grade.");

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
