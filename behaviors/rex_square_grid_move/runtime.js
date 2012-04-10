// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_SquareGridMove = function(runtime)
{
	this.runtime = runtime;
    this.uid2solid = {};     // mapping uid to solid property of behavior instance
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_SquareGridMove.prototype;
		
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
        
        this.uid2solid = this.behavior.uid2solid;   // mapping uid to behavior instance
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.board = null;
        this.is_solid = (this.properties[0] == 1);
        // parameters of moveTo
        this.move = {max:this.properties[1],
                     acc:this.properties[2],
                     dec:this.properties[3]};
        this.target = {x:0 , y:0, angle:0};
        this.is_moving = false;  
        this.current_speed = 0;       
        this.remain_distance = 0;
        this.is_hit_target = false;
        this.is_my_call = false;        
        
        this.uid2solid[this.inst.uid] = this.is_solid;        
	};
	behinstProto.onDestroy = function()
	{
		delete this.uid2solid[this.inst.uid];
	};        

    behinstProto.tick = function ()
	{
        if (this.is_hit_target)
        {
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_SquareGridMove.prototype.cnds.OnHitTarget, this.inst); 
            this.is_my_call = false;
            this.is_hit_target = false;
        }
        
        if ( (this.activated == 0) || (!this.is_moving) ) 
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
        this.runtime.trigger(cr.behaviors.Rex_SquareGridMove.prototype.cnds.OnMoving, this.inst);
        this.is_my_call = false;
	};
    
    behinstProto._xyz_get = function ()
    {
        var _xyz;
        if (this.board != null)
        {
            _xyz = this.board.uid2xyz(this.inst.uid);
            if (_xyz != null)
                return _xyz;
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
                    return _xyz;
                }
            }
        }
        return null;
    };

    behinstProto._move_to_neighbor = function (dx, dy)
    {
        var _xyz = this._xyz_get();
        if (_xyz == null)
            return;
        var _target_x = _xyz.x + dx;
        var _target_y = _xyz.y + dy;
        var _target_uid = this.board.xyz2uid(_target_x,_target_y, _xyz.z);
        if (_target_uid == null)  // no overlap at the same z
        {
            var z_max = this.board.z_max;
            var z;
            for (z=0; z<=z_max; z++)    // find out if neighbors have solid property
            {
                _target_uid = this.board.xyz2uid(_target_x,_target_y, z);
                if ((z==0) && (_target_uid == null))  // tile does not exist
                    return;
                else if ((_target_uid != null) && (this.uid2solid[_target_uid]))
                    return;
            }           
        }
        else
            return;
        
        // can move to neighbor
        this.board.move_item(this.inst.uid, _target_x,_target_y, _xyz.z);
        // set moveTo
        this._set_target_pos(this.board.layout.GetX(_target_x,_target_y), 
                             this.board.layout.GetY(_target_x,_target_y));
    };
    
	behinstProto._set_current_speed = function(speed)
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
    
	behinstProto._set_target_pos = function (_x, _y)
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
	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
    
    var dir2dx = [0,0,1,-1];
    var dir2dy = [-1,1,0,0];
	acts.MoveToNeighbor = function (dir)
	{
		this._move_to_neighbor(dir2dx[dir], dir2dy[dir]);
	};
	acts.SetSolid = function (enable)
	{
		this.is_solid = (enable == 1);
        this.uid2solid[this.inst.uid] = this.is_solid;
	};    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
}());