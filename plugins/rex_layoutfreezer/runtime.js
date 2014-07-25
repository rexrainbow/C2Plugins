// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_LayoutFreezer = function(runtime)
{
    this.runtime = runtime;
};

(function ()
{
    var pluginProto = cr.plugins_.Rex_LayoutFreezer.prototype;
        
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
        /* bank =
           {"types":{sid: { "instances":[inst, inst...] 
                         }
                    },
            "running_layout": running_layout.sid
           }  
        */
    };

    instanceProto.IsNoSave = function (type)
	{
        return (type.global || 
                type.is_family || 
                this.runtime.typeHasNoSaveBehavior(type) ||
                type.plugin.singleglobal);
	};    
    
    instanceProto.SaveLayout = function ()
    {
        this.runtime.ClearDeathRow();
        
        // save layout        
        var bank = {"running_layout": {"sid": this.runtime.running_layout.sid,
                                       "layout": this.runtime.running_layout.saveToJSON()
                                      },
                    "types":{}
                    };

        var max_uid = null;
        var min_uid = null;                    

        // save all instances
        var saved_types = bank["types"];
        var types=this.runtime.types_by_index;
        var i, type_cnt=types.length, type, table;
        var j, inst, inst_cnt;
        for (i=0; i<type_cnt; i++)
        {
            type = types[i];
            if (this.IsNoSave(type))
				continue;
			
			table = {
				"instances": []
			};				

            inst_cnt = type.instances.length;
            for (j=0; j<inst_cnt; j++)
			{
			    inst = type.instances[j];
			    max_uid = (max_uid == null)? inst.uid : Math.max(max_uid, inst.uid); 
			    min_uid = (min_uid == null)? inst.uid : Math.min(min_uid, inst.uid); 
				table["instances"].push(this.runtime.saveInstanceToJSON(inst));
			}
			
			saved_types[type.sid.toString()] = table;				
        }
        
        bank["max_uid"] = max_uid;
        bank["min_uid"] = min_uid;     
        return bank;
    };

    instanceProto.LoadLayout = function (bank, goto_saved_layout)
    {          
        this.runtime.ClearDeathRow();
        

        // goto layout
		var layout_sid = (goto_saved_layout)? bank["running_layout"]["sid"]:
		                                      this.runtime.running_layout.sid;
		                                      
		var changeToLayout = this.runtime.getLayoutBySid(layout_sid);		
		if (changeToLayout)
			this.runtime.doChangeLayout(changeToLayout);
		else
			return;		// layout that was saved on has gone missing (deleted?)
                
        // then restore all instances
        
        // reset next uid
        //log("Start: " + this.runtime.next_uid);
        var next_uid_save = this.runtime.next_uid;
        var min_uid = bank["min_uid"];        
        if (min_uid != null)
            this.runtime.next_uid = min_uid;
        //log("Reset: " + this.runtime.next_uid);
            
        var saved_types = bank["types"];
        var types=this.runtime.types_by_index;
        var i, type_cnt=types.length, type, table;
        var j, insts, inst_cnt;
        var sid, load_insts, existing_insts; 
        var layer, inst;        
        for (i=0; i<type_cnt; i++)
        {
            type = types[i];
            // not saveable
            if (this.IsNoSave(type))
				continue;
            
            sid = type.sid.toString();            
            // not in bank , destroy all instances of this type
            if (!saved_types.hasOwnProperty(sid))
            {
                existing_insts = type.instances;
                inst_cnt = existing_insts.length;
                for (j=0; j<inst_cnt; j++)
                {
                    this.DestroyInstance(existing_insts[j]);	
                }
                continue;
            }
            
            load_insts = saved_types[sid]["instances"];
            // Recycle any existing objects if possible
            existing_insts = type.instances;
            inst_cnt = cr.min(existing_insts.length, load_insts.length);
			for (j=0; j<inst_cnt; j++)
			{
				// Can load directly in to existing instance
				this.runtime.loadInstanceFromJSON(existing_insts[j], load_insts[j]);
			} 
			    
			// Destroy the rest of the existing instances if there are too many
			inst_cnt = existing_insts.length;
			for (j=load_insts.length; j<inst_cnt; j++)
				this.runtime.DestroyInstance(existing_insts[j]);	
				
			// Create additional instances if there are not enough existing instances
			inst_cnt = load_insts.length
			for (j=existing_insts.length; j<inst_cnt; j++)
			{
				layer = null;
				
				if (type.plugin.is_world)
				{
					layer = this.runtime.running_layout.getLayerBySid(load_insts[j]["w"]["l"]);
					
					// layer's gone missing - just skip creating this instance
					if (!layer)
						continue;
				}
				
				// create an instance then load the state in to it
				// skip creating siblings; they will have been saved as well, we'll link them up later
				inst = this.runtime.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
				//log("Create: " + this.runtime.next_uid);
				this.runtime.loadInstanceFromJSON(inst, load_insts[j]);
			}
			
			type.stale_iids = true;	
        }
        
        this.runtime.ClearDeathRow();
        
		// Rebuild the objectsByUid map, since some objects will have loaded a different UID to the one
		// they were created with
		this.runtime.refreshUidMap();
        
        this.runtime.running_layout.loadFromJSON(bank["running_layout"]["layout"]);
        
        // reset next uid
        var max_uid = bank["max_uid"];
        if (max_uid != null)
            this.runtime.next_uid = Math.max(next_uid_save, max_uid+1);        
        
		// Loop again and call afterLoad() on everything now that UIDs and all states are available
		// Also link together containers now that all objects are created
        var iid, k, sibling_cnt, t, b_cnt, binst;
        for (i=0; i<type_cnt; i++)
        {
            type = types[i];
            // not saveable
            if (this.IsNoSave(type))
				continue;
            
            sid = type.sid.toString();            
            // not in bank , destroy all instances of this type
            if (!saved_types.hasOwnProperty(sid))
            {
                continue;
            }
            
            existing_insts = type.instances;
            inst_cnt = existing_insts.length;
            for (j=0; j<inst_cnt; j++)
            {
                inst = existing_insts[j];
				
				// Link container
				if (type.is_contained)
				{
					iid = inst.get_iid();
					inst.siblings.length = 0;
					
					sibling_cnt = type.container.length;
					for (k=0; k<sibling_cnt; k++)
					{
						t = type.container[k];
						
						if (type === t)
							continue;
							
						assert2(t.instances.length > iid, "Missing sibling instance when linking containers after load");
						inst.siblings.push(t.instances[iid]);
					}
				}
				
				if (inst.afterLoad)
					inst.afterLoad();
				
				if (inst.behavior_insts)
				{
                    b_cnt = inst.behavior_insts.length;
					for (k=0; k<b_cnt; k++)
					{
						binst = inst.behavior_insts[k];
						
						if (binst.afterLoad)
							binst.afterLoad();
					}
				}
            }
        }
        
		this.runtime.redraw = true;	           
        

        //log("End: " + this.runtime.next_uid);             
    };
    
	function sortInstanceByZIndex(a, b)
	{
		return a.zindex - b.zindex;
	};    

    var hash_clean = function (obj_in)
    {
        var key;
        for (key in obj_in)
            delete obj_in[key];
        return obj_in;
    }; 
    
    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();
    
    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();

    Acts.prototype.LoadLayout = function (JSON_string, layout_target)
    {  
	    if (JSON_string == "")
	        return;            
        var bank = JSON.parse(JSON_string);     
        var goto_saved_layout = (layout_target == 0);
        this.LoadLayout(bank, goto_saved_layout);
    };


    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();
    
	Exps.prototype.Layout2String = function (ret)
	{
		ret.set_string(JSON.stringify(this.SaveLayout()));
	}; 
  
}());