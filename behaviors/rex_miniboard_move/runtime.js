// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_miniboard_move = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_miniboard_move.prototype;
		
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
    
	var _get_uid = function(objs)
	{
        var uid;
	    if (objs == null)
	        uid = null;
	    else if (typeof(objs) === "object")
	    {
	        var inst = objs.getFirstPicked();
	        uid = (inst!=null)? inst.uid:null;
	    }
	    else
	        uid = objs;
            
        return uid;
	};
    
	behinstProto.onCreate = function()
	{  
        if (!this.recycled)
        {
            this._cmd_move_to = new cr.behaviors.Rex_miniboard_move.CmdMoveTo(this);
        } 
        this.is_set_position = (this.properties[4] == 1);
        
        this._cmd_move_to.Reset(this);        
        this.is_moving_request_accepted = false;
        
        this.exp_Direction = (-1);
        this.exp_SourceLX = (-1);
        this.exp_SourceLY = (-1);        
        this.exp_DestinationLX = (-1);
        this.exp_DestinationLY = (-1);
        this.exp_TargetPX = 0;
        this.exp_TargetPY = 0;
        
        this.is_my_call = false; 
	};
	
    behinstProto.tick = function ()
	{
	    this._cmd_move_to.tick();
	};
	
    behinstProto.set_move_target = function (tlx, tly, dir)
    {
        var mainboard = this.inst.mainboard;
        this.exp_SourceLX = mainboard.LOX;
        this.exp_SourceLY = mainboard.LOY;       
               
        this.exp_DestinationLX = tlx;
        this.exp_DestinationLY = tly;
        this.exp_Direction = (dir != null)? dir:(-1); 
    };	
    
    var TestModeMap = [0, 2, 3];
	behinstProto.moveTo_miniboard = function (tlx, tly, dir, test_mode, is_set_position, is_test)
	{	    
	    this.set_move_target(tlx, tly, dir);
	    var miniboard = this.inst;
	    miniboard.PullOutChess();
	    var mainboard_ref = miniboard.mainboard_last;	
		var can_move = miniboard.CanPut(mainboard_ref.inst, tlx, tly, TestModeMap[test_mode]);
        var is_push_back = true;
		if (can_move)
		{
            if (!is_test)
            {
			    // set physical position
		        this.moveto_pxy(tlx, tly, dir, is_set_position);
				// set logical position
                miniboard.PutChess(mainboard_ref.inst,  // board_inst
	                               tlx,                 // offset_lx
	                               tly,                 // offset_ly
	                               null,                // test_mode
	                               false,               // is_pos_set
	                               false,               // is_put_test
	                               true                 // ignore_put_request
	                               );	
                is_push_back = false;                                   
            }			
		}
        
        if (is_push_back)
        {
	        miniboard.PutChess(mainboard_ref.inst,     // board_inst
	                           mainboard_ref.LOX,      // offset_lx
	                           mainboard_ref.LOY,      // offset_ly
	                           null,                   // test_mode
	                           false,                  // is_pos_set
	                           false,                  // is_put_test
	                           true                    // ignore_put_request
	                           );             
        }
        
        if (!is_test)
        {
            this.on_moving_request_success(can_move);
        }	   
        return can_move;	                                        
                      
    };

    behinstProto.moveto_pxy = function(lx, ly, dir, enable_moveTo)
    {
        var mainboard_inst = this.inst.mainboard_last.inst;
        var layout = mainboard_inst.GetLayout();
        this.exp_TargetPX = layout.LXYZ2PX(lx, ly, 0);
        this.exp_TargetPY = layout.LXYZ2PY(lx, ly, 0);
        
        if (!enable_moveTo)
            return;
            
        var MoveSegmentKlass = cr.behaviors.Rex_miniboard_move.MoveSegment;        
        var seg = new MoveSegmentKlass(this.inst.x, this.inst.y, this.exp_TargetPX, this.exp_TargetPY);
        this._cmd_move_to.move_start(seg);   
    };	
	
    behinstProto.on_moving_request_success = function(can_move)
    {
        this.is_moving_request_accepted = can_move;           
        this.is_my_call = true; 
        var trig = (can_move)? cr.behaviors.Rex_miniboard_move.prototype.cnds.OnMovingRequestAccepted:
                               cr.behaviors.Rex_miniboard_move.prototype.cnds.OnMovingRequestRejected;
        this.runtime.trigger(trig, this.inst);                                           
        this.is_my_call = false;  
    };
    
	behinstProto.moveto_neighbor = function (dir, test_mode, is_test)
	{
	    var mainboard_ref = this.inst.mainboard;
	    if (mainboard_ref.inst == null)
            return false;

        var board = mainboard_ref.inst;
        var tlx = board.GetNeighborLX(mainboard_ref.LOX, mainboard_ref.LOY, dir);
        var tly = board.GetNeighborLY(mainboard_ref.LOX, mainboard_ref.LOY, dir);
        return this.moveTo_miniboard(tlx, tly, dir, test_mode, this.is_set_position, is_test);
	};    
    
	behinstProto.moveTo_offset = function (dx, dy, test_mode, is_test)
	{
	    var mainboard_ref = this.inst.mainboard;
	    if (mainboard_ref.inst == null)
            return false;
        
        var board = mainboard_ref.inst;
        var tlx = mainboard_ref.LOX + dx;
        var tly = mainboard_ref.LOY + dy;
        var dir = mainboard_ref.inst.xy2NeighborDir(mainboard_ref.LOX, mainboard_ref.LOY, tlx, tly);
        return this.moveTo_miniboard(tlx, tly, dir, test_mode, this.is_set_position, is_test);    
    };    
    
	behinstProto.moveto_LXY = function (lx, ly, test_mode, is_test)
	{
	    var mainboard_ref = this.inst.mainboard;
	    if (mainboard_ref.inst == null)
            return false;
        
        var board = mainboard_ref.inst;
        var dir = mainboard_ref.inst.xy2NeighborDir(mainboard_ref.LOX, mainboard_ref.LOY, lx, ly);
        return this.moveTo_miniboard(lx, ly, dir, test_mode, this.is_set_position, is_test);     
    };     
      
	behinstProto.saveToJSON = function ()
	{  
	    return { "mrq": this.is_moving_request_accepted,
                 "mt": this._cmd_move_to.saveToJSON(),
                 "e_dir" : this.exp_Direction,
                 "e_slx" : this.exp_SourceLX,
                 "e_sly" : this.exp_SourceLY,                 
                 "e_dlx" : this.exp_DestinationLX,
                 "e_dly" : this.exp_DestinationLY,
                 "e_tpx" : this.exp_TargetPX,
                 "e_tpy" : this.exp_TargetPY,        
                };
	};	
		
	behinstProto.loadFromJSON = function (o)
	{       
        this.is_moving_request_accepted = o["mrq"];
	    this._cmd_move_to.loadFromJSON(o["mt"]);
        this.exp_Direction = o["e_dir"]; 
        this.exp_SourceLX = o["e_slx"];
        this.exp_SourceLY = o["e_sly"];         
        this.exp_DestinationLX = o["e_dlx"];
        this.exp_DestinationLY = o["e_dly"];
        this.exp_TargetPX = o["e_tpx"];  
        this.exp_TargetPY = o["e_tpy"];        
	};	
	
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnHitTarget = function ()
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
		return this.is_moving_request_accepted;
	};
    Cnds.prototype.TestMoveToOffset = function (dx, dy, test_mode)
	{
        return this.moveTo_offset(dx, dy, test_mode, true);
	};    
    Cnds.prototype.TestMoveToNeighbor = function (dir, test_mode)
	{
	    return this.moveto_neighbor(dir, test_mode, true);
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
		this._cmd_move_to.move["max"] = s;
        this._cmd_move_to._set_current_speed(null);
	};      
    
	Acts.prototype.SetAcceleration = function (a)
	{
		this._cmd_move_to.move["acc"] = a;
        this._cmd_move_to._set_current_speed(null);
	};
	
	Acts.prototype.SetDeceleration = function (a)
	{
		this._cmd_move_to.move["dec"] = a;
	};
    
	Acts.prototype.SetCurrentSpeed = function (s)
	{
        this._cmd_move_to._set_current_speed(s);
	}; 
    
	Acts.prototype.MoveToNeighbor = function (dir, test_mode)
	{
	    this.moveto_neighbor(dir, test_mode, false);
	};
    
	Acts.prototype.MoveToLXY = function (lx, ly, test_mode)
	{
        this.moveto_LXY (lx, ly, test_mode, false);    
    }; 
    
	Acts.prototype.MoveToOffset = function (dx, dy, test_mode)
	{
        this.moveTo_offset(dx, dy, test_mode, false);
    };
    
 	Acts.prototype.Stop = function ()
	{
        this._cmd_move_to.is_moving = false;
	};   
	
	Acts.prototype.MoveToTargetChess = function (objtype, test_mode)
	{
	    var mainboard_ref = this.inst.mainboard;
	    if (mainboard_ref.inst == null)
            return false;
            
        var board = mainboard_ref.inst;            
	    var uid = _get_uid(objtype);
	    if (uid == null)
	        return;
                      
        var target_xyz = board.uid2xyz(uid);
        if (target_xyz == null)
            return;
            
        var tlx = target_xyz.x;
        var tly = target_xyz.y;
        var dir = mainboard_ref.inst.xy2NeighborDir(mainboard_ref.LOX, mainboard_ref.LOY, tlx, tly);
        var is_test = false;
        this.moveTo_miniboard(tlx, tly, dir, test_mode, this.is_set_position, is_test);     
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
		ret.set_float(this._cmd_move_to.move["max"]);
	}; 

	Exps.prototype.Acc = function (ret)
	{
		ret.set_float(this._cmd_move_to.move["acc"]);
	};  

 	Exps.prototype.Dec = function (ret)
	{
		ret.set_float(this._cmd_move_to.move["dec"]);
	}; 

	Exps.prototype.TargetX = function (ret)
	{
		ret.set_float(this.exp_TargetPX);
	};  

 	Exps.prototype.TargetY = function (ret)
	{
		ret.set_float(this.exp_TargetPY);
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
        
 	Exps.prototype.SourceLX = function (ret)
	{
        ret.set_int(this.exp_SourceLX);		
	};  	
    
 	Exps.prototype.SourceLY = function (ret)
	{
        ret.set_int(this.exp_SourceLY);		
	}; 
}());

(function ()
{
    var MoveSegment = function (x0, y0, x1, y1)
    {
        if (arguments.length > 0)
            this.Reset(x0, y0, x1, y1);
        else 
            this.Reset(0, 0, 0, 0);
    }
    var MoveSegmentProto = MoveSegment.prototype;
    
    MoveSegmentProto.Reset = function(x0, y0, x1, y1)
    {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.angle = cr.angleTo(x0, y0, x1, y1);
        this.remain_distance = cr.distanceTo(this.x0, this.y0, this.x1, this.y1);
    };
    
    MoveSegmentProto.GetRemainDistance = function(d)
    {
        this.remain_distance -= d;
        return this.remain_distance;
    };
	MoveSegmentProto.saveToJSON = function ()
	{
		return { "x0": this.x0,
		         "y0": this.y0,
                 "x1": this.x1,
                 "y1": this.y1,
                 "a" : this.angle,
                 "rd" : this.remain_distance
               };
	};
	
	MoveSegmentProto.loadFromJSON = function (o)
	{  
		this.x0 = o["x0"];
		this.y0 = o["y0"]; 
		this.x1 = o["x1"];
		this.y1 = o["y1"]; 
		this.angle = o["a"];
		this.remain_distance = o["rd"];
	};
	        
    cr.behaviors.Rex_miniboard_move.MoveSegment = MoveSegment;
    
    
    var CmdMoveTo = function(plugin)
    {     
        this.move = {"max":0,
                     "acc":0,
                     "dec":0};
        this.segments = [];
    };
    var CmdMoveToProto = CmdMoveTo.prototype;
    
	CmdMoveToProto.Reset = function(plugin)
	{
        this.activated = plugin.properties[0];
        this.move["max"] = plugin.properties[1];
        this.move["acc"] = plugin.properties[2];
        this.move["dec"] = plugin.properties[3];
        this.segments.length = 0;
        this.is_moving = false;  
        this.current_speed = 0;
        this.remain_distance = 0;  // used to control the moving speed
        this.is_hit_target = false;
        this.is_my_call = false; 
        
        this.inst = plugin.inst;
        this.runtime = plugin.runtime;
	};
    
    CmdMoveToProto.tick = function ()
	{
        if (this.is_hit_target)
        {        
            this.is_moving = false;             
            this.is_my_call = true;
            this.runtime.trigger(cr.behaviors.Rex_miniboard_move.prototype.cnds.OnHitTarget, this.inst); 
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
        if (this.move["dec"] != 0)
        {
            // is time to deceleration?                
            var _speed = this.current_speed;
            var d = (_speed*_speed)/(2*this.move["dec"]); // (v*v)/(2*a)
            is_slow_down = (d >= this.remain_distance);
        }
        var acc = (is_slow_down)? (-this.move["dec"]):this.move["acc"];
        if (acc != 0)
        {
            this._set_current_speed( this.current_speed + (acc * dt) );    
        }

		// Apply movement to the object     
        var distance = this.current_speed * dt;
        this.remain_distance -= distance;  
        var cur_seg = this.segments[0];
        var seg_remain_distance = cur_seg.GetRemainDistance( distance );       

        // is hit to target of current segment?
        if ( (seg_remain_distance <= 0) || (this.current_speed <= 0) )
        {            
            if (this.segments.length == 1)
            {
                this.inst.x = cur_seg.x1;
                this.inst.y = cur_seg.y1;
                this._set_current_speed(0);                
                this.is_hit_target = true;
                this.segments.length = 0;
            }
            else
            {
                this.segments.shift(); 
                this.set_star_pos(seg_remain_distance);
            }
        }
        else
        {
            var angle = cur_seg.angle;
            this.inst.x += (distance * Math.cos(angle));
            this.inst.y += (distance * Math.sin(angle));
        } 

		this.inst.set_bbox_changed();
	};
	
	CmdMoveToProto._set_current_speed = function(speed)
	{
        if (speed != null)
        {
            this.current_speed = (speed > this.move["max"])? 
                                 this.move["max"]: speed;
        }        
        else if (this.move["acc"]==0)
        {
            this.current_speed = this.move["max"];
        }
	};  
    
	CmdMoveToProto.move_start = function ()
	{
        this.segments.length = 0;
        this.remain_distance = 0;        
        var i, cnt=arguments.length, seg;
        for(i=0; i<cnt; i++)
        {
            seg = arguments[i];
            this.segments.push(seg);
            this.remain_distance += seg.remain_distance;
        }
        
        this._set_current_speed(null);
        this.is_moving = true;
        this.set_star_pos();
	};
    
	CmdMoveToProto.set_star_pos = function (offset_distance)
	{
	    var cur_seg = this.segments[0];
	    var offx=0, offy=0;
	    if ((offset_distance != null) && (offset_distance != 0))
	    {
	        offx = offset_distance * Math.cos(cur_seg.angle);
	        offy = offset_distance * Math.sin(cur_seg.angle);
	        cur_seg.GetRemainDistance( offset_distance )
	    }
        this.inst.x = cur_seg.x0 + offx;
        this.inst.y = cur_seg.y0 + offy;
        this.inst.set_bbox_changed();
    };	

	CmdMoveToProto.saveToJSON = function ()
	{
	    var i, cnt=this.segments.length;
	    var seg_save = [];
	    for (i=0; i<cnt; i++)
	    {
	        seg_save.push(this.segments[i].saveToJSON());
	    }
		return { "en": this.activated,
		         "v": this.move,
                 "is_m": this.is_moving,
                 "c_spd" : this.current_speed,
                 "rd" : this.remain_distance,
                 "is_ht" : this.is_hit_target,
                 "seg" : seg_save
               };
	};
	
	CmdMoveToProto.loadFromJSON = function (o)
	{  
		this.activated = o["en"];
		this.move = o["v"];
		this.is_moving = o["is_m"]; 
		this.current_speed = o["c_spd"];
		this.remain_distance = o["rd"];		
		this.is_hit_target = o["is_ht"];
		
	    var seg_save = o["seg"];		
	    var i, cnt=seg_save.length;
	    for (i=0; i<cnt; i++)
	    {
	        var seg = new MoveSegment();
	        seg.loadFromJSON(seg_save[i]);
	        this.segments.push(seg);
	    }		
	};	
    
    cr.behaviors.Rex_miniboard_move.CmdMoveTo = CmdMoveTo;
}());  