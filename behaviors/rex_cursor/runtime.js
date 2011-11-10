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
        this.is_moving = false;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
	};

	behinstProto.tick = function ()
	{
        this.is_moving = (this.pre_mouseXcanvas != this.type.mouseXcanvas) ||
                        (this.pre_mouseYcanvas != this.type.mouseYcanvas);
        if ( (this.activated== 1) && this.is_moving) {
           this.inst.x = this.GetLayerX();
           this.inst.y = this.GetLayerY();
           this.inst.set_bbox_changed();
           // Trigger OnMoving
           this.runtime.trigger(cr.behaviors.Rex_Cursor.prototype.cnds.OnMoving, this.inst);
           this.pre_mouseXcanvas = this.type.mouseXcanvas;
           this.pre_mouseYcanvas = this.type.mouseYcanvas;
        }
	};
    
	behinstProto.GetLayerX = function()
	{        
        return this.inst.layer.canvasToLayer(this.type.mouseXcanvas, this.type.mouseYcanvas, true);
	};
    
	behinstProto.GetLayerY = function()
	{
        return this.inst.layer.canvasToLayer(this.type.mouseXcanvas, this.type.mouseYcanvas, false);      
    }

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
        ret.set_float( this.GetLayerX() );
	};
	
	exps.Y = function (ret)
	{
	    ret.set_float( this.GetLayerY() );
	};
	
	exps.AbsoluteX = function (ret)
	{
		ret.set_float(this.type.mouseXcanvas);
	};
	
	exps.AbsoluteY = function (ret)
	{
		ret.set_float(this.type.mouseYcanvas);
	};
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
}());