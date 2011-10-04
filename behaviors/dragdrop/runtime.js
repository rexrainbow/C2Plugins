// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.MyDragDrop = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.MyDragDrop.prototype;
		
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
        
		jQuery(document).mousemove(
			(function (self) {
				return function(info) {
					self.onMouseMove(info);
				};
			})(this)
		);   

        this.behavior_index = null;
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;
		this.triggerButton = { btn:0, press:false };
	};
    
	behtypeProto.onMouseDown = function(info)
	{
        this.triggerButton.btn = info.which - 1;	// 1-based 
        this.triggerButton.press = true;

		var mx = this.mouseXcanvas;
		var my = this.mouseYcanvas;
        var sol = this.objtype.getCurrentSol();        
        sol.select_all = true;
        var overlap_cnt = this.runtime.testAndSelectCanvasPointOverlap(this.objtype, mx, my, false);
        if (overlap_cnt == 0)
        {
            return;
        }
        
        // overlap_cnt > 0
        var ovl_insts = sol.getObjects();
        var behavior_insts;
        var i, cnt;
        var inst;

        // 0. find out index of behavior instance
        if (this.behavior_index == null )
        {
            behavior_insts = ovl_insts[0].behavior_insts;
            cnt = behavior_insts.length;
            for (i=0; i<cnt; i++ )
            {
                if (behavior_insts[i].type === this)
                {
                    this.behavior_index = i;
                    break;
                }
            }
        }
            
        cnt = ovl_insts.length;             
        behavior_insts = [];            
        // 1. get all valid behavior instances
        for (i=0; i<cnt; i++ )
        {
            inst = ovl_insts[i].behavior_insts[this.behavior_index];
            if ( inst.activated &&
                 (inst.dragButton == this.triggerButton.btn) )
            {
                behavior_insts.push(inst);
            }
        }
            
        // 2. get the max z-order inst
        cnt = behavior_insts.length;
        var target_inst = behavior_insts[0];
        for (i=1; i<cnt; i++ )
        {
            inst = behavior_insts[i];
            if ( inst.inst.zindex > target_inst.inst.zindex )
            {
                target_inst = inst;
            }
        }
        target_inst.is_on_drag = true;
        this.runtime.trigger(cr.behaviors.MyDragDrop.prototype.cnds.OnDragStart, target_inst.inst);     
        
	};

	behtypeProto.onMouseUp = function(info)
	{
        this.triggerButton.btn = info.which - 1;	// 1-based 
        this.triggerButton.press = false;
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
        this.is_on_drag = false;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = this.properties[0]; 
        this.dragButton = this.properties[1]; 
        this.move_axis = this.properties[2];  
	};

	behinstProto.tick = function ()
	{        
        if ( (this.activated == 0) ||
             (!this.is_on_drag)      )
        {
            return;        
        }
        
        // this.activated == 1 && this.is_on_drag
        var is_mouse_moved = (this.pre_mouseXcanvas != this.type.mouseXcanvas) ||
                             (this.pre_mouseYcanvas != this.type.mouseYcanvas);      
        if ( is_mouse_moved )
        {
            switch (this.move_axis)
            {
                case 1:
                    this.inst.x = this.GetLayerX();
                    break;
                case 2:
                    this.inst.y = this.GetLayerY();
                    break;
                default:
                    this.inst.x = this.GetLayerX();
                    this.inst.y = this.GetLayerY();
                    break;
            }
            this.inst.set_bbox_changed();
            this.pre_mouseXcanvas = this.type.mouseXcanvas;
            this.pre_mouseYcanvas = this.type.mouseYcanvas;                    
        }
        this.runtime.trigger(cr.behaviors.MyDragDrop.prototype.cnds.OnDragging, this.inst);
                                
        if ( (!this.type.triggerButton.press) && 
             (this.type.triggerButton.btn == this.dragButton) )
        {
            this.is_on_drag = false;
            this.runtime.trigger(cr.behaviors.MyDragDrop.prototype.cnds.OnDrop, this.inst); 
        }
	};
        
	behinstProto.GetLayerX = function()
	{
        return this.inst.layer.canvasToLayerX(this.type.mouseXcanvas);
	};
    
	behinstProto.GetLayerY = function()
	{
        return this.inst.layer.canvasToLayerY(this.type.mouseYcanvas);       
    }    
    

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;    
    
	cnds.OnDragStart = function ()
	{
        return true;
	};
    
	cnds.OnDrop = function ()
	{
		return true;
	}; 

 	cnds.OnDragging = function ()
	{   
        return true;
    }
    
 	cnds.IsDragging = function ()
	{   
        return (this.is_on_drag);
    }    
    
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