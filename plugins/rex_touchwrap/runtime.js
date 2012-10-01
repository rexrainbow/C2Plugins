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
		this.touchDown = false;
        this.check_name = "TOUCHWRAP";
		this._is_mouse_mode = false;
        this._plugins_hook = [];
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	var dummyoffset = {left: 0, top: 0};

	instanceProto.findTouch = function (id)
	{
		var i, len;
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			if (this.touches[i]["id"] === id)
				return i;
		}
		
		return -1;
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
	
	var theInstance = null;
	
	window["C2_Motion_DCSide"] = function (a, b, g, gx, gy, gz, x, y, z)
	{
		if (!theInstance)
			return;
			
		theInstance.orient_alpha = a;
		theInstance.orient_beta = b;
		theInstance.orient_gamma = g;
		theInstance.acc_g_x = gx;
		theInstance.acc_g_y = gy;
		theInstance.acc_g_z = gz;
		theInstance.acc_x = x;
		theInstance.acc_y = y;
		theInstance.acc_z = z;
	};

	instanceProto.onCreate = function()
	{
		theInstance = this;
		
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
        this.trigger_index = 0;
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;        
		
		this.useMouseInput = (this.properties[0] !== 0);
		
		// Use document touch input for PhoneGap or fullscreen mode
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		
		if (this.runtime.isDirectCanvas)
			elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem = window;
			
		var self = this;
	
		elem.addEventListener("touchstart",
			function(info) {
				self.onTouchStart(info);
			},
			false
		);
		
		elem.addEventListener("touchmove",
			function(info) {
				self.onTouchMove(info);
			},
			false
		);
		
		elem.addEventListener("touchend",
			function(info) {
				self.onTouchEnd(info);
			},
			false
		);
		
		// Treat touch cancellation the same as a touch end
		elem.addEventListener("touchcancel",
			function(info) {
				self.onTouchEnd(info);
			},
			false
		);
		
		if (window.navigator["msPointerEnabled"])
		{
			elem.addEventListener("MSPointerDown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			
			elem.addEventListener("MSPointerMove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			
			elem.addEventListener("MSPointerUp",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			
			// Treat pointer cancellation the same as a touch end
			elem.addEventListener("MSPointerCancel",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			
			if (this.runtime.canvas)
			{
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		
		window.addEventListener("deviceorientation", function (eventData) {
		
			self.orient_alpha = eventData["alpha"] || 0;
			self.orient_beta = eventData["beta"] || 0;
			self.orient_gamma = eventData["gamma"] || 0;
		
		}, false);
		
		window.addEventListener("devicemotion", function (eventData) {
		
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
			
		}, false);
		
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
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
		
		this.runtime.tick2Me(this);
	};
	
	instanceProto.onPointerMove = function (info)
	{
		// Ignore mouse events
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		
		if (info.preventDefault)
			info.preventDefault();
		
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		
		if (i >= 0)
		{
			var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
			var t = this.touches[i];
			
			// Ignore events <2ms after the last event - seems events sometimes double-fire
			// very close which throws off speed measurements
			if (nowtime - t.time < 2)
				return;
			
			t.lasttime = t.time;
			t.lastx = t.x;
			t.lasty = t.y;
			t.time = nowtime;
			t.x = info.pageX - offset.left;
			t.y = info.pageY - offset.top;
		}
	};

	instanceProto.onPointerStart = function (info)
	{
		// Ignore mouse events
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
			
		if (info.preventDefault)
			info.preventDefault();
		
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		
		this.trigger_index = this.touches.length;
		
		this.touches.push({ time: nowtime,
							x: touchx,
							y: touchy,
							lasttime: nowtime,
							lastx: touchx,
							lasty: touchy,
							"id": info["pointerId"],
							startindex: this.trigger_index
						});
		
		// Trigger OnNthTouchStart then OnTouchStart
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchStart, this);
		
		// Trigger OnTouchObject for each touch started event		
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchObject, this);
	};

	instanceProto.onPointerEnd = function (info)
	{
		// Ignore mouse events
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
			
		if (info.preventDefault)
			info.preventDefault();
			
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		
		// Trigger OnNthTouchEnd & OnTouchEnd
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchEnd, this);
		
		// Remove touch
		if (i >= 0)
		{
			this.touches.splice(i, 1);
		}
	};

	instanceProto.onTouchMove = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		
		var nowtime = cr.performance_now();
		
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var j = this.findTouch(t["identifier"]);
			
			if (j >= 0)
			{
				var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
				u = this.touches[j];
				
				// Ignore events <2ms after the last event - seems events sometimes double-fire
				// very close which throws off speed measurements
				if (nowtime - u.time < 2)
					continue;
				
				u.lasttime = u.time;
				u.lastx = u.x;
				u.lasty = u.y;
				u.time = nowtime;
				u.x = t.pageX - offset.left;
				u.y = t.pageY - offset.top;
			}
		}
	};

	instanceProto.onTouchStart = function (info)
	{
	    this.touchDown = true;
		if (info.preventDefault)
			info.preventDefault();
			
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		
		var i, len, t;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			
			this.trigger_index = this.touches.length;
			
			this.touches.push({ time: nowtime,
								x: touchx,
								y: touchy,
								lasttime: nowtime,
								lastx: touchx,
								lasty: touchy,
								"id": t["identifier"],
								startindex: this.trigger_index
							});
			
			// Trigger OnNthTouchStart then OnTouchStart
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchStart, this);
			
			// Trigger OnTouchObject for each touch started event		
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchObject, this);
		}
	};

	instanceProto.onTouchEnd = function (info)
	{
	    this.touchDown = false;
		if (info.preventDefault)
			info.preventDefault();
		
		var i, len, t;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var j = this.findTouch(t["identifier"]);
			this.trigger_index = (j >= 0 ? this.touches[j].startindex : -1);
			
			// Trigger OnNthTouchEnd & OnTouchEnd
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchEnd, this);
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchEnd, this);
			
			// Remove touch
			if (j >= 0)
			{
				this.touches.splice(j, 1);
			}
		}
	};
	
	instanceProto.getAlpha = function ()
	{
		if (this.runtime.isAppMobi && this.orient_alpha === 0 && appmobi_accz !== 0)
			return appmobi_accz * 90;
		else if (this.runtime.isPhoneGap  && this.orient_alpha === 0 && pg_accz !== 0)
			return pg_accz * 90;
		else
			return this.orient_alpha;
	};
	
	instanceProto.getBeta = function ()
	{
		if (this.runtime.isAppMobi && this.orient_beta === 0 && appmobi_accy !== 0)
			return appmobi_accy * -90;
		else if (this.runtime.isPhoneGap  && this.orient_beta === 0 && pg_accy !== 0)
			return pg_accy * -90;
		else
			return this.orient_beta;
	};
	
	instanceProto.getGamma = function ()
	{
		if (this.runtime.isAppMobi && this.orient_gamma === 0 && appmobi_accx !== 0)
			return appmobi_accx * 90;
		else if (this.runtime.isPhoneGap  && this.orient_gamma === 0 && pg_accx !== 0)
			return pg_accx * 90;
		else
			return this.orient_gamma;
	};
	
	var noop_func = function(){};

	instanceProto.onMouseDown = function(info)
	{
	    this._is_mouse_mode = true;
		this.mouseDown = true;
		if (info.preventDefault)
			info.preventDefault();
		
		// Send a fake touch start event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": -1 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchStart(fakeinfo);
	};
	
	instanceProto.onMouseMove = function(info)
	{
		if (info.preventDefault)
			info.preventDefault();
		
		if (!this.mouseDown)
			return;
			
		// Send a fake touch move event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": -1 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchMove(fakeinfo);
	};

	instanceProto.onMouseUp = function(info)
	{
		this.mouseDown = false;
		if (info.preventDefault)
			info.preventDefault();
		
		// Send a fake touch end event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": -1 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchEnd(fakeinfo);
	};
	
	instanceProto.tick2 = function()
	{
		var i, len, t;
		var nowtime = cr.performance_now();
		
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			// Update speed for touches which haven't moved for 50ms
			t = this.touches[i];
			
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
		}
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
		return this.touchDown;
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
    
	instanceProto.CompareTouchSpeed = function (index, cmp, s)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return false;
		
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		var speed = 0;
		
		if (timediff > 0)
			speed = dist / timediff;
			
		return cr.do_cmp(speed, cmp, s);
	};

	instanceProto.OrientationSupported = function ()
	{
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	
	instanceProto.MotionSupported = function ()
	{
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};    
	
	instanceProto.CompareOrientation = function (orientation_, cmp_, angle_)
	{
		var v = 0;
		
		if (orientation_ === 0)
			v = this.getAlpha();
		else if (orientation_ === 1)
			v = this.getBeta();
		else
			v = this.getGamma();
			
		return cr.do_cmp(v, cmp_, angle_);
	};
	
	instanceProto.CompareAcceleration = function (acceleration_, cmp_, angle_)
	{
		var v = 0;
		
		if (acceleration_ === 0)
			v = this.acc_g_x;
		else if (acceleration_ === 1)
			v = this.acc_g_y;
		else if (acceleration_ === 2)
			v = this.acc_g_z;
		else if (acceleration_ === 3)
			v = this.acc_x;
		else if (acceleration_ === 4)
			v = this.acc_y;
		else if (acceleration_ === 5)
			v = this.acc_z;
		
		return cr.do_cmp(v, cmp_, angle_);
	};
	
	instanceProto.OnNthTouchStart = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	
	instanceProto.OnNthTouchEnd = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	
	instanceProto.HasNthTouch = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1;
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
				else
					layer = this.runtime.getLayerByName(layerparam);
					
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
	
	instanceProto.GetXAt = function (index, layerparam)
	{
	    var ret;
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return 0;
		
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
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
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
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (layer)
				ret = layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true);
			else
				ret = 0;
		}
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
				else
					layer = this.runtime.getLayerByName(layerparam);
					
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
	
	instanceProto.GetYAt = function (index, layerparam)
	{
	    var ret;
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return 0;
		
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
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
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
			else
				layer = this.runtime.getLayerByName(layerparam);
				
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
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
	
	instanceProto.GetAbsoluteXAt = function (index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return 0;

		return this.touches[index].x;
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
	
	instanceProto.GetAbsoluteYAt = function (index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return 0;

		return this.touches[index].y;
	};
	
	instanceProto.GetSpeedAt = function (index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return 0;

		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;

        var ret = (timediff === 0)? 0: (dist / timediff);
		return ret;
	};
	
	instanceProto.GetAngleAt = function (index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
			return 0;
		
		var t = this.touches[index];
		var ret = cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y));
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
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnTouchStart = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnTouchEnd = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsInTouch = function ()
	{
		return this.IsInTouch();
	};
	
	Cnds.prototype.OnTouchObject = function (type)
	{
		return this.OnTouchObject(type);
	};
	
	Cnds.prototype.IsTouchingObject = function (type)
	{
		return this.IsTouchingObject(type);
	};
	
	Cnds.prototype.CompareTouchSpeed = function (index, cmp, s)
	{
		return this.CompareTouchSpeed(index, cmp, s);
	};
	
	Cnds.prototype.OrientationSupported = function ()
	{
		return this.OrientationSupported();
	};
	
	Cnds.prototype.MotionSupported = function ()
	{
		return this.MotionSupported();
	};
	
	Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_)
	{
		return this.CompareOrientation(orientation_, cmp_, angle_);
	};
	
	Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_)
	{
		return this.CompareAcceleration(acceleration_, cmp_, angle_);
	};
	
	Cnds.prototype.OnNthTouchStart = function (touch_)
	{
		return this.OnNthTouchStart(touch_);
	};
	
	Cnds.prototype.OnNthTouchEnd = function (touch_)
	{
		return this.OnNthTouchEnd(touch_);
	};
	
	Cnds.prototype.HasNthTouch = function (touch_)
	{
		return this.HasNthTouch(touch_);
	};
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

	Exps.prototype.TouchCount = function (ret)
	{
		ret.set_int(this.touches.length);
	};
	
	Exps.prototype.X = function (ret, layerparam)
	{
		ret.set_float(this.GetX(layerparam));
	};
	
	Exps.prototype.XAt = function (ret, index, layerparam)
	{
		ret.set_float(this.GetXAt(index, layerparam));
	};	
	
	Exps.prototype.Y = function (ret, layerparam)
	{
		ret.set_float(this.GetY(layerparam));
	};
	
	Exps.prototype.YAt = function (ret, index, layerparam)
	{
		ret.set_float(this.GetYAt(index, layerparam));
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
		ret.set_float(this.GetAbsoluteX());
	};
	
	Exps.prototype.AbsoluteXAt = function (ret, index)
	{
		ret.set_float(this.GetAbsoluteXAt(index));
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
        ret.set_float(this.GetAbsoluteY());
	};
	
	Exps.prototype.AbsoluteYAt = function (ret, index)
	{
		ret.set_float(this.GetAbsoluteYAt(index));
	};
	
	Exps.prototype.SpeedAt = function (ret, index)
	{
		ret.set_float(this.GetSpeedAt(index));
	};
	
	Exps.prototype.AngleAt = function (ret, index)
	{
		ret.set_float(this.GetAngleAt(index));
	};
	
	Exps.prototype.Alpha = function (ret)
	{
		ret.set_float(this.GetAlpha());
	};
	
	Exps.prototype.Beta = function (ret)
	{
		ret.set_float(this.GetBeta());
	};
	
	Exps.prototype.Gamma = function (ret)
	{
		ret.set_float(this.GetGamma());
	};
	
	Exps.prototype.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.GetAccelerationXWithG());
	};
	
	Exps.prototype.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.GetAccelerationYWithG());
	};
	
	Exps.prototype.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.GetAccelerationZWithG());
	};
	
	Exps.prototype.AccelerationX = function (ret)
	{
		ret.set_float(this.GetAccelerationX());
	};
	
	Exps.prototype.AccelerationY = function (ret)
	{
		ret.set_float(this.GetAccelerationY());
	};
	
	Exps.prototype.AccelerationZ = function (ret)
	{
		ret.set_float(this.GetAccelerationZ());
	};
	
}());