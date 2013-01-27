// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_GridMove = function(runtime)
{
	this.runtime = runtime;
};
cr.behaviors.Rex_GridMove._random_gen = null;  // random generator for Shuffing
// TODO

(function ()
{
	var behaviorProto = cr.behaviors.Rex_GridMove.prototype;
		
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
        this.group = null;  
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.board = null;
        this._cmd_move_to = new cr.behaviors.Rex_GridMove.CmdMoveTo(this);
        		
        this._target_xyz = {x:0,y:0,z:0};        
        this._is_moving_request_accepted = false;
        this.is_my_call = false;
        this.exp_BlockerUID = (-1);
        this.exp_Direction = (-1);
        this.exp_DestinationLX = (-1);
        this.exp_DestinationLY = (-1);
        this.exp_DestinationLZ = (-1);
        this.exp_CustomSolid = null;
		this._wander = {range_x:this.properties[4],
		                range_y:this.properties[5]};
        this._dir_sequence = [];						
        this.force_move = (this.properties[6] == 1);
        this._colliding_xyz = {};
        this._colliding_zhash2uids = {};
        this._target_uid = null;
        this._z_saved = null;
	};       
	
    behinstProto.tick = function ()
	{
	    this._cmd_move_to.tick();
	};
	
    var _dir_sequence_init = function (arr, dir_count)
	{
		var i;
		arr.length = 0;
		for (i=0; i<dir_count; i++)
		    arr.push(i);
	};
	
	behinstProto._board_get = function ()
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
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "BOARD"))
            {
                _xyz = obj.uid2xyz(this.inst.uid)
                if (_xyz != null)
                { 
                    this.board = obj;
					_dir_sequence_init(this._dir_sequence, obj.layout.GetDirCount());
					this._wander.init_xyz = _xyz;
                    return this.board;
                }
            }
        }
        return null;	
	};
	
    behinstProto.chess_xyz_get = function (uid)
    {
	    if (uid == null)
		    uid = this.inst.uid;
	    var board = this._board_get();
		if (board != null)
		    return board.uid2xyz(uid);
	    else
            return null;
    };
    behinstProto._chess_inst_get = function (uid)
    {
	    var board = this._board_get();
		if (board != null)
		    return board.uid2inst(uid);
	    else
            return null;
    };    
    
    var _solid_get = function(inst)
    {
        return (inst.extra != null) && (inst.extra.solidEnabled);
    };

    behinstProto.target2dir = function (target_x, target_y, target_z)
    {
        var my_xyz = this.chess_xyz_get();
        var target_xyz = {x:target_x, y:target_y, z:target_z};
        return this._board_get().layout.XYZ2Dir(my_xyz, target_xyz);
    };
    
    behinstProto.set_move_target = function (target_x, target_y, target_z, dir)
    {
        this.exp_DestinationLX = target_x;
        this.exp_DestinationLY = target_y;
        this.exp_DestinationLZ = target_z; 
        this.exp_Direction = dir; 
    };
    
    behinstProto._custom_can_move_to_get = function ()
    {
        this.exp_CustomSolid = null;
        this.runtime.trigger(cr.behaviors.Rex_GridMove.prototype.cnds.OnGetDestinationSolid, this.inst);
        var can_move_to;
        if (this.exp_CustomSolid == null)
            can_move_to = null;
        else if (this.exp_CustomSolid)
            can_move_to = (-1);
        else
            can_move_to = 1;
        return can_move_to;
    };    
    
    behinstProto._test_move_to = function (target_x, target_y, target_z)
    {
        this.exp_BlockerUID = (-1);
      
        if (!this.board.is_inside_board(target_x, target_y))  // tile does not exist
            return null;        
        var _target_uid = this.board.xyz2uid(target_x, target_y, target_z);
        this._target_uid = _target_uid;  // pass _target_uid out
        
		if (this.force_move)
		    return 1; // can move to target

        if (_target_uid == null)  // no overlap at the same z
        {
            // first, get solid property from event sheet
            var custom_can_move_to = this._custom_can_move_to_get();
            if (custom_can_move_to != null)
                return custom_can_move_to;
                
            // find out if neighbors have solid property
            var z_hash = this.board.xy2zhash(target_x, target_y);
            var z;
            if (!(0 in z_hash))  // tile does not exist
                return null;                
            for (z in z_hash)
            {
                _target_uid = z_hash[z];
                if (_solid_get(this.board.uid2inst(_target_uid)))  // solid
                {
                    this.exp_BlockerUID = _target_uid;
                    return (-1);  // blocked
                }
            }       
            return 1; // can move to target
        }
        else    
        {
            this.exp_BlockerUID = _target_uid;      
            return (-1);  // blocked
        }
    };

    behinstProto._move_to_target = function (target_x, target_y, target_z)
    {        
        var can_move = this._test_move_to(target_x, target_y, target_z);
        if (can_move == 1)  // can move to neighbor
        {
            var z_index;
            
            if (this.force_move)
            {
                if ((this._z_saved != null) &&     // slink
                    (this.board.xyz2uid(target_x, target_y, this._z_saved) == null))
                {
                    z_index = this._z_saved;
                    this._z_saved = null;                  
                }
                else
                {
                    if (this._target_uid == null)
                        z_index = target_z;
                    else  // overlap with other chess -> change my z index to avoid overlapping
                    {
                        if (this._z_saved == null)
                        {
                            this._z_saved = target_z;
                            z_index = "#" + this.inst.uid.toString();
                        }
                        else
                            z_index += "#";
                        while (this.board.xyz2uid(target_x, target_y, z_index) != null)
                            z_index += "#";
                    }
                }
                
            }
            else  // normal mode
                z_index = target_z;
            

            this.board.move_item(this.inst, target_x, target_y, z_index);
                
            // set moveTo
            this.moveto_pxy(target_x, target_y, target_z);
            this.on_moving_request_success(true);    
        } 
        else if (can_move == (-1))
        {
            this.on_moving_request_success(false);              
        }    
        else
        {
            this._is_moving_request_accepted = false;
        }
		return (can_move == 1);
    };
	
    behinstProto.moveto_pxy = function(lx, ly, lz)
    {
        var layout = this.board.layout;
        this._cmd_move_to.set_target_pos(layout.LXYZ2PX(lx, ly, lz), 
                                         layout.LXYZ2PY(lx, ly, lz));
    };
    
    behinstProto.on_moving_request_success = function(can_move)
    {
        this._is_moving_request_accepted = can_move;           
        this.is_my_call = true; 
        var trig = (can_move)? cr.behaviors.Rex_GridMove.prototype.cnds.OnMovingRequestAccepted:
                               cr.behaviors.Rex_GridMove.prototype.cnds.OnMovingRequestRejected;
        this.runtime.trigger(trig, this.inst);                                           
        this.is_my_call = false;  
    }; 
    
	var _shuffle = function (arr)
	{
        var i = arr.length, j, temp, random_value;
		var random_gen = cr.behaviors.Rex_GridMove._random_gen;
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

    behinstProto._colliding_checking = function (target_x, target_y, target_z)
    {
        this._colliding_xyz.x = target_x;
        this._colliding_xyz.y = target_y;
        this._colliding_xyz.z = target_z;
        this.runtime.trigger(cr.behaviors.Rex_GridMove.prototype.cnds.OnCollidedBegin, this.inst);    
    };    

    behinstProto._zhash2uids = function (z_hash)
    {   
        var z, target_uids = this._colliding_zhash2uids;
        for (z in target_uids)
            delete target_uids[z];
        for (z in z_hash)
            target_uids[z_hash[z]] = true;
        return target_uids;
    };
    
	behinstProto._collide_test = function(objtype, group_name)
	{
        var target_uids = this._zhash2uids(this.board.xy2zhash(this._colliding_xyz.x, 
                                                               this._colliding_xyz.y));
        
        var _sol = objtype.getCurrentSol();
        var select_all_save = _sol.select_all;
        _sol.select_all = true;         
	    var test_insts = _sol.getObjects(); 
        var test_insts_cnt = test_insts.length;     
        var i, test_uid;

        var result_group = this.type.group.GetGroup(group_name);
        result_group.Clean();
        for (i=0; i<test_insts_cnt; i++)
        {
            test_uid = test_insts[i].uid;
            if (test_uid in target_uids)
                result_group.AddUID(test_uid);
        }
        _sol.select_all = select_all_save;
        return (result_group.GetList().length != 0);
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnHitTarget = function ()
	{
		return (this._cmd_move_to.is_my_call);
	};
	
    Cnds.prototype.OnMoving = function ()
	{
		return false;
	};
    
	Cnds.prototype.IsMoving = function ()
	{
		return (this._cmd_move_to.is_moving);
	};
	
    Cnds.prototype.OnMovingRequestAccepted = function ()
	{
		return (this.is_my_call);
	};	
    Cnds.prototype.OnMovingRequestRejected = function ()
	{
		return (this.is_my_call);
	};
    Cnds.prototype.IsMovingRequestAccepted = function ()
	{
		return (this.is_my_call && this._is_moving_request_accepted);
	};
    Cnds.prototype.TestMoveToOffset = function (dx, dy)
	{
		var _xyz = this.chess_xyz_get();
		if (_xyz == null)
		    return false;

        var tx = _xyz.x+dx;
        var ty = _xyz.y+dy;
        var tz = _xyz.z;
        var dir = this.target2dir(tx, ty, tz);
        this.set_move_target(tx, ty, tz, dir);
        var can_move = this._test_move_to(tx, ty, tz);	    
		return (can_move==1);
	};
    Cnds.prototype.TestMoveToNeighbor = function (dir)
	{
		var _xyz = this.chess_xyz_get();
		if (_xyz == null)
		    return false;

        var _layout = this._board_get().layout;
        var tx = _layout.GetNeighborLX(_xyz.x, _xyz.y, dir);
        var ty = _layout.GetNeighborLY(_xyz.x, _xyz.y, dir);
        var tz = _xyz.z;
        this.set_move_target(tx, ty, tz, dir);
        var can_move = this._test_move_to(tx, ty, tz);	    
		return (can_move==1);			 
	};	
	
	Cnds.prototype.OnCollidedBegin = function (objtype, group_name)
	{
		return this._collide_test(objtype, group_name);
	};
	
    Cnds.prototype.OnGetDestinationSolid = function ()
	{
		return true;
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetActivated = function (s)
	{
		this._cmd_move_to.activated = (s==1);
	};

	Acts.prototype.SetMaxSpeed = function (s)
	{
		this._cmd_move_to.move.max = s;
        this._cmd_move_to._set_current_speed(null);
	};      
    
	Acts.prototype.SetAcceleration = function (a)
	{
		this._cmd_move_to.move.acc = a;
        this._cmd_move_to._set_current_speed(null);
	};
	
	Acts.prototype.SetDeceleration = function (a)
	{
		this._cmd_move_to.move.dec = a;
	};
    
	Acts.prototype.SetCurrentSpeed = function (s)
	{
        this._cmd_move_to._set_current_speed(s);
	}; 
	
	Acts.prototype.MoveToNeighbor = function (dir)
	{
	    if (!this._cmd_move_to.activated)
	        return;
    
	    var _xyz = this.chess_xyz_get();
        if (_xyz == null)
            return;
            
        var _layout = this._board_get().layout;	
        var tx = _layout.GetNeighborLX(_xyz.x, _xyz.y, dir);
        var ty = _layout.GetNeighborLY(_xyz.x, _xyz.y, dir);
        var tz = _xyz.z;
        this.set_move_target(tx, ty, tz, dir);
        this._colliding_checking(tx, ty, tz);        
        this._move_to_target(tx, ty, tz);
	};
	
	Acts.prototype.MoveToTarget = function (lx, ly)
	{
	    if (!this._cmd_move_to.activated)
	        return;
	        
		var _xyz = this.chess_xyz_get();
        if (_xyz == null)
            return;
            
		var tx = lx;
        var ty = ly;
        var tz = _xyz.z;
        var dir = this.target2dir(tx, ty, tz);
        this.set_move_target(tx, ty, tz, dir);
        this._colliding_checking(tx, ty, tz);  
		this._move_to_target(tx, ty, tz);	    
	}; 
    
	Acts.prototype.MoveToOffset = function (dx, dy)
	{
	    if (!this._cmd_move_to.activated)
	        return;
	        
		var _xyz = this.chess_xyz_get();
        if (_xyz == null)
            return;
            
		var tx = _xyz.x+dx;
        var ty = _xyz.y+dy;
        var tz = _xyz.z;
        var dir = this.target2dir(tx, ty, tz);
        this.set_move_target(tx, ty, tz, dir);
        this._colliding_checking(tx, ty, tz);  
		this._move_to_target(tx, ty, tz);
	};    
	
	Acts.prototype.MoveToTargetChess = function (objtype)
	{
	    if ((!this._cmd_move_to.activated) || (!objtype))
	        return;
					
	    var inst = objtype.getFirstPicked();
		if (inst == null)
		    return;
	    var target_xyz = this.chess_xyz_get(inst.uid);
		if (target_xyz == null)
		    return;
			
		var _xyz = this.chess_xyz_get();
        if (_xyz == null)
            return;
            
		var tx = target_xyz.x;
        var ty = target_xyz.y;
        var tz = _xyz.z;
        var dir = this.target2dir(tx, ty, tz);
        this.set_move_target(tx, ty, tz, dir);
        this._colliding_checking(tx, ty, tz);  
		this._move_to_target(tx, ty, tz);	             
	};   	
	Acts.prototype.Swap = function (target_uid)
	{
        var target_inst = this._chess_inst_get(target_uid);
        if (target_inst == null)
            return;
        var behavior_index = target_inst.type.getBehaviorIndexByName(this.type.name);
        var grid_move_behavior_inst = target_inst.behavior_insts[behavior_index];        
        if (grid_move_behavior_inst == null)
            return;    
        var my_uid = this.inst.uid;
        var is_swap_success = this._board_get().SwapChess(my_uid, target_uid);
        if (!is_swap_success)
            return;
            
        // after swap -- xyz had been swapped
        var target_xyz = this.chess_xyz_get(my_uid);
        var my_xyz = this.chess_xyz_get(target_uid);
        // grid move my_chess        
        var dir = this.target2dir(target_xyz.x, target_xyz.y, target_xyz.z);
        this.set_move_target(target_xyz.x, target_xyz.y, target_xyz.z, dir);
        this.moveto_pxy(target_xyz.x, target_xyz.y, target_xyz.z);
        this.on_moving_request_success(true);
        // grid move target_chess         
        var dir = grid_move_behavior_inst.target2dir(my_xyz.x, my_xyz.y, my_xyz.z);
        grid_move_behavior_inst.set_move_target(my_xyz.x, my_xyz.y, my_xyz.z, dir);
        grid_move_behavior_inst.moveto_pxy(my_xyz.x, my_xyz.y, my_xyz.z);
        grid_move_behavior_inst.on_moving_request_success(true);        
	};  
	Acts.prototype.Wander = function ()
	{
	    if (!this._cmd_move_to.activated)
	        return;
	        
		var _xyz = this.chess_xyz_get();
		if (_xyz == null)
		    return;
		
		var _layout = this._board_get().layout;
		var init_lx = this._wander.init_xyz.x;
		var init_ly = this._wander.init_xyz.y;
		var range_x = this._wander.range_x;
		var range_y = this._wander.range_y;		
		_shuffle(this._dir_sequence);
		var i, dir, dir_count=this._dir_sequence.length;
		var tx, ty, tz, can_move;
		for (i=0; i<dir_count; i++)
		{
		    dir = this._dir_sequence[i];
		    tx = _layout.GetNeighborLX(_xyz.x, _xyz.y, dir);
		    ty = _layout.GetNeighborLY(_xyz.x, _xyz.y, dir);
		    tz = _xyz.z;	
            if ((Math.abs(tx-init_lx) > range_x) || 
			    (Math.abs(ty-init_ly) > range_y))
				continue;
	        this.set_move_target(tx, ty, tz, dir);
		    can_move = this._move_to_target(tx, ty, tz);	    
			if (can_move)
			    break;
	    }	
	};
	
    Acts.prototype.SetWanderRangeX = function (range_x)
	{
	    if (range_x < 0)
		    range_x = 0;
        this._wander.range_x = range_x;
	};   
	
    Acts.prototype.SetWanderRangeY = function (range_y)
	{
	    if (range_y < 0)
		    range_y = 0;
        this._wander.range_y = range_y;
	}; 
	
    Acts.prototype.SetRandomGenerator = function (random_gen_objs)
	{
        var random_gen = random_gen_objs.instances[0];
        if (random_gen.check_name == "RANDOM")
            cr.behaviors.Rex_GridMove._random_gen = random_gen;        
        else
            alert ("[Grid move] This object is not a random generator object.");
	}; 
	
    Acts.prototype.ResetWanderCenter = function ()
	{
        var _xyz = this.chess_xyz_get();
		if (_xyz == null)
		    return;        
	    this._wander.init_xyz.x = _xyz.x;
        this._wander.init_xyz.y = _xyz.y;
        this._wander.init_xyz.z = _xyz.z;       
	};  
	
    Acts.prototype.SetDestinationSolid = function (is_solid)
	{
        this.exp_CustomSolid =  (is_solid > 0);
	};
	
    Acts.prototype.SetDestinationMoveable = function (is_moveable)
	{
        this.exp_CustomSolid =  (!(is_moveable > 0));
	};	
	
    Acts.prototype.SetInstanceGroup = function (group_objs)
	{
        var group = group_objs.instances[0];
        if (group.check_name == "INSTGROUP")
            this.type.group = group;        
        else
            alert ("[Grid move] This object is not a instance group object.");            
	};     
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this._cmd_move_to.activated)? 1:0);
	};    
    
	Exps.prototype.Speed = function (ret)
	{
		ret.set_float(this._cmd_move_to.current_speed);
	};
    
	Exps.prototype.MaxSpeed = function (ret)
	{
		ret.set_float(this._cmd_move_to.move.max);
	}; 

	Exps.prototype.Acc = function (ret)
	{
		ret.set_float(this._cmd_move_to.move.acc);
	};  

 	Exps.prototype.Dec = function (ret)
	{
		ret.set_float(this._cmd_move_to.move.dec);
	}; 

	Exps.prototype.TargetX = function (ret)
	{
		ret.set_float(this._cmd_move_to.target.x);
	};  

 	Exps.prototype.TargetY = function (ret)
	{
		ret.set_float(this._cmd_move_to.target.y);
	};     

 	Exps.prototype.BlockerUID = function (ret)
	{
        ret.set_int(this.exp_BlockerUID);		
	}; 
    
 	Exps.prototype.Direction = function (ret)
	{
	    var dir = this.exp_Direction;
	    if (dir == null)
	        dir = (-1);
        ret.set_int(dir);		
	};
    
 	Exps.prototype.DestinationLX = function (ret)
	{
        ret.set_int(this.exp_DestinationLX);		
	};    
    
 	Exps.prototype.DestinationLY = function (ret)
	{
        ret.set_int(this.exp_DestinationLY);		
	};  	
    
 	Exps.prototype.DestinationLZ = function (ret)
	{
        ret.set_int(this.exp_DestinationLZ);		
	};  	
	
}());

(function ()
{
    cr.behaviors.Rex_GridMove.CmdMoveTo = function(plugin)
    {
        this.activated = plugin.properties[0];
        this.move = {max:plugin.properties[1],
                     acc:plugin.properties[2],
                     dec:plugin.properties[3]};
        this.target = {x:0 , y:0, angle:0};
        this.is_moving = false;  
        this.current_speed = 0;       
        this.remain_distance = 0;
        this.is_hit_target = false;
        this.is_my_call = false; 
        
        this.inst = plugin.inst;
        this.runtime = plugin.runtime;
    };
    var CmdMoveToProto = cr.behaviors.Rex_GridMove.CmdMoveTo.prototype;
    
    CmdMoveToProto.tick = function ()
	{
        if (this.is_hit_target)
        {        
            this.is_moving = false;             
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_GridMove.prototype.cnds.OnHitTarget, this.inst); 
            this.is_my_call = false;
            this.is_hit_target = false;
        }
        
        if ( (!this.activated) || (!this.is_moving) ) 
        {
            return;
        }
        
		var dt = this.runtime.getDt(this.inst);
        if (dt==0)   // can not move if dt == 0
            return;
		
        // assign speed
        var is_slow_down = false;
        if (this.move.dec != 0)
        {
            // is time to deceleration?                
            var _speed = this.current_speed;
            var _distance = (_speed*_speed)/(2*this.move.dec); // (v*v)/(2*a)
            is_slow_down = (_distance >= this.remain_distance);
        }
        var acc = (is_slow_down)? (-this.move.dec):this.move.acc;
        if (acc != 0)
        {
            this._set_current_speed( this.current_speed + (acc * dt) );    
        }

		// Apply movement to the object     
        var distance = this.current_speed * dt;
        this.remain_distance -= distance;   

        // is hit to target at next tick?
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {            
            this.inst.x = this.target.x;
            this.inst.y = this.target.y;
            this._set_current_speed(0);
            this.is_hit_target = true;
        }
        else
        {
            var angle = this.target.angle;
            this.inst.x += (distance * Math.cos(angle));
            this.inst.y += (distance * Math.sin(angle));
        } 

		this.inst.set_bbox_changed();
	};
	
	CmdMoveToProto._set_current_speed = function(speed)
	{
        if (speed != null)
        {
            this.current_speed = (speed > this.move.max)? 
                                 this.move.max: speed;
        }        
        else if (this.move.acc==0)
        {
            this.current_speed = this.move.max;
        }
	};  
    
	CmdMoveToProto.set_target_pos = function (_x, _y)
	{
        var dx = _x - this.inst.x;
        var dy = _y - this.inst.y;
        
        this.is_moving = true;         
		this.target.x = _x;
        this.target.y = _y; 
        this.target.angle = Math.atan2(dy, dx);
        this.remain_distance = Math.sqrt( (dx*dx) + (dy*dy) );
        this._set_current_speed(null);
	}; 
}());  