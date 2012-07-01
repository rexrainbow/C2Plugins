// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_DragDrop = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_DragDrop.prototype;
		
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
		this.curTouchX = 0;
		this.curTouchY = 0;      
    
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
		this.triggerButton = { btn:0, press:false };
        
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;    
        
        // touch
		this.touches = [];
        this.is_on_touch = false;
        
        // control
        this.trigger_source = 1;  // 0=touch, 1=mouse            
	};
    
	behtypeProto.onMouseDown = function(info)
	{
        this.trigger_source = 1;    
        this.triggerButton.btn = info.which - 1;	// 1-based 
        this.triggerButton.press = true;

        this.DragDetecting(this.mouseXcanvas, this.mouseYcanvas);
	};  

	behtypeProto.onMouseUp = function(info)
	{
        this.trigger_source = 1;    
        this.triggerButton.btn = info.which - 1;	// 1-based 
        this.triggerButton.press = false;
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
		var is_get_drag_inst;
        
		if (info.changedTouches)
		{
			var i, len;
			for (i = 0, len = info.changedTouches.length; i < len; i++)
			{
				var touch = info.changedTouches[i];
				
				this.curTouchX = touch.pageX - offset.left;
				this.curTouchY = touch.pageY - offset.top;
                
                is_get_drag_inst = this.DragDetecting(this.curTouchX, this.curTouchY);
                if (is_get_drag_inst)
                    break;
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
	};    
    
    // drag detecting
	behtypeProto.DragDetecting = function(x, y)
	{
        var sol = this.objtype.getCurrentSol(); 
        var select_all_save = sol.select_all;
        sol.select_all = true;
        var overlap_cnt = this.runtime.testAndSelectCanvasPointOverlap(this.objtype, x, y, false);
        if (overlap_cnt == 0)
        {
            // recover to select_all_save
            sol.select_all = select_all_save;        
            return false;
        }
        
        // overlap_cnt > 0
        // 0. find out index of behavior instance
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
            
        // 1. get all valid behavior instances            
        var ovl_insts = sol.getObjects();
        var behavior_insts;
        var i, cnt;
        var inst;            
        cnt = ovl_insts.length;             
        behavior_insts = [];            
        for (i=0; i<cnt; i++ )
        {
            inst = ovl_insts[i].behavior_insts[this.behavior_index];
            if ( inst.activated &&
                 ( (this.trigger_source == 0) ||
                   (inst.dragButton == this.triggerButton.btn) ) 
               )
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
        target_inst.drag_info.is_on_drag = true;
        var inst_x = target_inst.inst.x;
        var inst_y = target_inst.inst.y;
        target_inst.drag_info.drag_dx = inst_x - x;
        target_inst.drag_info.drag_dy = inst_y - y;
        this.runtime.trigger(cr.behaviors.Rex_DragDrop.prototype.cnds.OnDragStart, target_inst.inst);     

        // recover to select_all_save
        sol.select_all = select_all_save;
        
        return true;  // get drag inst
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
		    if (this.touches.length)
                ret_x = this.touches[0].x;
		    else
                ret_x = 0;        
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
		    if (this.touches.length)
                ret_y = this.touches[0].y;
		    else
                ret_x = 0;        
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
    
	behtypeProto._is_release = function(dragButton)
	{
        var is_drop;
        if (this.trigger_source == 1)  // mouse
        {    
             is_drop = (!this.triggerButton.press) && 
                       (this.triggerButton.btn == dragButton) ;          
        }
        else
        {
             //is_drop = (this.touches.length==0);        
             is_drop = (!this.is_on_touch);
        }
        return is_drop;
	};    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
        this.drag_info = {pre_x:this.type.GetLayerX(inst),
                          pre_y:this.type.GetLayerY(inst),
                          drag_dx:0,
                          drag_dy:0,
                          is_on_drag:false};                       
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
             (!this.drag_info.is_on_drag)      )
        {
            return;        
        }
        
        // this.activated == 1 && this.is_on_drag        
        var inst = this.inst;
        var cur_x = this.type.GetLayerX(inst);
        var cur_y = this.type.GetLayerY(inst);
        var is_mouse_moved = (this.drag_info.pre_x != cur_x) ||
                             (this.drag_info.pre_y != cur_y);      
        if ( is_mouse_moved )
        {
            var drag_x = cur_x + this.drag_info.drag_dx;
            var drag_y = cur_y + this.drag_info.drag_dy;
            switch (this.move_axis)
            {
                case 1:
                    inst.x = drag_x;
                    break;
                case 2:
                    inst.y = drag_y;
                    break;
                default:
                    inst.x = drag_x;
                    inst.y = drag_y;
                    break;
            }
            inst.set_bbox_changed();
            this.drag_info.pre_x = cur_x;
            this.drag_info.pre_y = cur_y;                    
        }
        this.runtime.trigger(cr.behaviors.Rex_DragDrop.prototype.cnds.OnDragging, inst);
                                
        if ( this.type._is_release(this.dragButton) )
        {
            this.drag_info.is_on_drag = false;
            this.runtime.trigger(cr.behaviors.Rex_DragDrop.prototype.cnds.OnDrop, inst); 
        }
	};    

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();    
    
	Cnds.prototype.OnDragStart = function ()
	{
        return true;
	};
    
	Cnds.prototype.OnDrop = function ()
	{
		return true;
	}; 

 	Cnds.prototype.OnDragging = function ()
	{   
        return true;
    }
    
 	Cnds.prototype.IsDragging = function ()
	{   
        return (this.is_on_drag);
    }    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = s;
	};  

	Acts.prototype.ForceDropp = function ()
	{
        if (this.drag_info.is_on_drag)
        {
		    this.drag_info.is_on_drag = false;            
            this.runtime.trigger(cr.behaviors.Rex_DragDrop.prototype.cnds.OnDrop, this.inst); 
        }
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.X = function (ret)
	{
        ret.set_float( this.type.GetLayerX(this.inst) );
	};
	
	Exps.prototype.Y = function (ret)
	{
	    ret.set_float( this.type.GetLayerY(this.inst) );
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
        ret.set_float( this.type.GetABSX(this.inst) );
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
        ret.set_float( this.type.GetABSY(this.inst) );
	};
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
}());