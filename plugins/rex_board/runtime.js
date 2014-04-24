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

	instanceProto.onCreate = function()
	{
        this.check_name = "BOARD";
        this.ActCreateInstance = cr.system_object.prototype.acts.CreateObject;
	    this.board = [];
	    this.reset_board(this.properties[0]-1,
	                     this.properties[1]-1);
        this.layout = null;
        this.layoutUid = -1;    // for loading
        this._kicked_chess_inst = null;
        this._exp_EmptyLX = -1;
        this._exp_EmptyLY = -1;
        
		// Need to know if pinned object gets destroyed
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);        
	};
	
	instanceProto.onDestroy = function ()
	{
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};   
    
    instanceProto.onInstanceDestroyed = function(inst)
    {
        // auto remove uid from board array
        this.remove_item(inst.uid);
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
					    this.remove_item(z_hash[z], true);
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
					    this.remove_item(z_hash[z], true);
				}
		        this.board[x].length = y_max+1;							
		    }		
		}
		this.y_max = y_max;	
	};
	
	instanceProto.is_inside_board = function (x,y,z)
	{
	    var is_in_board = (x>=0) && (y>=0) && (x<=this.x_max) && (y<=this.y_max);
	    if (is_in_board && (z != null))
	        is_in_board = (z in this.board[x][y]);
	    return is_in_board;
	};	
	
	instanceProto.is_empty = function (x,y,z)
	{
	    if (!this.is_inside_board(x,y))
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
	    return (this.is_inside_board(x, y, z))? this.board[x][y][z]:null;
	};
	
	instanceProto.xy2zhash = function(x, y)
	{
	    return (this.is_inside_board(x, y))? this.board[x][y]:null;
	};

	instanceProto.xy2zcnt = function(x, y)
	{
	    var zcnt=0;
	    var z_hash = this.xy2zhash(x, y);
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
	
	instanceProto.dir2uid = function(uid, dir, tz)
	{
	    var o_xyz = this.uid2xyz(uid);
		if (o_xyz == null)
		    return null;
        var layout = this.GetLayout();
	    var tx = layout.GetNeighborLX(o_xyz.x, o_xyz.y, dir);
		var ty = layout.GetNeighborLY(o_xyz.x, o_xyz.y, dir);
	    if (tz == null)
		    tz = o_xyz.z;
		return this.xyz2uid(tx, ty, tz);
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

	instanceProto.CreateItem = function (objtype,lx,ly,lz,_layer)
	{
        if (objtype == null)
            return;
        var layer = (typeof _layer == "number")?
                    this.runtime.getLayerByNumber(_layer):
                    this.runtime.getLayerByName(_layer);  
        if (layer == null)
            return;
         
        var layout = this.GetLayout();         
        var px = layout.LXYZ2PX(lx,ly,lz);
        var py = layout.LXYZ2PY(lx,ly,lz);
        // call system action: Create instance
        this.ActCreateInstance.call(
            this.runtime.system,
            objtype,
            layer,
            px,
            py
        );
                           
	    return objtype.getFirstPicked();
	};
		
	instanceProto.SwapChess = function (uidA, uidB)
	{	
        var xyzA=this.uid2xyz(uidA);
        var xyzB=this.uid2xyz(uidB);
        if ((xyzA == null) || (xyzB == null))
            return false;
        
        var instA = this.uid2inst(uidA);
        var instB = this.uid2inst(uidB);        
	    this.remove_item(uidA);   
	    this.remove_item(uidB);   
        this.add_item(instA, xyzB.x, xyzB.y, xyzB.z);        
        this.add_item(instB, xyzA.x, xyzA.y, xyzA.z);   
        return true;
	};	
    
	instanceProto.add_item = function(inst, _x, _y, _z)
	{                
        // inst could be instance(object) or uid(number)
        if ((inst == null) || (!this.is_inside_board(_x, _y)))
            return;
        
        var is_inst = (typeof(inst) != "number");
        var uid = (is_inst)? inst.uid:inst;
        if (this.uid2inst(uid) != null)  // already on board
            this.remove_item(uid);
        this.remove_item(this.xyz2uid(_x,_y,_z), true);
	    this.board[_x][_y][_z] = uid;
	    this.items[uid] = {x:_x, y:_y, z:_z};
            
        this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnCollided, this);                                           
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
            this._kicked_chess_inst = this.uid2inst(uid);
            this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.OnChessKicked, this); 
        }
        
        delete this.items[uid];
        delete this.board[_xyz.x][_xyz.y][_xyz.z];
	};
	instanceProto.move_item = function(chess_inst, target_x, target_y, target_z)
	{
        if (typeof(chess_inst) == "number")    // uid
            chess_inst = this.uid2inst(chess_inst);
        if (chess_inst == null)
            return;        
	    this.remove_item(chess_inst.uid);   
        this.add_item(chess_inst, target_x, target_y, target_z); 
	}; 
    
	instanceProto.are_neighbor = function (uidA, uidB)
	{
        var xyzA=this.uid2xyz(uidA);
        var xyzB=this.uid2xyz(uidB);
        if ((xyzA == null) || (xyzB == null))
            return false;
        
        var layout = this.GetLayout();
        var dir,dir_cnt=layout.GetDirCount();
        var _are_neighbor = false;
        for(dir=0;dir<dir_cnt;dir++)
        {
            if ((layout.GetNeighborLX(xyzA.x,xyzA.y,dir) == xyzB.x) &&
                (layout.GetNeighborLY(xyzA.x,xyzA.y,dir) == xyzB.y)    )
            {
                _are_neighbor = true;
                break;
            }
        }
        return _are_neighbor;
	};    

	instanceProto.CreateChess = function(obj_type,x,y,z,_layer)
	{
        if ((z != 0) && (!this.is_inside_board(x,y,0)))
            return;
            
        var inst = this.CreateItem(obj_type,x,y,z,_layer);
		if (inst != null)
	        this.add_item(inst,x,y,z);  
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
                
            var z_hash = this.xy2zhash(xyz_A.x, xyz_A.y);
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
    
    var _uids = [];  // private global object
	instanceProto.pickuids = function (uids, chess_type)
	{
        var sol = chess_type.getCurrentSol();
        sol.instances.length = 0;
        sol.select_all = false;
        var is_family = chess_type.is_family;
        var members,member_cnt,i;
        if (is_family)
        {
            members = chess_type.members;
            member_cnt = members.length;
        }
        var i,uid_cnt=uids.length, inst, type_name;
        for (i=0; i<uid_cnt; i++)
        {
            inst = this.uid2inst(uids[i]);	
            if (inst == null)
                continue;
            type_name = inst.type.name;
            if (is_family)
            {
                for (i=0; i<member_cnt; i++)
                {
                    if (type_name == members[i].name)
                    {
                        sol.instances.push(inst); 
                        break;
                    }
                }
            }
            else
            {
                if (type_name == chess_type.name)
                {
                    sol.instances.push(inst);
                }
            }            
        }
        chess_type.applySolToContainer();
	    return (sol.instances.length > 0);	    
	};
    
    var name2type = {};  // private global object
	instanceProto._pick_all_insts = function ()
	{	    
	    var uid, inst, objtype, sol;
	    var uids = this.items;
	    hash_clean(name2type);
	    var has_inst = false;    
	    for (uid in uids)
	    {
	        inst = this.uid2inst(uid);	        
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
    
	instanceProto._pick_chess_on_LXY = function (chess_type, lx, ly)
	{	    
        var z_hash = this.xy2zhash(lx, ly);
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
            z_hash = this.xy2zhash(_xyz.x, _xyz.y);
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
	
	instanceProto._pick_neighbor_chess = function (origin, dir, chess_type)
	{
        if ((!chess_type)||(!origin))
            return false;
            
        var inst = origin.getFirstPicked();
        if (inst == null)
            return false;
        
        var layout = this.GetLayout();
        var origin_uid = inst.uid;
        var tile_uid = [], i, cnt;
        if (dir == (-1))
        {
            var i, cnt = layout.GetDirCount();            
            for (i=0; i<cnt; i++)
            {
                tile_uid.push(this.dir2uid(origin_uid, i, 0));
            }
        }    
        else
        {
            tile_uid.push(this.dir2uid(origin_uid, dir, 0));
        }

        return this._pick_chess_on_tiles(chess_type, tile_uid);;            
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
                 "uid2xyz": uid2xyz };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.layoutUid = o["luid"];
		this.x_max = o["mx"];
        this.y_max = o["my"]; 
        this.board = o["xyz2uid"];
        
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
	    if (!this.is_inside_board(x,y))
	        return false;	    
	        
		return (this.board[x][y][z] != null);
	};	
	  
	Cnds.prototype.IsEmpty = function (x,y,z)
	{
		return this.is_empty(x,y,z);
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
	  
	Cnds.prototype.PointIsInBoard = function (physical_x,physical_y)
	{
		return this.point_is_in_board(physical_x,physical_y);
	}; 
	
	Cnds.prototype.AreNeighbor = function (uidA, uidB)
	{
		return this.are_neighbor(uidA, uidB);
	};	

	Cnds.prototype.PickAllChess = function ()
	{
	    return this._pick_all_insts();
	};

	Cnds.prototype.OnChessKicked = function (chess_type)
	{
        if (!chess_type)
            return false;   
        if (chess_type.is_family)
        {
            var members = chess_type.members;
            var member_cnt = members.length;
            var i,member, is_found=false;
            for (i=0; i<member_cnt; i++)
            {
                member = members[i];
                if (this._kicked_chess_inst.type == member)
                {
                    is_found = true;
                    break;
                }
            }
            if (!is_found)
                return false;
        }
        else
        {
	        if (this._kicked_chess_inst.type != chess_type)	    
	            return false;
        }

        chess_type.getCurrentSol().pick_one(this._kicked_chess_inst);
	    return true;
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
        return this._pick_neighbor_chess(origin, dir, chess_type);            
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
                if (this.is_empty(x,y,z))
                {
                    empty_cells.push([x,y]);
                }
            }
        }
        var cnt = empty_cells.length;
        if (cnt > 0)
        {
             var i = cr.floor(Math.random() * cnt);      
             var empty_cellXY = empty_cells[i];
             this._exp_EmptyLX = empty_cellXY[0];
             this._exp_EmptyLY = empty_cellXY[1];
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
                if (this.is_empty(x,y,z))
                {
                    this._exp_EmptyLX = x;
                    this._exp_EmptyLY = y;
                    return true;
                }
            }
        }
        return false;
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
	    this.add_item(inst,x,y,0);
	};
		
	Acts.prototype.DestroyChess = function (chess_type)
	{
        if (!chess_type)
            return;  
        var chess = chess_type.getCurrentSol().getObjects();
        var i, chess_cnt=chess.length;
        for (i=0; i<chess_cnt; i++)  
        {      
	        this.remove_item(chess[i].uid);
	        this.runtime.DestroyInstance(chess[i]);
	    }
	};	
	
	
	Acts.prototype.AddChess = function (objs,x,y,z)
	{
        var inst = objs.getFirstPicked();
	    this.add_item(inst,x,y,z);
	};		
    
    Acts.prototype.SetupLayout = function (layout_objs)
	{   
        var layout = layout_objs.instances[0];
        if (layout.check_name == "LAYOUT")
            this.layout = layout;        
        else
            alert ("Board should connect to a layout object");
	};  
		
	Acts.prototype.CreateTile = function (_obj_type,x,y,_layer)
	{
	    this.CreateChess(_obj_type,x,y,0,_layer);
	};
	
	Acts.prototype.CreateChess = function (_obj_type,x,y,z,_layer)
	{ 
	    this.CreateChess(_obj_type,x,y,z,_layer);        
	};	
	
	Acts.prototype.RemoveChess = function (chess_type)
	{
        if (!chess_type)
            return;  
        var chess = chess_type.getCurrentSol().getObjects();
        var i, chess_cnt=chess.length;
        for (i=0; i<chess_cnt; i++)        
	        this.remove_item(chess[i].uid);
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
        this.move_item(chess_uid, tile_xyz.x, tile_xyz.y, chess_xyz.z);    
	};
	
	Acts.prototype.MoveChess2Index = function (chess_type, x, y, z)
	{		    
        var chess_uid = _get_uid(chess_type);
	    if (chess_uid == null)
	        return;  

	    this.remove_item(chess_uid, true);   
        this.add_item(chess_uid, x, y, z);        
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
        this._pick_neighbor_chess(origin, dir, chess_type);            
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
		ret.set_int(z);
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
    
	Exps.prototype.LXY2PX = function (ret,logic_x,logic_y)
	{
        var layout = this.GetLayout();
        var px = layout.LXYZ2PX(logic_x,logic_y,0);
	    ret.set_float(px);
	};
    
	Exps.prototype.LXY2PY = function (ret,logic_x,logic_y)
	{
        var layout = this.GetLayout();
        var py = layout.LXYZ2PY(logic_x,logic_y,0);
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
	
	Exps.prototype.LXYZ2PX = function (ret,logic_x,logic_y,logic_z)
	{
        var layout = this.GetLayout();
        var px = layout.LXYZ2PX(logic_x,logic_y,logic_z);
	    ret.set_float(px);
	};
    
	Exps.prototype.LXYZ2PY = function (ret,logic_x,logic_y,logic_z)
	{
        var layout = this.GetLayout();
        var py = layout.LXYZ2PY(logic_x,logic_y,logic_z);
	    ret.set_float(py);
	};
	    
	Exps.prototype.UID2ZCnt = function (ret,uid)
	{      
        var cnt;
        var _xyz = this.uid2xyz(uid);
        if (_xyz != null)        
            cnt = this.xy2zcnt(_xyz.x, _xyz.y);
        else
            cnt = 0;
	    ret.set_int(cnt);
	}; 
	    
	Exps.prototype.LXY2ZCnt = function (ret,logic_x,logic_y)
	{  
        var cnt = this.xy2zcnt(logic_x,logic_y);
	    ret.set_int(cnt);
	};
	    
	Exps.prototype.PXY2LX = function (ret,physical_x,physical_y)
	{  
        var layout = this.GetLayout();
	    var lx = layout.PXY2LX(physical_x,physical_y);
		if ((lx<0) || (lx>this.x_max))
		    lx = -1;
	    ret.set_int(lx);
	};	
	    
	Exps.prototype.PXY2LY = function (ret,physical_x,physical_y)
	{
        var layout = this.GetLayout();
	    var ly = layout.PXY2LY(physical_x,physical_y);
		if ((ly<0) || (ly>this.y_max))
		    ly = -1;		
	    ret.set_int(ly);
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

	Exps.prototype.PXY2NearestPX = function (ret,physical_x,physical_y)
	{  
        var layout = this.GetLayout();
	    var lx = layout.PXY2LX(physical_x,physical_y);
	    var ly = layout.PXY2LY(physical_x,physical_y);
        lx = cr.clamp(Math.round(lx), 0, this.x_max);
        ly = cr.clamp(Math.round(ly), 0, this.y_max);
	    ret.set_float(layout.LXYZ2PX(lx,ly,0));
	};	
	    
	Exps.prototype.PXY2NearestPY = function (ret,physical_x,physical_y)
	{  
        var layout = this.GetLayout();
	    var lx = layout.PXY2LX(physical_x,physical_y);
	    var ly = layout.PXY2LY(physical_x,physical_y);
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
        {
            var dx = xyz_B.x - xyz_A.x;
            var dy = xyz_B.y - xyz_A.y;
            distanc = Math.sqrt(dx*dx + dy*dy);
        }
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
}());