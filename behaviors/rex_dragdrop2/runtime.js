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
	};
    
	behtypeProto.TouchWrapGet = function ()
	{
        if (this.touchwrap != null)
            return this.touchwrap;
            
        assert2(cr.plugins_.rex_TouchWrap, "Drag drop behavior: Can not find touchWrap oject.");
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (inst instanceof cr.plugins_.rex_TouchWrap.prototype.Instance)
            {
                this.touchwrap = inst;
                this.GetX = cr.plugins_.rex_TouchWrap.prototype.exps.XForID;
                this.GetY = cr.plugins_.rex_TouchWrap.prototype.exps.YForID;
                this.GetAbsoluteX = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteXForID;
                this.GetAbsoluteY = cr.plugins_.rex_TouchWrap.prototype.exps.AbsoluteYForID;
                this.touchwrap.HookMe(this);
                return this.touchwrap;
            }
        }
        assert2(this.touchwrap, "Drag drop behavior: Can not find touchWrap oject.");
	};  
	
	function GetThisBehavior(inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        this.DragDetecting(touchX, touchY, touch_src);
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
		var insts = this.objtype.instances;
        var i, cnt=insts.length, inst, behavior_inst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];
		    if (!inst)
		    {
		        continue;
		        // insts might be removed
		    }			    
            behavior_inst = GetThisBehavior(inst);
            if (behavior_inst == null)
                continue;
			if ((behavior_inst.drag_info.touch_src == touch_src) && behavior_inst.drag_info.is_on_dragged)
            {
                behavior_inst.DragSrcSet(null);
			}
        }    
    };
    
	var _behavior_insts = [];
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
   
        // 1. get all valid behavior instances            
        var ovl_insts = sol.getObjects();
        var i, cnt, inst, behavior_inst;          
        cnt = ovl_insts.length;   
        _behavior_insts.length = 0;          
        for (i=0; i<cnt; i++ )
        {
		    inst = ovl_insts[i];
		    if (!inst)
		    {
		        continue;
		        // insts might be removed
		    }		    
            behavior_inst = GetThisBehavior(inst);
            if (behavior_inst == null)
                continue;
            if ((behavior_inst.enabled) && (!behavior_inst.drag_info.is_on_dragged))
                _behavior_insts.push(behavior_inst);
        }
            
        // 2. get the max z-order inst
        cnt = _behavior_insts.length;
		if (cnt == 0)  // no inst match
		{
            // recover to select_all_save
            sol.select_all = select_all_save;
            return false;  // get drag inst 
		}
        var target_inst_behavior = _behavior_insts[0];
        var instB=target_inst_behavior.inst, instA;
        for (i=1; i<cnt; i++ )
        {
            behavior_inst = _behavior_insts[i];
            instA = behavior_inst.inst;
            if ( ( instA.layer.index > instB.layer.index) ||
                 ( (instA.layer.index == instB.layer.index) && (instA.get_zindex() > instB.get_zindex()) ) )               
            {
                target_inst_behavior = behavior_inst;
                instB = instA;
            } 
        }

		target_inst_behavior.DragSrcSet(touch_src);
        // recover to select_all_save
        sol.select_all = select_all_save;
        _behavior_insts.length = 0; 
        
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
        this.enabled = (this.properties[0]==1);  
        this.move_axis = this.properties[1];  

        if (!this.recycled)
        {        	           
            this.drag_info = new DragInfoKlass(this); 
        }
        
        this.drag_info.init(this);               
	};

	behinstProto.tick = function ()
	{  
        if (!(this.enabled && this.drag_info.is_on_dragged))
            return;

        // this.enabled == 1 && this.is_on_dragged        
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
        
        this.drag_info.IsMovingSet(is_moving);
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
	
	behinstProto.DragSrcSet = function (src)
	{
	    this.drag_info.DragSrcSet(src);
	};	
	
	var DragInfoKlass = function (plugin)
	{
	    //this.init(plugin);
	};	
	var DragInfoKlassProto = DragInfoKlass.prototype;
	
	DragInfoKlassProto.init = function (plugin)
	{
	    this.plugin = plugin;
        this.touch_src = -1;
		this.pre_x = 0;
        this.pre_y = 0;
        this.drag_dx = 0;
        this.drag_dy = 0;
        this.is_on_dragged = false;
        this.drag_start_x = 0;
        this.drag_start_y = 0;
        this.inst_start_x = plugin.inst.x;
        this.inst_start_y = plugin.inst.y;
        this.is_moving = false;
	};

	DragInfoKlassProto.DragSrcSet = function(touch_src)
	{
	    if (touch_src == null)
	    {
            this.is_on_dragged = false;	
		    this.touch_src = -1; 		    
	    }
	    else
	    {
	        var inst = this.plugin.inst;       
            // !! should set these before get touchXY
            this.is_on_dragged = true;	
		    this.touch_src = touch_src;
            // !! should set these before get touchXY
            var cur_x=this.plugin.GetX(), cur_y=this.plugin.GetY();
            this.drag_dx = inst.x - cur_x;
            this.drag_dy = inst.y - cur_y;
            this.pre_x = cur_x;
            this.pre_y = cur_y;     
            this.drag_start_x = cur_x;
            this.drag_start_y = cur_y;         
            this.inst_start_x = inst.x;
            this.inst_start_y = inst.y;
        }          
        this.IsMovingSet(false); 
        
        if (touch_src == null)
        {
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, this.plugin.inst);   
        }
        else
        {
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragStart, this.plugin.inst); 
        }
	};

	DragInfoKlassProto.ForceDrop = function ()
	{
        if (this.is_on_dragged)
        {
		    this.is_on_dragged = false;            
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, this.plugin.inst); 
        }
	};
		
	DragInfoKlassProto.IsMovingSet = function(is_moving)
	{   
        if ((!this.is_moving) && is_moving)
        {
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragMoveStart, this.plugin.inst);
        }
        else if (this.is_moving && (!is_moving))
        {
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragMoveEnd, this.plugin.inst);
        }
        
        this.is_moving = is_moving;     
	};
	
	DragInfoKlassProto.DragDistance = function ()
	{
	    if (!this.is_on_dragged)
	        return 0;
	        
	    var startx = this.drag_start_x;
	    var starty = this.drag_start_y;
	    var endx = this.plugin.GetX();
	    var endy = this.plugin.GetY();
	    var d = cr.distanceTo(startx,starty,endx,endy);
	    return d;
	};
	
	DragInfoKlassProto.DragAngle = function ()
	{
	    if (!this.is_on_dragged)
	        return 0;
	        
	    var startx = this.drag_start_x;
	    var starty = this.drag_start_y;
	    var endx = this.plugin.GetX();
	    var endy = this.plugin.GetY();
	    var a = cr.angleTo(startx,starty,endx,endy);
		a = cr.to_clamped_degrees(a);
	    return a;
	};	
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.enabled };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.enabled = o["en"];
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
    
 	Cnds.prototype.IsDraggingMoving = function ()
	{   
        return this.drag_info.is_moving;
    }; 
    
 	Cnds.prototype.OnDragMoveEnd = function ()
	{   
        return true;
    };           

	Cnds.prototype.CompareDragDistance = function (cmp, s)
	{
	    if (!this.drag_info.is_on_dragged)
	        return false;
	        
		return cr.do_cmp(this.drag_info.DragDistance(), cmp, s);
	}; 

	Cnds.prototype.CompareDragAngle = function (cmp, s)
	{
	    if (!this.drag_info.is_on_dragged)
	        return false;
	        	    
		return cr.do_cmp(this.drag_info.DragAngle(), cmp, s);
	}; 
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetEnabled = function (s)
	{
		this.enabled = (s !== 0);
		
		// Got disabled: cancel any drag
	    this.drag_info.ForceDrop();
	};

	Acts.prototype.ForceDrop = function ()
	{
	    this.drag_info.ForceDrop();
	};  

	Acts.prototype.TryDrag = function ()
	{
        if (this.drag_info.is_on_dragged)  // always dragged
            return;
        
            
        if (!this.type.touchwrap.IsInTouch())       // no touched
            return;
        
        var touch_pts = this.type.touchwrap.touches;
        var cnt=touch_pts.length;            
        var i, touch_pt, tx, ty;
        var inst = this.inst;
        inst.update_bbox();        
        for (i=0; i<cnt; i++)
        {
            touch_pt = touch_pts[i];
            tx = inst.layer.canvasToLayer(touch_pt.x, touch_pt.y, true);
            ty = inst.layer.canvasToLayer(touch_pt.x, touch_pt.y, false);   		    
            if (inst.contains_pt(tx,ty))     // has touched object
            {
		        this.DragSrcSet(i);  
                break;
            }
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
		ret.set_int((this.enabled)? 1:0);
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

	Exps.prototype.InstStartX = function (ret)
	{
        ret.set_float( this.drag_info.inst_start_x );
	};
	
	Exps.prototype.InstStartY = function (ret)
	{
	    ret.set_float( this.drag_info.inst_start_y );
	};  
	
	Exps.prototype.DragDistance = function (ret)
	{
	    ret.set_float( this.drag_info.DragDistance() );
	}; 	
	
	Exps.prototype.DragAngle = function (ret)
	{
	    ret.set_float( this.drag_info.DragAngle() );
	}; 	   
}());