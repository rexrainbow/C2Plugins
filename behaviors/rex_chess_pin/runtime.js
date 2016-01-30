// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_ChessPin = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_ChessPin.prototype;
		
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
        
		this.board = null;
		this.pinChess = null;
        this.pinChessUid = -1;		// for loading
		this.pinedChess_board = null;
		this.dLX = null;
		this.dLY = null;
		
		// Need to know if pinned object gets destroyed
		if (!this.recycled)
		{
		    this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this);
        }										
										
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
		// Pinned object being destroyed
		if (this.pinChess === inst)
			this.pinChess = null;
	};
	
	behinstProto.onDestroy = function()
	{
		this.pinChess = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	
	behinstProto.tick = function ()
	{
		// do work in tick2 instead, after events to get latest object position
	};

	behinstProto.tick2 = function ()
	{
		if ((!this.pinChess) || (!this.activated))
			return;
			
        var _xyz = this._pinedChessLXYZ_get(this.pinChess);
		var my_xyz = this._myLXYZ_get(this.inst);
		if ((_xyz == null) || (my_xyz == null))
		    return;
			
		var new_lx = _xyz.x - this.dLX;
		var new_ly = _xyz.y - this.dLY;
		if ((new_lx == my_xyz.x) && (new_ly == my_xyz.y))
		    return;
		this.board = this.GetBoard(this.board, this.inst.uid);
        this.board.MoveChess(this.inst, new_lx, new_ly, my_xyz.z);
        this.runtime.trigger(cr.behaviors.rex_ChessPin.prototype.cnds.OnLogicalPositionChanged, this.inst); 
	};
    
   	behinstProto.GetBoard = function (current_board, uid)
	{
        var _xyz;
        if (current_board != null)
        {
            _xyz = current_board.uid2xyz(uid);
            if (_xyz != null)
                return current_board;  // find out xyz on board
        }
            
        var plugins = this.runtime.types;
        var name, obj;
        for (name in plugins)
        {
            obj = plugins[name].instances[0];
            if ((obj != null) && (obj.check_name == "BOARD"))
            {
                _xyz = obj.uid2xyz(uid);
                if (_xyz != null)
                {					
                    return obj;
                }
            }
        }
        return null;	
	};    

	behinstProto._myLXYZ_get = function ()
	{
	    this.board = this.GetBoard(this.board, this.inst.uid);
		if (this.board == null)
		    return null;
	    else
		    return this.board.uid2xyz(this.inst.uid);
	};	
	behinstProto._pinedChessLXYZ_get = function (pined_chess)
	{
	    this.pinedChess_board = this.GetBoard(this.pinedChess_board, pined_chess.uid);
		if (this.pinedChess_board == null)
		    return null;
	    else
		    return this.pinedChess_board.uid2xyz(pined_chess.uid);
	};
    
	behinstProto.pin = function (pined_chess)
	{
		if (!pined_chess)
        {
            this.pinChess = null;
			return;
        }
			
		var _xyz = this._pinedChessLXYZ_get(pined_chess);
		var my_xyz = this._myLXYZ_get(this.inst);
		if ((_xyz == null) || (my_xyz == null))
		{
		    this.pinChess = null;
		    this.dLX = null;
		    this.dLY = null;	
		}
		else
		{
		    this.pinChess = pined_chess;
		    this.dLX = _xyz.x - my_xyz.x;
		    this.dLY = _xyz.y - my_xyz.y;				
	    }
	};    
	
	behinstProto.saveToJSON = function ()
	{
		return {"en": this.activated,
                "uid": (this.pinChess != null) ? this.pinChess.uid : (-1),
		       };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.activated = o["en"];		// wait until afterLoad to look up		
		this.pinChessUid = o["uid"];
	};
	
	behinstProto.afterLoad = function ()
	{
		// Look up the pinned object UID now getObjectByUID is available
		if (this.pinChessUid === -1)
			this.pinChess = null;
		else
		{
			this.pinChess = this.runtime.getObjectByUID(this.pinChessUid);
			assert2(this.pinChess, "Failed to find pin object by UID");
		}
		
		this.pinChessUid = -1;
        
        this.board = null;
        this.pinedChess_board = null;
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.IsPinned = function ()
	{
		return !!this.pinChess;
	};

	Cnds.prototype.OnLogicalPositionChanged = function ()
	{
		return true;
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.Pin = function (obj)
	{
		if (!obj)
			return;
			
		var pined_chess = obj.getFirstPicked();
        this.pin(pined_chess);
	};
	
	Acts.prototype.Unpin = function ()
	{
		this.pinChess = null;
	};
	
	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s==1);
	};

	Acts.prototype.PinUID = function (uid)
	{
		var pined_chess = this.runtime.getObjectByUID(uid);
        this.pin(pined_chess);
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	
}());