// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Rex_Canvas_PixelCollide = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.Rex_Canvas_PixelCollide.prototype;
		
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
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
        this.sample_rate = this.properties[0];
        
	    this.pre_x = this.inst.x;
	    this.pre_y = this.inst.y;
	    this.dt = 0;  
	};  
    
	behinstProto.onDestroy = function()
	{
	};  
    
	behinstProto.tick = function ()
	{
	    this.dt = this.runtime.getDt(this.inst);               
	};  

	behinstProto.tick2 = function ()
	{
	    var inst = this.inst;	    
	    var dx = inst.x - this.pre_x;
	    var dy = inst.y - this.pre_y;
	    this.pre_x = inst.x;
	    this.pre_y = inst.y;
	};
    
    var __canvas_insts = [];
	behinstProto.get_canvas_insts = function ()
	{
        __canvas_insts.length = 0;    
        if (!cr.plugins_.c2canvas)
            return __canvas_insts;
        
        var plugins = this.runtime.types;
        var name, insts;
        for (name in plugins)
        {
            insts = plugins[name].instances;
            if (insts[0] && insts[0].ctx)  // has "canvas" property
                cr.appendArray(__canvas_insts, insts);        
        }
                     
        return __canvas_insts;
	};
        
	behinstProto.get_first_overlap_inst = function (sprite_inst, canvas_insts)
	{
        var i,cnt=canvas_insts.length;
        for (i=0; i<cnt; i++)
        {
            if (PixelTestOverlap.TestOverlap(sprite_inst, canvas_insts[i], this.sample_rate))
                return canvas_insts[i];
        }
        return null;
	};
    
	// Push to try and move out of solid.  Pass -1, 0 or 1 for xdir and ydir to specify a push direction.
	behinstProto.pushOutCanvas = function (sprite_inst, canvas_insts, xdir, ydir, dist)
	{
	    if (canvas_insts == null)
	        canvas_insts = this.get_canvas_insts();
	    
		var push_dist = dist || 50;

		var oldx = sprite_inst.x
		var oldy = sprite_inst.y;

		var i;
        var overlap_canvas_inst;      

		for (i = 0; i < push_dist; i++)
		{
			sprite_inst.x = (oldx + (xdir * i));
			sprite_inst.y = (oldy + (ydir * i));
			sprite_inst.set_bbox_changed();
			
            overlap_canvas_inst = this.get_first_overlap_inst(this.inst, canvas_insts); 
            if (!overlap_canvas_inst)
                return true;
		}

		// Didn't get out a canvas: oops, we're stuck.
		// Restore old position.
		sprite_inst.x = oldx;
		sprite_inst.y = oldy;
		sprite_inst.set_bbox_changed();
		return false;
	};
    
	// Find nearest position not overlapping a solid
	behinstProto.pushOutCanvasNearest = function (sprite_inst, canvas_insts,max_dist_)
	{
	    if (canvas_insts == null)
	        canvas_insts = this.get_canvas_insts();
	        	    
		var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
		var dist = 0;
		var oldx = sprite_inst.x
		var oldy = sprite_inst.y;

		var dir = 0;
		var dx = 0, dy = 0;
		
		var overlap_inst = this.get_first_overlap_inst(sprite_inst, canvas_insts);
		
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
			
			sprite_inst.x = cr.floor(oldx + (dx * dist));
			sprite_inst.y = cr.floor(oldy + (dy * dist));
			sprite_inst.set_bbox_changed();
			
			// Test if we've cleared the last instance we were overlapping
            if (!PixelTestOverlap.TestOverlap(sprite_inst, overlap_inst, this.sample_rate))
			{
				// See if we're still overlapping a different solid
				overlap_inst = this.get_first_overlap_inst(sprite_inst, canvas_insts);
				
				// We're clear of all solids
				if (!overlap_inst)
					return true;
			}
		}
		
		// Didn't get pushed out: restore old position and return false
		sprite_inst.x = oldx;
		sprite_inst.y = oldy;
		sprite_inst.set_bbox_changed();
		return false;
	}; 
    
	behinstProto.calculateCanvasBounceAngle = function(sprite_inst, canvas_insts, startx, starty)
	{
	    if (canvas_insts == null)
	        canvas_insts = this.get_canvas_insts();
	        	    
		var objx = sprite_inst.x;
		var objy = sprite_inst.y;
		var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
		var startangle = cr.angleTo(startx, starty, objx, objy);
		var firstsolid = this.get_first_overlap_inst(sprite_inst, canvas_insts); 
		
		// Not overlapping a canvas: function used wrong, return inverse of object angle (so it bounces back in reverse direction)
		if (!firstsolid)
			return cr.clamp_angle(startangle + cr.PI);
			
		var cursolid = firstsolid;
		
		// Rotate anticlockwise in 5 degree increments until no longer overlapping
		// Don't search more than 175 degrees around (36 * 5 = 180)
		var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
		var increment = cr.to_radians(5);	// 5 degree increments
		
		for (i = 1; i < 36; i++)
		{
			curangle = startangle - i * increment;
			sprite_inst.x = startx + Math.cos(curangle) * radius;
			sprite_inst.y = starty + Math.sin(curangle) * radius;
			sprite_inst.set_bbox_changed();
			
			// No longer overlapping current canvas
            if (!PixelTestOverlap.TestOverlap(sprite_inst, cursolid, this.sample_rate))
			{
				// Search for any other solid
				cursolid = this.get_first_overlap_inst(sprite_inst, canvas_insts);
				
				// Not overlapping any other solid: we've now reached the anticlockwise free angle
				if (!cursolid)
				{
					anticlockwise_free_angle = curangle;
					break;
				}
			}
		}
		
		// Did not manage to free up in anticlockwise direction: use reverse angle
		if (i === 36)
			anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
			
		var cursolid = firstsolid;
			
		// Now search in clockwise direction
		for (i = 1; i < 36; i++)
		{
			curangle = startangle + i * increment;
			sprite_inst.x = startx + Math.cos(curangle) * radius;
			sprite_inst.y = starty + Math.sin(curangle) * radius;
			sprite_inst.set_bbox_changed();
			
			// No longer overlapping current canvas
             if (!PixelTestOverlap.TestOverlap(sprite_inst, cursolid, this.sample_rate))
			{
				// Search for any other solid
				cursolid = this.get_first_overlap_inst(sprite_inst, canvas_insts);
				
				// Not overlapping any other solid: we've now reached the clockwise free angle
				if (!cursolid)
				{
					clockwise_free_angle = curangle;
					break;
				}
			}
		}
		
		// Did not manage to free up in clockwise direction: use reverse angle
		if (i === 36)
			clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
			
		// Put the object back to its original position
		sprite_inst.x = objx;
		sprite_inst.y = objy;
		sprite_inst.set_bbox_changed();
			
		// Both angles match: can only be if object completely contained by solid and both searches went all
		// the way round to backwards.  Just return the back angle.
		if (clockwise_free_angle === anticlockwise_free_angle)
			return clockwise_free_angle;
		
		// We now have the first anticlockwise and first clockwise angles that are free.
		// Calculate the normal.
		var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
		var normal;
		
		// Acute angle
		if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle))
		{
			normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
		}
		// Obtuse angle
		else
		{
			normal = cr.clamp_angle(clockwise_free_angle + half_diff);
		}
		
		assert2(!isNaN(normal), "Bounce normal computed as NaN");
		
		// Reflect startangle about normal (r = v - 2 (v . n) n)
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normal);
		var ny = Math.sin(normal);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
		return cr.angleTo(0, 0, rx, ry);
	};
    
	behinstProto.getAngle = function ()
	{
        var dx=this.inst.x - this.pre_x;
        var dy=this.inst.y - this.pre_y;
		return Math.atan2(dy, dx);
	};  
	
	behinstProto.getSpeed = function ()
	{
        var dx=(this.inst.x - this.pre_x)/this.dt;
        var dy=(this.inst.y - this.pre_y)/this.dt;    
		return Math.sqrt(dx*dx + dy*dy);
	};   
	
	behinstProto.saveToJSON = function ()
	{    
		return { "pre_x": this.pre_x,
		         "pre_y": this.pre_y,
		         "dt": this.dt,
		         };
	};
	
	behinstProto.loadFromJSON = function (o)
	{
	    this.pre_x = this.inst.x;
	    this.pre_y = this.inst.y;
	    this.dt = 0;  
	};		 
	
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Pixel collision",
			"properties": [
				{"name": "Max check count", "value": PixelTestOverlap.max_collision_check},
			]
		});
	};
	/**END-PREVIEWONLY**/	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();
    
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
    
	// For the collision memory in 'On collision'.
	var arrCache = [];
	
	function allocArr()
	{
		if (arrCache.length)
			return arrCache.pop();
		else
			return [0, 0, 0];
	};
	
	function freeArr(a)
	{
		a[0] = 0;
		a[1] = 0;
		a[2] = 0;
		arrCache.push(a);
	};
	
	function makeCollKey(a, b)
	{
		// comma separated string with lowest value first
		if (a < b)
			return "" + a + "," + b;
		else
			return "" + b + "," + a;
	};
	
	function collmemory_add(collmemory, a, b, tickcount)
	{
		var a_uid = a.uid;
		var b_uid = b.uid;

		var key = makeCollKey(a_uid, b_uid);
		
		if (collmemory.hasOwnProperty(key))
		{
			// added already; just update tickcount
			collmemory[key][2] = tickcount;
			return;
		}
		
		var arr = allocArr();
		arr[0] = a_uid;
		arr[1] = b_uid;
		arr[2] = tickcount;
		collmemory[key] = arr;
	};
	
	function collmemory_remove(collmemory, a, b)
	{
		var key = makeCollKey(a.uid, b.uid);
		
		if (collmemory.hasOwnProperty(key))
		{
			freeArr(collmemory[key]);
			delete collmemory[key];
		}
	};
	
	function collmemory_removeInstance(collmemory, inst)
	{
		var uid = inst.uid;
		var p, entry;
		for (p in collmemory)
		{
			if (collmemory.hasOwnProperty(p))
			{
				entry = collmemory[p];
				
				// Referenced in either UID: must be removed
				if (entry[0] === uid || entry[1] === uid)
				{
					freeArr(collmemory[p]);
					delete collmemory[p];
				}
			}
		}
	};
	
	var last_coll_tickcount = -2;
	
	function collmemory_has(collmemory, a, b)
	{
		var key = makeCollKey(a.uid, b.uid);
		
		if (collmemory.hasOwnProperty(key))
		{
			last_coll_tickcount = collmemory[key][2];
			return true;
		}
		else
		{
			last_coll_tickcount = -2;
			return false;
		}
	};
	
	var candidates1 = [];
	
	Cnds.prototype.OnCollision = function (rtype)
	{	
		if (!rtype)
			return false;
			
		var runtime = this.runtime;
			
		// Static condition: perform picking manually.
		// Get the current condition.  This is like the 'is overlapping' condition
		// but with a built in 'trigger once' for the l instances.
		var cnd = runtime.getCurrentCondition();
		var ltype = cnd.type;
		var collmemory = null;
		
		// Create the collision memory, which remembers pairs of collisions that
		// are already overlapping
		if (cnd.extra["collmemory"])
		{
			collmemory = cnd.extra["collmemory"];
		}
		else
		{
			collmemory = {};
			cnd.extra["collmemory"] = collmemory;
		}
		
		// Once per condition, add a destroy callback to remove destroyed instances from collision memory
		// which helps avoid a memory leak. Note the spriteCreatedDestroyCallback property is not saved
		// to savegames, so loading a savegame will still cause a callback to be created, as intended.
		if (!cnd.extra["spriteCreatedDestroyCallback"])
		{
			cnd.extra["spriteCreatedDestroyCallback"] = true;
			
			runtime.addDestroyCallback(function(inst) {
				collmemory_removeInstance(cnd.extra["collmemory"], inst);
			});
		}
		
		// Get the currently active SOLs for both objects involved in the overlap test
		var lsol = ltype.getCurrentSol();
		var rsol = rtype.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances;
		
		// Iterate each combination of instances
		var l, linst, r, rinst;
		var curlsol, currsol;
		
		var tickcount = this.runtime.tickcount;
		var lasttickcount = tickcount - 1;
		var exists, run;
		
		var current_event = runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
        
        var binst;
		
		// Note: don't cache lengths of linstances or rinstances. They can change if objects get destroyed in the event
		// retriggering.
		for (l = 0; l < linstances.length; l++)
		{
			linst = linstances[l];
            binst = GetThisBehavior(linst);
                
			if (rsol.select_all)
			{
				linst.update_bbox();
				this.runtime.getCollisionCandidates(linst.layer, rtype, linst.bbox, candidates1);
				rinstances = candidates1;
			}
			else
				rinstances = rsol.getObjects();
			
			for (r = 0; r < rinstances.length; r++)
			{
				rinst = rinstances[r];
				

				//if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst))    
                if (PixelTestOverlap.TestOverlap(binst.inst, rinst, this.sample_rate) || runtime.checkRegisteredCollision(linst, rinst))             
				{
					exists = collmemory_has(collmemory, linst, rinst);
					run = (!exists || (last_coll_tickcount < lasttickcount));
					
					// objects are still touching so update the tickcount
					collmemory_add(collmemory, linst, rinst, tickcount);
					
					if (run)
					{						
						runtime.pushCopySol(current_event.solModifiers);
						curlsol = ltype.getCurrentSol();
						currsol = rtype.getCurrentSol();
						curlsol.select_all = false;
						currsol.select_all = false;
						
						// If ltype === rtype, it's the same object (e.g. Sprite collides with Sprite)
						// In which case, pick both instances
						if (ltype === rtype)
						{
							curlsol.instances.length = 2;	// just use lsol, is same reference as rsol
							curlsol.instances[0] = linst;
							curlsol.instances[1] = rinst;
							ltype.applySolToContainer();
						}
						else
						{
							// Pick each instance in its respective SOL
							curlsol.instances.length = 1;
							currsol.instances.length = 1;
							curlsol.instances[0] = linst;
							currsol.instances[0] = rinst;
							ltype.applySolToContainer();
							rtype.applySolToContainer();
						}
						
						current_event.retrigger();
						runtime.popSol(current_event.solModifiers);
					}
				}
				else
				{
					// Pair not overlapping: ensure any record removed (mainly to save memory)
					collmemory_remove(collmemory, linst, rinst);
				}
			}
			
			cr.clearArray(candidates1);
		}
		
		// We've aleady run the event by now.
		return false;
	};

	
	var rpicktype = null;
	var rtopick = new cr.ObjectSet();
	
	var candidates2 = [];
	var temp_bbox = new cr.rect(0, 0, 0, 0);

	
	function DoOverlapCondition(rtype, offx, offy)
	{
		if (!rtype)
			return false;
			
        if (offx == null)  offx = 0;
        if (offy == null)  offy = 0;        
		var do_offset = (offx !== 0 || offy !== 0);
		var oldx, oldy, ret = false, r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;
		var bbox, test_pxy;

		if (rsol.select_all)
		{
			this.inst.update_bbox();
			
			// Make sure queried box is offset the same as the collision offset so we look in
			// the right cells
			temp_bbox.copy(this.inst.bbox);
			temp_bbox.offset(offx, offy);
			this.runtime.getCollisionCandidates(this.inst.layer, rtype, temp_bbox, candidates2);
			rinstances = candidates2;
		}
		else if (orblock)
			rinstances = rsol.else_instances;
		else
			rinstances = rsol.instances;
		
		rpicktype = rtype;
		
		if (do_offset)
		{
			oldx = this.inst.x;
			oldy = this.inst.y;
			this.inst.x += offx;
			this.inst.y += offy;
			this.set_bbox_changed();
		}
		
		for (r = 0, lenr = rinstances.length; r < lenr; r++)
		{
			rinst = rinstances[r];

            // if (this.runtime.testOverlap(this, rinst))
            if (PixelTestOverlap.TestOverlap(this.inst, rinst, this.sample_rate))
			{
				ret = true;
				
				// Inverted condition: just bail out now, don't pick right hand instance -
				// also note we still return true since the condition invert flag makes that false
				if (inverted)
					break;
					
				if (ltype !== rtype)
					rtopick.add(rinst);
			}
		}
		
		if (do_offset)
		{
			this.inst.x = oldx;
			this.inst.y = oldy;
			this.set_bbox_changed();
		}
		
		cr.clearArray(candidates2);
		return ret;
	};	
	
	Cnds.prototype.IsOverlapping = function (rtype)
	{
		return DoOverlapCondition.call(this, rtype, 0, 0);
	};
	
	Cnds.prototype.IsOverlappingAtOffset = function (offx, offy, rtype)
	{
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();
	
	Acts.prototype.PushOutCanvas = function (mode, canvas_type)
	{
	    var canvas_insts;
	    if (canvas_type == null)
	        canvas_insts = this.get_canvas_insts();
	    else
	        canvas_insts = canvas_type.getCurrentSol().getObjects();
	        
        var dx=this.inst.x - this.pre_x;
        var dy=this.inst.y - this.pre_y;    
		var a, ux, uy;
		switch (mode) {
		// Opposite angle
		case 0:
			// Make unit motion of vector, invert it and push that way
			a = this.getAngle();
			ux = Math.cos(a);
			uy = Math.sin(a);
			this.pushOutCanvas(this.inst, canvas_insts, -ux, -uy, Math.max(this.getSpeed() * 3, 100));
			break;
		// Nearest
		case 1:
			this.pushOutCanvasNearest(this.inst, canvas_insts);
			break;
		// Up
		case 2:
            var dy=this.inst.y - this.pre_y;    
			this.pushOutCanvas(this.inst, canvas_insts, 0, -1, Math.max(Math.abs(dy) * 3, 100));
			break;
		// Down
		case 3:
            var dy=this.inst.y - this.pre_y;    
			this.pushOutCanvas(this.inst, canvas_insts, 0, 1, Math.max(Math.abs(dy) * 3, 100));
			break;
		// Left
		case 4:
            var dx=this.inst.x - this.pre_x;
			this.pushOutCanvas(this.inst, canvas_insts, -1, 0, Math.max(Math.abs(dx) * 3, 100));
			break;
		// Right
		case 5:
            var dx=this.inst.x - this.pre_x;
			this.pushOutCanvas(this.inst, canvas_insts, 1, 0, Math.max(Math.abs(dx) * 3, 100));
			break;
		}
	};
	
	Acts.prototype.PushOutCanvasAngle = function (a, canvas_type)
	{
	    var canvas_insts;
	    if (canvas_type == null)
	        canvas_insts = this.get_canvas_insts();
	    else
	        canvas_insts = canvas_type.getCurrentSol();
	        	    
		a = cr.to_radians(a);
		var ux = Math.cos(a);
		var uy = Math.sin(a);
		this.pushOutCanvas(this.inst, canvas_insts, ux, uy, Math.max(this.getSpeed() * 3, 100));
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

	Exps.prototype.BounceAngle = function (ret)
	{
	    var canvas_insts = this.get_canvas_insts();
	    var a = this.calculateCanvasBounceAngle(this.inst, canvas_insts, this.pre_x, this.pre_y)
		ret.set_float(cr.to_degrees(a));
	};
	    
    
// ----
    var PixelTestOverlapKlass = function ()
    {
	    this.Reset();
	    
	    /**BEGIN-PREVIEWONLY**/
	    this.max_collision_check = 0;
	    /**END-PREVIEWONLY**/		    
    };
    
    var PixelTestOverlapKlassProto = PixelTestOverlapKlass.prototype;

    PixelTestOverlapKlassProto.Reset = function ()
    {
	    this.img_data = null;        
		this.area_lx = 0;
		this.area_rx = 0;
		this.area_ty = 0;
		this.area_by = 0;
    };	
	PixelTestOverlapKlassProto.cache_area = function (canvas_inst, x, y, w, h)
	{
	    if (x == null)
		{
		    x = 0; 
			y = 0; 
			w = canvas_inst.canvas.width; 
			h = canvas_inst.canvas.height;
	    }

	    x = Math.floor(x);
        y = Math.floor(y);
        w = Math.floor(w);
        h = Math.floor(h);
        this.img_data = canvas_inst.ctx.getImageData(x, y, w, h);
		this.area_lx = x;
		this.area_ty = y;
		this.area_rx = x+w-1;
		this.area_by = y+h-1;
	};	

	PixelTestOverlapKlassProto.point_get = function (x,y)
	{	
	    if (this.img_data == null)
		    return -1;
        
	    x = Math.floor(x);
        y = Math.floor(y);
        if ( (x < this.area_lx) || (x > this.area_rx) ||
		     (y < this.area_ty) || (y > this.area_by) )
			return -1;
	    
		x -= this.area_lx;
		y -= this.area_ty;
        return ((y*this.img_data.width) + x) * 4;
	};	
    PixelTestOverlapKlassProto.get_color = function (i)
	{
		var data = this.img_data.data;
		var val = data[i];
		if (val == null)
		{
		    val = 0;
	    }
	    return val;
	};	
	
	PixelTestOverlapKlassProto.get_alpha = function (x, y)
	{
	    var i = this.point_get(x,y);
	    return this.get_color(i+3);
    };
  
    PixelTestOverlapKlassProto.TestOverlap = function (sprite_inst, canvas_inst, sample_rate)
    {
	    /**BEGIN-PREVIEWONLY**/
	    var collision_check = 0;
	    /**END-PREVIEWONLY**/
	            
        if (!sprite_inst || !canvas_inst)
            return false;
            
        var isOverlap = false;
        
        sprite_inst.update_bbox();
        // bbox
        var bbox=sprite_inst.bbox;
        var bbx=bbox.left, bby=bbox.top;
        var bbw=(bbox.right - bbox.left), bbh=(bbox.bottom - bbox.top);
        // bbox
        var sample_cnt = bbw * bbh * sample_rate;
        this.cache_area(canvas_inst, 
                        bbx - canvas_inst.x, 
                        bby - canvas_inst.y, 
                        bbw, bbh);

        // point
        var randx, randy;  // position at this inst
        var ptx, pty;  // position at canvas
        var px, py;    // position at layer of test inst
        // point
        
        // layer
        var layera = sprite_inst.layer;
        var layerb = canvas_inst.layer;
        var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
        // layer
        
        for(var i=0; i<sample_cnt; i++)
        {
            randx = (bbw*Math.random())+bbx;
            randy = (bbh*Math.random())+bby;
            
            if (this.get_alpha(randx-canvas_inst.x, randy-canvas_inst.y) === 0)
                continue;
         
            if (!different_layers)
            {
                px = randx;
                py = randy;
            }
            else
            {
                ptx = canvas_inst.layer.layerToCanvas(randx, randy, true);
                pty = canvas_inst.layer.layerToCanvas(randx, randy, false);
                px = sprite_inst.layer.canvasToLayer(ptx, pty, true);
                py = sprite_inst.layer.canvasToLayer(ptx, pty, false);
            }

	        /**BEGIN-PREVIEWONLY**/
	        collision_check ++;
	        /**END-PREVIEWONLY**/            
            if (sprite_inst.contains_pt(px, py))
            {
                isOverlap = true;
                break;
            }
        }
        
        this.Reset();
        
	    /**BEGIN-PREVIEWONLY**/
	    if (this.max_collision_check < collision_check)
	        this.max_collision_check = collision_check;
	    /**END-PREVIEWONLY**/   
	                
        return isOverlap;
    };
    var PixelTestOverlap = new PixelTestOverlapKlass();    
}());