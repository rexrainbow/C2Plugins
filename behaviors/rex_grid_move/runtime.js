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
	};       

    behinstProto.tick = function ()
	{
	    this._cmd_move_to.tick();
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
                    return this.board;
                }
            }
        }
        return null;	
	};
	
    behinstProto._xyz_get = function ()
    {
	    var board = this._board_get();
		if (board != null)
		    return board.uid2xyz(this.inst.uid);
	    else
            return null;
    };
    
    var _solid_get = function(inst)
    {
        return (inst.extra != null) && (inst.extra.solidEnabled);
    };

    behinstProto._test_move_to = function (target_x, target_y, target_z)
    {
        this.exp_BlockerUID = (-1);
        this.exp_DestinationLX = target_x;
        this.exp_DestinationLY = target_y;
        
        if (!this.board.is_inside_board(target_x, target_y))  // tile does not exist
            return null;        
            
        var _target_uid = this.board.xyz2uid(target_x, target_y, target_z);
        if (_target_uid == null)  // no overlap at the same z
        {
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
        if (can_move == 1)
        {
            // can move to neighbor
            this.board.move_item(this.inst, target_x, target_y, target_z);
            // set moveTo
            var layout = this.board.layout;
            this._cmd_move_to._set_target_pos(layout.GetX(target_x, target_y, target_z), 
                                              layout.GetY(target_x, target_y, target_z));
            this._is_moving_request_accepted = true;           
            this.is_my_call = true;                          
            this.runtime.trigger(cr.behaviors.Rex_GridMove.prototype.cnds.OnMovingRequestAccepted, this.inst);                                           
            this.is_my_call = false; 
        } 
        else if (can_move == (-1))
        {
            this._is_moving_request_accepted = false;
            this.is_my_call = true;                             
            this.runtime.trigger(cr.behaviors.Rex_GridMove.prototype.cnds.OnMovingRequestRejected, this.inst);                                           
            this.is_my_call = false;            
        }    
        else
        {
            this._is_moving_request_accepted = false;
        }
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
		return (this._cmd_move_to.is_my_call);
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
		var _xyz = this._xyz_get();
		if (_xyz == null)
		    return false;

        var can_move = this._test_move_to(_xyz.x+dx, _xyz.y+dy, _xyz.z);	    
		return (can_move==1);
	};
    Cnds.prototype.TestMoveToNeighbor = function (dir)
	{
		var _xyz = this._xyz_get();
		if (_xyz == null)
		    return false;

        var _board = this._board_get();
        var can_move = this._test_move_to(_board.layout.GetNeighborLX(_xyz.x, _xyz.y, dir), 
		                                  _board.layout.GetNeighborLY(_xyz.x, _xyz.y, dir),
							              _xyz.z);	    
		return (can_move==1);			 
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
	        
        this.exp_Direction = dir;	    
	    var _xyz = this._xyz_get();
        if (_xyz == null)
            return;
        var _board = this._board_get();		        
        this._move_to_target(_board.layout.GetNeighborLX(_xyz.x, _xyz.y, dir), 
                             _board.layout.GetNeighborLY(_xyz.x, _xyz.y, dir),
        					 _xyz.z);
	};
	
	Acts.prototype.MoveToOffset = function (dx, dy)
	{
	    if (!this._cmd_move_to.activated)
	        return;
	        
		var _xyz = this._xyz_get();
		if (_xyz != null)
		    this._move_to_target(_xyz.x+dx, _xyz.y+dy, _xyz.z);	    
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
        ret.set_int(this.exp_Direction);		
	};
    
 	Exps.prototype.DestinationLX = function (ret)
	{
        ret.set_int(this.exp_DestinationLX);		
	};    
    
 	Exps.prototype.DestinationLY = function (ret)
	{
        ret.set_int(this.exp_DestinationLY);		
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
            this.is_moving = false;
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
        this.is_my_call = true;
        this.runtime.trigger(cr.behaviors.Rex_GridMove.prototype.cnds.OnMoving, this.inst);
        this.is_my_call = false;
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
    
	CmdMoveToProto._set_target_pos = function (_x, _y)
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