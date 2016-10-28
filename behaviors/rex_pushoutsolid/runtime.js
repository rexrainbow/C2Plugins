// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_pushOutSolid = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_pushOutSolid.prototype;
		
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
	    this.enabled = (this.properties[0] === 1);
	    this.obstacleMode = this.properties[1];		// 0 = solids, 1 = custom
        this.maxDist = 100;
	};  
    
	behinstProto.onDestroy = function()
	{
	};  
    
	behinstProto.tick = function ()
	{
	    if (!this.enabled)
	        return;
    
        this.pushOutNearest( this.getCandidates() , this.maxDist);	    
	};

    var __candidates = [];
	behinstProto.getCandidates = function ()
	{
        __candidates.length = 0; 
        if (this.obstacleMode === 0)  // use solids
        {
            var solid = this.runtime.getSolidBehavior();
            if (solid)
		        cr.appendArray(__candidates, solid.my_instances.valuesRef());
        }
        else
        {
            var types = this.type.obstacleTypes; 
            var i, cnt=types.length;
            for (i=0; i<cnt; i++)
            {
                cr.appendArray(__candidates, types[i].instances);
            }
        }

        return __candidates;
	}; 
    	
	// Find nearest position not overlapping a solid
	behinstProto.pushOutNearest = function (candidates, max_dist)
	{
	    var inst = this.inst;
		var dist = 0;
		var oldx = inst.x
		var oldy = inst.y;

		var dir = 0;
		var dx = 0, dy = 0;
		
		var overlap_inst = this.get_first_overlap_inst(candidates);		
		if (!overlap_inst)
			return true;		// no overlap candidate found
		
		// 8-direction spiral scan
		while (dist <= max_dist)
		{
			switch (dir) {
			case 0:		dx = 0; dy = -1; dist++; break;
			case 1:		dx = 1; dy = -1; break;
			case 2:		dx = 1; dy = 0; break;
			case 3:		dx = 1; dy = 1; break;
			case 4:		dx = 0; dy = 1; break;
			case 5:		dx = -1; dy = 1; break;
			case 6:		dx = -1; dy = 0; break;
			case 7:		dx = -1; dy = -1; break;
			}
			
			dir = (dir + 1) % 8;
			
			inst.x = cr.floor(oldx + (dx * dist));
			inst.y = cr.floor(oldy + (dy * dist));
			inst.set_bbox_changed();
			
            overlap_inst = this.get_first_overlap_inst(candidates, overlap_inst);
	        if (!overlap_inst)
		        return true;
		}
		
		// Didn't get pushed out: restore old position and return false
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};	

    	
	// Find nearest position not overlapping a solid
	behinstProto.pushOut = function (candidates, ux, uy, max_dist)
	{
	    var inst = this.inst;
		var dist = 0;
		var oldx = inst.x
		var oldy = inst.y;
        var testx, testy;

		var overlap_inst = this.get_first_overlap_inst(candidates);		
		if (!overlap_inst)
			return true;		// no overlap candidate found

		while (dist <= max_dist)
		{
            dist++;
            testx = cr.floor(oldx + (ux * dist));
            testy = cr.floor(oldy + (uy * dist));
            if ((inst.x === testx) && (inst.y === testy))
                continue;
            
			inst.x = testx;
			inst.y = testy;
			inst.set_bbox_changed();
			
            overlap_inst = this.get_first_overlap_inst(candidates, overlap_inst);
	        if (!overlap_inst)
		        return true;
		}
		
		// Didn't get pushed out: restore old position and return false
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};	
    
	behinstProto.get_first_overlap_inst = function (candidates, overlap_inst)
	{
        if (overlap_inst && this.runtime.testOverlap(this.inst, overlap_inst))
            return overlap_inst;
        
        var i,cnt=candidates.length;
        for (i=0; i<cnt; i++)
        {
            if (this.runtime.testOverlap(this.inst, candidates[i]))
                return candidates[i];
        }
        return null;
	}; 

	
	behinstProto.saveToJSON = function ()
	{
		var i, len, obs = [];
		for (i = 0, len = this.type.obstacleTypes.length; i < len; i++)
		{
			obs.push(this.type.obstacleTypes[i].sid);
		}
			    
		return { "en": this.enabled,
		         "obs": obs };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
		this.enabled = o["en"];
		
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
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
	  
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
    
	Acts.prototype.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
	};
	
	Acts.prototype.AddObstacle = function (obj_)
	{
	    if (!obj_)
	        return;
	        
	    debugger
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
	
	Acts.prototype.PushOutNearest = function (maxDist)
	{
        this.pushOutNearest( this.getCandidates() , maxDist);	    
	};	
    
	Acts.prototype.PushOutAngle = function (a, maxDist)
	{
		a = cr.to_radians(a);
		var ux = Math.cos(a);
		var uy = Math.sin(a);
		this.pushOut(this.getCandidates() , ux, uy, maxDist);
	};    
    
	Acts.prototype.PushOutToPos = function (x, y)
	{        
        var dx = x - this.inst.x;
        var dy = y - this.inst.y;
        
        var maxDist = Math.sqrt(dx*dx + dy*dy);       
		var a = Math.atan2(dy, dx);
		var ux = Math.cos(a);
		var uy = Math.sin(a);
		this.pushOut(this.getCandidates() , ux, uy, maxDist);
	};      
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());