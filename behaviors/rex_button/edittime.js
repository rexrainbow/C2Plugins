function GetBehaviorSettings()
{
	return {
		"name":			"Button",
		"id":			"Rex_Button2",
		"version":		"0.1",        
		"description":	'Get click event while "touch end".',
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_button.html",
		"category":		"Rex - Touch",
		"flags":		bf_onlyone
	};
};
//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On clicked", "Click", "On {my} clicked", "Triggered when clicked.", "OnClick");
AddCondition(2,	cf_trigger, "On click cancel", "Click", "On {my} click cancel", "Triggered when clicking canceled.", "OnClickCancel");
AddCondition(3,	cf_trigger, "On click detecting start", "Click", "On {my} detecting start", "Triggered when clicking detecting start.", "OnClickStart");
AddCondition(4,	cf_trigger, "On activated", "Button", "On {my} activated", "Triggered when button activated.", "OnActivated");
AddCondition(5,	cf_trigger, "On inactivated", "Button", "On {my} inactivated", "Triggered when button inactivated.", "OnInactivated");
AddCondition(6,	cf_trigger, "On rolling in", "Rolling over", "On {my} rolling in", "Triggered when rolling-in.", "OnRollingIn");
AddCondition(7,	cf_trigger, "On rolling out", "Rolling over", "On {my} rolling out", "Triggered when rolling-out.", "OnRollingOut");

AddCondition(11, 0, "Is enable", "Enable", "Is {my} enable", "Return true if this button is enable.", "IsEnable");

//////////////////////////////////////////////////////////////
// Actions
AddAction(1, 0, "Activate", "Request - Activate", 
          "{my} goto ACTIVE state", 
          "Goto ACTIVE state.", "GotoACTIVE");   
AddAction(2, 0, "Deactivate", "Request - Deactivate", 
          "{my} goto INACTIVE state", 
          "Goto INACTIVE state.", "GotoINACTIVE");                       
AddAnyTypeParam("Normal", 'Frame index (number) or animation name (string) at normal state, "" is ignored.', '""');
AddAnyTypeParam("Click", 'Frame index (number) or animation name (string) at click state, "" is ignored.', '""');
AddAnyTypeParam("INACTIVE", 'Frame index (number) or animation name (string) at INACTIVE state, "" is ignored.', '""');
AddAnyTypeParam("Rolling-in", 'Frame index (number) or animation name (string) at rolling-un state, "" is ignored.', '""');
AddAction(3, 0, "Set display of states", "Display", 
          "Set display of state, normal: <i>{0}</i>, click: <i>{1}</i>, INACTIVE: <i>{2}</i>, rolling-in: <i>{3}</i>", 
          "Set display of states.", "SetDisplay");        
AddAction(4, 0, "Cancel click detecting", "Click detecting state", 
          "Cancel {my} click detecting", 
          "Cancel click detecting at click detecting state.", "GotoACTIVE");
AddLayerParam("Layer", "Layer name of number."); 	
AddAction(5, 0, "Activate in layer", "Request - Activate", 
          "{my} goto ACTIVE state if in layer <i>{0}</i>, else goto INACTIVE state", 
          "Goto ACTIVE state if in layer, else goto INACTIVE state.", "GotoACTIVE");
AddLayerParam("Layer", "Layer name of number.");           
AddAction(6, 0, "Deactivate in layer", "Request - Deactivate", 
          "{my} goto INACTIVE state if in layer <i>{0}</i>, else goto ACTIVE state", 
          "Goto INACTIVE state if in layer, else goto ACTIVE state.", "GotoINACTIVE"); 

AddComboParamOption("On clicked");
AddComboParamOption("On click cancel");
AddComboParamOption("On click detecting start");
AddComboParamOption("On activated");
AddComboParamOption("On inactivated");
AddComboParamOption("On rolling in");
AddComboParamOption("On rolling out");
AddComboParam("Condition type", "Condition type.", 0);          
AddAction(11, 0, "Manual trigger", "Condition", 
          "Manual trigger {my} condition: <i>{0}</i>", 
          "Manual trigger condition.", "ManualTriggerCondition");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Current state", "State", "CurState", "Get current button state.");
AddExpression(1, ef_return_string, "Previous state", "State", "PreState", "Get previous button state.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Activated", "Yes", "Enable if you wish this goto ACTIVE state at the start of the layout.", "No|Yes"),
	new cr.Property(ept_combo, "Click mode", "Released", "Clicking when touch released or pressed.", "Released|Pressed"),    
	new cr.Property(ept_combo, "Activated after Clicked", "Yes", "Auto back to ACTIVE state after CLICKED state.", "No|Yes"),
	new cr.Property(ept_combo, "Visible checking", "Yes", "Set Yes to enable button if visible.", "No|Yes"),
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
