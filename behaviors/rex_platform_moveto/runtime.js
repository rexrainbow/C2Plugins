// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Platform_MoveTo = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Platform_MoveTo.prototype;
		
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
	    this.platformBehaviorInst = null;
        this.activated = (this.properties[0] == 1);
        this.isMoving = false;
        this.target = {"m":0,       // 0: x mode , 1: distance mode
                       "dir": 0, // 0:left , 1: right
                       "x":0,
                       "y":0,
                       "d":0,
                       "ds":0 };
        this.isMyCall = false;
	};
	
	behinstProto.getPlatformBehaviorInst = function ()
    {
        if (this.platformBehaviorInst != null)
            return this.platformBehaviorInst;

	    if (!cr.behaviors.Platform)
		{
		    assert2("No platfrom behavior found in this object "+this.inst.type.name);
	    }
		var behavior_insts = this.inst.behavior_insts;
		var i, len=behavior_insts.length;
		for (i=0; i<len; i++)
		{
			if (behavior_insts[i] instanceof cr.behaviors.Platform.prototype.Instance)
			{
			    this.platformBehaviorInst = behavior_insts[i];
				return this.platformBehaviorInst;
	        }
		}
		
		assert2("No platfrom behavior found in this object."+this.inst.type.name);
    };
    	
	behinstProto.move = function (dir)   // 0: left , 1: right
    {
        var platformBehaviorInst = this.getPlatformBehaviorInst();        
        cr.behaviors.Platform.prototype.acts.SimulateControl.call(platformBehaviorInst, dir);        
    };
    
    behinstProto.tick = function ()
	{        
        if ( (!this.activated) || (!this.isMoving) ) 
        {
            return;
        }
    
	    var is_hit_target = false;        
        if (this.target["m"] == 0)       // x mode
        {
            if ( ((this.target["dir"] == 1) && (this.inst.x >= this.target["x"])) ||
                 ((this.target["dir"] == 0) && (this.inst.x <= this.target["x"])) )
                is_hit_target = true;
            else
                this.move(this.target["dir"]); 
        }
        else if (this.target["m"] == 1)    // distance mode
        {
            var x = this.inst.x;
            var y = this.inst.y;
            this.target["ds"] += cr.distanceTo(this.target["x"], this.target["y"], x, y);
            if (this.target["ds"] >= this.target["d"])
                is_hit_target = true;
            else
            {
                this.move(this.target["dir"]); 
                this.target["x"] = x;
                this.target["y"] = y;
            }
        }       
        
        if (is_hit_target)
        {            
            this.isMoving = false;
            this.isMyCall = true;
            this.runtime.trigger(cr.behaviors.Rex_Platform_MoveTo.prototype.cnds.OnHitTarget, this.inst); 
            this.isMyCall = false;            
        }   
	}; 

	behinstProto.SetTargetPos = function (_x)
	{
        this.isMoving = true;         
        this.target["m"] = 0;
        this.target["dir"] = (_x > this.inst.x)? 1:0;
        this.target["x"] = _x;
        this.target["y"] = 0;
        this.target["d"] = 0;
        this.target["ds"] = 0;        
	};
	
 	behinstProto.SetTargetPosByDistance = function (distance, dir)
	{
	    this.isMoving = true;
        this.target["m"] = 1;
        this.target["dir"] = dir;
        this.target["x"] = this.inst.x;
        this.target["y"] = this.inst.y;      
        this.target["d"] = distance;
        this.target["ds"] = 0;           
	};  
	
    function clone(obj) 
	{
        if (null == obj || "object" != typeof obj) 
		    return obj;
        var result = obj.constructor();
        for (var attr in obj) 
		{
            if (obj.hasOwnProperty(attr)) 
			    result[attr] = obj[attr];
        }
        return result;
    };
    	
	behinstProto.saveToJSON = function ()
	{
		return { "en": this.activated,
		         "im": this.isMoving,
		         "t": clone(this.target),
               };
	};
	
	behinstProto.loadFromJSON = function (o)
	{  
		this.activated = o["en"];
		this.isMoving = o["im"];
		this.target = o["t"];
	};	    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();

	Cnds.prototype.OnHitTarget = function ()
	{
		return (this.isMyCall);
	};

	Cnds.prototype.IsMoving = function ()
	{
		return (this.activated && this.isMoving);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	Acts.prototype.SetActivated = function (s)
	{
		this.activated = (s == 1);
	};  

	Acts.prototype.SetTargetPosX = function (_x)
	{
        this.SetTargetPos(_x)
	};
	
 	Acts.prototype.SetTargetPosOnObject = function (objtype)
	{
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
        if (inst != null)
            this.SetTargetPos(inst.x);
	};
    
	Acts.prototype.SetTargetPosByDeltaX = function (_x)
	{
        this.SetTargetPos(this.inst.x + _x)
	};

 	Acts.prototype.SetTargetPosByDistance = function (distance, dir)
	{
        this.SetTargetPosByDistance(distance, dir);
	};      
    
 	Acts.prototype.Stop = function ()
	{
        this.isMoving = false;
	};   	
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
    
	Exps.prototype.Activated = function (ret)
	{
		ret.set_int((this.activated)? 1:0);
	};    
    
	Exps.prototype.TargetX = function (ret)
	{
        var x = (this.isMoving)? this.target["x"]:0;
		ret.set_float(x);
	};  

}());