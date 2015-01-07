function GetPluginSettings()
{
	return {
		"name":			"Item table",
		"id":			"Rex_Firebase_ItemTable",
		"version":		"0.1",        
		"description":	"Item table, a 2d hash table on firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_itemtable.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
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
AddCondition(11, cf_trigger, "On load complete", "Load", 
            "On load <i>{0}</i> complete",
            "Triggered when load current item complete.", "OnLoadComplete");
          
AddCondition(12, cf_looping | cf_not_invertible, "For each itemID", "Load", 
             "For each itemID", 
             "Repeat the event for each itemID of load result.", "ForEachItemID");

AddStringParam("ID", "ID of item.", '""');
AddCondition(13, cf_looping | cf_not_invertible, "For each key", "Load", 
             "For each key", 
             "Repeat the event for each key of a item of load result.", "ForEachKey");             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddAction(1, 0, "Set value", "Set item", 
          "Set key <i>{0}</i> to  <i>{1}</i> in current item", 
          "Set value into current item.", "SetValue");
          
AddStringParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddAction(2, 0, "Set boolean value", "Set item",
          "Set key <i>{0}</i> to <i>{1}</i> in current item", 
          "Set boolean value into current item.", "SetBooleanValue"); 
          
AddStringParam("Key", "The name of the key.", '""');
AddAction(3, 0, "Remove key", "Set item",
          "Remove key <i>{0}</i> in server", 
          "Remove key in firebase server.", "RemoveKey");            
          
AddStringParam("ID", "ID of item.", '""');
AddComboParamOption("Update");
AddComboParamOption("Set");
AddComboParam("Set mode", "Update, or clean then set item values", 0);
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(4, 0, "Save", "Save", 
          "<i>{1}</i> current item with ID <i>{0}</i> (tag <i>{2}</i>)", 
          "Save current item into server.", "Save"); 

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(5, 0, "Push", "Save", 
          "Push current item (tag <i>{0}</i>)", 
          'Push current item into server. Get itemID by "expression:LastItemID".', "Push");           
          
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(6, 0, "Remove", "Remove", 
          "Remove item with ID <i>{0}</i> (tag <i>{1}</i>)", 
          "Remove item from server.", "Remove"); 

AddStringParam("ID", "ID of item.", '""');
AddAction(11, 0, "Add itemID", "Load", 
          "Add load-request itemID to <i>{0}</i>", 
          "Add load-request itemID.", "AddLoadRequestItemID");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');          
AddAction(12, 0, "Load", "Load", 
          "Load items (tag <i>{0}</i>)", 
          "Load items.", "LoadItems");     
          
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');          
AddAction(13, 0, "Load all", "Load", 
          "Load all items (tag <i>{0}</i>)", 
          "Load all items.", "LoadAllItems");  
 	                    
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get itemID", "For Each", "CurItemID", 
              "Get current itemID in a For Each loop, in last load result. Or in save/remove callback.");
              
AddExpression(2, ef_return_string, "Get load reslt in JSON", "JSON", "LoadResultToJSON", 
              "Get load reslt in JSON string.");    

AddExpression(3, ef_return_string, "Get key", "For Each", "CurKey", 
              "Get current key in a For Each loop, in last load result.");

AddExpression(4, ef_return_any, "Get value", "For Each", "CurValue", 
              "Get current value in a For Each loop, in last load result."); 
      
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Key", "The name of the key.", '""');
AddExpression(5, ef_return_any, "Get value at", "Table", "At", 
              "Get value by itemId and key in last load result.");
              
AddExpression(6, ef_return_string, "Get last itemID", "ItemID", "LastItemID", 
              "Get last itemID.");               
                                                                      
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "Items", "Sub domain for this function."),    
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
