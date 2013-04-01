// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_DragScale2 = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_DragScale2.prototype;
		
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
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for drag scale behavior");
	};  
    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
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
        for (i=0; i<cnt; i++ )
        {
		    inst = ovl_insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
            if (behavior_inst.activated)
                behavior_inst.on_touch_start(touch_src);
        }
        
        // recover to select_all_save
        sol.select_all = select_all_save;
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
            if (behavior_inst.activated)
                behavior_inst.on_touch_end(touch_src);         
        }	    
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

    // state
    var INVALID = -1;    
    var TOUCH0 = 0;
    var TOUCH1 = 1;
    var TOUCH2 = 2;
	behinstProto.onCreate = function()
	{   
	    this.activated = (this.properties[0]==1);   
	    this.autoscale_mode = (this.properties[1]==1);            
	    this.drag_points = new cr.behaviors.Rex_DragScale2.DragPointsKlass(this);
	    this.state = (this.GetTouchCnt() >0)? INVALID:TOUCH0;
	    this.touchids = [];
		this.init_width = 0;
		this.init_height = 0;
	};
	
	behinstProto.on_touch_start = function (touchid)
	{  
	    if (this.state == TOUCH2)
	        return;
	         
        this.touchids.push(touchid);
        this.state = (this.touchids.length == 1)? TOUCH1:TOUCH2;
        if (this.state == TOUCH2)
		{		
		    this.init_width = this.inst.width;
		    this.init_height = this.inst.height;
            this.drag_points.start_drag(this.touchids[0], this.touchids[1]);			
		}
	}; 	
	
	behinstProto.on_touch_end = function (touchid)
	{
	    switch (this.state)
		{
		case TOUCH2:
		    if (touchid == this.touchids[0])
			    this.touchids.shift();
		    else if (touchid == this.touchids[1])
			    this.touchids.pop();
			if (this.touchids.length == 1)
			{
			    this.drag_points.cancel();
			    this.state = TOUCH1;				
		    }
		    break;
		case TOUCH1:
		    this.touchids.length = 0;
			this.state = (this.GetTouchCnt() >0)? INVALID:TOUCH0;
		    break;			
		}
	}; 
	
	behinstProto.auto_scale = function (has_updated)
	{  
	    if ((!this.autoscale_mode) || (!has_updated))
	        return;
			
	    var scale = this.drag_points.get_scale();	    
        this.inst.width = this.init_width * scale;
		this.inst.height = this.init_height * scale;
        this.inst.set_bbox_changed();
        this.runtime.redraw = true;
	}; 
	
	behinstProto.tick = function ()
	{  
        if (this.state != TOUCH2)
            return;
            
        var pos_changed = this.drag_points.tick();
        this.auto_scale(pos_changed);        
	}; 
	
	behinstProto.GetTouchCnt = function()
	{
        return this.type.touchwrap.touches.length;         
	};
    
	behinstProto.GetX = function(touchid)
	{
        var touch_obj = this.type.touchwrap;
		this.type.GetX.call(touch_obj, 
                            touch_obj.fake_ret, touchid, this.inst.layer.index);
        return touch_obj.fake_ret.value;          
	};
    
	behinstProto.GetY = function(touchid)
	{
        var touch_obj = this.type.touchwrap;
		this.type.GetY.call(touch_obj, 
                            touch_obj.fake_ret, touchid, this.inst.layer.index);
        return touch_obj.fake_ret.value;         
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
    cr.behaviors.Rex_DragScale2.DragPointsKlass = function(plugin)
    {       
        this.plugin = plugin;
        this.valid = false;
        this.pos_changed = false;
        this.p0 = new PointKlass();
        this.p1 = new PointKlass();
        this.start_dist = null;
    };
    var DragPointsKlassProto = cr.behaviors.Rex_DragScale2.DragPointsKlass.prototype;
    
    DragPointsKlassProto.start_drag = function(touchid0, touchid1)
    {        
        this.valid = true;
        this.pos_changed = false;
		var p0x = this.plugin.GetX(touchid0), p0y = this.plugin.GetY(touchid0);
		var p1x = this.plugin.GetX(touchid1), p1y = this.plugin.GetY(touchid1);
		this.start_dist = cr.distanceTo(p0x, p0y, p1x, p1y);		
        this.p0.set_startxy(touchid0, p0x, p0y);
        this.p1.set_startxy(touchid1, p1x, p1y);
        this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnDragStart, this.plugin.inst);
    };
    
    DragPointsKlassProto.cancel = function()
    {        
        this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnCanceled, this.plugin.inst);
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
                this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnDragMoveStart, this.plugin.inst);
            this.plugin.runtime.trigger(cr.behaviors.Rex_DragScale2.prototype.cnds.OnDragMove, this.plugin.inst);
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