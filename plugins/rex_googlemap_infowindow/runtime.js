// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_googlemap_infowindow = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.rex_googlemap_infowindow.prototype;

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

	// called whenever an instance is created
    var gmapi = null;
	instanceProto.onCreate = function()
	{
		// Not supported in DC
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Textbox plugin not supported on this platform - the object will not be created");
			return;
		}
        
        this.infoWindowObj = null;
        this.infoWindowOptions = this.getDefaultInfoWindowOptions();
      
	};

    instanceProto.getDefaultInfoWindowOptions = function ()
    {
        var infoWindowOptions = {};
        if (this.properties[0] !== "")
            infoWindowOptions["content"] = this.properties[0];  
        
        if (this.properties[1] >= 0)
            infoWindowOptions["maxWidth"] = this.properties[1];           
        
        return infoWindowOptions;
    };
    
	instanceProto.onDestroy = function ()
	{
        if (this.infoWindowObj !== null)
            this.infoWindowObj["close"]();
	};
    
	instanceProto.initInfoWindowObj = function (latlng)
    {
        gmapi = window["google"]["maps"];
        var infoWindowOptions = this.prepareInfoWindowOptions();
        infoWindowOptions["position"] = latlng;
        var infoWindowObj = new gmapi["InfoWindow"](infoWindowOptions);
        
        this.infoWindowObj = infoWindowObj;
    };      
    
	instanceProto.prepareInfoWindowOptions = function ()
	{
        var infoWindowOptions = this.infoWindowOptions;
        return infoWindowOptions;
	};     
	//////////////////////////////////////
	// Conditions
    function Cnds() {};
	pluginProto.cnds = new Cnds();  
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.PutOnMap = function (mapType, lat, lng)
	{
        if (!window.RexC2GoogleAPILoader.IsLoaded())
            return;
        
        var mapInst = mapType.instances[0];
        // not a google map object        
        if (!mapInst || !mapInst.getGoogleMapObj)
            return;
        
        var mapObj = mapInst.getGoogleMapObj();
        var latlng = {"lat": lat, "lng": lng};
        if (!this.infoWindowObj)        
            this.initInfoWindowObj(latlng);
        else
           this.infoWindowObj["setPosition"](latlng);
       
        this.infoWindowObj["open"](mapObj);       
	}; 

	Acts.prototype.Close = function ()
	{
        if (!this.infoWindowObj)
            return;
        
        this.infoWindowObj["close"]();       
	};  
    
	Acts.prototype.SetContent = function (content)
	{
        if (!this.infoWindowObj)
            this.infoWindowOptions["content"] = content;
        else
            this.infoWindowObj["setContent"](content);       
	};         
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
		
	Exps.prototype.Latitude = function (ret)
	{
        var lat = (this.infoWindowObj === null)? 0: this.infoWindowObj["getPosition"]()["lat"]();
		ret.set_float(lat);
	};    
    
	Exps.prototype.Longitude = function (ret)
	{
        var lng = (this.infoWindowObj === null)? 0: this.infoWindowObj["getPosition"]()["lng"]();
		ret.set_float(lng);
	};
    
	Exps.prototype.Content = function (ret)
	{
        var content = (this.infoWindowObj === null)? "": this.infoWindowObj["getContent"]();
		ret.set_string(content);
	};
    
}());