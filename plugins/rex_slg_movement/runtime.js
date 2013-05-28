// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SLGMovement = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SLGMovement.prototype;
		
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
	    this.exp_ChessUID = -1;
	    this.exp_TileUID = -1;
        this.exp_TileX = -1;        
        this.exp_TileY = -1;         
	    
	    this.path_mode = this.properties[0];
	                     
        this.board = null;
        this.boardUid = -1;    // for loading         
        this.group = null;
        this.groupUid = -1;    // for loading        
        this.randomGen = null;
        this.randomGenUid = -1;    // for loading
        this._skip_first = null;
        this._cost_fn_name = null;
        this._filter_fn_name = null;
        this._cost_value = 0;
        this._filter_uid_list = [];
        this._is_cost_fn = null;
        this._tiles = {};
        this._tile2cost = {};
		this._neighbors = [];  // call this._neighbors_init at action:Setup

        this._chess_xyz = null;
        this._hit_dist_tile = false; 
	};

	instanceProto.is_inside_board = function (x,y,z)
	{
        assert2(this.board, "SLG movement should connect to a board object");
	    return this.board.is_inside_board(x,y,z);
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
        assert2(this.board, "SLG movement should connect to a board object");
	    return this.board.xyz2uid(x, y, z);
	};
	
	instanceProto.uid2xyz = function(uid)
	{
        assert2(this.board, "SLG movement should connect to a board object");
	    return this.board.uid2xyz(uid);
	};
	
	instanceProto.lz2uid = function(uid,lz)
	{
        assert2(this.board, "SLG movement should connect to a board object");
	    return this.board.lz2uid(uid,lz);
	};	
	
	var prop_BLOCKING = -1;
	instanceProto._get_cost = function(tile_uid, tile_x, tile_y)
	{
	    var cost;
	    if (this._is_cost_fn)
	    {
            cost = this._tile2cost[tile_uid];
            if (cost != null)
                return cost;            
	        this.exp_TileUID = tile_uid;
	        this.exp_TileX = tile_x;
	        this.exp_TileY = tile_y;              
	        this._cost_value = prop_BLOCKING;
	        this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnCostFn, this);
	        cost = this._cost_value;
            this._tile2cost[tile_uid] = cost;
	    }
	    else
	        cost = this._cost_fn_name;        
	    return cost; 
	};
	
	instanceProto._neighbors_init = function(dir_count)
	{
	    var i;
		for (i=0; i<dir_count; i++)
		{
		    this._neighbors.push({dir:i, x:0, y:0});
		}
	};	
	
	instanceProto._get_neighbors = function(_x,_y)
	{
	    if (this._neighbors.length == 0)
	        this._neighbors_init(this.board.layout.GetDirCount());
	    var dir;
	    var layout = this.board.layout;
	    var neighbors_cnt = this._neighbors.length;	    
        for (dir=0; dir<neighbors_cnt; dir++)
        {
            this._neighbors[dir].x = layout.GetNeighborLX(_x,_y, dir);
            this._neighbors[dir].y = layout.GetNeighborLY(_x,_y, dir);
        }
        return this._neighbors;
	};	
	
	instanceProto._get_pre_tile = function(pre_tiles, pre_dir)
	{
	    var pre_tiles_cnt = pre_tiles.length;
	    var pre_tile;
	    if (pre_tiles_cnt == 1)
	        pre_tile = pre_tiles[0];
	    else
	    {
	        switch (this.path_mode)
	        {
	        case 0:  
                var random_value = (this.randomGen == null)?
			                        Math.random(): this.randomGen.random();
	            var i = Math.floor(random_value*pre_tiles_cnt);
	            pre_tile = pre_tiles[i];
	            break;
	        case 1:  
	            var i;
	            for(i=0;i<pre_tiles_cnt;i++)
	            {
	                pre_tile = pre_tiles[i];
	                if (pre_dir != pre_tile.dir)
	                    break;
	            }	            
	            break;
	        case 2:  
	            var i;
	            for(i=0;i<pre_tiles_cnt;i++)
	            {
	                pre_tile = pre_tiles[i];
	                if (pre_dir == pre_tile.dir)
	                    break;
	            }	            
	            break;	            
	        }
	    }
	    return pre_tile;
	};
	
	instanceProto.get_path_tiles = function(tiles, start_uid, end_uid)
	{
	    var path_tiles = [];
	    var _uid = end_uid;	
	    var pre_tile;    
	    var pre_dir = null;
	    while (_uid != start_uid)
	    {
	        path_tiles.push(_uid);
	        pre_tile = this._get_pre_tile(tiles[_uid].pre_tile, pre_dir);
	        _uid = pre_tile.uid;
	        pre_dir = pre_tile.dir;
	    }
	    return path_tiles.reverse();
	};
	
    instanceProto._get_moveable_tile_setup = function(cost)
    {
	    this._cost_fn_name = cost;
	    this._is_cost_fn = (typeof cost == "string");        
	    this._skip_first = true;        
        this._hit_dist_tile = false;          
        var uid;
        for (uid in this._tiles)
	        delete this._tiles[uid];
        for (uid in this._tile2cost)
            delete this._tile2cost[uid];
    };
    
	instanceProto._get_moveable_tile = function(start_tile_uid, end_tile_uid, moving_points, cost)
	{
        //debugger;
        var tile_xyz;
	    this._get_moveable_tile_setup(cost);        
        if (start_tile_uid == null)
            return; 
        
        if (end_tile_uid != null)
        {
            tile_xyz = this.uid2xyz(end_tile_uid);
            if (this._get_cost(end_tile_uid, tile_xyz.x, tile_xyz.y) == prop_BLOCKING)
                return;
        }

        var tile_uid, at_chess_xy, tile_cost, node, remain_cost, next_tile_uid, neighbors, pre_tile_uid, direction, remain;
        var tile_obj = {remain_moving_points:moving_points, 
                        tile_uid:start_tile_uid, 
                        pre_tile_uid:null, direction:null};
        var tile_queue = [tile_obj];
        
        while (tile_queue.length>0)
        {
            tile_obj = tile_queue.shift();
            tile_uid = tile_obj.tile_uid;
            pre_tile_uid = tile_obj.pre_tile_uid;
            direction = tile_obj.direction;
            remain = tile_obj.remain_moving_points;
                
            tile_xyz = this.uid2xyz(tile_uid);
            at_chess_xy = ((tile_xyz.x==this._chess_xyz.x) && (tile_xyz.y==this._chess_xyz.y));
            if (this._skip_first)  // start from chess's tile
                this._skip_first = false;
            else if (!at_chess_xy)  // try to move to this tile
            {
                tile_cost = this._get_cost(tile_uid, tile_xyz.x, tile_xyz.y);
	            if (tile_cost == prop_BLOCKING)  // is a blocking property tile
	                continue;
                remain -= tile_cost;
	        
                if (remain >= 0)  // can move to this tile
	            {
	                //console.log(pre_tile_uid+"->"+tile_uid+":remain="+remain);
	                node = this._tiles[tile_uid];
	                if (node == null)
	                {
    	                //console.log("Create:["+tile_uid+"]="+pre_tile_uid);
	                    node = {cost:remain, pre_tile:[ {uid:pre_tile_uid, dir:direction} ] };	
	                    this._tiles[tile_uid] = node;                
	                }
	                else
	                {
	                    remain_cost = node.cost;
	                    if (remain > remain_cost)  // move to the same tile and pay less cost
	                    {
	                        //console.log("Reset:["+tile_uid+"]="+pre_tile_uid);
                            node.cost = remain;
	                        node.pre_tile.length = 1;
	                        node.pre_tile[0] = {uid:pre_tile_uid, dir:direction};
	                    }
	                    else if (remain == remain_cost)  // move to the same tile and pay the same cost
	                    {
	                        //console.log("Push:["+tile_uid+"]+="+pre_tile_uid);
	                        node.pre_tile.push({uid:pre_tile_uid, dir:direction});
	                        continue;   // leave
	                    }   
	                    else  // move to the same tile but pay more cost
	                        continue;
	                }
	            }                 
            }
            else
                continue;
                
      	    // arrive distance tile
      	    if ((tile_uid == end_tile_uid) && (remain >= 0))
            {
                //console.log("Hit target "+tile_uid);
      	        this._hit_dist_tile = true;
      	        return;
      	    }
      	    // get next moveable tiles
      	    else if (remain > 0)
	        {
 	            neighbors = this._get_neighbors(tile_xyz.x, tile_xyz.y);
	            var neighbors_cnt = neighbors.length;
	            var i, neighbor_xy;
	            for(i=0;i<neighbors_cnt;i++)
	            {
    	            neighbor_xy = neighbors[i];
	                next_tile_uid = this.xyz2uid(neighbor_xy.x, neighbor_xy.y, 0);
	                if ((next_tile_uid != null) && (pre_tile_uid != next_tile_uid))
                    {
                        tile_obj = {remain_moving_points:remain, 
                                    tile_uid:next_tile_uid, 
                                    pre_tile_uid:tile_uid, direction:neighbor_xy.dir};
                        tile_queue.push(tile_obj);
                    }
	            }
                
                continue;
    	    }
              
        }
	};
	
	instanceProto.get_moveable_area = function(chess_uid, moving_points, cost)
	{
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    var start_tile_uid = this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0);
	    this._get_moveable_tile(start_tile_uid, null, moving_points, cost);
	    return this._tiles;
	};
	
	instanceProto.get_moving_path = function (chess_uid, end_tile_uid, moving_points, cost)
	{
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    var start_tile_uid = this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0);
	    this._get_moveable_tile(start_tile_uid, end_tile_uid, moving_points, cost);
	    var path_tiles = (this._hit_dist_tile)? 
	                      this.get_path_tiles(this._tiles, start_tile_uid, end_tile_uid): null;
	    return path_tiles;
	};
	
	instanceProto.saveToJSON = function ()
	{    
		return { "boarduid": (this.board != null)? this.board.uid:(-1),
		         "groupuid": (this.group != null)? this.group.uid:(-1),
		         "randomuid": (this.randomGen != null)? this.randomGen.uid:(-1), };
	};
	
	instanceProto.loadFromJSON = function (o)
	{
	    this.boardUid = o["boarduid"];
		this.groupUid = o["groupuid"];
		this.randomGenUid = o["randomuid"];		       
	};
	
	instanceProto.afterLoad = function ()
	{
		if (this.boardUid === -1)
			this.board = null;
		else
		{
			this.board = this.runtime.getObjectByUID(this.boardUid);
			assert2(this.board, "SLG movement: Failed to find board object by UID");
		}		
		this.boardUid = -1;
		
		if (this.groupUid === -1)
			this.group = null;
		else
		{
			this.group = this.runtime.getObjectByUID(this.groupUid);
			assert2(this.group, "SLG movement: Failed to find instance group object by UID");
		}		
		this.groupUid = -1;	
		
		if (this.randomGenUid === -1)
			this.randomGen = null;
		else
		{
			this.randomGen = this.runtime.getObjectByUID(this.randomGenUid);
			assert2(this.randomGen, "SLG movement: Failed to find random gen object by UID");
		}		
		this.randomGenUid = -1;			
			
	};
		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();        

	Cnds.prototype.OnCostFn = function (name)
	{
        return (this._cost_fn_name == name);
	};    

	Cnds.prototype.OnFilterFn = function (name)
	{
        return (this._filter_fn_name == name);
	}; 	
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
    
    Acts.prototype.Setup = function (board_objs, group_objs)
	{
        var board = board_objs.instances[0];
        if (board.check_name == "BOARD")
            this.board = board;        
        else
            alert ("SLG movement should connect to a board object");		
            
        var group = group_objs.instances[0];
        if (group.check_name == "INSTGROUP")
            this.group = group;        
        else
            alert ("SLG movement should connect to a instance group object");            
	};   
    
    Acts.prototype.SetCost = function (cost_value)
	{
	    if ((cost_value < 0) && (cost_value != prop_BLOCKING))
	        cost_value = 0;
        this._cost_value = cost_value;           
	}; 
    
    Acts.prototype.AppendFilter = function (filter_uid)
	{
        if (this._filter_uid_list.indexOf(filter_uid) == (-1))
            this._filter_uid_list.push(filter_uid);
	}; 	   
	 
	Acts.prototype.GetMoveableArea = function (chess_objs, moving_points, cost, filter_name, group_name)
	{	        	
	    assert2(this.board, "SLG movement should connect to a board object");
	    assert2(this.group, "SLG movement should connect to a instance group object"); 
	       
	    var chess_uid = _get_uid(chess_objs);	    	        
	    var _xyz = this.uid2xyz(chess_uid);
	    if ((_xyz == null) || (moving_points<=0))
	        return;
	    
	    this.exp_ChessUID = chess_uid;
		var tiles_uids = this.get_moveable_area(chess_uid, moving_points, cost);
	    var uid, _xyz;
	    this._filter_uid_list.length = 0;	    
        this._filter_fn_name = filter_name;
	    for(uid in tiles_uids)
		{
		    this.exp_TileUID = parseInt(uid);
            _xyz = this.uid2xyz(this.exp_TileUID);
	        this.exp_TileX = _xyz.x;
	        this.exp_TileY = _xyz.y;             
	        if (filter_name != "")
	            this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnFilterFn, this);
	        else
	            this._filter_uid_list.push(uid);
		}
		this.group.GetGroup(group_name).SetByUIDList(this._filter_uid_list);
	};  
		
	Acts.prototype.GetMovingPath = function (chess_objs, tile_objs, moving_points, cost, group_name)	
	{        
	    assert2(this.board, "SLG movement should connect to a board object");
	    assert2(this.group, "SLG movement should connect to a instance group object"); 
	      	    
	    var chess_uid = _get_uid(chess_objs);
	    var tile_uid = _get_uid(tile_objs);
	    if ((chess_uid == null) || (tile_uid == null) || (moving_points<=0))
	        return;
	    if (this.uid2xyz(chess_uid) == null)
		    return;		
        tile_uid = this.lz2uid(tile_uid, 0);
		if (tile_uid == null)
		    return;
			
        this.exp_ChessUID = chess_uid;
	    var path_tiles_uids = this.get_moving_path(chess_uid,tile_uid,moving_points, cost);
        if (path_tiles_uids != null)
	        this.group.GetGroup(group_name).SetByUIDList(path_tiles_uids);	  
        else
            this.group.GetGroup(group_name).Clean();	  
	};	  	
	
    Acts.prototype.SetRandomGenerator = function (randomGen_objs)
	{
        var randomGen = randomGen_objs.instances[0];
        if (randomGen.check_name == "RANDOM")
            this.randomGen = randomGen;        
        else
            alert ("[slg movement] This object is not a random generator object.");
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();
	
	Exps.prototype.ChessUID = function (ret)
	{
	    ret.set_int(this.exp_ChessUID);
	};
	
    Exps.prototype.TileUID = function (ret)
    {
        ret.set_int(this.exp_TileUID);
    };	
	
    Exps.prototype.BLOCKING = function (ret)
    {
        ret.set_int(prop_BLOCKING);
    };	
    	
    Exps.prototype.TileX = function (ret)
    {
        ret.set_int(this.exp_TileX);
    };
    	
    Exps.prototype.TileY = function (ret)
    {
        ret.set_int(this.exp_TileY);
    };    
}());