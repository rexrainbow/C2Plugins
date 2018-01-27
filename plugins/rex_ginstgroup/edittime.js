function GetPluginSettings()
{
	return {
		"name":			"Inst Group",
		"id":			"Rex_gInstGroup",
		"version":		"1.0",         
		"description":	"A set/list to store instances by uid",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ginstgroup.html",
		"category":		"Rex - Data structure",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Function", "Mapping function name.", '""');
AddCondition(0, cf_trigger, "On mapping", "Mapping function", 
             "On mapping function <i>{0}</i>", "Triggered it to get mapping result.", "OnMappingFn");
             
AddStringParam("Function", "Sorting function name.", '""');
AddCondition(1, cf_trigger, "On sorting", "List: Sort", 
             "On sorting function <i>{0}</i>", "Triggered when sorting by function.", "OnSortingFn");
AddStringParam("Variable", "Variable name to store UID.", '""');
AddStringParam("Group", "Group name.", '""');
AddCondition(2, cf_looping | cf_not_invertible, "For each UID", "List", 
             "For Item<i>{0}</i> in group <i>{1}</i>", "Repeat the event for each UID in a group.", "ForEachUID");
AddStringParam("Group", "Group name.", '""');          
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Keep");
AddComboParamOption("Pop");
AddComboParam("Operation", "Keep or pop", 0);
AddCondition(3, cf_not_invertible, "Pick instances", "SOL", 
             "Pick and <i>{2}</i> <i>{1}</i> from group <i>{0}</i>", "Pick instances from group.", "Group2Insts");
AddAnyTypeParam("UID", "The UID of instance to be tested.", 0);
AddStringParam("Group", "Group name.", '""');
AddCondition(4, 0, "UID in group", "Group", 
             "Instance UID:<i>{0}</i> in group <i>{1}</i>", "Testing if UID is in a group.", "IsInGroup");
AddStringParam("Group", "Group name.", '""');
AddCondition(5, 0, "Empty", "Group", 
             "Group <i>{0}</i> is empty", "Testing if group is empty.", "IsEmpty");
AddStringParam("Group", "Group name.", '""'); 
AddNumberParam("Index", "Pop index.", 0);
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Get");
AddComboParamOption("Pop");
AddComboParam("Operation", "Get or pop", 1);
AddCondition(6, cf_not_invertible, "Pop one instance", "SOL: List", "<i>{3}</i> one instance <i>{2}</i> from group <i>{0}</i>[<i>{1}</i>]", 
             "Get or pop one instance from group.", "PopInst");             
AddStringParam("Subset", "Group name.", '""'); 
AddStringParam("Main set", "Group name.", '""'); 
AddCondition(7, 0, "Is a subset", "Group: Set operation", "<i>{0}</i> is a subset of <i>{1}</i>", 
             "Test if group is a subset of another group.", "IsSubset");    
AddStringParam("Group", "Group name.", '""'); 
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Get");
AddComboParamOption("Pop");
AddComboParam("Operation", "Get or pop", 1);
AddCondition(8, cf_not_invertible, "Pop random instance", "SOL: List", 
             "<i>{2}</i> random instance <i>{1}</i> from group <i>{0}</i>", 
             "Get or pop one random instance from group.", "RandomPopInstance");          
AddStringParam("Group", "Group name.", '""');          
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Keep");
AddComboParamOption("Pop");
AddComboParam("Operation", "Keep or pop", 0);
AddStringParam("Mapping", "Function name of mapping.", '""');
AddComboParamOption("minimum");
AddComboParamOption("maximum");
AddComboParam("Value type", "Minimum or maximim", 0);
AddCondition(9, cf_not_invertible, "Pop by mapping result", "SOL - Mapping function", 
             "<i>{2}</i> <i>{1}</i> from group <i>{0}</i> by <i>{4}</i> result of mapping function <i>{3}</i>", 
             "Get or pop one instance from group by the result of mapping function.", "PopInstByMappingFunction");             
//////////////////////////////////////////////////////////////
// Actions
AddAction(0, 0, "Destroy all", "Group", "Destroy all groups", 
          "Destroy all groups.", "DestroyAll");      
AddStringParam("Group", "Group name.", '""');
AddAction(1, 0, "Clean group", "Group", "Clean group <i>{0}</i>", 
          "Clean group to empty.", "Clean");
AddStringParam("Source", "Group A.", '""');
AddStringParam("Target", "Group result.", '""');
AddAction(2, 0, "Copy", "Group", "Copy group <i>{0}</i> to group <i>{1}</i>", 
          "Copy group to another group.", "Copy");  
AddStringParam("JSON string", "JSON string.", '""');
AddStringParam("Group", "Group A.", '""');
AddAction(3, 0, "Load group", "Group: JSON", "Load group <i>{1}</i> to JSON string <i>{0}</i>", 
          "Load group from JSON string.", "String2Group");     
AddStringParam("JSON string", "JSON string.", '""');
AddAction(4, 0, "Load all", "Group: JSON", "Load all groups from JSON string <i>{1}</i>", 
          "Load all groups from JSON string.", "String2All");  
AddStringParam("Group", "Group name.", '""'); 
AddAction(5, 0, "Destroy group", "Group", 
          "Destroy <i>{0}</i>", 
          "Destroy group.", "DestroyGroup");                              
AddObjectParam("Instances", "Instances to be added into group.");
AddStringParam("Group", "Group name.", '""');
AddAction(6, 0, "Add instances", "Group: Add instances", "Add <i>{0}</i> into group <i>{1}</i>", 
          "Add instances into group.", "AddInsts");
AddAnyTypeParam("UID", "The UID of instance to be added into group.", 0);
AddStringParam("Group", "Group name.", '""');
AddAction(7, 0, "Add instances by UID", "Group: Add instances", "Add instance UID:<i>{0}</i> into group <i>{1}</i>", 
          "Add instances into group by UID.", "AddInstByUID");          
AddObjectParam("Instances", "Instances to be removed from group.");
AddStringParam("Group", "Group name.", '""');
AddAction(8, 0, "Remove instances", "Group: Reomve instances", "Remove <i>{0}</i> from group <i>{1}</i>", 
          "Remove instances from group.", "RemoveInsts"); 
AddAnyTypeParam("UID", "The UID of instance to be removed from group.", 0);
AddStringParam("Group", "Group name.", '""');
AddAction(9, 0, "Remove instances by UID", "Group: Reomve instances", "Remove instance UID:<i>{0}</i> from group <i>{1}</i>", 
          "Remove instances from group by UID.", "RemoveInst");
AddStringParam("A", "Group A.", '""');
AddStringParam("B", "Group B.", '""');
AddStringParam("Result", "Group result.", '""');
AddAction(10, 0, "A + B", "Group: Set operation", "Set group <i>{2}</i> to (group <i>{0}</i> + group <i>{1}</i>)", 
          "Set group by Union operation.", "Union");        
AddStringParam("A", "Group A.", '""');
AddStringParam("B", "Group B.", '""');
AddStringParam("Result", "Group result.", '""');
AddAction(11, 0, "A - B", "Group: Set operation", "Set group <i>{2}</i> to (group <i>{0}</i> - group <i>{1}</i>)", 
          "Set group by complement operation.", "Complement");  
AddStringParam("A", "Group A.", '""');
AddStringParam("B", "Group B.", '""');
AddStringParam("Result", "Group result.", '""');
AddAction(12, 0, "A AND B", "Group: Set operation", "Set group <i>{2}</i> to (group <i>{0}</i> AND group <i>{1}</i>)", 
          "Set group by intersection operation.", "Intersection");            
AddStringParam("Group", "Group name.", '""');
AddAction(13, 0, "Shuffle", "List: Sort", "Shuffle group <i>{0}</i>", 
          "Shuffle group.", "Shuffle"); 
AddStringParam("Group", "Group name.", '""');
AddStringParam("Sorting function", "Sorting function of group", '""');
AddAction(14, 0, "Sort by function", "List: Sort", "Sort group <i>{0}</i> by function <i>{1}</i>", 
          "Sort group by function.", "SortByFn"); 
AddNumberParam("Result", "Comparing result. (-1) is (A < B), 0 is (A == B), 1 is (A > B)", 0);
AddAction(15, 0, "Set comparing result by number", "List: Sort function", "Set compare result to <i>{0}</i>", 
          'Set comparing result. Used in callback of "Action: Sort group by function"', "SetCmpResultDirectly");
AddComboParamOption("<");
AddComboParamOption("=");
AddComboParamOption(">");
AddComboParam("Result", "Result", 0);   
AddAction(16, 0, "Set comparing result", "List: Sort function", "Set compare result to CmpUIDA <i>{0}</i> CmpUIDB", 
          'Set comparing result. Used in callback of "Action: Sort group by function"', "SetCmpResultCombo");                              
AddStringParam("Group", "Group name.", '""');          
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Keep");
AddComboParamOption("Pop");
AddComboParam("Operation", "Keep or pop UID", 0);
AddAction(17, 0, "Pick instances", "SOL: Group", 
          "Pick and <i>{2}</i> <i>{1}</i> from group <i>{0}</i>", "Pick instances from group.", "Group2Insts");    
AddStringParam("Group", "Group name.", '""');
AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParam("Order", "Order of UID.", 1);
AddAction(18, 0, "Sort by UID", "List: Sort", "Sort group <i>{0}</i> by UID <i>{1}</i>", 
          "Sort group by UID.", "SortByUID");
AddStringParam("Group", "Group name.", '""');
AddAction(19, af_deprecated, "Sort by UID decreasement", "List: Sort", "Sort group <i>{0}</i> by UID decreasement", 
          "Sort group by UID dec.", "SortByUIDDec"); 
AddStringParam("Group", "Group name.", '""');
AddAction(20, 0, "Reverse", "List", "Reverse group <i>{0}</i> order", 
          "Reverse group order.", "Reverse");                        
AddStringParam("Source", "Group A.", '""');
AddNumberParam("Start", "Start index.", 0);
AddNumberParam("End", "End index.", 1);
AddStringParam("Target", "Group result.", '""');
AddComboParamOption("Copy");
AddComboParamOption("Pop");
AddComboParam("Operation", "Copy or pop UID", 0);
AddAction(21, 0, "Slice", "List", "<i>{4}</i> group <i>{0}</i>[<i>{1}</i>:<i>{2}</i>] to group <i>{3}</i>", 
          "Copy or pop group slice to another group.", "Slice");
AddStringParam("Group", "Group name.", '""'); 
AddNumberParam("Index", "Pop index.", 0);
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Get");
AddComboParamOption("Pop");
AddComboParam("Operation", "Get or pop", 1);
AddAction(22, 0, "Pop one instance", "SOL: List", "<i>{3}</i> one instance <i>{2}</i> from group <i>{0}</i>[<i>{1}</i>]", 
          "Get or pop one instance from group.", "PopInst");
AddObjectParam("Random generator", "Random generator object");
AddAction(23, 0, "Set random generator", "Setup", 
          "Set random generator object to <i>{0}</i>", 
          "Set random generator object.", "SetRandomGenerator");
AddComboParamOption("back");
AddComboParamOption("front");
AddComboParam("Where", "Whether to insert at the beginning or the end of the group.");          
AddObjectParam("Instances", "Instances to be added into group.");
AddStringParam("Group", "Group name.", '""');
AddAction(24, 0, "Push instances", "List: Push & Insert", "Push <i>{0}</i> <i>{1}</i> into group <i>{2}</i>", 
          "Push instances into group.", "PushInsts");
AddComboParamOption("back");
AddComboParamOption("front");
AddComboParam("Where", "Whether to insert at the beginning or the end of the group.");            
AddAnyTypeParam("UID", "The UID of instance to be added into group.", 0);
AddStringParam("Group", "Group name.", '""');
AddAction(25, 0, "Push instance by UID", "List: Push & Insert", "Push <i>{0}</i> instance UID:<i>{1}</i> into group <i>{2}</i>", 
          "Push instances into group.", "PushInstByUID");       
AddObjectParam("Instances", "Instances to be added into group.");
AddStringParam("Group", "Group name.", '""');
AddNumberParam("Index", "The zero-based index to insert to.");
AddAction(26, 0, "Insert instances", "List: Push & Insert", "Insert <i>{0}</i> into group <i>{1}</i> at index <i>{2}</i>", 
          "Insert instances into group.", "InsertInsts");          
AddAnyTypeParam("UID", "The UID of instance to be added into group.", 0);
AddStringParam("Group", "Group name.", '""');
AddNumberParam("Index", "The zero-based index to insert to.");
AddAction(27, 0, "Insert instance by UID", "List: Push & Insert", "Insert instance UID:<i>{0}</i> into group <i>{1}</i> at index <i>{2}</i>", 
          "Insert instances into group.", "InsertInstByUID");
AddObjectParam("Instances", "Instances to be set into group.");
AddStringParam("Group", "Group name.", '""');
AddAction(28, 0, "Clean & Add instances", "Group: Add instances", "Clean and Add <i>{0}</i> into group <i>{1}</i>", 
          "Clean and Add instances into group.", "CleanAdddInsts");
AddAnyTypeParam("UID", "The UID of instance to be added into group.", 0);
AddStringParam("Group", "Group name.", '""');
AddAction(29, 0, "Clean & Add instance by UID", "Group: Add instances", "Clean and Add instance UID: <i>{0}</i> into group <i>{1}</i>", 
          "Clean and Add instances into group.", "CleanAdddInstByUID");
AddStringParam("Group", "Group name.", '""'); 
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Get");
AddComboParamOption("Pop");
AddComboParam("Operation", "Get or pop", 1);
AddAction(30, 0, "Pop random instance", "SOL: List", "<i>{2}</i> random instance <i>{1}</i> from group <i>{0}</i>", 
             "Get or pop one random instance from group.", "RandomPopInstance");

AddAnyTypeParam("Result", "Mapping result.", 0);
AddAction(31, 0, "Set mapping result", "Mapping function", 
          "Set mapping result to <i>{0}</i>", 
          'Set mapping result. Used under callback "Condition:On mapping"', "SetMappingResult");  
AddStringParam("Group", "Group name.", '""');          
AddObjectParam("Object", "Object for picking");
AddComboParamOption("Keep");
AddComboParamOption("Pop");
AddComboParam("Operation", "Keep or pop", 0);
AddStringParam("Mapping", "Function name of mapping.", '""');
AddComboParamOption("minimum");
AddComboParamOption("maximum");
AddComboParam("Value type", "Minimum or maximim", 0);
AddAction(32, cf_not_invertible, "Pop by mapping result", "SOL - Mapping function", 
             "<i>{2}</i> <i>{1}</i> from group <i>{0}</i> by <i>{4}</i> result of mapping function <i>{3}</i>", 
             "Get or pop one instance from group by the result of mapping function.", "PopInstByMappingFunction");        
AddStringParam("Group", "Group name.", '""');
AddStringParam("Mapping", "Function name of mapping.", '""');
AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParamOption("logical descending");
AddComboParamOption("logical ascending");
AddComboParam("Order", "Order of mapping result.", 1);
AddAction(33, 0, "Sort by mapping", "List: Sort - Mapping function", "Sort group <i>{0}</i> by <i>{2}</i> result of mapping function <i>{1}</i>", 
          "Sort group by the result of mapping function.", "SortByMappingFunction");     

AddStringParam("Group", "Group name.", '""');  
AddAction(41, 0, "Destroy instances", "Instance", 
          "Destroy instances in <i>{0}</i>", 
          "Destroy instances in group.", "DestroyInstanceInGroup");             
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_any, 
              "Get UID of mapping function", "Mapping function", "MapUID", 'Get Instance UID of mapping function. Used under callback "Condition:On mapping"');
              
AddExpression(1, ef_return_any, 
              "Get UID A of sorting function", "List: Sort function", "CmpUIDA", 'Get Instance UID A of sorting function. Used in "Action: Sort group by function"');

AddExpression(2, ef_return_any, 
              "Get UID B of sorting function", "List: Sort function", "CmpUIDB", 'Get Instance UID B of sorting function. Used in "Action: Sort group by function"');              

AddStringParam("Group", "Group name.", '""');
AddExpression(3, ef_return_number, 
              "Get item count", "Group", "InstCnt", "Get item count of group.");

AddStringParam("Group", "Group name.", '""');
AddAnyTypeParam("UID", "The UID of instance.", 0);
AddExpression(4, ef_return_number, 
              "Get index by UID", "List", "UID2Index", "Get index by UID. Return (-1) if this UID is not in the group.");

AddStringParam("Group", "Group name.", '""');
AddNumberParam("Index", "The index of group.", 0);
AddExpression(5, ef_return_any, 
              "Get UID by index", "List", "Index2UID", "Get UID by index. Return (-1) if index is not in the group.");

AddStringParam("Variable", "Variable name to store UID.", '""');
AddExpression(6, ef_return_any,
              'Get UID from "For each"', "List: For each", "Item", 'Get UID in a group. Used in "Condition:For each UID".');                         

AddStringParam("Variable", "Variable name to store UID.", '""');
AddExpression(7, ef_return_number,
              'Get index from "For each"', "List: For each", "Index", 'Get index in a group. Used in "Condition:For each UID"');                         

AddStringParam("Group", "Group name.", '""');
AddExpression(8, ef_return_string, 
              "Transfer group to string", "JSON", "GroupToString", "Transfer group to JSON string.");

AddExpression(9, ef_return_string, 
              "Transfer all groups to string", "JSON", "AllToString", "Transfer all groups to JSON string.");              

AddAnyTypeParam("UID", "Group name.", '""');
AddStringParam("Group", "Group name.", '""');              
AddExpression(10, ef_return_string, 
              "Get private group name", "Private group", "PrivateGroup", "Get instance's private group name.");

AddStringParam("Group", "Group name.", '""'); 
AddNumberParam("Index", "Pop index.", 0);
AddExpression(11, ef_return_any, 
              "Pop UID by index", "List", "Pop", "Pop UID by index. Index=-1 is the last one.");
              
AddStringParam("Group", "Group name.", '""');
AddExpression(12, ef_return_any, 
              "Get first UID", "List", "FirstUID", "Get first UID in a group. Return (-1) group is empty.");
              
AddStringParam("Group", "Group name.", '""');
AddExpression(13, ef_return_any, 
              "Get last UID", "List", "LastUID", "Get last UID in a group. Return (-1) group is empty.");
                            
AddStringParam("Group", "Group name.", '""');
AddExpression(14, ef_return_number, 
              "Get random item index", "Group", "RandomIndex", "Get random item index of a group.");
              
AddStringParam("Group", "Group name.", '""');
AddExpression(15, ef_return_any, 
              "Get UID by random index", "List", "RandomIndex2UID", "Get UID by random index. Return (-1) if index is not in the group.");
              
AddStringParam("Group", "Group name.", '""');
AddExpression(16, ef_return_any, 
              "Pop UID by random index", "List", "RandomPop", "Pop UID by random index.");

              
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
