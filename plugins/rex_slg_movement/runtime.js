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
	    this.exp_ChessUID =0;
	    this.exp_TileUID =0;	   
	    
	    this.is_tetragon_grid = (this.properties[0]==0);
	    this.path_mode = this.properties[1];
	                     
        this.board = null; 
        this.group = null;
        this._skip_first = null;
        this._cost_fn_name = null;
        this._filter_fn_name = null;
        this._cost_value = 0;
        this._filter_uid_list = [];
        this._is_cost_fn = null;
        this._tiles = {};
        this._chess_xyz = null;
        this._dist_tile_uid = null;
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
	
	var prop_BLOCKING = -1;
	instanceProto._get_cost = function(tile_uid)
	{
	    var cost;
	    if (this._is_cost_fn)
	    {
	        this.exp_TileUID = tile_uid;
	        this._cost_value = 0;
	        this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnCostFn, this);
	        cost = this._cost_value;
	    }
	    else
	        cost = this._cost_fn_name;
	    return cost; 
	};
	
	instanceProto._get_neighbors = function(_x,_y)
	{
	    var neighbors;
        if (this.is_tetragon_grid)
        {
            neighbors= [{dir:0, x:_x+1, y:_y}, {dir:1, x:_x, y:_y+1},
                        {dir:2, x:_x-1, y:_y}, {dir:3, x:_x, y:_y-1}];
        }
        else
        {
            // TODO
        }
        return neighbors;
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
	            var i = Math.floor(Math.random()*pre_tiles_cnt);
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
	
	instanceProto._get_moveable_tile = function(tile_uid, moving_points, pre_tile_uid, direction)
	{
	    if (tile_uid == null)
	        return;

	    var tile_xyz = this.uid2xyz(tile_uid);
	    var at_chess_xy = ((tile_xyz.x==this._chess_xyz.x) && (tile_xyz.y==this._chess_xyz.y));
	    var remain;

        if (this._skip_first)  // start from chess's tile
        {
            remain = moving_points;
            this._skip_first = false;
        }
        else if (!at_chess_xy)  // try to move to this tile
        {
	        var tile_cost = this._get_cost(tile_uid);
	        
	        if (tile_cost == prop_BLOCKING)
	        {
	            // is a blocking property tile
	            return;
	        }
	        	        
	        if (tile_cost == null)
	        {
	            // maybe an error?
	            return;
	        }
	            
	        remain = moving_points - tile_cost;
	        
	        if (remain >= 0)  // can move to this tile
	        {
	            //console.log(pre_tile_uid+"->"+tile_uid+":remain="+remain);
	            var node = this._tiles[tile_uid];
	            if (node == null)
	            {
	                //console.log("Create:["+tile_uid+"]="+pre_tile_uid);
	                node = {cost:remain, pre_tile:[ {uid:pre_tile_uid, dir:direction} ] };	
	                this._tiles[tile_uid] = node;                
	            }
	            else
	            {
	                var remain_cost = node.cost;
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
	                    return;   // leave
	                }   
	                else  // move to the same tile but pay more cost
	                    return;
	            }
	        }         
      	}
      	else  // at_chess_xy && !this._skip_first : go back to chess's tile
      	{
      	    return;
      	}

      	// arrive distance tile
      	if ((tile_uid == this._dist_tile_uid) && (remain >= 0))
        {
      	    this._hit_dist_tile = true;
      	    return;
      	}
      	// get next moveable tiles
      	else if (remain > 0)
	    {
	        var next_tile_uid;
	        if (this.is_tetragon_grid)
	        {
	            var neighbors = this._get_neighbors(tile_xyz.x, tile_xyz.y);
	            var neighbors_cnt = neighbors.length;
	            var i, neighbor_xy;
	            for(i=0;i<neighbors_cnt;i++)
	            {
	                neighbor_xy = neighbors[i];
	                next_tile_uid = this.xyz2uid(neighbor_xy.x, neighbor_xy.y, 0);
	                if (pre_tile_uid != next_tile_uid)
	                    this._get_moveable_tile(next_tile_uid, remain, tile_uid, neighbor_xy.dir);	                
	            }
	        }
	    }
	};
	
	instanceProto.get_moveable_area = function(chess_uid, moving_points, cost)
	{
	    //this.exp_ChessUID = chess_uid;
	    this._skip_first = true;
	    this._cost_fn_name = cost;
	    this._is_cost_fn = (typeof cost == "string");
	    this._tiles = {};
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    this._dist_tile_uid = null;
	    var start_tile_uid = this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0);
	    this._get_moveable_tile(start_tile_uid, moving_points, null, null);
	    return this._tiles;
	};
	
	instanceProto.get_moving_path = function (chess_uid, end_tile_uid, moving_points, cost)
	{
	    //this.exp_ChessUID = chess_uid;
	    this._skip_first = true;
	    this._cost_fn_name = cost;
	    this._is_cost_fn = (typeof cost == "string");
	    this._tiles = {};
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    this._dist_tile_uid = end_tile_uid;
	    this._hit_dist_tile = false;
	    var start_tile_uid = this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0);
	    this._get_moveable_tile(start_tile_uid, moving_points, null, null);
	    var path_tiles = (this._hit_dist_tile)? 
	                      this.get_path_tiles(this._tiles, start_tile_uid, end_tile_uid): null;
	    return path_tiles;
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;        

	cnds.OnCostFn = function (name)
	{
        return (this._cost_fn_name == name);
	};    

	cnds.OnFilterFn = function (name)
	{
        return (this._filter_fn_name == name);
	}; 	
	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
    
    acts.Setup = function (board_objs, group_objs)
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
    
    acts.SetCost = function (cost_value)
	{
	    if ((cost_value < 0) && (cost_value != prop_BLOCKING))
	        cost_value = 0;
        this._cost_value = cost_value;           
	}; 
    
    acts.AppendFilter = function (filter_uid)
	{
        this._filter_uid_list.push(filter_uid);
	}; 	   
	 
	acts.GetMoveableArea = function (chess_objs, moving_points, cost, filter, group_name)
	{	        	    
	    var chess_uid = _get_uid(chess_objs);	    	        
	    var _xyz = this.uid2xyz(chess_uid);
	    if ((_xyz == null) || (moving_points<=0))
	        return;
	    
	    this.exp_ChessUID = chess_uid;
		var tiles_uids = this.get_moveable_area(chess_uid, moving_points, cost);
	    var uid;
	    var avaiable_uids = [];  
        this._filter_fn_name = filter;
	    for(uid in tiles_uids)
		{
		    this.exp_TileUID = parseInt(uid);
	        if (filter != "")
	        {
	            this._filter_uid_list.length = 0;
	            this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnFilterFn, this);
	        }
	        else
	        {
		        this._filter_uid_list.length = 1;  
	            this._filter_uid_list[0] = uid;
	        }
	        
            var i;
	        var len = this._filter_uid_list.length;
	        for (i=0; i<len; i++)
	            avaiable_uids.push(this._filter_uid_list[i]);
		}
		this.group.GetGroup(group_name).SetByUIDList(avaiable_uids);
		this._filter_uid_list.length = 0;
	};  
		
	acts.GetMovingPath = function (chess_objs, tile_objs, moving_points, cost, group_name)	
	{        
	    var chess_uid = _get_uid(chess_objs);
	    var tile_uid = _get_uid(tile_objs);
	    if ((chess_uid == null) || (tile_uid == null) || (moving_points<=0))
	        return;

        this.exp_ChessUID = chess_uid;
	    var path_tiles_uids = this.get_moving_path(chess_uid,tile_uid,moving_points, cost);
        if (path_tiles_uids != null)
	        this.group.GetGroup(group_name).SetByUIDList(path_tiles_uids);	    		      	       
	};	  	
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.ChessUID = function (ret)
	{
	    ret.set_int(this.exp_ChessUID);
	};
	
    exps.TileUID = function (ret)
    {
        ret.set_int(this.exp_TileUID);
    };	
	
    exps.BLOCKING = function (ret)
    {
        ret.set_int(prop_BLOCKING);
    };	
}());