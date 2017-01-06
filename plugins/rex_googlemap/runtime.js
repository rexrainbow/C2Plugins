// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_googlemap = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.rex_googlemap.prototype;

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
    var CONTROLPOSITION_MAP = null;        
    var MAPTYPE_MAP = ['roadmap','satellite','terrain','hybrid'];  
	instanceProto.onCreate = function()
	{
		// Not supported in DC
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Textbox plugin not supported on this platform - the object will not be created");
			return;
		}
    
        // create div element
        this.myElemId = "GM" + this.uid.toString();
		this.elem = document.createElement("div");
		this.elem.id = this.myElemId;	 		
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		this.element_hidden = false;
        
        this.mapObj = null;  
        this.mapOptions = this.getDefaultMapOptions();
        this.exp_event = null;
        this.exp_snapShot = "";

		this.lastLeft = null;
		this.lastTop = null;
		this.lastRight = null;
		this.lastBottom = null;
		this.lastWinWidth = null;
		this.lastWinHeight = null;

		//if (this.properties[6] === 0)
		//{
		//	jQuery(this.elem).hide();
		//	this.visible = false;
		//	this.element_hidden = true;
		//}
					
        this.isInFullScreen = false;
        this.beforefullwindow = {"x":null, "y":null, "w":null, "h":null};
        
		this.updatePosition(true);  // init position and size        
		this.runtime.tickMe(this);      
	};     

	instanceProto.getDefaultMapOptions = function ()
	{
        var mapOptions = {
            "mapTypeId": MAPTYPE_MAP[this.properties[0]],            
            "zoom": this.properties[1],
        };
        
        if (this.properties[2] !== "")
            mapOptions["backgroundColor"] = this.properties[2];

        if (this.properties[3] === 0)
            mapOptions["disableDefaultUI"] = true;
        
        if (this.properties[4] === 0)
            mapOptions["keyboardShortcuts"] = false;         
        
        if (this.properties[5] === 0)
            mapOptions["draggable"] = false; 
        
        if (this.properties[6] !== "")
            mapOptions["draggableCursor"] = "url(" +this.properties[6] + "), auto;";
        
        if (this.properties[7] !== "")
            mapOptions["draggingCursor"] = "url(" +this.properties[7] + "), auto;";        
         
        mapOptions["fullscreenControl"] = (this.properties[8] === 1); 
        
        mapOptions["fullscreenControlOptions"] = {};
        mapOptions["fullscreenControlOptions"]["position"] = this.properties[9]; 

        
        if (this.properties[10] === 0)
            mapOptions["mapTypeControl"] = false;      

        mapOptions["mapTypeControlOptions"] = {};
        mapOptions["mapTypeControlOptions"]["position"] = this.properties[11]; 
        
        mapOptions["mapTypeControlOptions"]["style"] = this.properties[12];
                
        if (this.properties[13] >= 0)
            mapOptions["maxZoom"] = this.properties[13];           

        if (this.properties[14] >= 0)
            mapOptions["maxZoom"] = this.properties[14];    

        mapOptions["zoomControl"] = (this.properties[15] === 1);      

        mapOptions["zoomControlOptions"] = {};
        mapOptions["zoomControlOptions"]["position"] = this.properties[16];      
        
        if (this.properties[17] === 0)
            mapOptions["disableDoubleClickZoom"] = true;         
        
        if (this.properties[18] === 0)
            mapOptions["scrollwheel"] = false;      

        mapOptions["rotateControl"] = (this.properties[19] === 1);  

        mapOptions["rotateControlOptions"] = {};
        mapOptions["rotateControlOptions"]["position"] = this.properties[20]; 

        mapOptions["scaleControl"] = (this.properties[21] === 1);          
        
        return mapOptions;
	};         

	instanceProto.onDestroy = function ()
	{
        // TODO
		jQuery(this.elem).remove();
		this.elem = null;
	};

	instanceProto.tick = function ()
	{    
		this.updatePosition();
	};

	instanceProto.updatePosition = function (first)
	{
		if (this.runtime.isDomFree)
			return;
		
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		
		var rightEdge = this.runtime.width / this.runtime.devicePixelRatio;
		var bottomEdge = this.runtime.height / this.runtime.devicePixelRatio;
		
		// Is entirely offscreen or invisible: hide
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= rightEdge || top >= bottomEdge)
		{
			if (!this.element_hidden)
				jQuery(this.elem).hide();
				
			this.element_hidden = true;
			return;
		}
		
		// Truncate to canvas size
		if (left < 0)
			left = 0;
		if (top < 0)
			top = 0;
		if (right > rightEdge)
			right = rightEdge;
		if (bottom > bottomEdge)
			bottom = bottomEdge;
		
		var curWinWidth = window.innerWidth;
		var curWinHeight = window.innerHeight;
			
		// Avoid redundant updates
		if (!first && this.lastLeft === left && this.lastTop === top && this.lastRight === right && this.lastBottom === bottom && this.lastWinWidth === curWinWidth && this.lastWinHeight === curWinHeight)
		{
			if (this.element_hidden)
			{
				jQuery(this.elem).show();
				this.element_hidden = false;
			}
			
			return;
		}
			
		this.lastLeft = left;
		this.lastTop = top;
		this.lastRight = right;
		this.lastBottom = bottom;
		this.lastWinWidth = curWinWidth;
		this.lastWinHeight = curWinHeight;
		
		if (this.element_hidden)
		{
			jQuery(this.elem).show();
			this.element_hidden = false;
		}
		
		var offx = Math.round(left) + jQuery(this.runtime.canvas).offset().left;
		var offy = Math.round(top) + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).css("position", "absolute");
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(Math.round(right - left));
		jQuery(this.elem).height(Math.round(bottom - top));
	};

	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};

	instanceProto.drawGL = function(glw)
	{
	};
    
	instanceProto.initMapObj = function (latlng)
	{
        //this.mapOptions
        gmapi = window["google"]["maps"];    
        var mapOptions = this.prepareMapOptions();
        mapOptions["center"] = latlng;
        
        var self=this;
        var mapObj = new gmapi["Map"](this.elem, mapOptions);
        var onLoad = function()
        {
            self.runtime.trigger(cr.plugins_.rex_googlemap.prototype.cnds.OnMapLoaded, self); ;
        }
        gmapi["event"]["addListenerOnce"](mapObj, 'idle', onLoad);
        
        var onClick = function (event)
        {
            self.exp_event = event;
            self.runtime.trigger(cr.plugins_.rex_googlemap.prototype.cnds.OnClicked, self);
        }
        gmapi["event"]["addListener"](mapObj, 'click', onClick);
        this.mapObj = mapObj;
	}; 
    
       
	instanceProto.prepareMapOptions = function ()
	{
        CONTROLPOSITION_MAP = [
            gmapi["ControlPosition"]["BOTTOM_CENTER"],
            gmapi["ControlPosition"]["BOTTOM_LEFT"],       
            gmapi["ControlPosition"]["BOTTOM_RIGHT"],
            gmapi["ControlPosition"]["LEFT_BOTTOM"], 
            gmapi["ControlPosition"]["LEFT_CENTER"],
            gmapi["ControlPosition"]["LEFT_TOP"],       
            gmapi["ControlPosition"]["RIGHT_BOTTOM"],
            gmapi["ControlPosition"]["RIGHT_CENTER"],
            gmapi["ControlPosition"]["RIGHT_TOP"],
            gmapi["ControlPosition"]["TOP_CENTER"],       
            gmapi["ControlPosition"]["TOP_LEFT"],
            gmapi["ControlPosition"]["TOP_RIGHT"],
        ]; 
        
        var mapOptions = this.mapOptions;
        mapOptions["fullscreenControlOptions"]["position"] = CONTROLPOSITION_MAP[mapOptions["fullscreenControlOptions"]["position"]]; 
        
        mapOptions["mapTypeControlOptions"]["position"] = CONTROLPOSITION_MAP[mapOptions["mapTypeControlOptions"]["position"]]; 
        
        mapOptions["mapTypeControlOptions"]["style"] = [
            gmapi["MapTypeControlStyle"]["DEFAULT"],
            gmapi["MapTypeControlStyle"]["DROPDOWN_MENU"],
            gmapi["MapTypeControlStyle"]["HORIZONTAL_BAR"],            
        ][mapOptions["mapTypeControlOptions"]["style"]]; 
                
        mapOptions["zoomControlOptions"]["position"] = CONTROLPOSITION_MAP[mapOptions["zoomControlOptions"]["position"]];      

        mapOptions["rotateControlOptions"]["position"] = CONTROLPOSITION_MAP[mapOptions["rotateControlOptions"]["position"]]; 

        return mapOptions;
	};    
   
	instanceProto.getGoogleMapObj = function ()
	{    
		return this.mapObj;
	};
	
	instanceProto.saveToJSON = function ()
	{    
		return { 
                 "fw": this.beforefullwindow,
		         };
	};
	
	instanceProto.loadFromJSON = function (o)
	{   

        this.beforefullwindow = o["fw"];            
	};    
	//////////////////////////////////////
	// Conditions
    function Cnds() {};
	pluginProto.cnds = new Cnds();  
	
	Cnds.prototype.OnMapLoaded = function ()
	{
		return true;
	};	
	
	Cnds.prototype.OnClicked = function ()
	{
		return true;
	};	    
	
	Cnds.prototype.OnSnapshot = function ()
	{
		return true;
	};	        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();

	Acts.prototype.SetCenter = function (lat, lng)
	{
        if (!window.RexC2GoogleAPILoader.IsLoaded())
            return;
        
        var latlng = {"lat": lat, "lng": lng};
        if (!this.mapObj)
            this.initMapObj(latlng);
        else
            this.mapObj["setCenter"](latlng);
	};  
        
	Acts.prototype.SetMapType = function (type_)
	{
        var mapTypeId = MAPTYPE_MAP[type_];
        if (!this.mapObj)
            this.mapOptions["mapTypeId"] = mapTypeId;
        else
            this.mapObj["setMapTypeId"](mapTypeId);       
	};  
    
	Acts.prototype.SetZoomLevel = function (zoom_level)
	{
        if (!this.mapObj)
            this.mapOptions["zoom"] = zoom_level;
        else
            this.mapObj["setZoom"](zoom_level);       
	};  
        

	Acts.prototype.Refresh = function ()
	{
        if (!window.RexC2GoogleAPILoader.IsLoaded())
            return;
        
        if (!this.mapObj)
            return;
        
        gmapi["event"]["trigger"](this.mapObj, "resize");
	};  
    
	Acts.prototype.Snapshot = function ()
	{
        var self=this;
        var onSnapShot = function (canvas)
        {
            self.exp_snapShot = canvas.toDataURL('image/png')
            self.runtime.trigger(cr.plugins_.rex_googlemap.prototype.cnds.OnSnapshot, self); ;
        }
        var options = {
            "onrendered": onSnapShot,
            "useCORS": true,
        };
        window["html2canvas"](this.elem, options)
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LastLatitude = function (ret)
	{
        var lat = (this.exp_event === null)? 0: this.exp_event["latLng"]["lat"]();
		ret.set_float(lat);
	};    
    
	Exps.prototype.LastLongitude = function (ret)
	{
        var lng = (this.exp_event === null)? 0: this.exp_event["latLng"]["lng"]();
		ret.set_float(lng);
	};        
	
	Exps.prototype.CenterLatitude = function (ret)
	{
        var lat = (this.mapObj === null)? 0: this.mapObj["getCenter"]()["lat"]();
		ret.set_float(lat);
	};    
    
	Exps.prototype.CenterLongitude = function (ret)
	{
        var lng = (this.mapObj === null)? 0: this.mapObj["getCenter"]()["lng"]();
		ret.set_float(lng);
	};     
    
	Exps.prototype.Snapshot = function (ret)
	{
		ret.set_string(this.exp_snapShot);
	};   
    
}());