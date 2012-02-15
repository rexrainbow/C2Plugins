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
	    this.exp_SelectedUID =0;
	    this.exp_BrickUID =0;
	    
	    this.board = [];
	    this.is_tetragon_grid = (this.properties[0]==0);
	    this.clean_board(this.properties[1]-1,
	                     this.properties[2]-1,
	                     this.properties[3]-1);
	                     
        this.callback = null;    
        this._skip_first = null;
        this._cost = null;
        this._is_cost_fn = null;
        this._bricks = {};
        this._chess_xyz = null;
        this._dist_brick_uid = null;
	};
	
	instanceProto.clean_board = function(x_max, y_max, z_max)
	{
	    if (x_max>=0)
	        this.x_max = x_max;
	    if (y_max>=0)    
	        this.y_max = y_max;
	    if (z_max>=0)
	        this.z_max = z_max;
	    
		this.board.length = x_max;
		var x, y, z;
		for (x=0;x<=x_max;x++)
		{
		    this.board[x] = [];
		    this.board[x].length = y_max;
		    for(y=0;y<=y_max;y++)
		    {
		        this.board[x][y] = [];
		        this.board[x][y].length = z_max;
		        for(z=0;z<=z_max;z++)
		        {
		            this.board[x][y][z] = null;
		        }
		    }
		}
		
		this.items = {};
	};
	
	instanceProto.is_inside_board = function (x,y,z)
	{
	    return ((x>=0) && (y>=0) && (z>=0) &&
	            (x<=this.x_max) && (y<=this.y_max) && (z<=this.z_max));
	};	
	
	var _get_uid = function(objs)
	{
	    if (objs == null)
	        return null;
	        
	    if (typeof(objs) != "number")
	    {
	        var inst = objs.getFirstPicked();
	        return (inst!=null)? inst.uid:null;
	    }
	    else
	        return objs;
	};
	
	instanceProto.add_item = function(uid, _x, _y, _z)
	{    
	    uid = _get_uid(uid);
	        
	    if ((uid != null) && this.is_inside_board(_x, _y, _z))
	    {
	        this.board[_x][_y][_z] = uid;
	        this.items[uid] = {x:_x, y:_y, z:_z};
	    }
	};	
	
	instanceProto.xyz2uid = function(x, y, z)
	{
	    return (this.is_inside_board(x, y, z))? this.board[x][y][z]:null;
	};
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.items[uid];
	};
	
	instanceProto._get_cost = function(_cost, brick_uid)
	{
	    var cost;
	    if (this._is_cost_fn)
	    {
	        this.exp_BrickUID = brick_uid;
	        cost = this.callback.CallFn(this._cost);
	    }
	    else
	        cost = _cost;
	    return cost; 
	};
	
	instanceProto._get_neighbors = function(_x,_y)
	{
	    var neighbors;
        if (this.is_tetragon_grid)
        {
            neighbors= [{x:_x-1, y:_y},{x:_x+1, y:_y},{x:_x, y:_y-1},{x:_x, y:_y+1}];
        }
        else
        {
            // TODO
        }
        return neighbors;
	};	
	
	instanceProto._get_moveable_brick = function(brick_uid, _moving_points, pre_brick_uid)
	{
	    if (brick_uid == null)
	        return null;

	    var brick_xyz = this.uid2xyz(brick_uid);
	    var at_chess_xy = ((brick_xyz.x==this._chess_xyz.x) && (brick_xyz.y==this._chess_xyz.y));
	    var result;

        if (this._skip_first)
        {
            result = _moving_points;
            this._skip_first = false;
        }
        else if (!at_chess_xy)
        {
	        var brick_cost = this._get_cost(this._cost,brick_uid);
	        if (brick_cost == null)
	        {
	            // maybe an error?
	            return null;
	        }
	            
	        result = _moving_points - brick_cost;
	        if ((result >= 0) && (this._bricks[brick_uid] == null)) 	        	            
	            this._bricks[brick_uid] = 0;           
      	}
      	else  // at_chess_xy && !this._skip_first
      	{
      	    return null;
      	}
      	
      	// arrive distance brick
      	if ((brick_uid == this._dist_brick_uid) && (result >= 0))
        {
      	    return result;
      	}
      	// get next moveable bricks      	
      	else if (result > 0)
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
	                    this._get_moveable_brick(next_brick_uid, result, brick_uid);	                
	            }
	        }
	    }
	};
	
	instanceProto.get_moveable_bricks = function(chess_uid, _moving_points, cost)
	{
	    this.exp_SelectedUID = chess_uid;
	    this._skip_first = true;
	    this._cost = cost;
	    this._is_cost_fn = (typeof cost == "string");
	    this._bricks = {};
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    this._dist_brick_uid = null;
	    this._get_moveable_brick(this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0),
	                             _moving_points, null);
	    return this._bricks;
	};
	
	instanceProto.move_chess = function (chess_uid,brick_uid,moving_points, cost)
	{
	};
	
	//////////////////////////////////////
	// Conditions
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;        

	cnds.GetMoveableBrick = function ()
	{
        return true;
	};    
	
	//////////////////////////////////////
	// Actions
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	
	acts.CleanBoard = function (x_max,y_max,z_max)
	{
		this.clean_board(x_max-1, y_max-1, z_max-1);
	};
		
	acts.AddBrick = function (objs,x,y)
	{
	    this.add_item(objs,x,y,0);
	};
	
	acts.AddChess = function (objs,x,y,z)
	{
	    this.add_item(objs,x,y,z);
	};		
    
    acts.Setup = function (fn_objs)
	{
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Square board should connect to a function object");
	};      
		
	acts.GetMoveableBricks = function (chess_objs, moving_points, cost)
	{	        	    
	    var chess_uid = _get_uid(chess_objs);	    	        
	    var _xyz = this.uid2xyz(chess_uid);
	    if ((_xyz == null) || (moving_points<=0))
	        return;

		var bricks_uid = this.get_moveable_bricks(chess_uid, moving_points, cost);	
	    var uid;  
		for(uid in bricks_uid)
		{
		    this.exp_BrickUID = parseInt(uid);
		    this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.GetMoveableBrick, this);
		}
	};  
		
	acts.MoveChess = function (chess_objs, brick_objs, moving_points, cost)	
	{
	    var chess_uid = _get_uid(chess_objs);
	    var brick_uid = _get_uid(brick_objs);
	    if ((chess_uid == null) || (brick_uid == null) || (moving_points<=0))
	        return;
	        
	    var path_bricks_uid = this.move_chess(chess_uid,brick_uid,moving_points, cost);	  	       
	};	  	
	
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.UID = function (ret,_x,_y,_z)
	{
	    var uid;
	    if ((_x != null) && (_y != null) && (_z != null))
	    {
	        uid = this.xyz2uid(_x,_y,_z);
	        if (uid == null)
	            uid = -1;
	    }
	    else
	        uid = this.exp_SelectedUID;
	    
		ret.set_int(uid);
	};
	
	exps.X = function (ret, uid)
	{
	    var chess_xyz = this.uid2xyz(uid);
	    var x = (chess_xyz==null)? (-1):chess_xyz.x;
		ret.set_int(x);
	};	
	
	exps.Y = function (ret, uid)
	{
	    var chess_xyz = this.uid2xyz(uid);
	    var y = (chess_xyz==null)? (-1):chess_xyz.y;
		ret.set_int(y);
	};
	
	exps.Z = function (ret, uid)
	{
	    var chess_xyz = this.uid2xyz(uid);
	    var z = (chess_xyz==null)? (-1):chess_xyz.z;
		ret.set_int(z);
	};
	
    exps.BrickUID = function (ret)
    {
        ret.set_int(this.exp_BrickUID);
    }; 	
}());