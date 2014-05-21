// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_light = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_light.prototype;
		
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
		this.obstacleTypes = [];						// object types to check for as obstructions
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
        this.enabled = (this.properties[0] !== 0);
        this.max_width = this.properties[1];
        this.obstacleMode = this.properties[2];		// 0 = solids, 1 = custom
        this.exp_HitUID = -1;
	};

	behinstProto.tick = function ()
	{
        if (!this.enabled)
            return;
        
        if (this.obstacleMode == 0)  // 0 = solids
        {
            this.PointTo();
        }
        else  // 1 = custom
        {
            this.PointTo(this.type.obstacleTypes);
        }
	}; 
    
	behinstProto.width_set = function (w)
	{
        if (w == this.inst.width)
            return;
            
        this.inst.width = w;
        this.inst.set_bbox_changed();    
	};     

    var candidates = [];
	behinstProto.candidates_update = function (types)
	{
        candidates.length = 0;    
        if (types == null)  // use solids
        {
            var solid = this.runtime.getSolidBehavior();
            if (solid)
		        cr.appendArray(candidates, solid.my_instances.valuesRef());
        }
        else
        {
            var i, cnt=types.length;
            for (i=0; i<cnt; i++)
            {
                cr.appendArray(candidates, types[i].instances);
            }
        }
        
        var width_save = this.inst.width;
        // remove overlap at start
        this.width_set(1);         
        var i,cnt=candidates.length;
        for (i=cnt-1; i>=0; i--)
        {
            if (this.runtime.testOverlap(this.inst, candidates[i]))
            {                
                cr.arrayRemove(candidates, i);
            }
        }
        this.width_set(width_save);
        return (candidates.length > 0);
	}; 
   
	behinstProto.test_hit = function ()
	{
        var i,cnt=candidates.length;
        for (i=0; i<cnt; i++)
        {
            if (this.runtime.testOverlap(this.inst, candidates[i]))
                return candidates[i].uid;
        }
        return null;
	}; 

	behinstProto.PointTo = function (types)
	{
        var has_any_candidate = this.candidates_update(types);
        if (!has_any_candidate)
        {
            this.width_set(this.max_width);
            this.exp_HitUID = -1;
            return;
        }
        
        this.dec_approach();
        this.inc_approach();
	}; 
    
	behinstProto.dec_approach = function ()
	{
        if (this.test_hit() == null)
            return;
            
        var w=this.inst.width, dw=1;        
        var out_of_range;
        while (1)
        {
            w -= dw;
            out_of_range = (w < 0);
            this.width_set((out_of_range)? 0:w);
            if (out_of_range)     
                return;
            if (this.test_hit() == null)  // dec until miss
                return;
            else
                dw *= 2;   
        }
	};   

	behinstProto.inc_approach = function ()
	{     
        var w=this.inst.width, dw=1;        
        var out_of_range, hit_uid;    
        while(1)
        {
            w += dw;
            out_of_range = (w > this.max_width);
            this.width_set((out_of_range)? this.max_width:w);
            if (out_of_range)
            {
                this.exp_HitUID = -1;
                return;
            }
            hit_uid = this.test_hit();
            if (hit_uid != null)
            {
                if (dw == 1)
                {
                    // done
                    //log("Hit");
                    this.exp_HitUID = hit_uid;   
                    return;
                }
                else
                {
                    //log("overshot");
                    w -= dw;
                    dw = 1;
                }
            }
            else
            {
                dw *= 2;
            }
        } 
	};    

	behinstProto.saveToJSON = function ()
	{    
		return { "en": this.enabled,
		         "mw": this.max_width,
		         "hU": this.exp_HitUID
		         };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.enabled = o["en"];
	    this.max_width = o["mw"];
	    this.exp_HitUID = o["hU"];
	};
		
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsHit = function ()
	{
		return (this.exp_HitUID != -1);
	};
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.PointToSolid = function ()
	{
		this.PointTo();
	};	
    
    var types = [];
	Acts.prototype.PointToObject = function (obj_)
	{
        types.length = 0;    
        if (obj_)
        {
            types.push(obj_);
        }
		this.PointTo(types);
	};  
    
	Acts.prototype.SetMaxWidth = function (w)
	{
	    if (w < 0)
	        w = 0;
		this.max_width = w;
	};	
	
	Acts.prototype.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
	};    

	Acts.prototype.AddObstacle = function (obj_)
	{
		var obstacleTypes = this.type.obstacleTypes;
		
		// Check not already a target, we don't want to add twice
		if (obstacleTypes.indexOf(obj_) !== -1)
			return;
		
		// Check obj is not a member of a family that is already a target
		var i, len, t;
		for (i = 0, len = obstacleTypes.length; i < len; i++)
		{
			t = obstacleTypes[i];
			
			if (t.is_family && t.members.indexOf(obj_) !== -1)
				return;
		}
		
		obstacleTypes.push(obj_);
	};    
	
	Acts.prototype.ClearObstacles = function ()
	{
		this.type.obstacleTypes.length = 0;
	};	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

    Exps.prototype.HitX = function (ret)
	{
        var x = this.inst.x + this.inst.width * Math.cos(this.inst.angle);
	    ret.set_float(x);
	};

    Exps.prototype.HitY = function (ret)
	{
        var y = this.inst.y + this.inst.width * Math.sin(this.inst.angle);
	    ret.set_float(y);
	};

    Exps.prototype.HitUID = function (ret)
	{
	    ret.set_int(this.exp_HitUID);
	};

    Exps.prototype.MaxWidth = function (ret)
	{
	    ret.set_int(this.max_width);
	};	
	
	Exps.prototype.ReflectionAngle = function (ret, normal)
	{    
        var normalangle = cr.to_radians(normal);
        var startangle = this.inst.angle;
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normalangle);
		var ny = Math.sin(normalangle);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
        var ra = cr.angleTo(0, 0, rx, ry);
	    ret.set_float(cr.to_degrees(ra));
	};	
}());