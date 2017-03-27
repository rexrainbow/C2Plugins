function GetBehaviorSettings()
{
	return {
		"name":			"Line",
		"id":			"Rex_Line",
		"description":	"Set position, angle, and width of this instance, to be a line.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_line.html",
		"category":		"Rex - Movement - width",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions 
AddNumberParam("Start X", "The X co-ordinate of Start point.");
AddNumberParam("Start Y", "The Y co-ordinate of Start point.");
AddNumberParam("End X", "The X co-ordinate of End point.");
AddNumberParam("End Y", "The Y co-ordinate of End point.");
AddAction(1, 0, "Line between points", "Line between", 
          "{my} from (<i>{0}</i>, <i>{1}</i>) to (<i>{2}</i>, <i>{3}</i>)",
          "Line between two points.", "LineBtPoints");  
AddObjectParam("Start", "Start object.");
AddObjectParam("End", "End object.");
AddAction(2, 0, "Line between instances", "Line between", 
          "{my} from <i>{0}</i> to <i>{1}</i>",
          "Line between two instances.", "LineBtInsts");  
AddNumberParam("Start", "UID of Start object.");
AddNumberParam("End", "UID of End object.");
AddAction(3, 0, "Line between instances by UID", "Line between", 
          "{my} from instance UID:<i>{0}</i> to instance UID:<i>{1}</i>",
          "Line between two instances by UID.", "LineBtInstsUID"); 
AddNumberParam("End X", "The X co-ordinate of End point.");
AddNumberParam("End Y", "The Y co-ordinate of End point.");
AddAction(4, 0, "Line to point", "Line to", 
          "{my} to (<i>{0}</i>, <i>{1}</i>)",
          "Line to point.", "LineToPoint");  
AddObjectParam("End", "End object.");
AddAction(5, 0, "Line to instance", "Line to", 
          "{my} to <i>{0}</i>",
          "Line to instance.", "LineToInst"); 
AddNumberParam("End", "UID of End object.");
AddAction(6, 0, "Line to instance by UID", "Line to", 
          "{my} to instance UID:<i>{0}</i>",
          "Line to instance by UID.", "LineToIntUID"); 

AddObjectParam("Start", "Start object.");
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddObjectParam("End", "End object.");
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddAction(11, 0, "Lock between instances", "Lock", 
          "{my} lock from <i>{0}</i> (image point {1}) to <i>{2}</i> (image point {3})",
          "Lock between two instances.", "LockBtInsts");      
AddNumberParam("Start", "UID of Start object.");
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddNumberParam("End", "UID of End object.");
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddAction(12, 0, "Lock between instances by UID", "Lock", 
          "{my} lock from instance UID:<i>{0}</i> (image point {1}) to instance UID:<i>{2}</i> (image point {3})",
          "Lock between two instances by UID.", "LockBtInstsUID");   
          
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get X co-ordinate of line end", "End", "EndX", 
             "Get X co-ordinate of line end.");
AddExpression(2, ef_return_number, "Get Y co-ordinate of line end", "End", "EndY", 
             "Get Y co-ordinate of line end.");
             
AddExpression(11, ef_return_number, "Get UID of start instance", "Lock", "StartUID", 
             "Get UID of start instance. Return (-1) if start instance is invalided.");
AddExpression(12, ef_return_number, "Get UID of end instance", "Lock", "EndUID", 
             "Get UID of end instance. Return (-1) if end instance is invalided.");    
             
ACESDone();

// Property grid properties for this plugin
var property_list = [    
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
