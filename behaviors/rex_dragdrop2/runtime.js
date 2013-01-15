// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_DragDrop2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_DragDrop2.prototype;
		
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
        this.touchwrap = null;
        this.GetX = null;
        this.GetY = null;
        this.GetAbsoluteX = null;
        this.GetAbsoluteY = null;
        this.behavior_index = null;
        this._behavior_insts = [];
	};
    
	behtypeProto.TouchWrapGet = function ()
	{
        if (this.touchwrap != null)
            return;
            
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP"))
            {
                this.touchwrap = obj;
                this.GetX = cr.plugins_.rex_TouchWrap.prototype.exps.XForID;
                this.GetY = cr.plugins_.rex_TouchWrap.prototype.exps.YForID;
                this.GetAbsoluteX = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteXForID;
                this.GetAbsoluteY = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteYForID;
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	};  
    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        this.DragDetecting(touchX, touchY, touch_src);
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
        if (this.behavior_index == null )
            return;

		var insts = this.objtype.instances;
        var i, cnt=insts.length, inst, behavior_inst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
			if ((behavior_inst.drag_info.touch_src == touch_src) && behavior_inst.drag_info.is_on_dragged)
            {
			    behavior_inst.drag_info.is_on_dragged = false;
				this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, inst); 
			}
        }    
    };
    
    // drag detecting
	behtypeProto.DragDetecting = function(touchX, touchY, touch_src)
	{
        var sol = this.objtype.getCurrentSol(); 
        var select_all_save = sol.select_all;
        sol.select_all = true;
        var overlap_cnt = this.runtime.testAndSelectCanvasPointOverlap(this.objtype, touchX, touchY, false);
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
        var i, cnt, inst, behavior_inst;          
        cnt = ovl_insts.length;   
        this._behavior_insts.length = 0;          
        for (i=0; i<cnt; i++ )
        {
		    inst = ovl_insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
            if ((behavior_inst.activated) && (!behavior_inst.drag_info.is_on_dragged))
                this._behavior_insts.push(behavior_inst);
        }
            
        // 2. get the max z-order inst
        cnt = this._behavior_insts.length;
		if (cnt == 0)  // no inst match
		{
            // recover to select_all_save
            sol.select_all = select_all_save;
            return false;  // get drag inst 
		}
        var target_inst_behavior = this._behavior_insts[0];
        for (i=1; i<cnt; i++ )
        {
            behavior_inst = this._behavior_insts[i];
            if ( behavior_inst.inst.zindex > target_inst_behavior.inst.zindex )
                target_inst_behavior = behavior_inst;
        }

		target_inst_behavior.DragInfoSet(touch_src);
        this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragStart, target_inst_behavior.inst);     

        // recover to select_all_save
        sol.select_all = select_all_save;
        this._behavior_insts.length = 0; 
        
        return true;  // get drag inst  
	}; 
         
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
        
        type.TouchWrapGet();            
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = (this.properties[0]==1);  
        this.move_axis = this.properties[1];  
        this.drag_info = {touch_src:-1,
		                  pre_x:0,
                          pre_y:0,
                          drag_dx:0,
                          drag_dy:0,
                          is_on_dragged:false,
                          drag_start_x:0,
                          drag_start_y:0,
                          inst_start_x:0,
                          inst_start_y:0,
                          is_moved:false};        
	};

	behinstProto.tick = function ()
	{  
        if (!(this.activated && this.drag_info.is_on_dragged))
            return;

        // this.activated == 1 && this.is_on_dragged        
        var inst=this.inst;
        var drag_info=this.drag_info;
        var cur_x=this.GetX();
        var cur_y=this.GetY();
        var is_moving = (drag_info.pre_x != cur_x) ||
                        (drag_info.pre_y != cur_y);      
        if ( is_moving )
        {
            var drag_x = cur_x + drag_info.drag_dx;
            var drag_y = cur_y + drag_info.drag_dy;
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
            drag_info.pre_x = cur_x;
            drag_info.pre_y = cur_y;                    
        }
        if ( (!drag_info.is_moved) &&
             ((cur_x != drag_info.drag_start_x) || (cur_y != drag_info.drag_start_y)) )
        {
            drag_info.is_moved = true;
            this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragMoveStart, this.inst);
        }
        if ( is_moving )
            this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragMove, this.inst);
	};   
 
	behinstProto.GetABSX = function ()
	{
	    if (!this.drag_info.is_on_dragged)
	        return 0;
	    
        var touch_obj = this.type.touchwrap;
        this.type.GetAbsoluteX.call(touch_obj, 
                                    touch_obj.fake_ret, this.drag_info.touch_src);
        return touch_obj.fake_ret.value;
	};  

	behinstProto.GetABSY = function ()
	{
	    if (!this.drag_info.is_on_dragged)
	        return 0;
	    
        var touch_obj = this.type.touchwrap;
        this.type.GetAbsoluteY.call(touch_obj, 
                                    touch_obj.fake_ret, this.drag_info.touch_src);
        return touch_obj.fake_ret.value;        
	};     
        
	behinstProto.GetX = function()
	{
	    if (!this.drag_info.is_on_dragged)
	        return 0;
	    
        var touch_obj = this.type.touchwrap;
        this.type.GetX.call(touch_obj, 
                            touch_obj.fake_ret, this.drag_info.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.GetY = function()
	{
	    if (!this.drag_info.is_on_dragged)
	        return 0;
	    
        var touch_obj = this.type.touchwrap;
        this.type.GetY.call(touch_obj, 
                            touch_obj.fake_ret, this.drag_info.touch_src, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
	};  

	behinstProto.DragInfoSet = function(touch_src)
	{
	    var inst = this.inst;
        var drag_info=this.drag_info;        
        // !! should set these before get touchXY
        drag_info.is_on_dragged = true;	
		drag_info.touch_src = touch_src;
        // !! should set these before get touchXY
        var cur_x=this.GetX(), cur_y=this.GetY();
        drag_info.drag_dx = inst.x - cur_x;
        drag_info.drag_dy = inst.y - cur_y;
        drag_info.pre_x = cur_x;
        drag_info.pre_y = cur_y;     
        drag_info.drag_start_x = cur_x;
        drag_info.drag_start_y = cur_y;         
        drag_info.inst_start_x = inst.x;
        drag_info.inst_start_y = inst.y;   
        drag_info.is_moved = false;      
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
    };
    
 	Cnds.prototype.IsDragging = function ()
	{   
        return this.drag_info.is_on_dragged;
    };   

 	Cnds.prototype.OnDragMoveStart = function ()
	{   
        return true;
    }; 

 	Cnds.prototype.OnDragMove = function ()
	{   
        return true;
    };     
       
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};  

	Acts.prototype.ForceDrop = function ()
	{
        if (this.drag_info.is_on_dragged)
        {
		    this.drag_info.is_on_dragged = false;            
            this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, this.inst); 
        }
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.X = function (ret)
	{
        ret.set_float( this.GetX() );
	};
	
	Exps.prototype.Y = function (ret)
	{
	    ret.set_float( this.GetY() );
	};
	
	Exps.prototype.AbsoluteX = function (ret)
	{
        ret.set_float( this.GetABSX() );
	};
	
	Exps.prototype.AbsoluteY = function (ret)
	{
        ret.set_float( this.GetABSY() );
	};
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};  

	Exps.prototype.StartX = function (ret)
	{
        ret.set_float( this.drag_info.inst_start_x );
	};
	
	Exps.prototype.StartY = function (ret)
	{
	    ret.set_float( this.drag_info.inst_start_y );
	}; 

	Exps.prototype.DragStartX = function (ret)
	{
        ret.set_float( this.drag_info.drag_start_x );
	};
	
	Exps.prototype.DragStartY = function (ret)
	{
	    ret.set_float( this.drag_info.drag_start_y );
	}; 
    
}());