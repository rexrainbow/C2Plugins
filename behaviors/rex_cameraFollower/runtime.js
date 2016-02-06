// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_CameraFollower = function(runtime)
{
	this.runtime = runtime;
    
    this.Reset();
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_CameraFollower.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	behaviorProto.Reset = function ()
	{
        this.camera_cnt = 0;
        this.pre_scrollX = null;
        this.pre_scrollY = null;                
	};         

	behaviorProto.AddCamera = function ()
	{
        this.camera_cnt += 1;
	}; 

	behaviorProto.RemoveCamera = function ()
	{
        this.camera_cnt -= 1;
	};     
    
	behaviorProto.HasCamera = function ()
	{
        return (this.camera_cnt > 0);
	};
    
	behaviorProto.GetPreScrollX = function ()
	{
        return this.pre_scrollX;
	};    
    
	behaviorProto.GetPreScrollY = function ()
	{
        return this.pre_scrollY;
	};    
    
	behaviorProto.SetPreScrollXY = function (scrollX, scrollY)
	{
        this.pre_scrollX = scrollX;
        this.pre_scrollY = scrollY;
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
        this.isCamera = (this.properties[0] === 1);
        this.enabled = this.properties[1];
        this.ratioX = this.properties[2];
        this.ratioY = this.properties[3];
        
        this.isDone = false;        
        
        this.CountCamera();
	};
    
	behinstProto.onDestroy = function()
	{
        if (this.isCamera)    // camera
            this.behavior.RemoveCamera();
	};
    
	behinstProto.tick = function ()
	{
        this.isDone = false;                    
	};  
    
	behinstProto.tick2 = function ()
	{
        if (this.isDone)
            return;

        var hasCamera = this.behavior.HasCamera();
        if ( (!hasCamera) ||
             (hasCamera && this.isCamera)
           )
        {
            var preScrollX = this.behavior.GetPreScrollX();
            var preScrollY = this.behavior.GetPreScrollY();            
		    var curScrollX = this.GetScrollX();
            var curScrollY = this.GetScrollY();
            var dx = (preScrollX === null)?  0 : curScrollX - preScrollX;
            var dy = (preScrollY === null)?  0 : curScrollY - preScrollY;
            this.following(dx, dy);
            
            this.behavior.SetPreScrollXY(curScrollX, curScrollY);
        }                                
	};     
	
	behinstProto.following = function (dx, dy)
	{        
        var is_moving = (dx !== 0) || (dy !== 0);    
        var all = this.behavior.my_instances.valuesRef(); 
        var i, len=all.length, binst;                 
            
		for (i=0; i<len; i++)
		{
			binst = GetThisBehavior(all[i]);			
			if (!binst)
				continue;
                 
                                                 
            if ( is_moving &&
                 (!binst.isCamera) && 
                 binst.enabled &&        
                 ((binst.ratioX !== 0) || (binst.ratioY !== 0))  
               )
            {      
                binst.inst.x += (dx * binst.ratioX);
                binst.inst.y += (dy * binst.ratioY);
                binst.inst.set_bbox_changed();
            }
                
			binst.isDone = true;
		}
	};  
    
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

	behinstProto.GetScrollX = function ()
	{
        return this.inst.layer.layout.scrollX;
	};  
    
	behinstProto.GetScrollY = function ()
	{
        return this.inst.layer.layout.scrollY;
	};
    
	behinstProto.CountCamera = function ()
	{
        if (this.isCamera)    // camera
            this.behavior.AddCamera();         
	};
    
	behinstProto.saveToJSON = function ()
	{         
		return {
			"isC": this.isCamera,
            "en": this.enabled,
            "rX": this.ratioX,
            "rY": this.ratioY,
            "sX": this.behavior.GetPreScrollX(),
            "sY": this.behavior.GetPreScrollY()
		};
	};   
    
	behinstProto.loadFromJSON = function (o)
	{
        this.isCamera = o["isC"];
        this.enabled = o["en"];
        this.ratioX = o["rX"];
        this.ratioY = o["rY"]; 
                
        this.behavior.Reset();
        this.behavior.SetPreScrollXY(o["sX"], o["sY"]);        
	};
	
	behinstProto.afterLoad = function ()
	{     
        this.CountCamera();       
	};
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
		
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.SetMovingRatioX = function (ratio)
	{
		this.ratioX = ratio;
	};  
	Acts.prototype.SetMovingRatioY = function (ratio)
	{
		this.ratioY = ratio;
	};     
    
	Acts.prototype.SetFollowingEnable = function (s)
	{
        if (!this.isCamera)        
		    this.enabled = (s !== 0);
	};    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());