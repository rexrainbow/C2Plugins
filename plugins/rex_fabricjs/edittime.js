function GetPluginSettings()
{
	return {
		"name":			"Fabric",
		"id":			"Rex_fabric",
		"version":		"0.1",
		"description":	"Canvas library. http://fabricjs.com/",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_fabric.html",
		"category":		"Rex - Canvas",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_tiling | pf_zorder_aces,
        "dependency":	"fabric.min.js"        
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different callback.", "\"\"");
AddCondition(1, cf_trigger, "Callback", "Callback", 
            "On {0}",
            "Callback.", "OnCallback");
            
//////////////////////////////////////////////////////////////
// Actions
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');
AddStringParam("Type name", "Type name.", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddComboParamOption("");
AddComboParamOption(", add to canvas");
AddComboParam("Add", "Add to canvas.", 1);
AddAction(1, 0, "Create object", "Object", 
          "{0}: Create {1} ({2}) {3}", 
          "Create object.", "CreateObject"); 
          
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');
AddAction(2, 0, "Add", "Object", 
          "{0}: Add to canvas", 
          "Add object to canvas.", "AddToCanvas"); 

AddAction(3, 0, "Render", "Canvas", 
          "Render all", 
          "Render all objects on canvas.", "RenderAll");           
          
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');
AddAction(4, 0, "Remove", "Object", 
          "{0}: Remove from canvas", 
          "Remove object from canvas.", "RemoveFromCanvas");           

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');         
AddStringParam("Property", "Property name in dot notation", '""');
AddAnyTypeParam("Value", "Value to set", 0);
AddAction(11, 0, "Set value", "Property", 
          "{0}: Set {1} to {2}",
          "Set property.", "SetValue"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');             
AddStringParam("Property", "Property name in dot notation", '""');
AddStringParam("JSON", "JSON value to set", '""');
AddAction(12, 0, "Set JSON", "Property", 
          "{0}: Set {1} to {2}",
          "Set property to JSON string.", "SetJSON"); 

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');            
AddStringParam("Property", "Property name in dot notation", '""');
AddComboParamOption("false");
AddComboParamOption("true");
AddComboParam("Boolean", "Boolean value.", 0);
AddAction(13, 0, "Set boolean", "Property", 
          "{0}: Set {1} to {2}",
          "Set property to a boolean value.", "SetBoolean");          
          
AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');
AddStringParam("Event name", "Event name.", '""');
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different callback.", "\"\"");
AddAction(21, 0, "Add event listener", "Event", 
          "{0}: Add {1} event listener to callback {2}", 
          "Add event listener.", "AddEventListener");           
//////////////////////////////////////////////////////////////
// Expressions
AddAnyTypeParam("Index", "The zero-based index of the parameter to get, or name in string.");
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(1, ef_return_any | ef_variadic_parameters, "Get parameter of callback", "Callback", "Param", "Get the value of a parameter passed to the callback.");

AddExpression(2, ef_return_number, "Get parameter count of callback", "Callback", "ParamCount", "Get the number of parameters passed to callback.");

AddAnyTypeParam("Variable name", "Variable name of this tone object", '""');        
//AddStringParam("Property", "Property name in dot notation", '""');
AddExpression(11, ef_return_any | ef_variadic_parameters, "Get property", "Property", "Property", "Get property.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo,	"Interaction",	"Yes",	'Set to "No" to have a light weight api.', "No|Yes"),
	new cr.Property(ept_combo,	"Initial visibility",	"Visible",	"Choose whether the object is visible when the layout starts.", "Invisible|Visible"),
	new cr.Property(ept_combo,	"Hotspot",				"Top-left",	"Choose the location of the hot spot in the object.", "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right")
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
	return new IDEInstance(instance);
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
		
	// Plugin-specific variables
	this.just_inserted = false;
}

IDEInstance.prototype.OnCreate = function()
{

	switch (this.properties["Hotspot"])
	{
    case "Top-left" :
      this.instance.SetHotspot(new cr.vector2(0, 0));
      break;
    case "Top" :
      this.instance.SetHotspot(new cr.vector2(0.5, 0));
      break;
    case "Top-right" :
      this.instance.SetHotspot(new cr.vector2(1, 0));
      break;
    case "Left" :
      this.instance.SetHotspot(new cr.vector2(0, 0.5));
      break;
    case "Center" :
      this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
      break;
    case "Right" :
      this.instance.SetHotspot(new cr.vector2(1, 0.5));
      break;
    case "Bottom-left" :
      this.instance.SetHotspot(new cr.vector2(0, 1));
      break;
    case "Bottom" :
      this.instance.SetHotspot(new cr.vector2(0.5, 1));
      break;
    case "Bottom-right" :
		  this.instance.SetHotspot(new cr.vector2(1, 1));
      break;
	}
}

IDEInstance.prototype.OnInserted = function()
{
	this.just_inserted = true;
}

IDEInstance.prototype.OnDoubleClicked = function()
{
	this.instance.EditTexture();
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
	// Edit image link
	if (property_name === "Hotspot")
	{
        switch (this.properties["Hotspot"])
        {
          case "Top-left" :
            this.instance.SetHotspot(new cr.vector2(0, 0));
          break;
          case "Top" :
            this.instance.SetHotspot(new cr.vector2(0.5, 0));
          break;
          case "Top-right" :
            this.instance.SetHotspot(new cr.vector2(1, 0));
          break;
          case "Left" :
            this.instance.SetHotspot(new cr.vector2(0, 0.5));
          break;
          case "Center" :
            this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
          break;
          case "Right" :
            this.instance.SetHotspot(new cr.vector2(1, 0.5));
          break;
          case "Bottom-left" :
            this.instance.SetHotspot(new cr.vector2(0, 1));
          break;
          case "Bottom" :
            this.instance.SetHotspot(new cr.vector2(0.5, 1));
          break;
          case "Bottom-right" :
            this.instance.SetHotspot(new cr.vector2(1, 1));
          break;
        }
	}
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}