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
        this.cursor = {x:null, y:null};
        this._callbackObjs = [];
	    this.fake_ret = {value:0,
	                     set_any: function(value){this.value=value;},
	                     set_int: function(value){this.value=value;},	 
                         set_float: function(value){this.value=value;},	                          
	                    };        
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	var canvasOffset = {left: 0, top: 0};

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
	
	var touchinfo_cache = [];
	
	function AllocTouchInfo(x, y, id, index)
	{
		var ret;
		
		if (touchinfo_cache.length)
			ret = touchinfo_cache.pop();
		else
			ret = new TouchInfo();
		
		ret.init(x, y, id, index);
		return ret;
	};
	
	function ReleaseTouchInfo(ti)
	{
		if (touchinfo_cache.length < 100)
			touchinfo_cache.push(ti);
	};
	
	var GESTURE_HOLD_THRESHOLD = 15;		// max px motion for hold gesture to register
	var GESTURE_HOLD_TIMEOUT = 500;			// time for hold gesture to register
	var GESTURE_TAP_TIMEOUT = 333;			// time for tap gesture to register
	var GESTURE_DOUBLETAP_THRESHOLD = 25;	// max distance apart for taps to be
	
	function TouchInfo()
	{
		this.starttime = 0;
		this.time = 0;
		this.lasttime = 0;
		
		this.startx = 0;
		this.starty = 0;
		this.x = 0;
		this.y = 0;
		this.lastx = 0;
		this.lasty = 0;
		
		this["id"] = 0;
		this.startindex = 0;
		
		this.triggeredHold = false;
		this.tooFarForHold = false;
	};
	
	TouchInfo.prototype.init = function (x, y, id, index)
	{
		var nowtime = cr.performance_now();
		this.time = nowtime;
		this.lasttime = nowtime;
		this.starttime = nowtime;
		
		this.startx = x;
		this.starty = y;
		this.x = x;
		this.y = y;
		this.lastx = x;
		this.lasty = y;
		this.width = 0;
		this.height = 0;
		this.pressure = 0;
		
		this["id"] = id;
		this.startindex = index;
		
		this.triggeredHold = false;
		this.tooFarForHold = false;
	};
	
	TouchInfo.prototype.update = function (nowtime, x, y, width, height, pressure)
	{
		this.lasttime = this.time;
		this.time = nowtime;
		
		this.lastx = this.x;
		this.lasty = this.y;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.pressure = pressure;
		
		if (!this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) >= GESTURE_HOLD_THRESHOLD)
		{
			this.tooFarForHold = true;
		}
	};
	
	TouchInfo.prototype.maybeTriggerHold = function (inst, index)
	{
		if (this.triggeredHold)
			return;		// already triggered this gesture
		
		var nowtime = cr.performance_now();
		
		// Is within 10px after 500ms
		if (nowtime - this.starttime >= GESTURE_HOLD_TIMEOUT && !this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) < GESTURE_HOLD_THRESHOLD)
		{
			this.triggeredHold = true;
			
			inst.trigger_index = this.startindex;
			inst.trigger_id = this["id"];
			inst.getTouchIndex = index;
			inst.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnHoldGesture, inst);
			
			inst.curTouchX = this.x;
			inst.curTouchY = this.y;
			inst.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnHoldGestureObject, inst);
			
			inst.getTouchIndex = 0;
		}
	};
	
	var lastTapX = -1000;
	var lastTapY = -1000;
	var lastTapTime = -10000;
	
	TouchInfo.prototype.maybeTriggerTap = function (inst, index)
	{
		if (this.triggeredHold)
			return;
		
		var nowtime = cr.performance_now();
		
		// Must also come within the hold threshold
		if (nowtime - this.starttime <= GESTURE_TAP_TIMEOUT && !this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) < GESTURE_HOLD_THRESHOLD)
		{
			inst.trigger_index = this.startindex;
			inst.trigger_id = this["id"];
			inst.getTouchIndex = index;
			
			// Is within the distance and time of last tap: trigger a double tap
			if ((nowtime - lastTapTime <= GESTURE_TAP_TIMEOUT * 2) && cr.distanceTo(lastTapX, lastTapY, this.x, this.y) < GESTURE_DOUBLETAP_THRESHOLD)
			{
				inst.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnDoubleTapGesture, inst);
				
				inst.curTouchX = this.x;
				inst.curTouchY = this.y;
				inst.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnDoubleTapGestureObject, inst);
				
				lastTapX = -1000;
				lastTapY = -1000;
				lastTapTime = -10000;
			}
			// Otherwise trigger single tap
			else
			{
				inst.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTapGesture, inst);
				
				inst.curTouchX = this.x;
				inst.curTouchY = this.y;
				inst.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTapGestureObject, inst);
				
				lastTapX = this.x;
				lastTapY = this.y;
				lastTapTime = nowtime;
			}
			
			inst.getTouchIndex = 0;
		}
	};

	instanceProto.onCreate = function()
	{
		theInstance = this;
		this.isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		
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
		this.trigger_id = 0;
		
		// For returning correct position for TouchX and TouchY expressions in a trigger
		this.getTouchIndex = 0;
		
		this.useMouseInput = (this.properties[0] !== 0);
		
		// Use document touch input for PhoneGap or fullscreen mode
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		
		// Use elem2 to attach the up and cancel events to document, since we want to know about
		// these even if they happen off the main canvas.
		var elem2 = document;
		
		if (this.runtime.isDirectCanvas)
			elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem2 = elem = window;
			
		var self = this;
		
		if (typeof PointerEvent !== "undefined")
		{
			elem.addEventListener("pointerdown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			
			elem.addEventListener("pointermove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			
			// Always attach up/cancel events to document (note elem2),
			// otherwise touches dragged off the canvas could get lost
			elem2.addEventListener("pointerup",
				function(info) {
					self.onPointerEnd(info, false);
				},
				false
			);
			
			// Treat pointer cancellation the same as a touch end
			elem2.addEventListener("pointercancel",
				function(info) {
					self.onPointerEnd(info, true);
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
				this.runtime.canvas.addEventListener("gesturehold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("gesturehold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		// IE10-style MS prefixed pointer events
		else if (window.navigator["msPointerEnabled"])
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
			
			// Always attach up/cancel events to document (note elem2),
			// otherwise touches dragged off the canvas could get lost
			elem2.addEventListener("MSPointerUp",
				function(info) {
					self.onPointerEnd(info, false);
				},
				false
			);
			
			// Treat pointer cancellation the same as a touch end
			elem2.addEventListener("MSPointerCancel",
				function(info) {
					self.onPointerEnd(info, true);
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
		// otherwise old style touch events
		else
		{
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
			
			// Always attach up/cancel events to document (note elem2),
			// otherwise touches dragged off the canvas could get lost
			elem2.addEventListener("touchend",
				function(info) {
					self.onTouchEnd(info, false);
				},
				false
			);
			
			// Treat touch cancellation the same as a touch end
			elem2.addEventListener("touchcancel",
				function(info) {
					self.onTouchEnd(info, true);
				},
				false
			);
		}
		
		if (this.isWindows8)
		{
			var win8accelerometerFn = function(e) {
					var reading = e["reading"];
					self.acc_x = reading["accelerationX"];
					self.acc_y = reading["accelerationY"];
					self.acc_z = reading["accelerationZ"];
				};
				
			var win8inclinometerFn = function(e) {
					var reading = e["reading"];
					self.orient_alpha = reading["yawDegrees"];
					self.orient_beta = reading["pitchDegrees"];
					self.orient_gamma = reading["rollDegrees"];
				};
				
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
			
            if (accelerometer)
			{
                accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn);
            }
			
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			
			if (inclinometer)
			{
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn);
			}
			
			document.addEventListener("visibilitychange", function(e) {
				if (document["hidden"] || document["msHidden"])
				{
					if (accelerometer)
						accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
				}
				else
				{
					if (accelerometer)
						accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.addEventListener("readingchanged", win8inclinometerFn);
				}
			}, false);
		}
		else
		{
			
			window.addEventListener("deviceorientation", function (eventData) {
			
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0;
			
			}, false);
			
			window.addEventListener("devicemotion", function (eventData) {
			
				if (eventData["accelerationIncludingGravity"])
				{
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"] || 0;
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"] || 0;
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"] || 0;
				}
				
				if (eventData["acceleration"])
				{
					self.acc_x = eventData["acceleration"]["x"] || 0;
					self.acc_y = eventData["acceleration"]["y"] || 0;
					self.acc_z = eventData["acceleration"]["z"] || 0;
				}
				
			}, false);
		}
		
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
			document.addEventListener("mousemove", 
			    function(info) {
					self.onMouseMove(info);
				});

			document.addEventListener("mousedown", 
			    function(info) {
					self.onMouseDown(info);
				});			

			document.addEventListener("mouseup", 
			    function(info) {
					self.onMouseUp(info);
				});			
		}
		
		// Use PhoneGap in case browser does not support accelerometer but device does
		if (!this.runtime.isiOS && this.runtime.isCordova && navigator["accelerometer"] && navigator["accelerometer"]["watchAcceleration"])
		{
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
		}
		
		this.runtime.tick2Me(this);
		
		this.enable = (this.properties[1] == 1);
		this.lastTouchX = null;
		this.lastTouchY = null;		
	};

	instanceProto.getCanvasOffset = function()
	{
		if (!this.runtime.isDomFree)
		{
			canvasOffset.left = this.runtime.canvas.offsetLeft;
			canvasOffset.top = this.runtime.canvas.offsetTop;
		}
		return canvasOffset;
	}
	
	instanceProto.onPointerMove = function (info)
	{	    
	    if (!this.enable)
	        return;
	        
		// Ignore mouse events (note check for both IE10 and IE11 style pointerType values)
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
				
		if (info.preventDefault)
			info.preventDefault();
		
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		var cnt=this._callbackObjs.length, hooki;    		
		if (i >= 0)
		{
			var offset = this.getCanvasOffset();
			var t = this.touches[i];
			
			// Ignore events <2ms after the last event - seems events sometimes double-fire
			// very close which throws off speed measurements
			if (nowtime - t.time < 2)
				return;
			
			t.update(nowtime, info.pageX - offset.left, info.pageY - offset.top, info.width || 0, info.height || 0, info.pressure || 0);
            
			var touchx = info.pageX - offset.left;
			var touchy = info.pageY - offset.top;            
            for (hooki=0; hooki<cnt; hooki++)
			{
				if (this._callbackObjs[hooki].OnTouchMove)							    	  
                    this._callbackObjs[hooki].OnTouchMove(t["identifier"], touchx, touchy);
			}            
		}
	};

	instanceProto.onPointerStart = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		// Ignore mouse events (note check for both IE10 and IE11 style pointerType values)
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
		
		var offset = this.getCanvasOffset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		
		this.touches.push(AllocTouchInfo(touchx, touchy, info["pointerId"], this.trigger_index));
		
		this.runtime.isInUserInputEvent = true;
		
		// Trigger OnNthTouchStart then OnTouchStart
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchStart, this);
		
		// Trigger OnTouchObject for each touch started event		
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchObject, this);
        
        var hooki, cnt=this._callbackObjs.length;
        for (hooki=0; hooki<cnt; hooki++)
		{
			if (this._callbackObjs[hooki].OnTouchStart)
                this._callbackObjs[hooki].OnTouchStart(this.trigger_id, this.curTouchX, this.curTouchY);
	    }
	    this.runtime.isInUserInputEvent = false;
	};

	instanceProto.onPointerEnd = function (info, isCancel)
	{
	    if (!this.enable)
	        return;
	        	    
		// Ignore mouse events (note check for both IE10 and IE11 style pointerType values)
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
	
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
			
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		this.trigger_id = (i >= 0 ? this.touches[i]["id"] : -1);
		
		this.runtime.isInUserInputEvent = true;
		
		// Trigger OnNthTouchEnd & OnTouchEnd
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchEnd, this);

        if (i >= 0)
        {
		    this.lastTouchX = this.touches[i].x;
		    this.lastTouchY = this.touches[i].y;
		    this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchReleasedObject, this);		
		}
        
        var cnt=this._callbackObjs.length, hooki; 
        for (hooki=0; hooki<cnt; hooki++)
		{
		    if (this._callbackObjs[hooki].OnTouchEnd)
                this._callbackObjs[hooki].OnTouchEnd(this.trigger_id);
		}
		
		// Remove touch
		if (i >= 0)
		{
			if (!isCancel)
				this.touches[i].maybeTriggerTap(this, i);
			
			ReleaseTouchInfo(this.touches[i]);
			this.touches.splice(i, 1);
		}
		
		this.runtime.isInUserInputEvent = false;
	};

	instanceProto.onTouchMove = function (info)
	{
	    if (!this.enable)
	        return;
	        	    
		if (info.preventDefault)
			info.preventDefault();
		
		var nowtime = cr.performance_now();
		
		var i, len, t, u;
		var cnt=this._callbackObjs.length, hooki;    
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			var j = this.findTouch(t["identifier"]);
			
			if (j >= 0)
			{
				var offset = this.getCanvasOffset();
				u = this.touches[j];
				
				// Ignore events <2ms after the last event - seems events sometimes double-fire
				// very close which throws off speed measurements
				if (nowtime - u.time < 2)
					continue;
				
				var touchWidth = (t.radiusX || t.webkitRadiusX || t.mozRadiusX || t.msRadiusX || 0) * 2;
				var touchHeight = (t.radiusY || t.webkitRadiusY || t.mozRadiusY || t.msRadiusY || 0) * 2;
				var touchForce = t.force || t.webkitForce || t.mozForce || t.msForce || 0;
				u.update(nowtime, t.pageX - offset.left, t.pageY - offset.top, touchWidth, touchHeight, touchForce);
				
			    var touchx = t.pageX - offset.left;
			    var touchy = t.pageY - offset.top;	                
                for (hooki=0; hooki<cnt; hooki++)
			    {
			    	if (this._callbackObjs[hooki].OnTouchMove)
                        this._callbackObjs[hooki].OnTouchMove(t["identifier"], touchx, touchy);
			    }
							
			}
		}
	};

	instanceProto.onTouchStart = function (info)
	{
	    if (!this.enable)
	        return;
                    
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
			
		var offset = this.getCanvasOffset();
		var nowtime = cr.performance_now();
		
		this.runtime.isInUserInputEvent = true;
		
		var i, len, t, j;
        var cnt=this._callbackObjs.length, hooki;        
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			
			// WORKAROUND Chrome for Android bug: touchstart sometimes fires twice with same id.
			// If there is already a touch with this id, ignore this event.
			j = this.findTouch(t["identifier"]);
			
			if (j !== -1)
				continue;
			// END WORKAROUND
			
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			
			this.touches.push(AllocTouchInfo(touchx, touchy, t["identifier"], this.trigger_index));
			
			// Trigger OnNthTouchStart then OnTouchStart
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchStart, this);
            
			// Trigger OnTouchObject for each touch started event		
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchObject, this);
            
            for (hooki=0; hooki<cnt; hooki++)
			{
				if (this._callbackObjs[hooki].OnTouchStart)
                    this._callbackObjs[hooki].OnTouchStart(this.trigger_id, this.curTouchX, this.curTouchY);
			}
		}		
		this.runtime.isInUserInputEvent = false;
	};

	instanceProto.onTouchEnd = function (info, isCancel)
	{
	    if (!this.enable)
	        return;

		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
			
		this.runtime.isInUserInputEvent = true;
		
		var i, len, t, j;
        var cnt=this._callbackObjs.length, hooki;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			
			// Remove touch
			if (j >= 0)
			{
				// Trigger OnNthTouchEnd & OnTouchEnd
				// NOTE: Android stock browser is total garbage and fires touchend twice
				// when a single touch ends. So we only fire these events when we found the
				// touch identifier exists.
				this.trigger_index = this.touches[j].startindex;
				this.trigger_id = this.touches[j]["id"];
			
				this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnNthTouchEnd, this);
				this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchEnd, this);

		        this.lastTouchX = this.touches[j].x;
		        this.lastTouchY = this.touches[j].y;	
				this.runtime.trigger(cr.plugins_.rex_TouchWrap.prototype.cnds.OnTouchReleasedObject, this);
			
                for (hooki=0; hooki<cnt; hooki++)
			    {
			        if (this._callbackObjs[hooki].OnTouchEnd)
                        this._callbackObjs[hooki].OnTouchEnd(this.trigger_id);
			    }
						

				if (!isCancel)
					this.touches[j].maybeTriggerTap(this, j);
				
				ReleaseTouchInfo(this.touches[j]);
				this.touches.splice(j, 1);
			}
		}
		
		this.runtime.isInUserInputEvent = false;
	};
	
	instanceProto.getAlpha = function ()
	{
		if (this.runtime.isCordova && this.orient_alpha === 0 && pg_accz !== 0)
			return pg_accz * 90;
		else
			return this.orient_alpha;
	};
	
	instanceProto.getBeta = function ()
	{
		if (this.runtime.isCordova && this.orient_beta === 0 && pg_accy !== 0)
			return pg_accy * 90;
		else
			return this.orient_beta;
	};
	
	instanceProto.getGamma = function ()
	{
		if (this.runtime.isCordova && this.orient_gamma === 0 && pg_accx !== 0)
			return pg_accx * 90;
		else
			return this.orient_gamma;
	};
	
	var noop_func = function(){};

    instanceProto.updateCursor = function(info)
    {
        var offset = this.getCanvasOffset();
        
        this.cursor.x = info.pageX - offset.left;
        this.cursor.y = info.pageY - offset.top; 
    }
	instanceProto.onMouseDown = function(info)
	{
	    if (!this.enable)
	        return;
	        	    
        this.updateCursor(info);
        
		this.mouseDown = true;	    
		if (info.preventDefault && this.runtime.had_a_click && !this.runtime.isMobile)
			info.preventDefault();
		
        var index = this.findTouch(0);
        if (index !== -1)
        {
            ReleaseTouchInfo(this.touches[index]);
            cr.arrayRemove( this.touches, index );     
        }

		// Send a fake touch start event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };        
		this.onTouchStart(fakeinfo);
	};
	
	instanceProto.onMouseMove = function(info)
	{
	    if (!this.enable)
	        return;
                
        this.updateCursor(info);
        
		if (!this.mouseDown)
			return;
			
		// Send a fake touch move event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchMove(fakeinfo);
	};

	instanceProto.onMouseUp = function(info)
	{
	    if (!this.enable)
	        return;

        this.updateCursor(info);        
	        	    
		this.mouseDown = false;			    
		if (info.preventDefault && this.runtime.had_a_click && !this.runtime.isMobile)
			info.preventDefault();
			
		this.runtime.had_a_click = true;
		
		// Send a fake touch end event
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchEnd(fakeinfo);
	};
	
	instanceProto.tick2 = function()
	{
	    if (!this.enable)
	        return;
	        	    
		var i, len, t;
		var nowtime = cr.performance_now();
		
		for (i = 0, len = this.touches.length; i < len; ++i)
		{
			// Update speed for touches which haven't moved for 50ms
			t = this.touches[i];
			
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
			
			// Gesture detection
			t.maybeTriggerHold(this, i);
		}
		
		this.lastTouchX = null;
		this.lastTouchY = null;		
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		var props = [], i, len, t, val;
		
		for (i = 0, len = this.touches.length; i < len; ++i)
		{
			t = this.touches[i];
		    val = "(" + t.x + ", " + t.y + "), ID: " + t["id"];
			props.push({"name": i.toString(), "value": val, "readonly": true});
		}
		
		propsections.push({
			"title": "Touches",
			"properties": props
		});
		
		propsections.push({
			"title": "Orientation & motion",
			"properties": [
				{"name": "Alpha", "value": this.getAlpha(), "readonly": true},
				{"name": "Beta", "value": this.getBeta(), "readonly": true},
				{"name": "Gamma", "value": this.getGamma(), "readonly": true},
				{"name": "X acceleration", "value": this.acc_x, "readonly": true},
				{"name": "Y acceleration", "value": this.acc_y, "readonly": true},
				{"name": "Z acceleration", "value": this.acc_z, "readonly": true},
				{"name": "X acceleration with gravity", "value": this.acc_g_x, "readonly": true},
				{"name": "Y acceleration with gravity", "value": this.acc_g_y, "readonly": true},
				{"name": "Z acceleration with gravity", "value": this.acc_g_z, "readonly": true}
			]
		});
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

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
		if (!type)
			return false;
			
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	
	var touching = [];
	
	Cnds.prototype.IsTouchingObject = function (type)
	{        
        if (!this.IsInTouch())
            return;
            
		if (!type)
			return false;
			
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
			
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
			cr.shallowAssignArray(sol.instances, touching);
			type.applySolToContainer();
			cr.clearArray(touching);
			return true;
		}
		else
			return false;
	};
	
	Cnds.prototype.CompareTouchSpeed = function (index, cmp, s)
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
	
	Cnds.prototype.OrientationSupported = function ()
	{
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	
	Cnds.prototype.MotionSupported = function ()
	{
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};
	
	Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_)
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
	
	Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_)
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
	
	Cnds.prototype.OnNthTouchStart = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	
	Cnds.prototype.OnNthTouchEnd = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	
	Cnds.prototype.HasNthTouch = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1;
	};
	
	Cnds.prototype.OnHoldGesture = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnTapGesture = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnDoubleTapGesture = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnHoldGestureObject = function (type)
	{
		if (!type)
			return false;
		
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	
	Cnds.prototype.OnTapGestureObject = function (type)
	{
		if (!type)
			return false;
		
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	
	Cnds.prototype.OnDoubleTapGestureObject = function (type)
	{
		if (!type)
			return false;
		
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	
	// ----	
	Cnds.prototype.OnTouchReleasedObject = function (type)
	{
		if (!type)
			return false;

		return this.runtime.testAndSelectCanvasPointOverlap(type, this.lastTouchX, this.lastTouchY, false);
	};

	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();
            
    Acts.prototype.SetEnable = function(en)
    {
        this.enable = (en==1);
    };	

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.TouchCount = function (ret)
	{
		ret.set_int(this.touches.length);
	};
	
	Exps.prototype.X = function (ret, layerparam)
	{
		var index = this.getTouchIndex;
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
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
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.XAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
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
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.XForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
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
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.Y = function (ret, layerparam)
	{
		var index = this.getTouchIndex;
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = 0;
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
	
	Exps.prototype.YAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = 0;
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
	
	Exps.prototype.YForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
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
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else
				ret.set_float(0);
		}
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].x);
		else
			ret.set_float(0);
	};
	
	Exps.prototype.AbsoluteXAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}

		ret.set_float(this.touches[index].x);
	};
	
	Exps.prototype.AbsoluteXForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];

		ret.set_float(touch.x);
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].y);
		else
			ret.set_float(0);
	};
	
	Exps.prototype.AbsoluteYAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}

		ret.set_float(this.touches[index].y);
	};
	
	Exps.prototype.AbsoluteYForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];

		ret.set_float(touch.y);
	};
	
	Exps.prototype.SpeedAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	
	Exps.prototype.SpeedForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1000;
		
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	
	Exps.prototype.AngleAt = function (ret, index)
	{
		index = Math.floor(index);
		
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
	};
	
	Exps.prototype.AngleForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)));
	};
	
	Exps.prototype.Alpha = function (ret)
	{
		ret.set_float(this.getAlpha());
	};
	
	Exps.prototype.Beta = function (ret)
	{
		ret.set_float(this.getBeta());
	};
	
	Exps.prototype.Gamma = function (ret)
	{
		ret.set_float(this.getGamma());
	};
	
	Exps.prototype.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.acc_g_x);
	};
	
	Exps.prototype.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.acc_g_y);
	};
	
	Exps.prototype.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.acc_g_z);
	};
	
	Exps.prototype.AccelerationX = function (ret)
	{
		ret.set_float(this.acc_x);
	};
	
	Exps.prototype.AccelerationY = function (ret)
	{
		ret.set_float(this.acc_y);
	};
	
	Exps.prototype.AccelerationZ = function (ret)
	{
		ret.set_float(this.acc_z);
	};
	
	Exps.prototype.TouchIndex = function (ret)
	{
		ret.set_int(this.trigger_index);
	};
	
	Exps.prototype.TouchID = function (ret)
	{
		ret.set_float(this.trigger_id);
	};
	
	Exps.prototype.WidthForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		ret.set_float(touch.width);
	};
	
	Exps.prototype.HeightForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		ret.set_float(touch.height);
	};
	
	Exps.prototype.PressureForID = function (ret, id)
	{
		var index = this.findTouch(id);
		
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		
		var touch = this.touches[index];
		ret.set_float(touch.pressure);
	};
    
	pluginProto.exps = new Exps();
	
    
    // wrapper --------
    instanceProto.HookMe = function (obj)
    {
        this._callbackObjs.push(obj);
    };

    instanceProto.UnHookMe = function (obj)
    {
        cr.arrayFindRemove(this._callbackObjs, obj);
    };    
    instanceProto.IsInTouch = function ()
	{
        return (this.touches.length > 0);
    };     
    
    // epxort
    var exps = cr.plugins_.rex_TouchWrap.prototype.exps;
    instanceProto.TouchCount = function()
    {
        exps.TouchCount.call(this, this.fake_ret);
        return this.fake_ret.value
    };     
    instanceProto.X = function(layerparam)
    {
        exps.X.call(this, this.fake_ret, layerparam);
        return this.fake_ret.value
    };  
    instanceProto.XAt = function(index, layerparam)
    {
        exps.XAt.call(this, this.fake_ret, index, layerparam);
        return this.fake_ret.value
    };
    instanceProto.XForID = function(id, layerparam)
    {
        exps.XForID.call(this, this.fake_ret, id, layerparam);
        return this.fake_ret.value
    };    
    instanceProto.Y = function(layerparam)
    {
        exps.Y.call(this, this.fake_ret, layerparam);
        return this.fake_ret.value
    };     
    instanceProto.YAt = function(index, layerparam)
    {
        exps.YAt.call(this, this.fake_ret, index, layerparam);
        return this.fake_ret.value
    };     
    instanceProto.YForID = function(id, layerparam)
    {
        exps.YForID.call(this, this.fake_ret, id, layerparam);
        return this.fake_ret.value
    };     
    instanceProto.AbsoluteX = function()
    {
        exps.AbsoluteX.call(this, this.fake_ret);
        return this.fake_ret.value
    };     
    instanceProto.AbsoluteXAt = function(index)
    {
        exps.AbsoluteXAt.call(this, this.fake_ret, index);
        return this.fake_ret.value
    };    
    instanceProto.AbsoluteXForID = function(id)
    {
        exps.AbsoluteXForID.call(this, this.fake_ret, id);
        return this.fake_ret.value
    };
    instanceProto.AbsoluteY = function()
    {
        exps.AbsoluteY.call(this, this.fake_ret);
        return this.fake_ret.value
    };     
    instanceProto.AbsoluteYAt = function(index)
    {
        exps.AbsoluteYAt.call(this, this.fake_ret, index);
        return this.fake_ret.value
    };    
    instanceProto.AbsoluteYForID = function(id)
    {
        exps.AbsoluteYForID.call(this, this.fake_ret, id);
        return this.fake_ret.value
    };    
    

	instanceProto.CursorX = function (layerparam)
	{
        if (this.cursor.x == null)
            return null;

        var x;
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
			x = layer.canvasToLayer(this.cursor.x, this.cursor.y, true);
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
				x = layer.canvasToLayer(this.cursor.x, this.cursor.y, true);
			else
				x = 0;
		}
        
        return x;
	};


	instanceProto.CursorY = function (layerparam)
	{
        if (this.cursor.y == null)
            return null;

        var y;
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
	
		if (cr.is_undefined(layerparam))
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
			y = layer.canvasToLayer(this.cursor.x, this.cursor.y, false);
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
				y = layer.canvasToLayer(this.cursor.x, this.cursor.y, false);
			else
				y = 0;
		}
        
        return y;
	};    
    
    instanceProto.CursorAbsoluteX = function ()
    {
        return this.cursor.x;
    };
    
    instanceProto.CursorAbsoluteY = function ()
    {
        return this.cursor.y;
    };    
    
    // wrapper --------    
    
}());