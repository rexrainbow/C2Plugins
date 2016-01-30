// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGBoard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGBoard.prototype;
		
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
	};
	

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
    
    var _uids = [];  // private global object
    var ALLDIRECTIONS = (-1);
	instanceProto.onCreate = function()
	{
        this.check_name = "BOARD";
	    this.board = [];
	    this.reset_board(this.properties[0]-1,
	                     this.properties[1]-1);
	    this.is_wrap_mode = (this.properties[2] == 1);
	    
        this.layout = null;
        this.layoutUid = -1;    // for loading
        this._kicked_chess_uid = -1;
        this._exp_EmptyLX = -1;
        this._exp_EmptyLY = -1;
        
		// Need to know if pinned object gets destroyed
		if (!this.recycled)
		{
		    this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
        }										
		this.runtime.addDestroyCallback(this.myDestroyCallback);        
	};
	
	instanceProto.onDestroy = function ()
	{
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};   
    
    instanceProto.onInstanceDestroyed = function(inst)
    {
        // auto remove uid from board array
        this.RemoveChess(inst.uid);
    };
    
    instanceProto.GetLayout = function()
    {
        if (this.layout != null)
            return this.layout;
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            
            if ( (cr.plugins_.Rex_SLGSquareTx && (inst instanceof cr.plugins_.Rex_SLGSquareTx.prototype.Instance)) ||
                 (cr.plugins_.Rex_SLGHexTx && (inst instanceof cr.plugins_.Rex_SLGHexTx.prototype.Instance))       ||
                 (cr.plugins_.Rex_SLGCubeTx && (inst instanceof cr.plugins_.Rex_SLGCubeTx.prototype.Instance)) 
                )
            {
                this.layout = inst;
                return this.layout;
            }            
        }
        assert2(this.layout, "Board: Can not find layout oject.");
        return null;
    };    
    
	instanceProto.reset_board = function(x_max, y_max)
	{
	    if (x_max>=0)
	        this.x_max = x_max;
	    if (y_max>=0)    
	        this.y_max = y_max;
	    
		this.board.length = x_max+1;
		var x, y;
		for (x=0;x<=x_max;x++)
		{
		    this.board[x] = [];
		    this.board[x].length = y_max+1;
		    for(y=0;y<=y_max;y++)
		        this.board[x][y] = {};
		}
		
		if (this.items == null)
		    this.items = {};
		else
		    hash_clean(this.items);
	};
	
	instanceProto.set_board_width = function(x_max)
	{
	    if (this.x_max == x_max)
		    return;
	    else if (this.x_max < x_max)    // extend
		{
		    var x, y, y_max=this.y_max;
			this.board.length = x_max;
		    for (x=this.x_max+1; x<=x_max; x++)
		    {
		        this.board[x] = [];
		        this.board[x].length = y_max+1;
		        for(y=0; y<=y_max; y++)
		            this.board[x][y] = {};
		    }
		}
		else  // (this.x_max > x_max) : collapse
		{		
		    var x, y, y_max=this.y_max;
			var z, z_hash;
		    for (x=this.x_max; x>x_max; x--)
		    {
		        for(y=0; y<=y_max; y++)
				{
				    z_hash = this.board[x][y];
				    for (z in z_hash)
					    this.RemoveChess(z_hash[z], true);
			    }
		    }		
			this.board.length = x_max+1;			
		}
		this.x_max = x_max;
	};
	
	instanceProto.set_board_height = function(y_max)
	{
	    if (this.y_max == y_max)
		    return;
	    else if (this.y_max < y_max)    // extend
		{
		    var x, y, x_max=this.x_max;
		    for (x=0; x<=x_max; x++)
		    {
		        this.board[x].length = y_max+1;			
		        for(y=this.y_max+1; y<=y_max; y++)
		            this.board[x][y] = {};
		    }
		}
		else  // (this.y_max > y_max) : collapse
		{
		    var x, y, x_max=this.x_max;
			var z, z_hash;
		    for (x=0; x<=x_max; x++)
		    {	
		        for(y=this.y_max; y>y_max; y--)
				{
				    z_hash = this.board[x][y];
				    for (z in z_hash)
					    this.RemoveChess(z_hash[z], true);
				}
		        this.board[x].length = y_max+1;							
		    }		
		}
		this.y_max = y_max;	
	};

	instanceProto.IsInsideBoard = function (x,y,z)
	{
	    var is_in_board = (x>=0) && (y>=0) && (x<=this.x_max) && (y<=this.y_max);
	    if (is_in_board && (z != null))
	        is_in_board = (z in this.board[x][y]);
	    return is_in_board;
	};	
	
	instanceProto.IsEmpty = function (x,y,z)
	{
	    if (!this.IsInsideBoard(x,y))
	        return false;

	    return (z==0)? (this.board[x][y][0] == null):
	                   ((this.board[x][y][0] != null) && (this.board[x][y][z] == null));
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
    
	instanceProto.xyz2uid = function(x, y, z)
	{
	    return (this.IsInsideBoard(x, y, z))? this.board[x][y][z]:null;
	};
	
	instanceProto.xy2zHash = function(x, y)
	{
	    return (this.IsInsideBoard(x, y))? this.board[x][y]:null;
	};

	instanceProto.xy2zCnt = function(x, y)
	{
	    var zcnt=0;
	    var z_hash = this.xy2zHash(x, y);
	    if (z_hash != null)
	    {
	        var z;
	        for (z in z_hash)
	            zcnt += 1;
	    }
	    return zcnt;
	};
		
	instanceProto.lz2uid = function(uid, lz)
	{
	    var o_xyz = this.uid2xyz(uid);
		if (o_xyz == null)
		    return null;
		if (o_xyz.z == lz)
		    return uid;
	    
		return this.xyz2uid(o_xyz.x, o_xyz.y, lz);
	};
	
	instanceProto.GetNeighborLX = function(lx, ly, dir, is_wrap_mode)
	{
	    if (is_wrap_mode == null)
	        is_wrap_mode = this.is_wrap_mode;
	        
	    var layout = this.GetLayout();
	    var nlx = layout.GetNeighborLX(lx, ly, dir);
	    if (is_wrap_mode)
	    {
	        nlx = this.LX2WrapLX(nlx);
	    }
		return nlx;
	};
	
	instanceProto.LX2WrapLX = function(lx, is_wrap_mode)
	{
	    if (is_wrap_mode == null)
	        is_wrap_mode = this.is_wrap_mode;
	    
	    if (!is_wrap_mode)
	        return lx;
	        
        if (lx < 0)
        {
            lx = lx + (this.x_max + 1);
        }
        else if (lx > this.x_max)
        {
            lx = lx - (this.x_max + 1);
        }	    
        return lx;
	};
		
	instanceProto.GetNeighborLY = function(lx, ly, dir, is_wrap_mode)
	{
	    if (is_wrap_mode == null)
	        is_wrap_mode = this.is_wrap_mode;
	        	    
	    var layout = this.GetLayout();
	    var nly = layout.GetNeighborLY(lx, ly, dir);
	    if (is_wrap_mode)
	    {
	        nly = this.LY2WrapLY(nly);
	    }
		return nly;
	};		
		
	instanceProto.LY2WrapLY = function(ly, is_wrap_mode)
	{
	    if (is_wrap_mode == null)
	        is_wrap_mode = this.is_wrap_mode;
	    
	    if (!is_wrap_mode)
	        return ly;
	        	    
        if (ly < 0)
        {
            ly = ly + (this.y_max + 1);
        }
        else if (ly > this.y_max)
        {
            ly = ly - (this.y_max + 1);
        }	    
        return ly;
	};
		
	instanceProto.dir2uid = function(uid, dir, tz, is_wrap_mode)
	{
	    var o_xyz = this.uid2xyz(uid);
		if (o_xyz == null)
		    return null;

	    var tx = this.GetNeighborLX(o_xyz.x, o_xyz.y, dir, is_wrap_mode);
		var ty = this.GetNeighborLY(o_xyz.x, o_xyz.y, dir, is_wrap_mode);
	    if (tz == null)
		    tz = o_xyz.z;
		return this.xyz2uid(tx, ty, tz);
	};
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.items[uid];
	};

	instanceProto.uid2inst = function(uid, ignored_chess_check)
	{
	    if (!ignored_chess_check && (this.uid2xyz(uid) == null))  // not on the board
	        return null;
	    else
	        return this.runtime.getObjectByUID(uid);
	};
		
	instanceProto.SwapChess = function (uidA, uidB)
	{	
        var xyzA=this.uid2xyz(uidA);
        var xyzB=this.uid2xyz(uidB);
        if ((xyzA == null) || (xyzB == null))
            return false;
        
        var instA = this.uid2inst(uidA);
        var instB = this.uid2inst(uidB);        
	    this.RemoveChess(uidA);   
	    this.RemoveChess(uidB);   
        this.AddChess(instA, xyzB.x, xyzB.y, xyzB.z);        
        this.AddChess(instB, xyzA.x, xyzA.y, xyzA.z);   
        return true;
	};
	
	instanceProto.CanPut = function (lx, ly, lz, test_mode)
	{
	    var can_put;
	    switch (test_mode)
	    {
	    case 0:    // lxy is inside board
	        can_put = this.IsInsideBoard(lx, ly);
	    break;
	    case 1:    // lxy is inside board, and stand on a tile if lz!=0
	        var check_lz = (lz == 0)? null : 0;
	        can_put = this.IsInsideBoard(lx, ly, check_lz);
	    break;
	    case 2:    // lxy is stand on a tile and is empty
	        can_put = this.IsEmpty(lx, ly, lz);
	    break;	    
	    }
	    return can_put;
	};
		
	instanceProto.AddChess = function(inst, _x, _y, _z)
	{                
	    if (inst == null)
	        return;
	        
        // check if lxy is inside board
        if ( !this.IsInsideBoard(_x, _y) )
            return;
                    
        // inst could be instance(object) or uid(number) or ?(string)
        var is_inst = (typeof(inst) == "object");
        var uid = (is_inst)? inst.uid:inst;
        if (this.uid2inst(uid) != null)  // already on board
            this.RemoveChess(uid);
        this.RemoveChess(this.xyz2uid(_x,_y,_z), true);
	    this.board[_x][_y][_z] = uid;
	    this.items[uid] = {x:_x, y:_y, z:_z};
            
        this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnCollided, this);                                           
	};
    
	instanceProto.RemoveChess = function(uid, kicking_notify)
	{        
        if (uid == null)
            return;
	    
        var _xyz = this.uid2xyz(uid);
        if (_xyz == null)
            return;
                    
        if (kicking_notify)
        {
            this._kicked_chess_uid = uid;
            this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnChessKicked, this); 
        }
        
        delete this.items[uid];
        delete this.board[_xyz.x][_xyz.y][_xyz.z];
	};
	instanceProto.MoveChess = function(chess_inst, target_x, target_y, target_z)
	{
        if (typeof(chess_inst) == "number")    // uid
            chess_inst = this.uid2inst(chess_inst);
        if (chess_inst == null)
            return;        
	    this.RemoveChess(chess_inst.uid);   
        this.AddChess(chess_inst, target_x, target_y, target_z); 
	}; 
    
	instanceProto.uid2NeighborDir = function (uidA, uidB, is_wrap_mode)
	{
        var xyzA=this.uid2xyz(uidA);
        var xyzB=this.uid2xyz(uidB);
        if ((xyzA == null) || (xyzB == null))
            return null;
        
        return this.lxy2NeighborDir(xyzA.x, xyzA.y, xyzB.x, xyzB.y, is_wrap_mode);
	};    
	
	var GXYZA = {x:0, y:0, z:0};
	var GXYZB = {x:0, y:0, z:0};
	instanceProto.lxy2NeighborDir = function (lx0, ly0, lx1, ly1, is_wrap_mode)
	{
        GXYZA.x=lx0, GXYZA.y=ly0;
        GXYZB.x=lx1, GXYZB.y=ly1;
        var dir = this.GetLayout().NeighborXYZ2Dir(GXYZA, GXYZB);
        
        if (dir == null)
        {
            if (is_wrap_mode == null)
                is_wrap_mode = this.is_wrap_mode;
                
            if (is_wrap_mode)
            {                
                var i, dir_count=this.GetLayout().GetDirCount();
                var tx, ty;
                for (i=0; i<dir_count; i++)
                {
                    tx = this.GetNeighborLX(GXYZA.x, GXYZA.y, i, is_wrap_mode);
                    ty = this.GetNeighborLY(GXYZA.x, GXYZA.y, i, is_wrap_mode);
                    if ((tx == GXYZB.x) && (ty == GXYZB.y))
                    {
                        dir = i;
                        break;
                    }
                }
            }
        }
        return dir;
	};  	
	
	instanceProto.CreateChess = function(objtype, lx, ly, lz, layer, ignore_tile_checking)
	{
        if ((objtype == null) || (layer == null))
            return;   
        
        var test_mode = (ignore_tile_checking)?  0:1;
        if (!this.CanPut(lx, ly, lz, test_mode))
            return;
            	    
        // callback
        var self = this;  
        var callback = function (inst)
        {
            self.AddChess(inst, lx,ly,lz);  
        }
        // callback
        
        var layout = this.GetLayout();         
        var px = layout.LXYZ2PX(lx, ly, lz);
        var py = layout.LXYZ2PY(lx, ly, lz);
        var inst = window.RexC2CreateObject.call(this, objtype, layer, px, py, callback);           
	    return inst;
	};	

	instanceProto._overlap_test = function(_objA, _objB)
	{
	    var _insts_A = _objA.getCurrentSol().getObjects();
	    var _insts_B = _objB.getCurrentSol().getObjects();
        var objA, objB, insts_A, insts_B;
        if (_insts_A.length > _insts_B.length)
        {
            objA = _objB;
            objB = _objA;
            insts_A = _insts_B;
            insts_B = _insts_A;
        }
        else
        {
            objA = _objA;
            objB = _objB;
            insts_A = _insts_A;
            insts_B = _insts_B;        
        }
        
	    var runtime = this.runtime;
	    var current_event = runtime.getCurrentEventStack().current_event;     
        var is_the_same_type = (objA === objB);          
        var cnt_instA = insts_A.length;     
        var i, z, inst_A, uid_A, xyz_A, z_hash, tmp_inst, tmp_uid;
        var cursol_A, cursol_B;
        for (i=0; i<cnt_instA; i++)
        {
            inst_A = insts_A[i];
            uid_A = inst_A.uid;
            xyz_A = this.uid2xyz(uid_A);
            if (xyz_A == null)
                continue;
                
            var z_hash = this.xy2zHash(xyz_A.x, xyz_A.y);
            for (z in z_hash)
            {
                tmp_uid = z_hash[z];
                if (tmp_uid == uid_A)
                    continue;
                tmp_inst = this.uid2inst(tmp_uid);                
                if (insts_B.indexOf(tmp_inst) != (-1))
                {
                    runtime.pushCopySol(current_event.solModifiers);
                    cursol_A = objA.getCurrentSol();
                    cursol_B = objB.getCurrentSol();
                    cursol_A.select_all = false;
                    cursol_B.select_all = false;
                    // If ltype === rtype, it's the same object (e.g. Sprite collides with Sprite)
                    // In which case, pick both instances                                        
                    if (is_the_same_type) 
                    {
                        // just use lsol, is same reference as rsol
                        cursol_A.instances.length = 2;
				        cursol_A.instances[0] = inst_A;
                        cursol_A.instances[1] = tmp_inst;
                    }
                    else   // Pick each instance in its respective SOL
                    {
                        cursol_A.instances.length = 1;
				        cursol_A.instances[0] = inst_A;     
                        cursol_B.instances.length = 1;
				        cursol_B.instances[0] = tmp_inst; 				                           
                    }
                    current_event.retrigger();
                    runtime.popSol(current_event.solModifiers);   
                }
            }
        }
	};	

	instanceProto.pickuids = function (uids, chess_type, ignored_chess_check)
	{
	    var check_callback;
	    if (!ignored_chess_check)
	    {
	        var self = this;
	        check_callback = function (uid)
	        {
	            return (self.uid2xyz(uid) != null);
	        }
	    }	       
	    return window.RexC2PickUIDs.call(this, uids, chess_type, check_callback);  
	};
    
    var name2type = {};  // private global object
	instanceProto._pick_all_insts = function ()
	{	    
	    var uid, inst, objtype, sol;
	    hash_clean(name2type);
	    var has_inst = false;    
	    for (uid in this.items)
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
	            name2type[objtype.name] = objtype;
	        }
	        sol.instances.push(inst);  
	        has_inst = true;
	    }
	    var name;
	    for (name in name2type)
	        name2type[name].applySolToContainer();
	    hash_clean(name2type);
	    return has_inst;
	};
	
	instanceProto._pick_chess = function (chess_type)
	{
        _uids.length = 0;
        var u;
        for (u in this.items)
        {
            _uids.push(parseInt(u));
        }       
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;  
	};
    
	instanceProto._pick_chess_on_LXY = function (chess_type, lx, ly)
	{	    
        var z_hash = this.xy2zHash(lx, ly);
        if (z_hash == null)
            return false;
        
        _uids.length = 0;
		var z_index;
        for (z_index in z_hash)
        {
            _uids.push(z_hash[z_index]);
        }
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
	};
	instanceProto._pick_chess_on_tiles = function (chess_type, tiles)
	{	
	    _uids.length = 0;
	    var tiles_cnt = tiles.length;
	    var t, tile, uid, _xyz, z_hash, z_index;
        for (t=0; t<tiles_cnt; t++)
        {
            tile = tiles[t];
            uid = (typeof tile == "number")? tile:tile.uid;
            _xyz = this.uid2xyz(uid);
            if (_xyz == null)
                continue; 
            z_hash = this.xy2zHash(_xyz.x, _xyz.y);
            if (z_hash == null)
                continue;   
            for (z_index in z_hash)
            {
                _uids.push(z_hash[z_index]);
            }                             
        }
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;
	};

	instanceProto.point_is_in_board = function (px, py)
	{
        var layout = this.GetLayout();
	    var lx = layout.PXY2LX(px, py);
		var ly = layout.PXY2LY(px, py);
		return ((lx>=0) && (ly>=0) && (lx<=this.x_max) && (ly<=this.y_max));
	};
		
	instanceProto._pick_chess_on_LXYZ = function (chess_type, lx, ly, lz)
	{
        var uid = this.xyz2uid(lx, ly, lz);
        if (uid == null)
            return false;
        _uids.length = 0;
        _uids.push(uid);
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;          
	};
	
	instanceProto._pick_chess_on_LX = function (chess_type, lx)
	{
	    var ly, lz, zHash, uid;
        _uids.length = 0;	    
	    for (ly=0; ly<=this.y_max; ly++)
	    {
	        zHash = this.xy2zHash(lx, ly);
	        for (lz in zHash)
	        {
	            _uids.push(zHash[lz]);
	        }
	    }
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;          
	};
	
	instanceProto._pick_chess_on_LY = function (chess_type, ly)
	{
	    var lx, lz, zHash, uid;
        _uids.length = 0;	    
	    for (lx=0; lx<=this.x_max; lx++)
	    {
	        zHash = this.xy2zHash(lx, ly);
	        for (lz in zHash)
	        {
	            _uids.push(zHash[lz]);
	        }
	    }
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;          
	};
	
	instanceProto._pick_chess_on_LZ = function (chess_type, lz)
	{
	    var lx, ly, uid;
        _uids.length = 0;        
	    for (ly=0; ly<=this.y_max; ly++)
	    {
	        for (lx=0; lx<=this.x_max; lx++)
	        {
	            uid = this.xyz2uid(lx, ly, lz);
	            if (uid == null)
	                continue;
	                
	            _uids.push(uid);
	        }
	    }
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;          
	};			
	
	instanceProto.pick_neighbor_chess = function (origin_inst, dir, chess_type, is_wrap_mode)
	{
        if (origin_inst == null)
            return false;
        
        var layout = this.GetLayout();
        var dir_cnt = layout.GetDirCount();
        var origin_uid = origin_inst.uid;
        var tiles_uid = [], i, cnt, neighbor_uid;
        if (dir == ALLDIRECTIONS)
        {
            var i;         
            for (i=0; i<dir_cnt; i++)
            {
                neighbor_uid = this.dir2uid(origin_uid, i, 0, is_wrap_mode);
                if (neighbor_uid != null)
                    tiles_uid.push(neighbor_uid);
            }
        }    
        else if ((dir >= 0) && (dir <dir_cnt))
        {
            neighbor_uid = this.dir2uid(origin_uid, dir, 0, is_wrap_mode);
            if (neighbor_uid != null)
                tiles_uid.push(this.dir2uid(origin_uid, dir, 0, is_wrap_mode));
        }

        return this._pick_chess_on_tiles(chess_type, tiles_uid);;            
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
        var layout = this.GetLayout();
		return { "luid": (layout != null)? layout.uid:(-1),
		         "mx": this.x_max,
                 "my": this.y_max,
                 "xyz2uid": this.board,
                 "uid2xyz": uid2xyz,
                 "iswrap": this.is_wrap_mode };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.layoutUid = o["luid"];
		this.x_max = o["mx"];
        this.y_max = o["my"]; 
        this.board = o["xyz2uid"];
        this.is_wrap_mode = o["iswrap"];
        
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
		if (this.layoutUid === -1)
			this.layout = null;
		else
		{
			this.layout = this.runtime.getObjectByUID(this.layoutUid);
			assert2(this.layout, "Board: Failed to find layout object by UID");
		}
		
		this.layoutUid = -1;
	};
		
	var hash_clean = function (obj)
	{
	    var k;
	    for (k in obj)
	        delete obj[k];
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();        
	  
	Cnds.prototype.IsOccupied = function (x,y,z)
	{
	    if (!this.IsInsideBoard(x,y))
	        return false;	    
	        
		return (this.board[x][y][z] != null);
	};	
	  
	Cnds.prototype.IsEmpty = function (x,y,z)
	{
		return this.IsEmpty(x,y,z);
	}; 
	
	Cnds.prototype.OnCollided = function (objA, objB)
	{
	    this._overlap_test(objA, objB);
		// We've aleady run the event by now.
		return false;
	};
	
	Cnds.prototype.IsOverlapping = function (objA, objB)
	{
	    this._overlap_test(objA, objB);
		// We've aleady run the event by now.
		return false;
	};	
	  
	Cnds.prototype.PointIsInBoard = function (px,py)
	{
		return this.point_is_in_board(px,py);
	}; 
	
	Cnds.prototype.AreNeighbors = function (uidA, uidB)
	{
		return (this.uid2NeighborDir(uidA, uidB) != null);
	};	

	Cnds.prototype.PickAllChess = function ()
	{
	    return this._pick_all_insts();
	};

	Cnds.prototype.OnChessKicked = function (chess_type)
	{
        _uids.length = 0;
        _uids.push(this._kicked_chess_uid);
        var has_inst = this.pickuids(_uids, chess_type);
        _uids.length = 0;
        return has_inst;  
	};	
	
	Cnds.prototype.PickChessAtLXY = function (chess_type, lx, ly)
	{
        if (!chess_type)
            return false;       
        return this._pick_chess_on_LXY(chess_type, lx, ly);            
	};
	Cnds.prototype.PickChessAboveTile = function (chess_type, tile_type)
	{
        if ((!chess_type) || (!tile_type))
            return false;       
        var tiles = tile_type.getCurrentSol().getObjects();
        return this._pick_chess_on_tiles(chess_type, tiles);
	};
	Cnds.prototype.PickChessAboveTileUID = function (chess_type, tile_uid)
	{
        if (!chess_type)
            return;
        if (typeof tile_uid == "number")
        {
            var _xyz = this.uid2xyz(tile_uid);
            if (_xyz == null)
                return false;
	        return this._pick_chess_on_LXY(chess_type, _xyz.x , _xyz.y);
        }
        else
        {
            tile_uid = JSON.parse(tile_uid);
            return this._pick_chess_on_tiles(chess_type, tile_uid);
        }
	};  
	Cnds.prototype.IsOnTheBoard = function (chess_type)
	{
        if (!chess_type)
            return false;       
        var sol = chess_type.getCurrentSol();
        var chess_insts = sol.getObjects();
        var i, cnt=chess_insts.length, uid;
        for (i=0; i<cnt; i++)
        {
            uid = chess_insts[i].uid;
            if (!(uid in this.items))
                return false;
        }
        return true;
	};  	
	Cnds.prototype.PickChessAtLXYZ = function (chess_type, lx, ly, lz)
	{
        if (!chess_type)
            return false;
        return this._pick_chess_on_LXYZ(chess_type, lx, ly, lz);            
	};
	
	Cnds.prototype.PickNeighborChess = function (origin, dir, chess_type)
	{
        if (!origin)
            return false;
               
        return this.pick_neighbor_chess(origin.getFirstPicked(), dir, chess_type);            
	};
	
	var empty_cells=[];
	Cnds.prototype.PickEmptyCell = function (z)
	{
        var x, y;
        empty_cells.length = 0;
        for(x=0; x<=this.x_max; x++)
        {
            for(y=0; y<=this.y_max; y++)
            {                
                if (this.IsEmpty(x,y,z))
                {
                    empty_cells.push([x,y]);
                }
            }
        }
        var cnt = empty_cells.length;
        if (cnt > 0)
        {
             var i = cr.floor(Math.random() * cnt);      
             this._exp_EmptyLX = empty_cells[i][0];
             this._exp_EmptyLY = empty_cells[i][1];
             empty_cells.length = 0;
        }
        return (cnt > 0);
	};
	
	Cnds.prototype.HasEmptyCell = function (z)
	{
        var x, y;
        for(x=0; x<=this.x_max; x++)
        {
            for(y=0; y<=this.y_max; y++)
            {                
                if (this.IsEmpty(x,y,z))
                {
                    this._exp_EmptyLX = x;
                    this._exp_EmptyLY = y;
                    return true;
                }
            }
        }
        return false;
	};

	Cnds.prototype.AreWrappedNeighbors = function (uidA, uidB)
	{
        var dir1 = this.uid2NeighborDir(uidA, uidB, 1);
	    if (dir1 == null)
		    return false;
			
	    var dir0 = this.uid2NeighborDir(uidA, uidB, 0);
		return (dir1 != dir0);
	};
	
	Cnds.prototype.PickChess = function (chess_type)
	{
        if (!chess_type)
            return false;       
        return this._pick_chess(chess_type);            
	};	
	
	Cnds.prototype.PickChessAtLX = function (chess_type, lx)
	{
        if (!chess_type)
            return false;
        return this._pick_chess_on_LX(chess_type, lx);            
	};	
	
	Cnds.prototype.PickChessAtLY = function (chess_type, ly)
	{	    
        if (!chess_type)
            return false;
        return this._pick_chess_on_LY(chess_type, ly);            
	};	
	
	Cnds.prototype.PickChessAtLZ = function (chess_type, lz)
	{
        if (!chess_type)
            return false;
        return this._pick_chess_on_LZ(chess_type, lz);            
	};		

	Cnds.prototype.PickEmptyCellOnTiles = function (tile_type, z)
	{
	    if (!tile_type)
	        return false;	        
	    var tiles = tile_type.getCurrentSol().getObjects();	  
	    
	    empty_cells.length = 0;      
        var xyz, i, cnt=tiles.length;
        for(i=0; i<cnt; i++)
        {
            xyz = this.uid2xyz(tiles[i].uid);
            if (xyz == null)
                continue;
            
            if (this.IsEmpty(xyz.x, xyz.y, z))
            {
                empty_cells.push([xyz.x, xyz.y]);
            }   
        }        
	    
        cnt = empty_cells.length;
        if (cnt > 0)
        {
             var i = cr.floor(Math.random() * cnt);
             this._exp_EmptyLX = empty_cells[i][0];
             this._exp_EmptyLY = empty_cells[i][1];
             empty_cells.length = 0;
        }
        return (cnt > 0);
	};
	
	Cnds.prototype.HasEmptyCellOnTiles = function (tile_type, z)
	{
	    if (!tile_type)
	        return false;
        var tiles = tile_type.getCurrentSol().getObjects();	        
        var xyz, i, cnt=tiles.length;
        for(i=0; i<cnt; i++)
        {
            xyz = this.uid2xyz(tiles[i].uid);
            if (xyz == null)
                continue;
            
            if (this.IsEmpty(xyz.x, xyz.y, z))
            {
                this._exp_EmptyLX = xyz.x;
                this._exp_EmptyLY = xyz.y;
                return true;
            }   
        }
        
        return false;
	};
	Cnds.prototype.IsChessOnBoard = function (chess_type)
	{
	    if (!chess_type)
	        return false;
        var chess = chess_type.getFirstPicked();
        if (!chess)
            return false;
                    
        return !!this.uid2xyz(chess.uid);
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.ResetBoard = function (width,height)
	{
		this.reset_board(width-1, height-1);
	};
		
	Acts.prototype.AddTile = function (objs,x,y)
	{
        var inst = objs.getFirstPicked();
	    this.AddChess(inst,x,y,0);
	};
		
	Acts.prototype.DestroyChess = function (chess_type)
	{
        if (!chess_type)
            return;  
        var chess = chess_type.getCurrentSol().getObjects();
        var i, chess_cnt=chess.length;
        for (i=0; i<chess_cnt; i++)  
        {      
	        this.RemoveChess(chess[i].uid);
	        this.runtime.DestroyInstance(chess[i]);
	    }
	};	
	
	
	Acts.prototype.AddChess = function (obj_type, x, y, z, ignore_tile_checking)
	{
	    if (obj_type == null)
	        return;
	        
	    var inst;
	    if (typeof(obj_type) == "object")
            inst = obj_type.getFirstPicked();
        else    // uid
            inst = obj_type;
            
	    this.AddChess(inst, x, y, z, (ignore_tile_checking === 1));
	};		
    
    Acts.prototype.SetupLayout = function (layout_objs)
	{   
	    if (layout_objs == null)
	        return;
	        
        var layout = layout_objs.instances[0];
        if (layout.check_name == "LAYOUT")
            this.layout = layout;        
        else
            alert ("Board should connect to a layout object");
	};  
		
	Acts.prototype.CreateTile = function (objtype,x,y,layer)
	{
	    this.CreateChess(objtype, x, y, 0, layer);
	};
	
	Acts.prototype.CreateChess = function (objtype, x, y, z, layer, ignore_tile_checking)
	{
	    this.CreateChess(objtype,x,y,z,layer, (ignore_tile_checking === 1));        
	};	
	
	Acts.prototype.RemoveChess = function (chess_type)
	{
        if (!chess_type)
            return;  
        var chess = chess_type.getCurrentSol().getObjects();
        var i, chess_cnt=chess.length;
        for (i=0; i<chess_cnt; i++)        
	        this.RemoveChess(chess[i].uid);
	}; 
	
	Acts.prototype.MoveChess = function (chess_type, tile_objs)
	{	
        var chess_uid = _get_uid(chess_type);
        var tile_uid = _get_uid(tile_objs);
	    if ((chess_uid == null) || (tile_uid == null))
	        return;  
        
        var chess_xyz = this.uid2xyz(chess_uid);
        var tile_xyz = this.uid2xyz(tile_uid);
	    if ((chess_xyz == null) || (tile_xyz == null))
	        return;          
        this.MoveChess(chess_uid, tile_xyz.x, tile_xyz.y, chess_xyz.z);    
	};
	
	Acts.prototype.MoveChess2Index = function (chess_type, x, y, z)
	{		    
        var chess_uid = _get_uid(chess_type);
	    if (chess_uid == null)
	        return;  

	    this.RemoveChess(chess_uid, true);   
        this.AddChess(chess_uid, x, y, z);        
	};   
	
	Acts.prototype.SwapChess = function (uidA, uidB)
	{	
        this.SwapChess(uidA, uidB);
	};	
	
	Acts.prototype.PickAllChess = function ()
	{	
        this._pick_all_insts();
	};	
    	
	Acts.prototype.PickChessAtLXY = function (chess_type, lx, ly)
	{
        if (!chess_type)
            return;       
        this._pick_chess_on_LXY(chess_type, lx, ly);            
	};
	Acts.prototype.PickChessAboveTile = function (chess_type, tile_type)
	{
        if ((!chess_type) || (!tile_type))
            return false;       
        var tiles = tile_type.getCurrentSol().getObjects();
        this._pick_chess_on_tiles(chess_type, tiles);
	};
	Acts.prototype.PickChessAboveTileUID = function (chess_type, tile_uid)
	{
        if (!chess_type)
            return;
        if (typeof tile_uid == "number")
        {
            var _xyz = this.uid2xyz(tile_uid);
            if (_xyz == null)
                return;
	        this._pick_chess_on_LXY(chess_type, _xyz.x , _xyz.y);
        }
        else
        {
            tile_uid = JSON.parse(tile_uid);
            this._pick_chess_on_tiles(chess_type, tile_uid);
        }
	}; 
	
	Acts.prototype.PickChessAtLXYZ = function (chess_type, lx, ly, lz)
	{
        if (!chess_type)
            return;
        this._pick_chess_on_LXYZ(chess_type, lx, ly, lz);            
	};
	Acts.prototype.SetBoardWidth = function (width)
	{
	    this.set_board_width(width-1);
	};
		
	Acts.prototype.SetBoardHeight = function (height)
	{
	    this.set_board_height(height-1);
	};

	Acts.prototype.PickNeighborChess = function (origin, dir, chess_type)
	{        
        if (!origin)
            return false;
               
        this.pick_neighbor_chess(origin.getFirstPicked(), dir, chess_type);      
	};
	
	Acts.prototype.CreateChessAboveTile = function (chess_type, tile_type, lz, layer)
	{        
        if ( (!chess_type) || (tile_type==null) )
            return false; 
                  
        if (typeof(tile_type) == "object")
        {
            var tiles = tile_type.getCurrentSol().getObjects();
            var i, tiles_cnt=tiles.length;
            for (i=0; i<tiles_cnt; i++)  
            {      
                var xyz = this.uid2xyz(tiles[i].uid);
                if (xyz == null)
                    continue;
	            this.CreateChess(chess_type, xyz.x, xyz.y, lz, layer);  
	        }            
        }
        else if (typeof(tile_type) == "number")
        {
            var xyz = this.uid2xyz(tile_type);
            if (xyz == null)
                return;
	        this.CreateChess(chess_type, xyz.x, xyz.y, lz, layer); 
        }
        else if (typeof(tile_type) == "string")
        {
            var tile_uids = JSON.parse(tile_type);
            var i, cnt=tile_uids.length, xyz;
            for (i=0; i<cnt; i++)  
            {
                xyz = this.uid2xyz(tile_uids[i]);
                if (xyz == null)
                    continue;
                this.CreateChess(chess_type, xyz.x, xyz.y, lz, layer);  
            }
        }
	};		
    
	Acts.prototype.FillChess = function (tile_type, layer, lz)
	{
        if (!tile_type)
            return false;  
	    if (lz == null)
		    lz = 0;
        var lx,ly;
        for(ly=0; ly<=this.y_max; ly++)
        {
            for(lx=0; lx<=this.x_max; lx++)
            {
	            this.CreateChess(tile_type,lx,ly,lz,layer);
            }
        }
	};	  

	Acts.prototype.SetWrapMode = function (enable)
	{
        this.is_wrap_mode = (enable == 1);
	};
			
	Acts.prototype.PickChess = function (chess_type)
	{
        if (!chess_type)
            return;       
        this._pick_chess(chess_type);            
	};	
	
	Acts.prototype.PickChessAtLX = function (chess_type, lx)
	{
        if (!chess_type)
            return;
        this._pick_chess_on_LX(chess_type, lx);            
	};	
	
	Acts.prototype.PickChessAtLY = function (chess_type, ly)
	{
        if (!chess_type)
            return;
        this._pick_chess_on_LY(chess_type, ly);            
	};	
	
	Acts.prototype.PickChessAtLZ = function (chess_type, lz)
	{
        if (!chess_type)
            return;
        this._pick_chess_on_LZ(chess_type, lz);            
	};	
    
	Acts.prototype.MoveChessLZ = function (chess_type, z)
	{		    
        var chess_uid = _get_uid(chess_type);
	    if (chess_uid == null)
	        return;  

        var _xyz = this.uid2xyz(chess_uid);
        if (_xyz == null)
            return;
            
        var lx=_xyz.x, ly=_xyz.y;
	    this.RemoveChess(chess_uid);   
        this.AddChess(chess_uid, lx, ly, z);        
	};  
    
	Acts.prototype.MoveChessLXY = function (chess_type, x, y)
	{		    
        var chess_uid = _get_uid(chess_type);
	    if (chess_uid == null)
	        return;  

        var _xyz = this.uid2xyz(chess_uid);
        if (_xyz == null)
            return;
            
        var lz=_xyz.z;
	    this.RemoveChess(chess_uid);   
        this.AddChess(chess_uid, x, y, lz);       
	}; 	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.UID2LX = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var x = (_xyz==null)? (-1):_xyz.x;
		ret.set_int(x);
	};	
	
	Exps.prototype.UID2LY = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var y = (_xyz==null)? (-1):_xyz.y;
		ret.set_int(y);
	};
	
	Exps.prototype.UID2LZ = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var z = (_xyz==null)? (-1):_xyz.z;
		ret.set_any(z);
	};
	
	Exps.prototype.LXYZ2UID = function (ret,_x,_y,_z)
	{
        var uid = this.xyz2uid(_x,_y,_z);
        if (uid == null)
            uid = -1;
	    ret.set_int(uid);
	}; 	
    
	Exps.prototype.LZ2UID = function (ret,uid,_z)
	{
	    var ret_uid = this.lz2uid(uid,_z);
		if (ret_uid == null)
		    ret_uid = (-1);
	    ret.set_int(ret_uid);
	}; 	
    
	Exps.prototype.LXY2PX = function (ret,lx,ly)
	{
        var layout = this.GetLayout();
        var px = layout.LXYZ2PX(lx,ly,0);
	    ret.set_float(px);
	};
    
	Exps.prototype.LXY2PY = function (ret,lx,ly)
	{
        var layout = this.GetLayout();
        var py = layout.LXYZ2PY(lx,ly,0);
	    ret.set_float(py);
	};
    
	Exps.prototype.UID2PX = function (ret,uid)
	{
        var layout = this.GetLayout();
        var _xyz = this.uid2xyz(uid);
        var px = layout.LXYZ2PX(_xyz.x,_xyz.y);
	    ret.set_float(px);
	};
    
	Exps.prototype.UID2PY = function (ret,uid)
	{  
        var layout = this.GetLayout();
        var _xyz = this.uid2xyz(uid);
        var py = layout.LXYZ2PY(_xyz.x,_xyz.y);
	    ret.set_float(py);
	};  
    
	Exps.prototype.UID2LA = function (ret, uid_o, uid_to)
	{
        var layout = this.GetLayout();
        var angle;
        var xyz_o = this.uid2xyz(uid_o);
        var xyz_to = this.uid2xyz(uid_to);
        if ((xyz_o == null) || (xyz_to == null))
            angle = (-1);
        else  
        {      
            angle = layout.XYZ2LA(xyz_o, xyz_to);
            if (angle == null)
                angle = (-1);
        }
	    ret.set_float(angle);
	};  
	
	Exps.prototype.LXYZ2PX = function (ret,lx,ly,lz)
	{
	    ret.set_float( this.GetLayout().LXYZ2PX(lx,ly,lz) );
	};
    
	Exps.prototype.LXYZ2PY = function (ret,lx,ly,lz)
	{
	    ret.set_float( this.GetLayout().LXYZ2PY(lx,ly,lz) );
	};
	    
	Exps.prototype.UID2ZCnt = function (ret,uid)
	{      
        var cnt;
        var _xyz = this.uid2xyz(uid);
        if (_xyz != null)        
            cnt = this.xy2zCnt(_xyz.x, _xyz.y);
        else
            cnt = 0;
	    ret.set_int(cnt);
	}; 
	    
	Exps.prototype.LXY2ZCnt = function (ret,lx,ly)
	{  
        var cnt = this.xy2zCnt(lx,ly);
	    ret.set_int(cnt);
	};
	    
	Exps.prototype.PXY2LX = function (ret,px,py)
	{
	    ret.set_int( this.GetLayout().PXY2LX(px,py) );
	};	
	    
	Exps.prototype.PXY2LY = function (ret,px,py)
	{
        ret.set_int( this.GetLayout().PXY2LY(px,py) );
	};
    
	Exps.prototype.DIR2UID = function (ret,uid,dir,lz)
	{
	    var ret_uid = this.dir2uid(uid,dir,lz);
		if (ret_uid == null)
		    ret_uid = (-1);
	    ret.set_int(ret_uid);
	};
    
	Exps.prototype.BoardWidth = function (ret)
	{
	    ret.set_int(this.x_max+1);
	};   
    
	Exps.prototype.BoardHeight = function (ret)
	{
	    ret.set_int(this.y_max+1);
	}; 

	Exps.prototype.PXY2NearestPX = function (ret,px,py)
	{  
        var layout = this.GetLayout();
	    var lx = layout.PXY2LX(px,py);
	    var ly = layout.PXY2LY(px,py);
        lx = cr.clamp(Math.round(lx), 0, this.x_max);
        ly = cr.clamp(Math.round(ly), 0, this.y_max);
	    ret.set_float(layout.LXYZ2PX(lx,ly,0));
	};	
	    
	Exps.prototype.PXY2NearestPY = function (ret,px,py)
	{  
        var layout = this.GetLayout();
	    var lx = layout.PXY2LX(px,py);
	    var ly = layout.PXY2LY(px,py);
        lx = cr.clamp(Math.round(lx), 0, this.x_max);
        ly = cr.clamp(Math.round(ly), 0, this.y_max);
	    ret.set_float(layout.LXYZ2PY(lx,ly,0));
	};
	
	Exps.prototype.LogicDistance = function (ret, uid_A, uid_B)
	{  
        var xyz_A = this.uid2xyz(uid_A);
        var xyz_B = this.uid2xyz(uid_B);
        var distanc;
        if ((xyz_A == null) || (xyz_B == null))
            distanc = (-1)
        else
            distanc = this.GetLayout().LXYZ2Dist(xyz_B.x, xyz_B.y, xyz_B.z, xyz_A.x, xyz_A.y, xyz_A.z);

	    ret.set_float(distanc);
	};	 

	Exps.prototype.EmptyLX = function (ret)
	{
	    ret.set_int(this._exp_EmptyLX);
	};   
    
	Exps.prototype.EmptyLY = function (ret)
	{
	    ret.set_int(this._exp_EmptyLY);
	};   
    
	Exps.prototype.DirCount = function (ret)
	{   
	    ret.set_int( this.GetLayout().GetDirCount() );
	}; 	
    
	Exps.prototype.NeigborUID2DIR = function (ret, uid_A, uid_B)
	{   
	    var dir = this.uid2NeighborDir(uid_A, uid_B);
	    if (dir == null)
	        dir = (-1);
	    ret.set_int( dir );
	}; 		  
    
	Exps.prototype.ALLDIRECTIONS = function (ret)
	{   
	    ret.set_int( ALLDIRECTIONS );
	}; 	
}());

(function ()
{
    // general CreateObject function which call a callback before "OnCreated" triggered
    if (window.RexC2CreateObject != null)
        return;
        
    // copy from system action: CreateObject
    var CreateObject = function (obj, layer, x, y, callback, ignore_picking)
    {
        if (!layer || !obj)
            return;

        var inst = this.runtime.createInstance(obj, layer, x, y);
		
		if (!inst)
			return;
		
		this.runtime.isInOnDestroy++;
		
		// call callback before "OnCreated" triggered
		if (callback)
		    callback(inst);
		// call callback before "OnCreated" triggered
		
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		
		this.runtime.isInOnDestroy--;

        if (ignore_picking !== true)
        {
            // Pick just this instance
            var sol = obj.getCurrentSol();
            sol.select_all = false;
		    sol.instances.length = 1;
		    sol.instances[0] = inst;
		
		    // Siblings aren't in instance lists yet, pick them manually
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
        }

        // add solModifiers
        //var current_event = this.runtime.getCurrentEventStack().current_event;
        //current_event.addSolModifier(obj);
        // add solModifiers
        
		return inst;
    };
    
    window.RexC2CreateObject = CreateObject;
}());

(function ()
{
    // general pick instances function
    if (window.RexC2PickUIDs != null)
        return;

	var PickUIDs = function (uids, objtype, check_callback)
	{
        var sol = objtype.getCurrentSol();
        sol.instances.length = 0;
        sol.select_all = false;
        var is_family = objtype.is_family;
        var members,member_cnt,i;
        if (is_family)
        {
            members = objtype.members;
            member_cnt = members.length;
        }
        var i,j,uid_cnt=uids.length;
        for (i=0; i<uid_cnt; i++)
        {
            var uid = uids[i];
            var inst = this.runtime.getObjectByUID(uid);
            if (inst == null)
                continue;
            if ((check_callback != null) && (!check_callback(uid)))
                continue;
            
            var type_name = inst.type.name;
            if (is_family)
            {
                for (j=0; j<member_cnt; j++)
                {
                    if (type_name == members[j].name)
                    {
                        sol.instances.push(inst); 
                        break;
                    }
                }
            }
            else
            {
                if (type_name == objtype.name)
                {
                    sol.instances.push(inst);
                }
            }            
        }
        objtype.applySolToContainer();
	    return (sol.instances.length > 0);	    
	};    

    window.RexC2PickUIDs = PickUIDs;
}());