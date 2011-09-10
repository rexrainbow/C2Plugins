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
		
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
               
        this.is_mouse_moved = 0;        
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0; 
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Bind mouse events via jQuery
		jQuery(document).mousemove(
			(function (self) {
				return function(info) {
					self.onMouseMove(info);
				};
			})(this)
		);    
	};

	behinstProto.tick = function ()
	{
        if (this.is_mouse_moved == 1) {
           this.inst.x = this.mouseXcanvas;
           this.inst.y = this.mouseYcanvas;
           this.inst.set_bbox_changed();
           this.is_mouse_moved = 0;       // close update
        }
	};
    
	behinstProto.onMouseMove = function(info)
	{
		var offset = jQuery(this.runtime.canvas).offset();
        this.is_mouse_moved = 1;                       // open update
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;             
	};    

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};

}());