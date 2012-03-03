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
	    this.exp_BrickUID =0;	   
	    
	    this.is_tetragon_grid = (this.properties[0]==0);
	    this.path_mode = this.properties[1];
	                     
        this.board = null; 
        this.group = null;
        this._skip_first = null;
        this._cost_fn_name = null;
        this._filter_fn_name = null;
        this._cost_value = 0;
        this._filter_uid = 0;
        this._is_cost_fn = null;
        this._bricks = {};
        this._chess_xyz = null;
        this._dist_brick_uid = null;
        this._hit_dist_brick = false;   
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
	
	instanceProto._get_cost = function(brick_uid)
	{
	    var cost;
	    if (this._is_cost_fn)
	    {
	        this.exp_BrickUID = brick_uid;
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
	
	instanceProto._get_pre_brick = function(pre_bricks, pre_dir)
	{
	    var pre_bricks_cnt = pre_bricks.length;
	    var pre_brick;
	    if (pre_bricks_cnt == 1)
	        pre_brick = pre_bricks[0];
	    else
	    {
	        switch (this.path_mode)
	        {
	        case 0:  
	            var i = Math.floor(Math.random()*pre_bricks_cnt);
	            pre_brick = pre_bricks[i];
	            break;
	        case 1:  
	            var i;
	            for(i=0;i<pre_bricks_cnt;i++)
	            {
	                pre_brick = pre_bricks[i];
	                if (pre_dir != pre_brick.dir)
	                    break;
	            }	            
	            break;
	        }
	    }
	    return pre_brick;
	};
	
	instanceProto.get_path_bricks = function(bricks, start_uid, end_uid)
	{
	    var path_bricks = [];
	    var _uid = end_uid;	
	    var pre_brick;    
	    var pre_dir = null;
	    while (_uid != start_uid)
	    {
	        path_bricks.push(_uid);
	        pre_brick = this._get_pre_brick(bricks[_uid].pre_brick, pre_dir);
	        _uid = pre_brick.uid;
	        pre_dir = pre_brick.dir;
	    }
	    return path_bricks.reverse();
	};
	
	instanceProto._get_moveable_brick = function(brick_uid, moving_points, pre_brick_uid, direction)
	{
	    if (brick_uid == null)
	        return;

	    var brick_xyz = this.uid2xyz(brick_uid);
	    var at_chess_xy = ((brick_xyz.x==this._chess_xyz.x) && (brick_xyz.y==this._chess_xyz.y));
	    var remain;

        if (this._skip_first)  // start from chess's brick
        {
            remain = moving_points;
            this._skip_first = false;
        }
        else if (!at_chess_xy)  // try to move to this brick
        {
	        var brick_cost = this._get_cost(brick_uid);
	        if (brick_cost == null)
	        {
	            // maybe an error?
	            return;
	        }
	            
	        remain = moving_points - brick_cost;
	        
	        if (remain >= 0)  // can move to this brick
	        {
	            //console.log(pre_brick_uid+"->"+brick_uid+":remain="+remain);
	            var node = this._bricks[brick_uid];
	            if (node == null)
	            {
	                //console.log("Create:["+brick_uid+"]="+pre_brick_uid);
	                node = {cost:remain, pre_brick:[ {uid:pre_brick_uid, dir:direction} ] };	
	                this._bricks[brick_uid] = node;                
	            }
	            else
	            {
	                var remain_cost = node.cost;
	                if (remain > remain_cost)  // move to the same brick and pay less cost
	                {
	                    //console.log("Reset:["+brick_uid+"]="+pre_brick_uid);
	                    node.pre_brick.length = 1;
	                    node.pre_brick[0] = {uid:pre_brick_uid, dir:direction};
	                }
	                else if (remain == remain_cost)  // move to the same brick and pay the same cost
	                {
	                    //console.log("Push:["+brick_uid+"]+="+pre_brick_uid);
	                    node.pre_brick.push({uid:pre_brick_uid, dir:direction});
	                    return;   // leave
	                }   
	                else  // move to the same brick but pay more cost
	                    return;
	            }
	        }         
      	}
      	else  // at_chess_xy && !this._skip_first : go back to chess's brick
      	{
      	    return;
      	}

      	// arrive distance brick
      	if ((brick_uid == this._dist_brick_uid) && (remain >= 0))
        {
      	    this._hit_dist_brick = true;
      	    return;
      	}
      	// get next moveable bricks
      	else if (remain > 0)
	    {
	        var next_brick_uid;
	        if (this.is_tetragon_grid)
	        {
	            var neighbors = this._get_neighbors(brick_xyz.x, brick_xyz.y);
	            var neighbors_cnt = neighbors.length;
	            var i, neighbor_xy;
	            for(i=0;i<neighbors_cnt;i++)
	            {
	                neighbor_xy = neighbors[i];
	                next_brick_uid = this.xyz2uid(neighbor_xy.x, neighbor_xy.y, 0);
	                if (pre_brick_uid != next_brick_uid)
	                    this._get_moveable_brick(next_brick_uid, remain, brick_uid, neighbor_xy.dir);	                
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
	    this._bricks = {};
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    this._dist_brick_uid = null;
	    var start_brick_uid = this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0);
	    this._get_moveable_brick(start_brick_uid, moving_points, null, null);
	    return this._bricks;
	};
	
	instanceProto.get_moving_path = function (chess_uid, end_brick_uid, moving_points, cost)
	{
	    //this.exp_ChessUID = chess_uid;
	    this._skip_first = true;
	    this._cost_fn_name = cost;
	    this._is_cost_fn = (typeof cost == "string");
	    this._bricks = {};
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    this._dist_brick_uid = end_brick_uid;
	    this._hit_dist_brick = false;
	    var start_brick_uid = this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0);
	    this._get_moveable_brick(start_brick_uid, moving_points, null, null);
	    var path_bricks = (this._hit_dist_brick)? 
	                      this.get_path_bricks(this._bricks, start_brick_uid, end_brick_uid): null;
	    return path_bricks;
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
        if (group.check_name == "GROUP")
            this.group = group;        
        else
            alert ("SLG movement should connect to a instance group object");            
	};   
    
    acts.SetCost = function (cost_value)
	{
        this._cost_value = cost_value;           
	}; 
    
    acts.SetFilter = function (filter_uid)
	{
        this._filter_uid = filter_uid;           
	}; 	   
	 
	acts.GetMoveableArea = function (chess_objs, moving_points, cost, filter, group_name)
	{	        	    
	    var chess_uid = _get_uid(chess_objs);	    	        
	    var _xyz = this.uid2xyz(chess_uid);
	    if ((_xyz == null) || (moving_points<=0))
	        return;
	    
	    this.exp_ChessUID = chess_uid;
		var bricks_uids = this.get_moveable_area(chess_uid, moving_points, cost);
	    var uid;
	    var avaiable_uids = [];  
        this._filter_fn_name = filter;
	    for(uid in bricks_uids)
		{
		    this.exp_BrickUID = parseInt(uid);		        
	        this._filter_uid = uid;
	        if (filter != "")
	            this.runtime.trigger(cr.plugins_.Rex_SLGMovement.prototype.cnds.OnFilterFn, this);
	        avaiable_uids.push(this._filter_uid);
		}
		this.group.GetGroup(group_name).SetByUIDList(avaiable_uids);
	};  
		
	acts.GetMovingPath = function (chess_objs, brick_objs, moving_points, cost, group_name)	
	{
	    var chess_uid = _get_uid(chess_objs);
	    var brick_uid = _get_uid(brick_objs);
	    if ((chess_uid == null) || (brick_uid == null) || (moving_points<=0))
	        return;

        this.exp_ChessUID = chess_uid;
	    var path_bricks_uids = this.get_moving_path(chess_uid,brick_uid,moving_points, cost);
	    this.group.GetGroup(group_name).SetByUIDList(path_bricks_uids);	    		      	       
	};	  	
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.ChessUID = function (ret)
	{
	    ret.set_int(this.exp_ChessUID);
	};
	
    exps.BrickUID = function (ret)
    {
        ret.set_int(this.exp_BrickUID);
    };	
    
}());