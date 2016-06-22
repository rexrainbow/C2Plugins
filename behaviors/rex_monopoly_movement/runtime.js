// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_MonopolyMovement = function(runtime)
{
	this.runtime = runtime;
};
cr.behaviors.Rex_MonopolyMovement._random_gen = null;  // random generator for Shuffing

(function ()
{
	var behaviorProto = cr.behaviors.Rex_MonopolyMovement.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
        this.randomGen = null;
        this.group = null;    
	};
    
	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{     
        this.square_dir = this.properties[0];
        this.hex_dir_ud = this.properties[1];
        this.hex_dir_lr = this.properties[2];   
        this.forked_selection_mode = this.properties[3];
		this._on_get_forked_direction_condition = false;
        this.board = null; 
        this.randomGenUid = -1;    // for loading
		this._is_square_grid = true;
        this._is_hex_up2down = true;
        this._target_tile_uids = []; 
		this._dir_sequence = [];
        this._tile_info = {uid:0, dir:0};
		this.path_tiles = [];  // {uid, cost}
		this._forkedroad_dir = null;
		this._moving_cost = 1;
        this.total_moving_points = 0;
		
        this.exp_TargetFaceDir = 0;
        this.exp_TargetLX = 0;
        this.exp_TargetLY = 0;        
		this.exp_TileUID = (-1);		
		this.exp_TileLX = (-1);
		this.exp_TileLY = (-1);		
		this.exp_CustomSolid = false;
	};

	behinstProto.tick = function ()
	{
	};  
    
    var _dir_sequence_init = function (arr, dir_count)
	{
		var i;
		arr.length = 0;
		for (i=0; i<dir_count; i++)
		    arr.push(i);
	};
	
	behinstProto.GetBoard = function ()
	{
        var _xyz;
        if (this.board != null)
        {
            _xyz = this.board.uid2xyz(this.inst.uid);
            if (_xyz != null)
                return this.board;  // find out xyz on board
            else  // chess no longer at board
                this.board = null;
        }
            
        var plugins = this.runtime.types;
        var name, inst;
        for (name in plugins)
        {
            inst = plugins[name].instances[0];
            if (cr.plugins_.Rex_SLGBoard && (inst instanceof cr.plugins_.Rex_SLGBoard.prototype.Instance))
            {
                _xyz = inst.uid2xyz(this.inst.uid)
                if (_xyz != null)
                { 
                    this.board = inst;
                    var dir_cnt = inst.GetLayout().GetDirCount();
					_dir_sequence_init(this._dir_sequence, dir_cnt);
					this._target_tile_uids.length = dir_cnt;
					this._is_square_grid = (dir_cnt == 4);
					if (!this._is_square_grid)  // hex
					{
                       this._is_hex_up2down = layout.is_up2down;
                    }
                    this.exp_TargetFaceDir = this._current_dir_get();
                    this.exp_TargetLX = _xyz.x;
                    this.exp_TargetLY = _xyz.y;		
                    return this.board;
                }
            }
        }
        return null;	
	};

    behinstProto._custom_solid_get = function (target_tile_uid)
    {
        this.exp_CustomSolid = null;	
		this.exp_TileUID = target_tile_uid;
		var tile_xyz = this.board.uid2xyz(target_tile_uid);
		this.exp_TileLX = tile_xyz.x;
		this.exp_TileLY = tile_xyz.y;
        this.runtime.trigger(cr.behaviors.Rex_MonopolyMovement.prototype.cnds.OnGetSolid, this.inst);
		return this.exp_CustomSolid;
    };
    
    var _solid_get = function(inst)
    {
        return (inst && inst.extra && inst.extra["solidEnabled"]);
    };
    
    behinstProto._solid_prop_get = function (target_tile_uid)
    {
        var tile_xyz = this.board.uid2xyz(target_tile_uid);
        var zHash = this.board.xy2zHash(tile_xyz.x, tile_xyz.y);
        if (!zHash)
            return false;
        
        var z, target_chess_uid;
        for (z in zHash)
        {
            target_chess_uid = zHash[z];
            if (_solid_get(this.board.uid2inst(target_chess_uid)))  // solid
                return true;
        } 
        return false;
    };
    
    behinstProto._get_neighbor_tile_uids = function (tile_info)	
    {
        var i, cnt=this._target_tile_uids.length, dir;
        var board = this.board;
        var layout = board.layout;
        var tx, ty, target_tile_uid, is_solid;
        for (i=0; i<cnt; i++)
		{
		    target_tile_uid = board.dir2uid(tile_info.uid, i, 0);
            if (target_tile_uid == null) 
            {
                this._target_tile_uids[i] = null;
                continue;
            }
            
            is_solid = this._custom_solid_get(target_tile_uid);
            if (is_solid == null)
                 is_solid = this._solid_prop_get(target_tile_uid)
            this._target_tile_uids[i] = (is_solid)? null:target_tile_uid;
	    }
        return this._target_tile_uids
    };
    
   var _get_valid_neighbor_tile_cnt = function (target_tile_uids)	
    {
        var i, cnt=target_tile_uids.length;
        var vaild_cnt = 0;        
        for (i=0; i<cnt; i++)
        {
            if (target_tile_uids[i] != null)
                vaild_cnt += 1;
        }
        return vaild_cnt;
    };    
    
    behinstProto._current_dir_get = function ()	
    {
        return (this._is_square_grid)?  this.square_dir:  // square
               (this._is_hex_up2down)?  this.hex_dir_ud:  // hex - Up-Down
                                        this.hex_dir_lr;  // hex - Left-Right
    };
    
    behinstProto._current_dir_set = function (dir)	
    {
        if (this._is_square_grid)
            this.square_dir = dir;
        else
        {
            if (this._is_hex_up2down)
            {
                this.hex_dir_ud = dir;
            }
            else
            {
                this.hex_dir_lr = dir;
            }
        }
    };
    
    behinstProto._get_backward_dir = function (dir)	
    {
        var _half_dir_cnt = (this._target_tile_uids.length/2);
        var backdir = (dir >= _half_dir_cnt)? (dir - _half_dir_cnt):(dir + _half_dir_cnt);
        return backdir;
    };  
    
    behinstProto._tile_info_set = function (uid, dir)	
    {
		this._tile_info.uid = uid;	
		this._tile_info.dir = dir;
    }; 
    
    behinstProto._get_oneway_tile_info = function (tile_info, target_tile_uids)
    {	
        var tile_uid;
        var i, cnt=target_tile_uids.length;
        for (i=0; i<cnt; i++)
        {
		    tile_uid = target_tile_uids[i];
            if (tile_uid != null)
			{
			    this._tile_info_set(tile_uid, i);
                break;		    
		    }
        }
		return this._tile_info;
    };     

    behinstProto._get_forward_tile_info = function (tile_info, target_tile_uids, random_mode)
    {
	    // random_mode: 1=forward, then random, 2=all random
	    var dir = tile_info.dir;
		var tile_uid = target_tile_uids[dir];
		if ((tile_uid != null) && (random_mode != 2))
		{
		    this._tile_info_set(tile_uid, dir);
			return this._tile_info;
		}
		
        var backward_dir = this._get_backward_dir(dir);
        var i, cnt=target_tile_uids.length;
		if ((random_mode == 1) || (random_mode == 2))
		    _shuffle(this._dir_sequence, this.type.randomGen);		
        for (i=0; i<cnt; i++)
        {
		    dir = this._dir_sequence[i];
		    tile_uid = target_tile_uids[dir];
            if ((tile_uid != null) && (dir != backward_dir))
			{
			    this._tile_info_set(tile_uid, dir);
                break;		    
		    }
        }
		return this._tile_info;
    };  	

    behinstProto._get_forkedroad_dir = function (tile_info, target_tile_uids)	
    {
	    this._forkedroad_dir = null;
		this.exp_TileUID = tile_info.uid;
		var tile_xyz = this.board.uid2xyz(tile_info.uid);
		this.exp_TileLX = tile_xyz.x;
		this.exp_TileLY = tile_xyz.y;		

		this._on_get_forked_direction_condition = true;		
		this.runtime.trigger(cr.behaviors.Rex_MonopolyMovement.prototype.cnds.OnForkedRoad, this.inst);
		this._on_get_forked_direction_condition = false;		
		if ((this._forkedroad_dir != null) && (target_tile_uids[this._forkedroad_dir] == null))
		    this._forkedroad_dir = null;
			
	    return this._forkedroad_dir;
    };
	
	
    behinstProto._get_forkedroad_tile_info = function (tile_info, target_tile_uids)	
    {
	    // custom dir
	    var dir = this._get_forkedroad_dir(tile_info, target_tile_uids);
		if (dir!= null)
		{
			this._tile_info.dir = dir;		
		    this._tile_info.uid = target_tile_uids[dir];
			return this._tile_info;
		}
		
		// default dir
        switch (this.forked_selection_mode)
        {
        case 0:    // Forwarding
		    tile_info = this._get_forward_tile_info(tile_info, target_tile_uids, 1);
            break;
        case 1:    // Random
		    tile_info = this._get_forward_tile_info(tile_info, target_tile_uids, 2);
            break;
        }
		return this._tile_info;
    };	
	
    behinstProto._get_target_tile_info = function (tile_info)	
    {        
        var target_tile_uids = this._get_neighbor_tile_uids(tile_info);
        var valid_cnt =  _get_valid_neighbor_tile_cnt(target_tile_uids);
        switch (valid_cnt)
        {
        case 0:  // can not go any where
            tile_info = null;
            break;
        case 1:  // only one way
            tile_info = this._get_oneway_tile_info(tile_info, target_tile_uids);
            break;
        case 2:  // go forward
            tile_info = this._get_forward_tile_info(tile_info, target_tile_uids);
            break;   
        default:
            tile_info = this._get_forkedroad_tile_info(tile_info, target_tile_uids);
            break;            
        }
        return tile_info;
    };
    
    var prop_STOP = (-1);    
    behinstProto._get_cost = function (target_tile_uid)	
    {
	    this._moving_cost = 1;
		this.exp_TileUID = target_tile_uid;
		var tile_xyz = this.board.uid2xyz(target_tile_uid);
		this.exp_TileLX = tile_xyz.x;
		this.exp_TileLY = tile_xyz.y;			
		this.runtime.trigger(cr.behaviors.Rex_MonopolyMovement.prototype.cnds.OnGetMovingCost, this.inst);
	    if ( (this._moving_cost < 0) && 
             (this._moving_cost != prop_STOP) )
		    this._moving_cost = 0;
        this._moving_cost = Math.floor(this._moving_cost);
	    return this._moving_cost;
    };
    
    behinstProto._tile_info_init = function ()	
    {
	    var current_tile_uid = this.board.lz2uid(this.inst.uid, 0);
		var current_dir = this._current_dir_get();
	    this._tile_info_set(current_tile_uid, current_dir);
        this.exp_TargetFaceDir = current_dir;
		return this._tile_info;
    };	
    behinstProto._targetLXY_set = function (path_tiles)	
    {
        var xyz;
        if (path_tiles.length > 0)
            xyz = this.board.uid2xyz( path_tiles[ path_tiles.length-1 ]["uid"] );
        else
            xyz = this.board.uid2xyz( this.inst.uid );
        this.exp_TargetLX = xyz.x;
        this.exp_TargetLY = xyz.y;          
    };	    
    behinstProto.get_moving_path = function (moving_points)	
    {
		this.path_tiles.length = 0;
        var tile_info, cost;
		var tile_info = this._tile_info_init();
        this.total_moving_points = moving_points;
        while (moving_points > 0)
        {
            tile_info = this._get_target_tile_info(tile_info);
            if (tile_info == null)
                break;
            cost = this._get_cost(tile_info.uid);   

            // specila value
            if (cost == prop_STOP)
                cost =  moving_points;           
            
            moving_points -= cost;
            if (moving_points < 0)
                break;
	        var tile_save = {"uid":tile_info.uid, 
			                 "cost":cost,
							 "dir":tile_info.dir};
            this.path_tiles.push(tile_save); 
            this.exp_TargetFaceDir = tile_info.dir;
        }
		// remove cost = 0 at tail
		var cnt=this.path_tiles.length;
		var i;
		for (i=cnt-1; i>=0; i--)
		{
			if (this.path_tiles[i]["cost"] == 0)		
			    this.path_tiles.length = i;
			else
			    break;
		}
		
        this._targetLXY_set(this.path_tiles);
        // output: this.path_tiles;
    };
	
	var _shuffle = function (arr, random_gen)
	{
        var i = arr.length, j, temp, random_value;
        if ( i == 0 ) return;
        while ( --i ) 
        {
		    random_value = (random_gen == null)?
			               Math.random(): random_gen.random();
            j = Math.floor( random_value * (i+1) );
            temp = arr[i]; 
            arr[i] = arr[j]; 
            arr[j] = temp;
        }
    };		
	
	behinstProto.saveToJSON = function ()
	{
	    var randomGenUid = (this.type.randomGen != null)? this.type.randomGen.uid:(-1);	    
		return { "ds": this.square_dir,
		         "de": this.hex_dir,
                 "fm": this.forked_selection_mode,
                 "ruid": randomGenUid,
                 "p" : this.path_tiles,
                 "tmp": this.total_moving_points,
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.square_dir = o["ds"];
		this.hex_dir = o["de"]; 
		this.forked_selection_mode = o["fm"];
		this.randomGenUid = o["ruid"]; 
		this.path_tiles = o["p"];
        this.total_moving_points = o["tmp"];
	};	
    
	behinstProto.afterLoad = function ()
	{
		if (this.randomGenUid === -1)
			this.type.randomGen = null;
		else
		{
			this.type.randomGen = this.runtime.getObjectByUID(this.randomGenUid);
			assert2(this.type.randomGen, "Monopoly movement: Failed to find random gen object by UID");
		}		
		this.randomGenUid = -1;
		this.board = null;
	}; 
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
	Cnds.prototype.PopInstance = function (objtype)
	{
        if (!objtype)
            return;	
        var board = this.GetBoard();
		if (board == null)
		    return;
			
	    var tile_info = this.path_tiles.shift();
	    var uids = (tile_info != null)? [tile_info["uid"]]: [];
        return 	board.PickUIDs(uids, objtype);
	};
    
	Cnds.prototype.PopLastInstance = function (objtype)
	{
        if (!objtype)
            return;	
        var board = this.GetBoard();
		if (board == null)
		    return;
			
	    var tile_info = this.path_tiles[this.path_tiles.length-1];
	    var uids = (tile_info != null)? [tile_info["uid"]]: [];
        return 	board.PickUIDs(uids, objtype);
	};  

	Cnds.prototype.IsForwardingPathEmpty = function ()
	{
        return (this.path_tiles.length == 0);
	}; 
	
	Cnds.prototype.OnGetMovingCost = function ()
	{
        return true;
	}; 	
	
	Cnds.prototype.OnGetSolid = function ()
	{
        return true;
	}; 	
	
	Cnds.prototype.OnForkedRoad = function ()
	{
        return true;
	}; 
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.GetMovingPath = function (moving_points)	
	{
        if (this.GetBoard() == null)
            return;
	    this.get_moving_path(moving_points);
		// output: this.path_tiles
	};	  	

	Acts.prototype.SetFace = function (dir)	
	{
	    if (this._on_get_forked_direction_condition)
		    this._forkedroad_dir = dir;	
	    else
            this._current_dir_set(dir);    
	};	
	
	Acts.prototype.SetMovingCost = function (cost)	
	{
        this._moving_cost = cost;
	}; 	
	
    Acts.prototype.SetDestinationSolid = function (is_solid)
	{
        this.exp_CustomSolid =  (is_solid > 0);
	};
	
    Acts.prototype.SetDestinationMoveable = function (is_moveable)
	{
        this.exp_CustomSolid =  (!(is_moveable > 0));
	};	
	
	Acts.prototype.SetFaceOnForkedRoad = function (dir)	
	{     
        this._forkedroad_dir = dir;	
	}; 

	Acts.prototype.SetDirectionSelection = function (mode)	
	{     
        this.forked_selection_mode = mode;
	}; 	
	
    Acts.prototype.SetRandomGenerator = function (random_gen_objs)
	{
        var random_gen = random_gen_objs.instances[0];
        if (random_gen.check_name == "RANDOM")
            this.type.randomGen = random_gen;        
        else
            alert ("Monopoly movement: This object is not a random generator object.");
	};        
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
 	Exps.prototype.TargetFaceDir = function (ret)
	{
        ret.set_int(this.exp_TargetFaceDir);		
	}; 	
    
 	Exps.prototype.TargetLX = function (ret)
	{
        ret.set_int(this.exp_TargetLX);		
	};     
    
 	Exps.prototype.TargetLY = function (ret)
	{
        ret.set_int(this.exp_TargetLY);		
	};   
    
 	Exps.prototype.TileUID = function (ret)
	{
        ret.set_any(this.exp_TileUID);		
	};    
    
 	Exps.prototype.TileLX = function (ret)
	{
        ret.set_int(this.exp_TileLX);		
	};  	
    
 	Exps.prototype.TileLY = function (ret)
	{
        ret.set_int(this.exp_TileLY);		
	};
    
 	Exps.prototype.TotalMovingPoints = function (ret)
	{
        ret.set_int(this.total_moving_points);		
	};    
    
 	Exps.prototype.STOP = function (ret)
	{
        ret.set_int(this.prop_STOP);		
	};    
    
}());