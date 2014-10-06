function GetPluginSettings()
{
	return {
		"name":			"SysExt",
		"id":			"Rex_SysExt",
		"version":		"0.11",	
		"description":	"System extension",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_systemext.html",
		"category":		"Rex - System helper",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddObjectParam("Object", "Object for picking");
AddCondition(0, cf_deprecated, "Pick all instances", "SOL", 
             "Pick all <i>{0}</i> instances", 
             "Pick all instances.", "PickAll");
AddObjectParam("Object", "Object for picking");
AddNumberParam("UID", "UID of object", 0);
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddCondition(1, cf_deprecated, "Pick inverse", "SOL", 
             "Pick <i>{0}</i> inverse instances by UID to <i>{1}</i>, form <i>{2}</i>", 
             "Pick inverse instances.", "PickInverse");  
AddObjectParam("Object", "Object for picking");
AddNumberParam("UID", "UID of object", 0);
AddCondition(2, cf_deprecated, "Quick picking by UID", "SOL", 
             "Quick picking <i>{0}</i> instance by UID = <i>{1}</i>", 
             "Quick picking instance by UID.", "QuickPickByUID");                 
//////////////////////////////////////////////////////////////
// Actions
// SOL
// valid 
AddObjectParam("Object", "Object for picking");
AddAction(0, 0, "Pick all instances", "SOL", 
          "Pick all <i>{0}</i>", 
          "Pick all instances.", "PickAll");
// ----          
AddObjectParam("Object", "Object for picking");
AddNumberParam("UID", "UID of object", 0);
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddAction(1, af_deprecated, "Pick by UID", "SOL", 
          "Pick <i>{0}</i> instance by UID to <i>{1}</i>, form <i>{2}</i>", 
          "Pick instance by UID.", "__PickByUID");          
AddObjectParam("Object", "Object for picking");
AddComboParamOption("uid");
AddComboParamOption("x");
AddComboParamOption("y");
AddComboParamOption("width");
AddComboParamOption("height");
AddComboParamOption("angle");
AddComboParamOption("opacity");
AddComboParam("Properties", "Properties of instance", 0);
AddCmpParam("Comparison", "Choose the way to compare the variable.");
AddAnyTypeParam("Value", "The target compare value", 0);
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddAction(2, af_deprecated, "Pick by property", "SOL", 
          "Pick <i>{0}</i> instances by comparing <i>{1}</i> <i>{2}</i> <i>{3}</i>, form <i>{4}</i>", 
          "Pick instances by property comparing.", "PickByPropCmp");
// valid           
AddStringParam("Group", "Group name", '""');          
AddNumberParam("Group actived", "0 = disable, 1 = enable, 2 = toggle", 0);          
AddAction(3, 0, "Set group active", "General", 
          "Set group <i>{0}</i> to <i>{1}</i>", 
          "Active or deactive an event group.", "SetGroupActive"); 
// valid                 
AddAnyTypeParam("Layer", "Name or number of the layer to set visible", 0);          
AddNumberParam("Visibled", "0 = invisible, 1 = visible", 0);          
AddAction(4, 0, "Set visible", "Layers & transforms", 
          "Set layer <i>{0}</i>'s visible to <i>{1}</i>", 
          "Set the visible of a layer.", "SetLayerVisible");
// valid                       
AddObjectParam("Object", "Object for picking");
AddNumberParam("UID", "UID of object", 0);
AddAction(5, 0, "Pick by UID", "SOL", 
          "Pick <i>{0}</i> with UID <i>{1}</i>", 
          "Pick by UID.", "PickByUID");   
// ----                                     
AddObjectParam("Object", "Object for picking");
AddNumberParam("UID", "UID of object", 0);
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddAction(6, af_deprecated, "Pick inverse", "SOL", 
          "Pick <i>{0}</i> with UID NOT <i>{1}</i>, form <i>{2}</i>", 
          "Pick inverse instances.", "PickInverse");            
// valid                 
AddObjectParam("Object", "Object for picking");
AddNumberParam("UID", "UID of object", 0);
AddComboParamOption("Current picked instances");
AddComboParamOption("All instances");
AddComboParam("All instances", "Pick from current picked instances or all instances", 1);
AddAction(7, 0, "Pick inverse", "SOL", 
          "Pick <i>{0}</i> with UID NOT <i>{1}</i>, form <i>{2}</i>", 
          "Pick inverse instances.", "PickInverse");                
//////////////////////////////////////////////////////////////
// Expressions
AddStringParam('""', "Code string.", '""');
AddExpression(0, ef_deprecated | ef_return_any | ef_variadic_parameters, "Eval js code", "Javascript", "Eval", "Eval js code string.");
AddNumberParam("Number", "Decimal number", 0);
AddExpression(1, ef_return_string, "Get hex string", "Math", "ToHexString", "Transfer decimal value to hex string.");


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
