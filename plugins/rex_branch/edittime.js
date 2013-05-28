function GetPluginSettings()
{
	return {
		"name":			"Branch",
		"id":			"Rex_Branch",
		"version":		"1.0",          
		"description":	"Control the execution flow",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_branch.html",
		"category":		"Control flow",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1, 0, "If (", "Branch", "If (", "Bracnh If.", "BranchIf");
AddCondition(2, 0, "Else if (", "Branch", "Else if (", "Bracnh Else if.", "BranchElseIf");
AddCondition(3, 0, "Else", "Branch", "Else", "Bracnh Else.", "BranchElseIf");
AddCondition(4, 0, ")", "Branch", ")", "Leave branch.", "BranchBreak");

//////////////////////////////////////////////////////////////
// Actions     
          
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
