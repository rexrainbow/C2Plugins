// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_chess = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_chess.prototype;
		
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
		this.inst = inst;
		this.runtime = type.runtime;       
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{     
	    this.board = null;
	};

	behinstProto.tick = function ()
	{
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
    
	behinstProto.afterLoad = function ()
	{
		this.board = null;
	};
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
        var board = this.GetBoard();
        var xyz, boardUID;
        if (board)
        {
            xyz = this.GetBoard().uid2xyz(this.inst.uid);
            boardUID = board.uid;
        }
        else
        {
            xyz = "";
            boardUID = -1;
        }
            
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "LXYZ", "value": JSON.stringify(xyz)},
				{"name": "Board UID", "value": boardUID},
			]
		});
	};
	/**END-PREVIEWONLY**/    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	

	Cnds.prototype.CompareLX = function (cmp, lx)
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return false;
	    var _xyz = board.uid2xyz(this.inst.uid);    
		return cr.do_cmp(_xyz.x, cmp, lx);
	};
	
	Cnds.prototype.CompareLY = function (cmp, ly)
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return false;
	    var _xyz = board.uid2xyz(this.inst.uid);    
		return cr.do_cmp(_xyz.y, cmp, ly);
	};
	
	Cnds.prototype.CompareLZ = function (cmp, lz)
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return false;
	    var _xyz = board.uid2xyz(this.inst.uid);    
		return cr.do_cmp(_xyz.z, cmp, lz);
	};	
		
	Cnds.prototype.IsTile = function ()
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return false;
	    var _xyz = board.uid2xyz(this.inst.uid);	    
		return (_xyz.z == 0);
	};
	
	Cnds.prototype.IsOnTheBoard = function (board_objs)
	{
		if (!board_objs)
			return;
		return (this.GetBoard() == board_objs.getFirstPicked());
	};	
	
	Cnds.prototype.OnCollided = function (objB)
	{
		if (!objB)
			return;
				    
	    var objA = this.inst.type;
		var board = this.GetBoard();
		if (board == null)
		    return false;
            
	    board._overlap_test(objA, objB);
		// We've aleady run the event by now.
		return false;
	};
	
	Cnds.prototype.IsOverlapping = function (objB)
	{
		if (!objB)
			return;
				    
	    var objA = this.inst.type;
		var board = this.GetBoard();
		if (board == null)
		    return false;
            
	    board._overlap_test(objA, objB);
		// We've aleady run the event by now.
		return false;
	};	
	
	Cnds.prototype.AreNeighbors = function (uidB)
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
			return false;
		
        return (board.uid2NeighborDir(this.inst.uid, uidB) != null);
	};	
	
	Cnds.prototype.NoChessAbove = function ()
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return false;
	    
        var _xyz = board.uid2xyz(this.inst.uid);
        if (_xyz.z !== 0)  // not a tile
            return false;
        
	    var cnt = board.xy2zCnt(_xyz.x, _xyz.y);
		return (cnt == 1);		
	};	

	Cnds.prototype.NoChessAboveLZ = function (z)
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return false;
	    
        var _xyz = board.uid2xyz(this.inst.uid);
		return board.IsEmpty(_xyz.x, _xyz.y, z);	
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.AddChess = function (board_objs, lx, ly, lz)
	{
		if (!board_objs)
			return;
				    
	    var chess_uid = this.inst.uid;
	    if (this.board != null)  // at other board
	        this.board.RemoveChess(chess_uid);
	    this.board = board_objs.instances[0];
	    this.board.AddChess(this.inst,lx, ly, lz);
	    
	    if (this.board.uid2xyz(chess_uid) == null)  // add chess fail
	        this.board = null;
	}; 			

	Acts.prototype.RemoveChess = function ()
	{
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return;
	    board.RemoveChess(this.inst.uid);   
	}; 	

	Acts.prototype.MoveChess = function (tile_objs)
	{
		if (!tile_objs)
			return;
				    
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return;
	        
	    var tile_uid = _get_uid(tile_objs);
	    if (tile_uid == null)
	        return;  
        
        var chess_uid = this.inst.uid;
        var chess_xyz = board.uid2xyz(chess_uid);
        var tile_xyz = board.uid2xyz(tile_uid);
	    if (tile_xyz == null)
	        return;  
	                
        board.MoveChess(chess_uid, tile_xyz.x, tile_xyz.y, chess_xyz.z); 
	};	
	
	Acts.prototype.MoveChess2Index = function (lx, ly, lz)
	{	
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return;
 
        var chess_uid = this.inst.uid;
	    board.RemoveChess(chess_uid);   
        board.AddChess(chess_uid, lx, ly, lz);        
	}; 
	
	Acts.prototype.SwapChess = function (uidB)
	{	
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        return;   
        board.SwapChess(this.inst.uid, uidB);
	};		
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
	
	Exps.prototype.LX = function (ret)
	{
	    var lx;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        lx = (-1);
	    else
	        lx = board.uid2xyz(this.inst.uid).x;
		ret.set_int(lx);
	};	
	
	Exps.prototype.LY = function (ret)
	{
	    var ly;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        ly = (-1);
	    else
	        ly = board.uid2xyz(this.inst.uid).y;
		ret.set_int(ly);
	};
	
	Exps.prototype.LZ = function (ret)
	{
	    var lz;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        lz = (-1);
	    else
	        lz = board.uid2xyz(this.inst.uid).z;
		ret.set_int(lz);
	};		
	
	Exps.prototype.BoardUID = function (ret)
	{
	    var uid;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        uid = (-1);
	    else
	        uid = board.uid;
		ret.set_int(uid);
	};		    
	Exps.prototype.LZ2UID = function (ret,lz)
	{
	    var ret_uid;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        ret_uid = (-1);
	    else
	    {
	        ret_uid = board.lz2uid(this.inst.uid, lz);
	        if (ret_uid == null)
	            ret_uid = (-1);
	    }		
	    ret.set_any(ret_uid);
	}; 	
	
	Exps.prototype.PX = function (ret,logic_x,logic_y)
	{	    
        var px;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        px = (-1);
	    else
	    {
	        var _xyz = board.uid2xyz(this.inst.uid);
	        px = board.layout.LXYZ2PX(_xyz.x,_xyz.y,_xyz.z);
	    }
	    ret.set_float(px);
	};
    
	Exps.prototype.PY = function (ret,logic_x,logic_y)
	{
        var py;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        py = (-1);
	    else
	    {
	        var _xyz = board.uid2xyz(this.inst.uid);
	        py = board.layout.LXYZ2PY(_xyz.x,_xyz.y,_xyz.z);
	    }
	    ret.set_float(py);
	};
	
	Exps.prototype.UID2LA = function (ret, uid_to)
	{
        var angle;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        angle = (-1);
	    else
	    {
	        var xyz_o = board.uid2xyz(this.inst.uid); 
	        var xyz_to = board.uid2xyz(uid_to);
	        if (xyz_to == null)
	            angle = (-1);
	        else
	        {
	            angle = board.layout.XYZ2LA(xyz_o, xyz_to);	
                if (angle == null)
                    angle = (-1); 
	        }
	       
	    }
	    ret.set_float(angle);
	};
	
	Exps.prototype.ZCnt = function (ret)
	{  	    
        var cnt;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        py = (-1);
	    else
	    {
	        var _xyz = board.uid2xyz(this.inst.uid);
	        cnt = board.xy2zCnt(_xyz.x, _xyz.y);
	    }
	    ret.set_int(cnt);
	};	 
    
	Exps.prototype.DIR2UID = function (ret,dir,lz)
	{
	    var ret_uid;
	    var board = this.GetBoard();
	    if (board == null)  // not at any board
	        ret_uid = (-1);
	    else
	    {
	        ret_uid = board.dir2uid(this.inst.uid, dir, lz);
	        if (ret_uid == null)
		        ret_uid = (-1);
	    }
	    ret.set_any(ret_uid);
	};		
}());