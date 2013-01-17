// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_MiniBoard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_MiniBoard.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	    this.layout = null;	
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	    this.check_name = "BOARD";
        this._pre_x = this.x;
		this._pre_y = this.y;
         
		this.ResetBoard();
		
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this); 
        this.runtime.addDestroyCallback(this.myDestroyCallback); 
		this.runtime.tick2Me(this); 

		this._kicked_chess_inst = null;	
        this.exp_EmptyLX = (-1);
        this.exp_EmptyLY = (-1);
	};
	
	instanceProto.ResetBoard = function ()
	{
		this.board = {};
		this.items = {};
        this.chess_insts = {};
		this.main_board = null;
		this.POX = (-1);
		this.POY = (-1);
	};	
	
	instanceProto.onInstanceDestroyed = function (inst)
	{
	    var uid=inst.uid;		
		if (this.chess_insts[uid] == null)
		    return;
	    this.remove_item(uid);
	};    
    
	instanceProto.onDestroy = function ()
	{
		var uid, inst, insts=this.chess_insts;
		for (uid in insts)
		    this.runtime.DestroyInstance(insts[uid]);
		this.runtime.removeDestroyCallback(this.myDestroyCallback);        	    	
	};
	instanceProto.chess_pos_set = function ()
	{
	    var dx = this.x - this._pre_x;
		var dy = this.y - this._pre_y;
		if ((dx == 0) && (dy == 0))
		    return;
			
		var uid, inst, insts=this.chess_insts;
		for (uid in insts)
		{
		    inst = insts[uid];
			inst.x += dx;
			inst.y += dy;
			inst.set_bbox_changed();
		}
        this._pre_x = this.x;
		this._pre_y = this.y;
	}; 
	instanceProto.tick2 = function ()
	{
	    this.chess_pos_set();
	};    
	
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};
	var _get_uid = function(objs)
	{
        var uid;
	    if (objs == null)
	        uid = null;
	    else if (typeof(objs) != "number")
	    {
	        var inst = objs.getFirstPicked();
	        uid = (inst!=null)? inst.uid:null;
	    }
	    else
	        uid = objs;
            
        return uid;
	};
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };
	instanceProto.xyz2uid = function(x, y, z)
	{
	    var tmp = this.board[x];
		if (tmp != null)
		{
		    tmp = tmp[y];
			if (tmp != null)
			    return tmp[z];
		}
		return null;
	};
	instanceProto._put_chess = function(x, y, z, uid)
	{
	    var tmp;
		if (this.board[x] == null)
		    this.board[x] = {};
        tmp = this.board[x];
		if (tmp[y] == null)
		    tmp[y] = {};
	    tmp = tmp[y];
		tmp[z] = uid;
	};	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.items[uid];
	};
	instanceProto.remove_item = function(uid, kicking_notify)
	{        
        if (uid == null)
            return;
	    
        var _xyz = this.uid2xyz(uid);
        if (_xyz == null)
            return;
                    
        if (kicking_notify)
        {
            this._kicked_chess_inst = this.chess_insts[uid];
            //this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnChessKicked, this); 
        }
        
        var chess_inst = this.chess_insts[uid];
        delete this.items[uid];
        delete this.board[_xyz.x][_xyz.y][_xyz.z];        
        delete this.chess_insts[uid];	
        
        delete chess_inst.extra.rex_miniboard_uid;	
	};
	instanceProto.add_item = function(inst, _x, _y, _z)
	{                
        // inst could be instance(object) or uid(number)
        if (inst == null)
            return;
			
        var uid = inst.uid;
        this.remove_item(this.xyz2uid(_x,_y,_z), true);
		this._put_chess(_x, _y, _z,uid);
	    this.items[uid] = {x:_x, y:_y, z:_z};
        this.chess_insts[uid] = inst;
        
        inst.extra.rex_miniboard_uid = this.uid;
        //this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnCollided, this);                                           
	};

	instanceProto.CreateItem = function(obj_type,x,y,z,_layer)
	{
        var layer = this._get_layer(_layer);
        var inst = this.type.layout.CreateItem(obj_type,x,y,z,layer);
        if (!inst)
            return;
        
		this.runtime.isInOnDestroy++;
		this.runtime.trigger(Object.getPrototypeOf(obj_type.plugin).cnds.OnCreated, inst);
		this.runtime.isInOnDestroy--;
        
        // Pick just this instance
        obj_type.getCurrentSol().pick_one(inst);

        return inst;
	};
	instanceProto.CreateChess = function(obj_type,x,y,z,layer)
	{
        if ( (obj_type ==null) || (this.type.layout == null) )
            return;

        var layout = this.type.layout;
	    var pox_save = layout.GetPOX();
		var poy_save = layout.GetPOY();
		layout.SetPOX(this.x);
		layout.SetPOY(this.y);
        var inst = this.CreateItem(obj_type,x,y,z,layer);
		if (inst != null)
	        this.add_item(inst,x,y,z);  
		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);
	    return inst;
	};
	instanceProto.IsEmpty = function (board_inst, offset_lx, offset_ly)
	{
		var board_xmax = board_inst.x_max;
		var board_ymax = board_inst.y_max;
		var board = board_inst.board;   
		var _xyz, x, y, z;
		var uid, insts = this.chess_insts;
		for (uid in insts)
		{
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;
			if ((x < 0) || (x > board_xmax) || 
			    (y < 0) || (y > board_ymax) || 
			    (board[x][y][z] != null))
			    return false;
		}
		return true;
	}; 	
	instanceProto.PutChess = function (board_inst, offset_lx, offset_ly)
	{	 
	    if (this.main_board != null)
		    return;
			
		var _xyz, x, y, z;
		var uid, insts = this.chess_insts;
		for (uid in insts)
		{
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;			
			board_inst.add_item(insts[uid], x, y, z);
		}
		this.x = board_inst.layout.LXYZ2PX(offset_lx, offset_ly, 0);
		this.y = board_inst.layout.LXYZ2PY(offset_lx, offset_ly, 0);
		this.chess_pos_set();
		this.main_board = board_inst;
		this.POX = offset_lx;
		this.POY = offset_ly;		
	};
	
	instanceProto.PullOutChess = function ()
	{	 
	    if (this.main_board == null)
		    return;
        
		var _xyz, x, y, z;
		var uid, insts = this.chess_insts;
		for (uid in insts)
			this.main_board.remove_item(uid);
		this.main_board = null;
		this.POX = (-1);
		this.POY = (-1);
	};
    
	instanceProto._pick_all_insts = function ()
	{	    
	    var uid, inst, objtype, sol;
	    var insts=this.chess_insts;
	    var objtype_name={};	
	    var has_inst = false;    
	    for (uid in insts)
	    {
	        inst = insts[uid];
	        objtype = inst.type; 
	        sol = objtype.getCurrentSol();
	        if (!(objtype.name in objtype_name))
	        {
	            sol.select_all = false;
	            sol.instances.length = 0;
	            objtype_name[objtype.name] = true;
	        }
	        sol.instances.push(inst);  
	        has_inst = true;
	    }
	    return has_inst;
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	  
	Cnds.prototype.IsEmpty = function (board_objs, offset_lx, offset_ly)
	{
		if (!board_objs)
			return; 
		return this.IsEmpty(board_objs.getFirstPicked(), offset_lx, offset_ly);
	}; 

	Cnds.prototype.PickAllChess = function ()
	{
	    return this._pick_all_insts();
	};
    
    var _uid2inst = {};
    var _uid2inst_get = function(insts)
    {
        var uid;
        for (uid in _uid2inst)
            delete _uid2inst[uid];
        var i, cnt=insts.length, inst;
        for (i=0; i<cnt; i++)
        {
            inst = insts[i];
            _uid2inst[inst.uid] = inst;
        }
        return _uid2inst;
    };
    
	Cnds.prototype.PickMiniboard =function (objtype)
	{
		if (!objtype)
			return; 
            
    	var insts = objtype.getCurrentSol().getObjects();        
    	var cnt = insts.length;
    	if (cnt == 0)
            return false;  
 
        var i, miniboard_uid, miniboard_inst;
	    var runtime = this.runtime;
	    var container_type = runtime.getCurrentCondition().type;         
        var sol = container_type.getCurrentSol();
        sol.select_all = true;
        var uid2inst = _uid2inst_get(sol.getObjects());
        sol.select_all = false;
        sol.instances.length = 0;              
        for (i=0;i<cnt;i++)
        {
            miniboard_uid = insts[i].extra.rex_miniboard_uid;
            miniboard_inst = uid2inst[miniboard_uid];
            if (miniboard_inst == null)
                continue;            
            sol.instances.push(miniboard_inst);
            delete uid2inst[miniboard_uid];
        }
        var current_event = runtime.getCurrentEventStack().current_event;
        runtime.pushCopySol(current_event.solModifiers);
        current_event.retrigger();
        runtime.popSol(current_event.solModifiers);
		return false;            
	}; 
	  
	Cnds.prototype.IsOnTheBoard = function (board_objs)
	{
		if (!board_objs)
			return; 
		var board_inst = board_objs.getFirstPicked();
		return (this.main_board == board_inst);
	}; 
	
	Cnds.prototype.CanFindEmpty = function (board_objs, _start_lx, _start_ly, _range)
	{	
		if ((!board_objs) || (_range <0))
			return; 
            
        var board_inst = board_objs.getFirstPicked();
        if (this.IsEmpty(board_inst, _start_lx, _start_ly))
        {
            this.exp_EmptyLX = _start_lx;
            this.exp_EmptyLY = _start_ly;
            return true;
        }

        var is_empty;
        var r, width, x, y, sx, sy, i;
        var dir, dir_x, dir_y;
        for (r=1; r<=_range; r++)
        {
            width = r*2;
            for (dir=0; dir<4; dir++)
            {
                switch (dir)
                {
                case 0:  // left-top
                    sx = _start_lx - r;
                    sy = _start_ly - r;          
                    dir_x = 1; dir_y = 0;
                break;
                case 1:  // right-top
                    sx = _start_lx + r;
                    sy = _start_ly - r;
                    dir_x = 0; dir_y = 1;
                break;
                case 2:  // right-bottom
                    sx = _start_lx + r;
                    sy = _start_ly + r;
                    dir_x = -1; dir_y = 0;
                break;                  
                case 3:  // left-bottom
                    sx = _start_lx - r;
                    sy = _start_ly + r;  
                    dir_x = 0; dir_y = -1;                    
                break;                  
                }
                
                for (i=0; i<width; i++)
                {
                    x = sx +(dir_x*i);
                    y = sy+(dir_y*i);
                    is_empty = this.IsEmpty(board_inst, x , y);
                    if (is_empty)
                    {
                        this.exp_EmptyLX = x;
                        this.exp_EmptyLY = y;
                        return true;
                    }
                }
            }         
        }
        this.exp_EmptyLX = (-1);
        this.exp_EmptyLY = (-1);
        return false;        
	};	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.SetupLayout = function (layout_objs)
	{   
        var layout = layout_objs.instances[0];
        if (layout.check_name == "LAYOUT")
            this.type.layout = layout;        
        else
            alert ("Mini board should connect to a layout object");
	};  
	
	Acts.prototype.CreateChess = function (obj_type,x,y,z,layer)
	{ 
		if (!obj_type)
			return;	
	    this.CreateChess(obj_type,x,y,z,layer);        
	};	
	
	Acts.prototype.PutChess = function (board_objs, offset_lx, offset_ly)
	{	 
		if (!board_objs)
			return;
		this.PutChess(board_objs.getFirstPicked(), offset_lx, offset_ly);
	};
	
	Acts.prototype.PullOutChess = function ()
	{	 
		this.PullOutChess();
	};
	
	Acts.prototype.PickAllChess = function ()
	{	
        this._pick_all_insts();
	};
	
	Acts.prototype.ReleaseAllChess = function ()
	{	
        this.ResetBoard();
	};	
		    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LX = function (ret)
	{
	    var lx = (this.main_board == null)? (-1): this.POX;
	    ret.set_int(lx);
	};
	Exps.prototype.LY = function (ret)
    {
	    var ly = (this.main_board == null)? (-1): this.POY;
	    ret.set_int(ly);
	};	
	Exps.prototype.EmptyLX = function (ret)
	{
	    ret.set_int(this.exp_EmptyLX);
	};
	Exps.prototype.EmptyLY = function (ret)
	{
	    ret.set_int(this.exp_EmptyLY);
	};    
}());