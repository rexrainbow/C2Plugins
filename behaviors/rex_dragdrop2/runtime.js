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
    
    behtypeProto.OnTouchStart = function ()
    {
        this.DragDetecting(this.GetABSX(), this.GetABSY());
    };
    
    behtypeProto.OnTouchEnd = function ()
    {
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
        var i, cnt;
        var inst;            
        cnt = ovl_insts.length;   
        this._behavior_insts.length = 0;          
        for (i=0; i<cnt; i++ )
        {
            inst = ovl_insts[i].behavior_insts[this.behavior_index];
            if (inst.activated)
                this._behavior_insts.push(inst);
        }
            
        // 2. get the max z-order inst
        cnt = this._behavior_insts.length;
		
		if (cnt == 0)  // no inst match
		{
            // recover to select_all_save
            sol.select_all = select_all_save;
            return false;  // get drag inst 
		}
		
        var target_inst = this._behavior_insts[0];
        for (i=1; i<cnt; i++ )
        {
            inst = this._behavior_insts[i];
            if ( inst.inst.zindex > target_inst.inst.zindex )
                target_inst = inst;
        }
        target_inst.drag_info.is_on_drag = true;
        var inst_x = target_inst.inst.x;
        var inst_y = target_inst.inst.y;
        target_inst.drag_info.drag_dx = inst_x - x;
        target_inst.drag_info.drag_dy = inst_y - y;
        this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragStart, target_inst.inst);     

        // recover to select_all_save
        sol.select_all = select_all_save;
        this._behavior_insts.length = 0; 
        
        return true;  // get drag inst  
	}; 
        
    // export     
	behtypeProto.GetABSX = function ()
	{
        return this.touchwrap.GetAbsoluteX();
	};  

	behtypeProto.GetABSY = function ()
	{
        return this.touchwrap.GetAbsoluteY();
	};     
        
	behtypeProto.GetLayerX = function(inst)
	{
        return this.touchwrap.GetX(inst.layer);
	};
    
	behtypeProto.GetLayerY = function(inst)
	{
        return this.touchwrap.GetY(inst.layer);
	};  
        
	behtypeProto._is_release = function()
	{
        return (!this.touchwrap.IsInTouch());
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
        this.move_axis = this.properties[1];  
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
        this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDragging, inst);
                                
        if ( this.type._is_release() )
        {
            this.drag_info.is_on_drag = false;
            this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, inst); 
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
            this.runtime.trigger(cr.behaviors.Rex_DragDrop2.prototype.cnds.OnDrop, this.inst); 
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