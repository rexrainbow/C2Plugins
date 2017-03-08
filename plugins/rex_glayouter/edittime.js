function GetPluginSettings()
{
	return {
		"name":			"Layouter",
		"id":			"Rex_Layouter",
		"version":		"0.1",
		"description":	"Layout instances to get position and angle.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_glayouter.html",
		"category":		"Rex - Layouter",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":	    pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces
	};
};

////////////////////////////////////////
// Conditions 
AddCondition(1, cf_trigger, "On layout instance", "Layout", 
             "On layout instance", 'Trigger by "Action:Add instances" or "Action:Create&Add instances" to layout instance.', "OnLayoutInst");       
AddObjectParam("Object", "Object for picking");
AddCondition(10, cf_not_invertible, "Pick instances", "SOL: instances", 
             "Pick <i>{0}</i>", "Pick instances.", "PickInsts"); 
AddCondition(11, cf_not_invertible, "Pick all instances", "SOL: instances", 
             "Pick all instances in this layouter", "Pick all instances in this layouter.", "PickAllInsts");                      
AddObjectParam("Instance", "Instance under layouter");
AddCondition(21, cf_static | cf_not_invertible, "Pick layouter", "SOL: layouter", 
          "Pick layouter by <i>{0}</i>", "Pick layouter by instance.", "PickLayouter");   
		  
////////////////////////////////////////
// Actions
AddObjectParam("Instances", "Add instances into layouter.");
AddAction(3, 0, "Add instances", "Add/Remove", "Add instances <i>{0}</i>", 
          "Add instances.", "AddInsts");             
AddObjectParam("Instances", "Add instances into layouter.");       
AddNumberParam("X", "X co-ordinate.", 0);
AddNumberParam("Y", "Y co-ordinate.", 0);
AddLayerParam("Layer", "Layer name of number.");
AddAction(4, 0, "Create&Add instances", "Add/Remove", "Create and add <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>) on layer <i>{3}</i>", 
          "Create and Add instances.", "CreateInsts");            
AddObjectParam("Instances", "Remove instances from layouter.");          
AddAction(5, 0, "Remove instances", "Add/Remove", "Remove instances <i>{0}</i>", 
          "Remove instances.", "RemoveInsts"); 	
AddAction(6, 0, "Force layout", "Update", "Force layout instances", 
          "Force layout instances.", "ForceLayout");          
AddAction(7, 0, "Remove all", "Add/Remove", "Remove all instances", 
          "Remove all instances.", "RemoveAllInsts"); 	                   
AddObjectParam("Object", "Object for picking");
AddAction(10, 0, "Pick instances", "SOL: instances", 
          "Pick <i>{0}</i>", "Pick instances.", "PickInsts");
AddAction(11, 0, "Pick all instances", "SOL: instances", 
          "Pick all instances in this container", "Pick all instances in this layouter.", "PickAllInsts");          
          
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number,
              "Get UID of layouted instance", "Layout", "InstUID",
              "Get UID of layouted instance.");
AddExpression(2, ef_return_number,
              "Get X co-ordinate of layouted instance", "Layout", "InstX",
              "Get X co-ordinate of layouted instance.");  
AddExpression(3, ef_return_number,
              "Get Y co-ordinate of layouted instance", "Layout", "InstY",
              "Get Y co-ordinate of layouted instance.");   
AddExpression(4, ef_return_number,
              "Get angle of layouted instance", "Layout", "InstAngle",
              "Get angle of layouted instance.");   
AddExpression(5, ef_return_number,
              "Get width of layouted instance", "Layout", "InstWidth",
              "Get width of layouted instance."); 
AddExpression(6, ef_return_number,
              "Get height of layouted instance", "Layout", "InstHeight",
              "Get height of layouted instance.");               
AddExpression(7, ef_return_number,
              "Get opacity of layouted instance", "Layout", "InstOpacity",
              "Get opacity of layouted instance.");  
AddExpression(8, ef_return_number,
              "Get visible of layouted instance", "Layout", "InstVisible",
              "Get visible of layouted instance.");       
AddExpression(21, ef_return_number, "Get sprites count", "Sprite", "SpritesCnt", "Get sprites count.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Pin mode", "None", "Moving instances like pin behavior.", 
                    "None|Position & angle|Position only|Angle only"),
    new cr.Property(ept_combo, "Hotspot", "Top-left", "Choose the location of the hot spot in the object.", 
                    "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right"),					
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

    switch (this.properties["Hotspot"])
    {
        case "Top-left" :
            this.instance.SetHotspot(new cr.vector2(0, 0));
            break;
        case "Top" :
            this.instance.SetHotspot(new cr.vector2(0.5, 0));
            break;
        case "Top-right" :
            this.instance.SetHotspot(new cr.vector2(1, 0));
            break;
        case "Left" :
            this.instance.SetHotspot(new cr.vector2(0, 0.5));
            break;
        case "Center" :
            this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
            break;
        case "Right" :
            this.instance.SetHotspot(new cr.vector2(1, 0.5));
            break;
        case "Bottom-left" :
            this.instance.SetHotspot(new cr.vector2(0, 1));
            break;
        case "Bottom" :
            this.instance.SetHotspot(new cr.vector2(0.5, 1));
            break;
        case "Bottom-right" :
            this.instance.SetHotspot(new cr.vector2(1, 1));
            break;
    }
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
	// Edit image link
	if (property_name === "Hotspot")
	{
        switch (this.properties["Hotspot"])
        {
            case "Top-left" :
                this.instance.SetHotspot(new cr.vector2(0, 0));
                break;
            case "Top" :
                this.instance.SetHotspot(new cr.vector2(0.5, 0));
                break;
            case "Top-right" :
                this.instance.SetHotspot(new cr.vector2(1, 0));
                break;
            case "Left" :
                this.instance.SetHotspot(new cr.vector2(0, 0.5));
                break;
            case "Center" :
                this.instance.SetHotspot(new cr.vector2(0.5, 0.5));
                break;
            case "Right" :
                this.instance.SetHotspot(new cr.vector2(1, 0.5));
                break;
            case "Bottom-left" :
                this.instance.SetHotspot(new cr.vector2(0, 1));
                break;
            case "Bottom" :
                this.instance.SetHotspot(new cr.vector2(0.5, 1));
                break;
            case "Bottom-right" :
                this.instance.SetHotspot(new cr.vector2(1, 1));
                break;
        }
	}
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
    var quad = this.instance.GetBoundingQuad();
    renderer.Fill(quad, cr.RGB(255, 130, 122));
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}

IDEInstance.prototype.OnTextureEdited = function ()
{
}