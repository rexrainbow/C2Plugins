function GetPluginSettings()
{
	return {
		"name":			"Item monitor",
		"id":			"Rex_Firebase_ItemMonitor",
		"version":		"0.1",        
		"description":	"Monitor items' values.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_firebase_itemmonitor.html",
		"category":		"Rex - Web - firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"firebase.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On item added", "Monitor - item", 
            "On item added",
            "Triggered when item added.", "OnItemAdded");
            
AddCondition(2, cf_trigger, "On item removed", "Monitor - item", 
            "On item removed",
            "Triggered when item removed.", "OnItemRemoved"); 

AddStringParam("Property", "Property name of item.", '""');
AddCondition(3, cf_trigger, "On value changed", "Monitor - key", 
            "On <i>{0}</i> value changed",
            "Triggered when value changed.", "OnValueChnaged");    

AddCondition(4, cf_trigger, "On any value changed", "Monitor - key", 
            "On any value changed",
            "Triggered when any value changed.", "OnAnyValueChnaged"); 
            
AddCondition(5, cf_trigger, "On key added", "Monitor - key", 
            "On key added",
            "Triggered when item added.", "OnPropertyAdded");
            
AddCondition(6, cf_trigger, "On key removed", "Monitor - key", 
            "On key removed",
            "Triggered when key removed.", "OnPropertyRemoved");                            
                       
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The root location of the Firebase data.", '""');
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain to <i>{0}</i>, sub domain to <i>{1}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddAction(1, 0, "Start", "Monitor all", 
          "Start monitor all items", 
          "Start monitor all items.", "StartMonitorAll");
          
AddAction(2, 0, "Stop", "Monitor all",
          "Stop monitor", 
          "Stop monitor all items.", "StopMonitorAll"); 
         
AddStringParam("Key", "The name of the key.", '""');         
AddAnyTypeParam("Value", "Compared value.", 0);          
AddAction(3, 0, "Start", "Monitor on key", 
          "Start monitor on items with key <i>{0}</i> = <i>{1}</i>", 
          "Start monitor items with condition.", "StartMonitorItemsWCond");   

AddStringParam("Key", "The name of the key.", '""');
AddAnyTypeParam("Value", "Compared value.", 0);      
AddAction(4, 0, "Stop", "Monitor on key", 
          "Stop monitor on items with key <i>{0}</i> = <i>{1}</i>", 
          "Stop monitor items with condition.", "StopMonitorItemsWCond");                              
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get last itemID", "Items", "LastItemID", 
              'Get last itemID, used under "condition: On item added" or "condition: On item removed".'); 
AddExpression(2, ef_return_any | ef_variadic_parameters, "Get last item content", "Items", "LastItemContent", 
              'Get last content in JSON string, used under "condition: On item added" or "condition: On item removed". Add 2nd parameter for specific key, 3rd parameter for default value if this key is not existed.');
AddStringParam("ID", "ID of item.", '""');
AddStringParam("Key", "The name of the key.", '""');
AddExpression(3, ef_return_any, "Get value at", "Table", "At", 
              "Get value by itemId and key in last load result.");
                             
AddExpression(11, ef_return_string, "Get last key name", "Properties", "LastPropertyName", 
              'Get last content in JSON string, used under "condition: On any value changed", "condition: On key added" or "condition: On key removed".');      
AddExpression(12, ef_return_any, "Get last value", "Item", "LastValue", 
              'Get last value of key, used under "condition: On any value changed", "condition: On key added" or "condition: On key removed".');         
AddExpression(13, ef_return_any, "Get previous value", "Item", "PrevValue", 
              'Get previous value of key, used under "condition: On any value changed", "condition: On key added" or "condition: On key removed".');         

                                                                                    
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
