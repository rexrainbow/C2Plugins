function GetPluginSettings()
{
	return {
		"name":			"Grid freezer",
		"id":			"Rex_GridFreezer",
		"version":		"0.1",        
		"description":	"Save/load instances with grids.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_gridfreeze.html",
		"category":		"Rex - Save-load",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Object", "Object type."); 
AddCondition(1,	cf_trigger, "On save", "Save", 
             "On save <i>{0}</i>", 
			 "Triggered when save object into grid.", "OnSave");
			 
AddCondition(2,	cf_trigger, "On load", "Load", 
             "On load", 
			 "Triggered when load object from grid.", "OnLoad");  

AddCondition(103, cf_looping | cf_not_invertible, "For each masked LXY", "Masked area", 
             "For each masked LXY", 
             "Repeat the event for each logic position of masked area.", "ForEachMask");			 
//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.");
AddAction(0, 0, "Set enabled", "Enable", "Set freezer <b>{0}</b>", "Set whether this object is enabled.", "SetEnabled");	

AddAction(1, 0, "Clean", "Define mask", 
          "Clean mask", 
          "Clean mask.", "CleanMask");

AddNumberParam("Left-top X", "Logical X position of Left-top point related by origin point.", -2);   
AddNumberParam("Left-top Y", "Logical Y position of Left-top point related by origin point.", -2); 
AddNumberParam("Width", "Witdh of area.", 5);   
AddNumberParam("Height", "Height of area.", 5);  
AddAction(2, 0, "Fill a rectangle", "Define mask", 
          "Fill a rectangle mask at offset to [<i>{0}</i>, <i>{1}</i>], width to <i>{2}</i>, height to <i>{3}</i>",
          "Fill a rectangle mask.", "FillRectangleMask");
          
AddNumberParam("Range", "Range of filled.", 3);
AddAction(5, 0, "Flood fill", "Define mask", 
          "Flood fill in a range to <i>{0}</i>",
          "Flood fill the mask. This action need to have rex_SquareTx or rex_HexTx object.", "FloodFillMask");   
                    
AddAction(21, 0, "Clean", "Masked area", 
          "Clean masked area", 
          "Clean Masked area.", "CleanMaskedArea");  

AddObjectParam("Layout", "Layout to get neighbors");
AddAction(51, 0, "Setup layout", "Setup", 
          "Set layout to <i>{0}</i>", 
          "Setup layout for flood filling.", "SetupLayout");                              

AddNumberParam("X", "The physical X position of origin point.");
AddNumberParam("Y", "The physical Y position of origin point.");        
AddAction(61, 0, "Put mask", "Put", 
          "Put mask at physical position (<i>{0}</i>, <i>{1}</i>)",
          "Put mask at physical position.", "PutMask");
                              
AddObjectParam("Object", "Object type."); 
AddAction(62, 0, "Add object to target", "Target", 
          "Add target <i>{0}</i>", 
          "Add an object or family to target automatically.", "AddTarget");
           
AddAction(63, 0, "Save all", "Save", 
          "Save all target instances into grids",
          "Save all target instances into grids.", "SaveAll");  

AddStringParam("Grids data", "Grids data exported before.");
AddAction(64, 0, "Import grids", "Import", "Import grids data <i>{0}</i>", "Import grids data.", "ImportGridData");

AddAnyTypeParam("Index", "Index of extra data, can be number of string", 0);
AddAnyTypeParam("Value", "Value of extra data", 0);
AddAction(65, 0, "Set extra data", "Extra data", 
          "Set extra data [<i>{0}</i>] to <i>{1}</i>", 
          'Set extra data. Used in "condition:On save".', 
          "SetExtraData");
          
AddAnyTypeParam("Index", "Index of extra data, can be number of string", 0);
AddAnyTypeParam("Value", "Value of extra data", 0);
AddAction(66, 0, "Set global data", "Global data", 
          "Set global data [<i>{0}</i>] to <i>{1}</i>", 
          'Set global data.', 
          "SetGlobalData");        

AddAction(101, 0, "Load all instances", "Load", 
          "Load all instances", 
          "Load all instances.", "LoadAll");          
		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get grids data", "Export", "GridData", "Export the grids data.");
// AddAnyTypeParam("Index", "Index of extra data, can be number of string", 0);
AddExpression(2, ef_return_any | ef_variadic_parameters, 
              "Get extra data", "Extra data", "ExtraData", 
              'Get extra data. Used in "condition:On load". Add 1st parameter for key, add 2nd parameter for default value.');
AddExpression(3, ef_return_number, "Get instance UID", "Load", "LoadInstUID", 'Get UID of current loaded instance. Used in "condition:On load".');
// AddAnyTypeParam("Index", "Index of extra data, can be number of string", 0);
AddExpression(4, ef_return_any | ef_variadic_parameters, 
              "Get global data", "Global data", "GlobalData", 
              'Get global data. Used in "condition:On load". Add 1st parameter for key, add 2nd parameter for default value.');
  
AddExpression(101, ef_return_number, "Current Logical X ", "For each", "CurLX", 
              "Current Logical X in a For Each loop.");   			  
AddExpression(102, ef_return_number, "Current Logical Y ", "For each", "CurLY",
              "Current Logical Y in a For Each loop.");
AddExpression(121, ef_return_number, "Current Physical X ", "For each", "CurPX", 
              "Current Physical X in a For Each loop.");   			  
AddExpression(122, ef_return_number, "Current Physical Y ", "For each", "CurPY",
              "Current Physical Y in a For Each loop.");
			  
ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Initial state", "Enabled", "Whether to initially have the object enabled or disabled.", "Disabled|Enabled"),
	new cr.Property(ept_combo, "Save mode", "All properties", "Save all properties of each instance, or save it manually.", "All properties|Manual"),	
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
