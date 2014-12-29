function GetPluginSettings()
{
	return {
		"name":			"Item filter",
		"id":			"Rex_Firebase_ItemFilter",
		"version":		"0.1",        
		"description":	"Query items with condition filters.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_itemfilter.html",
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
AddCondition(11, cf_trigger, "On request complete", "Request", 
            "On request <i>{0}</i> complete",
            "Triggered when request current item complete.", "OnRequestComplete");

AddCondition(12, cf_looping | cf_not_invertible, "For each itemID", "Request", 
             "For each itemID", 
             "Repeat the event for each itemID of request result.", "ForEachItemID"); 			
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddAction(1, 0, "Set value", "Save", 
          "Set key <i>{0}</i> to value <i>{1}</i> in current item", 
          "Set value into current item.", "SetValue");
		  
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(2, 0, "Save", "Save", 
          "Save current item with ID <i>{0}</i> (tag <i>{1}</i>)", 
          "Save current item into server.", "Save"); 
          
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');
AddAction(3, 0, "Remove", "Remove", 
          "Remove item with ID <i>{0}</i> (tag <i>{1}</i>)", 
          "Remove item from server.", "Remove");           

AddNumberParam("Count", "Count of picked item.", 1);    
AddStringParam("Tag", "A tag, to distinguish between different save requests.", '"_"');      
AddAction(11, 0, "Get random items", "Request", 
          "Request - get <i>{0}</i> random items (tag <i>{1}</i>)", 
          "Get random items.", "GetRandomItems");                            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_any, "Get itemID", "For each itemID", "CurItemID", 
              "Get current itemID in a For Each loop.");
              
AddExpression(2, ef_return_string, "Get itemID in JSON", "JSON", "ItemIDToJSON", 
              "Get itemID in JSON string.");
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_text, "Sub domain", "ItemA", "Sub domain for this function."),
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
