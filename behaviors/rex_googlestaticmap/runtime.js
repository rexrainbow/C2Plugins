// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_GoogleStaticMap = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_GoogleStaticMap.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{    
	};
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

    var MAPTYPE_MAP = ['roadmap','satellite','terrain','hybrid'];
    var FORMAT_MAP = ['png8','png32','gif','jpg','jpg-baseline'];
    var MARKERSIZE_MAP = ['tiny', 'mid', 'small'];
	behinstProto.onCreate = function()
	{         
        this.map_type = MAPTYPE_MAP[this.properties[1]];
        this.image_format = FORMAT_MAP[this.properties[2]];
        this.zoom_level = this.properties[3];        
        
        // center
        this.center = this.properties[4];        
        
        // marker
        this.markers = [];
        if (this.properties[5] !== "")  // locations
        {
            var marker = [
                this.properties[5],  // locations
                MARKERSIZE_MAP[this.properties[6]],  // size
                this.properties[7], // color
                this.properties[8].substring(0, 1).toUpperCase(), // label
                this.properties[9],  // icon
            ];
            this.markers.push(marker);
        }

        // path
        this.paths = [];
        if (this.properties[10] !== "")
        {
            var path = [
                this.properties[10],  // locations
                this.properties[11], // weight
                this.properties[12], // color
                this.properties[13],  // area fill color
            ];
            this.paths.push(path);
        }

        
        if (this.properties[0] === 1)    // initial_loading
            this.load_image(this.get_map_url());
	};

	behinstProto.onDestroy = function()
	{
	};
    
	behinstProto.tick = function ()
	{    
	};    
    
	behinstProto.getMapWidth = function ()
	{    
        return Math.floor(this.inst.width);
	};    
    
	behinstProto.getMapHeight = function ()
	{    
        return Math.floor(this.inst.height);
	};  
    
	behinstProto.get_map_url = function ()
	{        
        var protocol = window["location"]["protocol"];
        var url_= 'http' + (/^https/.test(protocol)?'s':'') + '://maps.googleapis.com/maps/api/staticmap?' +
                  'scale=' + ((window.devicePixelRatio === 1)? "1":"2") +
                  '&mobile=' + ((this.runtime.isMobile)? "true":"false") +        
                  '&size=' + this.getMapWidth().toString() + "x" + this.getMapHeight().toString() + 
                  '&maptype=' + this.map_type +
                  '&format=' + this.image_format;
                  
                  
        if (this.zoom_level >= 0 )
            url_ += '&zoom=' + this.zoom_level.toString();
        
        var has_marker_or_path = (this.markers.length > 0) || (this.paths.length > 0)
        if (!has_marker_or_path)
        {        
            url_ += '&center=' + encodeURIComponent(this.center);
        }

        if (this.markers.length > 0)
        {
            var i, cnt=this.markers.length, marker;
            var locations, size, color, label, icon;
            for (i=0; i<cnt; i++)
            {
                marker = this.markers[i];
                locations = marker[0];
                size = marker[1];
                color = marker[2];
                label = marker[3];
                icon = marker[4];
                
                url_ += '&markers=' + 
                        "size:" + size + "|";
                        
                if (color !== "")
                    url_ += "color:" + color + "|";
                
                if (label !== "")
                    url_ += "label:" + label + "|"; 

                if (icon !== "")
                    url_ += "icon:" + icon + "|";                 

                url_ += encodeURIComponent(locations);
            }                    
        }
        
        if (this.paths.length > 0)
        {
            var i, cnt=this.paths.length, path;
            var locations, weight, color, area_fill_color;
            for (i=0; i<cnt; i++)
            {
                path = this.paths[i];
                locations = path[0];
                weight = path[1];
                color = path[2];
                area_fill_color = path[3];
                
                url_ += "&path=" +
                    "weight:" + weight + "|";
                        
                if (color !== "")
                    url_ += "color:" + color + "|";
                
                if (area_fill_color !== "")
                    url_ += "fillcolor:" + area_fill_color + "|";                
                
                url_ += encodeURIComponent(locations);
            }  
        }
        
        return url_;
	};    
    
	behinstProto.load_image = function (url_)
	{       
		var img = new Image();
		var self = this;
        var inst = this.inst;

		img.onload = function ()
		{
            if ((!inst.canvas) ||  (!inst.ctx))
                return;            

            var w = inst.width;
            var h = inst.height;
		    inst.canvas.width = w
			inst.canvas.height = h
                
            inst.ctx.clearRect(0,0, w, h);
		    inst.ctx.drawImage(img, 0, 0, w, h);
						
			self.runtime.redraw = true;
            inst.update_tex = true; 
			self.runtime.trigger(cr.behaviors.Rex_GoogleStaticMap.prototype.cnds.OnMapLoaded, inst);
		};

		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
            
		img.src = url_;
	};
    
	behinstProto.saveToJSON = function ()
	{ 
		return {
            "mt":this.map_type,
            "if": this.image_format,
            "zl": this.zoom_level,
            
            "c": this.center,
            "m": this.markers,
            "p": this.paths,
        };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.map_type = o["mt"];
        this.image_format = o["if"];
        this.zoom_level = o["zl"];
        
        this.center = o["c"];
        this.markers = o["m"];
        this.paths = o["p"];
	};	    
    	 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnMapLoaded = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetMapType = function (type_)
	{
		this.map_type = MAPTYPE_MAP[type_];
	};    
    
	Acts.prototype.SetImageFormat = function (format_)
	{
        this.image_format = FORMAT_MAP[format_];
	};  
    
	Acts.prototype.SetZoomLevel = function (zoom_level)
	{
        this.zoom_level = zoom_level;   
	};  
    
	Acts.prototype.SetCenter = function (center_)
	{
        this.center = center_;  
	};  
    
	Acts.prototype.CleanMarkers = function ()
	{
        this.markers.length = 0;
	};      
    
	Acts.prototype.AddMarker = function (locations, size, color, label, icon)
	{
        if (locations !== "")
        {
            var marker = [
                locations,
                MARKERSIZE_MAP[size], 
                color,
                label.substring(0, 1).toUpperCase(),
                icon,
            ];
            this.markers.push(marker);
        }
	};        
    
	Acts.prototype.CleanPaths = function ()
	{
        this.paths.length = 0;
	};      
    
	Acts.prototype.AddPath = function (pStart, pEnd, weight, path_color, area_fill_color)
	{
        var locations;
        if (pStart === "")
            locations = pEnd;
        else if (pEnd === "")
            locations = pStart;
        else  // both pStart, and pEnd have value
            locations = pStart + "|" + pEnd;
            
        if (locations !== "")
        {
            var path = [
                locations,
                weight,
                path_color,
                area_fill_color
            ];
            this.paths.push(path);
        }
	};       
    
	Acts.prototype.LoadMap = function ()
	{
		this.load_image(this.get_map_url());
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.MapURL = function (ret)
	{
		ret.set_string(this.get_map_url());
	};    
}());