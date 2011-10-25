// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_TouchMouse = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_TouchMouse.prototype;
		
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
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		this.buttonMap = new Array(4);		// mouse down states
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;
		
		this.triggerButton = 0;
		this.triggerType = 0;
        
        // touch
		this.touches = [];        
        
        // control
        this.trigger_source = 1;  // 0=touch, 1=mouse
	};

	var instanceProto = pluginProto.Instance.prototype;

    // touch
    instanceProto.saveTouches = function (t)
	{
		this.touches.length = 0;
		var offset = jQuery(this.runtime.canvas).offset();
		
		var i, len, touch;
		for (i = 0, len = t.length; i < len; i++)
		{
			touch = t[i];
			this.touches.push({ x: touch.pageX - offset.left, y: touch.pageY - offset.top });
		}
	};
    
	instanceProto.onCreate = function()
	{
		// Bind mouse events via jQuery
		jQuery(document).mousemove(
			(function (self) {
				return function(info) {
					self.onMouseMove(info);
				};
			})(this)
		);
		
		jQuery(document).mousedown(
			(function (self) {
				return function(info) {
					self.onMouseDown(info);
				};
			})(this)
		);
		
		jQuery(document).mouseup(
			(function (self) {
				return function(info) {
					self.onMouseUp(info);
				};
			})(this)
		);
		
		jQuery(document).dblclick(
			(function (self) {
				return function(info) {
					self.onDoubleClick(info);
				};
			})(this)
		);
        
        // touch
		this.runtime.canvas.addEventListener("touchstart",
			(function (self) {
				return function(info) {
					self.onTouchStart(info);
				};
			})(this),
			true
		);
		
		this.runtime.canvas.addEventListener("touchmove",
			(function (self) {
				return function(info) {
					self.onTouchMove(info);
				};
			})(this),
			true
		);
		
		this.runtime.canvas.addEventListener("touchend",
			(function (self) {
				return function(info) {
					self.onTouchEnd(info);
				};
			})(this),
			true
		);        
	};

	instanceProto.onMouseMove = function(info)
	{
        this.trigger_source = 1;    
		var offset = jQuery(this.runtime.canvas).offset();
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;      
	};

	instanceProto.onMouseDown = function(info)
	{
        this.trigger_source = 1;
		// Update button state
		this.buttonMap[info.which] = true;
		
		// Trigger OnAnyClick
		this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnAnyClick, this);
		
		// Trigger OnClick & OnObjectClicked
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 0;					// single click
		this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnObjectClicked, this);
	};

	instanceProto.onMouseUp = function(info)
	{
        this.trigger_source = 1;
		// Update button state
		this.buttonMap[info.which] = false;
		
		// Trigger OnRelease
		this.triggerButton = info.which - 1;	// 1-based
		this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnRelease, this);
	};

	instanceProto.onDoubleClick = function(info)
	{
        this.trigger_source = 1;
		// Trigger OnClick & OnObjectClicked
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 1;					// double click
		this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnObjectClicked, this);
	};
    
    // touch
	instanceProto.onTouchMove = function (info)
	{
        this.trigger_source = 0;
		info.preventDefault();
		this.saveTouches(info.touches);
	};

	instanceProto.onTouchStart = function (info)
	{
        this.trigger_source = 0;
		info.preventDefault();
		this.saveTouches(info.touches);
		
		// Trigger OnTouchStart= OnAnyClick, OnClick
        this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnAnyClick, this);
        this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnClick, this);
		//this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
		
		// Trigger OnTouchObject=OnObjectClicked for each touch started event
		var offset = jQuery(this.runtime.canvas).offset();
		
		if (info.changedTouches)
		{
			var i, len;
			for (i = 0, len = info.changedTouches.length; i < len; i++)
			{
				var touch = info.changedTouches[i];
				
				this.curTouchX = touch.pageX - offset.left;
				this.curTouchY = touch.pageY - offset.top;
                this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnObjectClicked, this);
				//this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
			}
		}
	};

	instanceProto.onTouchEnd = function (info)
	{
        this.trigger_source = 0;
		info.preventDefault();
		
		// Trigger OnTouchEnd=OnRelease
        this.runtime.trigger(cr.plugins_.Rex_TouchMouse.prototype.cnds.OnRelease, this);
		//this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
        
		// Save touches after, so OnTouchEnd can access the x and y of the touch
		this.saveTouches(info.touches);        
	};  

    // export
	instanceProto.GetABSX = function ()
	{
        var ret_x;
        if (this.trigger_source == 1)  // mouse
        {
            ret_x = this.mouseXcanvas;
        }
        else    // touch
        {
		    if (this.touches.length)
                ret_x = this.touches[0].x;
		    else
                ret_x = 0;        
        }
        return ret_x;
	};  

	instanceProto.GetABSY = function ()
	{
        var ret_y;
        if (this.trigger_source == 1)  // mouse
        {
            ret_y = this.mouseYcanvas;
        }
        else    // touch
        {
		    if (this.touches.length)
                ret_y = this.touches[0].y;
		    else
                ret_x = 0;        
        }
        return ret_y;
	};      

	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.OnClick = function (button, type)
	{
		return (this.trigger_source == 1)?
               (button === this.triggerButton && type === this.triggerType):  // mouse
               true;  //touch
	};
	
	cnds.OnAnyClick = function ()
	{
		return true;
	};
	
	cnds.IsButtonDown = function (button)
	{
		return (this.trigger_source==1)?
               (this.buttonMap[button + 1]):   // mouse:jQuery uses 1-based buttons for some reason
               (this.touches.length);    // touch
	};
	
	cnds.OnRelease = function (button)
	{
		return (this.trigger_source == 1)?
               (button === this.triggerButton):  // mouse
               true;  //touch
	};
	
	cnds.IsOverObject = function (obj)
	{
        if (this.trigger_source == 1)  // mouse
        {    
		    // We need to handle invert manually.  If inverted, turn invert off on the condition,
		    // and instead pass it to testAndSelectCanvasPointOverlap() which does SOL picking
		    // based on the invert status.
		    var cnd = this.runtime.getCurrentCondition();
		
		    // Not run yet
		    if (typeof (cnd.extra.mouseOverInverted) === "undefined")
		    {
			    // turn off invert as far as the event engine is concerned, and pass it
			    // below instead
			    cnd.extra.mouseOverInverted = cnd.inverted;
			    cnd.inverted = false;
		    }
		
		    var mx = this.mouseXcanvas;
		    var my = this.mouseYcanvas;
		
		    return this.runtime.testAndSelectCanvasPointOverlap(obj, mx, my, cnd.extra.mouseOverInverted);
        }
        else    // touch
        {
		    if (!obj)
			    return false;
			
		    var sol = obj.getCurrentSol();
		    var instances = sol.getObjects();
		    var px, py;
		
		    var touching = [];
			
		    // Check all touches for overlap with any instance
		    var i, leni, j, lenj;
		    for (i = 0, leni = instances.length; i < leni; i++)
		    {
			    var inst = instances[i];
			    inst.update_bbox();
			
			    for (j = 0, lenj = this.touches.length; j < lenj; j++)
			    {
				    var touch = this.touches[j];
				
				    px = inst.layer.canvasToLayerX(touch.x);
				    py = inst.layer.canvasToLayerY(touch.y);
				
				    if (inst.bquad.contains_pt(px, py))
				    {
					    touching.push(inst);
					    break;
				    }
			    }
		    }
		
		    if (touching.length)
		    {
			    sol.select_all = false;
			    sol.instances = touching;
			    return true;
		    }
		    else
			    return false;        
        }        
	};
	
	cnds.OnObjectClicked = function (button, type, obj)
	{
        if (this.trigger_source == 1)  // mouse
        {
		    if (button !== this.triggerButton || type !== this.triggerType)
			    return false;	// wrong click type
		
    		var mx = this.mouseXcanvas;
	    	var my = this.mouseYcanvas;
		
		    // Can't be inverted
		    return this.runtime.testAndSelectCanvasPointOverlap(obj, mx, my, false);
        }
        else    // touch
        {
		    if (!obj)
			    return false;
			
		    var sol = obj.getCurrentSol();
		    var instances = sol.getObjects();
		    var px, py;
		
		    var touching = [];
		
		    // Check curTouchX/Y overlaps any instance
		    var i, len;
		    for (i = 0, len = instances.length; i < len; i++)
		    {
			    var inst = instances[i];
			    inst.update_bbox();
			
			    px = inst.layer.canvasToLayerX(this.curTouchX);
			    py = inst.layer.canvasToLayerY(this.curTouchY);
			
			    if (inst.bquad.contains_pt(px, py))
				    touching.push(inst);
		    }
		
		    if (touching.length)
		    {
			    sol.select_all = false;
			    sol.instances = touching;
			    return true;
		    }
		    else
			    return false;        
        }        
	};

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	exps.X = function (ret, layerparam)
	{
        var layer, oldScale;
		
		if (typeof layerparam === "undefined")
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			layer.scale = 1.0;
			ret.set_float(layer.canvasToLayerX(this.GetABSX()));
			layer.scale = oldScale;
        }
		else
		{
			// use given layer param
			if (typeof layerparam === "number")
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (!layer)
				ret.set_float(0);
				
			ret.set_float(layer.canvasToLayerX(this.GetABSX()));
		}
	};
	
	exps.Y = function (ret, layerparam)
	{
        var layer, oldScale;
		
		if (typeof layerparam === "undefined")
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			layer.scale = 1.0;
			ret.set_float(layer.canvasToLayerY(this.GetABSY()));
			layer.scale = oldScale;
        }
		else
		{
			// use given layer param
			if (typeof layerparam === "number")
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (!layer)
				ret.set_float(0);
				
			ret.set_float(layer.canvasToLayerY(this.GetABSY()));
		}      
	};
	
	exps.AbsoluteX = function (ret)
	{
        ret.set_float(this.GetABSX());
	};
	
	exps.AbsoluteY = function (ret)
	{
        ret.set_float(this.GetABSY());
	};
	
}());
