// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_PlatformMP = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_PlatformMP.prototype;
		
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
		
		// Key states
		this.leftkey = false;
		this.rightkey = false;
		this.jumpkey = false;
		this.jumped = false;		// prevent bunnyhopping
		this.ignoreInput = false;
		
		// Simulated controls
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		
		// Last floor object for moving platform
		this.lastFloorObject = null;
		this.lastFloorX = 0;
		this.lastFloorY = 0;
		
		// Movement
		this.dx = 0;
		this.dy = 0;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.maxspeed = this.properties[0];
		this.acc = this.properties[1];
		this.dec = this.properties[2];
		this.jumpStrength = this.properties[3];
		this.g = this.properties[4];
		this.maxFall = this.properties[5];
		this.defaultControls = (this.properties[6] === 1);	// 0=no, 1=yes
		
		// Only bind keyboard events via jQuery if default controls are in use
		if (this.defaultControls)
		{
			jQuery(document).keydown(
				(function (self) {
					return function(info) {
						self.onKeyDown(info);
					};
				})(this)
			);
			
			jQuery(document).keyup(
				(function (self) {
					return function(info) {
						self.onKeyUp(info);
					};
				})(this)
			);
		}
		
		// Need to know if floor object gets destroyed
		this.runtime.addDestroyCallback((function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this)
									);
                                    
        // control key code
        this.KEY_SHIFT = 16;          
        this.KEY_LEFT = 37;  
        this.KEY_RIGHT = 39; 
        this.KEY_EXTRA = {};
        this.current_extra_ctlName = null;
        this.is_echo = false;        
	};
	
	behinstProto.onInstanceDestroyed = function (inst)
	{
		// Floor object being destroyed
		if (this.lastFloorObject == inst)
			this.lastFloorObject = null;
	};
	
	behinstProto.onDestroy = function ()
	{
		this.lastFloorObject = null;
	};

	behinstProto.onKeyDown = function (info)
	{	
        var keycode = info.which;
		switch (keycode) {
		case this.KEY_SHIFT:	// shift
			info.preventDefault();
			this.jumpkey = true;
			break;
		case this.KEY_LEFT:	// left
			info.preventDefault();
			this.leftkey = true;
			break;
		case this.KEY_RIGHT:	// right
			info.preventDefault();
			this.rightkey = true;
			break;
		}
        
        var extra_ctl = this.KEY_EXTRA[keycode];
        if (extra_ctl && !extra_ctl.state)
        {
            extra_ctl.state = true;
            this.current_extra_ctlName = extra_ctl.name;
            this.is_echo = false;
            this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnExtraCtlPressed, this.inst);
            if (this.is_echo)
                info.preventDefault();
            this.current_extra_ctlName = null;
        }        
	};

	behinstProto.onKeyUp = function (info)
	{
        var keycode = info.which;
		switch (keycode) {
		case this.KEY_SHIFT:	// shift
			info.preventDefault();
			this.jumpkey = false;
			this.jumped = false;
			break;
		case this.KEY_LEFT:	// left
			info.preventDefault();
			this.leftkey = false;
			break;
		case this.KEY_RIGHT:	// right
			info.preventDefault();
			this.rightkey = false;
			break;
		}
        
        var extra_ctl = this.KEY_EXTRA[keycode];
        if (extra_ctl)
        {            
            extra_ctl.state = false;
            this.current_extra_ctlName = extra_ctl.name;
            this.is_echo = false;
            this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnExtraCtlReleased, this.inst);
            if (this.is_echo)
                info.preventDefault();
        }           
	};
	
	behinstProto.getGDir = function ()
	{
		if (this.g < 0)
			return -1;
		else
			return 1;
	};

	behinstProto.isOnFloor = function ()
	{
		var ret;
		
		// Move object one pixel down
		var oldy = this.inst.y;
		this.inst.y += this.getGDir();
		this.inst.set_bbox_changed();
		
		// See if still overlapping last floor object (if any)
		if (this.lastFloorObject && this.runtime.testOverlap(this.inst, this.lastFloorObject))
		{
			// Put the object back
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return this.lastFloorObject;
		}
		else
		{
			ret = this.runtime.testOverlapSolid(this.inst);
			
			// Put the object back
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			
			// If the object is still overlapping this floor one pixel up, it
			// must be stuck inside something.  So don't count it as floor.
			if (ret && this.runtime.testOverlap(this.inst, ret))
				return null;
				
			return ret;
		}
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		var mx, my, obstacle;
		
		// With default controls off, the "jumped" flag needs resetting whenever the jump key is "up" (not simulated)
		if (!this.defaultControls && !this.simjump)
			this.jumped = false;
			
		var left = this.leftkey || this.simleft;
		var right = this.rightkey || this.simright;
		var jump = (this.jumpkey || this.simjump) && !this.jumped;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		
		// Work around 1px float
		this.inst.y -= this.getGDir();
		this.inst.set_bbox_changed();
		
		// Ignoring input: ignore all keys
		if (this.ignoreInput)
		{
			left = false;
			right = false;
			jump = false;
		}
		
		// If on floor and jumped, launch upwards
		var floor_ = this.isOnFloor();
		var lastFloor = this.lastFloorObject;
		
		// Push out nearest here to prevent moving objects crushing/trapping the player
		var collobj = this.runtime.testOverlapSolid(this.inst);
		if (collobj)
		{
			if (this.runtime.pushOutSolidNearest(this.inst, Math.max(this.inst.width, this.inst.height) / 2))
				this.runtime.registerCollision(this.inst, collobj);
			// If can't push out, must be stuck, give up
			else
			{
				this.inst.y += this.getGDir();
				this.inst.set_bbox_changed();
				return;
			}
		}
		
		if (floor_)
		{
			if (this.dy > 0)
				this.dy = 0;

			// First landing on the floor or floor changed
			if (lastFloor != floor_)
			{
				this.lastFloorObject = floor_;
				this.lastFloorX = floor_.x;
				this.lastFloorY = floor_.y;
				this.runtime.registerCollision(this.inst, floor_);
			}
			// Else still on the same floor as last tick, and the floor has moved: move with it
			else if (floor_.x !== this.lastFloorX || floor_.y !== this.lastFloorY)
			{
				mx = (floor_.x - this.lastFloorX);
				my = (floor_.y - this.lastFloorY);
				this.inst.x += mx;
				this.inst.y += my;
				this.inst.set_bbox_changed();
				
				this.lastFloorX = floor_.x;
				this.lastFloorY = floor_.y;
				
				// Moved in to a solid
				collobj = this.runtime.testOverlapSolid(this.inst);
				if (collobj)
				{
					this.runtime.registerCollision(this.inst, collobj);
					
					// Push out horizontally then up
					if (mx !== 0)
						this.runtime.pushOutSolid(this.inst, mx > 0 ? -1 : 1, 0);

					this.runtime.pushOutSolid(this.inst, 0, -this.getGDir());
				}
			}
			
			if (jump)
			{
				this.dy = -this.getGDir() * this.jumpStrength;
				
				// Prevent bunnyhopping: dont allow another jump until key up
				this.jumped = true;
			}
		}
		// Not on floor: apply gravity
		else
		{
			this.lastFloorObject = null;
			
			this.dy += this.g * dt;
			
			// Cap to max fall speed
			if (this.getGDir() === 1)
			{
				if (this.dy > this.maxFall)
					this.dy = this.maxFall;
			}
			else
			{
				if (this.dy < -this.maxFall)
					this.dy = -this.maxFall;
			}
		}
		
		// Apply horizontal deceleration when no arrow key pressed
		if (left == right)	// both up or both down
		{
			if (this.dx < 0)
			{
				this.dx += this.dec * dt;
				
				if (this.dx > 0)
					this.dx = 0;
			}
			else if (this.dx > 0)
			{
				this.dx -= this.dec * dt;
				
				if (this.dx < 0)
					this.dx = 0;
			}
		}
		
		// Apply acceleration
		if (left && !right)
		{
			// Moving in opposite direction to current motion: add deceleration
			if (this.dx > 0)
				this.dx -= (this.acc + this.dec) * dt;
			else
				this.dx -= this.acc * dt;
		}
		
		if (right && !left)
		{
			if (this.dx < 0)
				this.dx += (this.acc + this.dec) * dt;
			else
				this.dx += this.acc * dt;
		}
		
		// Cap to max speed
		if (this.dx > this.maxspeed)
			this.dx = this.maxspeed;
		else if (this.dx < -this.maxspeed)
			this.dx = -this.maxspeed;
		
		if (this.dx !== 0)
		{		
			// Attempt X movement
			var oldx = this.inst.x;
			var oldy = this.inst.y;
			mx = this.dx * dt;
			
			// Check that 1 px across and 1 px up is free.  Otherwise the slope is too steep to
			// try climbing.
			this.inst.x += (mx > 1 ? 1 : -1);
			this.inst.y += -this.getGDir();
			this.inst.set_bbox_changed();
			
			var slope_too_steep = this.runtime.testOverlapSolid(this.inst);

			// Move back and move the real amount
			this.inst.x = oldx + mx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			
			// Test for overlap to side.
			obstacle = this.runtime.testOverlapSolid(this.inst);
			
			if (obstacle)
			{
				// First try pushing out up the same distance that was moved horizontally.
				// If this works it's an acceptable slope.
				var push_dist = Math.abs(mx) + 1;
				
				if (slope_too_steep || !this.runtime.pushOutSolid(this.inst, 0, -this.getGDir(), push_dist))
				{
					// Failed to push up out of slope.  Must be a wall - push back horizontally.
					// Push either 2.5x the horizontal distance moved this tick, or at least 30px.
					this.runtime.registerCollision(this.inst, obstacle);
					push_dist = Math.max(Math.abs(this.dx * dt * 2.5), 30);
					
					// Push out of solid: push left if moving right, or push right if moving left
					if (!this.runtime.pushOutSolid(this.inst, this.dx < 0 ? 1 : -1, 0, push_dist))
					{
						// Failed to push out of solid.  Restore old position.
						this.inst.x = oldx;
						this.inst.set_bbox_changed();
					}
					else if (Math.abs(this.inst.x - oldx) < 1)
					{
						// Sub-pixel "floating" occurs when hugging walls due to the whole pixel accuracy of pushOutSolid.
						// If pushOutSolid succeeded but left it within 1px of its original position, just fall back to
						// its old position.
						this.inst.x = oldx;
						this.inst.set_bbox_changed();
					}
					
					this.dx = 0;	// stop
				}
			}
			// Was on floor but now isn't
			else if (floor_ && !this.isOnFloor())
			{
				// Moved horizontally but not overlapping anything.  Push down
				// to keep feet on downwards slopes (to an extent).
				oldy = this.inst.y;
				this.inst.y += Math.ceil(mx) + 1;
				this.inst.set_bbox_changed();
				
				if (this.runtime.testOverlapSolid(this.inst))
					this.runtime.pushOutSolid(this.inst, 0, -this.getGDir(), Math.ceil(mx) + 2);
				else
				{
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
				}
			}
		}
		
		if (this.dy !== 0)
		{
			// Attempt Y movement
			var oldy = this.inst.y;
			this.inst.y += this.dy * dt;
			this.inst.set_bbox_changed();
			
			collobj = this.runtime.testOverlapSolid(this.inst);
			if (collobj)
			{
				this.runtime.registerCollision(this.inst, collobj);
				
				// Push either 2.5x the vertical distance moved this tick, or at least 30px.
				var push_dist = Math.max(Math.abs(this.dy * dt * 2.5), 30);
				
				// Push out of solid: push down if moving up, or push up if moving down
				if (!this.runtime.pushOutSolid(this.inst, 0, this.dy < 0 ? 1 : -1, push_dist))
				{
					// Failed to push out of solid.  Restore old position.
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
				}
				
				this.dy = 0;	// stop
			}
		}
		
		this.inst.y += this.getGDir();
		this.inst.set_bbox_changed();
	};

	//////////////////////////////////////
	// Conditions
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;

	cnds.IsMoving = function ()
	{
		return this.dx !== 0 || this.dy !== 0;
	};
	
	cnds.CompareSpeed = function (cmp, s)
	{
		var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
		
		return cr.do_cmp(speed, cmp, s);
	};
	
	cnds.IsOnFloor = function ()
	{
		// Must be overlapping solid in current position
		if (!this.runtime.testOverlapSolid(this.inst))
			return false;
			
		// Move 1px up and make sure not overlapping anything
		var ret = false;			
		var oldy = this.inst.y;
		this.inst.y -= this.getGDir();
		this.inst.set_bbox_changed();
		
		ret = !this.runtime.testOverlapSolid(this.inst)
		
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		
		return ret;
	};
	
	cnds.IsJumping = function ()
	{
		if (this.getGDir() === 1)
			return this.dy < 0;
		else
			return this.dy > 0;
	};
	
	cnds.IsFalling = function ()
	{
		if (this.getGDir() === 1)
			return this.dy > 0;
		else
			return this.dy < 0;
	};
    
	cnds.OnExtraCtlPressed = function (name)
	{
        var is_my_call = (this.current_extra_ctlName == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	}; 
    
	cnds.OnExtraCtlReleased = function (name)
	{
        var is_my_call = (this.current_extra_ctlName == name);
        this.is_echo |= is_my_call;
		return is_my_call;
	};
    
	cnds.IsExtraCtlDown = function (name)
	{
        var ret = false;
        var keycode, key_info;
        var key_extra_dict = this.KEY_EXTRA;
        for (keycode in key_extra_dict)
        {
            key_info = key_extra_dict[keycode];
            if ((key_info.name == name) && key_info.state)
            {
               ret = true;
               break;
            }
        }
		return ret;
	};
    
	//////////////////////////////////////
	// Actions
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;

	acts.SetIgnoreInput = function (ignoring)
	{
		this.ignoreInput = ignoring;
	};
	
	acts.SetMaxSpeed = function (maxspeed)
	{
		this.maxspeed = maxspeed;
		
		if (this.maxspeed < 0)
			this.maxspeed = 0;
	};
	
	acts.SetAcceleration = function (acc)
	{
		this.acc = acc;
		
		if (this.acc < 0)
			this.acc = 0;
	};
	
	acts.SetDeceleration = function (acc)
	{
		this.acc = acc;
		
		if (this.acc < 0)
			this.acc = 0;
	};
	
	acts.SetJumpStrength = function (js)
	{
		this.jumpStrength = js;
		
		if (this.jumpStrength < 0)
			this.jumpStrength = 0;
	};
	
	acts.SetGravity = function (grav)
	{
		var oldGDir = this.getGDir();
		
		this.g = grav;
		
		// If gravity direction has changed allow to fall off current floor
		if (this.getGDir() !== oldGDir)
			this.lastFloorObject = null;
	};
	
	acts.SetMaxFallSpeed = function (mfs)
	{
		this.maxFall = mfs;
		
		if (this.maxFall < 0)
			this.maxFall = 0;
	};
	
	acts.SimulateControl = function (ctrl)
	{
		// 0=left, 1=right, 2=jump
		switch (ctrl) {
		case 0:		this.simleft = true;	break;
		case 1:		this.simright = true;	break;
		case 2:		this.simjump = true;	break;
		}
	};
	
	acts.SetVectorX = function (vx)
	{
		this.dx = vx;
	};
	
	acts.SetVectorY = function (vy)
	{
		this.dy = vy;
	};
    	
	acts.CfgCtl = function (ctrl, keycode)
	{
		// 0=left, 1=right, 2=jump
		switch (ctrl) {
		case 0:
            this.KEY_LEFT = keycode;
        break;
		case 1:
            this.KEY_RIGHT = keycode;    
        break;
		case 2:
            this.KEY_SHIFT = keycode;
        break;
		}      
	};

	acts.CfgExtraCtl = function (ctl_name, keycode)
	{
		this.KEY_EXTRA[keycode] = {name:ctl_name, state:false};        
	};     

	//////////////////////////////////////
	// Expressions
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;

	exps.Speed = function (ret)
	{
		ret.set_float(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
	};
	
	exps.MaxSpeed = function (ret)
	{
		ret.set_float(this.maxspeed);
	};
	
	exps.Acceleration = function (ret)
	{
		ret.set_float(this.acc);
	};
	
	exps.Deceleration = function (ret)
	{
		ret.set_float(this.dec);
	};
	
	exps.JumpStrength = function (ret)
	{
		ret.set_float(this.jumpStrength);
	};
	
	exps.Gravity = function (ret)
	{
		ret.set_float(this.g);
	};
	
	exps.MaxFallSpeed = function (ret)
	{
		ret.set_float(this.maxFall);
	};
	
	exps.MovingAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(Math.atan2(this.dy, this.dx)));
	};
	
	exps.VectorX = function (ret)
	{
		ret.set_float(this.dx);
	};
	
	exps.VectorY = function (ret)
	{
		ret.set_float(this.dy);
	};
	
	exps.LEFT = function (ret)
	{
		ret.set_int(this.KEY_LEFT);
	};
	
	exps.RIGHT = function (ret)
	{
		ret.set_int(this.KEY_RIGHT);
	};   
	
	exps.JUMP = function (ret)
	{
		ret.set_int(this.KEY_SHIFT);
	};
	
	exps.EXTRA = function (ret, name)
	{
        var val = 0;
        var keycode, key_info;
        var key_extra_dict = this.KEY_EXTRA;
        for (keycode in key_extra_dict)
        {
            key_info = key_extra_dict[keycode];
            if (key_info.name == name)
            {
               val = keycode;
               break;
            }
        }
		ret.set_int(parseInt(val));
	};
       
}());