function GetPluginSettings()
{
	return {
		"name":			"Yahoo finance",
		"id":			"Rex_YahooFinance",
		"version":		"0.1",        
		"description":	"Read stocks info from yahoo.finance.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_yahoofinance.html",
		"category":		"Rex - Web - YQL",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal,
		"dependency":	"jquery.xdomainajax.js"		
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different requests.", "\"\"");
AddCondition(0,	cf_trigger, "On completed", "Request", "On <b>{0}</b> completed", 
             "Triggered when a request completes successfully.", "OnComplete");

AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different requests.", "\"\"");
AddCondition(1,	cf_trigger, "On error", "Request", "On <b>{0}</b> error", 
             "Triggered when an page request fails.", "OnError");

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Tag", "A tag, which can be anything you like, to distinguish between different requests.", "\"\"");
AddStringParam("Symbol", "Symbol of stock.", '"AAPL"');
AddNumberParam("Start year", "Start year of history.", 2016);
AddNumberParam("Start month", "Start month of history.", 1);
AddNumberParam("Start date", "Start date of history.", 1);
AddNumberParam("End year", "End year of history.", 2016);
AddNumberParam("End month", "End month of history.", 1);
AddNumberParam("End date", "End date of history.", 31);
AddAction(1, 0, "Request stock historical data", "Stock historical data", 
          "Request stock <i>{1}</i> historical data from <i>{2}</i>-<i>{3}</i>-<i>{4}</i> to <i>{5}</i>-<i>{6}</i>-<i>{7}</i> (tag <i>{0}</i>)", 
          "Request stock historical data.", "RequestStickHistoricalData");


//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string, "Get last data", "Result", 
              "LastData", 
              "Get the data returned by the last successful request.");
              

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
