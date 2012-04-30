// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Video = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.Rex_Video.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
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
	instanceProto.onCreate = function()
	{
		// Not supported in directCanvas
		if (this.runtime.isDomFree)
			return;
            
        this.elem = document.createElement("video");
        var source = document.createElement('source');
        this.elem.appendChild(source);
        source.src = this.properties[0]; 
        //this.elem.src = this.properties[0];      
        this.elem.poster = this.properties[1];            
        this.elem.autoplay = (this.properties[2]==1); 
        this.elem.controls = (this.properties[3]==1);   
        this.elem.preload = ["auto","metadata","none"][this.properties[4]];
        this.elem.loop = (this.properties[5]==1);  
        this.elem.muted = (this.properties[6]==1);
        jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
        
        this._pre_ended = false;

		this.updatePosition();
		
		this.runtime.tickMe(this);
	};
	
	instanceProto.onDestroy = function ()
	{
		if (this.runtime.isDomFree)
			return;
            
		jQuery(this.elem).remove();
		this.elem = null;
	};
	
	instanceProto.tick = function ()
	{
		this.updatePosition();
        this.check_ended();
	};
	
	instanceProto.updatePosition = function ()
	{
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		
		// Is entirely offscreen or invisible: hide
		if (!this.visible || right <= 0 || bottom <= 0 || left >= this.runtime.width || top >= this.runtime.height)
		{
			jQuery(this.elem).hide();
			return;
		}
		
		// Truncate to canvas size
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= this.runtime.width)
			right = this.runtime.width - 1;
		if (bottom >= this.runtime.height)
			bottom = this.runtime.height - 1;
			
		jQuery(this.elem).show();
		
		var offx = left + jQuery(this.runtime.canvas).offset().left;
		var offy = top + jQuery(this.runtime.canvas).offset().top;
		jQuery(this.elem).offset({left: offx, top: offy});
		jQuery(this.elem).width(right - left);
		jQuery(this.elem).height(bottom - top);
	};
	    
	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};
    	
	instanceProto.check_ended = function ()
	{
        if (!this._pre_ended && this.elem.ended)
            this.runtime.trigger(cr.plugins_.Rex_Video.prototype.cnds.OnEnded, this);
            
        this._pre_ended = this.elem.ended;
	};    

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
    
	cnds.OnEnded = function ()
	{
		return true;
	};
	
	cnds.IsEnded = function ()
	{
		return this.elem.ended;
	};
    
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.SetSource = function (src)
	{
		this.elem.src = src;
	};      
    
	acts.Play = function ()
	{
		this.elem.play();
	};  

	acts.Pause = function ()
	{
		this.elem.pause();
	}; 

	acts.SetControls = function (is_enable)
	{
		this.elem.controls = (is_enable==1);
	};   

	acts.SetVolume = function (volume)
	{
		this.elem.volume = cr.clamp(volume, 0, 1);
	};   
    
	acts.SetPoster = function (poster)
	{
		this.elem.poster = poster;
	};      

	acts.SetLoop = function (is_enable)
	{
		this.elem.loop = (is_enable==1);
	};

	acts.SetMuted = function (is_enable)
	{
		this.elem.muted = (is_enable==1);
	};

	acts.SetAutoplay = function (is_enable)
	{
		this.elem.autoplay = (is_enable==1);
	};    
   
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.CurrentTime = function (ret)
	{
		ret.set_float(this.elem.currentTime);
	};
	
	exps.IsPaused = function (ret)
	{
		ret.set_int(this.elem.paused);
	};  
	
	exps.IsMuted = function (ret)
	{
		ret.set_int(this.elem.muted);
	};  
	
	exps.Volume = function (ret)
	{
		ret.set_float(this.elem.volume);
	};     
	
	exps.ReadyState = function (ret)
	{
		ret.set_int(this.elem.readyState);
	};       
}());