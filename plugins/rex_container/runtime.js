// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Container = function(runtime)
{
	this.runtime = runtime;
};
cr.plugins_.Rex_Container.tag2container = {};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Container.prototype;
		
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
	    this.check_name = "CONTAINER";
        this._uids = {};
        this.pin_mode = this.properties[0];
		this.tag = this.properties[2];
		cr.plugins_.Rex_Container.tag2container[this.tag] = this;
        this.pin_status = {};
        if (this.pin_mode != 0)
        {
            this.runtime.tick2Me(this);            
        }
	};
	
	instanceProto.onDestroy = function ()
	{		
	    delete cr.plugins_.Rex_Container.tag2container[this.tag];
        this._destory_all_insts();
	};
    
	instanceProto.tick2 = function ()
	{
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
			    a = this.angle + status.delta_angle;				
                new_x = this.x + (status.delta_dist*Math.cos(a));
                new_y = this.y + (status.delta_dist*Math.sin(a));
			}
            if ((this.pin_mode == 1) || (this.pin_mode == 3))
			{
			    new_angle = status.sub_start_angle + (this.angle - status.main_start_angle);
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
        for (i=0; i<cnt; i++)
        {
            inst = insts[i];
            if (this._uids[inst.uid])  // is inside container
                continue;
            inst.extra.rex_container_uid = this.uid;
            this._uids[inst.uid] = true;
            if (is_world && (this.pin_mode != 0))
                this.pin_inst(inst);
        }
	};

	instanceProto.pin_inst = function (inst)
	{
        this.pin_status[inst.uid] = {delta_angle:cr.angleTo(this.x, this.y, inst.x, inst.y) - this.angle,
                                     delta_dist:cr.distanceTo(this.x, this.y, inst.x, inst.y),
									 main_start_angle:this.angle,
									 sub_start_angle:inst.angle,
                                    };
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
        if (uid in this.pin_inst)
            delete this.pin_inst[uid];
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
 	
    var name2type = {};  // private global object
	instanceProto._pick_all_insts = function ()
	{	    
	    var uid, inst, objtype, sol;
	    var uids = this._uids;
	    hash_clean(name2type);
	    var has_inst = false;    
	    for (uid in uids)
	    {
	        inst = this._uid2inst(uid);
            if (inst == null)
                continue;
	        objtype = inst.type; 
	        sol = objtype.getCurrentSol();
	        if (!(objtype.name in name2type))
	        {
	            sol.select_all = false;
	            sol.instances.length = 0;
	            name2type[objtype.name] = objtype;
	        }
	        sol.instances.push(inst);  
	        has_inst = true;
	    }
	    var name;
	    for (name in name2type)
	        name2type[name].applySolToContainer();
	    hash_clean(name2type);
	    return has_inst;
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
		
	var hash_clean = function (obj)
	{
	    var k;
	    for (k in obj)
	        delete obj[k];
	};  
    
	instanceProto.saveToJSON = function ()
	{
		return { "uids": this._uids, 
                 "ps": this.pin_status,
                };
	};
	
	instanceProto.loadFromJSON = function (o)
	{            
        this._uids = o["uids"];	
        this.pin_status = o["ps"];
	};    
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.PickInsts = function (objtype)
	{
		return this._pick_insts(objtype);
	};  

    Cnds.prototype.PickContainer =function (objtype)
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
	    return this._pick_all_insts();
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
 	
	Acts.prototype.ContainerDestroy = function ()
	{
	    this._destory_all_insts();
		this.runtime.DestroyInstance(this);
	};   
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	pluginProto.exps = new Exps();
	
	Exps.prototype.Tag = function (ret)
	{
		ret.set_string(this.tag);
	};
}());