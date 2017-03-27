function GetPluginSettings()
{
	return {
		"name":			"UID to Properties",
		"id":			"Rex_UID2Prop",
		"version":		"0.1",        
		"description":	"Get/set properties (x,y,angle,opacity,private variable) by UID without picking first.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_uid2prop.html",
		"category":		"Rex - Instance properties",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions

//////////////////////////////////////////////////////////////
// Actions
AddStringParam("Alias", "An alias to identify this private variable.");
AddObjectParam("Object", "Object type.");
AddObjectInstanceVarParam("Instance variable", "Choose the instance variable in the above object.");
AddAction(1, 0, "Define alias", "Private variable", 
          "Define alias <b>{0}</b> refer to {1} variable <b>{2}</b>", 
          "Define an alias of private variable.", "DefinePrivateVariableAlias");

AddNumberParam("UID", "Instance UID.", 0);
AddAction(2, 0, "Destroy instance", "Destroy", 
          "Instance UID <i>{0}</i>: destroy ", 
          "Destroy instance.", "InstDestroy");
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("X", "New X co-ordinate, in pixels.", 0);
AddAction(3, 0, "Set X", "Position", 
          "Instance UID <i>{0}</i>: set X to <i>{1}</i>", 
          "Set the object's X co-ordinate.", "InstSetX");   
            
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Y", "New Y co-ordinate, in pixels.", 0);
AddAction(4, 0, "Set Y", "Position", 
          "Instance UID <i>{0}</i>: set Y to <i>{1}</i>", 
          "Set the object's Y co-ordinate.", "InstSetY"); 
                   
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("X", "New X co-ordinate, in pixels.", 0);
AddNumberParam("Y", "New Y co-ordinate, in pixels.", 0);
AddAction(5, 0, "Set position", "Position", 
          "Instance UID <i>{0}</i>: set position to ( <i>{1}</i>, <i>{2}</i> )", 
          "Set the object's X and Y co-ordinates at the same time.", "InstSetY");   
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("UIDB", "Object to position by.");
AddAnyTypeParam("Image point (optional)", "The name or number of an image point in the object to position by.  Leave 0 for object's origin.");
AddAction(6, 0, "Set position to another object", "Position", 
          "Instance UID <i>{0}</i>: set position to instance UID: <i>{1}</i> (image point <i>{2}</i>)", 
          "Position object relative to another object.", "InstSetPosToObject");
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Distance", "Distance, in pixels, to move the object forwards at its current angle.", 0);
AddAction(7, 0, "Move forward", "Position", 
          "Instance UID <i>{0}</i>: move forward <i>{1}</i> pixels", 
          "Move object forwards a number of pixels at its current angle.", "InstMoveForward");
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Angle", "Angle, in degrees, at which to move the object.", 0);
AddNumberParam("Distance", "Distance, in pixels, to move the object forwards at its current angle.", 0);
AddAction(8, 0, "Move at angle", "Position", 
          "Instance UID <i>{0}</i>: move <i>{2}</i> pixels at angle <i>{1}</i>", 
          "Move object a number of pixels at a given angle.", "InstMoveAtAngle");  

AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Width", "New object width, in pixels.", 0);
AddAction(10, 0, "Set width", "Size", 
          "Instance UID <i>{0}</i>: set width to <i>{1}</i>", 
          "Set the object's width.", "InstSetWidth");  
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Height", "New object height, in pixels.", 0);
AddAction(11, 0, "Set height", "Size", 
          "Instance UID <i>{0}</i>: set height to <i>{1}</i>", 
          "Set the object's height.", "InstSetHeight");
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Width", "New object width, in pixels.", 0);
AddNumberParam("Height", "New object height, in pixels.", 0);
AddAction(12, 0, "Set size", "Size", 
          "Instance UID <i>{0}</i>: set size to (<i>{1}</i>, <i>{2}</i>)", 
          "Set the object's width and height at the same time.", "InstSetSize");          
                                                    
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Angle", "New object angle, in degrees.", 0);
AddAction(13, 0, "Set angle", "Angle", 
          "Instance UID <i>{0}</i>: set angle to <i>{1}</i> degrees", 
          "Set the angle the object is oriented at.", "InstSetAngle");
                                                    
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Degrees", "Number of degrees to rotate the object clockwise.", 0);
AddAction(14, 0, "Rotate clockwise", "Angle", 
          "Instance UID <i>{0}</i>: rotate <i>{1}</i> degrees clockwise", 
          "Rotate the object's angle clockwise by a number of degrees.", "InstRotateClockwise");          
                                                    
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Degrees", "Number of degrees to rotate the object counter-clockwise.", 0);
AddAction(15, 0, "Rotate counter-clockwise", "Angle", 
          "Instance UID <i>{0}</i>: rotate <i>{1}</i> degrees counter-clockwise", 
          "Rotate the object's angle counter-clockwise by a number of degrees.", "InstRotateCounterclockwise");
                                                    
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Degrees", "Number of degrees to rotate towards the target angle.", 0);
AddNumberParam("Angle", "Angle, in degrees, to rotate towards.", 0);
AddAction(16, 0, "Rotate toward angle", "Angle", 
          "Instance UID <i>{0}</i>: rotate <i>{1}</i> degrees toward <i>{2}</i>", 
          "Rotate the object towards another angle.", "InstRotateTowardAngle");          
                                                    
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Degrees", "Number of degrees to rotate towards the target position.", 0);
AddNumberParam("X", "X position to rotate toward.", 0);
AddNumberParam("Y", "Y position to rotate toward.", 0);
AddAction(17, 0, "Rotate toward position", "Angle", 
          "Instance UID <i>{0}</i>: rotate <i>{1}</i> degrees toward (<i>{2}</i>, <i>{3}</i>)", 
          "Rotate the object towards a position.", "InstRotateTowardPosition");                             
                                                    
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("X", "X position to rotate toward.", 0);
AddNumberParam("Y", "Y position to rotate toward.", 0);
AddAction(18, 0, "Set angle toward position", "Angle", 
          "Instance UID <i>{0}</i>: set angle toward (<i>{1}</i>, <i>{2}</i>)", 
          "Set the object's angle towards a position.", "InstSetTowardPosition"); 
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Visible", "Choose the object visible, from 0 (transparent) to 100 (opaque).", 0);
AddAction(19, 0, "Set visible", "Appear", 
          "Instance UID <i>{0}</i>: set visible to <i>{1}</i>", 
          "Set whether the object is hidden or shown.", "InstSetVisible");
          
AddNumberParam("UID", "Instance UID.", 0);
AddNumberParam("Opacity", "Choose the object opacity, from 0 (transparent) to 100 (opaque).", 0);
AddAction(20, 0, "Set opacity", "Appear", 
          "Instance UID <i>{0}</i>: set opacity to <i>{1}</i>", 
          "Set how transparent the object appears.", "InstSetOpacity");                     
                                                      
//////////////////////////////////////////////////////////////
// Expressions
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(1, ef_return_number, "Get position X", "Position", "X", "Get instance's position X.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(2, ef_return_number, "Get position Y", "Position", "Y", "Get instance's position Y.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(3, ef_return_number, "Get angle", "Angle", "Angle", "Get instance's angle.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(4, ef_return_number, "Get width", "Size", "Width", "Get instance's width.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(5, ef_return_number, "Get height", "Size", "Height", "Get instance's height.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(6, ef_return_number, "Get opacity", "Appear", "Opacity", "Get instance's opacity.");
AddNumberParam("UID", "The UID of instance.", 0);
AddExpression(7, ef_return_number, "Get visible", "Appear", "Visible", "Get instance's visible.");
AddNumberParam("UID", "The UID of instance.", 0);
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.", 0);
AddExpression(8, ef_return_number, "Get image point X", "Image point", "ImgptX", "Get instance's image point X.");
AddNumberParam("UID", "The UID of instance.", 0);
AddAnyTypeParam("ImagePoint", "Name or number of image point to get.", 0);
AddExpression(9, ef_return_number, "Get image point Y", "Image point", "ImgptY", "Get instance's image point Y.");
AddNumberParam("UID", "The UID of instance.", 0);
AddStringParam("Alias", "An alias to identify this private variable.");
AddExpression(10, ef_return_any, "Get value of private variable", "Private variable", "PV", "Get value of private variable by alias.");
AddNumberParam("A", "The UID of instance A.", 0);
AddNumberParam("B", "The UID of instance B.", 0);
AddExpression(11, ef_return_number, "Get distance betwen 2 instances", "Distance", "DistanceTo", "Get distance of 2 instances.");
AddNumberParam("A", "The UID of instance A.", 0);
AddNumberParam("B", "The UID of instance B.", 0);
AddExpression(12, ef_return_number, "Get angle betwen 2 instances", "Angle", "AngleTo", "Get angle of 2 instances.");

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
