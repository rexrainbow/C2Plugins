function GetPluginSettings()
{
	return {
		"name":			"Loop iterator",
		"id":			"Rex_LoopIterator",
		"version":		"0.1",
		"description":	"An iterator to return loop index",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_loopiterator.html",
		"category":		"Rex - Logic - flow control",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,0 ,"Has next","Next",
             "Has next",
             "Return true if this iterator has next values.","HasNext");
             
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Name", "Variable name.", '""');
AddNumberParam("Start", "Start index.", 0);
AddNumberParam("End", "End index.", 9);
AddNumberParam("Step", "Step.", 1);
AddAction(1, 0, "Add loop", "Add", 
          "Add loop <i>{0}</i> : from <i>{1}</i> to <i>{2}</i>, step <i>{3}</i>", 
          "Add loop definitation.", "AddForLoop");
AddStringParam("Name", "Variable name.", '""');
AddStringParam("List", "List in JSON format.", '""');
AddAction(2, 0, "Add list ", "Add", 
          "Add list <i>{0}</i> : <i>{1}</i>", 
          "Add list definitation.", "AddList");          
AddAction(3, 0, "Next", "Next", 
          "Next", 
          "Go to next stage.", "Next");       
            
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Name", "Variable name", '""');
AddExpression(1, ef_return_any, "Variable", "Return", "loopindex", 
              "Get return loop index value.");

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
