function GetPluginSettings()
{
	return {
		"name":			"Matcher",
		"id":			"Rex_Matcher",
		"version":		"0.1",   		
		"description":	"Logic of matched game. Could be used in square or hex board.",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Game logic",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get symbol", "Symbol", 
             "On get symbol", 'Trigger by "Action:Get matched tiles" to get symbol.', "OnGetSymbol");
AddStringParam("Pattern", "Pattern.", '""');
AddCondition(2, cf_trigger, "On 1d pattern ", "1D Patern", 
             "On 1d pattern <i>{0}</i> matched", 'Trigger by "Action:Get matched tiles" when 1d pattern matched.', "OnMatchPattern");    
AddCondition(3, cf_trigger, "On no pattern", "No matched", 
             "On no pattern matched", 'Trigger by "Action:Get matched tiles" when no pattern matched.', "OnNoMatchPattern");    
AddStringParam("Pattern", "Pattern.", '""');
AddCondition(4, cf_trigger, "On 2D pattern", "2D Patern", 
             "On 2D pattern <i>{0}</i> matched", 'Trigger by "Action:Get matched tiles with 2d pattern" when 2D pattern matched.', "OnMatchPattern2D");    
AddNumberParam("Count", "Continuous symbols count.", 3);
AddCondition(5, cf_trigger, "On N symbols", "1D Patern", 
             "On <i>{0}</i> continuous symbols matched", 
             'Trigger by "Action:Get matched tiles" when N continuous symbols matched.', "OnMatchPattern");
AddStringParam("Template", "Pattern template.", '""');
AddCondition(6, cf_trigger, "On 2D template pattern", "2D Patern", 
             "On 2D template pattern <i>{0}</i> matched", 'Trigger by "Action:Get matched tiles with 2d pattern" when 2D template pattern matched.', "OnMatchTemplatePattern2D");			 
AddCondition(7, 0, "No pattern" , "No matched", 
             "Has no matched pattern", 'Return true if no matched pattern in lastest "action:Get matched tiles".', "HasNoMatchPattern");
AddStringParam("Pattern", "Pattern.", '""');
AddCondition(8, 0, "Any 1d pattern ", "1D Patern", 
             "Has any 1d pattern <i>{0}</i> matched", 'Return true if there has any 1d pattern matched.', "AnyMatchPattern");   
AddNumberParam("Pattern", "Pattern.", '""');
AddCondition(9, 0, "Any N symbols", "1D Patern", 
             "Has any <i>{0}</i>  continuous symbols matched", 'Return true if there has any N continuous symbols matched.', "AnyMatchPattern");
AddStringParam("Pattern", "Pattern.", '""');
AddCondition(10, 0, "Any 2D pattern", "2D Patern", 
             "Has any 2D pattern <i>{0}</i> matched", 'Return true if there has any 2d pattern matched.', "AnyMatchPattern2D");   
AddStringParam("Template", "Pattern template.", '""');
AddCondition(11, 0, "Any 2D template pattern", "2D Patern", 
             "Has any 2D template pattern <i>{0}</i> matched", 'Return true if there has any 2d template pattern matched.', "AnyMatchTemplatePattern2D");			 
			 
//////////////////////////////////////////////////////////////
// Actions     
AddObjectParam("Board", "Board object");
AddObjectParam("Group", "Instance group object");
AddAction(1, 0, "Setup", "0: Setup", 
          "Set board object to <i>{0}</i>, instance group object to <i>{1}</i>", 
          "Set board object and instance group object.", "Setup");         
AddStringParam("Group", "Put result in this group", '""');
AddAction(2, 0, "Get matched tiles", "Request: matched tiles", 
          "Get matched tiles to group <i>{0}</i>", 
          "Get matched tiles.", "GetMatchTiles");
AddStringParam("Symbols", 'Symbol. "" is null symbol.', "");
AddAction(3, 0, "Set symbols", "Request: Symbol", "Set symbol to <i>{0}</i>", 
          'Set symbol. Used in "Condition: On get symbol function".', "SetSymbol");          
AddStringParam("Group", "Put result in this group", '""');
AddAction(4, 0, "Get matched tiles with 2d pattern", "Request: matched tiles (2d pattern)", 
          "Get matched tiles to group <i>{0}</i> with 2d pattern", 
          "Get matched tiles with 2d pattern.", "GetMatchTiles2D");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Horizontal", "Horizontal axis.",1);
AddAction(10, 0, "Compare at horizontal axis", "Square board", 
          "Compare at horizontal axis to <i>{0}</i>", 
          "Enable the Comparing at horizontal axis.", "SetHorizontalAxisEnable");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Vertical", "Vertical axis.",1);
AddAction(11, 0, "Compare at vertical axis", "Square board", 
          "Compare at vertical axis to <i>{0}</i>", 
          "Enable the Comparing at vertical axis.", "SetVerticalAxisEnable"); 
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Isometric", "Isometric axis.",1);
AddAction(12, 0, "Compare at isometric axis", "Square board", 
          "Compare at isometric axis to <i>{0}</i>", 
          "Enable the Comparing at isometric axis.", "SetIsometricAxisEnable");   
                  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Get UID of target tile", "Request", "TileUID",
              "Get UID of target tile.");
AddExpression(2, ef_return_number,
              "Get logic X of target tile", "Request", "TileX",
              "Get logic X of target tile.");
AddExpression(3, ef_return_number,
              "Get logic Y of target tile", "Request", "TileY",
              "Get logic Y of target tile.");              

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Axis of square board", "",	
                    "The axis to get symbol for 1d pattern matched on square board. Ignored it when using hex board"),
    new cr.Property(ept_combo, "Horizontal", "Yes", "Compare at horizontal axis", "No|Yes"),   
    new cr.Property(ept_combo, "Vertical", "Yes", "Compare at vertical axis", "No|Yes"),   
    new cr.Property(ept_combo, "Isometric", "Yes", "Compare at isometric axis", "No|Yes"),         
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
