// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_fabric = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_fabric.prototype;
		
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
		if (this.is_family)
			return;
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
        this.isInteractiion = (this.properties[0] === 1);
        
		this.elem = document.createElement("canvas");
		this.elem.id = "fabricCanvas-" + this.uid;
        
        // canvas setting
        this.canvas = this.elem;
		this.canvas["width"] = this.width;
		this.canvas["height"] = this.height;
        
        if (this.isInteractiion)
        {
		    jQuery(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");        
		    this.element_hidden = false;
      
		    if (this.properties[1] === 0)
		    {
		    	jQuery(this.elem).hide();
		    	this.visible = false;
		    	this.element_hidden = true;
		    }
            else
                this.visible = true;  
        }        
        else
        {
		    this.ctx = this.canvas["getContext"]('2d');
            
            this.update_tex = true;
		    this.rcTex = new cr.rect(0, 0, 0, 0);
		    //if (this.runtime.gl && !this.type.webGL_texture)
		    //	this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, true, this.runtime.linearSampling);
        }

        // fabric canvas
        var canvasType = (this.isInteractiion)? "Canvas" : "StaticCanvas";
        this.fabricCanvas = new window["fabric"][canvasType](this.canvas);           
        
        this.callbackTag = "";   
        this.params = [];
        var self=this;        
        this.getCallback = function(callbackTag)
        {
            if (callbackTag == null)
                return null;
        
            var cb = function ()
            {
                self.callbackTag = callbackTag;
                cr.shallowAssignArray(self.params, arguments);
                self.runtime.trigger(cr.plugins_.Rex_fabric.prototype.cnds.OnCallback, self); 
            }
            return cb;
        };   
        
        this.fabricObjects = {};
        this.fabricObjects["Canvas"] = this.fabricCanvas;

        if (this.isInteractiion)
        {        
		    this.lastLeft = null;
		    this.lastTop = null;
		    this.lastRight = null;
		    this.lastBottom = null;
		    this.lastWinWidth = null;
		    this.lastWinHeight = null;
            
		    this.updatePosition(true);  // init position and size
		    this.runtime.tickMe(this); 
        }        
	};
    
    // called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
        this.fabricCanvas["dispose"]();
        
        if (this.isInteractiion)
        {
		    jQuery(this.elem).remove();
		    this.elem = null;        
        }
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
                               
        setPositionSize(this.elem, offx, offy, right, left, top, bottom);
        setPositionSize(this.fabricCanvas["upperCanvasEl"], offx, offy, right, left, top, bottom);
	};    
    
    var setPositionSize = function(elem, offx, offy, right, left, top, bottom)
    {
		jQuery(elem).css("position", "absolute");
		jQuery(elem).offset({left: offx, top: offy});
		jQuery(elem).width(Math.round(right - left));
		jQuery(elem).height(Math.round(bottom - top));  
    }
    
	instanceProto.draw = function(ctx)
	{	
        if (this.isInteractiion)    
            return;
        
		ctx["save"]();
		
		ctx["globalAlpha"] = this.opacity;
        
		var myx = this.x;
		var myy = this.y;
		
		if (this.runtime.pixel_rounding)
		{
			myx = Math.round(myx);
			myy = Math.round(myy);
		}
		
        if ((myx !== 0) || (myy !== 0))
		    ctx["translate"](myx, myy);
        
        if (this.angle !== 0)
		    ctx["rotate"](this.angle);
				
		ctx["drawImage"](this.canvas,
						  0 - (this.hotspotX * this.width),
						  0 - (this.hotspotY * this.height),
						  this.width,
						  this.height);
		
		ctx["restore"]();
	};

	instanceProto.drawGL = function(glw)
	{
        if (this.isInteractiion)    
            return;
        
        if (this.update_tex)
        {
            if (this.tex)
                glw.deleteTexture(this.tex);
            this.tex=glw.loadTexture(this.canvas, false, this.runtime.linearSampling);
            this.update_tex = false;
        }
		glw.setTexture(this.tex);
		glw.setOpacity(this.opacity);

		var q = this.bquad;
		
		if (this.runtime.pixel_rounding)
		{
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			
			glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
			glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
	};
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }    

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
    
	Cnds.prototype.OnCallback = function (tag)
	{
		return cr.equals_nocase(tag, this.callbackTag);
	};
        
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
	Acts.prototype.CreateObject = function (varName, type, param, isAddToCanvas)
	{
        var fabricObject;
        if (type === "Canvas")
        {
            fabricObject = this.fabricCanvas;
            this.fabricObjects[varName] = fabricObject;            
        }
        else
        {
            param = (param === "")? null : JSON.parse(param);                
            fabricObject = new window["fabric"][type](param);
            this.fabricObjects[varName] = fabricObject;
            if (isAddToCanvas === 1)
            {
                this.fabricCanvas["add"]( fabricObject );
            }
        }        
	};  
    
	Acts.prototype.AddToCanvas = function (varName)
	{
        this.fabricCanvas.add( this.fabricObjects[varName] );
	}; 
    
	Acts.prototype.RenderAll = function ()
	{
        this.fabricCanvas.renderAll();
        
        if (!this.isInteractiion)
        {		
		    this.runtime.redraw = true;
            this.update_tex = true;  
        }
	};     
    
	Acts.prototype.RemoveFromCanvas = function (varName)
	{
        this.fabricCanvas.remove( this.fabricObjects[varName] );
	}; 
    
	Acts.prototype.SetValue = function (varName, key, value)
	{       
        var fabricObject = this.fabricObjects[varName];
        assert2(fabricObject, "Fabric: missing object '"+ varName + "'");    

        if (fabricObject.hasOwnProperty("set"))
            fabricObject["set"](key, value);
        else
            fabricObject["set"+capitalizeFirstLetter(key)](value);  
	};
     
	Acts.prototype.SetJSON = function (varName, key, value)
	{
        value = JSON.parse(value);
        Acts.prototype.SetValue.call(this, varName, key, value);
	};    
     
	Acts.prototype.SetBoolean = function (varName, key, value)
	{
        value = (value === 1);
        Acts.prototype.SetValue.call(this, varName, key, value);
	};     
     
	Acts.prototype.AddEventListener = function (varName, eventName, callbackTag)
	{
        var fabricObject = this.fabricObjects[varName];
        assert2(fabricObject, "Fabric: missing object '"+ varName + "'");   
        
        fabricObject["on"](eventName, this.getCallback(callbackTag));
	};        
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.Param = function (ret, index, keys)
	{             
        var val = this.params[index];        
		ret.set_any( getItemValue(val, keys) );
	}; 

	Exps.prototype.ParamCount = function (ret)
	{
		ret.set_int( this.params.length );
	}; 
           
	Exps.prototype.Property = function (ret, varName, key)
	{
        var fabricObject = this.fabricObjects[varName];
        assert2(fabricObject, "Fabric: missing object '"+ varName + "'");  
        
        var val = fabricObject["get"](key);
		ret.set_any( getItemValue(val) );
	}; 

        
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------    
    // ------------------------------------------------------------------------    
 	var getItemValue = function (item, k, default_value)
	{
        var v;
	    if (item == null)
            v = null;
        else if ( (k == null) || (k === "") )
            v = item;
        else if ((typeof(k) === "number") || (k.indexOf(".") == -1))
            v = item[k];
        else
        {
            var kList = k.split(".");
            v = item;
            var i,cnt=kList.length;
            for(i=0; i<cnt; i++)
            {
                if (typeof(v) !== "object")
                {
                    v = null;
                    break;
                }
                    
                v = v[kList[i]];
            }
        }

        return din(v, default_value);
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
}());