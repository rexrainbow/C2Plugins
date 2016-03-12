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
        
        if (this.obstacleMode === 0)  // 0 = solids
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

    var __candidates = [];
	behinstProto.get_candidates = function (types)
	{
        __candidates.length = 0;    
        if (types == null)  // use solids
        {
            var solid = this.runtime.getSolidBehavior();
            if (solid)
		        cr.appendArray(__candidates, solid.my_instances.valuesRef());
        }
        else
        {
            var i, cnt=types.length;
            for (i=0; i<cnt; i++)
            {
                cr.appendArray(__candidates, types[i].instances);
            }
        }
        
        var width_save = this.inst.width;
        // remove overlap at start
        this.width_set(1);         
        var i,cnt=__candidates.length;
        for (i=cnt-1; i>=0; i--)
        {
            if (this.runtime.testOverlap(this.inst, __candidates[i]))
            {                
                cr.arrayRemove(__candidates, i);
            }
        }
        this.width_set(width_save);
        return __candidates;
	}; 
   
	behinstProto.test_hit = function (candidates)
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
        var candidates = this.get_candidates(types);
        if (candidates.length === 0)
        {
            this.width_set(this.max_width);
            this.exp_HitUID = -1;
            return;
        }
        
        this.dec_approach(candidates);
        this.inc_approach(candidates);
	}; 
    
	behinstProto.dec_approach = function (candidates)
	{
        if (this.test_hit(candidates) === null)
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
            if (this.test_hit(candidates) == null)  // dec until miss
                return;
            else
                dw *= 2;   
        }
	};   

	behinstProto.inc_approach = function (candidates)
	{     
        var w=this.inst.width, dw=1, next_width;        
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
            hit_uid = this.test_hit(candidates);
            //log(w + " :" + dw);            
            if (hit_uid != null)
            {
                if (dw === 1)  // hit
                {
                    // done
                    //log("Hit");
                    this.exp_HitUID = hit_uid;   
                    return;
                }
                else    // overshot
                {
                    //log("Hit - overshot: w is between "+ (w-dw).toString() + " - " + w.toString());
                    w -= dw;
                    dw = 1;
                }
            }
            else
            {
                dw *= 2;                
                while ((w + dw) > this.max_width)  // overshot
                {
                    //log("Inc - overshot");
                    dw /= 2;
                    if (dw === 1)
                        break;
                }
            }
        } 
	};    

	behinstProto.get_box_noraml = function (box_uid, hit_x, hit_y, to_angle)
	{    
		var box_inst = this.runtime.getObjectByUID(box_uid);
		if (box_inst == null)
		    return 0;
		    
		var abs_angle_hit = cr.angleTo(box_inst.x, box_inst.y, hit_x, hit_y) - box_inst.angle;		
		abs_angle_hit = cr.clamp_angle(abs_angle_hit);
		var _a = Math.atan2(box_inst.height , box_inst.width);
		_a = cr.clamp_angle(_a);
		var in_low_bound = (abs_angle_hit > _a) && (abs_angle_hit < (3.141592653589793 - _a));
		var in_up_bound = (abs_angle_hit > (3.141592653589793 + _a)) && (abs_angle_hit < (6.283185307179586 - _a));
		var normal = box_inst.angle;
		if (in_low_bound || in_up_bound)
		    normal += 1.5707963268;
		    
		 if (to_angle)
		     normal = cr.to_clamped_degrees(normal);
		
		return normal;
	};
	
	behinstProto.saveToJSON = function ()
	{    
		var i, len, obs = [];
		for (i = 0, len = this.type.obstacleTypes.length; i < len; i++)
		{
			obs.push(this.type.obstacleTypes[i].sid);
		}
			    
		return { "en": this.enabled,
		         "mw": this.max_width,
		         "hU": this.exp_HitUID,
		         "om": this.obstacleMode,
		         "obs": obs,
		         };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.enabled = o["en"];
	    this.max_width = o["mw"];
	    this.exp_HitUID = o["hU"];
	    this.obstacleMode = o["om"];
	    
		// Reloaded by each instance but oh well
		cr.clearArray(this.type.obstacleTypes);
		var obsarr = o["obs"];
		var i, len, t;
		for (i = 0, len = obsarr.length; i < len; i++)
		{
			t = this.runtime.getObjectTypeBySid(obsarr[i]);
			if (t)
				this.type.obstacleTypes.push(t);
		}	    
	};
		
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Hit UID", "value": this.exp_HitUID},
				{"name": "Max width", "value": this.max_width},
				{"name": "Enabled", "value": this.enabled}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
	};
	/**END-PREVIEWONLY**/        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
	Cnds.prototype.IsHit = function ()
	{
		return (this.exp_HitUID !== -1);
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
	    var normalangle;
	    if (normal == null)
	    {
	        var hitx = this.inst.x + this.inst.width * Math.cos(this.inst.angle);
	        var hity = this.inst.y + this.inst.width * Math.sin(this.inst.angle);
	        normalangle = this.get_box_noraml(this.exp_HitUID, hitx, hity);
	    }
	    else
	    {
	        normalangle = cr.to_radians(normal);
	    }
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