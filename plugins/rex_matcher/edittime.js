function GetPluginSettings()
{
	return {
		"name":			"Matcher",
		"id":			"Rex_Matcher",
		"version":		"0.1",   		
		"description":	"Get tiles with matched patterns.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_matcher.html",
		"category":		"Rex - Board - application",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On get symbol", "Symbol", 
             "On get symbol", 'Get symbol of a tile.', "OnGetSymbol");
AddStringParam("Pattern", 'Pattern. It could splitted by ",".', '""');
AddCondition(2, cf_deprecated | cf_trigger, "On 1d pattern", "Get matched tiles: 1D Patern", 
             "On 1d pattern <i>{0}</i> matched", 'Trigger by "Action:Get matched tiles" when 1d pattern matched.', "OnMatchPattern");    
AddCondition(3, cf_deprecated | cf_trigger, "On no pattern", "Get matched tiles: No matched", 
             "On no pattern matched", 'Trigger by "Action:Get matched tiles" when no pattern matched.', "OnNoMatchPattern");    
AddStringParam("Pattern", 'Pattern, splitted by ","', '""');
AddCondition(4, cf_deprecated | cf_trigger, "On 2D pattern", "Get matched tiles: 2D Patern", 
             "On 2D pattern <i>{0}</i> matched", 
			 'Trigger by "Action:Get matched tiles with 2d pattern" when 2D pattern matched.', "OnMatchPattern2D");    
AddNumberParam("Count", "Continuous symbols count.", 3);
AddCondition(5, cf_deprecated | cf_trigger, "On N symbols", "Get matched tiles: 1D Patern", 
             "On <i>{0}</i> continuous symbols matched", 
             'Trigger by "Action:Get matched tiles" when N continuous symbols matched.', "OnMatchPattern");
AddStringParam("Template", 'Pattern template, splitted by ",".', '""');
AddCondition(6, cf_deprecated | cf_trigger, "On 2D template pattern", "Get matched tiles: 2D Patern", 
             "On 2D template pattern <i>{0}</i> matched", 
			 'Trigger by "Action:Get matched tiles with 2d pattern" when 2D template pattern matched.', "OnMatchTemplatePattern2D");			 
AddCondition(7, 0, "No pattern" , "If: No matched", 
             "Has no matched pattern", 'Return true if no matched pattern in latest "action:Get matched tiles".', "HasNoMatchPattern");
// any
AddStringParam("Pattern", 'Pattern. It could splitted by ",".', '""');
AddStringParam("Group", "Put result in this group", '""');
AddCondition(8, 0, "Any 1d pattern ", "Any: 1D Patern", 
             "Has any 1d pattern <i>{0}</i> matched, put result in group <i>{1}</i>", 
			 'Return true if there has any 1d pattern matched. Put 1 matched result into group if found.', 
			 "AnyMatchPattern");   
AddNumberParam("Count", "Continuous symbols count.", 3);
AddStringParam("Group", "Put result in this group", '""');
AddCondition(9, 0, "Any N symbols", "Any: 1D Patern", 
             "Has any <i>{0}</i> continuous symbols matched, put result in group <i>{1}</i>", 
			 'Return true if there has any N continuous symbols matched. Put 1 matched result into group if found.', 
			 "AnyMatchPattern");
AddStringParam("Pattern", 'Pattern, splitted by ","', '""');
AddStringParam("Group", "Put result in this group", '""');
AddCondition(10, 0, "Any 2D pattern", "Any: 2D Patern", 
             "Has any 2D pattern <i>{0}</i> matched, put result in group <i>{1}</i>", 
			 'Return true if there has any 2d pattern matched. Put 1 matched result into group if found.', 
			 "AnyMatchPattern2D");   
AddStringParam("Template", 'Pattern template, splitted by ",".', '""');
AddStringParam("Group", "Put result in this group", '""');
AddCondition(11, 0, "Any 2D template pattern", "Any: 2D Patern", 
             "Has any 2D template pattern <i>{0}</i> matched, put result in group <i>{1}</i>", 
			 'Return true if there has any 2d template pattern matched. Put 1 matched result into group if found.', 
			 "AnyMatchTemplatePattern2D");	
			 
// for each			 
AddStringParam("Pattern", 'Pattern. It could splitted by ",".', '""');
AddStringParam("Group", "Put result in this group", '""');
AddCondition(12, cf_looping | cf_not_invertible, "For each 1d pattern ", "For each: 1D Patern", 
             "For each 1d pattern <i>{0}</i>, put result in group <i>{1}</i>", 
			 'Repeat the event for each 1d pattern matched.', "ForEachMatchPattern");   
AddNumberParam("Count", "Continuous symbols count.", 3);
AddStringParam("Group", "Put result in this group", '""');
AddCondition(13, cf_looping | cf_not_invertible, "For each N symbols", "For each: 1D Patern", 
             "For each <i>{0}</i> continuous symbols, put result in group <i>{1}</i>", 
			 'Repeat the event for each N continuous symbols matched.', "ForEachMatchPattern");
AddStringParam("Pattern", 'Pattern, splitted by ","', '""');
AddStringParam("Group", "Put result in this group", '""');
AddCondition(14, cf_looping | cf_not_invertible, "For each 2D pattern", "For each: 2D Patern", 
             "For each 2D pattern <i>{0}</i>, put result in group <i>{1}</i>", 
			 'Repeat the event for each 2d pattern matched.', "ForEachMatchPattern2D");   
AddStringParam("Template", 'Pattern template, splitted by ",".', '""');
AddStringParam("Group", "Put result in this group", '""');
AddCondition(15, cf_looping | cf_not_invertible, "For each 2D template pattern", "For each: 2D Patern", 
             "For each 2D template pattern <i>{0}</i>, put result in group <i>{1}</i>", 
			 'Repeat the event for each 2d template pattern matched.', "ForEachMatchTemplatePattern2D");
// match direction
AddComboParamOption("Horizontal");
AddComboParamOption("Vertical");
AddComboParamOption("Isometric");
AddComboParam("Axis", "Matched axis.",0);
AddCondition(21, 0, "Matched axis (Square)" , "Matched axis", 
             "Matched at <i>{0}</i> axis", 
             'Return true if matched at specifics axis, used under "condition: On N symbols", or "condition: On 1d pattern".', "IsMatchAxisSquare");
AddNumberParam("Axis", "Axis index, in 0,1,2.", 0);
AddCondition(22, 0, "Matched axis (Hex)" , "Matched axis", 
             "Matched at <i>{0}</i> axis", 
             'Return true if matched at specifics axis, used under "condition: On N symbols", or "condition: On 1d pattern".', "IsMatchAxisHex");             
//////////////////////////////////////////////////////////////
// Actions     
AddObjectParam("Board", "Board object");
AddObjectParam("Group", "Instance group object");
AddAction(1, 0, "Setup", "Setup", 
          "Set board object to <i>{0}</i>, instance group object to <i>{1}</i>", 
          "Set board object and instance group object.", "Setup");         
AddStringParam("Group", "Put result in this group", '""');
AddAction(2, af_deprecated, "Get matched tiles", "Request: matched tiles", 
          "Get matched tiles to group <i>{0}</i>", 
          "Get matched tiles.", "GetMatchTiles");
AddStringParam("Symbol", 'Symbol. "" is null symbol.', "");
AddAction(3, 0, "Set symbol", "Request: Symbol", "Set symbol to <i>{0}</i>", 
          'Set symbol. Used in "Condition: On get symbol function".', "SetSymbol");          
AddStringParam("Group", "Put result in this group", '""');
AddAction(4, af_deprecated, "Get matched tiles with 2d pattern", "Request: matched tiles (2d pattern)", 
          "Get matched tiles to group <i>{0}</i> with 2d pattern", 
          "Get matched tiles with 2d pattern.", "GetMatchTiles2D");
AddAction(5, 0, "Update all", "Symbol array: force update", 
          "Force updating symbol array", 
          "Force updating symbol array.", "ForceUpdaeSymbolArray");
          
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
AddNumberParam("Logic X", "The X index (0-based) of the chess.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess.", 0);
AddAction(13, 0, "Update cell by LXY", "Symbol array: force update", 
          "Force updating symbol at (<i>{0}</i>, <i>{1}</i>)", 
          "Force updating symbol at logical XY.", "ForceUpdaeCellByLXY");	
AddObjectParam("Tile", "Tile object."); 
AddAction(14, 0, "Update cell by chess", "Symbol array: force update", 
          "Force updating symbol at <i>{0}</i>", 
          "Force updating symbol at tile.", "ForceUpdaeCellByTile");          
AddAnyTypeParam("UID", "The UID of chess", 0);
AddAction(15, 0, "Update cell by chess uid", "Symbol array: force update", 
          "Force updating symbol at UID: <i>{0}</i>", 
          "Force updating symbol at tile by UID.", "ForceUpdaeCellByTileUID");	         

AddStringParam("Wildcard", 'Wildcard symbol, Set to "" will ignore this feature.', '""');
AddAction(21, 0, "Set wildcard", "Wildcard", 
          "Set wildcard to <i>{0}</i>", 
          "Set wildcard symbol.", "SetWildcard");          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any,
              "Get UID of target tile", "Request", "TileUID",
              "Get UID of target tile.");
AddExpression(2, ef_return_number,
              "Get logic X of target tile", "Request", "TileX",
              "Get logic X of target tile.");
AddExpression(3, ef_return_number,
              "Get logic Y of target tile", "Request", "TileY",
              "Get logic Y of target tile.");
AddExpression(4, ef_return_string,
              "Value of NOSYMBOL", "Symbol", "NOSYMBOL",
              "Get value of NOSYMBOL.");                            
AddExpression(5, ef_return_string,
              "Value of wildcard symbol", "Symbol", "Wildcard",
              "Get value of wildcard symbol.");

AddNumberParam("Logic X", "The X index (0-based) of the chess.", 0);
AddNumberParam("Logic Y", "The Y index (0-based) of the chess.", 0);              
AddExpression(6, ef_return_string,
              "Get symobl on LXY", "Symbol", "LXY2Symbol",
              "Get symobl on logic X ,Y.");              

AddAnyTypeParam("UID", "The UID of chess", 0);          
AddExpression(7, ef_return_string,
              "Get symobl by chess UID", "Symbol", "UID2Symbol",
              "Get symobl by tile/chess UID.");      
    
AddExpression(8, ef_return_string,
              "Get matched symobl", "Request", "MatchedSymbol",
              'Get matched symobl under "Condition:On N symbols", or "Condition:On 2D template pattern".');
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_section, "Axis of square board", "",	
                    "The axis to get symbol for 1d pattern matched on square board. Ignored it when using hex board"),
    new cr.Property(ept_combo, "Horizontal", "Yes", "Compare at horizontal axis", "No|Yes"),   
    new cr.Property(ept_combo, "Vertical", "Yes", "Compare at vertical axis", "No|Yes"),   
    new cr.Property(ept_combo, "Isometric", "Yes", "Compare at isometric axis", "No|Yes"),    
    new cr.Property(ept_combo, "Update symbols", "Auto", "Auto or manual update symbol table", "Manual|Auto"), 	
    new cr.Property(ept_text, "Wildcard", "", 'Wildcard symbol. Set to "" will ignore this feature.'),	
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
