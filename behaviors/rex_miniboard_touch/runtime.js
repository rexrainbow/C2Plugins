// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_miniboard_touch = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_miniboard_touch.prototype;
		
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
        this._touched_miniboard_insts = [];
        this._behavior_insts = [];
        this.board_types = [];
	};
	
	behtypeProto.BoardTypeGet = function ()
	{	   
	    if ( (this.board_types.length != 0) || (!cr.plugins_.Rex_SLGBoard) )
	        return;
	    
        var plugins = this.runtime.types, name, plugin;
        for (name in plugins)
        {            
            plugin = plugins[name];
            if (plugin instanceof cr.plugins_.Rex_SLGBoard.prototype.Type)
                this.board_types.push(plugin);
        }
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
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
	}; 
    
    behtypeProto._touched_miniboard_get = function (touchX, touchY)
    {
        var miniboard_insts = this.objtype.instances;
        this._touched_miniboard_insts.length = 0;
        var i, miniboard_cnt=miniboard_insts.length, miniboard_inst;
        var j, chess_insts, chess_uid, chess_inst;
        var tx,ty;
        for (i=0; i<miniboard_cnt; i++)
        {
            miniboard_inst = miniboard_insts[i];
			if (miniboard_inst.behavior_insts[this.behavior_index].IsInTouch(touchX, touchY))
			    this._touched_miniboard_insts.push(miniboard_inst);            
        }
        return this._touched_miniboard_insts;
    };
    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        // 0. find out index of behavior instance
        if (this.behavior_index == null )
            this.behavior_index = this.objtype.getBehaviorIndexByName(this.name);
			
        var touched_miniboard_insts = this._touched_miniboard_get(touchX, touchY);
        if (touched_miniboard_insts.length == 0)
            return;
        
        // overlap_cnt > 0                      
        // 1. get all valid behavior instances
        var i, cnt=touched_miniboard_insts.length, miniboard_inst, behavior_inst;
        this._behavior_insts.length = 0;          
        for (i=0; i<cnt; i++ )
        {
		    miniboard_inst = touched_miniboard_insts[i];
            behavior_inst = miniboard_inst.behavior_insts[this.behavior_index];
            if ((behavior_inst.activated) && (!behavior_inst.drag_info.is_on_dragged))
                this._behavior_insts.push(behavior_inst);
        }
            
        // 2. get the max z-order inst
        cnt = this._behavior_insts.length;
		if (cnt == 0)  // no inst match
            return;
            
        var target_inst_behavior = this._behavior_insts[0];
        for (i=1; i<cnt; i++ )
        {
            behavior_inst = this._behavior_insts[i];
            if ( behavior_inst.inst.zindex > target_inst_behavior.inst.zindex )
                target_inst_behavior = behavior_inst;
        }
        
		target_inst_behavior.DragInfoSet(touch_src);
        this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDragStart, target_inst_behavior.inst); 

        this._touched_miniboard_insts.length = 0;        
        this._behavior_insts.length = 0; 
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
				this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDrop, inst); 
			}
        }      
    };  
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;    

        type.TouchWrapGet(); 
        type.BoardTypeGet();          
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
	    this.activated = (this.properties[0] == 1);    
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
                          is_moved:false,
                          mainboard_inst:null,
                          mainboard_lx:(-1),
                          mainboard_ly:(-1)};	     
	};

	behinstProto.tick = function ()
	{  
        if (!(this.activated && this.drag_info.is_on_dragged))
            return;

        // this.activated == 1 && this.is_on_dragged        
        var inst=this.inst;
        var inst_OX, inst_OY;
        var drag_info=this.drag_info;
        var cur_x=this.GetX();
        var cur_y=this.GetY();
        var is_moving = (drag_info.pre_x != cur_x) ||
                        (drag_info.pre_y != cur_y);      
        if ( is_moving )
        {
            var touched_board = this._touched_board_get(cur_x, cur_y);
            drag_info.mainboard_inst = touched_board;
            inst_OX = cur_x + drag_info.drag_dx;
            inst_OY = cur_y + drag_info.drag_dy;
            var lx_save=drag_info.mainboard_lx, ly_save=drag_info.mainboard_ly;
            if (touched_board == null)
            {
                drag_info.mainboard_lx = (-1);
                drag_info.mainboard_ly = (-1);
                inst.x = inst_OX;
                inst.y = inst_OY;
                inst.set_bbox_changed();
            }
            else
            {
	            var lx = touched_board.layout.PXY2LX(inst_OX, inst_OY);
	            var ly = touched_board.layout.PXY2LY(inst_OX, inst_OY);
                lx = cr.clamp(Math.round(lx), 0, touched_board.x_max);
                ly = cr.clamp(Math.round(ly), 0, touched_board.y_max);
                if ((drag_info.mainboard_lx != lx) || (drag_info.mainboard_ly != ly))
                {
                    inst.x = touched_board.layout.LXYZ2PX(lx,ly,0);
                    inst.y = touched_board.layout.LXYZ2PY(lx,ly,0);
                    drag_info.mainboard_lx = lx;
                    drag_info.mainboard_ly = ly;
                    inst.set_bbox_changed();
                }
            }
            
            if ((drag_info.mainboard_lx != lx_save) || (drag_info.mainboard_ly != ly_save))
                this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnLogicIndexChanged, inst); 
                
            drag_info.pre_x = cur_x;
            drag_info.pre_y = cur_y;                    
        }
	};  

	behinstProto._touched_board_get = function(px, py)
	{
	    var board_types = this.type.board_types;
	    var cnt=board_types.length;
	    if (cnt == 0)
	        return null;
	        
	    var i, boards, board;
	    var j, inst_cnt, boards, board;
	    var is_on_board;
	    for (i=0; i<cnt; i++)
	    {	        
	        boards = board_types[i].instances;
	        inst_cnt = boards.length;
	        for (j=0; j<inst_cnt; j++)
	        {
	            board = boards[j];
	            if (board.point_is_in_board(px, py))
	                return board; 
	        }
	    }
	    return null;
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
        
        var touched_board = this._touched_board_get(cur_x, cur_y);
        drag_info.mainboard_inst = touched_board;
        var lx_save=drag_info.mainboard_lx, ly_save=drag_info.mainboard_ly;
        if (touched_board == null)
        {
            drag_info.mainboard_lx = (-1);
            drag_info.mainboard_ly = (-1);        
        }
        else
        {
	        drag_info.mainboard_lx = touched_board.layout.PXY2LX(inst.x, inst.y);
	        drag_info.mainboard_ly = touched_board.layout.PXY2LY(inst.x, inst.y);                   
        }
        
        if ((drag_info.mainboard_lx != lx_save) || (drag_info.mainboard_ly != ly_save))
            this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnLogicIndexChanged, inst);         
	};
	
	behinstProto.IsInTouch = function(touchX, touchY)
	{
        var miniboard_inst = this.inst;
        var uids = miniboard_inst.items;
        assert2(uids, "(Mini board) Touch Ctrl behavior only could be used with mini board instance.");
		var uid, inst;
		var tx, ty;
        for (uid in uids)
        {
            inst = miniboard_inst.uid2inst(uid);
			inst.update_bbox();
			tx = inst.layer.canvasToLayer(touchX, touchY, true);
			ty = inst.layer.canvasToLayer(touchX, touchY, false);                
            if (inst.contains_pt(tx,ty))
            {
                this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnTouched, miniboard_inst);
                return true;
            }
        }
		return false;
	};	
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];
	};		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.OnTouchStart = function ()
	{
        return true;
	};
    
	Cnds.prototype.OnDragStart = function ()
	{
        return true;
	};
    
	Cnds.prototype.OnDrop = function ()
	{
        return true;
	};    
    
	Cnds.prototype.OnLogicIndexChanged = function ()
	{
        return true;
	};	
    
	Cnds.prototype.IsDragable = function ()
	{
        return this.activated;
	};		
    
	Cnds.prototype.IsTouching = function ()
	{
		var touch_pts = this.type.touchwrap.touches, touch_pt, tx, ty;
		var i, cnt=touch_pts.length;
		for (i=0; i<cnt; i++)
		{
		    touch_pt = touch_pts[i];
			tx = touch_pt.x;
			ty = touch_pt.y;
			if (this.IsInTouch(tx, ty))
			    return true;
		}
        return false;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetDragable = function (en)
	{
		this.activated = (en == 1);
	}; 

	Acts.prototype.ForceDrop = function ()
	{
        if (this.drag_info.is_on_dragged)
        {
		    this.drag_info.is_on_dragged = false;            
            this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDrop, this.inst); 
        }
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.LX = function (ret)
	{
	    ret.set_int(this.drag_info.mainboard_lx);
	};
	Exps.prototype.LY = function (ret)
    {
	    ret.set_int(this.drag_info.mainboard_ly);
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