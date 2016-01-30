// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_DragRotate2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_DragRotate2.prototype;
		
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
        this.behavior_index = null;
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
        this.auto_rotate = (this.properties[1]==1);  

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

	Cnds.prototype.OnCanceled = function ()
	{
        return true;
	}; 
	
	Cnds.prototype.IsDragging = function ()
	{
        return (this.state == TOUCH2);
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
	    var activated = (s==1);
		if (this.activated && (!activated))
		{
		    if (this.state == TOUCH2)
		        this.drag_points.cancel();
		    this.state = (this.GetTouchCnt() >0)? INVALID:TOUCH0;			
		}
		else if ((!this.activated) && activated)
		{
		    this.state = (this.GetTouchCnt() >0)? INVALID:TOUCH0;
		}
		this.activated = activated;
	};  

	Acts.prototype.SetAutoScale = function (s)
	{
	    this.autoscale_mode = (s==1); 
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Scale = function (ret)
	{
	    ret.set_float(this.drag_points.get_scale());
	};	

	Exps.prototype.P0X = function (ret)
	{
	    ret.set_float(this.drag_points.get_P0X());
	};	

	Exps.prototype.P0Y = function (ret)
	{
	    ret.set_float(this.drag_points.get_P0Y());
	};	

	Exps.prototype.P1X = function (ret)
	{
	    ret.set_float(this.drag_points.get_P1X());
	};	

	Exps.prototype.P1Y = function (ret)
	{
	    ret.set_float(this.drag_points.get_P1Y());
	};			
}());

(function ()
{
    cr.behaviors.Rex_DragRotate2.DragPointsKlass = function(plugin)
    {       
        this.plugin = plugin;
        this.valid = false;
        this.pos_changed = false;
        this.p0 = new PointKlass();
        this.p1 = new PointKlass();
        this.start_dist = null;
    };
    var DragPointsKlassProto = cr.behaviors.Rex_DragRotate2.DragPointsKlass.prototype;
    
    DragPointsKlassProto.start_drag = function(touchid0, touchid1)
    {        
        this.valid = true;
        this.pos_changed = false;
		var p0x = this.plugin.GetX(touchid0), p0y = this.plugin.GetY(touchid0);
		var p1x = this.plugin.GetX(touchid1), p1y = this.plugin.GetY(touchid1);
		this.start_dist = cr.distanceTo(p0x, p0y, p1x, p1y);		
        this.p0.set_startxy(touchid0, p0x, p0y);
        this.p1.set_startxy(touchid1, p1x, p1y);
        this.plugin.runtime.trigger(cr.behaviors.Rex_DragRotate2.prototype.cnds.OnDragStart, this.plugin.inst);
    };
    
    DragPointsKlassProto.cancel = function()
    {        
        this.plugin.runtime.trigger(cr.behaviors.Rex_DragRotate2.prototype.cnds.OnCanceled, this.plugin.inst);
        this.valid = false;
        this.pos_changed = false;
		
        this.p0.reset();
        this.p1.reset();
    };    
    
    DragPointsKlassProto.tick = function()
    {        
        var pos_changed = false;
        pos_changed |= this.p0.set_curxy(this.plugin.GetX(this.p0.touchid), this.plugin.GetY(this.p0.touchid));
        pos_changed |= this.p1.set_curxy(this.plugin.GetX(this.p1.touchid), this.plugin.GetY(this.p1.touchid));
        
        if (pos_changed)
        {
            if (!this.pos_changed)
                this.plugin.runtime.trigger(cr.behaviors.Rex_DragRotate2.prototype.cnds.OnDragMoveStart, this.plugin.inst);
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragRotate2.prototype.cnds.OnDragMove, this.plugin.inst);
        }
        this.pos_changed = pos_changed;  
        return pos_changed;
    };
    
    DragPointsKlassProto.get_scale = function()
    {
        if (!this.valid)
            return 1;
		if (this.p0.is_at_start() && this.p1.is_at_start())
		    return 1;
        var d1 = cr.distanceTo(this.p0.cur_x, this.p0.cur_y, 
                               this.p1.cur_x, this.p1.cur_y);
        return d1/this.start_dist;
    };
        
    DragPointsKlassProto.get_P0X = function()
    {
        return this.p0.cur_x;
    };
    
    DragPointsKlassProto.get_P0Y = function()
    {
        return this.p0.cur_y;
    };   
    
    DragPointsKlassProto.get_P1X = function()
    {
        return this.p1.cur_x;
    };
    
    DragPointsKlassProto.get_P1Y = function()
    {
        return this.p1.cur_y;
    };
    

    var PointKlass = function()
    {
        this.reset();
    };    
    var PointKlassProto = PointKlass.prototype;
    
    PointKlassProto.set_startxy = function (touchid, x, y)
    {
        this.touchid = touchid;        
        this.start_x = x;
        this.start_y = y;
        this.cur_x = x;
        this.cur_y = y;		
    };
    
    PointKlassProto.set_curxy = function (x, y)
    {
        var pos_changed = (this.cur_x != x) || (this.cur_y != y);
        this.cur_x = x;
        this.cur_y = y;
        return pos_changed;
    };
    
    PointKlassProto.is_at_start = function ()
    {
        return ((this.cur_x == this.start_x) && (this.cur_y == this.start_y));
    };
	
    PointKlassProto.reset = function ()
    {
        this.touchid = null;
        this.start_x = 0;
        this.start_y = 0;
        this.cur_x = 0;
        this.cur_y = 0;
    }; 
}());