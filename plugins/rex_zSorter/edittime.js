function GetPluginSettings()
{
	return {
		"name":			"Z Sorter",
		"id":			"Rex_ZSorter",
		"description":	"Sorts Objects in Layer By Y",
		"author":		"Juan Pablo Tarquino",
		"help url":		"",
		"category":		"General",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

////////////////////////////////////////
// Conditions

////////////////////////////////////////
// Actions
AddAnyTypeParam("Layer", "Layer name of number.", 0);
AddAction(0, 0, "Sort All Objects in Layer By Y", "Depth", 
          "Sort All Objects in Layer <i>{0}</i> By Y", "Sort All Objects in Layer By Y", "SortObjsLayerByY");

////////////////////////////////////////
// Expressions

ACESDone();

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
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}