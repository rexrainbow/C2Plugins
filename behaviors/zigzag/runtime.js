// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Zigzag = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Zigzag.prototype;
		
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
    
    
    var _cmd_parsing = function(cmd_string)
    {
        var ret_cmds = [];
        var cmds = cmd_string.split(";");
        var i;
        var cmd_length = cmds.length;
        var cmd_slices, cmd_name, cmd_param;
        for (i=0; i<cmd_length; i++)
        {
            cmd_slices = cmds[i].split(" ");
            cmd_name = cmd_slices[0].toUpperCase();
            cmd_param = parseFloat(cmd_slices[1]);
            switch (cmd_name)
            {
            case "F":
                cmd_name = "M";  // move
                break;
            case "B":
                cmd_name = "M";  // move
                cmd_param = -cmd_param;
                break;
            case "R":
                cmd_name = "R";  // rotate
                break;
            case "L":
                cmd_name = "R";  // rotate
                cmd_param = -cmd_param;
                break;
            }
            ret_cmds.push({ cmd: cmd_name,
                            param: cmd_param });
        }
        return ret_cmds;
    };

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
        this.is_run = this.properties[1];
        this.rotatable = this.properties[2];
        this.cur_cmd = null;
              
        this.pos_state = {x:this.inst.x, 
                          y:this.inst.y, 
                          angle:this.inst.angle};
        this.CmdQueue = new cr.behaviors.Zigzag.CmdQueue(this.properties[9]);
        this.CmdMove = new cr.behaviors.Zigzag.CmdMove(this.inst, 
                                                       this.properties[3],
                                                       this.properties[4],
                                                       this.properties[5]);  
        this.CmdRotate = new cr.behaviors.Zigzag.CmdRotate(this.inst, 
                                                           this.rotatable,
                                                           this.properties[6],
                                                           this.properties[7],
                                                           this.properties[8]);  
        this.CmdWait = new cr.behaviors.Zigzag.CmdWait(); 
        this.cmd_map = {M:this.CmdMove,
                        R:this.CmdRotate,
                        W:this.CmdWait};                                                      
        this.CmdQueue.PushList(_cmd_parsing(this.properties[10]));
	};

	behinstProto.tick = function ()
	{
        //debugger;
        if ( (this.activated==0) || (this.is_run==0) )
            return;
                          
        var dt = this.runtime.getDt(this.inst);
        var cmd;
        while(dt)
        {
            if (this.cur_cmd == null) // try to get new cmd
            {
                this.cur_cmd = this.CmdQueue.GetCmd();
                if (this.cur_cmd != null)
                {
                    cmd = this.cmd_map[this.cur_cmd.cmd]; 
                    cmd.Start(this.pos_state, this.cur_cmd.param);    
                }
                else            
                {
                    this.is_run = false;
                    break;
                }
            }
            else
            {
                cmd = this.cmd_map[this.cur_cmd.cmd];
            }
            
            dt = cmd.Tick(dt);
            if (cmd.is_done)
            {
                this.cur_cmd = null;
            }
        }  
	};   

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  

    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
    
}());

(function ()
{
    // command queue
    cr.behaviors.Zigzag.CmdQueue = function(is_repeat)
    {
        this.CleanAll();
        this.is_repeat = is_repeat;
    };
    var CmdQueueProto = cr.behaviors.Zigzag.CmdQueue.prototype;
    
    CmdQueueProto.CleanAll = function()
	{
        this._queue_index = 0;    
        this._queue = [];
	};
    
    CmdQueueProto.Push = function(item)
    {
        this._queue.push(item);
    };

    CmdQueueProto.PushList = function(items)
    {
        var i;
        var item_len = items.length;
        for (i=0; i<item_len; i++)
        {
            this._queue.push(items[i]);
        }
    };    
    CmdQueueProto.GetCmd = function()
	{
        var cmd;
        if (this._queue_index >= 0)
        {
            cmd = this._queue[this._queue_index];
            var index = this._queue_index+1;
            if (index >= this._queue.length)         
                this._queue_index = (this.is_repeat)? 0:(-1);
            else
                this._queue_index = index;            
        } 
        else        
        {
            cmd = null;
        }
        return cmd;
	};
     
    // move
    cr.behaviors.Zigzag.CmdMove = function(inst, max_speed, acc, dec)
    {
        this.inst = inst;
        this._move = {max:max_speed, acc:acc, dec:dec};
        this.is_done = true;
    };
    var CmdMoveProto = cr.behaviors.Zigzag.CmdMove.prototype;
    
    CmdMoveProto.Start = function(zigzag_state, distance)
    {
        this.target = zigzag_state;
        this.dir = (distance >= 0);
        this.remain_distance = Math.abs(distance);
        _set_current_speed.call(this, null);
        this.is_done = false;

        var angle = zigzag_state.angle;
        zigzag_state.x += (distance * Math.cos(angle));
        zigzag_state.y += (distance * Math.sin(angle));  
    };    
    
    CmdMoveProto.Tick = function(dt)
    {
        var remain_dt = 0;
        var distance = _move_distance_get.call(this, dt);
        this.remain_distance -= distance;   

        // is hit to target at next tick?
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {
            this.is_done = true;
            this.inst.x = this.target.x;
            this.inst.y = this.target.y;
            if ( (this._move.acc>0) || (this._move.dec>0) )
            {
                this.SetCurrentSpeed(0);  // stop in point
            }
            else
            {
                //remain_dt = (-this.remain_distance)/this.current_speed;
            }
        }
        else
        {
            var angle = this.target.angle;
            if (!this.dir)
                distance = -distance;
            this.inst.x += (distance * Math.cos(angle));
            this.inst.y += (distance * Math.sin(angle));
        } 

		this.inst.set_bbox_changed();
        return remain_dt;    
    };  
    
    // rotate
    cr.behaviors.Zigzag.CmdRotate = function(inst, rotatable, max_speed, acc, dec)
    {
        this.inst = inst;
        this.rotatable = rotatable;
        this._move = {max:max_speed, acc:acc, dec:dec};
        this.is_done = true;
    };
    var CmdRotateProto = cr.behaviors.Zigzag.CmdRotate.prototype;
    
    CmdRotateProto.Start = function(zigzag_state, distance)
    {
        this.target = zigzag_state;
        this.current_angle = cr.to_clamped_degrees(zigzag_state.angle);
        this.dir = (distance >= 0);
        var angle = cr.to_clamped_radians(this.current_angle + distance);
        this.remain_distance = Math.abs(distance);
        _set_current_speed.call(this, null); 
        this.is_done = false;
        
        zigzag_state.angle = angle;

    };    
    
    CmdRotateProto.Tick = function(dt)
    {
        if (this.rotatable == 1)
        var remain_dt = 0;
        var distance = _move_distance_get.call(this, dt);
        this.remain_distance -= distance;   

        // is hit to target at next tick?
        var target_angle;
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {
            this.is_done = true;
            target_angle = this.target.angle;
        }
        else
        {
            this.current_angle += ((this.dir)? distance:(-distance));
            target_angle = cr.to_clamped_radians(this.current_angle);
        } 

        if (this.rotatable == 1)
        {
            this.inst.angle = target_angle;
		    this.inst.set_bbox_changed();
        }
        return remain_dt;    
    }; 
    
	var _set_current_speed = function(speed)
	{
        var move = this._move;
        if (speed != null)
        {
            this.current_speed = (speed > move.max)? 
                                 move.max: speed;
        }        
        else if (move.acc==0)
        {
            this.current_speed = move.max;
        }
	};  

    var _move_distance_get = function(dt)
    {
        var move = this._move;
        // assign speed
        var is_slow_down = false;
        if (move.dec != 0)
        {
            // is time to deceleration?                
            var _speed = this.current_speed;
            var _distance = (_speed*_speed)/(2*move.dec); // (v*v)/(2*a)
            is_slow_down = (_distance >= this.remain_distance);
        }
        var acc = (is_slow_down)? (-move.dec):move.acc;
        if (acc != 0)
        {
            _set_current_speed.call(this, this.current_speed + (acc * dt) );    
        }

		// Apply movement to the object     
        var distance = this.current_speed * dt;
        return distance;
    };
    
    // wait
    cr.behaviors.Zigzag.CmdWait = function()
    {
        this.is_done = true;
    };
    var CmdWaitProto = cr.behaviors.Zigzag.CmdWait.prototype;
    
    CmdWaitProto.Start = function(zigzag_state, distance)
    {
        this.remain_distance = distance;
        this.is_done = false;
    };    
    
    CmdWaitProto.Tick = function(dt)
    {
        this.remain_distance -= dt;
        var remain_dt = 0;
        if (this.remain_distance <= 0)
        {
            //remain_dt = -this.remain_distance;
            this.is_done = true;
        }
        else
        {
            remain_dt = 0;
        }
        return remain_dt;    
    };     
}());