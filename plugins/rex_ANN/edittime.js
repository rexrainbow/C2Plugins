function GetPluginSettings()
{
	return {
		"name":			"ANN",
		"id":			"Rex_ANN",
		"version":		"0.1",   		
		"description":	"Artificial Neural Networ, using back-Propagation and one hidden layer.",
		"author":		"Rex.Rainbow",
		"help url":		"https://dl.dropbox.com/u/5779181/C2Repo/rex_ann.html",
		"category":		"AI",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0
	};
};

//////////////////////////////////////////////////////////////
// Conditions
                     
//////////////////////////////////////////////////////////////
// Actions     
AddNumberParam("Rate", "Learning rate", 0.5);
AddNumberParam("Moment", "Momentum factor", 0.1);  
AddAction(0, 0, "Define hidden node count", "Define", 
          "Set learning rate to <i>{0}</i>, momentum factor to <i>{1}</i>", 
          "Set learning rate and momentum factor.", "SetRateMoment");
          
AddVariadicParams("Input {n}", "Name of input variables.");
AddAction(1, 0, "Define inputs", "Define", 
          "Define inputs (<i>{...}</i>)", 
          "Define input variables by name.", "DefineInput");
AddVariadicParams("Output {n}", "Name of output variables.");
AddAction(2, 0, "Define outputs", "Define", 
          "Define outputs (<i>{...}</i>)", 
          "Define outputs variables by name.", "DefineOutput");
AddNumberParam("Node count", "Node count of hidden layer", 0);
AddAction(3, 0, "Define hidden node count", "Define", 
          "Define node count of hidden layer to <i>{0}</i>", 
          "Define node count of hidden layer.", "DefineHiddenNode");
          
AddAnyTypeParam("Name", "Name of input variable", '""');          
AddNumberParam("Value", "Value of input variable", 0);          
AddAction(4, 0, "Set input", "Input", 
          "Set input <i>{0}</i> to <i>{1}</i>", 
          "Set input value.", "SetInput");
AddAnyTypeParam("Name", "Name of output variable", '""');          
AddNumberParam("Value", "Value of output variable", 0);          
AddAction(5, 0, "Set target", "Target", 
          "Set target output <i>{0}</i> to <i>{1}</i>", 
          "Set target output value for learning.", "SetTarget"); 
          
AddAction(6, 0, "Train", "Train", 
          "Train by current inputs and outputs", 
          "Train by current inputs and outputs to adjust the weights.", "Train");
AddAction(7, 0, "Recall", "Recall", 
          "Recall by current inputs", 
          'Recall by current inputs, get output from "expression:Output".', "Recall");                  

//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Output", "Output name.", '""');
AddExpression(1, ef_return_number, "Get output value", "Recall", "Output", "Get output value.");
AddExpression(2, ef_return_number, "Get error", "Train", "TrainErr", "Get error result of training.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_float, "Rate", 0.5, "Learning rate."),
    new cr.Property(ept_float, "Momentum", 0.1, "Momentum factor."),
    new cr.Property(ept_text, "Input variables", "", 'Input variables for Input layer like "A","B"'),
    new cr.Property(ept_integer, "Hidden layer", 3, "Node count of Hidden layer."),
    new cr.Property(ept_text, "Output variables", "", 'Output variables for Output layer like "O"'),
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
