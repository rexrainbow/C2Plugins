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
            return this.touchwrap;
            
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "TOUCHWRAP"))
            {
                this.touchwrap = obj;
                this.touchwrap.HookMe(this);
                return this.touchwrap;
            }
        }
        assert2(this.touchwrap, "You need put a Touchwrap object for Cursor behavior");
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
    
    var binsts = [];    
    behtypeProto.touched_binst_get = function (touchX, touchY)
    {
        var miniboard_insts = this.objtype.instances;
        var i, miniboard_cnt=miniboard_insts.length, binst;
        var j, chess_insts, chess_uid, chess_inst;
        binsts.length = 0;        
        for (i=0; i<miniboard_cnt; i++)
        {
            binst = GetThisBehavior(miniboard_insts[i]);
            if (binst.activated && 
                (!binst.drag_info.is_on_dragged) &&
                binst.IsInTouch(touchX, touchY))
			{
			    binsts.push(binst);            
			}
        }
        return binsts;
    };
    
    behtypeProto.OnTouchStart = function (touch_src, touchX, touchY)
    {
        // 0. find out index of behavior instance

        // overlap_cnt > 0                      
        // 1. get all valid behavior instances
        var touched_binsts = this.touched_binst_get(touchX, touchY);
        if (touched_binsts.length == 0)
            return;
            
        // 2. get the max z-order inst
        var cnt = touched_binsts.length;
		if (cnt == 0)  // no inst match
            return;
            
        var i, binst, target_binst=touched_binsts[0];
        var instB=target_binst.inst, instA;
        for (i=1; i<cnt; i++ )
        {
            binst = touched_binsts[i];
            instA = binst.inst;
            if ( ( instA.layer.index > instB.layer.index) ||
                 ( (instA.layer.index == instB.layer.index) && (instA.get_zindex() > instB.get_zindex()) ) )              
            {
                target_binst = binst;
                instB = instA;
            } 
        }
        
		target_binst.drag(touch_src);
        this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDragStart, target_binst.inst); 

        touched_binsts.length = 0; 
    };
    
    behtypeProto.OnTouchEnd = function (touch_src)
    {
		var insts = this.objtype.instances;
        var i, cnt=insts.length, inst, binst;
        for (i=0; i<cnt; i++ )
        {
		    inst = insts[i];            
            binst = GetThisBehavior(inst);
			if (binst.drag_info.touch_src == touch_src)
            {
                binst.drop();
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
	    this.activated = (this.properties[0] === 1); 
	    this.is_align = (this.properties[1] === 1);  
        this.pull_out_when_drag_start = (this.properties[2] === 1);       

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
                          };
        this.overlap_mainboard = new cr.plugins_.Rex_MiniBoard.MainboardRefKlass();                          	     
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
            // move mini board with touch point
            this.inst.x = cur_x + drag_info.drag_dx;
            this.inst.y = cur_y + drag_info.drag_dy;    
            // get overlapped main board        
            var mainboard = this.touched_mainboard_get();
            var drag_on_mainboard = (mainboard != this.overlap_mainboard.inst) && (mainboard != null);            
            var lx_save=this.overlap_mainboard.LOX, ly_save=this.overlap_mainboard.LOY;
            if (mainboard != null)
            {
                // align to main board 
                var layout = mainboard.GetLayout();
	            var lx = layout.PXY2LX(this.inst.x, this.inst.y);
	            var ly = layout.PXY2LY(this.inst.x, this.inst.y);	            
	            
	            if (this.is_align)
	            {
                    this.inst.x = layout.LXYZ2PX(lx,ly,0);
                    this.inst.y = layout.LXYZ2PY(lx,ly,0);
                }
                this.overlap_mainboard.SetBoard(mainboard, lx, ly); 
            }
            else
            {
                this.overlap_mainboard.SetBoard(null)
            }
            this.inst.set_bbox_changed();

            if (drag_on_mainboard)
                this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDragAtMainboard, inst);  
                        
            if (drag_on_mainboard || 
                (this.overlap_mainboard.LOX != lx_save) || (this.overlap_mainboard.LOY != ly_save))
            {
                this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnLogicIndexChanged, inst); 
            }
                
            drag_info.pre_x = cur_x;
            drag_info.pre_y = cur_y;                    
        }
	};  

	behinstProto.is_any_cell_on_board = function(board_inst)
	{ 
        var layout = board_inst.GetLayout();
        var offset_lx = layout.PXY2LX(this.inst.x, this.inst.y);
        var offset_ly = layout.PXY2LY(this.inst.x, this.inst.y);
	    var uid, xyz, lx, ly, lz;
        var items = this.inst.GetAllChess();
	    for (uid in items)
	    {
	        xyz = this.inst.uid2xyz(uid);    
            lx = xyz.x + offset_lx;
            ly = xyz.y + offset_ly;
	        lz = xyz.z;
	        if (this.inst.CellCanPut(board_inst, parseInt(uid), lx, ly, lz, 1))
	        {
	            return true;
	        }
	    }         
	    return false;
	};
	
	behinstProto.touched_mainboard_get = function()
	{
	    var board_types = this.type.board_types;
	    var cnt=board_types.length;
	        
	    var i;
	    var is_on_board;
	    for (i=0; i<cnt; i++)
	    {	        
	        var boards = board_types[i].instances;
	        var j, inst_cnt = boards.length;
	        for (j=0; j<inst_cnt; j++)
	        {
	            if (this.is_any_cell_on_board(boards[j]))
	                return boards[j]; 
	        }
	    }
	    return null;
	};
		
	behinstProto.GetX = function()
	{
	    if (!this.drag_info.is_on_dragged)
	        return 0;
	    
        var touch_obj = this.type.touchwrap;
        return touch_obj.XForID(this.drag_info.touch_src, this.inst.layer.index);
	};
    
	behinstProto.GetY = function()
	{
	    if (!this.drag_info.is_on_dragged)
	        return 0;
	    
        var touch_obj = this.type.touchwrap;
        return touch_obj.YForID(this.drag_info.touch_src, this.inst.layer.index); 
	}; 
    
	behinstProto.drag = function(touch_src)
	{
        this.DragInfoSet(touch_src);     

        if (this.pull_out_when_drag_start)        
            this.inst.PullOutChess();        
        
        this.tick();  
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
        drag_info.pre_x = null;
        drag_info.pre_y = null;     
        drag_info.drag_start_x = cur_x;
        drag_info.drag_start_y = cur_y;         
        drag_info.inst_start_x = inst.x;
        drag_info.inst_start_y = inst.y;   
        drag_info.is_moved = false;
	};
    
	behinstProto.drop = function()
	{
        if (!this.drag_info.is_on_dragged)
            return;
            
	    this.drag_info.is_on_dragged = false;
		this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDrop, this.inst); 
				
        if (this.overlap_mainboard.inst != null)
        {
		    this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDropAtMainboard, this.inst);
        }
		this.overlap_mainboard.SetBoard(null);  
	};	
	behinstProto.IsInTouch = function(touchX, touchY)
	{
        var miniboard_inst = this.inst;
        var items = miniboard_inst.GetAllChess();
		var uid, inst;
		var tx, ty;
        for (uid in items)
        {
            inst = miniboard_inst.uid2inst(uid);
            if (inst == null)
                continue;
			inst.update_bbox();
			tx = inst.layer.canvasToLayer(touchX, touchY, true);
			ty = inst.layer.canvasToLayer(touchX, touchY, false);                
            if (inst.contains_pt(tx,ty))
            {
                return true;
            }
        }
		return false;
	};	
	
	behinstProto.pick_mainboard = function (board_objs)
	{
	    var sol = board_objs.getCurrentSol();
	    if ( (this.overlap_mainboard.inst == null) ||
	         (this.overlap_mainboard.inst.type !== board_objs)
	       )
	    {
	        sol.instances.length = 0;
	        return false;
	    }
   
	    sol.pick_one(this.overlap_mainboard.inst);
        return true;
	};	
	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];
	};		
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{	  
		propsections.push({
			"title": this.type.name,
			"properties": [{"name": "LXY", "value": this.overlap_mainboard.LOX.toString()+","+this.overlap_mainboard.LOY.toString()}
			              ]
		});
	};
	/**END-PREVIEWONLY**/	
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
    
	Cnds.prototype.OnLogicIndexChanged = function (board_objs)
	{
        return this.pick_mainboard(board_objs);
	};	
    
	Cnds.prototype.IsDragable = function ()
	{
        return this.activated;
	};		
    
	Cnds.prototype.IsTouching = function ()
	{
        var touch_obj = this.type.TouchWrapGet();  
        if (!touch_obj.IsInTouch())       // no touched
            return false;
            	    
		var touch_pts = this.type.touchwrap.touches, touch_pt, tx, ty;
		var i, cnt=touch_pts.length;
		for (i=0; i<cnt; i++)
		{
		    touch_pt = touch_pts[i];
			tx = touch_pt.x;
			ty = touch_pt.y;
			// tx, ty mapping is handled in this.IsInTouch(tx,ty)
			if (this.IsInTouch(tx, ty))
			    return true;
		}
        return false;
	};	
	
	Cnds.prototype.OnDropAtMainboard = function (board_objs)
	{
        return this.pick_mainboard(board_objs);
	};

	Cnds.prototype.OnDragAtMainboard = function (board_objs)
	{
	    if ( (this.overlap_mainboard.inst == null) ||
	         (this.overlap_mainboard.inst.type !== board_objs)
	       )
	        return false;
	        
	    var sol = board_objs.getCurrentSol();
	    sol.pick_one(this.overlap_mainboard.inst);
        return true;
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetDragable = function (en)
	{
		this.activated = (en === 1);
        
        if (!this.activated)
            this.drop();
	}; 

	Acts.prototype.ForceDrop = function ()
	{        
        this.drop();
	}; 

	Acts.prototype.TryDrag = function ()
	{
        if (!this.activated)
            return;
        
        if (this.drag_info.is_on_dragged)  // already dragged
            return;

        var touch_obj = this.type.TouchWrapGet();  
        if (!touch_obj.IsInTouch())       // no touched
            return;
        
        var touch_pts = touch_obj.touches;
        var cnt=touch_pts.length;            
        var i, touch_pt, tx, ty;
        for (i=0; i<cnt; i++)
        {
		    touch_pt = touch_pts[i];		    
			tx = touch_pt.x;
			ty = touch_pt.y;
            // tx, ty mapping is handled in this.IsInTouch(tx,ty)			
			if (this.IsInTouch(tx, ty))
            {
		        this.drag(i);
		        this.runtime.trigger(cr.behaviors.Rex_miniboard_touch.prototype.cnds.OnDragStart, this.inst);  
                break;
            }
        }        
	};  	
    
	Acts.prototype.SetAlign = function (en)
	{
		this.is_align = (en === 1);
	    if ((this.is_align) && (this.overlap_mainboard.inst != null))
	    {
	        var lx = this.overlap_mainboard.LOX;
	        var ly = this.overlap_mainboard.LOY;
            this.inst.x = layout.LXYZ2PX(lx,ly,0);
            this.inst.y = layout.LXYZ2PY(lx,ly,0);
        }		
	}; 	    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.LX = function (ret)
	{
	    ret.set_int(this.overlap_mainboard.LOX);
	};
	Exps.prototype.LY = function (ret)
    {
	    ret.set_int(this.overlap_mainboard.LOY);
	};
	Exps.prototype.MBUID = function (ret)
    {
        var mb = this.overlap_mainboard.inst;   
        var uid = (mb != null)? mb.uid:(-1);
	    ret.set_int(uid);
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