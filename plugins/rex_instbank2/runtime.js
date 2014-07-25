// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_InstanceBank2 = function(runtime)
{
    this.runtime = runtime;
};

(function ()
{
    var pluginProto = cr.plugins_.Rex_InstanceBank2.prototype;
        
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
        this.bank = new cr.plugins_.Rex_InstanceBank2.InstBankKlass(this);    
        this.bank.ModePreserveCurrentInsts = false;
    };

    //////////////////////////////////////
    // Conditions
    function Cnds() {};
    pluginProto.cnds = new Cnds();
    
    //////////////////////////////////////
    // Actions
    function Acts() {};
    pluginProto.acts = new Acts();
    
    Acts.prototype.CleanBank = function ()
	{
        this.bank.CleanBank();
	};
    
    Acts.prototype.SaveInstances = function (objtype)
    {
        if (!objtype)
            return;  
        var sol = objtype.getCurrentSol();  
        var insts = sol.getObjects();        
        var i,cnt = insts.length;
        for (i=0; i<cnt; i++)
        {
            this.bank.SaveInstance(insts[i]);
        }
    };

    Acts.prototype.LoadInstances = function ()
    {  
        this.bank.LoadAllInstances();
    };

    Acts.prototype.StringToBank = function (JSON_string)
	{  
        this.bank.JSON2Bank(JSON_string);
	}; 

    //////////////////////////////////////
    // Expressions
    function Exps() {};
    pluginProto.exps = new Exps();
    
	Exps.prototype.BankToString = function (ret)
	{
        var json_string = this.bank.ToString();
		ret.set_string(json_string);
	}; 
  
}());

(function ()
{
    // global for all InstBankKlass
    var _SID2Objtype = {};  
    
    cr.plugins_.Rex_InstanceBank2.InstBankKlass = function(plugin)
    {
        this.plugin = plugin;     
        this.runtime =  plugin.runtime;
        this.bank = {};      // { uid:status }
        this.max_uid = null;
        this.min_uid = null;
        this.uid_mark_table = {};      
        this.objtype_mark_table = {};
        this.layer_mark_table = {};
        // modes
        this.ModePreserveCurrentInsts = false;        
    };
    var InstBankKlassProto = cr.plugins_.Rex_InstanceBank2.InstBankKlass.prototype;  

    InstBankKlassProto.CleanBank = function()
    {
        hash_clean(this.bank);
        this.max_uid = null;
        this.min_uid = null;        
    };  

    InstBankKlassProto.GetInstanceStatus = function(inst)
    {
        var status = this.runtime.saveInstanceToJSON(inst);
        status["sid"] = inst.type.sid;
        return status;
    }; 
    
    // make sure saving the related instances (for example, pin instance)
    InstBankKlassProto.SaveInstance = function(inst)
    {
        if (inst == null)
            return;
     
        if (typeof(inst) == "number")
            inst = this.runtime.getObjectByUID(inst);                    
         
        var status = this.GetInstanceStatus(inst);
        this.bank[inst.uid.toString()] = status;

        if (inst.type.is_contained)
        {       
            // has siblings
            var siblings = inst.siblings, sibling_inst;
            var siblings_uids = [];
            status["siblings_uids"] = siblings_uids;
            var i, cnt = siblings.length;
            for (i=0; i<cnt; i++)
            {
                sibling_inst = siblings[i];
                siblings_uids.push(sibling_inst.uid);
                this.bank[sibling_inst.uid.toString()] = this.GetInstanceStatus(sibling_inst);
            }
        }
    }; 
        
    InstBankKlassProto.ReassignObj2UIDMap = function (inst, new_uid)
    {
        if (inst.uid != new_uid)
        {
            // re-assign objectsByUid entry        
            var objectsByUid = this.runtime.objectsByUid;
            delete objectsByUid[inst.uid.toString()];                 
            objectsByUid[new_uid.toString()] = inst;
            inst.uid = new_uid;
        }
    };
    
    InstBankKlassProto.GetShellInstance = function(uid)
    {       
        // find inst with the same uid
        var inst = this.runtime.getObjectByUID(uid);
        if (inst != null) 
        {
            return inst;
        }
            
        if (!this.ModePreserveCurrentInsts)
        {
            // find at sol            
            var status = this.bank[uid];
            if (status == null)
                return;
              
            var sid = status["sid"];
            var objtype = this.SID2Type(sid);
            var insts = objtype.instances;
            var i, cnt=insts.length;            
            for (i=0; i<cnt; i++)
            {
                inst = insts[i];
                if (this.bank.hasOwnProperty(inst.uid.toString()))
                    continue;
                
                // find a unused instance
                uid = parseInt(uid,10);
                this.ReassignObj2UIDMap(inst, uid); 
                inst.uid = uid;    
                // mark this type, check latter to remove other unused instances
                this.objtype_mark_table[sid] = objtype;                    
                return inst;
            }
            // Cound not find any shell instance, remove mark
            if (this.objtype_mark_table.hasOwnProperty(sid))
                delete this.objtype_mark_table[sid];  
        }
                
        // create a shell instance with target uid                        
        return this.CreateShellInstance(uid, false);     
    };
    
    InstBankKlassProto.CreateShellInstance = function(uid, skip_siblings)
    {       
        var status = this.bank[uid];
        if (status == null)
            return;
                            
        var objtype = this.SID2Type(status["sid"]);
        // create a shell instance with target uid
        var layer = null;
        if (objtype.plugin.is_world)
        {
            layer = this.runtime.running_layout.getLayerBySid(status["w"]["l"]);						
            if (!layer)
                return;
        }        
        uid = parseInt(uid,10);
        var next_uid_save = this.runtime.next_uid;
        this.runtime.next_uid = uid;      
        var inst = this.runtime.createInstanceFromInit(objtype.default_instance, // initial_inst
                                                       layer,                    // layer
                                                       false,                    // is_startup_instance 
                                                       0,                        // sx
                                                       0,                        // sy
                                                       skip_siblings             // skip_siblings
                                                       );
        if (next_uid_save > uid)
            this.runtime.next_uid = next_uid_save;                                            
        return inst;
    };
        
    // step1: create instance. Call this step for each instance (uid)
    InstBankKlassProto.LoadInstance_step1 = function(inst, uid, skip_siblings)
    {
        var status = this.bank[uid];
        if (status == null)
            return;
        
        // the shell instance is null, create a shell instance 
        if (inst == null)
            inst = this.CreateShellInstance(uid, skip_siblings);        
                                       
        // filled the instance shell
        this.runtime.loadInstanceFromJSON(inst, status); 
        
        // create(filled) siblings
        if ((!skip_siblings) && (inst.type.is_contained))
        {          
            var siblings_uids = status["siblings_uids"];
            var i, cnt=siblings_uids.length;
            var siblings = inst.siblings;
            for (i=0; i<cnt; i++)
            {
                this.LoadInstance_step1(siblings[i], siblings_uids[i].toString(), true);
            }
        }               

        this.MaxUIDSet(uid);
        this.MinUIDSet(uid);
        // mark it for step2
        this.uid_mark_table[uid] = inst;        
        
        this.layer_mark_table[inst.layer.name] = inst.layer;
    };
    
    // step2: run afterLoad(), then reorder zindex of layer
    InstBankKlassProto.LoadInstance_step2 = function()
    {
        var uid, inst;
        var k, lenk, binst;
        for (uid in this.uid_mark_table)
        {
            inst = this.uid_mark_table[uid];
            if (inst.afterLoad)
                inst.afterLoad();

            if (inst.behavior_insts)
            {
                lenk = inst.behavior_insts.length;
                for (k=0; k<lenk; k++)
                {
                    binst = inst.behavior_insts[k];                            
                    if (binst.afterLoad)
                        binst.afterLoad();
                }
            }                          
        }
        
        var n, layer;        
        for (n in this.layer_mark_table)
        {
            layer = this.layer_mark_table[n];
            layer.instances.sort(sortInstanceByZIndex);
            layer.zindices_stale = true;
        }
        
        if (!this.ModePreserveCurrentInsts)
        {
            var sid, objtype, insts;
            var i, cnt;
            for (sid in this.objtype_mark_table)
            {
                objtype = this.objtype_mark_table[sid];
                insts = objtype.instances;
                cnt = insts.length;
                for(i=0; i<cnt; i++)
                {
                    inst = insts[i];
                    if (this.uid_mark_table.hasOwnProperty(inst.uid.toString()))
                        continue;
                    
                    // kick unused instance
                    this.runtime.DestroyInstance(inst);
                }
            }
        }
        
        // clean mark tables
        for (uid in this.uid_mark_table)
            delete this.uid_mark_table[uid];
        for (sid in this.objtype_mark_table)
            delete this.objtype_mark_table[sid];
        for (n in this.layer_mark_table)
            delete this.layer_mark_table[n];
    }; 
    
    InstBankKlassProto.LoadAllInstances = function()
    {
        var i;
        var uid, inst;
        for (uid in this.bank)
        {
            // uid is a string
            if (this.uid_mark_table.hasOwnProperty(uid))  // had been created
                continue;
                          
            inst = this.GetShellInstance(uid); 
            this.LoadInstance_step1(inst, uid, false);
        }
        
        this.LoadInstance_step2();
    }; 
    
    InstBankKlassProto.SID2Type = function(sid)
    {
        if (_SID2Objtype[sid] == null)
        {
            _SID2Objtype[sid] = this.runtime.getObjectTypeBySid(sid);
        }
        return _SID2Objtype[sid];
    };

    InstBankKlassProto.MaxUIDSet = function(uid)
    {
        if ((this.max_uid == null) || (this.max_uid < uid))
            this.max_uid = uid;
    };    
    
    InstBankKlassProto.MinUIDSet = function(uid)
    {
        if ((this.min_uid == null) || (this.min_uid > uid))
            this.min_uid = uid;
    };      
    
    InstBankKlassProto.ToString = function()
	{
        return JSON.stringify(this.bank);
	};
    
    InstBankKlassProto.JSON2Bank = function(JSON_string)
	{
	    if (JSON_string == "")
	        return;
        this.bank = JSON.parse(JSON_string);
	};
    
	function sortInstanceByZIndex(a, b)
	{
		return a.zindex - b.zindex;
	};    
    
    var hash_copy = function (obj_in, obj_src)
    {
        var obj_out = (obj_src == null)? {}:obj_src;
        var key;
        for (key in obj_in)
            obj_out[key] = obj_in[key];
            
        return obj_out;
    };
    var hash_clean = function (obj_in)
    {
        var key;
        for (key in obj_in)
            delete obj_in[key];
        return obj_in;
    };     
}());    