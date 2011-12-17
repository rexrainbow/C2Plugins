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
	
	// animation modes
	var ANIMMODE_STOPPED = 0;
	var ANIMMODE_MOVING = 1;
	var ANIMMODE_JUMPING = 2;
	var ANIMMODE_FALLING = 3;
	
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
		
		this.animMode = ANIMMODE_STOPPED;
		
		this.enabled = true;
		
		// Movement
		this.dx = 0;
		this.dy = 0;
	};

	var behinstProto = behaviorProto.Instance.prototype;
	
	function roundTo6dp(x)
	{
		return Math.round(x * 1000000) / 1000000;
	};
	
	behinstProto.updateGravity = function()
	{
		// down vector
		this.downx = Math.cos(this.ga);
		this.downy = Math.sin(this.ga);
		
		// right vector
		this.rightx = Math.cos(this.ga - Math.PI / 2);
		this.righty = Math.sin(this.ga - Math.PI / 2);
		
		// get rid of any sin/cos small errors
		this.downx = roundTo6dp(this.downx);
		this.downy = roundTo6dp(this.downy);
		this.rightx = roundTo6dp(this.rightx);
		this.righty = roundTo6dp(this.righty);
		
		// gravity is negative (up): flip the down vector and make gravity positive
		// (i.e. change the angle of gravity instead)
		if (this.g < 0)
		{
			this.downx *= -1;
			this.downy *= -1;
			this.g = Math.abs(this.g);
		}
	};

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

		// Angle of gravity
		this.ga = cr.to_radians(90);
		this.updateGravity();
		
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
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		
		// See if still overlapping last floor object (if any)
		if (this.lastFloorObject && this.runtime.testOverlap(this.inst, this.lastFloorObject))
		{
			// Put the object back
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.inst.set_bbox_changed();
			return this.lastFloorObject;
		}
		else
		{
			ret = this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst);
			
			// Put the object back
			this.inst.x = oldx;
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
		var mx, my, obstacle, mag;
		
		// The "jumped" flag needs resetting whenever the jump key is not simulated for custom controls
		// This musn't conflict with default controls so make sure neither the jump key nor simulate jump is on
		if (!this.jumpkey && !this.simjump)
			this.jumped = false;
			
		var left = this.leftkey || this.simleft;
		var right = this.rightkey || this.simright;
		var jump = (this.jumpkey || this.simjump) && !this.jumped;
		this.simleft = false;
		this.simright = false;
		this.simjump = false;
		
		if (!this.enabled)
			return;
		
		// Work around 1px float
		this.inst.x -= this.downx;
		this.inst.y -= this.downy;
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
				this.inst.x += this.downx;
				this.inst.y += this.downy;
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
					{
						if (mx > 0)
							this.runtime.pushOutSolid(this.inst, -this.rightx, -this.righty);
						else
							this.runtime.pushOutSolid(this.inst, this.rightx, this.righty);
					}

					this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy);
				}
			}
			
			if (jump)
			{
				// Trigger On Jump
				this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnJump, this.inst);
				this.animMode = ANIMMODE_JUMPING;
				
				this.dy = -this.jumpStrength;
				
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
			if (this.dy > this.maxFall)
				this.dy = this.maxFall;
				
			// Still set the jumped flag to prevent double tap bunnyhop
			if (jump)
				this.jumped = true;
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
			mx = this.dx * dt * this.rightx;
			my = this.dx * dt * this.righty;
			
			// Check that 1 px across and 1 px up is free.  Otherwise the slope is too steep to
			// try climbing.
			this.inst.x += this.rightx * (this.dx > 1 ? 1 : -1) - this.downx;
			this.inst.y += this.righty * (this.dx > 1 ? 1 : -1) - this.downy;
			this.inst.set_bbox_changed();
			
			var is_jumpthru = false;
			
			var slope_too_steep = this.runtime.testOverlapSolid(this.inst);
			
			/*
			if (!slope_too_steep && floor_)
			{
				slope_too_steep = this.runtime.testOverlapJumpThru(this.inst);
				is_jumpthru = true;
				
				// Check not also overlapping jumpthru from original position, in which
				// case ignore it as a bit of background.
				if (slope_too_steep)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					
					if (this.runtime.testOverlap(this.inst, slope_too_steep))
					{
						slope_too_steep = null;
						is_jumpthru = false;
					}
				}
			}
			*/

			// Move back and move the real amount
			this.inst.x = oldx + mx;
			this.inst.y = oldy + my;
			this.inst.set_bbox_changed();
			
			// Test for overlap to side.
			obstacle = this.runtime.testOverlapSolid(this.inst);

			if (!obstacle && floor_)
			{
				obstacle = this.runtime.testOverlapJumpThru(this.inst);
				
				// Check not also overlapping jumpthru from original position, in which
				// case ignore it as a bit of background.
				if (obstacle)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					
					if (this.runtime.testOverlap(this.inst, obstacle))
					{
						obstacle = null;
						is_jumpthru = false;
					}
					else
						is_jumpthru = true;
						
					this.inst.x = oldx + mx;
					this.inst.y = oldy + my;
					this.inst.set_bbox_changed();
				}
			}
			
			if (obstacle)
			{
				// First try pushing out up the same distance that was moved horizontally.
				// If this works it's an acceptable slope.
				var push_dist = Math.abs(this.dx * dt) + 2;
				
				if (slope_too_steep || !this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, push_dist, is_jumpthru))
				{
					// Failed to push up out of slope.  Must be a wall - push back horizontally.
					// Push either 2.5x the horizontal distance moved this tick, or at least 30px.
					this.runtime.registerCollision(this.inst, obstacle);
					push_dist = Math.max(Math.abs(this.dx * dt * 2.5), 30);
					
					// Push out of solid: push left if moving right, or push right if moving left
					if (!this.runtime.pushOutSolid(this.inst, this.rightx * (this.dx < 0 ? 1 : -1), this.righty * (this.dx < 0 ? 1 : -1), push_dist, false))
					{
						// Failed to push out of solid.  Restore old position.
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
					}
					else if (Math.abs(this.inst.x - oldx) < 1)
					{
						// Sub-pixel "floating" occurs when hugging walls due to the whole pixel accuracy of pushOutSolid.
						// If pushOutSolid succeeded but left it within 1px of its original position, just fall back to
						// its old position.
						this.inst.x = oldx;
						this.inst.y = oldy;
						this.inst.set_bbox_changed();
					}
					
					if (!is_jumpthru)
						this.dx = 0;	// stop
				}
			}
			// Was on floor but now isn't
			else if (floor_ && !this.isOnFloor())
			{
				// Moved horizontally but not overlapping anything.  Push down
				// to keep feet on downwards slopes (to an extent).
				mag = Math.ceil(Math.abs(this.dx * dt)) + 2;
				oldx = this.inst.x;
				oldy = this.inst.y;
				this.inst.x += this.downx * mag;
				this.inst.y += this.downy * mag;
				this.inst.set_bbox_changed();
				
				if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst))
					this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, mag + 2, true);
				else
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
				}
			}
		}
		
		if (this.dy !== 0)
		{
			// Attempt Y movement
			var oldx = this.inst.x;
			var oldy = this.inst.y;
			this.inst.x += this.dy * dt * this.downx;
			this.inst.y += this.dy * dt * this.downy;
			var newx = this.inst.x;
			var newy = this.inst.y;
			this.inst.set_bbox_changed();
			
			collobj = this.runtime.testOverlapSolid(this.inst);
			
			var fell_on_jumpthru = false;
			
			if (!collobj && (this.dy > 0) && !floor_)
			{
				collobj = this.runtime.testOverlapJumpThru(this.inst);
				
				// Must not have been overlapping in old position to be able to fall on to it
				if (collobj)
				{
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
					
					if (this.runtime.testOverlap(this.inst, collobj))
						collobj = null;
						
					this.inst.x = newx;
					this.inst.y = newy;
					this.inst.set_bbox_changed();
				}
				
				fell_on_jumpthru = !!collobj;
			}
			
			if (collobj)
			{
				this.runtime.registerCollision(this.inst, collobj);
				
				// Push either 2.5x the vertical distance moved this tick, or at least 30px.
				// If fell on a jumpthru don't push any further up than we fell
				var push_dist = fell_on_jumpthru ? (this.dy * dt + 1) : Math.max(Math.abs(this.dy * dt * 2.5), 30);
				
				// Push out of solid: push down if moving up, or push up if moving down
				if (!this.runtime.pushOutSolid(this.inst, this.downx * (this.dy < 0 ? 1 : -1), this.downy * (this.dy < 0 ? 1 : -1), push_dist, fell_on_jumpthru))
				{
					// Failed to push out of solid.  Restore old position.
					this.inst.x = oldx;
					this.inst.y = oldy;
					this.inst.set_bbox_changed();
				}
				
				this.dy = 0;	// stop
			}
		}
		
		this.inst.x += this.downx;
		this.inst.y += this.downy;
		this.inst.set_bbox_changed();
		
		// Run animation triggers
		
		// Has started falling?
		if (this.animMode !== ANIMMODE_FALLING && this.dy > 0 && !floor_)
		{
			this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnFall, this.inst);
			this.animMode = ANIMMODE_FALLING;
		}
		
		// Is on floor?
		if (floor_)
		{
			// Was falling? (i.e. has just landed)
			if (this.animMode === ANIMMODE_FALLING)
			{
				this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnLand, this.inst);
				
				if (this.dx === 0 && this.dy === 0)
					this.animMode = ANIMMODE_STOPPED;
				else
					this.animMode = ANIMMODE_MOVING;
			}
			// Has not just landed: handle normal moving/stopped triggers
			else
			{
				if (this.animMode !== ANIMMODE_STOPPED && this.dx === 0 && this.dy === 0)
				{
					this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnStop, this.inst);
					this.animMode = ANIMMODE_STOPPED;
				}
				
				// Has started moving and is on floor?
				if (this.animMode !== ANIMMODE_MOVING && (this.dx !== 0 || this.dy !== 0) && !jump)
				{
					this.runtime.trigger(cr.behaviors.Rex_PlatformMP.prototype.cnds.OnMove, this.inst);
					this.animMode = ANIMMODE_MOVING;
				}
			}
		}
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
		if (this.dy !== 0)
			return false;
			
		// Must be overlapping solid/jumpthru in current position
		var overlapSolid = this.runtime.testOverlapSolid(this.inst);
		var overlapJumpThru = this.runtime.testOverlapJumpThru(this.inst);
		
		if (!overlapSolid && !overlapJumpThru)
			return false;
			
		// Move 1px up and make sure not overlapping anything
		var ret = false;
		var oldx = this.inst.x;
		var oldy = this.inst.y;
		this.inst.x -= this.downx;
		this.inst.y -= this.downy;
		this.inst.set_bbox_changed();
		
		// On a solid floor: only test not overlapping solid above, so jumpthrus are ignored
		if (overlapSolid)
			ret = !this.runtime.testOverlapSolid(this.inst);
			
		// On a jumpthru floor: test not overlapping solid above, and that it has cleared the specific jumpthru it was standing on
		if (overlapJumpThru && !overlapSolid)
			ret = !this.runtime.testOverlapSolid(this.inst) && !this.runtime.testOverlap(this.inst, overlapJumpThru);
		
		this.inst.x = oldx;
		this.inst.y = oldy;
		this.inst.set_bbox_changed();
		
		return ret;
	};
	
	cnds.IsJumping = function ()
	{
		return this.dy < 0;
	};
	
	cnds.IsFalling = function ()
	{
		return this.dy > 0;
	};
	
	cnds.OnJump = function ()
	{
		return true;
	};
	
	cnds.OnFall = function ()
	{
		return true;
	};
	
	cnds.OnStop = function ()
	{
		return true;
	};
	
	cnds.OnMove = function ()
	{
		return true;
	};
	
	cnds.OnLand = function ()
	{
		return true;
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
	
	acts.SetDeceleration = function (dec)
	{
		this.dec = dec;
		
		if (this.dec < 0)
			this.dec = 0;
	};
	
	acts.SetJumpStrength = function (js)
	{
		this.jumpStrength = js;
		
		if (this.jumpStrength < 0)
			this.jumpStrength = 0;
	};
	
	acts.SetGravity = function (grav)
	{
		if (grav === this.g)
			return;		// no change
		
		this.g = grav;
		this.updateGravity();
		
		// Allow to fall off current floor in case direction of gravity changed
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
	
	acts.SetGravityAngle = function (a)
	{
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		
		if (this.ga === a)
			return;		// no change
			
		this.ga = a;
		this.updateGravity();
		
		// Allow to fall off current floor in case direction of gravity changed
		this.lastFloorObject = null;
	};
	
	acts.SetEnabled = function (en)
	{
		this.enabled = (en === 1);
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
        // remove the existed keycode of ctl_name    
        var key;
        var key_hash = this.KEY_EXTRA;
        var find_key = null;
        for (key in key_hash)
        {
            if (key_hash[key].name == ctl_name)
            {
                find_key = key;
                break;
            }
        }
        if (find_key != null)
            this.KEY_EXTRA[find_key] = null;  
            
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