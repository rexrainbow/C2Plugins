function GetBehaviorSettings()
{
	return {
		"name":			"Tree node",
		"id":			"rex_treenode",
		"version":		"0.1",
		"description":	"Get parent or children instance(s) from a tree.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/behavior_rex_treenode.html",
		"category":		"General",
		"flags":		bf_onlyone
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(20, 0, "Is root", "Tree", "{my} is root", 
             "Return true if this node is the root.", "IsRoot");
AddCondition(21, 0, "Has child", "Tree", "{my} has any child", 
             "Return true if this node has any child.", "HasChild"); 
AddCondition(22, 0, "Has sibling", "Tree", "{my} has any sibling", 
             "Return true if this node has any sibling.", "HasSibling");                       
//////////////////////////////////////////////////////////////
// Actions 
AddObjectParam("Group", "Instance group object");
AddAction(0, 0, "Set instance group ", "Setup", 
          "Set {my} instance group object to <i>{0}</i>", 
          "Set instance group object.", "SetInstanceGroup");  
AddObjectParam("Object", "Object type."); 
AddAction(1, 0, "Assign parent", "Parent", 
          "Assign {my} parent to <i>{0}</i>", 
          "Assign parent instance.", "AssignParent"); 
AddObjectParam("Object", "Object type."); 
AddNumberParam("X", "X co-ordinate.", 0);
AddNumberParam("Y", "Y co-ordinate.", 0);
AddLayerParam("Layer", "Layer name of number.");
AddAction(2, 0, "Create child", "Child", 
          "Create {my} child <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>) on layer <i>{3}</i>", 
          "Create child instance.", "CreateChild");
AddObjectParam("Object", "Object type."); 
AddAction(3, 0, "Add children", "Child", 
          "Add {my} children <i>{0}</i>", 
          "Add children instance.", "AddChildren");
AddAction(4, 0, "Remove", "Tree", 
          "Remove {my} from tree", 
          "Remove this node from tree.", "RemoveFromTree");   
AddNumberParam("UID", "Parent UID.", -1);
AddAction(5, 0, "Assign parent by UID", "Parent", 
          "Assign {my} parent to UID: <i>{0}</i>", 
          "Assign parent by UID.", "AssignParent");
AddNumberParam("UID", "Child UID.", -1);
AddAction(6, 0, "Add children by UID", "Child", 
          "Add {my} children UID: <i>{0}</i>", 
          "Add children by UID.", "AddChildren");                                         
AddStringParam("Group", "Put result in this group", '""');
AddComboParamOption("children");
AddComboParamOption("children and grandson");
AddComboParam("Children type", "Children and grandson.", 0);  
AddAction(21, 0, "Pick children", "SOL", 
          "Pick {my} <i>{1}</i> UID into group <i>{0}</i>", 
          "Pick children.", "PickChildren");
AddStringParam("Group", "Put result in this group", '""'); 
AddAction(22, 0, "Pick parent", "SOL", 
          "Pick {my} parent UID into group <i>{0}</i>",  
          "Pick parent.", "PickParent");
AddStringParam("Group", "Put result in this group", '""');
AddAction(23, 0, "Pick sibling", "SOL", 
          "Pick {my} sibling UID into group <i>{0}</i>",  
          "Pick sibling.", "PickSibling"); 
AddStringParam("Group", "Put result in this group", '""');
AddAction(24, 0, "Pick root", "SOL", 
          "Pick {my} root UID into group <i>{0}</i>",  
          "Pick root.", "PickRoot");           
               	         
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get children count", "Count", "ChildrenCount", 
              "Get children count of this node."); 
AddExpression(2, ef_return_number, "Get sibling count", "Count", "SiblingCount", 
              "Get sibling count of this node.");                
AddExpression(11, ef_return_number, "Get parent UID", "Parent", "ParentUID", 
              "Get parent UID of this node. (-1) means that it does not have parent."); 
AddExpression(12, ef_return_number, "Get root UID", "Parent", "RootUID", 
              "Get root UID of this node.");              
AddExpression(13, ef_return_number, "Get first child UID", "Children", "FirstChildUID", 
              "Get first child UID of this node. (-1) means that it does not have any child."); 
AddExpression(14, ef_return_number, "Get last child UID", "Children", "LastChildUID", 
              "Get last child UID of this node. (-1) means that it does not have any child.");
AddExpression(15, ef_return_number, "Get first sibling UID", "Sibling", "FirstSiblingUID", 
              "Get first sibling UID of this node. (-1) means that it does not have any sibling.");          
AddExpression(16, ef_return_number, "Get last sibling UID", "Sibling", "LastSiblingUID", 
              "Get last sibling UID of this node. (-1) means that it does not have any sibling.");
                                                
ACESDone();

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

// Class representing an individual instance of the behavior in the IDE
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
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
