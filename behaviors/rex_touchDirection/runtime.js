// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_TouchDirection = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_TouchDirection.prototype;
		
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

        this.MovingStart(this.mouseXcanvas, this.mouseYcanvas);
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
            var touch = info.changedTouches[0];
			this.curTouchX = touch.pageX - offset.left;
			this.curTouchY = touch.pageY - offset.top;
            this.MovingStart(this.curTouchX, this.curTouchY);
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
	behtypeProto.MovingStart = function(x, y)
	{    
        // 0. find out index of behavior instance
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
            
        var insts = this.objtype.instances;      
        var i, cnt;
        var inst;  
        
        cnt = insts.length; 
        for (i=0; i<cnt; i++ )
        {
            inst = insts[i].behavior_insts[this.behavior_index];
            if ( (this.trigger_source == 0) ||
                 (inst.mouse_buton == this.triggerButton.btn) ) 
               )
            {
                inst.is_on_moving = true;
                inst.pre_x = x;
                inst.pre_y = y;      
                this.runtime.trigger(cr.behaviors.Rex_TouchDirection.prototype.cnds.OnMoveStart, inst.inst); 
            }
        }
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
        return inst.layer.canvasToLayerX(this.GetABSX());
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        return inst.layer.canvasToLayerY(this.GetABSY());
	};
    
	behtypeProto._is_release = function(mouse_buton)
	{
        var is_drop;
        if (this.trigger_source == 1)  // mouse
        {    
             is_drop = (!this.triggerButton.press) && 
                       (this.triggerButton.btn == mouse_buton) ;          
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
        
		this.pre_x = 0;
		this.pre_y = 0;           
        this.is_on_moving = false;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = this.properties[0]; 
        this.mouse_buton = this.properties[1]; 
        this.move_axis = this.properties[2]; 
        this.move_proportion = this.properties[3];
	};

	behinstProto.tick = function ()
	{        
        if ( (this.activated == 0) ||
             (!this.is_on_moving)      )
        {
            return;        
        }
        
        // this.activated == 1 && this.is_on_moving        
        var inst = this.inst;
        var cur_x = this.type.GetABSX();
        var cur_y = this.type.GetABSY();
        var dx = cur_x - this.pre_x;
        var dy = cur_y - this.pre_y;             
        if ( (dx!=0) || (dy!=0) )
        {
            switch (this.move_axis)
            {
                case 1:
                    inst.x += (this.move_proportion * dx);
                    break;
                case 2:
                    inst.y += (this.move_proportion * dy);
                    break;
                default:
                    inst.x += (this.move_proportion * dx);
                    inst.y += (this.move_proportion * dy);
                    break;
            }
            inst.set_bbox_changed();
            this.pre_x = cur_x;
            this.pre_y = cur_y;                    
        }
        this.runtime.trigger(cr.behaviors.Rex_TouchDirection.prototype.cnds.OnMoving, inst);
                                
        if ( this.type._is_release(this.mouse_buton) )
        {
            this.is_on_moving = false;
            this.runtime.trigger(cr.behaviors.Rex_TouchDirection.prototype.cnds.OnMoveStop, inst); 
        }
	};    

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;    
    
	cnds.OnMoveStart = function ()
	{
        return true;
	};
    
	cnds.OnMoveStop = function ()
	{
		return true;
	}; 

 	cnds.OnMoving = function ()
	{   
        return true;
    }
    
 	cnds.IsMoving = function ()
	{   
        return (this.is_on_moving);
    }    
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
        if ( (this.activated==0) && 
             this.is_on_moving &&
             (s==1)
           )
        {
            this.pre_x = this.type.GetABSX();
            this.pre_y = this.type.GetABSY();
        }
		this.activated = s;
	}; 

	acts.SetProportion = function (s)
	{
		this.move_proportion = s;
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
    
	exps.Proportion = function (ret)
	{
		ret.set_float(this.move_proportion);
	}; 
    
}());