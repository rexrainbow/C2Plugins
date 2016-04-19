// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Geocoding = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Geocoding.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{     
         assert2(cr.plugins_.rex_googlemap_api, "Error: missing Google Map API plugin.");    
	};
	
	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
 
	instanceProto.onCreate = function()
	{                    
         this.addressResult = {"status": null, "results": null, "srcLat":0, "srcLng": 0};
         this.latLngResult = {"status": null, "results": null, "srcAddr": ""};    
	};

	instanceProto.latLng2Address = function (lat, lng)
	{
        var gmapi = window["google"]["maps"];
        var coord = new gmapi["LatLng"](lat, lng);
        var geocoder = new gmapi["Geocoder"]();
        
        var self=this;
        var on_getResult = function (results, status) 
        {
            self.addressResult["srcLat"] = lat;
            self.addressResult["srcLng"] = lng;                 
            self.addressResult["status"] = status;
            if (status === gmapi["GeocoderStatus"]["OK"]) 
            {               
                self.addressResult["results"] = results;
                self.runtime.trigger(cr.plugins_.Rex_Geocoding.prototype.cnds.OnConvert2AddressComplete, self); 
            }
            else 
            {
                self.addressResult["results"] = null;
                self.runtime.trigger(cr.plugins_.Rex_Geocoding.prototype.cnds.OnConvert2AddressError, self); 
            }
        };
        
        geocoder["geocode"]({'latLng': coord }, on_getResult);        
	};     

	instanceProto.address2LatLng = function (address)
	{
        var gmapi = window["google"]["maps"];
        var geocoder = new gmapi["Geocoder"]();
        
        var self=this;
        var on_getResult = function (results, status) 
        {
            self.latLngResult["srcAddr"] = address;  
            self.latLngResult["status"] = status;
            if (status === gmapi["GeocoderStatus"]["OK"]) 
            {               
                self.latLngResult["results"] = results;
                self.runtime.trigger(cr.plugins_.Rex_Geocoding.prototype.cnds.OnConvert2LatLngComplete, self); 
            }
            else 
            {
                self.latLngResult["results"] = null;
                self.runtime.trigger(cr.plugins_.Rex_Geocoding.prototype.cnds.OnConvert2LatLngError, self); 
            }
        };
        
        geocoder["geocode"]({'address': address}, on_getResult);        
	}; 
    
    var getObjectByType = function(objects, typeName)
    {
        var i, icnt=objects.length, types;
        for (i=0; i<icnt; i++)
        {
            types = objects[i]["types"];
            var j, jcnt=types.length;
            for (j=0; j<jcnt; j++)
            {
                if (types[j] === typeName)
                {
                    return objects[i];
                }
            }
        }
        
        return null;
    }
    
	instanceProto.getAddressLevel = function (level)
	{
        var results = this.addressResult["results"];
        if (results == null)
            return null;
        
        if (level == null)  level = 0;    
        if (typeof level === "number")
        {            
            return results[level];
        }
        else if (typeof level === "string")        
        {
            return getObjectByType(results, level);
        }
        
		return null;
	};

	instanceProto.getAddressComponments = function (level, ci, prop)
	{
        var addr = this.getAddressLevel(level);
        if (addr === null)
            return null;
        
        var components = addr["address_components"];
        if (typeof ci === "number")
        {
            return components[ci][prop];
        }
        else if (typeof ci === "string")
        {
            addr = getObjectByType(components, ci);
            if (addr != null)
                addr = addr[prop];
            return addr;
        }
        else
        {
            return components;
        }
        
	};
    
	instanceProto.lastLatitude = function ()
	{
        var lat=0;
        var results = this.latLngResult["results"];
        if (results && results[0])       
            lat = results[0]["geometry"]["location"]["lat"]();
		return lat;
	};    
    
	instanceProto.lastLongitude = function ()
	{
        var lng=0;
        var results = this.latLngResult["results"];
        if (results && results[0])       
            lng = results[0]["geometry"]["location"]["lng"]();
		return lng;
	};
    
    var din = function (d, default_value)
    {       
        var o;
	    if (d === true)
	        o = 1;
	    else if (d === false)
	        o = 0;
        else if (d == null)
        {
            if (default_value != null)
                o = default_value;
            else
                o = 0;
        }
        else if (typeof(d) == "object")
            o = JSON.stringify(d);
        else
            o = d;
	    return o;
    };
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    
	
	Cnds.prototype.OnConvert2AddressComplete = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnConvert2AddressError = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnConvert2LatLngComplete = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnConvert2LatLngError = function ()
	{
		return true;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.LatLng2Address = function (lat, lng)
	{
        if (!window.RexC2GoogleAPILoader.IsLoaded())
            return;
        
        this.latLng2Address(lat, lng);
	};   

	Acts.prototype.AddressLatLng = function (address)
	{
        if (!window.RexC2GoogleAPILoader.IsLoaded())
            return;
        
        this.address2LatLng(address);
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.LastFormattedAddress = function (ret, level)
	{
        if (level == null)  level = 0;    
        var addr = this.getAddressLevel(level);
        if (addr !== null)
            addr = addr["formatted_address"];
        else
            addr = ""
		ret.set_string(addr);
	};
    
	Exps.prototype.SrcLatitude = function (ret)
	{       
		ret.set_float(this.addressResult["srcLat"]);
	};    
    
	Exps.prototype.SrcLongitude = function (ret)
	{
		ret.set_float(this.addressResult["srcLng"]);
	};   

	Exps.prototype.LastAddressComponments = function (ret, level, ci)
	{
        var components = this.getAddressComponments(level, ci, "long_name");
		ret.set_string(din(components, ""));
	};

	Exps.prototype.LastAddressResults = function (ret)
	{
		ret.set_string(din(this.addressResult["results"], ""));
	};    

	Exps.prototype.LastLatitude = function (ret)
	{
		ret.set_float(this.lastLatitude());
	};    
    
	Exps.prototype.LastLongitude = function (ret)
	{
		ret.set_float(this.lastLongitude());
	};        

	Exps.prototype.SrcAddress = function (ret, level)
	{
		ret.set_string(this.latLngResult["srcAddr"]);
	};   

	Exps.prototype.LastLatLngResults = function (ret)
	{        
		ret.set_string(din(this.latLngResult["results"], ""));
	}; 
    
	Exps.prototype.LastPostalCode = function (ret)
	{                
        var postal_code = this.getAddressComponments(0, "postal_code", "long_name") || "";
		ret.set_string(postal_code);
	};
    
	Exps.prototype.LastCountry = function (ret)
	{                
        var country = this.getAddressComponments(0, "country", "long_name") || "";
		ret.set_string(country);
	};
    
	Exps.prototype.LastCountryShort = function (ret)
	{                
        var country = this.getAddressComponments(0, "country", "short_name") || "";
		ret.set_string(country);
	};  
    
	//Exps.prototype.LastAdministrativeAreaLevel2 = function (ret)
	//{                
    //    var administrative_area_level_2 = this.getAddressComponments(0, "administrative_area_level_2", "long_name") || "";
	//	ret.set_string(administrative_area_level_2);
	//};
    //
	//Exps.prototype.LastAdministrativeAreaLevel2Short = function (ret)
	//{                
    //    var administrative_area_level_2 = this.getAddressComponments(0, "administrative_area_level_2", "short_name") || "";
	//	ret.set_string(administrative_area_level_2);
	//}; 
    
	Exps.prototype.LastPolitical = function (ret)
	{                
        var political = this.getAddressComponments(0, "political", "long_name") || "";
		ret.set_string(political);
	};
    
	Exps.prototype.LastPoliticalShort = function (ret)
	{                
        var political = this.getAddressComponments(0, "political", "short_name") || "";
		ret.set_string(political);
	};     
    
	Exps.prototype.LastLocality = function (ret)
	{                
        var locality = this.getAddressComponments(0, "locality", "long_name") || "";
		ret.set_string(locality);
	};
    
	Exps.prototype.LastLocalityShort = function (ret)
	{                
        var locality = this.getAddressComponments(0, "locality", "short_name") || "";
		ret.set_string(locality);
	};
    
	Exps.prototype.LastRoute = function (ret)
	{                
        var route = this.getAddressComponments(0, "route", "long_name") || "";
		ret.set_string(route);
	};
    
	Exps.prototype.LastRouteShort = function (ret)
	{                
        var route = this.getAddressComponments(0, "route", "short_name") || "";
		ret.set_string(route);
	};
    
	Exps.prototype.LastStreetNumber = function (ret)
	{                
        var street_number = this.getAddressComponments(0, "street_number", "long_name") || "";
		ret.set_string(street_number);
	};    
}());