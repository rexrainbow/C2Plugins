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
                this.touchwrap.HookMe(this);
                break;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	};  
    
    behtypeProto.OnTouchStart = function (_NthTouch, _TouchX, _TouchY)
    {
        this.DragDetecting(_TouchX, _TouchY, _NthTouch);
    };
    
    behtypeProto.OnTouchEnd = function (_NthTouch)
    {
        if (this.behavior_index == null )
            return;
			
	    var sol = this.objtype.getCurrentSol();
        var select_all_save = sol.select_all;	
		sol.select_all = true;
		var insts = sol.getObjects();
        var i, cnt=insts.length, inst, behavior_inst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];
            behavior_inst = inst.behavior_insts[this.behavior_index];
			if ((behavior_inst.drag_info.touch_src == _NthTouch) && behavior_inst.drag_info.is_on_dragged)
            {
			    behavior_inst.drag_info.is_on_dragged = false;
				this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, inst); 
			}
        }	
		sol.select_all = select_all_save;     
    };
    
    // drag detecting
	behtypeProto.DragDetecting = function(x, y, touch_src)
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
		inst = target_inst_behavior.inst;
        var cur_x=target_inst_behavior.GetX(), cur_y=target_inst_behavior.GetY();
        var drag_info=target_inst_behavior.drag_info;
        drag_info.is_on_dragged = true;	
		drag_info.touch_src = touch_src;
        drag_info.drag_dx = inst.x - cur_x;
        drag_info.drag_dy = inst.y - cur_y;
        drag_info.pre_x = cur_x;
        drag_info.pre_y = cur_y;          
        drag_info.start_x = inst.x;
        drag_info.start_y = inst.y;   
        drag_info.is_moved = false;
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
        this.drag_info = {touch_src:-1,
		                  pre_x:null,
                          pre_y:null,
                          drag_dx:0,
                          drag_dy:0,
                          is_on_dragged:false,
                          start_x:null,
                          start_y:null,                          
                          is_moved:false};                       
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{   
        this.activated = (this.properties[0]==1);  
        this.move_axis = this.properties[1];  
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
        var is_moved = (drag_info.pre_x != cur_x) ||
                       (drag_info.pre_y != cur_y);      
        if ( is_moved )
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
             ((cur_x != drag_info.start_x) || (cur_y != drag_info.start_y)) )
        {
            drag_info.is_moved = true;
            this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragMove, this.inst);
        }
	};   
	 
    // export     
	behinstProto.GetABSX = function ()
	{
	    var ret;
	    if (this.drag_info.is_on_dragged)
	        ret = this.type.touchwrap.GetAbsoluteXAt(this.drag_info.touch_src);
	    else
	        ret = this.type.touchwrap.GetAbsoluteX();
        return ret;
	};  

	behinstProto.GetABSY = function ()
	{
	    var ret;
	    if (this.drag_info.is_on_dragged)
	        ret = this.type.touchwrap.GetAbsoluteYAt(this.drag_info.touch_src);
	    else
	        ret = this.type.touchwrap.GetAbsoluteY();
        return ret;
	};     
        
	behinstProto.GetX = function()
	{
	    var ret;
	    if (this.drag_info.is_on_dragged)
	        ret = this.type.touchwrap.GetXAt(this.drag_info.touch_src, this.inst.layer);
	    else
	        ret = this.type.touchwrap.GetX(this.inst.layer);	    
        return ret;
	};
    
	behinstProto.GetY = function()
	{
	    var ret;
	    if (this.drag_info.is_on_dragged)
	        ret = this.type.touchwrap.GetYAt(this.drag_info.touch_src, this.inst.layer);
	    else
	        ret = this.type.touchwrap.GetY(this.inst.layer);	    
        return ret;
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

	Acts.prototype.ForceDropp = function ()
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
        ret.set_float( this.drag_info.start_x );
	};
	
	Exps.prototype.StartY = function (ret)
	{
	    ret.set_float( this.drag_info.start_y );
	};    
}());