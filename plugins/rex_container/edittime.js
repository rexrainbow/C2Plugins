function GetPluginSettings()
{
	return {
		"name":			"Container",
		"id":			"Rex_Container",
		"version":		"0.1",
		"description":	"Put sprites or other objects into this box.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/rex_container.html",
		"category":		"Data & Storage",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":	    pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces
	};
};

////////////////////////////////////////
// Conditions        
AddObjectParam("Object", "Object for picking");
AddCondition(10, cf_not_invertible, "Pick instances", "SOL: instances", 
             "Pick <i>{0}</i>", "Pick instances.", "PickInsts"); 
AddCondition(11, cf_not_invertible, "Pick all instances", "SOL: instances", 
             "Pick all instances in this container", "Pick all instances in this container.", "PickAllInsts");                      
AddObjectParam("Instance", "Instance under container");
AddCondition(21, cf_static | cf_not_invertible, "Pick container", "SOL: container", 
          "Pick container from <i>{0}</i>", "Pick container from instance.", "PickContainer");   
		  
////////////////////////////////////////
// Actions
AddObjectParam("Instances", "Add instances into container.");          
AddAction(3, 0, "Add instances", "Add instances", "Add instances <i>{0}</i>", 
          "Add instances.", "AddInsts");             
AddObjectParam("Instances", "Add instances into container.");       
AddNumberParam("X", "X co-ordinate.", 0);
AddNumberParam("Y", "Y co-ordinate.", 0);
AddLayerParam("Layer", "Layer name of number.");
AddAction(4, 0, "Create&Add instances", "Add instances", "Create and add <i>{0}</i> at (<i>{1}</i>,<i>{2}</i>) on layer <i>{3}</i>", 
          "Create and Add instances.", "CreateInsts");            
AddObjectParam("Instances", "Remove instances from container.");          
AddAction(5, 0, "Remove instances", "Remove instances", "Remove instances <i>{0}</i>", 
          "Remove instances.", "RemoveInsts");          
AddAction(9, af_deprecated, "Destroy container", "Destroy", "Destroy container and instances in this contaner", 
          "Destroy container and instances in this contaner.", "ContainerDestroy"); 		  
AddObjectParam("Object", "Object for picking");
AddAction(10, 0, "Pick instances", "SOL: instances", 
          "Pick <i>{0}</i>", "Pick instances.", "PickInsts");
AddAction(11, 0, "Pick all instances", "SOL: instances", 
          "Pick all instances in this container", "Pick all instances in this container.", "PickAllInsts");  

AddNumberParam("Scale", "The object width and height to set, based on a multiple of its original dimensions, e.g. 1 = original size, 2 = double size, 0.5 = half size etc.", "1");
AddAction(20, 0, "Set scale", "Size & Position", "Set scale to <i>{0}</i>", "Set the width and height as a multiple of its original size.", "SetScale");          
////////////////////////////////////////
// Expressions
AddExpression(3, ef_return_string, "Get tag", "Tag", "Tag", "Get tag.");
// image points
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddExpression(4, ef_deprecated | ef_return_number, "Get image point X",		"Size & Position",	"ImagePointX", "The X position of one of the object's image points.");
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.");
AddExpression(5, ef_deprecated | ef_return_number, "Get image point Y",		"Size & Position",	"ImagePointY", "The Y position of one of the object's image points.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_combo, "Pin mode", "None", "Moving instances like pin behavior.", 
                    "None|Position & angle|Position only|Angle only"),
    new cr.Property(ept_combo, "Hotspot", "Top-left", "Choose the location of the hot spot in the object.", 
                    "Top-left|Top|Top-right|Left|Center|Right|Bottom-left|Bottom|Bottom-right"),        
    new cr.Property(ept_text, "Tag", "", "Tag for adding sprite into container at layout editor."),					
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