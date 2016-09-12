function GetBehaviorSettings()
{
	return {
		"name":			"HTML2Canvas",
		"id":			"Rex_HTML2Canvas",
		"description":	"Snapshot html element into an image",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_html2canvas.html",
		"category":		"Rex - HTML",
		"flags":		0,
		"dependency":	"html2canvas.min.js"        
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On snapsot", "Snapshot", "On {my} snapsot", 
                    "Triggered when the snapshot of current image is ready.", "OnSnapshot"); 
             
//////////////////////////////////////////////////////////////
// Actions 
AddAction(1, 0, "Snapshot", "Snapshot", 
          "{my} Take a snapshot.", 
          "Take a screenshot of html element.", "Snapshot");  
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get snapshot", "Snapshot", "Snapshot", "Snapshot image in Base64.");


ACESDone();

// Property grid properties for this plugin
var property_list = [    
	new cr.Property(ept_combo, "CORS", "Yes", "Whether to attempt to load cross-origin images as CORS served, before reverting back to proxy.", "No|Yes"), 
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
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
