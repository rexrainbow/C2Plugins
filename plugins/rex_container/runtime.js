// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Container = function(runtime)
{
	this.runtime = runtime;
	this.tag2container = {};
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
        this.uid2container = {};  // pick container from instance's uid   
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
        this.insts_group = {};
		this.myDestroyCallback = (function (self) {
											return function(inst) {
												self.onInstanceDestroyed(inst);
											};
										})(this); 
        this.runtime.addDestroyCallback(this.myDestroyCallback); 
        this.pin_mode = this.properties[0];
		this.tag = this.properties[2];
		cr.plugins_.Rex_Container.tag2container[this.tag] = this;
        if (this.pin_mode != 0)
        {
            this.pin_status = {};
            this.runtime.tick2Me(this);            
        }
	};
	
	instanceProto.onInstanceDestroyed = function (inst)
	{
        var uid=inst.uid;
        if (!(uid in this.type.uid2container))
            return;

        var type_name = inst.type.name;
        delete this.insts_group[type_name][uid];                
        delete this.type.uid2container[uid];
        if ((this.pin_mode != 0) && (this.pin_status[uid] != null))
            delete this.pin_status[uid];
	};    
    
	instanceProto.onDestroy = function ()
	{		
	    delete cr.plugins_.Rex_Container.tag2container[this.tag];
        var uid2container = this.type.uid2container;
        var type_name,_container,uid,inst;
        for (type_name in this.insts_group)
        {
            _container = this.insts_group[type_name];
            for(uid in _container)
            {            
                delete uid2container[uid];
            }
        }  
		this.runtime.removeDestroyCallback(this.myDestroyCallback);        	
	};
    
	instanceProto.tick2 = function ()
	{
	    if (this.pin_mode == 0)
	        return;
	        				
	    var uid,status,pin_inst,a,new_x,new_y,new_angle;
	    for (uid in this.pin_status)
	    {
	        status = this.pin_status[uid];
            pin_inst = status.pin_inst;	 
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
        var type_name=insts[0].type.name;
        if (this.insts_group[type_name]==null)
            this.insts_group[type_name] = {};
        var _container = this.insts_group[type_name];
        var inst,uid,i,cnt=insts.length;
        var uid2container = this.type.uid2container;
		var is_world = insts[0].type.plugin.is_world;
        for (i=0;i<cnt;i++)
        {
            inst = insts[i];
            uid = inst.uid;
            uid2container[uid] = this;
            _container[uid] = inst;
            if (is_world && (this.pin_mode != 0))
                this.pin_inst(inst);
        }
	};

	instanceProto.pin_inst = function (inst)
	{
        this.pin_status[inst.uid] = {pin_inst:inst,
                                     delta_angle:cr.angleTo(this.x, this.y, inst.x, inst.y) - this.angle,
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
	    this.add_insts([inst]);
	    return inst;
	};    

	instanceProto.remove_insts = function (insts)
	{
        var type_name=insts[0].type.name;
        if (this.insts_group[type_name]==null)
            this.insts_group[type_name] = {};
        var _container = this.insts_group[type_name];
        var inst,uid,i,cnt=insts.length;
        var uid2container = this.type.uid2container;
        for (i=0;i<cnt;i++)
        {
            inst = insts[i];
            uid = inst.uid;
            if (uid in uid2container)
            {
                delete uid2container[uid];
                delete _container[uid];
            }
        }
	}; 
    
    instanceProto._pick_insts = function (objtype)
	{
        var type_name=objtype.name;
	    var _container = this.insts_group[type_name];	    
        var sol = objtype.getCurrentSol();  
        sol.select_all = true;   
        var insts = sol.getObjects();
        var insts_length = insts.length;
        var i, inst;
        sol.instances.length = 0;   // clear contents
        for (i=0; i < insts_length; i++)
        {
           inst = insts[i];
           if (inst.uid in _container)
               sol.instances.push(inst);
        }
        sol.select_all = false;    
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
        var uid2container = this.type.uid2container;
        var type_name,_container,uid,inst;
        for (type_name in this.insts_group)
        {
            _container = this.insts_group[type_name];
            for(uid in _container)
            {
                inst = _container[uid];   			
                delete _container[uid];                
                delete uid2container[uid];			      
                this.runtime.DestroyInstance(inst);
            }
        }         	
	};	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();

	Cnds.prototype.PickInsts = function (objtype)
	{
		return this._pick_insts(objtype);
		return true;
	};  

	Cnds.prototype.PickContainer =function (objtype)
	{
    	var insts = objtype.getCurrentSol().getObjects();        
    	var cnt = insts.length;
    	if (cnt == 0)
            return false;  
        
        var i,container,container_uid,uids={}; 
	    var runtime = this.runtime;
	    var container_type = runtime.getCurrentCondition().type;         
        var sol = container_type.getCurrentSol();
        sol.select_all = false;
        sol.instances.length = 0;              
        for (i=0;i<cnt;i++)
        {
            container = container_type.uid2container[insts[i].uid]; 
            container_uid = container.uid;
            if ((container!=null) && !(container_uid in uids))
            {
                sol.instances.push(container);
                uids[container_uid] = true;                
            }
        }    	
        var current_event = runtime.getCurrentEventStack().current_event;
        runtime.pushCopySol(current_event.solModifiers);
        current_event.retrigger();
        runtime.popSol(current_event.solModifiers);
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