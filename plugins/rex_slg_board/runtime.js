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
	    this.exp_ChessUID =0;
	    this.exp_BrickUID =0;
	    
	    this.board = [];
	    this.is_tetragon_grid = (this.properties[0]==0);
	    this.clean_board(this.properties[1]-1,
	                     this.properties[2]-1,
	                     this.properties[3]-1);
	    this.path_mode = this.properties[4];
	                     
        this.callback = null; 
        this.layout = null;
        this._skip_first = null;
        this._cost = null;
        this._is_cost_fn = null;
        this._bricks = {};
        this._chess_xyz = null;
        this._dist_brick_uid = null;
        this._hit_dist_brick = false;
        
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
        var uid = inst.uid;
        var _xyz = this.uid2xyz(uid);
        if (_xyz != null)
        {
            delete this.items[uid];
            this.board[_xyz.x][_xyz.y][_xyz.z] = null;
        }
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
    
    instanceProto._get_layer = function(layerparam)
    {
        return (typeof layerparam == "number")?
               this.runtime.getLayerByNumber(layerparam):
               this.runtime.getLayerByName(layerparam);
    };    

    instanceProto._get_type = function(_obj_type)
    {
        var obj_type;
        if (typeof _obj_type == "string")
        {
            var name = _obj_type;
            var types = this.runtime.types;
            var type_name, item;
            obj_type = null;            
            for(type_name in types)
            {
                item = types[type_name];
                if (item.name == name)
                {
                    obj_type = item;
                    break;
                }
            }
        }
        else
            obj_type = _obj_type;
        return obj_type;
    }; 
    
	instanceProto.CreateItem = function(_obj_type,x,y,_layer,offset_x,offset_y)
	{
        var obj_type = this._get_type(_obj_type);
        var layer = this._get_layer(_layer);
        return this.runtime.createInstance(obj_type, layer, 
                                           this.layout.GetX(x,y)+offset_x,  
                                           this.layout.GetY(x,y)+offset_y );        
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
	        var brick_cost = this._get_cost(this._cost,brick_uid);
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
	    this.exp_ChessUID = chess_uid;
	    this._skip_first = true;
	    this._cost = cost;
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
	    this.exp_ChessUID = chess_uid;
	    this._skip_first = true;
	    this._cost = cost;
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

	cnds.GetMoveableBrick = function ()
	{
        return true;
	};    

	cnds.GetMovingPathBrick = function ()
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
    
    acts.SetupCallback = function (fn_objs)
	{
        var callback = fn_objs.instances[0];
        if (callback.check_name == "FUNCTION")
            this.callback = callback;        
        else
            alert ("SLG board should connect to a function object");
	};      
		
	acts.GetMoveableArea = function (chess_objs, moving_points, cost)
	{	        	    
	    var chess_uid = _get_uid(chess_objs);	    	        
	    var _xyz = this.uid2xyz(chess_uid);
	    if ((_xyz == null) || (moving_points<=0))
	        return;
	        
		var bricks_uid = this.get_moveable_area(chess_uid, moving_points, cost);
	    var uid;  
		for(uid in bricks_uid)
		{
		    this.exp_BrickUID = parseInt(uid);
		    this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.GetMoveableBrick, this);
		}
	};  
		
	acts.GetMovingPath = function (chess_objs, brick_objs, moving_points, cost)	
	{
	    var chess_uid = _get_uid(chess_objs);
	    var brick_uid = _get_uid(brick_objs);
	    if ((chess_uid == null) || (brick_uid == null) || (moving_points<=0))
	        return;

	    var path_bricks_uid = this.get_moving_path(chess_uid,brick_uid,moving_points, cost);
	    if (path_bricks_uid == null)
	        return;
	        
	    var bricks_cnt = path_bricks_uid.length;
	    var i;
		for(i=0;i<bricks_cnt;i++)
		{
		    this.exp_BrickUID = path_bricks_uid[i];
		    this.runtime.trigger(cr.plugins_.Rex_SLGBoard.prototype.cnds.GetMovingPathBrick, this);
		}	    		      	       
	};	  	
    
    acts.SetupLayout = function (layout_objs)
	{
        var layout = layout_objs.instances[0];
        if (layout.check_name == "LAYOUT")
            this.layout = layout;        
        else
            alert ("SLG board should connect to a layout object");
	};  
		
	acts.CreateBrick = function (_obj_type,x,y,_layer)
	{
        var obj_type = this._get_type(_obj_type);
        if ((obj_type ==null) || (this.layout == null) || (!this.is_inside_board(x,y,0)))
            return;
        var obj = this.CreateItem(obj_type,x,y,_layer,0,0);
	    this.add_item(obj.uid,x,y,0);
	};
	
	acts.CreateChess = function (_obj_type,x,y,z,_layer,offset_x,offset_y)
	{
        var obj_type = this._get_type(_obj_type);
        if ((obj_type ==null) || (this.layout == null) || (!this.is_inside_board(x,y,0)))
            return;
        obj = this.(obj_type,x,y,_layer,offset_x,offset_y);
	    this.add_item(obj.uid,x,y,z);
	};	
    
	//////////////////////////////////////
	// Expressions
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	exps.ChessUID = function (ret)
	{
	    ret.set_int(this.exp_ChessUID);
	};
	
	exps.UID2LX = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var x = (_xyz==null)? (-1):_xyz.x;
		ret.set_int(x);
	};	
	
	exps.UID2LY = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var y = (_xyz==null)? (-1):_xyz.y;
		ret.set_int(y);
	};
	
	exps.UID2LZ = function (ret, uid)
	{
	    var _xyz = this.uid2xyz(uid);
	    var z = (_xyz==null)? (-1):_xyz.z;
		ret.set_int(z);
	};
	
    exps.BrickUID = function (ret)
    {
        ret.set_int(this.exp_BrickUID);
    };	
    
	exps.LXYZ2UID = function (ret,_x,_y,_z)
	{
        var uid = this.xyz2uid(_x,_y,_z);
        if (uid == null)
            uid = -1;
	    ret.set_int(uid);
	}; 	
    
	exps.LZ2UID = function (ret,uid,_z)
	{
	    var ret_uid;
        var _xyz = this.uid2xyz(uid);
        if (_xyz != null)
        {
            ret_uid = this.xyz2uid(_xyz.x, _xyz.y, _z);
            if (ret_uid == null)
                ret_uid = -1;
        }
        else
            ret_uid = -1;
	    ret.set_int(ret_uid);
	}; 	
    
	exps.LXY2PX = function (ret,logic_x,logic_y)
	{
        var px;
        if (this.layout != null)
            px = this.layout.GetX(logic_x,logic_y);
        else
            px = (-1);
	    ret.set_int(px);
	};
    
	exps.LXY2PY = function (ret,logic_x,logic_y)
	{
        var py;
        if (this.layout != null)
            py = this.layout.GetY(logic_x,logic_y);
        else
            py = (-1);
	    ret.set_int(py);
	};
    
	exps.UID2PX = function (ret,uid)
	{
        var px;
        var _xyz = this.uid2xyz(uid);
        if ((this.layout != null) && (_xyz != null))           
            px = this.layout.GetX(_xyz.x,_xyz.y)
        else
            px = (-1);
	    ret.set_int(px);
	};
    
	exps.UID2PY = function (ret,uid)
	{
        var py;
        var _xyz = this.uid2xyz(uid);
        if ((this.layout != null) && (_xyz != null))        
            py = this.layout.GetX(_xyz.x,_xyz.y)
        else
            py = (-1);
	    ret.set_int(py);
	};    
}());