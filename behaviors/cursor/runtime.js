// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Cursor = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Cursor.prototype;
		
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
        
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;    
	};
    
	behtypeProto.onMouseMove = function(info)
	{
		var offset = jQuery(this.runtime.canvas).offset();
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;           
	};    

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
		this.pre_mouseXcanvas = type.mouseXcanvas;
		this.pre_mouseYcanvas = type.mouseYcanvas;            
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
	};

	behinstProto.tick = function ()
	{
        var is_mouse_moved = (this.pre_mouseXcanvas != this.type.mouseXcanvas) ||
                             (this.pre_mouseYcanvas != this.type.mouseYcanvas);
        if ( (this.activated== 1) && is_mouse_moved) {
           this.inst.x = this.type.mouseXcanvas;
           this.inst.y = this.type.mouseYcanvas;
           this.inst.set_bbox_changed();
           // Trigger IsMoving
           this.runtime.trigger(cr.behaviors.Cursor.prototype.cnds.IsMoving, this.inst);
           this.pre_mouseXcanvas = this.type.mouseXcanvas;
           this.pre_mouseYcanvas = this.type.mouseYcanvas;
        }
	};
    
  

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;   
    
	cnds.IsMoving = function ()
	{
		return true;
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

	exps.X = function (ret, layerparam)
	{
		var layer, oldScale;
		
		if (typeof layerparam === "undefined")
		{
			// calculate X position on bottom layer as if its scale were 1.0
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			layer.scale = 1.0;
			ret.set_float(layer.canvasToLayerX(this.type.mouseXcanvas));
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
				
			ret.set_float(layer.canvasToLayerX(this.type.mouseXcanvas));
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
			ret.set_float(layer.canvasToLayerY(this.type.mouseYcanvas));
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
				
			ret.set_float(layer.canvasToLayerY(this.type.mouseYcanvas));
		}
	};
	
	exps.AbsoluteX = function (ret)
	{
		ret.set_float(this.type.mouseXcanvas);
	};
	
	exps.AbsoluteY = function (ret)
	{
		ret.set_float(this.type.mouseYcanvas);
	};
}());