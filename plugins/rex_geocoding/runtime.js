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

    var isAPILoad = false;   
    var pendingCallbacks = [];
	typeProto.onCreate = function()
	{
        var callback = function()
        {
            isAPILoad = true;
            var i, cnt=pendingCallbacks.length;
            for (i=0; i<cnt; i++)
            {
                pendingCallbacks[i]();
            }
            pendingCallbacks.length = 0;
        }
	    jsfile_load("https://maps.googleapis.com/maps/api/js", callback);        
	};
	
	var jsfile_load = function(file_name, callback)
	{
	    var scripts=document.getElementsByTagName("script");
	    var exist=false;
	    for(var i=0;i<scripts.length;i++)
	    {
	    	if(scripts[i].src.indexOf(file_name) != -1)
	    	{
	    		exist=true;
	    		break;
	    	}
	    }
	    if(!exist)
	    {
	    	var newScriptTag=document.createElement("script");
            newScriptTag["type"] = "text/javascript";
            newScriptTag["src"] = file_name;
            
            if (typeof callback === "function")
                newScriptTag["onload"] = callback;
            
	    	document.getElementsByTagName("head")[0].appendChild(newScriptTag);
	    }
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
        if (!this.recycled)
        {         
            this.addressResult = {"status": null, "results": null, "srcLat":0, "srcLng": 0};
            this.latLngResult = {"status": null, "results": null, "srcAddr": ""};        
        }
        else
        {
            this.addressResult["status"] = null;
            this.addressResult["results"] = null;  
            this.addressResult ["srcLat"] = 0;
            this.addressResult ["srcLng"] = 0;
            this.latLngResult["status"] = null;
            this.latLngResult["results"] = null;       
            this.latLngResult["srcAddr"] = "";                
        }
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
            var i, icnt=results.length, types;
            for (i=icnt-1; i>=0; i--)
            {
                types = results[i]["types"];
                var j, jcnt=types.length;
                for (j=0; j<jcnt; j++)
                {
                    if (types[j] === level)
                    {
                        return results[i];
                    }
                }
            }
        }
        
		return null;
	};

	instanceProto.getAddressComponments = function (level, ci)
	{
        var addr = this.getAddressLevel(level);
        if (addr === null)
            return null;
        
        var components = addr["address_components"];
        if (typeof ci === "number")
        {
            return components[ci]["long_name"];
        }
        else if (typeof ci === "string")
        {
            var i, icnt=components.length, types;
            for (i=icnt-1; i>=0; i--)
            {
                types = components[i]["types"];
                var j, jcnt=types.length;
                for (j=0; j<jcnt; j++)
                {
                    if (types[j] === ci)
                    {
                        return components[i]["long_name"];
                    }
                }
            }
            
            // could not find matched component
            return null;
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
        if (isAPILoad)    
            this.latLng2Address(lat, lng);
        else
        {
            var self=this;
            var callback = function ()
            {
                self.latLng2Address(lat, lng);
            }
            pendingCallbacks.push(callback);
        }
	};   

	Acts.prototype.AddressLatLng = function (address)
	{
        if (isAPILoad)    
            this.address2LatLng(address);
        else
        {
            var self=this;
            var callback = function ()
            {
                self.address2LatLng(address);
            }
            pendingCallbacks.push(callback);
        }
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
        var components = this.getAddressComponments(level, ci);
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
        debugger
		ret.set_string(din(this.latLngResult["results"], ""));
	}; 
    
}());