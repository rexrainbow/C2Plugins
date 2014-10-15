// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.rex_chess_road = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.rex_chess_road.prototype;
		
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

    function GetThisBehavior(inst)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i] instanceof behaviorProto.Instance)
				return inst.behavior_insts[i];
		}
		
		return null;
	};	
    
    
	behinstProto.onCreate = function()
	{
        this.enable = (this.properties[0]==1);
	    this.tag = this.properties[1];
	    this.board = null;
        this.ActSetAnimFrame = (cr.plugins_.Sprite == null)? null:
                               cr.plugins_.Sprite.prototype.acts.SetAnimFrame;
	};
	
	behinstProto.tick = function ()
	{
	    if (this.enable)
	        this.update();
	};
	
	behinstProto.update = function ()
	{
	    if (!this.ActSetAnimFrame)
	        return;
	    
        var score = this.neighbor_score_get();
        if (score == null)
            return;

        this.ActSetAnimFrame.call(this.inst, score);
	};	
	
	behinstProto.neighbor_score_get = function ()
	{
	    var board = this.GetBoard();
        if (board == null)
            return null;
            
        var xyz = board.uid2xyz(this.inst.uid);
        var layout = board.GetLayout();
        var dir, dir_count = layout.GetDirCount();
        var neighbor_uid, neighbor_inst, binst;
        var score=0;
        for (dir=0; dir<dir_count; dir++)
        {
            neighbor_uid = board.dir2uid(this.inst.uid, dir, xyz.z);
            if (neighbor_uid == null)
                continue;            
            neighbor_inst = board.uid2inst(neighbor_uid);
            if (neighbor_inst == null)
                continue;
            binst = GetThisBehavior(neighbor_inst);
            if (binst == null)
                continue;
            if (binst.tag != this.tag)
                continue;     
    
            score += (1<<dir);
        }
        return score;        
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
		
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.enable
                };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.enable = o["en"];
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

	Acts.prototype.SetEnable = function (s)
	{
		this.enable = (s==1);
	};
	
	Acts.prototype.Update = function ()
	{
		this.update();
	};
	
	Acts.prototype.SetTag = function (tag)
	{
		this.tag = tag;
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.Tag = function (ret)
	{
		ret.set_string(this.tag);
	};

	Exps.prototype.FrameIndex = function (ret)
	{
        var score = this.neighbor_score_get();
        if (score == null)
            score = 0;	
		ret.set_int(score);
	};
	
}());