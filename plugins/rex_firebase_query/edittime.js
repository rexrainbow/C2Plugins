function GetPluginSettings()
{
	return {
		"name":			"Query",
		"id":			"Rex_Firebase_Query",
		"version":		"0.1",        
		"description":	"Query in firebase.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_firebase_query.html",
		"category":		"Rex - Web - Firebase - core",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions
                    
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Domain", "The Firebase data ref URL", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain ref to <i>{0}</i>", 
          "Set domain ref.", "SetDomainRef");
          
// 0. ref
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAction(1, 0, "Create", "0. Create", 
          "0. Create a new query for ref <i>{0}</i>", 
          "Create a new query.", "CreateNewQuery");

// 1.order
AddAction(11, 0, "Order by key", "1. Create - Order", 
          "1. Order query by Key", 
          "Order query by Key.", "OrderByKey");
          
AddStringParam("Child", "Key name of child", '""');          
AddAction(12, 0, "Order by child", "1. Create - Order", 
          "1. Order query by child <i>{0}</i>", 
          "Order query by child.", "OrderByChild"); 
          
AddAction(13, 0, "Order by priority", "1. Create - Order", 
          "1. Order query by priority", 
          "Order query by priority.", "OrderByPriority");  
          
AddAction(14, 0, "Order by value", "1. Create - Order", 
          "1. Order query by value", 
          "Order query by value.", "OrderByValue");          
          
// 2. range condition
AddAnyTypeParam("Value", "Start value.", 0);          
AddAction(22, 0, "Start at", "2. Create - Range", 
          "2. Start query at <i>{0}</i>", 
          "Start query at specific value.", "StartAt");  
AddAnyTypeParam("Value", "End value.", 0);          
AddAction(23, 0, "End at", "2. Create - Range", 
          "2. End query at <i>{0}</i>", 
          "End query at specific value.", "EndAt");
AddAnyTypeParam("Value", "Start value.", 0);             
AddAnyTypeParam("Value", "End value.", 0);          
AddAction(24, 0, "In range", "2. Create - Range", 
          "2. Set query in range, from <i>{0}</i> to <i>{1}</i>", 
          "Set query in range.", "StartEndAt");     
AddAnyTypeParam("Value", "Equal value.", 0);          
AddAction(25, 0, "Equal to", "2. Create - Range", 
          "2. Set query equal to <i>{0}</i>", 
          "Set query equal to specific value.", "EqualTo");   

// 3. limit
AddNumberParam("Limit", "Limit count.", 1);          
AddAction(31, 0, "Limit to first", "3. Create - Limit", 
          "3. Set limit to <i>{0}</i> to first of current queue", 
          "Limit to first of queue.", "LimitToFirst");  
AddNumberParam("Limit", "Limit count.", 1);          
AddAction(32, 0, "Limit to last", "3. Create - Limit", 
          "3. Set limit to <i>{0}</i> to last of current queue", 
          "Limit to last of queue.", "LimitToLast"); 

// 4. add callback
                                                        
//////////////////////////////////////////////////////////////
// Expressions
  
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
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
