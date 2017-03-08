function GetPluginSettings()
{
	return {
		"name":			"Wait Event",
		"id":			"Rex_WaitEvent",
		"version":		"0.1",   		
		"description":	"Wait events finished.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_waitevent.html",
		"category":		"Rex - Logic - flow control",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag","Event tag.","");
AddCondition(1,cf_trigger,"On all events finished","Finsihed",
             "On all events with tag <b>{0}</b> has finished",
             "Triggered when all events with tag has finished.","OnAllEventsFinished");
             
AddStringParam("Tag","Event tag.","");
AddCondition(2,cf_trigger,"On any event finished","Finsihed",
             "On any event with tag <b>{0}</b> has finished",
             "Triggered when any event with tag has finished.","OnAnyEventFinished");            
             
AddStringParam("Tag","Event tag.","");
AddCondition(3, 0,"No wait event","Wait",
             "No wait event in tag <b>{0}</b>",
             "Return true if no wait event in tag.","NoWaitEvent");		 

AddCondition(4,cf_trigger,"On waiting start","Start",
             "On waiting any event started",
             "Triggered when start to wait any event.","OnAnyEventStart");
             
AddStringParam("Event name","Event name.","");     
AddStringParam("Tag","Event tag.","");
AddCondition(5, 0,"Is waiting","Wait",
             "Is waiting event <b>{0}</b> with tag <b>{1}</b>",
             "Return true if an event is waited.","IsWaiting");		              
             
//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Event name","Event name.","");     
AddStringParam("Tag","Event tag.","");
AddAction(1,0,"Wait event","Wait",
          "Wait event <b>{0}</b> with tag <b>{1}</b>",
          "Wait event.","WaitEvent");
AddStringParam("Event name","Event name.","");     
AddStringParam("Tag","Event tag.","");
AddAction(2,0,"Event has finished","Finished",
          "Event <b>{0}</b> with tag <b>{1}</b> has finished",
          "Event has finished.","EventFinished");		  
   
AddStringParam("Tag","Event tag.","");
AddAction(11,0,"Cancel events","Cancel",
          "Cancel events with tag <b>{0}</b>",
          "Cancel events.","CancelEvents");		  
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1,ef_return_string,"Get current finished event name","Event name","CurEventName","Get triggered event name.");
AddExpression(2,ef_return_string,"Get current finished tag","Tag","CurTag","Get triggered tag.");

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
