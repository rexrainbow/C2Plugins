function GetPluginSettings()
{
	return {
		"name":			"Inst Group",
		"id":			"Rex_gInstGroup",
		"description":	"Set/list of instances stored by uid",
		"author":		"Rex.Rainbow",
		"help url":		"",
		"category":		"Data & Storage",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Name", "Sorting function name.", '""');
AddCondition(1, cf_trigger, "On sorting", "List: Sort", 
             "On sorting function <i>{0}</i>", "Triggered when sorting by function.", "OnSortingFn");
AddStringParam("Name", "Group name.", '""');
AddCondition(2, cf_looping | cf_not_invertible, "For each UID", "List", 
             "For each UID in group <i>{0}</i>", "Repeat the event for each UID in a group.", "ForEachUID");

//////////////////////////////////////////////////////////////
// Actions      
AddStringParam("Name", "Group name.", '""');
AddAction(1, 0, "Clean group", "Group", "Clean group <i>{0}</i>", 
          "Clean group to empty.", "Clean");
AddStringParam("Name", "Group A.", '""');
AddStringParam("Name", "Group result.", '""');
AddAction(2, 0, "Copy", "Group", "Copy group <i>{0}</i> to group <i>{1}</i>", 
          "Copy group to another group.", "Copy");   
AddObjectParam("Instances", "Instances to be added into group.");
AddStringParam("Name", "Group name.", '""');
AddAction(6, 0, "Add instances", "Instance: Add", "Add <i>{0}</i> into group <i>{1}</i>", 
          "Add instances into group.", "PushInsts");
AddNumberParam("UID", "The UID of instance to be added into group.", 0);
AddStringParam("Name", "Group name.", '""');
AddAction(7, 0, "Add instances by UID", "Instance: Add", "Add instance UID:<i>{0}</i> into group <i>{1}</i>", 
          "Add instances into group by UID.", "PushInst");          
AddObjectParam("Instances", "Instances to be removed from group.");
AddStringParam("Name", "Group name.", '""');
AddAction(8, 0, "Remove instances", "Instance: Reomve", "Remove <i>{0}</i> from group <i>{1}</i>", 
          "Remove instances from group.", "RemoveInsts"); 
AddNumberParam("UID", "The UID of instance to be removed from group.", 0);
AddStringParam("Name", "Group name.", '""');
AddAction(9, 0, "Remove instances by UID", "Instance: Reomve", "Remove instance UID:<i>{0}</i> from group <i>{1}</i>", 
          "Remove instances from group by UID.", "RemoveInst");
AddStringParam("Name", "Group A.", '""');
AddStringParam("Name", "Group B.", '""');
AddStringParam("Name", "Group result.", '""');
AddAction(10, 0, "Union", "Group: Set operation", "Set group <i>{2}</i> to group <i>{0}</i> union group <i>{1}</i>", 
          "Set group by Union operation.", "Union");        
AddStringParam("Name", "Group A.", '""');
AddStringParam("Name", "Group B.", '""');
AddStringParam("Name", "Group result.", '""');
AddAction(11, 0, "Complement", "Group: Set operation", "Set group <i>{2}</i> to group <i>{0}</i> complement group <i>{1}</i>", 
          "Set group by complement operation.", "Complement");  
AddStringParam("Name", "Group A.", '""');
AddStringParam("Name", "Group B.", '""');
AddStringParam("Name", "Group result.", '""');
AddAction(12, 0, "Intersection", "Group: Set operation", "Set group <i>{2}</i> to group <i>{0}</i> intersection group <i>{1}</i>", 
          "Set group by intersection operation.", "Intersection");            
AddStringParam("Name", "Group name.", '""');
AddAction(13, 0, "Shuffe", "List: Sort", "Shuffe group <i>{0}</i>", 
          "Shuffe group.", "Shuffle"); 
AddStringParam("Name", "Group name.", '""');
AddStringParam("Sorting function", "Sorting function of group", '""');
AddAction(14, 0, "Sort group by function", "List: Sort", "Sort group <i>{0}</i> by function <i>{1}</i>", 
          "Sort group by function.", "SortByFn"); 
AddNumberParam("Result", "Compared result. (-1) is (A < B), 0 is (A == B), 1 is (A > B)", 0);
AddAction(15, 0, "Set compared result by number", "List: Sort function", "Set compare result to <i>{0}</i>", 
          'Set compared result. Used in callback of "Action: Sort group by function"', "SetCmpResultDirectly");
AddComboParamOption("<");
AddComboParamOption("=");
AddComboParamOption(">");
AddComboParam("Result", "Compared result", 0);   
AddAction(16, 0, "Set compared result", "List: Sort function", "Set compare result to CmpUIDA <i>{0}</i> CmpUIDB", 
          'Set compared result. Used in callback of "Action: Sort group by function"', "SetCmpResultCombo");                              
AddStringParam("Name", "Group name.", '""');          
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Keep");
AddComboParamOption("Pop");
AddComboParam("Operation", "Keep or pop UID", 0);
AddAction(17, 0, "Pick instances", "SOL", 
          "Pick and <i>{2}</i> <i>{0}</i> from group <i>{1}</i>", "Pick instances from group.", "PickInsts");    

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, 
              "Get UID A of sorting function", "List: Sort function", "CmpUIDA", 'Get Instance UID A of sorting function. Used in "Action: Sort group by function"');
AddExpression(2, ef_return_number, 
              "Get UID B of sorting function", "List: Sort function", "CmpUIDB", 'Get Instance UID B of sorting function. Used in "Action: Sort group by function"');              
AddExpression(4, ef_return_number | ef_variadic_parameters, 
              "Get item count", "Group", "InstCnt", "Get item count of group.");
AddExpression(5, ef_return_number | ef_variadic_parameters,
              'Get UID from "For each"', "List", "ForEachUID", 'Get UID in a group. Used in "Condition:For each UID"');                         


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
