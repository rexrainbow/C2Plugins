function GetPluginSettings()
{
	return {
		"name":			"Item table",
		"id":			"Rex_Firebase_ItemTable",
		"version":		"0.1",        
		"description":	"Items table indexed by (itemID, key), supports writing a item or reading items back.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebase_itemtable.html",
		"category":		"Rex - Web - Firebase",
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
AddCondition(11, cf_trigger, "On load complete", "Load", 
            "On load <i>{0}</i> complete",
            "Triggered when load current item complete.", "OnLoadComplete");

AddComboParamOption("Small to large");
AddComboParamOption("Large to small");
AddComboParam("Order", "Order of itemID.", 0);          
AddCondition(12, cf_looping | cf_not_invertible, "For each itemID", "Load", 
             "For each itemID <i>{0}</i>", 
             "Repeat the event for each itemID of load result.", "ForEachItemID");

AddStringParam("ID", "ID of item.", '""');
AddCondition(13, cf_looping | cf_not_invertible, "For each key", "Load", 
             "For each key in item: <i>{0}</i>", 
             "Repeat the event for each key of a item of load result.", "ForEachKey");

AddCondition(31, cf_trigger, "On remove all complete", "Remove", 
            "On remove all complete",
            "Triggered when remove all items complete.", "OnCleanAllComplete");

AddCondition(32, cf_trigger, "On remove all error", "Remove", 
            "On remove all error",
            "Triggered when remove all items error.", "OnCleanAllError");             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set, could be number or (JSON) string.", 0);
AddAction(1, 0, "Set value", "Prepare", 
          "Prepare- Set key <i>{0}</i> to  <i>{1}</i> in current item", 
          "Set value into current item.", "SetValue");
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddAction(2, 0, "Set boolean value", "Prepare",
          "Prepare- Set key <i>{0}</i> to <i>{1}</i> in current item", 
          "Set boolean value into current item.", "SetBooleanValue"); 
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddAction(3, 0, "Remove key", "Prepare",
          "Prepare- Remove key <i>{0}</i> in server", 
          "Remove key in firebase server.", "RemoveKey");            
          
AddStringParam("ID", "ID of item.", '""');
AddComboParamOption("Update");
AddComboParamOption("Set");
AddComboParam("Set mode", "Update, or clean then set item values", 0);
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(4, 0, "Save", "Save", 
          "Save- <i>{1}</i> current item at itemID: <i>{0}</i> (tag <i>{2}</i>)", 
          'Save current item into server. Push item if ID is equal to "".', "Save"); 

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(5, 0, "Push", "Save", 
          "Save- Push current item (tag <i>{0}</i>)", 
          'Push current item into server. Get itemID by "expression:LastItemID".', "Push");           
          
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(6, 0, "Remove", "Remove", 
          "Remove- Remove itemID: <i>{0}</i> (tag <i>{1}</i>)", 
          "Remove item from server.", "Remove"); 
          
AddAction(7, 0, "Generate", "ItemID", 
          "Generate a new itemID", 
          'Generate a new itemID. Get it by "Expression:LastGeneratedKey". Or use "Expression:GenerateKey" directly.', "GenerateKey");           
             
AddNumberParam("X", "The X position.", 0);
AddNumberParam("Y", "The Y position.", 0); 
AddAction(8, 0, "Set to position", "Prepare - position", 
          'Prepare- Set key "pos" to (<i>{0}</i>, <i>{1}</i>)', 
          'Set position value into current item.', "SetPosValue");
          
AddAnyTypeParam("Key", "The name of the key.", '""');
AddAction(9, 0, "Set to timestamp", "Prepare", 
          "Prepare- Set key <i>{0}</i> to  server timestamp in current item", 
          "Set server timestamp value into current item.", "SetServerTimestampValue");          
                    
AddStringParam("ID", "ID of item.", '""');
AddAction(11, 0, "Add itemID", "Load", 
          "Load- 1. Add load-request itemID: <i>{0}</i>", 
          "Add load-request itemID.", "AddLoadRequestItemID");

AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');          
AddAction(12, 0, "Load", "Load", 
          "Load- 2. Load items (tag <i>{0}</i>)", 
          "Load items.", "LoadItems");     
          
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');          
AddAction(13, 0, "Load all", "Load", 
          "Load- Load all items (tag <i>{0}</i>)", 
          "Load all items.", "LoadAllItems");  
          
AddAction(21, 0, "Cancel disconnected handler", "On disconnected", 
          "Cancel all disconnected handlers", 
          "Cancel all disconnected handlers.", "CancelOnDisconnected");           
          
AddStringParam("ID", "ID of item.", '""');
AddAction(22, 0, "Auto remove", "On disconnected", 
          "Auto remove itemID: <i>{0}</i> when disconnected", 
          "Auto remov item when disconnected.", "RemoveOnDisconnected");    

AddAction(31, 0, "Remove all", "Remove",  
          "Remove all",
          "Remove all items.", "CleanAll");              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get itemID", "For Each", "CurItemID", 
              "Get current itemID in a For Each loop, in last load result. Or in save/remove callback.");
              
AddExpression(2, ef_return_string, "Get load reslt in JSON", "Load items", "LoadResultToJSON", 
              "Get load reslt in JSON string.");    

AddExpression(3, ef_return_string, "Get key", "For Each", "CurKey", 
              "Get current key in a For Each loop, in last load result.");

AddExpression(4, ef_return_any, "Get value", "For Each", "CurValue", 
              "Get current value in a For Each loop, in last load result."); 
      
AddStringParam("ID", "ID of item.", '""');
AddAnyTypeParam("Key", "The name of the key.", '""');
AddExpression(5, ef_return_any | ef_variadic_parameters, "Get value at", "Table", "At", 
              "Get value by itemId and key in last load result. Add 3rd parameter for default value if this key is not existed.");
              
AddExpression(6, ef_return_string, "Get last itemID", "ItemID", "LastItemID", 
              "Get last itemID.");               
       
AddExpression(7, ef_return_any | ef_variadic_parameters, "Get current item content", "For Each", "CurItemContent", 
              'Get current content in JSON stringin in a For Each loop, in last load result. Add 2nd parameter for specific key, 3rd parameter for default value if this key is not existed.');              
                                                                        
AddExpression(8, ef_return_number, "Get loaded items count", "Load item", "ItemsCount", 
              "Get loaded items count.");               
       
       
AddExpression(21, ef_return_string, "Generate new key from push", "ItemID", "GenerateKey", 
              "Generate new key from push action."); 
              
AddExpression(22, ef_return_string, "Get last generated key", "ItemID", "LastGeneratedKey", 
              "Get last generate a key from push action.");               

//AddAnyTypeParam("Item", "Item ID.", '""');      
//AddAnyTypeParam("Key", "The name of the key.", '""');              
AddExpression(101, ef_return_string | ef_variadic_parameters, "Get reference", "Reference", "Ref", 
              "Get renerence in table, optional parameters are (itemID, key).");
              
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
