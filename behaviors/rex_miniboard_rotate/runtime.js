// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_miniboard_rotate = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_miniboard_rotate.prototype;
		
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
	    this.face_direction = this.properties[0];
	    this.is_rotating_request_accepted = false;
	};
	
	behinstProto.tick = function ()
	{
	};
	
	var direction_normalize = function (dir, dir_count)
	{
	    dir = dir % dir_count;
	    if (dir < 0)
	        dir += dir_count;
	        
	    return dir;
	};	

	behinstProto.miniboard_lxyreset = function (new_items)
	{        	   
        var miniboard = this.inst;
        // reset items ( uid2xyz )
        miniboard.items = new_items;
        
        // reset board ( xyz2uid )
        miniboard.board = {};	        
        var uid, xyz;
        for (uid in new_items)
        {
            xyz = new_items[uid];
            miniboard.add_to_board(xyz.x, xyz.y, xyz.z, parseInt(uid));
        }
	};		
	
	behinstProto.chess_pos_reset = function ()
	{	      
	    var miniboard = this.inst;
	    var layout = miniboard.type.GetLayout();
	    var pox_save = layout.GetPOX();
		var poy_save = layout.GetPOY();
		layout.SetPOX(miniboard.x);
		layout.SetPOY(miniboard.y);
        var _uid, xyz, chess_inst;
        for (_uid in miniboard.items)
        {
            var uid = parseInt(_uid);
            chess_inst = miniboard.uid2inst(uid);
            if (chess_inst == null)
                continue;                
            xyz = miniboard.uid2xyz(uid);         
            chess_inst.x = layout.LXYZ2PX(xyz.x, xyz.y, xyz.z);
            chess_inst.y = layout.LXYZ2PY(xyz.x, xyz.y, xyz.z);
            chess_inst.set_bbox_changed();
            miniboard.add_uid2pdxy(chess_inst);
        }
		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);	    
	};	

	behinstProto._logical_rotate_miniBoard = function (a, check_mode)
	{       
	    var miniboard = this.inst;
        var layout = miniboard.type.GetLayout(); 
        var mainboard = miniboard.mainboard_last;
        
	    var uid, xyz, new_items = {};
	    // rotate items to new_items  
	    for (uid in this.inst.items)
	    {
	        xyz = this.inst.items[uid];
	        var new_xyz = {};          
            new_xyz.x = layout.LXYZRotate2LX(xyz.x, xyz.y, xyz.z, a);
            new_xyz.y = layout.LXYZRotate2LY(xyz.x, xyz.y, xyz.z, a);
	        new_xyz.z = xyz.z;
	        
	        if (check_mode != null)
	        {
	            var lx = new_xyz.x + mainboard.LOX;
	            var ly = new_xyz.y + mainboard.LOY;
	            var lz = new_xyz.z;
	            if (!miniboard.CellCanPut(mainboard.inst, parseInt(uid), lx, ly, lz, check_mode))
	                return null;
	        }
	        new_items[uid] = new_xyz;
	    }
	    return new_items;
	};
	    
	behinstProto.rotate_miniboard = function (a, check_mode, is_pos_set, is_rotate_test)
	{
	    var dir_count = this.inst.type.GetLayout().GetDirCount();
	    a = direction_normalize(a, dir_count); 
	    if (a == 0)
	    {
            this.do_rotating_request(true);	                       
	        return true;	        
	    }
	           	    
	    var miniboard = this.inst;
	    var is_on_mainboard = (miniboard.mainboard.inst != null);
	    if (!is_on_mainboard)	    
	        check_mode = null;
	        
	    if (is_on_mainboard)
	    {
	        miniboard.PullOutChess();	
	    }

	    var new_items = this._logical_rotate_miniBoard(a, check_mode);
	    var is_success = (new_items != null);
	    if (is_success && (!is_rotate_test))
	    {
	        this.face_direction += a;
	        this.face_direction = direction_normalize(this.face_direction, dir_count);
	        this.miniboard_lxyreset(new_items);
	        if (is_pos_set)
	            this.chess_pos_reset();
	    }
	    
	    if (is_on_mainboard)
	    {	    
	        miniboard.PutChess(miniboard.mainboard_last.inst, 
	                           miniboard.mainboard_last.LOX, 
	                           miniboard.mainboard_last.LOY, 
	                           false);
	    }
        if (!is_rotate_test)
            this.do_rotating_request(is_success);	                       
            
	    return is_success;
	};

    behinstProto.do_rotating_request = function(can_rotate)
    {
        this.is_rotating_request_accepted = can_rotate;           
        var trig = (can_rotate)? cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnRotatingRequestAccepted:
                                 cr.behaviors.rex_miniboard_rotate.prototype.cnds.OnRotatingRequestRejected;
        this.runtime.trigger(trig, this.inst);
    };     
	
	behinstProto.saveToJSON = function ()
	{  
	    return {"fd": this.face_direction,
                "rq": this.is_rotating_request_accepted,
	           };
	};	
		
	behinstProto.loadFromJSON = function (o)
	{       
	    this.face_direction = o["fd"];
        this.is_rotating_request_accepted = o["rq"];
	};	
	
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    
	Cnds.prototype.TestRotate = function (a, check_mode)
	{
		return this.rotate_miniboard(a, check_mode, false, true);
	}; 
    
	Cnds.prototype.TestFaceTo = function (a, check_mode)
	{	    
	    var da = a - this.face_direction;
		return this.rotate_miniboard(a, check_mode, false, true);
	}; 
	    
	Cnds.prototype.IsRotatingRequestAccepted = function ()
	{
		return this.is_rotating_request_accepted;
	};     
    
    Cnds.prototype.OnRotatingRequestAccepted = function ()
	{
		return true;
	};	
    Cnds.prototype.OnRotatingRequestRejected = function ()
	{
		return true;
	};    
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Rotate = function (a, is_pos_set, check_mode)
	{
        this.rotate_miniboard(a, check_mode, is_pos_set, false);
	};  

	Acts.prototype.FaceTo = function (a, is_pos_set, check_mode)
	{ 
	    var da = a - this.face_direction;
        this.rotate_miniboard(da, check_mode, is_pos_set, false);
	}; 
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.Direction = function (ret)
    {
	    ret.set_int(this.face_diection);
	};	
}());