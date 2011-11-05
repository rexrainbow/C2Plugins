// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Step = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Step.prototype;
		
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

		this.cancelStep = 0;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
        this.activated = this.properties[0]; 
		this.step_mode = this.properties[1];	// 0=None, 1=Linear, 2=Horizontal then vertical, 3=Vertical then horizontal
		this.pixel_per_step = this.properties[2];
        this.noise_shiftt = this.properties[3];
        
		this.pre_x = this.inst.x;
		this.pre_y = this.inst.y;        
	};
	
	behinstProto.step = function (dx, dy, trigmethod)
	{
        var move_dist = Math.sqrt(dx * dx + dy * dy);
		var steps = Math.round(move_dist / this.pixel_per_step);
        
		if (steps === 0)
			steps = 1;
			
		var i, prog;
        var inst = this.inst;
		var startx = this.pre_x;
		var starty = this.pre_y;  
        
        // unit vector of noise
        if (this.noise_shiftt != 0)
        {
            var norm_noise_x = dy/move_dist;
            var norm_noise_y = dx/move_dist;
        }
        
		for (i = 1; i <= steps; i++)
		{
			prog = i / steps;
			inst.x = startx + (dx * prog);
			inst.y = starty + (dy * prog);
            
            if (this.noise_shiftt != 0)
            {
                var noise = (Math.random()*this.noise_shiftt*2) - this.noise_shiftt;
                inst.x += (noise*norm_noise_x);
                inst.y += (noise*norm_noise_y);
            }
            
			inst.set_bbox_changed();
			
			this.runtime.trigger(trigmethod, inst);
			
			if (this.cancelStep === 1)
			{
				// Go back a step and stop
				i--;
				prog = i / steps;
			    inst.x = startx + (dx * prog);
			    inst.y = starty + (dy * prog);
				inst.set_bbox_changed();
				return;
			}
			else if (this.cancelStep === 2)
			{
				// Stop and do nothing
				return;
			}
		}
	};

	behinstProto.tick = function ()
	{
        if (this.activated == 0)
            return;
        
        var cur_x = this.inst.x;
        var cur_y = this.inst.y;
        var dx = cur_x - this.pre_x;
        var dy = cur_y - this.pre_y;
		// Not moving, nothing to do        
        if ((dx==0) && (dy==0))        
            return;
			          
		this.cancelStep = 0;
			
		if (this.step_mode === 0)	// linear
		{
			this.step(dx, dy, cr.behaviors.Rex_Step.prototype.cnds.OnCMStep);
		}
		else if (this.step_mode === 1)	// horizontal then vertical
		{
			this.step(dx, 0, cr.behaviors.Rex_Step.prototype.cnds.OnCMHorizStep);
			
			if (this.cancelStep === 0)
				this.step(0, dy, cr.behaviors.Rex_Step.prototype.cnds.OnCMHorizStep);
		}
		else if (this.step_mode === 2)	// vertical then horizontal
		{
			this.step(0, dy, cr.behaviors.Rex_Step.prototype.cnds.OnCMHorizStep);
			
			if (this.cancelStep === 0)
				this.step(dx, 0, cr.behaviors.Rex_Step.prototype.cnds.OnCMHorizStep);
		}
		
		this.pre_x = cur_x;
		this.pre_y = cur_y; 
        this.inst.x = cur_x;
        this.inst.y = cur_y;
		this.inst.set_bbox_changed();
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.OnCMStep = function ()
	{
		return true;
	};
	
	cnds.OnCMHorizStep = function ()
	{
		return true;
	};
	
	cnds.OnCMVertStep = function ()
	{
		return true;
	};

	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetActivated = function (s)
	{
        if ( (this.activated==0) && (s==1) )
        {
            this.pre_x = this.inst.x;
            this.pre_y = this.inst.y;
        }
		this.activated = s;
	};
    
	acts.StopStepping = function (mode)
	{
		// set to 1 = go back a step, 2 = stay at current position
		this.cancelStep = mode + 1;
	};
 
	acts.SetPixelPerStep = function (s)
	{
		this.pixel_per_step = s;
	};

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

}());