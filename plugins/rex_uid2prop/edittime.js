function GetPluginSettings()
{
	return {
		"name":			"UID to Properties",
		"id":			"Rex_UID2Prop",
		"version":		"0.1",        
		"description":	"Get properties (x,y,angle,opacity,private variable) by UID.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_uid2prop.html",
		"category":		"Rex - Instance properties",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Alias", "An alias to identify this private variable.");
AddObjectParam("Object", "Object type.");
AddObjectInstanceVarParam("Instance variable", "Choose the instance variable in the above object.");
AddAction(1, af_none, "Define alias", "Private variable", 
          "Define alias <b>{0}</b> refer to {1} variable <b>{2}</b>", 
          "Define an alias of private variable.", "DefinePrivateVariableAlias");

//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(1, ef_return_number, "Get position X", "Position", "X", "Get instance's position X.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(2, ef_return_number, "Get position Y", "Position", "Y", "Get instance's position Y.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(3, ef_return_number, "Get angle", "Angle", "Angle", "Get instance's angle.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(4, ef_return_number, "Get width", "Size", "Width", "Get instance's width.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(5, ef_return_number, "Get height", "Size", "Height", "Get instance's height.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(6, ef_return_number, "Get opacity", "Opacity", "Opacity", "Get instance's opacity.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(7, ef_return_number, "Get visible", "Visible", "Visible", "Get instance's visible.");
AddNumberParam("UID", "The UID of instance.", 0);
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.", 0);
AddExpression(8, ef_return_number, "Get image point X", "Image point", "ImgptX", "Get instance's image point X.");
AddNumberParam("UID", "The UID of instance.", 0);
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.", 0);
AddExpression(9, ef_return_number, "Get image point Y", "Image point", "ImgptY", "Get instance's image point Y.");
AddNumberParam("UID", "The UID of instance.", 0);
AddStringParam("Alias", "An alias to identify this private variable.");
AddExpression(10, ef_return_any, "Get value of private variable", "Private variable", "PV", "Get value of private variable by alias.");

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
