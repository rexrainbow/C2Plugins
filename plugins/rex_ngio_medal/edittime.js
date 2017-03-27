function GetPluginSettings()
{
	return {
		"name":			"Medal",
		"id":			"Rex_NGIO_Medal",
		"version":		"0.1",        
		"description":	"Handles loading and unlocking of medals.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_ngio_medal.html",
		"category":		"Rex - Web - newgrounds.io",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,      
	};
};

//////////////////////////////////////////////////////////////
// Conditions

AddCondition(1, cf_trigger, "On get medals list", "Get list", 
            "On get medals list success",
            "Triggered when get medals list success.", "OnGetMedalsListSuccess");
AddCondition(2, cf_trigger, "On get medals list error", "Get list",
            "On get medals list error",
            "Triggered when get medals list error.", "OnGetMedalsListError");
AddCondition(3, cf_looping | cf_not_invertible, "For each medal", "Get list - for each", 
             "For each medal", 
             "Repeat the event for each medal.", "ForEachMedal"); 
             
AddCondition(4, 0, "Is secret", "Get list - for each", 
             "Current medal is secret", 
             "Return true if current medal is secret in a For Each loop.", "CurMedalIsSecret");  
AddCondition(5, 0, "Is unlocked", "Get list - for each", 
             "Current medal is unlocked", 
             "Return true if current medal is unlocked in a For Each loop.", "CurMedalIsUnlocked");    

AddCmpParam("Comparison", "Choose the way to compare difficulty.");             
AddComboParamOption("Easy");       
AddComboParamOption("Moderate");
AddComboParamOption("Challenging");       
AddComboParamOption("Difficult");
AddComboParamOption("Brutal");
AddComboParam("Difficulty types", "Difficulty types.", 0);
AddCondition(6, 0, "Compare difficulty", "Get list - for each", 
             "Current medal difficulty <i>{0}</i> <i>{1}</i>", 
             "Compare difficulty of current medal in a For Each loop.", "CompareCurMedalDifficulty");                

AddNumberParam("Index", "Local line index, 0-based.", 0);                   
AddCondition(11, 0, "Is secret", "Get list - index", 
             "Medal <i>{0}</i> is secret", 
             "Return true if medal is secret by index.", "Index2MedalIsSecret");  
             
AddNumberParam("Index", "Local line index, 0-based.", 0);                     
AddCondition(12, 0, "Is unlocked", "Get list - index", 
             "Medal <i>{0}</i> is unlocked", 
             "Return true if current medal is unlocked by index.", "Index2MedalIsUnlocked");  

AddNumberParam("Index", "Local line index, 0-based.", 0);                
AddCmpParam("Comparison", "Choose the way to compare difficulty.");             
AddComboParamOption("Easy");            // 1 -> 0
AddComboParamOption("Moderate");
AddComboParamOption("Challenging");       
AddComboParamOption("Difficult");
AddComboParamOption("Brutal");
AddComboParam("Difficulty types", "Difficulty types.", 0);
AddCondition(13, 0, "Compare difficulty", "Get list - index", 
             "Medal <i>{0}</i> difficulty <i>{1}</i> <i>{2}</i>", 
             "Compare difficulty of medal by index.", "CompareIndex2MedalDifficulty");                 

AddCondition(21, cf_trigger, "On unlock medal", "Unlock", 
            "On unlock medal success",
            "Triggered when unlock medal success.", "OnUnlockMedalSuccess");
AddCondition(22, cf_trigger, "On unlock medal error", "Unlock",
            "On unlock medal error",
            "Triggered when unlock medal error.", "OnUnlockMedalError");             

//////////////////////////////////////////////////////////////
// Actions

AddAction(1, 0, "Get list", "Medal", 
          "Get medals list",
          "Loads a list of medal objects.", "GetList");
          
AddNumberParam("ID", "The numeric ID of the medal to unlock.", 0);                      
AddAction(11, 0, "Unlock", "Medal", 
          "Unlock medal ID: <i>{0}</i>",
          "Unlock medal.", "Unlock");          

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get error message", "Result", "ErrorMessage", 
              "Get last error message from last result.");
              
AddExpression(1, ef_return_string, "Get received medals as JSON", "Get list", "MedalsAsJSON", 
              "Get received medals as JSON.");           
                            
AddExpression(2, ef_return_string, "Get current description of medal", "Get list - for each", "CurMedalDescription", 
              "A short description of the medal in a For Each loop.");  
AddExpression(3, ef_return_number, "Get current difficulty of medal","Get list - for each", "CurMedalDifficulty", 
              "The difficulty id of the medal in a For Each loop.");        
AddExpression(4, ef_return_string, "Get current icon of medal", "Get list - for each", "CurMedalIcon", 
              "The URL for the medal's icon in a For Each loop.");  
AddExpression(5, ef_return_number, "Get current id of medal", "Get list - for each", "CurMedalID", 
              "The numeric ID of the medal in a For Each loop.");            
AddExpression(6, ef_return_string, "Get current name of medal", "Get list - for each", "CurMedalName", 
              "The name of the medal in a For Each loop.");            
AddExpression(7, ef_return_number, "Get current point value of medal", "Get list - for each", "CurMedalValue", 
              "The medal's point value in a For Each loop.");     
AddExpression(8, ef_return_number, "Get 1 if current medal is secret", "Get list - for each", "CurMedalIsSecret", 
              "Get 1 if current medal is secret in a For Each loop.");  
AddExpression(9, ef_return_number, "Get 1 if current medal is unlocked", "Get list - for each", "CurMedalIsUnlocked", 
              "Get 1 if current medal is unlocked in a For Each loop.");      

AddExpression(10, ef_return_number, "Current loop index", "For each - index", "LoopIndex", 
              "Get loop index in for each loop.");  
              
AddNumberParam("Index", "Medal line index, 0-based.", 0);                
AddExpression(11, ef_return_string, "Get description of medal by index", "Get list - index", "Index2MedalDescription", 
              "A short description of the medal by index.");  
              
AddNumberParam("Index", "Medal index, 0-based.", 0);                
AddExpression(12, ef_return_number, "Get difficulty of medal by index", "Get list - index", "Index2MedalDifficulty", 
              "The difficulty id of the medal by index.");        
              
AddNumberParam("Index", "Medal index, 0-based.", 0);                      
AddExpression(13, ef_return_string, "Get icon of medal by index", "Get list - index", "Index2MedalIcon", 
              "The URL for the medal's icon by index.");  

AddNumberParam("Index", "Medal index, 0-based.", 0);                      
AddExpression(14, ef_return_number, "Get id of medal by index", "Get list - index", "Index2MedalID", 
              "The numeric ID of the medal by index.");        

AddNumberParam("Index", "Medal index, 0-based.", 0);                    
AddExpression(15, ef_return_string, "Get name of medal by index", "Get list - index", "Index2MedalName", 
              "The name of the medal by index.");  

AddNumberParam("Index", "Medal index, 0-based.", 0);                  
AddExpression(16, ef_return_number, "Get point value of medal by index", "Get list - index", "Index2MedalValue", 
              "The medal's point value by index.");    

AddNumberParam("Index", "Medal index, 0-based.", 0);                    
AddExpression(17, ef_return_number, "Get 1 if medal is secret by index", "Get list - index", "Index2MedalIsSecret", 
              "Get 1 if current medal is secret by index.");  
              
AddNumberParam("Index", "Medal index, 0-based.", 0);                      
AddExpression(18, ef_return_number, "Get 1 if medal is unlocked by index", "Get list - index", "Index2MedalIsUnlocked", 
              "Get 1 if current medal is unlocked by index.");        

AddExpression(19, ef_return_number, "Get amount of medals","Get list", "MedalsCount", 
              "Get amount of medals.");                  

AddExpression(21, ef_return_number, "Get last unlocked medal ID", "Unlock", "LastUnlockedMedalID", 
              "Get last unlocked medal ID.");                     
              
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
