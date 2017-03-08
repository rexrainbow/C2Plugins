function GetPluginSettings()
{
	return {
		"name":			"Nickname",
		"id":			"Rex_Nickname",
		"version":		"0.1",
		"description":	"Create object by nickname.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_nickname.html",
		"category":		"Rex - Nickname",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

////////////////////////////////////////
// Conditions 
AddStringParam("Nickname", "Nickname of object.", '""');
AddCondition(1, 0, "Is nickname valid", "Nickname", "Nickname <i>{0}</i> is valid", "Return true if this nickname is valid.", "IsNicknameValid");       

AddStringParam("Nickname", "Nickname of object.", '""');
AddObjectParam("Family", "Family type.");
AddCondition(10, 0, "Pick instances", "SOL", 
             "Pick <i>{0}</i> instances into family <i>{1}</i>", 
             "Pick all instances.", "Pick");
             
AddStringParam("Substring", "Substring to get matched nicknames.", '""');
AddObjectParam("Family", "Family type.");
AddCondition(11, 0, "Pick matched instances", "SOL", 
             "Pick instances with matched substring to <i>{0}</i> into family <i>{1}</i>", 
             "Pick matched instances.", "PickMatched");

////////////////////////////////////////
// Actions
AddStringParam("Nickname", "Nickname of object.", '""');
AddObjectParam("Object", "Object type."); 
AddAction(1, 0, "Assign nickname", "Assign", "Assign nickname <i>{0}</i> to <i>{1}</i>", 
          "Assign nickname.", "AssignNickname");
AddStringParam("Nickname", "Nickname of object.", '""');   
AddNumberParam("X", "X co-ordinate.", 0);
AddNumberParam("Y", "Y co-ordinate.", 0);
AddLayerParam("Layer", "Layer name of number."); 	
AddAction(2, 0, "Create instance", "Create", "Create <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>) on layer <i>{3}</i>", 
          "Create instance by nickname.", "CreateInst");  
AddStringParam("Nickname", "Nickname of object.", '""');   
AddNumberParam("X", "X co-ordinate.", 0);
AddNumberParam("Y", "Y co-ordinate.", 0);
AddLayerParam("Layer", "Layer name of number."); 	
AddObjectParam("Family", "Family object for SOL.");
AddAction(3, 0, "Create instance into family", "Create", "Create <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>) on layer <i>{3}</i>, then put into family <i>{4}</i>", 
          "Create instance by nicknamem then put into family.", "CreateInst");            
AddStringParam("Nickname", "Nickname of object.", '""');  
AddObjectParam("Family", "Family object for SOL."); 
AddAction(10, 0, "Pick all instances", "SOL", 
          "Pick all <i>{0}</i> instances into family <i>{1}</i>", 
          "Pick all.", "Pick");	 	
AddStringParam("Substring", "Substring to get matched nicknames.", '""');
AddObjectParam("Family", "Family type.");
AddAction(11, 0, "Pick matched instances", "SOL", 
          "Pick instances with matched substring to <i>{0}</i> into family <i>{1}</i>", 
          "Pick matched instances.", "PickMatched");          	  
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get last created instance UID", "Created instance", "LastCreatedInstUID", 
              "Get last created instance UID.");

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

IDEInstance.prototype.OnCreate = function()
{
}

IDEInstance.prototype.OnInserted = function()
{
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
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

IDEInstance.prototype.OnTextureEdited = function ()
{
}