function GetPluginSettings()
{
	return {
		"name":			"Grid control",
		"id":			"Rex_GridCtrl",
		"version":		"0.1",
		"description":	"Manipulate instances of each grid in a table.",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_gridctrl.html",
		"category":		"Rex - GUI controller",
		"type":			"world",			// appears in layout
		"rotatable":	true,
		"flags":	    pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces
	};
};

////////////////////////////////////////
// Conditions 
AddCondition(1, cf_trigger, "On cell visible", "Visible", 
             "On cell visible", 
             "Triggered when a cell is visible.", "OnCellVisible");
AddCondition(2, cf_trigger, "On cell invisible", "Visible", 
             "On cell invisible", 
             "Triggered when a cell is invisible.", "OnCellInvisible");  

AddCondition(11, cf_looping | cf_not_invertible, "For each cell", "List", 
             "For each cell", 
             "Repeat the event for each cell in list.", "ForEachCell"); 

AddNumberParam("Start", "Start cell index.", 0);
AddNumberParam("End", "Start cell index.", 0);
AddCondition(12, cf_looping | cf_not_invertible, "For each cell in a range", "List", 
             "For each cell from <i>{0}</i> to <i>{1}</i>", 
             "Repeat the event for each cell in a range in list.", "ForEachCell");
                                       
AddCondition(13, cf_looping | cf_not_invertible, "For each visible cell", "Visible", 
             "For each visible cell", 
             "Repeat the event for each visible cell.", "ForEachVisibleCell"); 

AddStringParam("Key", "The key of custom data.", '""');
AddCmpParam("Comparison", "Choose the way to compare data.");
AddNumberParam("Value", "The value to compare the data to.");             
AddCondition(14, cf_looping | cf_not_invertible, "For each matched cell", "Filter", 
             "For each cell which custom data[<i>{0}</i>] <i>{1}</i> <i>{2}</i>", 
             "Repeat the event for each matched cell.", "ForEachMatchedCell");  
             
AddComboParamOption("Top bound");
AddComboParamOption("Bottom bound");
AddComboParamOption("Top or bottom bounds");
AddComboParam("Bound", "Bound types.", 2);             
AddCondition(21, 0, "Is OY out of bound", "Bound", 
             "Is OY out of <i>{0}</i>", 
             "Retrurn true if OY is out of bound.", "IsOYOutOfBound");
             
AddComboParamOption("Top bound");
AddComboParamOption("Bottom bound");
AddComboParamOption("Top or bottom bounds");
AddComboParam("Bound", "Bound types.", 2);              
AddCondition(22, cf_trigger, "On OY out of bound", "Bound", 
             "On OY out of <i>{0}</i>", 
             "Triggered when OY out of bound.", "OnOYOutOfBound");    
			 
AddComboParamOption("Left bound");
AddComboParamOption("Right bound");
AddComboParamOption("Left or Right bounds");
AddComboParam("Bound", "Bound types.", 2);             
AddCondition(31, 0, "Is OX out of bound", "Bound", 
             "Is OY out of <i>{0}</i>", 
             "Retrurn true if OX is out of bound.", "IsOXOutOfBound");
             
AddComboParamOption("Left bound");
AddComboParamOption("Right bound");
AddComboParamOption("Left or Right bounds");
AddComboParam("Bound", "Bound types.", 2);              
AddCondition(32, cf_trigger, "On OY out of bound", "Bound", 
             "On OX out of <i>{0}</i>", 
             "Triggered when OX out of bound.", "OnOXOutOfBound");  

AddNumberParam("Cell index", "Cell index.", 0);
AddObjectParam("Object", "Object for picking");
AddCondition(101, cf_not_invertible, "Pick instances", "SOL: instances", 
             "Pick <i>{0}</i> on cell <i>{1}</i>", "Pick instances on cell.", "PickInstsOnCell"); 

AddNumberParam("Cell index", "Cell index.", 0);             
AddCondition(102, cf_not_invertible, "Pick all instances", "SOL: instances", 
             "Pick all instances on cell <i>{0}</i>", "Pick all instances on cell.", "PickAllInstsOnCell");     			 
////////////////////////////////////////
// Actions
 AddNumberParam("OX", "Offset X of this list, in pixels. Start at 0.", 0);
AddAction(1, 0, "Set OX", "List - offset X", 
          "Set offset X to <i>{0}</i>", 
          "Set offset X.", "SetOX");           
AddNumberParam("OY", "Offset Y of this list, in pixels. Start at 0.", 0);
AddAction(2, 0, "Set OY", "List - offset Y", 
          "Set offset Y to <i>{0}</i>", 
          "Set offset Y.", "SetOY");
AddNumberParam("OX", "Offset X of this list, in pixels. Start at 0.", 0);
AddNumberParam("OY", "Offset Y of this list, in pixels. Start at 0.", 0);
AddAction(3, 0, "Set OXY", "List - offset XY", 
          "Set offset (X, Y) to (<i>{0}</i>, <i>{1}</i>)", 
          "Set offset XY.", "SetOXY");
          
AddNumberParam("Value", "Add value to Offset Y, in pixels", 0);
AddAction(4, 0, "Add to OY", "List - offset Y", 
          "Add <i>{0}</i> to offset Y", 
          "Add to Offset Y.", "AddOY"); 
AddNumberParam("Value", "Add value to Offset X, in pixels", 0);
AddAction(5, 0, "Add to OX", "List - offset X", 
          "Add <i>{0}</i> to offset X", 
          "Add to Offset X.", "AddOX"); 
AddNumberParam("Value", "Add value to Offset X, in pixels", 0);          
AddNumberParam("Value", "Add value to Offset Y, in pixels", 0);
AddAction(6, 0, "Add to OXY", "List - offset XY", 
          "Add (<i>{0}</i>, <i>{1}</i>) to offset (X, Y)", 
          "Add to Offset XY.", "AddOXY");        
          
AddObjectParam("Instance", "Instance belong the cell.");
AddAction(11, 0, "Pin instance", "Instances", 
          "Pin <i>{0}</i> to current visible cell", 
          'Pin instance to current visible cell under "Condition: On cell visible". It will be destroyed while cell is invisible.', "PinInstToCell"); 
AddObjectParam("Instance", "Instance belong the cell.");
AddAction(12, 0, "Unpin instance", "Instances", 
          "Unpin <i>{0}</i>", 
          'Unpin instance from cell.', "UnPinInst");            
AddNumberParam("Total cells count", "Total cells count of this grid.", 100);
AddAction(13, 0, "Set total cells count", "Grid", 
          "Set total cells count to <i>{0}</i>", 
          "Set total cells count.", "SetCellsCount");
AddNumberParam("Columns", "Column number of this grid.", 10);
AddAction(14, 0, "Set column number", "Grid", 
          "Set column number to <i>{0}</i>", 
          "Set column number.", "SetColumnNumber"); 
AddNumberParam("Columns", "Column number of this grid.", 10);          
AddNumberParam("Rows", "Row number of this grid.", 10);
AddAction(15, 0, "Set grid size", "Grid", 
          "Set grid size to <i>{0}</i>x<i>{1}</i>", 
          "Set grid size.", "SetGridSize");
          
AddObjectParam("Instance", "Instance belong the cell.");
AddNumberParam("Cell index", "Cell index.", 0);
AddAction(16, 0, "Pin instance to cell", "Instances", 
          "Pin <i>{0}</i> to cell <i>{1}</i>", 
          'Pin instance to cell. It will be destroyed while cell is invisible.', "PinInstToCell"); 
AddObjectParam("Instance", "Instance belong the cell.");
AddNumberParam("Cell index", "Cell index.", 0);
AddAction(17, 0, "Unpin instance from cell", "Instances", 
          "Unpin <i>{0}</i> from cell <i>{1}</i>", 
          'Unpin instance from cell.', "UnPinInst");           
          
AddNumberParam("Cell index", "Cell index.", 0);
AddAction(21, 0, "Scroll to index", "List - offset Y", 
          "Scroll offset (X, Y) to cell <i>{0}</i>", 
          "Scroll offset (X, Y) to cell lindex.", "SetOXYToCellIndex"); 
AddNumberParam("Percentage", "Scroll list, 0 is top, 1 is bottom.", 1);
AddAction(22, 0, "Scroll by percentage", "List - Offset Y", 
          "Scroll offset Y by percentage to <i>{0}</i>", 
          "Scroll offsetY by percentage.", "SetOYByPercentage"); 		  
		  
AddNumberParam("Cell index", "Cell index.", 0);
AddStringParam("Key", "The key of custom data.", '""');
AddAnyTypeParam("Value", "The value to store in the cell.", 0);
AddAction(31, 0, "Set value", "Custom data", 
          "Cell <i>{0}</i>: set key <i>{1}</i> to <i>{2}</i>",
          "Set custom data in a cell.", "SetValue"); 
          
AddStringParam("Key", "The key of custom data.", '""');
AddAction(32, 0, "Clean key in all cells", "Custom data", 
          "Clean key <i>{0}</i> in all cells",
          "Clean key in all cell.", "CleanKeyInAllCell");
          
AddAction(33, 0, "Clean all keys in all cells", "Custom data", 
          "Clean all keys in all cells",
          "Clean all keys in all cell.", "CleanAllKeysInAllCell");      
          
AddNumberParam("Insert at", "Cell index for inserting.", 0);
AddNumberParam("Cell number", "Cell number for inserting.", 1);
AddAction(41, 0, "Insert new cells", "Insert", 
          "Cell <i>{0}</i>: insert <i>{1}</i> new cells", 
          "Insert new cells.", "InsertNewCells"); 

AddNumberParam("Remove from", "Cell index for removing.", 0);
AddNumberParam("Cell number", "Cell number for removing.", 1);
AddAction(42, 0, "Remove cells", "Remove", 
          "Remove <i>{1}</i> cells from index <i>{0}</i>", 
          "Remove cells.", "RemoveCells");

AddNumberParam("Insert at", "Cell index for inserting.", 0);
AddStringParam("Content", "Content of cells in JSON string.", '""');
AddAction(43, 0, "Insert cells", "Insert", 
          "Cell <i>{0}</i>: insert cells with content <i>{1}</i>", 
          "Insert cells with content.", "InsertCells");

AddComboParamOption("back");
AddComboParamOption("front");
AddComboParam("Where", "Whether to insert at the beginning or the end of the list.", 0);
AddNumberParam("Cell number", "Cell number for inserting.", 1);
AddAction(44, 0, "Push new cells", "Insert", 
          "Push <i>{0}</i> <i>{1}</i> new cells", 
          "Push new cells.", "PushNewCells");  
          
AddComboParamOption("back");
AddComboParamOption("front");
AddComboParam("Where", "Whether to insert at the beginning or the end of the list.", 0);
AddStringParam("Content", "Content of cells in JSON string.", '""');
AddAction(45, 0, "Push cells", "Insert", 
          "Push <i>{0}</i> with content <i>{1}</i>", 
          "Push cells with content.", "PushCells");  
		  
AddNumberParam("Cell height", "Cell height, in pixels.", 30);
AddAction(51, 0, "Set default cell height", "Cell size", 
          "Set default cell height to <i>{0}</i>", 
          "Set default cell height.", "SetDefaultCellHeight");
          
AddNumberParam("Cell width", "Cell width, in pixels.", 30);
AddAction(52, 0, "Set default cell width", "Cell size", 
          "Set default cell width to <i>{0}</i>", 
          "Set default cell width.", "SetDefaultCellWidth"); 
          
AddNumberParam("Cell index", "Line index.", 0);         
AddNumberParam("Height", "Cell height, in pixels.", 30);
AddAction(53, 0, "Set cell height", "Cell size", 
          "Cell <i>{0}</i>: set height to <i>{1}</i>", 
          "Set cell height.", "SetCellHeight");            
		     
AddAction(71, 0, "Refresh", "Visible", 
          "Refresh visible cells", 
          "Refresh visible cells.", "RefreshVisibleCells"); 

AddNumberParam("Cell index", "Cell index.", 0);
AddObjectParam("Object", "Object for picking");
AddAction(101, cf_not_invertible, "Pick instances", "SOL: instances", 
          "Pick <i>{0}</i> on cell <i>{1}</i>", "Pick instances on cell.", "PickInstsOnCell"); 

AddNumberParam("Cell index", "Cell index.", 0);             
AddAction(102, cf_not_invertible, "Pick all instances", "SOL: instances", 
          "Pick all instances on cell <i>{0}</i>", "Pick all instances on cell.", "PickAllInstsOnCell");           
////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_number, "Get selected cell index", "Visible - On visible", "CellIndex", 
              'Get selected cell index in "Condition: On cell visible", or "Condition: On cell invisible".');		
AddExpression(2, ef_return_number, "Get selected cell X index", "Visible - On visible", "CellXIndex", 
              'Get selected cell X index in "Condition: On cell visible", or "Condition: On cell invisible".');
AddExpression(3, ef_return_number, "Get selected cell Y index", "Visible - On visible", "CellYIndex", 
              'Get selected cell Y index in "Condition: On cell visible", or "Condition: On cell invisible".');					  
AddExpression(4, ef_return_number, "Get position X of selected cell", "Visible - On visible", "CellTLX", 
              'Get top-left position X of cell in "Condition: On cell visible", in pixels');
AddExpression(5, ef_return_number, "Get position Y of selected cell", "Visible - On visible", "CellTLY", 
              'Get top-left position Y of cell in "Condition: On cell visible", in pixels');              
			  
AddNumberParam("UID", "UID of pinned instance.", 0);              
AddExpression(11, ef_return_number, "Get cell index of pinned instance", "Cell index", "UID2CellIndex", 
              "Get cell index of pinned instance by UID. (-1) is invalid.");
AddNumberParam("Cell index", "Cell index.", 0);              
AddExpression(12, ef_return_number, "Get position Y by cell index", "Offset Y", "CellIndex2CellTLY", 
              "Get top-left position Y by cell index");  
AddNumberParam("Cell index", "Cell index.", 0);              
AddExpression(13, ef_return_number, "Get position X by cell index", "Offset X", "CellIndex2CellTLX", 
              "Get top-left position X by cell index");  
			  
AddExpression(21, ef_return_number, "Get total cells count", "List", "TotalCellsCount", 
              "Get total cells count.");
AddExpression(22, ef_return_number, "Get cell height", "Cell size", "DefaultCellHeight", 
              "Get default cell height.");
AddExpression(23, ef_return_number, "Get cell width", "Cell size", "DefaultCellWidth", 
              "Get default cell width.");		
AddExpression(24, ef_return_number, "Get total columns count", "List", "TotalColumnsCount", 
              "Get total columns count."); 
AddNumberParam("Index", "Index of cell.", 0);
AddExpression(25, ef_return_number, "Get cell height", "Cell size", "CellHeight", 
              "Get cell height.");
AddExpression(26, ef_return_number, "Get list height", "List", "ListHeight", 
              "Get list height.");
AddExpression(27, ef_return_number, "Get list width", "List", "ListWidth", 
              "Get list width.");	              
              
AddNumberParam("Index", "Index of cell.", 0);
AddStringParam("Key", "The name of the key.", '""');
AddExpression(31, ef_return_any | ef_variadic_parameters, "Get value at", "Custom data", "At", 
              "Get value by cell index and key. Add 3rd parameter for default value if this key is not existed.");

AddExpression(41, ef_return_string, "Get custom data last removed cells", "Custom data", "LastRemovedCells", 
              'Get custom data of last removed cells in JSON string after "Action: Remove cells".');              
AddNumberParam("Start index", "Start index of cell.", 0);
AddNumberParam("Cell number", "Cell number.", 1);              
AddExpression(42, ef_return_string, "Get custom data of cells", "Custom data", "CustomDataInCells", 
              "Get custom data of cells.");              
			  
AddExpression(51, ef_return_number, "Get current OY", "OY", "OY", 
              "Get current OY.");
AddExpression(52, ef_return_number, "Get bottom OY", "OY", "BottomOY", 
              "Get bottom OY for showing the last cell, i.e. Scrollable length of current grid table.");     
AddExpression(53, ef_return_number, "Get top OY", "OY", "TopOY", 
              "Get top OY.");    
AddExpression(54, ef_return_number, "Get last bound of OY", "Bound", "LastBoundOY", 
              'Get last bound of OY under "Condition:On OY out of top bound", or "Condition:On OY out of bottom bound".'); 
			  
AddExpression(61, ef_return_number, "Get current OX", "OX", "OX", 
              "Get current OX.");			  
AddExpression(62, ef_return_number, "Get left OX", "OX", "LeftOX", 
              "Get left OX.");     
AddExpression(63, ef_return_number, "Get right OY", "OX", "RightOX", 
              "Get right OX.");          
                                          
AddExpression(71, ef_return_number, "Get current cell index", "For each", "CurCellIndex", 
              'Get current cell index in "Condition: For each cell", or "Condition: For each visible cell".');		
AddExpression(72, ef_return_number, "Get current cell X index", "Visible/For each", "CurCellXIndex", 
              'Get current cell X index in "Condition: For each cell", or "Condition: For each visible cell".');		
AddExpression(73, ef_return_number, "Get current cell Y index", "Visible/For each", "CurCellYIndex", 
              'Get current cell Y index in "Condition: For each cell", or "Condition: For each visible cell".');		
              
AddExpression(81, ef_return_number, "Get top-left visible cell index X", "Visible", "TLVisibleCellXIndex", 
              "Get top-left visible cell X index.");    
AddExpression(82, ef_return_number, "Get top-left visible cell index Y", "Visible", "TLVisibleCelYIndex", 
              "Get top-left visible cell Y index.");                
AddExpression(83, ef_return_number, "Get bottom-right visible cell index", "Visible", "BRVisibleCellXIndex", 
              "Get top-left visible cell X index.");
AddExpression(84, ef_return_number, "Get bottom-right visible cell index", "Visible", "BRVisibleCellYIndex", 
              "Get top-left visible cell Y index.");    
              
              
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_color, "Color",	cr.RGB(0, 0, 0), "Color for showing at editor.", "firstonly"),   
    new cr.Property(ept_float, "Cell height", 30, "Default cell height, in pixels."),
    new cr.Property(ept_float, "Cell width", 30, "Default cell width, in pixels."), 
    new cr.Property(ept_integer, "Total cells", 10, "Total cells count in this list."),       
    new cr.Property(ept_float, "Columns", 5, "Columns number in a row."),              
    new cr.Property(ept_combo, "Clamp OXY", "Yes", "Clamp offset XY.", "NO|Yes"),   
    new cr.Property(ept_combo, "Axis", "Vertical", "Axis of scrolling.", "Horizontal|Vertical"),     
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
	else if (property_name === "Total cells")
	{
	    if (this.properties["Total cells"] < 0)
	        this.properties["Total cells"] = 0;
	}
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
    var quad = this.instance.GetBoundingQuad();
    renderer.Fill(quad, this.properties["Color"]);
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}

IDEInstance.prototype.OnTextureEdited = function ()
{
}