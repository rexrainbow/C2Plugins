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
	    this.img_data = null;	
		this.area_lx = 0;
		this.area_rx = 0;
		this.area_ty = 0;
		this.area_by = 0;        
	};  
	
	behinstProto.tick = function ()
	{	
	};
	
	behinstProto.cache_area = function (x, y, w, h)
	{
	    if (x == null)
		{
		    x = 0; 
			y = 0; 
			w = this.inst.canvas.width; 
			h = this.inst.canvas.height;
	    }
	    x = Math.floor(x);
        y = Math.floor(y);
        w = Math.floor(w);
        h = Math.floor(h);
        this.img_data = this.inst.ctx.getImageData(x, y, w, h);
		this.area_lx = x;
		this.area_ty = y;
		this.area_rx = x+w-1;
		this.area_by = y+h-1;
	};	

	behinstProto.point_get = function (x,y)
	{	
	    if (this.img_data == null)
		    return -1;
        if ( (x < this.area_lx) || (x > this.area_rx) ||
		     (y < this.area_ty) || (y > this.area_by) )
			return -1;
	    
		x -= this.area_lx;
		y -= this.area_ty;
        return ((y*this.img_data.width) + x) * 4;
	};	
    behinstProto.get_color = function (i)
	{
		var data = this.img_data.data;
		var val = data[i];
		if (val == null)
		{
		    val = 0;
	    }
	    return val;
	};	
	
	behinstProto.get_alpha = function (x, y)
	{
	    var i = this.point_get(x,y);
	    return this.get_color(i+3);
    };
  
    behinstProto.has_pixel_inside_inst = function (test_inst, sample_rate)
    {
        test_inst.update_bbox();
        // bbox
        var bbox=test_inst.bbox;
        var bbx = bbox.left, bby = bbox.top;
        var bbw = (bbox.right - bbox.left), bbh = (bbox.bottom - bbox.top);
        // bbox
        var sample_cnt = bbw * bbh * sample_rate;
        this.cache_area(bbx, bby, bbw, bbh);

        // point
        var randx, randy;  // position at this inst
        var ptx, pty;  // position at canvas
        var px, py;    // position at layer of test inst
        // point
        
        // layer
        var layera = this.inst.layer;
        var layerb = test_inst.layer;
        var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
        // layer
        
        for(var i=0; i<sample_cnt; i++)
        {
            randx = Math.floor((bbw*Math.random())+bbx);
            randy = Math.floor((bbh*Math.random())+bby);
            if (this.get_alpha(randx, randy) === 0)
                continue;
         
            if (!different_layers)
            {
                px = randx;
                py = randy;
            }
            else
            {
                ptx = this.inst.layer.layerToCanvas(randx, randy, true);
                pty = this.inst.layer.layerToCanvas(randx, randy, false);
                px = test_inst.layer.canvasToLayer(ptx, pty, true);
                py = test_inst.layer.canvasToLayer(ptx, pty, false);
            }
            
            if (test_inst.contains_pt(px, py))
                return true;                  
        }
        return false;
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
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	behaviorProto.cnds = new Cnds();


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
                if (binst.has_pixel_inside_inst(rinst, 0.1) || runtime.checkRegisteredCollision(linst, rinst))
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
			if (this.has_pixel_inside_inst(rinst, 0.1))
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
	
	Cnds.prototype.IsOverlapping = function (rtype, offx, offy)
	{
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};
	
	//////////////////////////////////////
	// Actions
	function Acts() {};
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();

}());