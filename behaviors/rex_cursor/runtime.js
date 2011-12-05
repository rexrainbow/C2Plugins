// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Cursor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Cursor.prototype;
		
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
		// Bind mouse events via jQuery
		jQuery(document).mousemove(
			(function (self) {
				return function(info) {
					self.onMouseMove(info);
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

        this.behavior_index = null;
        
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;    
        
        // touch
		this.touches = [];
		this.curTouchX = 0;
		this.curTouchY = 0;        
        this.is_on_touch = false;
        this.last_touch_x = 0;
        this.last_touch_y = 0;
        
        // control
        this.trigger_source = 1;  // 0=touch, 1=mouse            
	};
    
	behtypeProto.onMouseMove = function(info)
	{
        this.trigger_source = 1;    
		var offset = jQuery(this.runtime.canvas).offset();
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;
	};    
        
    // touch
    behtypeProto.saveTouches = function (t)
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
    
	behtypeProto.onTouchMove = function (info)
	{
        this.trigger_source = 0;
		info.preventDefault();
		this.saveTouches(info.touches);
	};

	behtypeProto.onTouchStart = function (info)
	{
        this.trigger_source = 0;
		info.preventDefault();
		this.saveTouches(info.touches);
		
		var offset = jQuery(this.runtime.canvas).offset();
        
		if (info.changedTouches)
		{
			var i, len;
			for (i = 0, len = info.changedTouches.length; i < len; i++)
			{
				var touch = info.changedTouches[i];
				
				this.curTouchX = touch.pageX - offset.left;
				this.curTouchY = touch.pageY - offset.top;                
			}
            
		}
        
        this.is_on_touch = true;
	};

	behtypeProto.onTouchEnd = function (info)
	{
        this.trigger_source = 0;
		info.preventDefault();
		//this.saveTouches(info.touches);  // do not update this.touches
        
        this.is_on_touch = false;
        this.last_touch_x = this.touches[0].x;
        this.last_touch_y = this.touches[0].y;        
	};    
           
    // export
	behtypeProto.GetABSX = function ()
	{
        var ret_x;
        if (this.trigger_source == 1)  // mouse
        {
            ret_x = this.mouseXcanvas;
        }
        else    // touch
        {
		    if (this.is_on_touch)
                ret_x = this.touches[0].x;
		    else
                ret_x = this.last_touch_x;        
        }
        return ret_x;
	};  

	behtypeProto.GetABSY = function ()
	{
        var ret_y;
        if (this.trigger_source == 1)  // mouse
        {
            ret_y = this.mouseYcanvas;
        }
        else    // touch
        {
		    if (this.is_on_touch)
                ret_y = this.touches[0].y;
		    else
                ret_y = this.last_touch_y;      
        }
        return ret_y;
	};     
    
	behtypeProto.GetLayerX = function(inst)
	{
        return inst.layer.canvasToLayer(this.GetABSX(), this.GetABSY(), true);
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        return inst.layer.canvasToLayer(this.GetABSX(), this.GetABSY(), false);
	};  

	behtypeProto.IsCursorExisted = function()
	{
        return (this.trigger_source == 1)?  true : this.is_on_touch;
	};     

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
		this.pre_x = type.GetABSX();
		this.pre_y = type.GetABSY(); 
        this.is_moving = false;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
        this.invisible = (this.properties[1]==1);        
	};

	behinstProto.tick = function ()
	{
        var curr_x = this.type.GetABSX();
        var curr_y = this.type.GetABSY();
        this.is_moving = (this.pre_x != curr_x) ||
                         (this.pre_y != curr_y);
        if ( (this.activated== 1) && this.is_moving) {
            var inst = this.inst;
            inst.x = this.type.GetLayerX(inst);
            inst.y = this.type.GetLayerY(inst);
            inst.set_bbox_changed();
            // Trigger OnMoving
            this.runtime.trigger(cr.behaviors.Rex_Cursor.prototype.cnds.OnMoving, inst);
            this.pre_x = curr_x;
            this.pre_y = curr_y;
        }
        
        if (this.invisible)
        {
            var visible = this.type.IsCursorExisted();
            if (this.inst.visible != visible)
            {
                this.inst.visible = visible;
                this.runtime.redraw = true;
            }
        }
	};
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;   
    
	cnds.OnMoving = function ()
	{
		return true;
	};
    
	cnds.IsMoving = function ()
	{
		return (this.is_moving);
	};    
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.X = function (ret)
	{
        ret.set_float( this.type.GetLayerX(this.inst) );
	};
	
	exps.Y = function (ret)
	{
	    ret.set_float( this.type.GetLayerY(this.inst) );
	};
	
	exps.AbsoluteX = function (ret)
	{
        ret.set_float( this.type.GetABSX(this.inst) );
	};
	
	exps.AbsoluteY = function (ret)
	{
        ret.set_float( this.type.GetABSY(this.inst) );
	};
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};     
}());