function GetPluginSettings()
{
	return {
		"name":			"Z Sorter",
		"id":			"Rex_ZSorter",
		"version":		"1.0",
		"description":	"Sorts Objects in Layer By Y",
		"author":		"Juan Pablo Tarquino",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_zSorter.html",
		"category":		"Rex - Layer/layout",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

////////////////////////////////////////
// Conditions
AddStringParam("Name", "Sorting function name.", '""');
AddCondition(1, cf_trigger, "On sorting", "Custom sorting: sorting function", 
             "On sorting function <i>{0}</i>", "Triggered when sorting by function.", "OnSortingFn");
             
////////////////////////////////////////
// Actions
AddLayerParam("Layer", "Layer name of number.");
AddAction(0, 0, "Sort all Objects in layer by Y", "Default sorting", 
          "Sort all Objects in Layer <i>{0}</i> by Y", "Sort All Objects in Layer By Y", "SortObjsLayerByY");
AddComboParamOption("Increasing");
AddComboParamOption("Decreasing");
AddComboParam("X order", "Sorting order of x co-ordinate.", 0);   
AddAction(1, 0, "Set X order", "Default sorting", "Set sorting order of x co-ordinate to <i>{0}</i>", 
          "Set sorting order of x co-ordinate.", "SetXorder");
AddLayerParam("Layer", "Layer name of number.");
AddStringParam("Sorting function", "Sorting function", '""');
AddAction(2, 0, "Sort by function", "Custom sorting", "Sort all objects in layer <i>{0}</i> by function <i>{1}</i>", 
          "Sort z order by function.", "SortByFn");     
AddNumberParam("Result", "Compared result. (-1) is (A < B), 0 is (A == B), 1 is (A > B)", 0);
AddAction(3, 0, "Set compared result by number", "Custom sorting: result", "Set compare result to <i>{0}</i>", 
          'Set compared result. Used in callback of "Action: Sort by function"', "SetCmpResultDirectly");
AddComboParamOption("<");
AddComboParamOption("=");
AddComboParamOption(">");
AddComboParam("Result", "Compared result", 0);   
AddAction(4, 0, "Set compared result", "Custom sorting: result", "Set compare result to CmpUIDA <i>{0}</i> CmpUIDB", 
          'Set compared result. Used in callback of "Action: Sort group by function"', "SetCmpResultCombo");           
AddComboParamOption("Increasing");
AddComboParamOption("Decreasing");
AddComboParam("Y order", "Sorting order of y co-ordinate.", 0);   
AddAction(5, 0, "Set Y order", "Default sorting", "Set sorting order of y co-ordinate to <i>{0}</i>", 
          "Set sorting order of y co-ordinate.", "SetYorder");          
  
AddNumberParam("UID A", "UID of instance A", 0);
AddComboParamOption("in front");
AddComboParamOption("behind");
AddComboParam("Place", "Place", 0);
AddNumberParam("UID B", "UID of instance B", 0);          
AddAction(11, 0, "Move to object", "Z Order", 
          "Move instance UID: <i>{0}</i> <i>{1}</i> instance UID: <i>{2}</i>", 
          "Move the object next to another object in the Z order.", "ZMoveToObject");            
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, 
              "Get UID A of sorting function", "Custom sorting", "CmpUIDA", 'Get Instance UID A of sorting function. Used in "Action: Sort by function"');
AddExpression(2, ef_return_number, 
              "Get UID B of sorting function", "Custom sorting", "CmpUIDB", 'Get Instance UID B of sorting function. Used in "Action: Sort by function"');   
              
ACESDone();

var property_list = [
    new cr.Property(ept_combo, "Y order", "Increasing", "Sorting order of y co-ordinate.", "Increasing|Decreasing"),
    new cr.Property(ept_combo, "X order", "Increasing", "Sorting order of x co-ordinate.", "Increasing|Decreasing")
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
	return new IDEInstance(instance);
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
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}