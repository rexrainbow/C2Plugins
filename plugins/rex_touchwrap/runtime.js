// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.rex_TouchWrap = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.rex_TouchWrap.prototype;
		
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
		this.touches = [];
		this.mouseDown = false;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	var dummyoffset = {left: 0, top: 0};

	instanceProto.saveTouches = function (t)
	{
		if (!t)
			return;
		
        // work around for mouse inpit
        if (this.useMouseInput && (t.length==0))
		{
            return;
        }        
        
        
		this.touches.length = 0;
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		
		var i, len, touch;
		for (i = 0, len = t.length; i < len; i++)
		{
			touch = t[i];
			this.touches.push({ x: touch.pageX - offset.left, y: touch.pageY - offset.top });
		}
	};
	
	var appmobi_accx = 0;
	var appmobi_accy = 0;
	var appmobi_accz = 0;
	
	function AppMobiGetAcceleration(evt)
	{
		appmobi_accx = evt.x;
		appmobi_accy = evt.y;
		appmobi_accz = evt.z;
	};
	
	var pg_accx = 0;
	var pg_accy = 0;
	var pg_accz = 0;
	
	function PhoneGapGetAcceleration(evt)
	{
		pg_accx = evt.x;
		pg_accy = evt.y;
		pg_accz = evt.z;
	};

	instanceProto.onCreate = function()
	{
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		
		this.curTouchX = 0;
		this.curTouchY = 0;
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;        
		
		this.useMouseInput = (this.properties[0] !== 0);
		
		// Use document touch input for PhoneGap or fullscreen mode
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		
		if (this.runtime.isDirectCanvas)
			elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem = window;
	
		elem.addEventListener("touchstart",
			(function (self) {
				return function(info) {
					self.onTouchStart(info);
				};
			})(this),
			false
		);
		
		elem.addEventListener("touchmove",
			(function (self) {
				return function(info) {
					self.onTouchMove(info);
				};
			})(this),
			false
		);
		
		elem.addEventListener("touchend",
			(function (self) {
				return function(info) {
					self.onTouchEnd(info);
				};
			})(this),
			false
		);
		
		if (this.runtime.overlay_canvas && !this.runtime.isPhoneGap)
		{
			this.runtime.overlay_canvas.addEventListener("touchstart",
				(function (self) {
					return function(info) {
						self.onTouchStart(info);
					};
				})(this),
				false
			);
			
			this.runtime.overlay_canvas.addEventListener("touchmove",
				(function (self) {
					return function(info) {
						self.onTouchMove(info);
					};
				})(this),
				false
			);
			
			this.runtime.overlay_canvas.addEventListener("touchend",
				(function (self) {
					return function(info) {
						self.onTouchEnd(info);
					};
				})(this),
				false
			);
		}
		
		window.addEventListener("deviceorientation", (function (self) { return function (eventData) {
		
			self.orient_alpha = eventData["alpha"] || 0;
			self.orient_beta = eventData["beta"] || 0;
			self.orient_gamma = eventData["gamma"] || 0;
		
		}; })(this), false);
		
		window.addEventListener("devicemotion", (function (self) { return function (eventData) {
		
			if (eventData["accelerationIncludingGravity"])
			{
				self.acc_g_x = eventData["accelerationIncludingGravity"]["x"];
				self.acc_g_y = eventData["accelerationIncludingGravity"]["y"];
				self.acc_g_z = eventData["accelerationIncludingGravity"]["z"];
			}
			
			if (eventData["acceleration"])
			{
				self.acc_x = eventData["acceleration"]["x"];
				self.acc_y = eventData["acceleration"]["y"];
				self.acc_z = eventData["acceleration"]["z"];
			}
			
		}; })(this), false);
		
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
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
		}
		
		// Use AppMobi in case browser does not support accelerometer but device does
		if (this.runtime.isAppMobi && !this.runtime.isDirectCanvas)
		{
			AppMobi["accelerometer"]["watchAcceleration"](AppMobiGetAcceleration, { "frequency": 40, "adjustForRotation": true });
		}
		
		// Use PhoneGap in case browser does not support accelerometer but device does
		if (this.runtime.isPhoneGap)
		{
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
		}
        
            
        this.check_name = "TOUCHWRAP";
		this._is_touch_mode = (!this.useMouseInput);
        this._plugins_hook = [];
	};

	instanceProto.onTouchMove = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
			
		this.saveTouches(info.touches);
	};

	instanceProto.onTouchStart = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
			
		this.saveTouches(info.touches);
		
		// Trigger OnTouchStart
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchStart, this);  
		this._is_touch_mode = true;
        var i, cnt=this._plugins_hook.length;        
        for (i=0;i<cnt;i++)
            this._plugins_hook[i].OnTouchStart();
		
		// Trigger OnTouchObject for each touch started event
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		
		if (info.changedTouches)
		{
			var i, len;
			for (i = 0, len = info.changedTouches.length; i < len; i++)
			{
				var touch = info.changedTouches[i];
				
				this.curTouchX = touch.pageX - offset.left;
				this.curTouchY = touch.pageY - offset.top;
				this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchObject, this);
			}
		}
	};

	instanceProto.onTouchEnd = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		
		// Trigger OnTouchEnd
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchEnd, this);
        var i, cnt=this._plugins_hook.length;        
        for (i=0;i<cnt;i++)
            this._plugins_hook[i].OnTouchEnd();
		
		// Save touches after, so OnTouchEnd can access the x and y of the touch
		this.saveTouches(info.touches);
	};
	
	var noop_func = function(){};

	instanceProto.onMouseDown = function(info)
	{
		if (info.preventDefault)
			info.preventDefault();
		
		// Send a fake touch start event
		var t = { pageX: info.pageX, pageY: info.pageY };
		var fakeinfo = { touches: [t], changedTouches: [t], preventDefault: noop_func };
		this.onTouchStart(fakeinfo);
		this.mouseDown = true;
	};
	
	instanceProto.onMouseMove = function(info)
	{
		if (info.preventDefault)
			info.preventDefault();
		
		//if (!this.mouseDown)
		//	return;
			
		// Send a fake touch move event
		var t = { pageX: info.pageX, pageY: info.pageY };
		var fakeinfo = { touches: [t], preventDefault: noop_func };
		this.onTouchMove(fakeinfo);
	};

	instanceProto.onMouseUp = function(info)
	{
		if (info.preventDefault)
			info.preventDefault();
		
		// Send a fake touch end event
		var fakeinfo = { touches: [], preventDefault: noop_func };
		this.onTouchEnd(fakeinfo);
		this.mouseDown = false;
	};
    
    
    // wrapper --------
    instanceProto.HookMe = function (obj)
    {
        this._plugins_hook.push(obj);
    };
    
    instanceProto.UseMouseInput = function()
    {
        return this.useMouseInput;
    }

	instanceProto.IsInTouch = function ()
	{
		return (this._is_touch_mode)?  this.touches.length:this.mouseDown;
	};    
    
	instanceProto.OnTouchObject = function (type)
	{
		if (!type)
			return false;
            
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};  

	instanceProto.IsTouchingObject = function (type)
	{
		if (!type)
			return false;
			
		var sol = type.getCurrentSol();
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
				
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				
				if (inst.contains_pt(px, py))
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
	};  
	
	instanceProto.OrientationSupported = function ()
	{
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	
	instanceProto.MotionSupported = function ()
	{
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};    

	instanceProto.GetX = function (layerparam)
	{
        var ret;
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		
			if (cr.is_undefined(layerparam))
			{
				// calculate X position on bottom layer as if its scale were 1.0
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxX = layer.parallaxX;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxX = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret = layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true);
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxX = oldParallaxX;
				layer.angle = oldAngle;
			}
			else
			{
				// use given layer param
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else if (cr.is_string(layerparam))
					layer = this.runtime.getLayerByName(layerparam);
                else 
					layer = layerparam;
                    
				if (layer)
					ret = layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true);
				else
					ret = 0;
			}
		}
		else
			ret = 0;
        
        return ret;
	};    

	instanceProto.GetY = function (layerparam)
	{
        var ret;
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		
			if (cr.is_undefined(layerparam))
			{
				// calculate X position on bottom layer as if its scale were 1.0
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxY = layer.parallaxY;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxY = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret = layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false);
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxY = oldParallaxY;
				layer.angle = oldAngle;
			}
			else
			{
				// use given layer param
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else if (cr.is_string(layerparam))
					layer = this.runtime.getLayerByName(layerparam);
                else 
					layer = layerparam;
                    
				if (layer)
					ret = layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false);
				else
					ret = 0;
			}
		}
		else
		    ret = 0;
        
        return ret;
	}; 

    instanceProto.GetAbsoluteX = function ()
	{
        var ret;
		if (this.touches.length)
			ret = this.touches[0].x;
		else
			ret = 0;
        
        return ret;
	};
	
	instanceProto.GetAbsoluteY = function ()
	{
        var ret;    
		if (this.touches.length)
			ret = this.touches[0].y;
		else
			ret = 0;
            
        return ret;
	};
    
	instanceProto.GetAlpha = function ()
	{
        var ret;
		if (this.runtime.isAppMobi && this.orient_alpha === 0 && appmobi_accz !== 0)
			ret = appmobi_accz * 90;
		else if (this.runtime.isPhoneGap  && this.orient_alpha === 0 && pg_accz !== 0)
			ret = pg_accz * 90;
		else
			ret = this.orient_alpha;
            
        return ret;
	};
	
	instanceProto.GetBeta = function ()
	{
        var ret;
		if (this.runtime.isAppMobi && this.orient_beta === 0 && appmobi_accy !== 0)
			ret = appmobi_accy * -90;
		else if (this.runtime.isPhoneGap  && this.orient_beta === 0 && pg_accy !== 0)
			ret = pg_accy * -90;
		else
			ret = this.orient_beta;
            
        return ret;
	};
	
	instanceProto.GetGamma = function ()
	{
        var ret;
		if (this.runtime.isAppMobi && this.orient_gamma === 0 && appmobi_accx !== 0)
			ret = appmobi_accx * 90;
		else if (this.runtime.isPhoneGap  && this.orient_gamma === 0 && pg_accx !== 0)
			ret = pg_accx * 90;
		else
			ret = this.orient_gamma;
            
        return ret;
	};

	instanceProto.GetAccelerationXWithG = function ()
	{
		return this.acc_g_x;
	};
	
	instanceProto.GetAccelerationYWithG = function ()
	{
		return  this.acc_g_y;
	};
	
	instanceProto.GetAccelerationZWithG = function ()
	{
		return  this.acc_g_z;
	};
	
	instanceProto.GetAccelerationX = function ()
	{
		return  this.acc_x;
	};
	
	instanceProto.GetAccelerationY = function ()
	{
		return  this.acc_y;
	};
	
	instanceProto.AccelerationZ = function ()
	{
		return  this.acc_z;
	};    
    // wrapper --------    
    
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.OnTouchStart = function ()
	{
		return true;
	};
	
	cnds.OnTouchEnd = function ()
	{
		return true;
	};
	
	cnds.IsInTouch = function ()
	{
		return this.IsInTouch();
	};
	
	cnds.OnTouchObject = function (type)
	{
		return this.OnTouchObject(type);
	};
	
	cnds.IsTouchingObject = function (type)
	{
		return this.IsTouchingObject(type);
	};
	
	cnds.OrientationSupported = function ()
	{
		return this.OrientationSupported();
	};
	
	cnds.MotionSupported = function ()
	{
		return this.MotionSupported();
	};

	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;

	// TODO: multitouch support
	exps.X = function (ret, layerparam)
	{
		ret.set_float(this.GetX(layerparam));
	};
	
	exps.Y = function (ret, layerparam)
	{
		ret.set_float(this.GetY(layerparam));
	};
	
	exps.AbsoluteX = function (ret)
	{
		ret.set_float(this.GetAbsoluteX());
	};
	
	exps.AbsoluteY = function (ret)
	{
        ret.set_float(this.GetAbsoluteY());
	};
	
	exps.Alpha = function (ret)
	{
		ret.set_float(this.GetAlpha());
	};
	
	exps.Beta = function (ret)
	{
		ret.set_float(this.GetBeta());
	};
	
	exps.Gamma = function (ret)
	{
		ret.set_float(this.GetGamma());
	};
	
	exps.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.acc_g_x);
	};
	
	exps.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.GetAccelerationYWithG());
	};
	
	exps.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.GetAccelerationZWithG());
	};
	
	exps.AccelerationX = function (ret)
	{
		ret.set_float(this.GetAccelerationX());
	};
	
	exps.AccelerationY = function (ret)
	{
		ret.set_float(this.GetAccelerationY());
	};
	
	exps.AccelerationZ = function (ret)
	{
		ret.set_float(this.GetAccelerationZ());
	};
	
}());