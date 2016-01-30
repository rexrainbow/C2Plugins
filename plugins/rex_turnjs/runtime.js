// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_turnjs = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	var pluginProto = cr.plugins_.Rex_turnjs.prototype;
		
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
	    jsfile_load("turn.js");
	};
	
	var jsfile_load = function(file_name)
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
	    	newScriptTag.setAttribute("type","text/javascript");
	    	newScriptTag.setAttribute("src", file_name);
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
	

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// Not supported in DC
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Rex_turnjs plugin not supported on this platform - the object will not be created");
			return;
		}
		
		this.elem = document.createElement("div");
        //this.elem.setAttribute("id", "flipbook");
        this.elem.innerHTML = "<div>Page 1</div><div>Page 2</div><div>Page 3</div><div>Page 4</div>";
		jQuery(this.elem)["turn"]();
        //jQuery(this.elem)["turn"]("disable", true);
        
		jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");

		this.element_hidden = false;
		
		this.lastLeft = 0;
		this.lastTop = 0;
		this.lastRight = 0;
		this.lastBottom = 0;
		this.lastWinWidth = 0;
		this.lastWinHeight = 0;

		this.updatePosition(true);
		
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
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= rightEdge)
			right = rightEdge - 1;
		if (bottom >= bottomEdge)
			bottom = bottomEdge - 1;
		
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
		var w=Math.round(right - left), h=Math.round(bottom - top); 
		jQuery(this.elem).width(w);
		jQuery(this.elem).height(h);	
		
		// flipbook
		//jQuery(this.elem)["turn"]({"width": w,
		//                           "height": h,
		//                          });
	};
	
	// only called if a layout object
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Flip book",
			"properties": [
				{"name": "Total pages", "value": jQuery(this.elem)["turn"]("pages")},
                //{"name": "Current page", "value": jQuery(this.elem)["turn"]("page")},
			]
		});
	};
	/**END-PREVIEWONLY**/
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.AddDIVHTML = function (content)
	{
        if (!jQuery(this.elem)["turn"]("pages"))
            jQuery(this.elem)["turn"]("disable", false);
        
        var elem = document.createElement("div");
        elem.innerHTML = content;
	    jQuery(this.elem)["turn"]("addPage", elem);
	};
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());