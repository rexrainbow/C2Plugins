// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_googlemap_marker = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.rex_googlemap_marker.prototype;

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
        
        this.markerObj = null;
        this.markerOptions = this.getDefaultMarkerOptions();
      
	};

    instanceProto.getDefaultMarkerOptions = function ()
    {
        var markerOptions = {};
        if (this.properties[0] !== "")
            markerOptions["title"] = this.properties[0];  
        
        if (this.properties[1] !== 0)
        {
            markerOptions["animation"] = this.properties[1];           
        }
        
        if (this.properties[2] !== "")
        {
            var label = {};
            label["text"] = this.properties[2];
            label["color"] = this.properties[3];    
            label["fontFamily"] = this.properties[4];
            label["fontSize"] = this.properties[5]; 
            label["fontWeight"] = this.properties[6];             
            markerOptions["label"] = label;            
        }
        
        if (this.properties[7] !== "")
        {
            var icon = {};
            icon["url"] = this.properties[7];  
            
            if (this.properties[8] !== -1)      
                icon["scaledSize"] = [this.properties[8] , this.properties[9]];
            
            markerOptions["icon"] = icon;            
        }  
        
        if (this.properties[10] === 0)
            markerOptions["clickable"] = false; 
        
        if (this.properties[11] === 1)
            markerOptions["draggable"] = true; 
                
        if (this.properties[12] !== 1)
            markerOptions["opacity"] = this.properties[12];     
        
                
        if (this.properties[13] === 0)
            markerOptions["visible"] = false;             
        
        return markerOptions;
    };

	instanceProto.onDestroy = function ()
	{
        if (this.markerObj === null)
            return;
        
        this.markerObj["setMap"](null);
	};
    
	instanceProto.initMarkerObj = function (latlng)
    {
        gmapi = window["google"]["maps"];
        var markerOptions = this.prepareMarkerOptions();
        markerOptions["position"] = latlng;
        var markerObj = new gmapi["Marker"](markerOptions);
        
        var self=this;
        var onClick = function (event)
        {
            self.runtime.trigger(cr.plugins_.rex_googlemap_marker.prototype.cnds.OnClicked, self);
        }
        gmapi["event"]["addListener"](markerObj, 'click', onClick);
        
        this.markerObj = markerObj;
    };  
    
    var getAnimationName = function (animIndex)
    {        
        switch (animIndex)
        {
        case 0: return null;
        case 1: return gmapi["Animation"]["BOUNCE"];
        case 2: return gmapi["Animation"]["DROP"];
        }
    }
	instanceProto.prepareMarkerOptions = function ()
	{
        var markerOptions = this.markerOptions;
        if (markerOptions["animation"] != null)
        {
            markerOptions["animation"] = getAnimationName( markerOptions["animation"] ); 
        }
        
        if (markerOptions["icon"])
        {
            if (markerOptions["icon"]["scaledSize"])
            {
                var size = markerOptions["icon"]["scaledSize"];
                markerOptions["icon"]["scaledSize"] = new gmapi["Size"](size[0], size[1]);
            }
        }
        return markerOptions;
	};      

	instanceProto.getMarkerObj = function ()
	{    
		return this.markerObj;
	};       
    
    var getMapObject = function (mapType)
    {
        var mapInst = mapType.getFirstPicked();
        // not a google map object        
        if (!mapInst || !mapInst.getGoogleMapObj)
            return;        
        return mapInst.getGoogleMapObj();
    };    
	//////////////////////////////////////
	// Conditions
    function Cnds() {};
	pluginProto.cnds = new Cnds();  
	
	Cnds.prototype.OnClicked = function ()
	{
		return true;
	};	   
    
	Cnds.prototype.IsOnMap = function ()
	{
        if (this.markerObj === null)
            return false;
        
        return (this.markerObj["getMap"]() != null);
	};	
	    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.PutOnMap = function (mapType, lat, lng)
	{
        if (!window.RexC2GoogleAPILoader.IsLoaded())
            return;
        
        var mapObj = getMapObject(mapType);
        if (mapObj == null)
            return;
        
        var latlng = {"lat": lat, "lng": lng};
        if (!this.markerObj)        
            this.initMarkerObj(latlng);
        else
           this.markerObj["setPosition"](latlng);
       
        this.markerObj["setMap"](mapObj);       
	}; 
    
	Acts.prototype.SetAnim = function (type_)
	{       
        if (type_ != null)
            type_ += 1;

        if (!this.markerObj)
            this.markerOptions["animation"] = type_;
        else
        {
            this.markerObj["setAnimation"]( getAnimationName( type_ ) );       
        }
	};
    
	Acts.prototype.SeTtitle = function (title)
	{
        if (!this.markerObj)
            this.markerOptions["title"] = title;
        else
            this.markerObj["setTitle"](title);       
	};      
    
	Acts.prototype.SetVisible = function (visible)
	{
        var e = (visible===1);
        if (!this.markerObj)
            this.markerOptions["visible"] = e;
        else
            this.markerObj["setVisible"](visible===1);       
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
		
	Exps.prototype.Latitude = function (ret)
	{
        var lat = (this.markerObj === null)? 0: this.markerObj["getPosition"]()["lat"]();
		ret.set_float(lat);
	};    
    
	Exps.prototype.Longitude = function (ret)
	{
        var lng = (this.markerObj === null)? 0: this.markerObj["getPosition"]()["lng"]();
		ret.set_float(lng);
	};
    
	Exps.prototype.Title = function (ret)
	{
        var title = (this.markerObj === null)? "": this.markerObj["getTitle"]();
		ret.set_string(title);
	};
    
}());