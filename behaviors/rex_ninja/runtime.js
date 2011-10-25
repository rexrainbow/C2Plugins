// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Ninja = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Ninja.prototype;
		
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
		this.runtime.canvas.addEventListener("touchmove",
			(function (self) {
				return function(info) {
					self.onTouchMove(info);
				};
			})(this),
			true
		);
        
        
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;    
        
        // touch
		this.touches = [];        
        
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

    // export
	behtypeProto.GetLayerX = function(inst)
	{
        var ret_x;
        if (this.trigger_source == 1)  // mouse
        {    
            ret_x = inst.layer.canvasToLayerX(this.mouseXcanvas);
        }
        else
        {
		    if (this.touches.length)
		    {
                ret_x = inst.layer.canvasToLayerX(this.touches[0].x);
		    }
		    else
            {
			    ret_x = null;        
            }
        }
        return ret_x;
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        var ret_y;
        if (this.trigger_source == 1)  // mouse
        {    
            ret_y = inst.layer.canvasToLayerY(this.mouseYcanvas);
        }
        else
        {
		    if (this.touches.length)
		    {
                ret_y = inst.layer.canvasToLayerY(this.touches[0].y);
		    }
		    else
            {
			    ret_y = null;        
            }
        }
        return ret_y;
	};    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
        this.is_over = false;
        this.inst.visible = 0;
	};

	behinstProto.tick = function ()
	{
        if (this.activated==1)
        {
            var inst = this.inst;
            inst.update_bbox();
	        var lx = this.type.GetLayerX(inst);
		    var ly = this.type.GetLayerY(inst);
            this.is_over = (lx != null)? 
                           inst.contains_pt(lx, ly):
                           false;
            if (inst.visible != this.is_over)
            {
                inst.visible = this.is_over;
                this.runtime.redraw = true;
            }
            
            // Trigger OnOver
            if (this.is_over)
            {
                this.runtime.trigger(cr.behaviors.Rex_Ninja.prototype.cnds.OnOver, this.inst);            
            }
        }
	};
    
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;   
    
	cnds.OnOver = function ()
	{
		return true;
	};
    
	cnds.IsOver = function ()
	{
		return (this.is_over);
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

}());