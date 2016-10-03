function GetPluginSettings()
{
	return {
		"name":			"Tags",
		"id":			"Rex_Parse_tags",
		"version":		"0.1",        
		"description":	"Paste tags on objects.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_parse_tags.html",
		"category":		"Rex - Web - parse",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On paste complete", "Paste", 
            "On paste complete",
            "Triggered when paste complete.", "OnPasteComplete");

AddCondition(2, cf_trigger, "On paste error", "Paste", 
            "On paste error",
            "Triggered when paste error.", "OnPasteError");

AddCondition(3, cf_trigger, "On received", "Load", 
            "On received tags",
            "Triggered when received tags.", "OnReceived");
            
AddCondition(4, cf_trigger, "On received error", "Load", 
            "On received tags error",
            "Triggered when received tags error.", "OnReceivedError");       
            
AddCondition(11, cf_looping | cf_not_invertible, "For each tag", "Load - for each", 
             "For each tag", 
             "Repeat the event for each tag.", "ForEachTag");    

AddNumberParam("Start", "Start from message index (0-based).", 0);  
AddNumberParam("End", "End to message index (0-based). This value should larger than Start.", 2);    
AddCondition(12, cf_looping | cf_not_invertible, "For each tag in a range", "Load - for each", 
             "For each tag from index <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each tag in a range.", "ForEachTag"); 
                          
AddCondition(103, cf_trigger, "On remove queried tags complete", "Remove queried tags",
            "On remove queried tags complete",
            "Triggered when remove complete.", "OnRemoveQueriedTagsComplete");

AddCondition(104, cf_trigger, "On remove queried tags error", "Remove queried tags",
            "On remove queried tags error",
            "Triggered when remove error.", "OnRemoveQueriedTagsError");    
            
AddCondition(111, cf_trigger, "On get tags count complete", "Queried tags count",
            "On get tags count complete",
            "Triggered when get tags count.", "OnGetTagsCountComplete");

AddCondition(112, cf_trigger, "On get tags count error", "Queried tags count",
            "On get tags count error",
            "Triggered when get tags count error.", "OnGetTagsCountError");              

AddCondition(121, cf_trigger, "On get tags list", "Tags list",
            "On get tags list complete",
            "Triggered when get tags list count.", "OnGetTagsListComplete");

AddCondition(122, cf_trigger, "On get tags list error", "Tags list",
            "On get tags list error",
            "Triggered when get tags list error.", "OnGetTagsListError"); 

AddComboParamOption("Tag count in ascending order");
AddComboParamOption("Tag count in descending order");
AddComboParamOption("Tag name in ascending order");
AddComboParamOption("Tag name in descending order");
AddComboParam("Order", "Sort by name or count.", 1);
AddCondition(123, cf_looping | cf_not_invertible, "For each kind of tag", "Tags list",
             "For each kind of tag, sort by <i>{0}</i>", 
             "Repeat the event for each kind of tag in tags list.", "ForEachKindOfTagInTagsList");  
             
AddCondition(131, cf_trigger, "On reset tags complete", "Reset user tags of a target", 
            "On reset tags complete",
            "Triggered when reset tags complete.", "OnResetTagsComplete");

AddCondition(132, cf_trigger, "On reset tags error", "Reset user tags of a target", 
            "On reset tags error",
            "Triggered when reset tags error.", "OnResetTagsError");
            
AddCondition(141, cf_trigger, "On reset targets complete", "Reset targets of an user tag", 
            "On reset targets complete",
            "Triggered when reset targets complete.", "OnResetTargetsComplete");

AddCondition(142, cf_trigger, "On reset targets error", "Reset targets of an user tag", 
            "On reset targets error",
            "Triggered when reset targets error.", "OnResetTargetsError");                                                                           
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("TargetID", "Object ID of tagged target.", '""');
AddStringParam("User tag", 'User tag.', '""');
AddStringParam("Category", 'Category.', '""');
AddStringParam("Description", '(Optional) Description of this tag. Input "" to ignore this field', '""');
AddAction(11, 0, "Paste tag", "Paste", 
          "Owner ID: <i>{0}</i> pastes tag [<i>{3}</i>] <i>{2}</i>: <i>{4}</i> on target ID: <i>{1}</i>", 
          "Paste tag on an object.", "PasteTag");
          
AddAction(21, 0, "New", "Filter - 1. new", 
          "Filter- 1. Create a new tag filter", 
          "Create a new tag filter.", "NewFilter");       

AddNumberParam("Start", "Start index, 0-based.", 0);          
AddNumberParam("Lines", "Count of lines", 10);
AddComboParamOption("without");
AddComboParamOption("with");
AddComboParam("Object", "Get owner and target object.", 1);                    
AddAction(22, 0, "Request in a range", "Load", 
          "Load- Request tags start from <i>{0}</i> with <i>{1}</i> lines, <i>{2}</i> owner and target objects", 
          "Request tags in a range.", "RequestInRange");   

AddNumberParam("Index", "Page index, 0-based.", 0);   
AddAction(23, 0, "Request to page", "Load", 
          "Load- Request tags at page <i>{0}</i>", 
          "Request tags at page.", "RequestTurnToPage");
             
AddAction(24, 0, "Request current page",  "Load", 
          "Load- Request tags at current page", 
          "Request tags at current page.", "RequestUpdateCurrentPage"); 
                     
AddAction(25, 0, "Request next page", "Load", 
          "Load- Request tags at next page", 
          "Request tags at next page.", "RequestTurnToNextPage");  
            
AddAction(26, 0, "Request previous page", "Load", 
          "Load- Request tags at previous page", 
          "Request tags at previous page.", "RequestTurnToPreviousPage");
                
AddAction(31, 0, "All owners", "Filter - 2. ownerID", 
          "Filter- 2. add all owners into filter", 
          "Add all owners into filter.", "AddAllOwners"); 
          
AddStringParam("Owner ID", "Owner ID.", '""');
AddAction(32, 0, "Add owner", "Filter - 2. ownerID", 
          "Filter- 2. add ownerID: <i>{0}</i> into filter", 
          "Add an owner into filter.", "AddOwner");
          
AddAction(41, 0, "All targets", "Filter - 3. targetID", 
          "Filter- 3. add all targets into filter", 
          "Add all targets into filter.", "AddAllTargets"); 
          
AddStringParam("Target ID", "Target ID.", '""');
AddAction(42, 0, "Add target", "Filter - 3. targetID", 
          "Filter- 3. add targetID: <i>{0}</i> into filter", 
          "Add a target into filter.", "AddTarget");  
          
AddAction(51, 0, "All user tags", "Filter - 4. user tag", 
          "Filter- 4. add all user tags into filter", 
          "Add all user tags into filter.", "AddAllUserTags"); 
          
AddStringParam("User tag", "Target ID.", '""');
AddAction(52, 0, "Add user tag", "Filter - 4. user tag", 
          "Filter- 4. add user tag: <i>{0}</i> into filter", 
          "Add a user tag into filter.", "AddUserTag");            
          
AddAction(61, 0, "All categoies", "Filter - 5. category", 
          "Filter- 5. add all categoies into filter", 
          "Add all categoies into filter.", "AddAllCategoies"); 
          
AddStringParam("Category", "Category.", '""');
AddAction(62, 0, "Add category", "Filter - 5. category", 
          "Filter- 5. add category: <i>{0}</i> into filter", 
          "Add a category into filter.", "AddCategory");

AddAction(102, 0, "Remove queried tags", "Remove", 
          "Remove- Remove queried tags", 
          "Remove queried tags.", "RemoveQueriedTags"); 
          
AddAction(111, 0, "Get tags count", "Queried tags count", 
          "Get queried tags count", 
          "Get queried tags count. Maximum of 160 requests per minute.", "GetTagsCount");              
          
AddAction(121, 0, "Request tags list", "Load - tags list", 
          "Load- Request tags list", 
          "Request tags list.", "RequestTagsList");    

AddStringParam("User tag", 'User tag.', '""');
AddStringParam("Description", '(Optional) Description of this tag. Input "" to ignore this field', '""');
AddAction(131, 0, "Add user tag", "Reset user tags of a target", 
          "Add user tag <i>{0}</i>: <i>{1}</i>", 
          "Add user tag.", "ResetTag_AddTag"); 

AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("TargetID", "Object ID of tagged target.", '""');
AddStringParam("Category", 'Category.', '""');
AddAction(132, 0, "Reset user tags", "Reset user tags of a target", 
          "Owner ID: <i>{0}</i> reset [<i>{2}</i>] user tags on target ID: <i>{1}</i>", 
          "Reset user tags of a target.", "ResetTag_Reset");   
          
AddStringParam("TargetID", 'TargetID.', '""');
AddStringParam("Description", '(Optional) Description of this tag. Input "" to ignore this field', '""');
AddAction(141, 0, "Add targetID", "Reset targetID of an user tag", 
          "Add targetID <i>{0}</i>: <i>{1}</i>", 
          "Add targetID.", "ResetTargetID_AddTargetID"); 

AddStringParam("OwnerID", "Object ID of owner.", '""');
AddStringParam("User tag", 'User tag.', '""');
AddStringParam("Category", 'Category.', '""');
AddAction(142, 0, "Reset targets", "Reset targetID of an user tag", 
          "Owner ID: <i>{0}</i> reset targets with tag [<i>{2}</i>] <i>{1}</i>",
          "Reset targetID of a user tag.", "ResetTargetID_Reset");    
          
          
AddAction(2000, 0, "Initial table", "Initial", 
          "Initial table", 
          "Initial table.", "InitialTable");                         
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Last pasted ownerID", "Paste", "LastPastedOwnerID", 
              'Get last pasted ownerID under "Condition:On paste complete".');  
AddExpression(2, ef_return_string, "Last pasted targetID", "Paste", "LastPastedTargetID", 
              'Get last pasted targetID under "Condition:On paste complete".');                
AddExpression(3, ef_return_string, "Last pasted tagID", "Paste", "LastPastedTagID", 
              'Get last pasted tagID under "Condition:On paste complete".');  
AddExpression(4, ef_return_string, "Last pasted user tag", "Paste", "LastPastedUserTag", 
              'Get last pasted user tag under "Condition:On paste complete".');  
AddExpression(5, ef_return_string, "Last pasted category", "Paste", "LastPastedCategory", 
              'Get last pasted category under "Condition:On paste complete".');  
AddExpression(6, ef_return_string, "Last pasted description", "Paste", "LastPastedDescription", 
              'Get last pasted description under "Condition:On paste complete".');              
              
AddExpression(11, ef_return_string, "Current owner ID", "Load - for each", "CurOwnerID", 
              "Get the current ownerID in a For Each loop.");  
AddExpression(12, ef_return_string, "Current target ID", "Load - for each", "CurTargetID", 
              "Get the current targetID in a For Each loop."); 
AddExpression(13, ef_return_string, "Current user tag", "Load - for each", "CurUserTag", 
              "Get the current user tag in a For Each loop.");  
AddExpression(14, ef_return_string, "Current category", "Load - for each", "CurCategory", 
              "Get the current category in a For Each loop."); 
AddExpression(15, ef_return_string, "Current description", "Load - for each", "CurDescription", 
              "Get the current description in a For Each loop.");               
AddExpression(16, ef_return_string, "Current tagID", "Load - for each", "CurTagID", 
              'Get the current tagID in "Condition: For each tag" or "Condition: For each kind of tag".');
AddExpression(17, ef_return_string, "All read tags", "Load", "TagsToJSON", 
              "Get all read tags in JSON string.");     
AddExpression(18, ef_return_number, "Current tag index", "Load - for each - index", "CurTagIndex", 
              "Get the current tag index in a For Each loop."); 
                         
AddExpression(19, ef_return_any | ef_variadic_parameters, "Current owner object", "Load - for each", "CurOwnerObject", 
              "Get the current owner object in JSON string in a For Each loop. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");              
AddExpression(20, ef_return_any | ef_variadic_parameters, "Current target object", "Load - for each", "CurTargetObject", 
              "Get the current target object in JSON string in a For Each loop. Add 1st parameter to get value at the specific key. Add 2nd parameter for default value if this key is not existed.");              
              
AddExpression(21, ef_return_number, "Current tag count", "Load - for each", "CurTagCount", 
              "Get tag count in current received page.");
AddExpression(22, ef_return_number, "Current start index", "Load - for each - index", "CurStartIndex", 
              "Get start index in current received page.");
AddExpression(23, ef_return_number, "Current loop index", "Load - for each - index", "LoopIndex", 
              "Get loop index in current received page."); 
              
AddExpression(111, ef_return_number, "Last tags count", "Queried tags count", "LastTagsCount", 
              'Get last queried tags count under "Condition: On get tags count complete".');
                                                                       
AddExpression(121, ef_return_string, "Current user tag name", "Tags list - for each", "TLCurTagName", 
              'Get the current user tag under "Condition: For each kind of tag".');  
AddExpression(122, ef_return_number, "Current tags count", "Tags list - for each", "TLCurTagsCount", 
              'Get the current tags count under "Condition: For each kind of tag".');
AddExpression(123, ef_return_number, "Tag name count", "Tags list", "TLTagNameCount", 
              'Get tags count in tags list.');                  
AddExpression(124, ef_return_number, "Total tags count", "Tags list", "TLTotalTagsCount", 
              'Get total tags count in tags list.');  
AddExpression(125, ef_return_string, "Tags List in JSON", "Tags list", "TLToJSON", 
              "Get tags List in JSON string.");                          


AddExpression(1001, ef_return_number, "Error code", "Error", "ErrorCode", 
              "Error code.");
AddExpression(1002, ef_return_string, "Error message", "Error", "ErrorMessage", 
              "Error message.");
          
                                                                                               
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Class name", "Tag", "Class name of this tags system."), 	
    new cr.Property(ept_integer, "Lines", 10, "Line count of each page."),   
    new cr.Property(ept_text, "Owner class name", "", 'Class name of owner. "" would ignore this feature.'), 
    new cr.Property(ept_text, "Target class name", "", 'Class name of target. "" would ignore this feature.'),          
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
