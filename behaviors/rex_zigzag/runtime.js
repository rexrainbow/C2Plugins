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
        return ({"cmd":name,"param":param});
    };
    
    var _speed_parsing = function(speed_string)
    {
        var speed_setting = (speed_string != "")?
                            eval("("+speed_string+")"): null;
        return speed_setting;
    };
    
    var parsing_result = [null, null];
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
        
        parsing_result[0] = ret_cmd;
        parsing_result[1] = speed_string;
        return parsing_result;
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
            tmp = _cmd_parsing1(cmds[i]);
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
                    cmd_parsed["speed"] = _speed_parsing(tmp[1]);
                    ret_cmds.push(cmd_parsed);
                }
                else
                {
                    log ("Zigzag : Can not parse command "+ i +": '" + cmd + "'"); 
                    continue;
                }                    
            }
            else
            {
               log ("Zigzag : Can not parse command "+ i +": '" + cmd + "'");  
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

        if (!this.recycled)
        {         
            this.pos_state = {"x":0, "y":0, "a":0};
        }        
        this.pos_state["x"] = this.inst.x;
        this.pos_state["y"] = this.inst.y, 
        this.pos_state["a"] = init_angle;
        
        if (!this.recycled)
        {         
            this.CmdQueue = new cr.behaviors.Rex_Zigzag.CmdQueue(this.properties[3]);
        }
        else
        {
            this.CmdQueue.Init(this.properties[3]);
        }
        
        if (!this.recycled)
        {            
            this.CmdMove = new cr.behaviors.Rex_Zigzag.CmdMoveKlass(this.inst, 
                                                                    this.properties[5],
                                                                    this.properties[6],
                                                                    this.properties[7],
                                                                    precise_mode,
                                                                    continued_mode);  
        }
        else
        {
            this.CmdMove.Init(this.inst, 
                              this.properties[5],
                              this.properties[6],
                              this.properties[7],
                              precise_mode,
                              continued_mode);  
        }
        
        if (!this.recycled)
        {         
            this.CmdRotate = new cr.behaviors.Rex_Zigzag.CmdRotateKlass(this.inst, 
                                                                        is_rotatable,
                                                                        this.properties[8],
                                                                        this.properties[9],
                                                                        this.properties[10],
                                                                        precise_mode,
                                                                        continued_mode);
        }                                                                       
        else
        {
            this.CmdRotate.Init(this.inst, 
                                is_rotatable,
                                this.properties[8],
                                this.properties[9],
                                this.properties[10],
                                precise_mode,
                                continued_mode);
        }                                
        
        if (!this.recycled)
        {          
            this.CmdWait = new cr.behaviors.Rex_Zigzag.CmdWaitKlass(continued_mode); 
        }
        else
        {
            this.CmdWait.Init(continued_mode);         
        }
        
        if (!this.recycled)
        {          
            this.cmd_map = {"M":this.CmdMove,
                            "R":this.CmdRotate,
                            "W":this.CmdWait};
        }
                        
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
                    cmd = this.cmd_map[this.cur_cmd["cmd"]]; 
                    cmd.CmdInit(this.pos_state, this.cur_cmd["param"], this.cur_cmd["speed"]);
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
                cmd = this.cmd_map[this.cur_cmd["cmd"]];                
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
    
	behinstProto.saveToJSON = function ()
	{ 
		return { "en": this.activated,
		         "ir": this.is_run,
		         "ps": this.pos_state,
                 "cq": this.CmdQueue.saveToJSON(),
                 "cc": this.cur_cmd,
                 "cm": this.CmdMove.saveToJSON(),
                 "cr": this.CmdRotate.saveToJSON(),
                 "cw": this.CmdWait.saveToJSON(),
                };
	};
    
	behinstProto.loadFromJSON = function (o)
	{    
        this.activated = o["en"];
        this.is_run = o["ir"]; 
        this.pos_state = o["ps"]; 
        this.CmdQueue.loadFromJSON(o["cq"]);
        this.cur_cmd = o["cc"];
        this.CmdMove.loadFromJSON(o["cm"]);   
        this.CmdRotate.loadFromJSON(o["cr"]); 
        this.CmdWait.loadFromJSON(o["cw"]); 
        
        if (this.cur_cmd != null)  // link to cmd object
        {            
            var cmd = this.cmd_map[this.cur_cmd["cmd"]]; 
            cmd.target = this.pos_state;
        }
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.CompareMovSpeed = function (cmp, s)
	{
		return cr.do_cmp(this.CmdMove.current_speed, cmp, s);
	}; 
    
	Cnds.prototype.CompareRotSpeed = function (cmp, s)
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
            ret = ((cur_cmd["cmd"] == "M") && (cur_cmd["param"] >=0));
            break;
        case 1: //"B"
            ret = ((cur_cmd["cmd"] == "M") && (cur_cmd["param"] < 0));
            break;
        case 2: //"R"
            ret = ((cur_cmd["cmd"] == "R") && (cur_cmd["param"] >=0));
            break;
        case 3: //"L"
            ret = ((cur_cmd["cmd"] == "R") && (cur_cmd["param"] < 0));
            break;
        case 4: //"W"
            ret = (cur_cmd["cmd"] == "W");
            break; 
        default:  // any
            ret = true;            
        }
		return ret;    
    }

	Cnds.prototype.IsCmd = function (_cmd)
	{
        return _is_in_cmd(this.cur_cmd, _cmd);
	};     
    
	Cnds.prototype.OnCmdQueueFinish = function ()
	{
		return (this.is_my_call);
	};
      
	Cnds.prototype.OnCmdStart = function (_cmd)
	{
		return (_is_in_cmd(this.cur_cmd, _cmd) && this.is_my_call);
	};
    
	Cnds.prototype.OnCmdFinish = function (_cmd)
	{
        return (_is_in_cmd(this.cur_cmd, _cmd) && this.is_my_call);
	};    
    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = s;
	};  

	Acts.prototype.Start = function ()
	{
        this.cur_cmd = null;
        this.is_run = true;
		this.CmdQueue.Reset();
        // update pos_state
        this.pos_state["x"] = this.inst.x;
        this.pos_state["y"] = this.inst.y;
        if (this.CmdRotate.rotatable)
            this.pos_state["a"] = this.inst.angle;
	};     
    
	Acts.prototype.Stop = function ()
	{
        this.cur_cmd = null;
        this.is_run = false;
	}; 
    
	Acts.prototype.SetMaxMovSpeed = function (s)
	{
        this.CmdMove.move["max"] = s;
	}; 
    
	Acts.prototype.SetMovAcceleration = function (s)
	{
        this.CmdMove.move["acc"] = s;
	};  
    
	Acts.prototype.SetMovDeceleration = function (s)
	{
        this.CmdMove.move["dec"] = s;
	}; 
    
	Acts.prototype.SetMaxRotSpeed = function (s)
	{
        this.CmdRotate.move["max"] = s;
	}; 
    
	Acts.prototype.SetRotAcceleration = function (s)
	{
        this.CmdRotate.move["acc"] = s;
	};  
    
	Acts.prototype.SetRotDeceleration = function (s)
	{
        this.CmdRotate.move["dec"] = s;
	};  
    
	Acts.prototype.SetRepeatCount = function (s)
	{
        this.CmdQueue.repeat_count = s;
        this.CmdQueue.repeat_count_save = s;
	};  
    
	Acts.prototype.CleanCmdQueue = function ()
	{
        this.CmdQueue.CleanAll();
	};      
    
    var _cmd_Index2NameMap = ["F","B","R","L","W"];  
	Acts.prototype.AddCmd = function (_cmd, param)
	{
        this.AddCommand(_cmd_Index2NameMap[_cmd], param);
	}; 

	Acts.prototype.AddCmdString = function (cmd_string)
	{
        this.AddCommandString(cmd_string);
	};     
    
	Acts.prototype.SetRotatable = function (s)
	{
        this.CmdRotate.rotatable = (s==1);
	};    
    
	Acts.prototype.SetMovingAngle = function (s)
	{
        var _angle = cr.to_clamped_radians(s);
        this.pos_state["a"] = _angle;
        if (this.CmdRotate.rotatable)
        {
            this.inst.angle = _angle;
            this.inst.set_bbox_changed();
        }
	};    
    
	Acts.prototype.SetPrecise = function (s)
	{
        var precise_mode = (s==1);
        this.CmdMove.precise_mode = precise_mode;
        this.CmdRotate.precise_mode = precise_mode;        
	};     
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int(this.activated);
	};    
    
	Exps.prototype.MovSpeed = function (ret)
	{
		ret.set_float(this.CmdMove.current_speed);
	};
    
	Exps.prototype.MaxMovSpeed = function (ret)
	{
		ret.set_float(this.CmdMove.move["max"]);
	};  
    
	Exps.prototype.MovAcc = function (ret)
	{
		ret.set_float(this.CmdMove.move["acc"]);
	}; 
    
	Exps.prototype.MovDec = function (ret)
	{
		ret.set_float(this.CmdMove.move["dec"]);
	};  
    
	Exps.prototype.RotSpeed = function (ret)
	{
		ret.set_float(this.CmdRotate.current_speed);
	};
    
	Exps.prototype.MaxRotSpeed = function (ret)
	{
		ret.set_float(this.CmdRotate.move["max"]);
	};  
    
	Exps.prototype.RotAcc = function (ret)
	{
		ret.set_float(this.CmdRotate.move["acc"]);
	}; 
    
	Exps.prototype.RotDec = function (ret)
	{
		ret.set_float(this.CmdRotate.move["dec"]);
	};      
    
	Exps.prototype.Rotatable = function (ret)
	{
		ret.set_int(this.CmdRotate.rotatable);
	};    
        
	Exps.prototype.RepCnt = function (ret)
	{
		ret.set_int(this.CmdQueue.repeat_count_save);
	};
        
	Exps.prototype.CmdIndex = function (ret)
	{
		ret.set_int(this.CmdQueue.cur_cmd_queuq_index);
	};
        
	Exps.prototype.MovAngle = function (ret)
	{
        var angle;
        if (_is_in_cmd(this.cur_cmd, 2) || _is_in_cmd(this.cur_cmd, 3))
        {
            angle = this.CmdRotate.current_angle_deg;
            if (angle < 0)
                angle = 360 + angle;
        }
        else
            angle = cr.to_clamped_degrees(this.pos_state["a"]);
		ret.set_float(angle);
	};    
        
}());

(function ()
{
    // command queue
    cr.behaviors.Rex_Zigzag.CmdQueue = function(repeat_count)
    {
        this.Init(repeat_count);
    };
    var CmdQueueProto = cr.behaviors.Rex_Zigzag.CmdQueue.prototype;

    CmdQueueProto.Init = function(repeat_count)
	{
        this.CleanAll();
        this.repeat_count = repeat_count;
        this.repeat_count_save = repeat_count;
	};
    
    CmdQueueProto.CleanAll = function()
	{
        this.queue_index = 0;   
        this.cur_cmd_queuq_index = -1;        
        this._queue = [];
	};
    
    CmdQueueProto.Reset = function()
	{        
        this.repeat_count = this.repeat_count_save;    
        this.queue_index = 0;       
        this.cur_cmd_queuq_index = -1;        
	};
    
    CmdQueueProto.Push = function(item)
    {
        this._queue.push(item);
    };

    CmdQueueProto.PushList = function(items)
    {
        this._queue.push.apply(this._queue, items);
    };  
    
    CmdQueueProto.GetCmd = function()
	{
        var cmd;
        cmd = this._queue[this.queue_index];
        this.cur_cmd_queuq_index = this.queue_index;
        var index = this.queue_index+1;
        if (index >= this._queue.length)
        {
            if (this.repeat_count != 1)      // repeat
            {
                this.queue_index = 0;
                this.repeat_count -= 1;
            }
            else
            {
                this.queue_index = (-1);    // finish
            }                       
        }
        else
            this.queue_index = index;
        return cmd;
	};
    
	CmdQueueProto.saveToJSON = function ()
	{ 
		return { "i": this.queue_index,
                 "cci": this.cur_cmd_queuq_index,
		         "q": this._queue,
                 "rptsv": this.repeat_count_save,
                 "rpt": this.repeat_count
                };
	};
    
	CmdQueueProto.loadFromJSON = function (o)
	{    
        this.queue_index = o["i"];
        this.cur_cmd_queuq_index = o["cci"];
	    this._queue =o["q"];     
        this.repeat_count_save = o["rptsv"];
        this.repeat_count = o["rpt"];   
	};	    
     
    // move
    cr.behaviors.Rex_Zigzag.CmdMoveKlass = function(inst, 
                                               max_speed, acc, dec, 
                                               precise_mode, continued_mode)
    {
        this.Init(inst, 
                  max_speed, acc, dec, 
                  precise_mode, continued_mode);
    };
    var CmdMoveKlassProto = cr.behaviors.Rex_Zigzag.CmdMoveKlass.prototype;
    
    CmdMoveKlassProto.Init = function(inst, 
                                 max_speed, acc, dec, 
                                 precise_mode, continued_mode)
    {
        this.inst = inst;
        this.move = {"max":max_speed, "acc":acc, "dec":dec};
        this.is_done = true;
        this.precise_mode = precise_mode;        
        this.continued_mode = continued_mode;
        this.current_speed = 0;       
    };
    
    CmdMoveKlassProto.CmdInit = function(zigzag_state, distance,
                                 speed_setting)
    {
        this.target = zigzag_state;
        this.dir = (distance >= 0);
        this.remain_distance = Math.abs(distance);
        this.is_done = false;
        var angle = zigzag_state["a"];
        zigzag_state["x"] += (distance * Math.cos(angle));
        zigzag_state["y"] += (distance * Math.sin(angle)); 

        if (speed_setting)
            _speed_reset.apply(this, speed_setting);           
        _set_current_speed.call(this, null);            
    };    
    
    CmdMoveKlassProto.Tick = function(dt)
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
                this.inst.x = this.target["x"];
                this.inst.y = this.target["y"];
            }
            else  // non-precise mode
            {
                var angle = this.target["a"];
                distance += this.remain_distance;
                this.inst.x += (distance * Math.cos(angle));
                this.inst.y += (distance * Math.sin(angle));            
                this.target["x"] = this.inst.x;
                this.target["y"] = this.inst.y;
            }
            remain_dt = (this.continued_mode)? _remaind_dt_get.call(this):0;    
        }
        else
        {
            var angle = this.target["a"];
            if (!this.dir)
                distance = -distance;
            this.inst.x += (distance * Math.cos(angle));
            this.inst.y += (distance * Math.sin(angle));
            remain_dt = 0;            
        } 

		this.inst.set_bbox_changed();
        return remain_dt;    
    };    

	CmdMoveKlassProto.saveToJSON = function ()
	{ 
		return { "v": this.move,
                 "id": this.is_done,
                 "pm": this.precise_mode,
                 "cspd":this.current_speed,
                 //"t": this.target,
                 "dir": this.dir,
                 "rd": this.remain_distance,
                };
	};
    
	CmdMoveKlassProto.loadFromJSON = function (o)
	{    
        this.move = o["v"]; 
        this.is_done = o["id"]; 
        this.precise_mode = o["pm"];
        this.current_speed = o["cspd"];
        //this.target = o["t"];
        this.dir = o["dir"];
        this.remain_distance = o["rd"];
	};      
    
    // rotate
    cr.behaviors.Rex_Zigzag.CmdRotateKlass = function(inst, 
                                                 rotatable, 
                                                 max_speed, acc, dec, 
                                                 precise_mode, continued_mode)
    {
        this.Init(inst, 
                  rotatable, 
                  max_speed, acc, dec, 
                  precise_mode, continued_mode);
    };
    var CmdRotateKlassProto = cr.behaviors.Rex_Zigzag.CmdRotateKlass.prototype;
    
    CmdRotateKlassProto.Init = function(inst, 
                                   rotatable, 
                                   max_speed, acc, dec, 
                                   precise_mode, continued_mode)
    {
        this.inst = inst;
        this.rotatable = rotatable;
        this.move = {"max":max_speed, "acc":acc, "dec":dec};
        this.is_done = true;
        this.is_zeroDt_mode = ( (max_speed >= 36000) && (acc==0) && (dec==0) );
        this.precise_mode = precise_mode;   
        this.continued_mode = continued_mode;     
        this.current_angle_deg = (rotatable)? cr.to_clamped_degrees(inst.angle):0;
        this.current_speed = 0;
    };
    
    CmdRotateKlassProto.CmdInit = function(zigzag_state, distance,
                                   speed_setting)
    {
        this.target = zigzag_state;
        this.current_angle_deg = cr.to_clamped_degrees(zigzag_state["a"]);
        this._target_angle_deg = this.current_angle_deg + distance;
        this.dir = (distance >= 0);
        var angle = cr.to_clamped_radians(this._target_angle_deg);
        this.remain_distance = Math.abs(distance);
        this.is_done = false;        
        zigzag_state["a"] = angle;

        if (speed_setting)
            _speed_reset.apply(this, speed_setting);        
        _set_current_speed.call(this, null);             
    };    
    
    CmdRotateKlassProto.Tick = function(dt)
    {
        var remain_dt;    
        var target_angle_rad;       
        if (this.is_zeroDt_mode)
        {
            remain_dt = dt;
            this.is_done = true;
            target_angle_rad = this.target["a"];
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
                    target_angle_rad = this.target["a"];                                      
                    this.current_angle_deg = this._target_angle_deg;                    
                }
                else  // non-precise mode
                {
                    distance += this.remain_distance;
                    this.current_angle_deg += ((this.dir)? distance:(-distance));
                    target_angle_rad = cr.to_clamped_radians(this.current_angle_deg);                
                    this.target["a"] = target_angle_rad;
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

	CmdRotateKlassProto.saveToJSON = function ()
	{ 
		return { "ra": this.rotatable,
                 "v": this.move,
                 "id": this.is_done,
                 "izm": this.is_zeroDt_mode,
                 "pm": this.precise_mode,
                 "cad": this.current_angle_deg,
                 "cspd":this.current_speed,
                 //"t": this.target,
                 "tad": this._target_angle_deg,
                 "dir": this.dir,
                 "rd": this.remain_distance,
                };
	};
    
	CmdRotateKlassProto.loadFromJSON = function (o)
	{    
        this.rotatable = o["ra"];
        this.move = o["v"]; 
        this.is_done = o["id"]; 
        this.is_zeroDt_mode = o["izm"]; 
        this.precise_mode = o["pm"];
        this.current_angle_deg = o["cad"];
        this.current_speed = o["cspd"];
        //this.target = o["t"];
        this._target_angle_deg = o["tad"];
        this.dir = o["dir"];
        this.remain_distance = o["rd"];
	};    
    
	var _set_current_speed = function(speed)
	{
        var move = this.move;
        if (speed != null)
        {
            this.current_speed = (speed > move["max"])? 
                                 move["max"]: speed;
        }        
        else if (move["acc"] > 0)
        {
            this.current_speed = 0;
        }
        else 
        {
            this.current_speed = move["max"];        
        }
	};  

    var _move_distance_get = function(dt)
    {
        var move = this.move;
        // assign speed
        var is_slow_down = false;
        if (move["dec"] != 0)
        {
            // is time to deceleration?                
            var _speed = this.current_speed;
            var _distance = (_speed*_speed)/(2*move["dec"]); // (v*v)/(2*a)
            is_slow_down = (_distance >= this.remain_distance);
        }
        var acc = (is_slow_down)? (-move["dec"]):move["acc"];
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
        if ( (this.move["acc"]>0) || (this.move["dec"]>0) )
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
            this.move["max"] = max;
        if (acc!= null)
            this.move["acc"] = acc;
        if (dec!= null)
            this.move["dec"] = dec;
    };    
    
    // wait
    cr.behaviors.Rex_Zigzag.CmdWaitKlass = function(continued_mode)
    {
        this.Init(continued_mode);
    };
    var CmdWaitKlassProto = cr.behaviors.Rex_Zigzag.CmdWaitKlass.prototype;
    
    CmdWaitKlassProto.Init = function(continued_mode)
    {
        this.is_done = true;
        this.continued_mode = continued_mode;
    };
    
    CmdWaitKlassProto.CmdInit = function(zigzag_state, distance)
    {
        this.remain_distance = distance;
        this.is_done = false;
        this.target = zigzag_state;
    };    
    
    CmdWaitKlassProto.Tick = function(dt)
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

	CmdWaitKlassProto.saveToJSON = function ()
	{ 
		return { "id": this.is_done,
                 "rd": this.remain_distance,
                };
	};
    
	CmdWaitKlassProto.loadFromJSON = function (o)
	{    
        this.is_done = o["id"];
        this.remain_distance = o["rd"];   
	};    
}());