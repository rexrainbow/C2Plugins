function GetPluginSettings()
{
	return {
		"name":			"Geofire",
		"id":			"Rex_Firebase_Geofire",
		"version":		"0.1",        
		"description":	"Realtime location queries with Firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_geofire.html",
		"category":		"Rex - Web - Firebase",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
		"dependency":	"geofire.js"
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, cf_trigger, "On update", "Set", 
            "On update",
            "Triggered when update location complete.", "OnUpdateComplete");

AddCondition(2, cf_trigger, "On update error", "Set", 
            "On update error",
            "Triggered when update location error.", "OnUpdateError"); 
            
AddCondition(3, cf_trigger, "On get item", "Get", 
            "On get item",
            "Triggered when get item.", "OnGetItemComplete");

AddCondition(4, cf_trigger, "On get item error", "Get", 
            "On get item error",
            "Triggered when get item error.", "OnGetItemError");         

AddCondition(5, 0, "Item is not found", "Get", 
            "Item is not found",
            "Return true if item is not found.", "IsItemNotFound");              
            
AddCondition(11, cf_trigger, "On item entered", "Monitor", 
            "On item entered",
            "Triggered when item entered.", "OnItemEntered");
            
AddCondition(12, cf_trigger, "On item exited", "Monitor", 
            "On item exited",
            "Triggered when item exited.", "OnItemExisted");  
            
AddCondition(13, cf_trigger, "On item moved", "Monitor", 
            "On item moved",
            "Triggered when item moved.", "OnItemMoved");  
            
AddCondition(14, cf_trigger, "On initial ready", "Monitor", 
            "On initial ready",
            "Triggered when initial data has loaded and fired all other events.", "OnReady"); 

AddComboParamOption("descending");
AddComboParamOption("ascending");
AddComboParamOption("logical descending");
AddComboParamOption("logical ascending");
AddComboParam("Order", "Order of itemID.", 1);          
AddCondition(15, cf_looping | cf_not_invertible, "For each itemID", "Monitor", 
             "For each itemID <i>{0}</i>", 
             "Repeat the event for each itemID of monitor result.", "ForEachItemID");            
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Sub domain", "Sub domain for this function.", '""');
AddAction(0, 0, "Set sub domain", "Domain", 
          "Set sub domain to <i>{0}</i>", 
          "Set sub domain ref.", "SetSubDomainRef");
                    
AddStringParam("ID", "ItemID.", '""');      
AddNumberParam("Latitude", "Latitude.", 0);
AddNumberParam("Longitude", "Longitude.", 0);
AddAction(1, 0, "Set location", "Set", 
          "Set location of item <i>{0}</i> to latitude-longitude ( <i>{1}</i> , <i>{2}</i> )",
          "Set location of an item.", "SetLocation");     
          
AddStringParam("ID", "ItemID.", '""');             
AddAction(2, 0, "Remove item", "On disconnected", 
             "On disconnected- remove item <i>{0}</i>", 
             "Remove item on disconnected.", "OnDisconnectedRemove");         

AddStringParam("ID", "ItemID.", '""');             
AddAction(3, 0, "Remove item", "Set", 
             "Remove item <i>{0}</i>", 
             "Remove item.", "RemoveItem");
             
AddStringParam("ID", "ItemID.", '""');             
AddAction(4, 0, "Get item", "Get", 
             "Get item <i>{0}</i>", 
             "Get item.", "GetItem");    

AddStringParam("ID", "ItemID.", '""');             
AddAction(5, 0, "Cancel all handlers", "On disconnected", 
             "On disconnected- cancel all handlers", 
             "Cancel all handlers of disconnected.", "OnDisconnectedCancel");                      

AddNumberParam("Latitude", "Latitude of center.", 0);
AddNumberParam("Longitude", "Longitude of center.", 0);
AddNumberParam("Radius", "Radius, in kilometers, from the center of this monitor in which to include results.", 0);
AddAction(11, 0, "Monitor at", "Monitor", 
          "Monitor at latitude-longitude ( <i>{0}</i> , <i>{1}</i> ) with radius to <i>{2}</i>",
          "Monitor an area", "MonitorAt");              
          
AddAction(12, 0, "Stop", "Monitor", 
          "Stop monitor",
          "Stop monitor", "MonitorStop");            
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Generate new key from push", "ItemID", "GenerateKey", 
              "Generate new key from push action.");               
AddExpression(2, ef_return_string, "Get last generated key", "ItemID", "LastGeneratedKey", 
              "Get last generate a key from push action.");  

AddExpression(11, ef_return_string, "Get last itemID", "Event", "LastItemID",  "Get itemID returned by the last triggered event.");                
AddExpression(12, ef_return_number, "Get last latitude", "Event", "LastLatitude", "Get latitude returned by the last triggered event.");
AddExpression(13, ef_return_number, "Get last longitude", "Event", "LastLongitude", "Get longitude returned by the last triggered event.");            
AddExpression(14, ef_return_number, "Get last distance", "Event", "LastDistance", "Get distance between triggered item to monitor point returned by the last triggered event."); 

AddExpression(21, ef_return_number, "Get monitor latitude", "Monitor area", "MonitorLatitude", "Get latitude of monitor center.");
AddExpression(22, ef_return_number, "Get monitor longitude", "Monitor area", "MonitorLongitude", "Get longitude of monitor center.");      
AddExpression(23, ef_return_number, "Get monitor radius", "Monitor area", "MonitorRadius", "Get radius of monitor, in kilometers.");  

AddExpression(31, ef_return_string, "Get current itemID", "For Each", "CurItemID", "Get current itemID in a For Each loop.");   
AddExpression(32, ef_return_number, "Get current latitude", "For Each", "CurLatitude", "Get current latitude in a For Each loop.");
AddExpression(33, ef_return_number, "Get current longitude", "For Each", "CurLongitude", "Get current longitude in a For Each loop.");            
AddExpression(34, ef_return_number, "Get current distance", "For Each", "CurDistance", "Get current distance between triggered item to monitor point in a For Each loop."); 


AddNumberParam("Latitude A", "Latitude of point A.", 0);
AddNumberParam("Longitude A", "Longitude of point A.", 0);
AddNumberParam("Latitude B", "Latitude of point B.", 0);
AddNumberParam("Longitude B", "Longitude of point B.", 0);
AddExpression(51, ef_return_number, "Get distance between two points", "Helper", "Distance", "Get distance between two points, in kilometers.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Sub domain", "Geo", "Sub domain for this function."),     
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
