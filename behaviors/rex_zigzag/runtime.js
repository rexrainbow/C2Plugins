// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Zigzag = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Zigzag.prototype;
		
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
    
    var _cmd_transfer = function(name, param)
    {
        switch (name)
        {
        case "F":
            name = "M";  // move
            break;
        case "B":
            name = "M";  // move
            param = -param;
             break;
        case "R":
            name = "R";  // rotate
            break;
        case "L":
            name = "R";  // rotate
            param = -param;
            break;
        case "W":
            break;
        default:
            return null;  // no matched command
            break;
        }
        return ({cmd:name,param:param});
    };
    
    var _speed_parsing = function(speed_string)
    {
        var speed_setting = (speed_string != "")?
                            eval("("+speed_string+")"): null;
        return speed_setting;
    };
    
    var _cmd_parsing1 = function(cmd)      // split cmd string and speed setting
    {   
        var start_index = cmd.indexOf("[");
        var ret_cmd;        
        var speed_string;
        if (start_index != (-1))
        {
            speed_string = cmd.slice(start_index);
            ret_cmd = cmd.slice(0,start_index);
        }
        else
        {
            speed_string = "";
            ret_cmd = cmd;
        }
        return [ret_cmd, speed_string];
    };    
    
    var _cmds_string_parsing = function(cmd_string)
    {
        var ret_cmds = [];
        var cmds = cmd_string.split(";");
        var i;
        var cmd_length = cmds.length;
        var cmd, cmd_slices, cmd_name, cmd_param, cmd_parsed;
        var tmp;
        for (i=0; i<cmd_length; i++)
        {
            cmd = cmds[i];
            tmp = _cmd_parsing1(cmd);
            cmd = tmp[0];
            cmd = cmd.replace(/(^\s*)|(\s*$)/g,"");
            cmd = cmd.replace(/(\s+)/g," ");
            cmd_slices = cmd.split(" ");
            if (cmd_slices.length == 2)
            {
                cmd_name = cmd_slices[0].toUpperCase();
                cmd_param = parseFloat(cmd_slices[1]);
                cmd_parsed = _cmd_transfer(cmd_name, cmd_param);               
                if (cmd_parsed)
                {
                    cmd_parsed.speed = _speed_parsing(tmp[1]);
                    ret_cmds.push(cmd_parsed);
                }
                else
                {
                    alert ("Can not parse command "+ i +": '" + cmd + "'"); 
                    continue;
                }                    
            }
            else
            {
               alert ("Can not parse command "+ i +": '" + cmd + "'");  
               continue;
            }
        }
        return ret_cmds;
    };

	behinstProto.onCreate = function()
	{
        this.activated = this.properties[0];
        this.is_run = (this.properties[1] == 1);
        var is_rotatable = (this.properties[2] == 1);
        var precise_mode = (this.properties[12] == 1);
        var continued_mode = (this.properties[13]==1);        
        this.cur_cmd = null;
        this.is_my_call = false;

        var init_angle = (is_rotatable)?  
                         this.inst.angle: 
                         cr.to_clamped_radians(this.properties[11]);        
        this.pos_state = {x:this.inst.x, 
                          y:this.inst.y, 
                          angle:init_angle};
        this.CmdQueue = new cr.behaviors.Rex_Zigzag.CmdQueue(this.properties[3]);
        this.CmdMove = new cr.behaviors.Rex_Zigzag.CmdMove(this.inst, 
                                                           this.properties[5],
                                                           this.properties[6],
                                                           this.properties[7],
                                                           precise_mode,
                                                           continued_mode);  
        this.CmdRotate = new cr.behaviors.Rex_Zigzag.CmdRotate(this.inst, 
                                                               is_rotatable,
                                                               this.properties[8],
                                                               this.properties[9],
                                                               this.properties[10],
                                                               precise_mode,
                                                               continued_mode);
        this.CmdWait = new cr.behaviors.Rex_Zigzag.CmdWait(continued_mode); 
        this.cmd_map = {"M":this.CmdMove,
                        "R":this.CmdRotate,
                        "W":this.CmdWait};
                        
        this.AddCommandString(this.properties[4]);
	};

	behinstProto.tick = function ()
	{
        if ( (this.activated==0) || (!this.is_run) )
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
                    // new command start
                    cmd = this.cmd_map[this.cur_cmd.cmd]; 
                    cmd.Init(this.pos_state, this.cur_cmd.param, this.cur_cmd.speed);
                    this.is_my_call = true;
                    this.runtime.trigger(cr.behaviors.Rex_Zigzag.prototype.cnds.OnCmdStart, this.inst);                     
                    this.is_my_call = false;
                }
                else            
                {
                    // command queue finish
                    this.is_run = false;
                    this.is_my_call = true;
                    this.runtime.trigger(cr.behaviors.Rex_Zigzag.prototype.cnds.OnCmdQueueFinish, this.inst); 
                    this.is_my_call = false;
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
                // command finish
                this.is_my_call = true;
                this.runtime.trigger(cr.behaviors.Rex_Zigzag.prototype.cnds.OnCmdFinish, this.inst); 
                this.is_my_call = false;                
                this.cur_cmd = null;
            }
        }               
	};   
    
    behinstProto.AddCommand = function (cmd, param)
    {
        this.CmdQueue.Push( _cmd_transfer( cmd, param ) );
    };
    
    behinstProto.AddCommandString = function (cmd_string)
    {
        if ( cmd_string != "" )
            this.CmdQueue.PushList(_cmds_string_parsing(cmd_string));
    };

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
    
	cnds.CompareMovSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.CmdMove.current_speed, cmp, s);
	}; 
    
	cnds.CompareRotSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.CmdRotate.current_speed, cmp, s);
	}; 
    
    var _is_in_cmd = function (cur_cmd, _cmd)
    {
        if (cur_cmd == null)
            return false;
     
        var ret;
        switch (_cmd)
        {
        case 0: //"F"
            ret = ((cur_cmd.cmd == "M") && (cur_cmd.param >=0));
            break;
        case 1: //"B"
            ret = ((cur_cmd.cmd == "M") && (cur_cmd.param < 0));
            break;
        case 2: //"R"
            ret = ((cur_cmd.cmd == "R") && (cur_cmd.param >=0));
            break;
        case 3: //"L"
            ret = ((cur_cmd.cmd == "R") && (cur_cmd.param < 0));
            break;
        case 4: //"W"
            ret = (cur_cmd.cmd == "W");
            break; 
        default:  // any
            ret = true;            
        }
		return ret;    
    }

	cnds.IsCmd = function (_cmd)
	{
        return _is_in_cmd(this.cur_cmd, _cmd);
	};     
    
	cnds.OnCmdQueueFinish = function ()
	{
		return (this.is_my_call);
	};
      
	cnds.OnCmdStart = function (_cmd)
	{
		return (_is_in_cmd(this.cur_cmd, _cmd) && this.is_my_call);
	};
    
	cnds.OnCmdFinish = function (_cmd)
	{
        return (_is_in_cmd(this.cur_cmd, _cmd) && this.is_my_call);
	};    
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
		this.activated = s;
	};  

	acts.Start = function ()
	{
        this.cur_cmd = null;
        this.is_run = true;
		this.CmdQueue.Reset();
        // update pos_state
        this.pos_state.x = this.inst.x;
        this.pos_state.y = this.inst.y;
        if (this.CmdRotate.rotatable)
            this.pos_state.angle = this.inst.angle;
	};     
    
	acts.Stop = function ()
	{
        this.cur_cmd = null;
        this.is_run = false;
	}; 
    
	acts.SetMaxMovSpeed = function (s)
	{
        this.CmdMove.move.max = s;
	}; 
    
	acts.SetMovAcceleration = function (s)
	{
        this.CmdMove.move.acc = s;
	};  
    
	acts.SetMovDeceleration = function (s)
	{
        this.CmdMove.move.dec = s;
	}; 
    
	acts.SetMaxRotSpeed = function (s)
	{
        this.CmdRotate.move.max = s;
	}; 
    
	acts.SetRotAcceleration = function (s)
	{
        this.CmdRotate.move.acc = s;
	};  
    
	acts.SetRotDeceleration = function (s)
	{
        this.CmdRotate.move.dec = s;
	};  
    
	acts.SetRepeatCount = function (s)
	{
        this.CmdQueue.repeat_count = s;
        this.CmdQueue.repeat_count_save = s;
	};  
    
	acts.CleanCmdQueue = function ()
	{
        this.CmdQueue.CleanAll();
	};      
    
    var _cmd_Index2NameMap = ["F","B","R","L","W"];  
	acts.AddCmd = function (_cmd, param)
	{
        this.AddCommand(_cmd_Index2NameMap[_cmd], param);
	}; 

	acts.AddCmdString = function (cmd_string)
	{
        this.AddCommandString(cmd_string);
	};     
    
	acts.SetRotatable = function (s)
	{
        this.CmdRotate.rotatable = (s==1);
	};    
    
	acts.SetMovingAngle = function (s)
	{
        var _angle = cr.to_clamped_radians(s);
        this.pos_state.angle = _angle;
        if (this.CmdRotate.rotatable)
        {
            this.inst.angle = _angle;
            this.inst.set_bbox_changed();
        }
	};    
    
	acts.SetPrecise = function (s)
	{
        var precise_mode = (s==1);
        this.CmdMove.precise_mode = precise_mode;
        this.CmdRotate.precise_mode = precise_mode;        
	};     
    
	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
    
	exps.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
    
	exps.MovSpeed = function (ret)
	{
		ret.set_float(this.CmdMove.current_speed);
	};
    
	exps.MaxMovSpeed = function (ret)
	{
		ret.set_float(this.CmdMove.move.max);
	};  
    
	exps.MovAcc = function (ret)
	{
		ret.set_float(this.CmdMove.move.acc);
	}; 
    
	exps.MovDec = function (ret)
	{
		ret.set_float(this.CmdMove.move.dec);
	};  
    
	exps.RotSpeed = function (ret)
	{
		ret.set_float(this.CmdRotate.current_speed);
	};
    
	exps.MaxRotSpeed = function (ret)
	{
		ret.set_float(this.CmdRotate.move.max);
	};  
    
	exps.RotAcc = function (ret)
	{
		ret.set_float(this.CmdRotate.move.acc);
	}; 
    
	exps.RotDec = function (ret)
	{
		ret.set_float(this.CmdRotate.move.dec);
	};      
    
	exps.Rotatable = function (ret)
	{
		ret.set_int(this.CmdRotate.rotatable);
	};    
        
	exps.RepCnt = function (ret)
	{
		ret.set_int(this.CmdQueue.repeat_count_save);
	};
        
	exps.CmdIndex = function (ret)
	{
		ret.set_int(this.CmdQueue.export_queue_index);
	};
    
        
}());

(function ()
{
    // command queue
    cr.behaviors.Rex_Zigzag.CmdQueue = function(repeat_count)
    {
        this.CleanAll();
        this.repeat_count = repeat_count;
        this.repeat_count_save = repeat_count;
    };
    var CmdQueueProto = cr.behaviors.Rex_Zigzag.CmdQueue.prototype;
    
    CmdQueueProto.CleanAll = function()
	{
        this._queue_index = 0;    
        this._queue = [];
        
        this.export_queue_index = 0;
	};
    
    CmdQueueProto.Reset = function()
	{        
        this.repeat_count = this.repeat_count_save;    
        this._queue_index = 0;
        
        this.export_queue_index = 0;        
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
        cmd = this._queue[this._queue_index];
        this.export_queue_index = this._queue_index;
        var index = this._queue_index+1;
        if (index >= this._queue.length)
        {
            if (this.repeat_count != 1)      // repeat
            {
                this._queue_index = 0;
                this.repeat_count -= 1;
            }
            else
            {
                this._queue_index = (-1);    // finish
            }                       
        }
        else
            this._queue_index = index;
        return cmd;
	};
     
    // move
    cr.behaviors.Rex_Zigzag.CmdMove = function(inst, 
                                               max_speed, acc, dec, 
                                               precise_mode, continued_mode)
    {
        this.inst = inst;
        this.move = {max:max_speed, acc:acc, dec:dec};
        this.is_done = true;
        this.precise_mode = precise_mode;        
        this.continued_mode = continued_mode;
        this.current_speed = 0;       
    };
    var CmdMoveProto = cr.behaviors.Rex_Zigzag.CmdMove.prototype;
    
    CmdMoveProto.Init = function(zigzag_state, distance,
                                 speed_setting)
    {
        this.target = zigzag_state;
        this.dir = (distance >= 0);
        this.remain_distance = Math.abs(distance);
        this.is_done = false;
        var angle = zigzag_state.angle;
        zigzag_state.x += (distance * Math.cos(angle));
        zigzag_state.y += (distance * Math.sin(angle)); 

        if (speed_setting)
            _speed_reset.apply(this, speed_setting);           
        _set_current_speed.call(this, null);            
    };    
    
    CmdMoveProto.Tick = function(dt)
    {
        var remain_dt;
        var distance = _move_distance_get.call(this, dt);
        this.remain_distance -= distance;   

        // is hit to target at next tick?
        if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
        {
            this.is_done = true;
            if (this.precise_mode)  // precise mode
            {
                this.inst.x = this.target.x;
                this.inst.y = this.target.y;
            }
            else  // non-precise mode
            {
                var angle = this.target.angle;
                distance += this.remain_distance;
                this.inst.x += (distance * Math.cos(angle));
                this.inst.y += (distance * Math.sin(angle));            
                this.target.x = this.inst.x;
                this.target.y = this.inst.y;
            }
            remain_dt = (this.continued_mode)? _remaind_dt_get.call(this):0;    
        }
        else
        {
            var angle = this.target.angle;
            if (!this.dir)
                distance = -distance;
            this.inst.x += (distance * Math.cos(angle));
            this.inst.y += (distance * Math.sin(angle));
            remain_dt = 0;            
        } 

		this.inst.set_bbox_changed();
        return remain_dt;    
    };    
    
    // rotate
    cr.behaviors.Rex_Zigzag.CmdRotate = function(inst, 
                                                 rotatable, 
                                                 max_speed, acc, dec, 
                                                 precise_mode, continued_mode)
    {
        this.inst = inst;
        this.rotatable = rotatable;
        this.move = {max:max_speed, acc:acc, dec:dec};
        this.is_done = true;
        this.is_zeroDt_mode = ( (max_speed >= 36000) && (acc==0) && (dec==0) );
        this.precise_mode = precise_mode;   
        this.continued_mode = continued_mode;     
        this.current_angle_deg = (rotatable)? cr.to_clamped_degrees(inst.angle):0;
        this.current_speed = 0;
    };
    var CmdRotateProto = cr.behaviors.Rex_Zigzag.CmdRotate.prototype;
    
    CmdRotateProto.Init = function(zigzag_state, distance,
                                   speed_setting)
    {
        this.target = zigzag_state;
        this.current_angle_deg = cr.to_clamped_degrees(zigzag_state.angle);
        this._target_angle_deg = this.current_angle_deg + distance;
        this.dir = (distance >= 0);
        var angle = cr.to_clamped_radians(this._target_angle_deg);
        this.remain_distance = Math.abs(distance);
        this.is_done = false;        
        zigzag_state.angle = angle;

        if (speed_setting)
            _speed_reset.apply(this, speed_setting);        
        _set_current_speed.call(this, null);             
    };    
    
    CmdRotateProto.Tick = function(dt)
    {
        var remain_dt;    
        var target_angle_rad;       
        if (this.is_zeroDt_mode)
        {
            remain_dt = dt;
            this.is_done = true;
            target_angle_rad = this.target.angle;
            this.current_angle_deg = this._target_angle_deg;            
        }
        else
        {
            var distance = _move_distance_get.call(this, dt);
            this.remain_distance -= distance;   

            // is hit to target at next tick?
            if ( (this.remain_distance <= 0) || (this.current_speed <= 0) )
            {
                this.is_done = true;
                if (this.precise_mode)  // precise mode
                {
                    target_angle_rad = this.target.angle;                                      
                    this.current_angle_deg = this._target_angle_deg;                    
                }
                else  // non-precise mode
                {
                    distance += this.remain_distance;
                    this.current_angle_deg += ((this.dir)? distance:(-distance));
                    target_angle_rad = cr.to_clamped_radians(this.current_angle_deg);                
                    this.target.angle = target_angle_rad;
                }
                remain_dt = (this.continued_mode==1)? _remaind_dt_get.call(this):0;                
            }
            else
            {
                this.current_angle_deg += ((this.dir)? distance:(-distance));
                target_angle_rad = cr.to_clamped_radians(this.current_angle_deg);
                remain_dt = 0;
            } 
        }
            
        if (this.rotatable)
        {
            this.inst.angle = target_angle_rad;
		    this.inst.set_bbox_changed();
        }
        return remain_dt;    
    }; 
    
	var _set_current_speed = function(speed)
	{
        var move = this.move;
        if (speed != null)
        {
            this.current_speed = (speed > move.max)? 
                                 move.max: speed;
        }        
        else if (move.acc > 0)
        {
            this.current_speed = 0;
        }
        else 
        {
            this.current_speed = move.max;        
        }
	};  

    var _move_distance_get = function(dt)
    {
        var move = this.move;
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
    
    var _remaind_dt_get = function()
    {
        var remain_dt;
        if ( (this.move.acc>0) || (this.move.dec>0) )
        {
            _set_current_speed.call(this, 0 );   // stop in point
            remain_dt = 0;
        }
        else
        {
            remain_dt = (-this.remain_distance)/this.current_speed;
        }    
        return remain_dt;
    };
    
    
    var _speed_reset = function(max,acc,dec)
    {
        if (max!= null)
            this.move.max = max;
        if (acc!= null)
            this.move.acc = acc;
        if (dec!= null)
            this.move.dec = dec;
    };    
    
    // wait
    cr.behaviors.Rex_Zigzag.CmdWait = function(continued_mode)
    {
        this.is_done = true;
        this.continued_mode = continued_mode;
    };
    var CmdWaitProto = cr.behaviors.Rex_Zigzag.CmdWait.prototype;
    
    CmdWaitProto.Init = function(zigzag_state, distance)
    {
        this.remain_distance = distance;
        this.is_done = false;
    };    
    
    CmdWaitProto.Tick = function(dt)
    {
        this.remain_distance -= dt;
        var remain_dt;
        if (this.remain_distance <= 0)
        {
            remain_dt = (this.continued_mode)? (-this.remain_distance):0;
            this.is_done = true;
        }
        else
        {
            remain_dt = 0;
        }
        return remain_dt;    
    };     
}());