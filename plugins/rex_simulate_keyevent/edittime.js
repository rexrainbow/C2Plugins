function GetPluginSettings()
{
	return {
		"name":			"Simulate key event",
		"id":			"Rex_SimulateInput",
		"version":		"0.1",        
		"description":	"Fire keyboard or touch events.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_simulateinput.html",
		"category":		"Rex - Input",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddKeybParam("Key", "Choose a key.  Note that international users and users on different operating systems or devices may not have the same keys available.");
AddComboParamOption("down");
AddComboParamOption("up");
AddComboParam("Event type", "Event type.",0);
AddAction(1, 0, "Simulate keyboard event", "Keyboard", 
          "Simulate keyboard <i>{0}</i> <i>{1}</i>", 
          "Simulate keyboard event.", "SimulateKeyboard");
           
AddNumberParam("Keycode", "Choose a numeric key code to fire.");
AddComboParamOption("down");
AddComboParamOption("up");
AddComboParam("Event type", "Event type.",0);
AddAction(2, 0, "Simulate keyboard event by keycode", "Keyboard", 
          "Simulate keyboard <i>{0}</i> <i>{1}</i>", 
          "Simulate keyboard event.", "SimulateKeyboard");
               
AddNumberParam("X", "Touch X position.");
AddNumberParam("Y", "Touch Y position.");          
AddLayerParam("Layer", "Position related on layer.");
AddNumberParam("Identifier", "Identifier of this touch start event.", 0);   
AddAction(11, 0, "Simulate touch start", "Touch", 
          "Simulate touch: <i>{3}</i> start at (<i>{0}</i> , <i>{1}</i>) on layer <i>{2}</i>", 
          "Simulate touch start.", "SimulateTouchStart");       

AddNumberParam("Identifier", "Identifier of this touch start event.", 0);    
AddAction(12, 0, "Simulate touch end", "Touch", 
          "Simulate touch: <i>{0}</i> end", 
          "Simulate touch end.", "SimulateTouchEnd");
        
AddNumberParam("X", "Touch X position.");
AddNumberParam("Y", "Touch Y position.");          
AddLayerParam("Layer", "Position related on layer.");
AddNumberParam("Identifier", "Identifier of this touch start event.", 0);    
AddAction(13, 0, "Simulate touch move", "Touch", 
          "Simulate touch: <i>{3}</i> move to (<i>{0}</i> , <i>{1}</i>) on layer <i>{2}</i>", 
          "Simulate touch move.", "SimulateTouchMove"); 

//////////////////////////////////////////////////////////////
// Expressions


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
