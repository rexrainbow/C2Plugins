// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_SquareBoard = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_SquareBoard.prototype;
		
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
	    this.clean_board(this.properties[0]-1,
	                     this.properties[1]-1,
	                     this.properties[2]-1);
	                     
        this.callback = null;    
        this._bricks = {};
        this._chess_xyz = null;
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
		
		this.chesses = {};
	};
	
	instanceProto.add_item = function(uid, _x, _y, _z)
	{
	    if ((_x<=this.x_max) && (_y<=this.y_max) && (_z<=this.z_max))
	    {
	        this.board[_x][_y][_z] = uid;
	        this.chesses[uid] = {x:_x, y:_y, z:_z};
	    }
	};	
	
	instanceProto.xyz2uid = function(x, y, z)
	{
	    return this.board[x][y][z];
	};
	
	instanceProto.uid2xyz = function(uid)
	{
	    return this.chesses[uid];
	};
	
	instanceProto._get_moveable_brick = function(brick_uid, _total_cost, cost_fn_name, pre_brick_uid)
	{
	    if (brick_uid == null)
	        return;
	        	 
	    var brick_xyz = this.uid2xyz(brick_uid);
	    var at_chess_xy = ((brick_xyz.x==this._chess_xyz.x) && (brick_xyz.y==this._chess_xyz.y));
	    var result;

        if (!at_chess_xy)
        {
	        this.exp_BrickUID = brick_uid;
	        var brick_cost = this.callback.CallFn(cost_fn_name);
	        if (brick_cost == null)
	        {
	            // maybe an error?
	            return;
	        }
	            
	        result = _total_cost - brick_cost;
	        if ((result >= 0) && (this._bricks[brick_uid] == null)) 
	        {
	            this.runtime.trigger(cr.plugins_.Rex_SquareBoard.prototype.cnds.GetMoveableBrick, this);
	            this._bricks[brick_uid] = 0;
	        }
      	}
      	else
      	{
      	    result = _total_cost;
      	}
      	
	    if (result > 0)
	    {
	        var next_brick_uid;
	        next_brick_uid = this.xyz2uid(brick_xyz.x-1, brick_xyz.y, 0);
	        if (pre_brick_uid != next_brick_uid)
	            this._get_moveable_brick(next_brick_uid, result, cost_fn_name, brick_uid);
	        
	        next_brick_uid = this.xyz2uid(brick_xyz.x+1, brick_xyz.y, 0);
	        if (pre_brick_uid != next_brick_uid)
	            this._get_moveable_brick(next_brick_uid, result, cost_fn_name, brick_uid);
	        
	        next_brick_uid = this.xyz2uid(brick_xyz.x, brick_xyz.y-1, 0);
	        if (pre_brick_uid != next_brick_uid)
	            this._get_moveable_brick(next_brick_uid, result, cost_fn_name, brick_uid);
	        
	        next_brick_uid = this.xyz2uid(brick_xyz.x, brick_xyz.y+1, 0);
	        if (pre_brick_uid != next_brick_uid)
	            this._get_moveable_brick(next_brick_uid, result, cost_fn_name, brick_uid);
	    }
	};
	
	instanceProto.get_moveable_bricks = function(chess_uid, _total_cost, cost_fn_name)
	{
	    this.exp_SelectedUID = chess_uid;	    
	    this._bricks = {};
	    this._chess_xyz = this.uid2xyz(chess_uid);
	    this._get_moveable_brick(this.xyz2uid(this._chess_xyz.x, this._chess_xyz.y, 0),
	                             _total_cost, cost_fn_name, null);
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
	
	acts.AddBrick = function (uid,x,y)
	{
		this.add_item(uid,x,y,0);
	};
		
	acts.AddChess = function (uid,x,y,z)
	{
		this.add_item(uid,x,y,z);
	};	
    
    acts.Setup = function (fn_objs)
	{
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("Square board should connect to a function object");
	};      
		
	acts.GetMoveableBricks = function (chess_uid, totoal_cost, cost_fn_name)
	{
	    var _xyz = this.uid2xyz(chess_uid);
	    if ((_xyz == null) || (this.callback == null) || (totoal_cost<=0))
	        return;

		this.get_moveable_bricks(chess_uid, totoal_cost, cost_fn_name);
	};    	
		
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.SelectedUID = function (ret,_x,_y,_z)
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
	
	exps.SelectedX = function (ret, uid)
	{
	    var chess_xyz = this.uid2xyz(uid);
	    var x = (chess_xyz==null)? (-1):chess_xyz.x;
		ret.set_int(x);
	};	
	
	exps.SelectedY = function (ret, uid)
	{
	    var chess_xyz = this.uid2xyz(uid);
	    var y = (chess_xyz==null)? (-1):chess_xyz.y;
		ret.set_int(y);
	};
	
	exps.SelectedZ = function (ret, uid)
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