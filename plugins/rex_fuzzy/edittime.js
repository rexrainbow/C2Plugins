function GetPluginSettings()
{
	return {
		"name":			"Fuzzy",
		"id":			"Rex_Fuzzy",
		"version":		"0.1",   		
		"description":	"Fuzzy logic",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"AI",
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
AddStringParam("Negative Big", 'Range setting of Negative Big. Empty string is ignored.', '"0, 17"');
AddStringParam("Negative Medium", 'Range setting of Negative Medium. Empty string is ignored.', '"0, 17, 33"');
AddStringParam("Negative Small", 'Range setting of Negative Small. Empty string is ignored.', '"17, 33, 50"');
AddStringParam("Zero", 'Range setting of Zero. Empty string is ignored.', '"33, 50, 66"');
AddStringParam("Positive Small", 'Range setting of Positive Small. Empty string is ignored.', '"50, 66, 83"');
AddStringParam("Positive Medium", 'Range setting of Positive Medium. Empty string is ignored.', '"66, 83, 100"');
AddStringParam("Positive Big", 'Range setting of Positive Big. Empty string is ignored.', '"83, 100"');
AddAction(1, 0, "Define membership", "Membership", 
          "Define membership <i>{0}</i>: NB to <i>{1}</i>, NM to <i>{2}</i>, NS to <i>{3}</i>, ZO to <i>{4}</i>, PS to <i>{5}</i>, PM to <i>{6}</i>, PB to <i>{7}</i>", 
          "Define membership.", "DefineMembership");
AddStringParam("Condition", "Condition name.", '""');         
AddStringParam("Variable", "Variable name.", '""');
AddComboParamOption("Negative Big");
AddComboParamOption("Negative Medium");
AddComboParamOption("Negative Small");
AddComboParamOption("Zero");
AddComboParamOption("Positive Small");
AddComboParamOption("Positive Medium");
AddComboParamOption("Positive Big");
AddComboParam("Membership", "Membership of variable", 3);
AddAction(2, 0, "Add membership condition", "Condition", 
          "Add condition <i>{0}</i> : <i>{1}</i> is <i>{2}</i>", "Add condition from membership.", "AddMembershipCond"); 
AddStringParam("Condition", "Condition name.", '""');
AddStringParam("Condition from", "Condition name.", '""');
AddAction(3, 0, "Add invert condition", "Condition", 
          "Add condition <i>{0}</i> : NOT <i>{1}</i>", "Add invert condition.", "AddInvertCond");            
AddStringParam("Condition", "Condition name.", '""');
AddStringParam("Condition A", "Sub-condition name.", '""');
AddComboParamOption("AND");
AddComboParamOption("OR");
AddComboParam("Logic", "Logic", 1);
AddStringParam("Condition B", "Sub-condition name.", '""');
AddAction(4, 0, "Add combination condition", "Condition", 
          "Add condition <i>{0}</i> : <i>{1}</i> <i>{2}</i> <i>{3}</i>", "Add combination condition.", "AddCombinationCond");    
AddStringParam("Condition", "Condition name.", '""');
AddStringParam("Variable", "Variable name.", '""');
AddAction(5, 0, "Add rule", "Rule", 
          "Add rule <i>{0}</i> -> <i>{1}</i>", "Add rule.", "AddRule");  
AddAction(6, 0, "Execute rules", "Rule", 
          "Execute rules", "Execute rules.", "ExecuteRules");          
AddStringParam("Name", "Variable name.", '""');
AddNumberParam("Value", "Variable value.", 0);
AddAction(10, 0, "Set variable value", "Input", 
          "Set variable <i>{0}</i> value to <i>{1}</i>", "Set variable value.", "SetVarValue");
          
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Output", "Output name.", '""');
AddExpression(1, ef_return_number | ef_variadic_parameters, "Get output grade", "Output", "Grade", "Get output grade.");
AddStringParam("Input", "Input name.", '""');
AddExpression(2, ef_return_string | ef_variadic_parameters, "Get input maximum membership", "Input", "MemberShip", "Get input maximum membership.");

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
