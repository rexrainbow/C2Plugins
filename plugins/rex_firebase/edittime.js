function GetPluginSettings()
{
	return {
		"name":			"Firebase",
		"id":			"Rex_Firebase",
		"version":		"1.3.1",   		
		"description":	"Real time database-as-a-service. https://www.firebase.com/",
		"author":		"Rex.Rainbow",
		"help url":		"http://c2rexplugins.weebly.com/rex_firebase.html",
		"category":		"Rex - Web - Firebase - core",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		0,
	};
};

//////////////////////////////////////////////////////////////
// Conditions	
AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(1, cf_trigger, "On transaction", "Transaction", 
            "On transaction <b>{0}</b>", 
            'Triggered by calling "action: Transaction", to get return value.', "OnTransaction");
            
AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(2, cf_trigger, "On received", "Receive", 
            "On received <b>{0}</b>", 
            "Triggered when registered received event received.", "OnReading");

AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(3, cf_trigger, "On complete", "Send", 
            "On complete <b>{0}</b>", 
            "Triggered after any sending action success.", "OnComplete"); 
                  
AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(4, cf_trigger, "On error", "Send", 
            "On error <b>{0}</b>", 
            "Triggered after any sending action error.", "OnError");             
            
AddCondition(5, 0, "LastData is null", "Receive", 
             "LastData is null", 
             "Return true if LastData is null.", "LastDataIsNull");
  
AddCondition(6, 0, "TransactionIn is null", "Transaction", 
             "TransactionIn is null", 
             "Return true if TransactionIn is null.", "TransactionInIsNull");  
             
AddCondition(7, cf_deprecated, "TransactionIn aborted", "Transaction - completed", 
             "Transaction is aborted", 
             "Return true if the last transaction is aborted.", "IsTransactionAborted");    

AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(8, cf_trigger, "On complete", "Transaction - completed", 
            "On transaction complete <b>{0}</b>", 
            "Triggered when transaction success.", "OnTransactionComplete"); 
                  
AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(9, cf_trigger, "On error", "Transaction - completed", 
            "On transaction error <b>{0}</b>", 
            "Triggered when transaction error.", "OnTransactionError");     
                  
AddStringParam("Callback function", "Callback function.", '"_"');
AddCondition(10, cf_trigger, "On aborted", "Transaction - completed", 
            "On transaction aborted <b>{0}</b>", 
            "Triggered when transaction aborted.", "OnTransactionAbort");               
            
AddCondition(11, cf_trigger, "On connected", "Connection", 
             "On connected", 
             "Triggered while connecting start.", "OnConnected"); 
             
AddCondition(12, cf_trigger, "On disconnected", "Connection", 
             "On disconnected", 
             "Triggered while disconnected.", "OnDisconnected");
             
AddCondition(13, 0, "Is connected", "Connection", 
             "Is connected", 
             "Return true if connected to firebase server.", "IsConnected");              
//////////////////////////////////////////////////////////////
// Actions     
AddStringParam("Domain", "The Firebase data ref URL", '""');
AddAction(0, 0, "Set domain", "Domain", 
          "Set domain ref to <i>{0}</i>", 
          "Set domain ref.", "SetDomainRef");
          
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(1, 0, "Set value", "Send - Set", 
          "Set <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>", 
          "Sets value at data ref.", "SetValue");
 
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("JSON value", "JSON value to set", '"{}"');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(2, 0, "Set JSON", "Send - Set", 
          "Set JSON <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>", 
          "Sets JSON value at data ref.", "SetJSON");
       
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("JSON value", "JSON value to set", '"{}"');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(3, 0, "Update JSON", "Send - Update JSON", 
          "Update JSON <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>",  
          "Updates JSON values at the data ref.", "UpdateJSON");

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(4, 0, "Push value", "Send - Push", 
          "Push <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>",   
          "Push value at data ref.", "PushValue");
 
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("JSON value", "JSON value to set", '"{}"');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(5, 0, "Push JSON", "Send - Push", 
          "Push JSON <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>",    
          "Push JSON value at data ref.", "PushJSON");

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("On transaction", "On transaction function.", '"_"');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(6, 0, "Transaction", "Send - Transaction", 
          "Transaction with callback: <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>",
          "Transaction value with callback.", "Transaction");

AddAnyTypeParam("Value", "The value to set", 0);
AddAction(7, 0, "Set value", "Send - Transaction", 
          "Set transaction value to <i>{0}</i>", 
          "Returns transaction value.", "ReturnTransactionValue");
           
AddStringParam("JSON value", "JSON value to set", '"{}"');
AddAction(8, 0, "Set JSON", "Send - Transaction", 
          "Set transaction JSON to <i>{0}</i>", 
          "Returns transaction JSON.", "ReturnTransactionJSON"); 

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(9, 0, "Remove", "Send - Remove", 
          "Remove all values at <i>{0}</i>, on complete callback to <i>{1}</i>",     
          "Remove all values at data ref.", "Remove");
          
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(10, 0, "Set boolean value", "Send - Set", 
          "Set <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>", 
          "Sets boolean value at data ref.", "SetBooleanValue");  

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddComboParamOption("False");
AddComboParamOption("True");
AddComboParam("Boolean", "Boolean value.", 1);
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(11, 0, "Push boolean value", "Send - Push", 
          "Push <i>{1}</i> at <i>{0}</i>, on complete callback to <i>{2}</i>",   
          "Push boolean value at data ref.", "PushBooleanValue");   

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(12, 0, "Set server timestamp", "Send - Set", 
          "Set server timestamp at <i>{0}</i>, on complete callback to <i>{1}</i>", 
          "Sets server timestamp at data ref.", "SetServerTimestamp");  

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddStringParam("On complete", 'On complete callback, ignored if enter an empty string "".', '""');
AddAction(13, 0, "Push server timestamp", "Send - Push", 
          "Push server timestamp at <i>{0}</i>, on complete callback to <i>{1}</i>",   
          "Push server timestamp at data ref.", "PushServerTimestamp");            
          
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddComboParamOption("Value changed");
AddComboParamOption("Child added");
AddComboParamOption("Child changed");
AddComboParamOption("Child removed");
AddComboParamOption("Child moved");
AddComboParam("Type ", "Event type");
AddStringParam("Callback function", "Callback function.", '"_"');
AddAction(21, 0, "Add callback", "Receive - Add", 
          "Add received callback: <i>{2}</i> for ref <i>{0}</i> (<i>{1}</i>)", 
          "Add received callback.", "AddReadingCallback");
          
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddComboParamOption("Value changed");
AddComboParamOption("Child added");
AddComboParamOption("Child changed");
AddComboParamOption("Child removed");
AddComboParamOption("Child moved");
AddComboParam("Type ", "Event type");
AddStringParam("Callback function", "Callback function.", '"_"');
AddAction(22, 0, "Remove callback", "Receive - Remove", 
          "Remove received callback: <i>{2}</i> for ref <i>{0}</i> (<i>{1}</i>)", 
          "Remove received callback.", "RemoveReadingCallback");  
          
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddComboParamOption("Value changed");
AddComboParamOption("Child added");
AddComboParamOption("Child changed");
AddComboParamOption("Child removed");
AddComboParamOption("Child moved");
AddComboParam("Type ", "Event type");
AddAction(23, 0, "Remove callback by type", "Receive - Remove", 
          "Remove all received callbacks for ref <i>{0}</i> (<i>{1}</i>)", 
          "Remove all received callbacks by type.", "RemoveReadingCallback");
               
AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAction(24, 0, "Remove all callbacks at ref", "Receive - Remove", 
          "Remove all received callbacks for ref <i>{0}</i>", 
          "Remove all received callbacks at ref.", "RemoveReadingCallback"); 

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddComboParamOption("Value changed");
AddComboParamOption("Child added");
AddComboParamOption("Child changed");
AddComboParamOption("Child removed");
AddComboParamOption("Child moved");
AddComboParam("Type ", "Event type");
AddStringParam("Callback function", "Callback function.", '"_"');
AddAction(25, 0, "Add once", "Receive - Add once", 
          "Add received callback: <i>{2}</i> once for ref <i>{0}</i> (<i>{1}</i>)", 
          "Add received callback once.", "AddReadingCallbackOnce");   

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAction(31, 0, "Remove", "On disconnect", 
          "Remove all values at <i>{0}</i> when disconnected", 
          'Remove all values at data ref when disconnected. Uses under "condition: On received".', "RemoveRefOnDisconnect");

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAnyTypeParam("Value", "The value to set", 0);
AddAction(32, 0, "Set value", "On disconnect", 
          "Set <i>{1}</i> at <i>{0}</i> when disconnected", 
          'Sets value at data ref when disconnected. Uses under "condition: On received".', "SetValueOnDisconnect");

AddStringParam("DataRef", "The Firebase data ref URL", "\"/myref\"");
AddStringParam("JSON value", "JSON value to set", '"{}"');
AddAction(33, 0, "Update JSON", "On disconnect", 
          "Update JSON <i>{1}</i> at <i>{0}</i> when disconnected", 
          'Updates JSON values at the data ref when disconnected. Uses under "condition: On received".', "UpdateJSONOnDisconnect");    
          
AddAction(34, 0, "Remove all callbacks", "Receive - Remove", 
          "Remove all registered received callbacks", 
          "Remove all registered received callbacks.", "RemoveReadingCallback");

AddStringParam("DataRef", "The Firebase data ref URL", '""');
AddAction(35, 0, "Cancel", "On disconnect", 
          "Cancel disconnected writing at <i>{0}</i>", 
          'Cancel disconnected writing.', "CancelOnDisconnect");          
          
// get query from Firebase_Query plugin
AddObjectParam("Query", "Query object.");
AddComboParamOption("Value changed");
AddComboParamOption("Child added");
AddComboParamOption("Child changed");
AddComboParamOption("Child removed");
AddComboParamOption("Child moved");
AddComboParam("Type ", "Event type");
AddStringParam("Callback function", "Callback function.", '"_"');
AddAction(51, 0, "Add callback", "Query", 
          "Add received callback: <i>{2}</i> for query <i>{0}</i> (<i>{1}</i>)", 
          "Add received callback.", "AddQueryCallback");
          
AddObjectParam("Query", "Query object.");
AddComboParamOption("Value changed");
AddComboParamOption("Child added");
AddComboParamOption("Child changed");
AddComboParamOption("Child removed");
AddComboParamOption("Child moved");
AddComboParam("Type ", "Event type");
AddStringParam("Callback function", "Callback function.", '"_"');
AddAction(52, 0, "Add callback once", "Query", 
          "Add received callback: <i>{2}</i> once for query <i>{0}</i> (<i>{1}</i>)", 
          "Add received callback once.", "AddQueryCallbackOnce");         

		
// online       
AddAction(61, 0, "Go offline", "Online", 
          "Go offline", 
          "Manually disconnect the Firebase client from the server and disable automatic reconnection. .", "GoOffline");
AddAction(62, 0, "Go online", "Online", 
          "Go online", 
          "Manually reestablish a connection to the Firebase server and enable automatic reconnection. . .", "GoOnline");           
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "Get root location reference", "Domain", "Domain", 
              "Get root location reference.");
AddExpression(1, ef_return_any | ef_variadic_parameters, "Transaction input", "Send - Transaction", "TransactionIn", 
              'Transaction input parameter, using under "condition:On transaction", JSON will be stringified. Add default value at 1st parameter if read data is null.');
AddExpression(2, ef_return_any | ef_variadic_parameters, "Receive data", "Receive", "LastData", 
              'Received data, using under "condition:On received". JSON will be stringified. Add default value at 1st parameter if read data is null.');
AddExpression(3, ef_return_any | ef_variadic_parameters, "Receive data", "Receive", "LastKey", 
              'Key of received data, using under "condition:On received"');	  
AddExpression(4, ef_return_any | ef_variadic_parameters, "Previous child name", "Receive", "PrevChildName", 
              'Previous child name, using under "condition:On received" with one of "Child added", "Child changed", "Child moved" type. Add default value at 1st parameter if read data is null.');
AddExpression(5, ef_return_any | ef_variadic_parameters, "Transaction result", "Send - Transaction", "TransactionResult", 
              'Transaction wrote result, using under "condition:On completed", JSON will be stringified. Add default value at 1st parameter if read data is null.');              
AddExpression(11, ef_return_string, "Last push ref", "Push", "LastPushRef", 
              "Data reference at last push.");

AddExpression(21, ef_return_string, "Generate new key from push", "ItemID", "GenerateKey", 
              "Generate new key from push action.");               
AddExpression(22, ef_return_string, "Get last generated key", "ItemID", "LastGeneratedKey", 
              "Get last generate a key from push action.");     
              
AddExpression(31, ef_return_number, "Current server time offset", "Server time offset", "ServerTimeOffset", 
              "Get current server time offset.");              
AddExpression(32, ef_return_number, "Estimated time", "Server time offset", "EstimatedTime", 
              "Get estimated time from curent time + current server time offset."); 
              

AddExpression(101, ef_return_string, "Error code", "Error", "LastErrorCode", 
              "Error code.");        
AddExpression(102, ef_return_string, "Error message", "Error", "LastErrorMessage", 
              "Error message (error.serverResponse) .");
                            
ACESDone();

// Property grid properties for this plugin
var property_list = [
    new cr.Property(ept_text, "Domain", "", "The root location of the Firebase data."),
    new cr.Property(ept_combo, "Connection detection", "Yes", "Enable connection detection.", "No|Yes"),
    new cr.Property(ept_combo, "Server time offset detection", "Yes", "Enable server time offset detection.", "No|Yes"),    
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
