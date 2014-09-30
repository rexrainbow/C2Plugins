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
	    this.activated = (this.properties[0]==1);
	    this.mainboard_save = {mainboard:null,
	                           LOX:(-1),
	                           LOY:(-1)
	                           };
	};
	
	behinstProto.tick = function ()
	{
	};
	
	behinstProto.pull_out = function ()
	{        
	    var miniboard = this.inst;
	    this.mainboard_save.mainboard = miniboard.mainboard;
	    if (miniboard.mainboard == null)
	        return;
	        
	    this.mainboard_save.LOX = miniboard.LOX;
	    this.mainboard_save.LOY = miniboard.LOX;	    
	    mainboard.PullOutChess();
	};	
	
	behinstProto.put_back = function ()
	{        	   
	    if (this.mainboard_save.mainboard == null)
	        return;
	        
	    this.inst.PutChess(this.mainboard_save.mainboard, 
	                       this.mainboard_save.LOX, 
	                       this.mainboard_save.LOY, 
	                       false);
	};	
	
	behinstProto.is_empty_check = function (lx, ly, lz)
	{
	    if (this.mainboard_save.mainboard == null)
	        return true;
	        
	    lx += this.mainboard_save.LOX;
	    ly += this.mainboard_save.LOY;
	    return this.mainboard_save.mainboard.is_empty(lx, ly, lz);
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
	
	behinstProto.chess_pos_reset = function (chess_angle)
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
            chess_inst.angle = cr.to_clamped_radians( cr.to_degrees(chess_inst.angle) + chess_angle );
            chess_inst.set_bbox_changed();
            miniboard.add_uid2pdxy(chess_inst);
        }
		layout.SetPOX(pox_save);
		layout.SetPOY(poy_save);	    
	};	

	behinstProto._logical_rotate_miniBoard = function (a)
	{       
        var layout = this.inst.type.GetLayout();    
	    var uid, xyz, new_items = {};
	    // rotate items to new_items  
	    for (uid in this.inst.items)
	    {
	        xyz = this.inst.items[uid];
	        var new_xyz = {};
            new_xyz.x = layout.LXYZRotate2LX(xyz.x, xyz.y, xyz.z, a+1);
            new_xyz.y = layout.LXYZRotate2LY(xyz.x, xyz.y, xyz.z, a+1);
	        new_xyz.z = xyz.z;
	        
	        // extra checking: if rotate to non-empty cell, break rotating
	        if (!this.is_empty_check(new_xyz.x, new_xyz.y, new_xyz.z))
	        {
	            return null;
	        }
	        
	        new_items[uid] = new_xyz;
	    }
	    return new_items;
	};    
	behinstProto.rotate_miniboard = function (a, is_pos_set)
	{
	    this.pull_out();	      
	    var new_items = this._logical_rotate_miniBoard(a);
	    var is_success = (new_items != null);
	    if (is_success)
	    {
	        this.miniboard_lxyreset(new_items);
	        if (is_pos_set)
	        {
	            var chess_angle = (a+1) * 90;
	            this.chess_pos_reset(chess_angle);
	        }       
	    }
	    
	    this.put_back();
	};    
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.activated = o["en"];
	};
	//////////////////////////////////////
	// Conditions
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.RotateSquareMiniBoard = function (a, is_pos_set)
	{
        this.rotate_miniboard(a, is_pos_set);
	};  

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
}());