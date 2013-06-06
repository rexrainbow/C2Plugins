// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Layouter = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Layouter.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	    this.check_name = "LAYOUTER";
        this._uids = {};
        this.sprites = [];    // uid
        this.pin_status = {};
        this.pin_mode = this.properties[0];
        if (this.pin_mode != 0)
            this.runtime.tick2Me(this);
            
        this._opactiy_save = this.opacity;
	    this._visible_save = this.visible;            
        
        // handlers for behaviors
        this.handlers = [];
        this.layout_inst_params = null;
        this.has_event_call = false;
        this._get_layouter_handler();
        
	};
    
	instanceProto.onDestroy = function ()
	{		
        this._destory_all_insts();
	};
    
	instanceProto.tick2 = function ()
	{
	    var i, cnt=this.sprites.length, inst;
	    if (cnt == 0)
	        return;	        
	    if (this._opactiy_save != this.opacity)
	    {
	        this.opacity = cr.clamp(this.opacity, 0, 1);
	        for (i=0; i<cnt; i++)
	        {
	            inst = this._uid2inst(this.sprites[i]); 
	            inst.opacity = this.opacity;
	        }
	        this.runtime.redraw = true;
	        this._opactiy_save = this.opacity; 
	    }
	    
	    if (this._visible_save != this.visible)
	    {
	        for (i=0; i<cnt; i++)
	        {
	            inst = this._uid2inst(this.sprites[i]); 
	            inst.visible = visible;
	        }
	        this.runtime.redraw = true;
	        this._visible_save = this.visible;	  
	    }
	    
	    // pin	    
	    if (this.pin_mode == 0)
	        return;
	        				
	    var uid, status, pin_inst, a, new_x, new_y, new_angle;
	    for (uid in this.pin_status)
	    {
            pin_inst = this._uid2inst(uid);
            if (pin_inst == null)
                continue;
            status = this.pin_status[uid];          
            if ((this.pin_mode == 1) || (this.pin_mode == 2))
			{
			    a = this.angle + status["da"];
                new_x = this.x + (status["dd"]*Math.cos(a));
                new_y = this.y + (status["dd"]*Math.sin(a));
			}
            if ((this.pin_mode == 1) || (this.pin_mode == 3))
			{
			    new_angle = status["rda"] + this.angle;
			}
            if (((new_x != null) && (new_y != null)) && 
			    ((new_x != pin_inst.x) || (new_y != pin_inst.y)))
            {                
			    pin_inst.x = new_x;
			    pin_inst.y = new_y;
			    pin_inst.set_bbox_changed();			    
            }
			if ((new_angle != null) && (new_angle != pin_inst.angle))
			{
			    pin_inst.angle = new_angle;
			    pin_inst.set_bbox_changed();
			}
	    }    
	     
	};    
	
	instanceProto.draw = function(ctx)
	{
	};
	
	instanceProto.drawGL = function(glw)
	{
	};
    
	instanceProto.add_insts = function (insts)
	{
        var inst, i, cnt=insts.length;
		var is_world = insts[0].type.plugin.is_world;
				
		// update uids, sprites
        for (i=0; i<cnt; i++)
        {
            inst = insts[i];
            if (this._uids[inst.uid])  // is inside container
                continue;            
            inst.extra.rex_container_uid = this.uid;
            this._uids[inst.uid] = true;
            if (is_world)
                this.sprites.push(inst.uid);            
        }
        
        // layout instances
        this._do_layout(insts, true);
        
        // pin instances
        if (is_world && (this.pin_mode != 0))
        {
            for (i=0; i<cnt; i++)
                this.pin_inst(insts[i]);
        }
	};

	instanceProto.pin_inst = function (inst)
	{
        if (this.pin_status[inst.uid] != null)
        {
            this.pin_status[inst.uid]["da"] = cr.angleTo(this.x, this.y, inst.x, inst.y) - this.angle;
            this.pin_status[inst.uid]["dd"] = cr.distanceTo(this.x, this.y, inst.x, inst.y);
            this.pin_status[inst.uid]["rda"] = inst.angle - this.angle;
        }
        else
        {
            this.pin_status[inst.uid] = {"da":cr.angleTo(this.x, this.y, inst.x, inst.y) - this.angle,
                                         "dd":cr.distanceTo(this.x, this.y, inst.x, inst.y),
                                         "rda": inst.angle - this.angle,	
                                        };
        }
	};	
    
	instanceProto.create_insts = function (obj_type,x,y,_layer)
	{
        if (obj_type == null)
            return;
        var layer = (typeof _layer == "number")?
                    this.runtime.getLayerByNumber(_layer):
                    this.runtime.getLayerByName(_layer);  
        var inst = this.runtime.createInstance(obj_type, layer, x, y ); 
        // Pick just this instance
        var sol = inst.type.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;  

		// Siblings aren't in instance lists yet, pick them manually
		var i, len, s;
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}
        
	    this.add_insts([inst]);
	    return inst;
	};    

    instanceProto._remove_uid = function (uid)
	{
        if (uid in this._uids)
            delete this._uids[uid];
        else
            return;
            
        if (uid in this.pin_inst)
            delete this.pin_inst[uid];
        cr.arrayFindRemove(this.sprites, uid)
	};
    
	instanceProto.remove_insts = function (insts)
	{
        var i, cnt=insts.length;
        for (i=0; i<cnt; i++)
        {
            this._remove_uid(insts[i].uid);
        }
	}; 
    
    instanceProto._uid2inst = function(uid, objtype)
    {
	    if (uid == null)
		    return null;
        var inst = this.runtime.getObjectByUID(uid);
        if (inst == null)
        {
            this._remove_uid(uid);
			return null;
        }

        if ((objtype == null) || (inst.type == objtype))
            return inst;        
        else if (objtype.is_family)
        {
            var families = inst.type.families;
            var cnt=families.length, i;
            for (i=0; i<cnt; i++)
            {
                if (objtype == families[i])
                    return inst;
            }
        }
        // objtype mismatch
        return null;
    };
    
    instanceProto._pick_insts = function (objtype)
	{
        var sol = objtype.getCurrentSol();  
        sol.select_all = false;   
        sol.instances.length = 0;   // clear contents
        var uid, inst;
        for (uid in this._uids)
        {
            inst = this._uid2inst(uid, objtype)
            if (inst != null)
                sol.instances.push(inst);
        }
        return  (sol.instances.length >0);       
	};
 	     
	instanceProto._pick_all_insts = function ()
	{
	    var type_name, _container, uid, inst, objtype, sol;
        for (type_name in this.insts_group)
        {
            _container = this.insts_group[type_name];
            objtype = null;
            for (uid in _container)
            {
                inst = _container[uid];
                if (objtype == null)
                {
                    objtype = inst.type;
                    sol = objtype.getCurrentSol();
                    sol.select_all = false;
                    sol.instances.length = 0;
                }
                sol.instances.push(inst);
            }
        }
	}; 	
	
	instanceProto._destory_all_insts = function ()
	{
        var uid, inst;
        for (uid in this._uids)
        {
            inst = this.runtime.getObjectByUID(uid);
            if (inst != null)
                this.runtime.DestroyInstance(inst);       
        }     	
	};	
	
	instanceProto._get_layouter_handler = function ()
	{
        var behavior_insts = this.behavior_insts;
        var cnt=behavior_insts.length;
        var i,behavior_inst;
        for (i=0;i<cnt;i++)
        {
            behavior_inst = behavior_insts[i];
            if (behavior_inst.check_name == "LAYOUTER")
                this.handlers.push(behavior_inst);
        }
	};
    
	instanceProto._do_layout = function (insts, is_add_mode)
	{
	    if (this.sprites.length == 0)
	        return;
	        
        var j, handler_cnt = this.handlers.length, cb;
        for (j=0;j<handler_cnt;j++)
        {
            cb = (is_add_mode)? this.handlers[j].on_add_insts:
                                this.handlers[j].on_remove_insts;
            if (cb != null)
                cb.call(this.handlers[j], insts);            
        }           
	}; 
    
	instanceProto.layout_inst = function (uid, params)
	{
        var inst = this.runtime.getObjectByUID(uid);
	    params.inst = inst;
	    this.layout_inst_params = params;
	    this.has_event_call = false;
	    this.runtime.trigger(cr.plugins_.Rex_Layouter.prototype.cnds.OnLayoutInst, this);
	    if (!this.has_event_call)
	    {
	        if (params.x != null)
	            inst.x = params.x;
	        if (params.y != null)
	            inst.y = params.y;    
	        if (params.angle != null)
	            inst.angle = params.angle;
	        if (params.width != null)
	            inst.width = params.width; 
	        if (params.height != null)
	            inst.height = params.height; 
	        if (params.opacity != null)
	            inst.opacity = params.opacity; 
	        if (params.visible != null)
	            inst.visible = params.visible; 
	        inst.set_bbox_changed();	            	            	                
	    }
	    this.pin_inst(inst);
	};
	
	instanceProto.get_centerX = function (inst)
	{
        if (inst == null)
            inst = this;
	    inst.update_bbox();
	    var bbox = inst.bbox;
	    return (bbox.right+bbox.left)/2;            
	};	
		
	instanceProto.get_centerY = function (inst)
	{
        if (inst == null)
            inst = this;    
	    inst.update_bbox();
	    var bbox = inst.bbox;
	    return (bbox.top+bbox.bottom)/2;            
	};
    
	instanceProto.saveToJSON = function ()
	{
		return { "uids": this._uids, 
                 "s": this.sprites,
                 "ps": this.pin_status,
                };
	};
	
	instanceProto.loadFromJSON = function (o)
	{            
        this._uids = o["uids"];	
        this.sprites = o["s"];
        this.pin_status = o["ps"];
	};        
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.OnLayoutInst = function ()
	{
	    this.has_event_call = true;
		return true;
	}; 
	
	Cnds.prototype.PickInsts = function (objtype)
	{
		if (!objtype)
			return; 	
		return this._pick_insts(objtype);
	};  

	Cnds.prototype.PickLayouter =function (objtype)
	{
		if (!objtype)
			return; 
            
    	var insts = objtype.getCurrentSol().getObjects();        
    	var cnt = insts.length;
        if (cnt == 0)
            return false;
        var container_type = this.runtime.getCurrentCondition().type;  
        var container_sol = container_type.getCurrentSol();
        container_sol.select_all = false;
        container_sol.instances.length = 0;                
        var i, container_uid, container_inst;
        var uids = {};
        for (i=0; i<cnt; i++)
        {
            container_uid = insts[i].extra.rex_container_uid;
            if (container_uid in uids)
                continue;
            container_inst = this.runtime.getObjectByUID(container_uid);
            if (container_inst == null)
                continue;            
            container_sol.instances.push(container_inst);
            uids[container_uid] = true;
        }
        var current_event = this.runtime.getCurrentEventStack().current_event;
        this.runtime.pushCopySol(current_event.solModifiers);
        current_event.retrigger();
        this.runtime.popSol(current_event.solModifiers);
		return false;            
	}; 

	Cnds.prototype.PickAllInsts = function ()
	{
	    this._pick_all_insts();
	    return true;
	};
 
			
	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
		
	Acts.prototype.AddInsts = function (objtype)
	{
        var insts = objtype.getCurrentSol().getObjects();
        if (insts.length==0)
            return;
	    this.add_insts(insts);
	};
    
    Acts.prototype.PickInsts = function (objtype)
	{
	    this._pick_insts(objtype);
	}; 
	 
	Acts.prototype.PickAllInsts = function ()
	{
	    this._pick_all_insts();
	};	
	
	Acts.prototype.CreateInsts = function (obj_type,x,y,_layer)
	{
        this.create_insts(obj_type,x,y,_layer);
	};
	
	Acts.prototype.RemoveInsts = function (objtype)
	{
        var insts = objtype.getCurrentSol().getObjects();
        if (insts.length==0)
            return;
	    this.remove_insts(insts);
	};
	
	Acts.prototype.ForceLayout = function ()
	{	
        this._do_layout([], true);
	};    
    
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	pluginProto.exps = new Exps();
	
	Exps.prototype.InstUID = function (ret)
	{
		ret.set_int(this.layout_inst_params.inst.uid);
	};
	
	Exps.prototype.InstX = function (ret)
	{
	    var val=this.layout_inst_params.x;
	    if (val == null)
	        val = this.layout_inst_params.inst.x;
		ret.set_float(val);
	};
	
	Exps.prototype.InstY = function (ret)
	{
	    var val=this.layout_inst_params.y;
	    if (val == null)
	        val = this.layout_inst_params.inst.y;
		ret.set_float(val);
	};
	
	Exps.prototype.InstAngle = function (ret)
	{
	    var val = this.layout_inst_params.angle;
	    if (val == null)
	        val = this.layout_inst_params.inst.angle;
	    else
		    val = cr.to_degrees(val);
		ret.set_float(val);
	};
	
	Exps.prototype.InstWidth = function (ret)
	{
	    var val=this.layout_inst_params.width;
	    if (val == null)
	        val = this.layout_inst_params.inst.width;
		ret.set_float(val);
	};		
	
	Exps.prototype.InstHeight = function (ret)
	{
	    var val=this.layout_inst_params.height;
	    if (val == null)
	        val = this.layout_inst_params.inst.height;
		ret.set_float(val);
	};	

	Exps.prototype.InstOpacity = function (ret)
	{
	    var val=this.layout_inst_params.opacity;
	    if (val == null)
	        val = this.layout_inst_params.inst.opacity;
		ret.set_float(val);
	};	
	
	Exps.prototype.InstVisible = function (ret)
	{
	    var val=this.layout_inst_params.visible;
	    if (val == null)
	        val = this.layout_inst_params.inst.visible;
		ret.set_int(val);
	};		

	Exps.prototype.SpritesCnt = function (ret)
	{
		ret.set_int(this.sprites.length);
	};		
}());