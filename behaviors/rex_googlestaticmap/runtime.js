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
        this.center = this.properties[1];
        this.zoom_level = this.properties[2];
        this.map_type = MAPTYPE_MAP[this.properties[3]];
        this.image_format = FORMAT_MAP[this.properties[4]];
        
        // marker
        this.marker_locations = this.properties[5];
        this.marker_size = MARKERSIZE_MAP[this.properties[6]];
        this.marker_color = this.properties[7];
        this.marker_label = this.properties[8].substring(0, 1).toUpperCase(); 

        // path
        this.path_locations = this.properties[9]; 
        this.path_weight = this.properties[10];
        this.path_color = this.properties[11]; 
        //this.area_fill_color = this.properties[12];         
        
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
                  'size=' + this.getMapWidth().toString() + "x" + this.getMapHeight().toString() + 
                  '&maptype=' + this.map_type +
                  '&format=' + this.image_format;
        
        var has_marker_or_path = (this.marker_locations !== "") || (this.path_locations !== "")
        if (!has_marker_or_path)
        {        
            url_ += '&center=' + this.center;
            url_ += '&zoom=' + this.zoom_level;
        }

        if (this.marker_locations !== "")
        {
            url_ += '&markers=' + 
                    "size:" + this.marker_size + "|";
                    
            if (this.marker_color !== "")
                url_ += "color:" + this.marker_color + "|";
                
            if (this.marker_label !== "")
                url_ += "label:" + this.marker_label + "|";
                
            url_ += this.marker_locations;
        }
        
        if (this.path_locations !== "")
        {
            url_ += "&path=" +
                    "weight:" + this.path_weight + "|";

            if (this.path_color !== "")
                url_ += "color:" + this.path_color + "|";
                
            //if (this.area_fill_color !== "")
            //    url_ = "fillcolor:" + this.area_fill_color + "|";
                
            url_ += this.path_locations;
        };
        
        return url_;
	};    
    
	behinstProto.load_image = function (url_)
	{
		var img = new Image();
		var self = this;

		img.onload = function ()
		{
		    var inst = self.inst;

		    inst.canvas.width = inst.width;
			inst.canvas.height = inst.height;  
                
            inst.ctx.clearRect(0,0, inst.canvas.width, inst.canvas.height);
		    inst.ctx.drawImage(img, 0, 0, inst.width, inst.height);
			
			// WebGL renderer: need to create texture (canvas2D just draws with img directly)
			if (self.runtime.glwrap)
			{
				if (self.webGL_texture)
					self.runtime.glwrap.deleteTexture(self.webGL_texture);
					
				self.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
			}
			
			self.runtime.redraw = true;
            inst.update_tex = true; 
			self.runtime.trigger(cr.behaviors.Rex_GoogleStaticMap.prototype.cnds.OnMapLoaded, inst);
		};

		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
            
		img.src = url_;
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
    
	Acts.prototype.LoadURL = function ()
	{
		this.load_image(this.get_map_url());
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
}());