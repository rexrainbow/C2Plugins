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
	    this.layoutUid = -1;	
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
         
        this.last_POX = (-1);
        this.last_POY = (-1);                
		this.ResetBoard();
		
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this); 
        this.runtime.addDestroyCallback(this.myDestroyCallback); 
		this.runtime.tick2Me(this); 

		//this._kicked_chess_inst = null;	
        this.is_putable = 0;
        this.exp_RequestLX = (-1);		
        this.exp_RequestLY = (-1);
        this.exp_RequestLZ = (-1);   
        this.exp_RequestChessUID = (-1);     	        
        this.exp_EmptyLX = (-1);
        this.exp_EmptyLY = (-1);
	};
	
	instanceProto.ResetBoard = function ()
	{
		this.board = {};
		this.items = {};  // uid2xyz
		this.mainBoard = null;
		this.mainBoardUid = -1;    // for loading
		this.POX = (-1);
		this.POY = (-1);
	};	
	
	instanceProto.onInstanceDestroyed = function (inst)
	{
		this.remove_item(inst.uid);
	};    
    
	instanceProto.onDestroy = function ()
	{
		var uid, inst, uids=this.items;
		for (uid in uids)
		{
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
		    this.runtime.DestroyInstance(inst);
		}
		this.runtime.removeDestroyCallback(this.myDestroyCallback);        	    	
	};
	instanceProto.chess_pos_set = function ()
	{
	    var dx = this.x - this._pre_x;
		var dy = this.y - this._pre_y;
		if ((dx == 0) && (dy == 0))
		    return;
			
		var uid, inst, uids=this.items;
		for (uid in uids)
		{
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
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
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.items[uid];
	};
	
	instanceProto.uid2inst = function(uid)
	{
	    if (this.uid2xyz(uid) == null)  // not on the board
	        return null;
	    else
	        return this.runtime.getObjectByUID(uid);
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

	instanceProto.remove_item = function(uid, kicking_notify)
	{            
        var inst = this.uid2inst(uid);
        if (inst == null)
            return;            
                    
        //if (kicking_notify)
        //{
        //    this._kicked_chess_inst = this.chess_insts[uid];
        //    this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnChessKicked, this); 
        //}
        
        var _xyz = this.uid2xyz(uid);
        delete this.items[uid];
        delete this.board[_xyz.x][_xyz.y][_xyz.z];	        
        delete inst.extra.rex_miniboard_uid;	
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
        var sol = obj_type.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		
		// Siblings aren't in instance lists yet, pick them manually
		var i, len, s;
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}

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
		var uid, uids=this.items;
		for (uid in uids)
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
	    if (this.mainBoard != null)
		    return;
			
		var _xyz, x, y, z;
		var uid, inst, uids=this.items;
		for (uid in uids)
		{
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;			
			board_inst.add_item(inst, x, y, z);
		}
		this.x = board_inst.layout.LXYZ2PX(offset_lx, offset_ly, 0);
		this.y = board_inst.layout.LXYZ2PY(offset_lx, offset_ly, 0);
		this.chess_pos_set();
		this.mainBoard = board_inst;
		this.POX = offset_lx;
		this.POY = offset_ly;
        this.last_POX = offset_lx;
        this.last_POY = offset_ly;        
	};
	
	instanceProto.PullOutChess = function ()
	{	 
	    if (this.mainBoard == null)
		    return;
        
		var _xyz, x, y, z;
		var uid, uids=this.items;
		for (uid in uids)
			this.mainBoard.remove_item(uid);
		this.mainBoard = null;
		this.POX = (-1);
		this.POY = (-1);
	};
    
    var name2type = {};  // private global object
	instanceProto._pick_all_insts = function ()
	{	    
	    var uid, inst, objtype, sol;
	    var uids=this.items;
	    hash_clean(name2type);
	    var has_inst = false;    
	    for (uid in uids)
	    {
		    inst = this.uid2inst(uid);
		    if (inst == null)
		        continue;
	        objtype = inst.type; 
	        sol = objtype.getCurrentSol();
	        if (!(objtype.name in name2type))
	        {
	            sol.select_all = false;
	            sol.instances.length = 0;
	            name2type[objtype.name] = true;
	        }
	        sol.instances.push(inst);  
	        has_inst = true;
	    }
        hash_clean(name2type);
	    return has_inst;
	};
	
	instanceProto._is_putable_test = function (board_inst, offset_lx, offset_ly)
	{
		var board_xmax = board_inst.x_max;
		var board_ymax = board_inst.y_max;
		var board = board_inst.board;   
		var _xyz, x, y, z;
		var uid, uids=this.items;
		for (uid in uids)
		{		    
		    _xyz = this.uid2xyz(uid);
			x = _xyz.x+offset_lx;
			y = _xyz.y+offset_ly;
			z = _xyz.z;
        									
			if ((x < 0) || (x > board_xmax) || 
			    (y < 0) || (y > board_ymax)    )
			    return false;
		    else
		    {
                this.exp_RequestLX = _xyz.x+offset_lx;	
                this.exp_RequestLY = _xyz.y+offset_ly;
                this.exp_RequestLZ = _xyz.z;
                this.exp_RequestChessUID = parseInt(uid);
                this.is_putable = false;
                this.runtime.trigger(cr.plugins_.Rex_MiniBoard.prototype.cnds.OnPutAbleRequest, this);
                if (!this.is_putable)
                    return false;
		    }
		}
        this.exp_RequestLX = (-1);		
        this.exp_RequestLY = (-1);
        this.exp_RequestLZ = (-1);	
        this.exp_RequestChessUID = (-1);	
		return true;
	};
		
	var hash_clean = function (obj)
	{
	    var k;
	    for (k in obj)
	        delete obj[k];
	};
	
	instanceProto.saveToJSON = function ()
	{    
	    // wrap: copy from this.items
	    var uid, uid2xyz = {}, item;
	    for (uid in this.items)
	    {
	        uid2xyz[uid] = {};
	        item = this.items[uid];
	        uid2xyz[uid]["x"] = item.x;
	        uid2xyz[uid]["y"] = item.y;
	        uid2xyz[uid]["z"] = item.z;	        
	    }
	    	    
		return { "pre_x": this._pre_x,
		         "pre_y": this._pre_y,
                 "l_pox": this.last_POX,
                 "l_poy": this.last_POY,
                 "xyz2uid": this.board,
                 "uid2xyz": uid2xyz,
                 "mbuid" : (this.mainBoard!=null)? this.mainBoard.uid:(-1),
                 "pox": this.POX,
                 "poy": this.POY,
                 "luid": (this.type.layout != null)? this.type.layout.uid:(-1)
               };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this._pre_x = o["pre_x"];
		this._pre_y = o["pre_y"];
        this.last_POX = o["l_pox"]; 
        this.last_POY = o["l_poy"];
        this.board = o["xyz2uid"];     
        this.mainBoardUid = o["mbuid"];
        this.POX = o["pox"]; 
        this.POY = o["poy"];  
        this.type.layoutUid = o["luid"];
        
        
        // wrap: copy to this.items
        hash_clean(this.items);
	    var uid, uid2xyz = o["uid2xyz"], item;
	    for (uid in uid2xyz)
	    {
	        this.items[uid] = {};
	        item = uid2xyz[uid];
	        this.items[uid].x = item["x"];
	        this.items[uid].y = item["y"];
	        this.items[uid].z = item["z"];	        
	    }          
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.mainBoardUid === -1)
			this.mainBoard = null;
		else
		{
			this.mainBoard = this.runtime.getObjectByUID(this.mainBoardUid);
			assert2(this.mainBoard, "Mini board: Failed to find main board object by UID");
		}
		
		this.mainBoardUid = -1;
		
		if (this.type.layoutUid === -1)
			this.type.layout = null;
		else
		{
			this.type.layout = this.runtime.getObjectByUID(this.type.layoutUid);
			assert2(this.type.layout, "Mini board: Failed to find layout object by UID");
		}
		
		this.type.layoutUid = -1;		
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
    
	Cnds.prototype.PickMiniboard = function (objtype)
	{
		if (!objtype)
			return; 
            
    	var insts = objtype.getCurrentSol().getObjects();        
    	var cnt = insts.length;
        if (cnt == 0)
            return false;
        var miniboard_type = this.runtime.getCurrentCondition().type;  
        var miniboard_sol = miniboard_type.getCurrentSol();
        miniboard_sol.select_all = false;
        miniboard_sol.instances.length = 0;                
        var i, miniboard_uid, miniboard_inst;
        var uids = {};
        for (i=0; i<cnt; i++)
        {
            miniboard_uid = insts[i].extra.rex_miniboard_uid;
            if (miniboard_uid in uids)
                continue;
            miniboard_inst = this.runtime.getObjectByUID(miniboard_uid);
            if (miniboard_inst == null)
                continue;
            miniboard_sol.instances.push(miniboard_inst);
            uids[miniboard_uid] = true;
        }
        var current_event = this.runtime.getCurrentEventStack().current_event;
        this.runtime.pushCopySol(current_event.solModifiers);
        current_event.retrigger();
        this.runtime.popSol(current_event.solModifiers);
		return false;            
	}; 
	  
	Cnds.prototype.IsOnTheBoard = function (board_objs)
	{
		if (!board_objs)
			return; 
		var board_inst = board_objs.getFirstPicked();
		return (this.mainBoard == board_inst);
	}; 
	
	Cnds.prototype.IsPutAble = function (board_objs, offset_lx, offset_ly)
	{
		if (!board_objs)
			return; 
		return this._is_putable_test(board_objs.getFirstPicked(), offset_lx, offset_ly);
	}; 
	  
	Cnds.prototype.OnPutAbleRequest = function ()
	{
		return true;
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
	
	Acts.prototype.SetPutAble = function (put_able)
	{	
        this.is_putable = (put_able == 1);
	};		
	
		    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.LX = function (ret)
	{
	    var lx = (this.mainBoard == null)? (-1): this.POX;
	    ret.set_int(lx);
	};
	Exps.prototype.LY = function (ret)
    {
	    var ly = (this.mainBoard == null)? (-1): this.POY;
	    ret.set_int(ly);
	};	
	Exps.prototype.LastLX = function (ret)
	{
	    ret.set_int(this.last_POX);
	};
	Exps.prototype.LastLY = function (ret)
    {
	    ret.set_int(this.last_POY);
	};	
	Exps.prototype.RequestLX = function (ret)
	{
	    ret.set_int(this.exp_RequestLX);
	};
	Exps.prototype.RequestLY = function (ret)
	{
	    ret.set_int(this.exp_RequestLY);
	}; 
	Exps.prototype.RequestLZ = function (ret)
	{
	    ret.set_int(this.exp_RequestLZ);
	};
	Exps.prototype.RequestChessUID = function (ret)
	{
	    ret.set_int(this.exp_RequestChessUID);
	};	
	Exps.prototype.EmptyLY = function (ret)
	{
	    ret.set_int(this.exp_EmptyLY);
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