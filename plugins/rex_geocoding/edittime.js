function GetPluginSettings()
{
	return {
		"name":			"Geocoding",
		"id":			"Rex_Geocoding",
		"version":		"0.1",        
		"description":	"Converting between geographic coordinates and human-readable address.",
		"author":		"Rex.Rainbow",
		"help url":		"https://rexrainbow.github.io/C2RexDoc/c2rexpluginsACE/plugin_rex_geocoding.html",
		"category":		"Rex - Web - Google map",
		"type":			"object",			// not in layout
		"rotatable":	false,     
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(1,	cf_trigger, "On completed", "Address", "On get address completed", 
                    "Triggered when a request of address converting completes successfully.", "OnConvert2AddressComplete");

AddCondition(2,	cf_trigger, "On error", "Address", "On get address error", 
                    "Triggered when a request of address converting fails.", "OnConvert2AddressError");

AddCondition(11,	cf_trigger, "On completed", "LatLng", "On get LatLng completed", 
                    "Triggered when a request of LatLng converting completes successfully.", "OnConvert2LatLngComplete");

AddCondition(12,	cf_trigger, "On error", "LatLng", "On get LatLng error", 
                    "Triggered when a request of LatLng converting fails.", "OnConvert2LatLngError");
//////////////////////////////////////////////////////////////
// Actions
AddNumberParam("Latitude", "Latitude.", 0);
AddNumberParam("Longitude", "Longitude.", 0);
AddAction(1, 0, "Convert LatLng to address", "Address", 
               "Request converting latitude-longitude ( <i>{0}</i> , <i>{1}</i> ) into address", 
               "Request converting latitude-longitude to human-readable address.", "LatLng2Address");

AddStringParam("Address", "Address.", '""');
AddAction(11, 0, "Convert address to LatLng", "LatLng", 
               "Request converting address <i>{0}</i> to latitude-longitude", 
               "Request converting address to latitude-longitude.", "AddressLatLng");
               
//////////////////////////////////////////////////////////////
// Expressions
AddExpression(1, ef_return_string | ef_variadic_parameters, "Get last formatted address", "Address", "LastFormattedAddress", 
    "Get formatted address returned by the last successful request. Add 1st parameter to get formatted address at the specific level.");
AddExpression(2, ef_return_number, "Get source latitude", "Address", "SrcLatitude", "Get source latitude of last request.");
AddExpression(3, ef_return_number, "Get source longitude", "Address", "SrcLongitude", "Get source longitude of last request.");

AddNumberParam("Level", "Level of address.", 0);
AddExpression(4, ef_return_string | ef_variadic_parameters, "Get last address components", "Address", "LastAddressComponments", 
    "Get address components returned by the last successful request as JSON. Add 2nd parameter to get a specific component by a string type, or a number index.");

AddExpression(5, ef_return_string, "Get last address result", "Address", "LastAddressResults", 
    "Get address results returned by the last successful request as JSON.");
    
AddExpression(11, ef_return_number, "Get last latitude", "LatLng", "LastLatitude", "Get latitude returned by the last successful request.");
AddExpression(12, ef_return_number, "Get last longitude", "LatLng", "LastLongitude", "Get longitude returned by the last successful request.");
AddExpression(13, ef_return_string, "Get source address", "LatLng", "SrcAddress", "Get source address of last request.");
AddExpression(14, ef_return_string, "Get last latlng result", "LatLng", "LastLatLngResults", 
    "Get latlng results returned by the last successful request as JSON.");
    
AddExpression(21, ef_return_string, "Get postal code", "Address", "LastPostalCode", 
    "Get postal code returned by the last successful request.");   
    
AddExpression(23, ef_return_string, "Get country", "Address", "LastCountry", 
    "Get country returned by the last successful request.");    
AddExpression(24, ef_return_string, "Get country in short name", "Address", "LastCountryShort", 
    "Get country in short name returned by the last successful request.");    
    
//AddExpression(25, ef_return_string, "Get administrative area level 2", "Address", "LastAdministrativeAreaLevel2", 
//    "Get  administrative area level 2 returned by the last successful request.");    
//AddExpression(26, ef_return_string, "Get  administrative area level 2 in short name", "Address", "LastAdministrativeAreaLevel2Short", 
//    "Get  administrative area level 2 in short name returned by the last successful request."); 
    
AddExpression(27, ef_return_string, "Get political", "Address", "LastPolitical", 
    "Get  political returned by the last successful request.");    
AddExpression(28, ef_return_string, "Get  political in short name", "Address", "LastPoliticalShort", 
    "Get  political in short name returned by the last successful request."); 
   
AddExpression(29, ef_return_string, "Get locality", "Address", "LastLocality", 
    "Get  locality returned by the last successful request.");    
AddExpression(30, ef_return_string, "Get  locality in short name", "Address", "LastLocalityShort", 
    "Get  locality in short name returned by the last successful request.");  
    
AddExpression(31, ef_return_string, "Get route", "Address", "LastRoute", 
    "Get  route returned by the last successful request.");    
AddExpression(32, ef_return_string, "Get  route in short name", "Address", "LastRouteShort", 
    "Get  route in short name returned by the last successful request.");  
    
AddExpression(33, ef_return_string, "Get street number", "Address", "LastStreetNumber", 
    "Get street number returned by the last successful request.");       
    
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
