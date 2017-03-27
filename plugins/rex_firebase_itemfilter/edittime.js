function GetPluginSettings()
{
	return {
		"name":			"Item filter",
		"id":			"Rex_Firebase_ItemFilter",
		"version":		"0.1",        
		"description":	"Query itemIDs with condition filters.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_itemfilter.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(1, cf_trigger, "On save complete", "Save", 
            "On save <i>{0}</i> complete",
            "Triggered when save current item complete.", "OnSaveComplete");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(2, cf_trigger, "On save error", "Save", 
            "On save <i>{0}</i> error",
            "Triggered when save current item error.", "OnSaveError");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(3, cf_trigger, "On remove complete", "Remove", 
            "On remove <i>{0}</i> complete",
            "Triggered when remove current item complete.", "OnRemoveComplete");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(4, cf_trigger, "On remove error", "Remove", 
            "On remove <i>{0}</i> error",
            "Triggered when remove current item error.", "OnRemoveError"); 
			
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddCondition(11, cf_trigger, "On request complete", "Request", 
            "On request <i>{0}</i> complete",
            "Triggered when request current item complete.", "OnRequestComplete");

AddCondition(12, cf_looping | cf_not_invertible, "For each itemID", "Request", 
             "For each itemID", 
             "Repeat the event for each itemID of request result.", "ForEachItemID"); 			
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddAction(1, 0, "Set value", "Set item", 
          "Set key <i>{0}</i> to  <i>{1}</i> in current item", 
          "Set value into current item.", "SetValue");
		  
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(2, 0, "Update", "Set item", 
          "Update current item with ID <i>{0}</i> (tag <i>{1}</i>)", 
          "Update current item into server.", "Save"); 
          
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(3, 0, "Remove", "Remove", 
          "Remove item with ID <i>{0}</i> (tag <i>{1}</i>)", 
          "Remove item from server.", "Remove");  
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddAction(4, 0, "Set boolean value", "Set item", 
          "Set key <i>{0}</i> to <i>{1}</i> in current item", 
          "Set boolean value into current item.", "SetBooleanValue"); 
          
AddStringParam("Key", "The name of the key.", '""');
AddAction(5, 0, "Remove key", "Set item",
          "Remove key <i>{0}</i> in server", 
          "Remove key in firebase server.", "RemoveKey");                             

AddNumberParam("Count", "Count of picked item.", 1);    
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');      
AddAction(11, 0, "Get random items", "Request", 
          "Request - get <i>{0}</i> random items (tag <i>{1}</i>)", 
          "Get random items.", "GetRandomItems");

AddStringParam("Expression", "Expression of conditions.", '""');  
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');    
AddAction(12, 0, "Get items by condition", "Request", 
          "Request - get items by condition to <i>{0}</i> (tag <i>{1}</i>)", 
          "Get items by condition.", "GetItemsByCondition");  
          
AddStringParam("Key", "The name of the key.", '""');          
AddAnyTypeParam("Value", "Start value.", 0);             
AddAnyTypeParam("Value", "End value.", 0);
AddComboParamOption("Limit to first");       
AddComboParamOption("Limit to last");
AddComboParam("Limit", "Limit types.", 0);
AddNumberParam("Limit", "Limit count.", 1);    
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');  
AddAction(13, 0, 'Get items by "In Range"', "Request - Signle query", 
          "Request - get <i>{4}</i> items by condition: <i>{0}</i> In Range <i>{1}</i> - <i>{2}</i>, <i>{3}</i> (tag <i>{5}</i>)", 
          "Get items by single condition-In Range with count limit.", "GetItemsBySingleConditionInRange");  
          
AddStringParam("Key", "The name of the key.", '""');          
AddComboParamOption("Equal to");       
AddComboParamOption("Greater than or Equal to");
AddComboParamOption("Less than or Equal to");
AddComboParam("Comparison", "Comparison types.", 0);          
AddAnyTypeParam("Value", "Compared value.", 0);
AddComboParamOption("Limit to first");       
AddComboParamOption("Limit to last");
AddComboParam("Limit", "Limit types.", 0);
AddNumberParam("Limit", "Limit count.", 1);    
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');  
AddAction(14, 0, 'Get items by comparison', "Request - Signle query", 
          "Request - get <i>{4}</i> items by condition: <i>{0}</i> <i>{1}</i> <i>{2}</i>, <i>{3}</i> (tag <i>{5}</i>)", 
          "Get items by single condition with count limit.", "GetItemsBySingleCondition");
                           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any, "Get itemID", "ItemID", "CurItemID", 
              "Get current itemID in a For Each loop, or in save/remove callback.");
              
AddExpression(2, ef_return_string, "Get itemID in JSON", "JSON", "ItemIDToJSON", 
              "Get itemID in JSON string.");  

// filter conditions
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to compare", 0);
AddExpression(11, ef_return_string | ef_variadic_parameters, "Pick equal", "Condition", "Equal", 
              "Do Equal to codition to pick matched itemID. Add 3rd and more parameters to pick more matched itemIDs.");

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to compare", 0);
AddExpression(12, ef_return_string, "Pick greater or equal", "Condition", "GreaterEqual", 
              "Do Greater than or Equal to codition to pick matched itemID.");

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to compare", 0);
AddExpression(13, ef_return_string, "Pick less or equal", "Condition", "LessEqual", 
              "Do Less than or Equal to codition to pick matched itemID.");

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The start value to compare", 0);
AddAnyTypeParam("Value", "The end value to compare", 0);
AddExpression(14, ef_return_string, "Pick in range", "Condition", "InRange", 
              "Do In Range codition to pick matched itemID.");
              
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to compare", 0);
AddExpression(15, ef_return_string, "Pick greater", "Condition", "Greater", 
              "Do Greater than codition to pick matched itemID.");

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to compare", 0);
AddExpression(16, ef_return_string, "Pick less", "Condition", "Less", 
              "Do Less than codition to pick matched itemID.");              

AddStringParam("Expression A", "Expression A of set operation.", '""');
AddStringParam("Expression B", "Expression A of set operation.", '""');
AddExpression(21, ef_return_string | ef_variadic_parameters, "OR operation", "Set operation", "OR", 
              "Do OR operation of these expressions.");

AddStringParam("Expression A", "Expression A of set operation.", '""');
AddStringParam("Expression B", "Expression A of set operation.", '""');
AddExpression(22, ef_return_string | ef_variadic_parameters, "AND operation", "Set operation", "AND",
              "Do AND operation of these expressions.");

AddStringParam("Expression A", "Expression A of set operation.", '""');
AddStringParam("Expression B", "Expression A of set operation.", '""');
AddExpression(23, ef_return_string | ef_variadic_parameters, "SUB operation", "Set operation", "SUB", 
              "Do SUB operation of these expressions.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "items", "Sub domain for this function."),
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
